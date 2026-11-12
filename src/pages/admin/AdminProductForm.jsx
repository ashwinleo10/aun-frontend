import React, { useEffect, useRef, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  ArrowLeft,
  X,
  Save,
  Upload,
} from "lucide-react";

import {
  createProduct,
  getAdminProductById,
  updateProduct,
} from "../../services/adminProductService";

import { getAdminCategories } from "../../services/adminCategoryService";

import "../../assets/admin.css";
import "../../assets/admin-product-form.css";

const initialForm = {
  productName: "",
  description: "",
  price: "",
  discountPrice: "",
  categoryId: "",
  stockQuantity: "",
};

const availableSizes = [
  "S",
  "M",
  "L",
  "XL",
  "XXL",
];

const availableColors = [
  "Black",
  "White",
  "Grey",
  "Navy Blue",
  "Beige",
  "Brown",
];

const MAX_IMAGES = 5;

export default function AdminProductForm() {
  const navigate = useNavigate();
  const { productId } = useParams();

  const isEditMode = Boolean(productId);

  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState(initialForm);

  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);

  const [imageUrls, setImageUrls] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [categories, setCategories] = useState([]);

  const [loadingCategories, setLoadingCategories] =
    useState(true);

  const [loadingProduct, setLoadingProduct] =
    useState(isEditMode);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /*
   * Load categories.
   */
  useEffect(() => {
    loadCategories();
  }, []);

  /*
   * Load product when editing.
   */
  useEffect(() => {
    if (isEditMode) {
      loadProduct();
    }
  }, [productId, isEditMode]);

  async function loadCategories() {
    try {
      setLoadingCategories(true);
      setError("");

      const data = await getAdminCategories();

      const activeCategories = data.filter(
        (category) => category.active === true
      );

      setCategories(activeCategories);
    } catch (err) {
      setError(
        err.message || "Unable to load categories."
      );
    } finally {
      setLoadingCategories(false);
    }
  }

  async function loadProduct() {
    try {
      setLoadingProduct(true);
      setError("");

      const product = await getAdminProductById(productId);

      setFormData({
        productName: product.productName || "",
        description: product.description || "",
        price:
          product.price !== null &&
          product.price !== undefined
            ? String(product.price)
            : "",
        discountPrice:
          product.discountPrice !== null &&
          product.discountPrice !== undefined
            ? String(product.discountPrice)
            : "",
        categoryId:
          product.categoryId !== null &&
          product.categoryId !== undefined
            ? String(product.categoryId)
            : "",
        stockQuantity:
          product.stockQuantity !== null &&
          product.stockQuantity !== undefined
            ? String(product.stockQuantity)
            : "",
      });

      setSizes(
        Array.isArray(product.sizes)
          ? product.sizes
          : []
      );

      setColors(
        Array.isArray(product.colors)
          ? product.colors
          : []
      );

      setImageUrls(
        Array.isArray(product.imageUrls)
          ? product.imageUrls
          : []
      );
    } catch (err) {
      setError(
        err.message || "Unable to load product."
      );
    } finally {
      setLoadingProduct(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function toggleSize(size) {
    setSizes((previous) =>
      previous.includes(size)
        ? previous.filter(
            (item) => item !== size
          )
        : [...previous, size]
    );
  }

  function toggleColor(color) {
    setColors((previous) =>
      previous.includes(color)
        ? previous.filter(
            (item) => item !== color
          )
        : [...previous, color]
    );
  }

  async function uploadImageToCloudinary(file) {
    const cloudName =
      import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

    const uploadPreset =
      import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error(
        "Cloudinary configuration is missing."
      );
    }

    const uploadUrl =
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    const uploadFormData = new FormData();

    uploadFormData.append("file", file);
    uploadFormData.append(
      "upload_preset",
      uploadPreset
    );

    const response = await fetch(
      uploadUrl,
      {
        method: "POST",
        body: uploadFormData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.error?.message ||
          "Image upload failed."
      );
    }

    return data.secure_url;
  }

  async function handleImageUpload(event) {
    const selectedFiles = Array.from(
      event.target.files || []
    );

    if (selectedFiles.length === 0) {
      return;
    }

    setError("");
    setSuccess("");

    const remainingSlots =
      MAX_IMAGES - imageUrls.length;

    if (remainingSlots <= 0) {
      setError(
        `You can upload a maximum of ${MAX_IMAGES} images.`
      );

      event.target.value = "";
      return;
    }

    const filesToUpload =
      selectedFiles.slice(
        0,
        remainingSlots
      );

    if (
      selectedFiles.length >
      remainingSlots
    ) {
      setError(
        `Only ${remainingSlots} more image${
          remainingSlots === 1
            ? ""
            : "s"
        } can be uploaded.`
      );
    }

    try {
      setUploadingImages(true);

      const uploadedUrls = [];

      for (
        const file of filesToUpload
      ) {
        if (
          !file.type.startsWith(
            "image/"
          )
        ) {
          throw new Error(
            `${file.name} is not a valid image.`
          );
        }

        if (
          file.size >
          10 * 1024 * 1024
        ) {
          throw new Error(
            `${file.name} is larger than the 10MB limit.`
          );
        }

        const cloudinaryUrl =
          await uploadImageToCloudinary(
            file
          );

        uploadedUrls.push(
          cloudinaryUrl
        );
      }

      setImageUrls(
        (previous) => [
          ...previous,
          ...uploadedUrls,
        ]
      );
    } catch (err) {
      setError(
        err.message ||
          "Unable to upload image."
      );
    } finally {
      setUploadingImages(false);

      event.target.value = "";
    }
  }

  function removeImage(index) {
    setImageUrls(
      (previous) =>
        previous.filter(
          (_, imageIndex) =>
            imageIndex !== index
        )
    );
  }

  function openFilePicker() {
    if (
      imageUrls.length >=
      MAX_IMAGES
    ) {
      setError(
        `You can upload a maximum of ${MAX_IMAGES} images.`
      );

      return;
    }

    fileInputRef.current?.click();
  }

  function validateForm() {
    if (
      !formData.productName.trim()
    ) {
      return "Product name is required.";
    }

    if (
      !formData.description.trim()
    ) {
      return "Product description is required.";
    }

    if (!formData.categoryId) {
      return "Please select a category.";
    }

    const price =
      Number(formData.price);

    const discountPrice =
      formData.discountPrice === ""
        ? null
        : Number(
            formData.discountPrice
          );

    const stockQuantity =
      Number(
        formData.stockQuantity
      );

    if (
      !formData.price ||
      price <= 0
    ) {
      return "Price must be greater than zero.";
    }

    if (
      discountPrice !== null &&
      (discountPrice <= 0 ||
        discountPrice >
          price)
    ) {
      return (
        "Discount price must be greater than zero and cannot exceed the original price."
      );
    }

    if (
      formData.stockQuantity ===
        "" ||
      stockQuantity < 0
    ) {
      return (
        "Stock quantity cannot be negative."
      );
    }

    if (sizes.length === 0) {
      return (
        "Please select at least one size."
      );
    }

    if (colors.length === 0) {
      return (
        "Please select at least one color."
      );
    }

    if (imageUrls.length === 0) {
      return (
        "Please upload at least one product image."
      );
    }

    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError =
      validateForm();

    if (validationError) {
      setError(
        validationError
      );

      return;
    }

    if (uploadingImages) {
      setError(
        "Please wait until image uploads are completed."
      );

      return;
    }

    const productData = {
      productName:
        formData.productName.trim(),

      description:
        formData.description.trim(),

      price:
        Number(formData.price),

      discountPrice:
        formData.discountPrice === ""
          ? null
          : Number(
              formData.discountPrice
            ),

      categoryId:
        Number(
          formData.categoryId
        ),

      sizes,

      colors,

      imageUrls,

      stockQuantity:
        Number(
          formData.stockQuantity
        ),
    };

    try {
      setSaving(true);

      if (isEditMode) {
        await updateProduct(
          productId,
          productData
        );

        setSuccess(
          "Product updated successfully."
        );
      } else {
        await createProduct(
          productData
        );

        setSuccess(
          "Product added successfully."
        );
      }

      setTimeout(() => {
        navigate(
          "/admin/products"
        );
      }, 800);
    } catch (err) {
      setError(
        err.message ||
          (
            isEditMode
              ? "Unable to update product."
              : "Unable to add product."
          )
      );
    } finally {
      setSaving(false);
    }
  }

  /*
   * Loading state while editing.
   */
  if (loadingProduct) {
    return (
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div className="admin-brand-area">
            <Link
              to="/admin"
              className="admin-brand"
            >
              aún<span>.</span>
            </Link>

            <p className="admin-brand-label">
              ADMIN PANEL
            </p>
          </div>
        </aside>

        <main className="admin-main">
          <div className="admin-product-form-loading">
            <div className="admin-loading-spinner" />

            <p>
              Loading product...
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-layout">

      {/* SIDEBAR */}

      <aside className="admin-sidebar">

        <div className="admin-brand-area">

          <Link
            to="/admin"
            className="admin-brand"
          >
            aún<span>.</span>
          </Link>

          <p className="admin-brand-label">
            ADMIN PANEL
          </p>

        </div>

        <nav className="admin-navigation">

          <Link
            to="/admin"
            className="admin-nav-link"
          >
            Dashboard
          </Link>

          <Link
            to="/admin/categories"
            className="admin-nav-link"
          >
            Categories
          </Link>

          <Link
            to="/admin/products"
            className="admin-nav-link admin-nav-link-active"
          >
            Products
          </Link>

          <Link
            to="/admin/orders"
            className="admin-nav-link"
          >
            Orders
          </Link>

          <Link
            to="/admin/customers"
            className="admin-nav-link"
          >
            Customers
          </Link>

        </nav>

        <div className="admin-sidebar-bottom">

          <Link
            to="/home"
            className="admin-nav-link admin-store-link"
          >
            View Store
          </Link>

          <button
            type="button"
            className="admin-nav-link admin-logout-button"
            onClick={() => {
              sessionStorage.removeItem(
                "username"
              );

              sessionStorage.removeItem(
                "role"
              );

              sessionStorage.removeItem(
                "email"
              );

              navigate(
                "/login"
              );
            }}
          >
            Logout
          </button>

        </div>

      </aside>

      {/* MAIN */}

      <main className="admin-main">

        <div className="admin-topbar">

          <div>

            <p className="admin-topbar-label">
              AÚN / ADMIN
            </p>

            <h1>
              {isEditMode
                ? "Edit Product"
                : "Add Product"}
            </h1>

          </div>

          <div className="admin-user">

            <div className="admin-user-avatar">
              {(sessionStorage.getItem(
                "username"
              ) || "A")
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="admin-user-info">

              <span className="admin-user-name">
                {sessionStorage.getItem(
                  "username"
                ) ||
                  "Administrator"}
              </span>

              <span className="admin-user-role">
                Administrator
              </span>

            </div>

          </div>

        </div>

        <section className="admin-product-form-page">

          <Link
            to="/admin/products"
            className="admin-back-link"
          >
            <ArrowLeft size={15} />
            Back to Products
          </Link>

          <div className="admin-product-form-header">

            <div>

              <p className="admin-eyebrow">
                PRODUCT MANAGEMENT
              </p>

              <h2>
                {isEditMode
                  ? "Edit Product"
                  : "Add New Product"}
              </h2>

              <p>
                {isEditMode
                  ? "Update the product details in your AÚN catalogue."
                  : "Add a new product to your AÚN catalogue."}
              </p>

            </div>

          </div>

          {error && (
            <div className="admin-form-message admin-form-error">
              {error}
            </div>
          )}

          {success && (
            <div className="admin-form-message admin-form-success">
              {success}
            </div>
          )}

          <form
            className="admin-product-form"
            onSubmit={handleSubmit}
          >

            {/* PRODUCT INFORMATION */}

            <section className="admin-form-section">

              <div className="admin-form-section-heading">

                <span>01</span>

                <div>

                  <h3>
                    Product Information
                  </h3>

                  <p>
                    Basic information about the product.
                  </p>

                </div>

              </div>

              <div className="admin-form-grid">

                <div className="admin-form-field admin-form-full">

                  <label>
                    Product Name
                  </label>

                  <input
                    type="text"
                    name="productName"
                    value={
                      formData.productName
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Example: Premium Oversized T-Shirt"
                  />

                </div>

                <div className="admin-form-field admin-form-full">

                  <label>
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={
                      formData.description
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Describe the product..."
                    rows="5"
                  />

                </div>

              </div>

            </section>

            {/* CATEGORY */}

            <section className="admin-form-section">

              <div className="admin-form-section-heading">

                <span>02</span>

                <div>

                  <h3>
                    Category
                  </h3>

                  <p>
                    Select an active product category.
                  </p>

                </div>

              </div>

              <div className="admin-form-field">

                <label>
                  Product Category
                </label>

                <select
                  name="categoryId"
                  value={
                    formData.categoryId
                  }
                  onChange={
                    handleChange
                  }
                  disabled={
                    loadingCategories
                  }
                >

                  <option value="">
                    {loadingCategories
                      ? "Loading categories..."
                      : "Select category"}
                  </option>

                  {categories.map(
                    (category) => (
                      <option
                        key={
                          category.categoryId
                        }
                        value={
                          category.categoryId
                        }
                      >
                        {
                          category.categoryName
                        }
                      </option>
                    )
                  )}

                </select>

              </div>

            </section>

            {/* PRICING */}

            <section className="admin-form-section">

              <div className="admin-form-section-heading">

                <span>03</span>

                <div>

                  <h3>
                    Pricing
                  </h3>

                  <p>
                    Set the original and selling price.
                  </p>

                </div>

              </div>

              <div className="admin-form-grid">

                <div className="admin-form-field">

                  <label>
                    Original Price
                  </label>

                  <div className="admin-input-prefix">

                    <span>
                      ₹
                    </span>

                    <input
                      type="number"
                      name="price"
                      min="0"
                      step="0.01"
                      value={
                        formData.price
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="1599"
                    />

                  </div>

                </div>

                <div className="admin-form-field">

                  <label>
                    Discount Price
                    <span className="optional">
                      Optional
                    </span>
                  </label>

                  <div className="admin-input-prefix">

                    <span>
                      ₹
                    </span>

                    <input
                      type="number"
                      name="discountPrice"
                      min="0"
                      step="0.01"
                      value={
                        formData.discountPrice
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="1299"
                    />

                  </div>

                </div>

              </div>

            </section>

            {/* INVENTORY */}

            <section className="admin-form-section">

              <div className="admin-form-section-heading">

                <span>
                  04
                </span>

                <div>

                  <h3>
                    Inventory
                  </h3>

                  <p>
                    Set the available stock quantity.
                  </p>

                </div>

              </div>

              <div className="admin-form-field">

                <label>
                  Stock Quantity
                </label>

                <input
                  type="number"
                  name="stockQuantity"
                  min="0"
                  step="1"
                  value={
                    formData.stockQuantity
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="50"
                />

              </div>

            </section>

            {/* SIZES */}

            <section className="admin-form-section">

              <div className="admin-form-section-heading">

                <span>
                  05
                </span>

                <div>

                  <h3>
                    Sizes
                  </h3>

                  <p>
                    Select all available sizes.
                  </p>

                </div>

              </div>

              <div className="admin-choice-group">

                {availableSizes.map(
                  (size) => (
                    <button
                      type="button"
                      key={size}
                      className={`admin-choice ${
                        sizes.includes(
                          size
                        )
                          ? "admin-choice-selected"
                          : ""
                      }`}
                      onClick={() =>
                        toggleSize(
                          size
                        )
                      }
                    >
                      {size}
                    </button>
                  )
                )}

              </div>

            </section>

            {/* COLORS */}

            <section className="admin-form-section">

              <div className="admin-form-section-heading">

                <span>
                  06
                </span>

                <div>

                  <h3>
                    Colors
                  </h3>

                  <p>
                    Select the available product colors.
                  </p>

                </div>

              </div>

              <div className="admin-choice-group">

                {availableColors.map(
                  (color) => (
                    <button
                      type="button"
                      key={color}
                      className={`admin-choice ${
                        colors.includes(
                          color
                        )
                          ? "admin-choice-selected"
                          : ""
                      }`}
                      onClick={() =>
                        toggleColor(
                          color
                        )
                      }
                    >
                      {color}
                    </button>
                  )
                )}

              </div>

            </section>

            {/* PRODUCT IMAGES */}

            <section className="admin-form-section">

              <div className="admin-form-section-heading">

                <span>
                  07
                </span>

                <div>

                  <h3>
                    Product Images
                  </h3>

                  <p>
                    Upload up to 5 images for the product gallery.
                  </p>

                </div>

              </div>

              <input
                ref={
                  fileInputRef
                }
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                multiple
                onChange={
                  handleImageUpload
                }
                style={{
                  display:
                    "none",
                }}
              />

              {imageUrls.length <
                MAX_IMAGES && (
                <button
                  type="button"
                  className="admin-image-upload-box"
                  onClick={
                    openFilePicker
                  }
                  disabled={
                    uploadingImages
                  }
                >

                  <Upload
                    size={24}
                  />

                  <strong>
                    {uploadingImages
                      ? "Uploading images..."
                      : "Upload Product Images"}
                  </strong>

                  <span>
                    JPG, PNG or WEBP · Maximum 10MB each
                  </span>

                </button>
              )}

              {imageUrls.length >
                0 && (
                <div className="admin-image-preview-grid">

                  {imageUrls.map(
                    (url, index) => (
                      <div
                        className="admin-image-preview"
                        key={`${url}-${index}`}
                      >

                        <img
                          src={url}
                          alt={`Product ${
                            index +
                            1
                          }`}
                        />

                        <div className="admin-image-preview-label">
                          IMAGE{" "}
                          {index +
                            1}
                        </div>

                        <button
                          type="button"
                          className="admin-image-preview-remove"
                          onClick={() =>
                            removeImage(
                              index
                            )
                          }
                          aria-label={`Remove image ${
                            index +
                            1
                          }`}
                        >
                          <X
                            size={
                              15
                            }
                          />
                        </button>

                      </div>
                    )
                  )}

                </div>
              )}

              <p className="admin-image-count">
                {imageUrls.length} /{" "}
                {MAX_IMAGES}{" "}
                images uploaded
              </p>

            </section>

            {/* ACTIONS */}

            <div className="admin-product-form-actions">

              <Link
                to="/admin/products"
                className="admin-form-cancel"
              >
                Cancel
              </Link>

              <button
                type="submit"
                className="admin-form-submit"
                disabled={
                  saving ||
                  uploadingImages
                }
              >

                {saving ? (
                  "Saving..."
                ) : (
                  <>
                    <Save
                      size={
                        16
                      }
                    />

                    {isEditMode
                      ? "Update Product"
                      : "Add Product"}
                  </>
                )}

              </button>

            </div>

          </form>

        </section>

        <footer className="admin-footer">

          <span>
            AÚN ADMIN
          </span>

          <span>
            PRODUCT MANAGEMENT
          </span>

        </footer>

      </main>

    </div>
  );
}