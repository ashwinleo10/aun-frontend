import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getAllProducts,
  getProductById,
} from "../services/productService";
import { addProductToCart } from "../services/cartService";
import "../assets/product-details.css";

const fallbackImage =
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85";

function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(price || 0));
}

export default function ProductDetails() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recommendationsLoading, setRecommendationsLoading] =
    useState(true);
  const [error, setError] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState("");
  const [failedImages, setFailedImages] = useState([]);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartAdded, setCartAdded] = useState(false);
  const [cartMessage, setCartMessage] = useState("");
  const [cartError, setCartError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchProduct() {
      try {
        setLoading(true);
        setError("");
        setProduct(null);
        setCartMessage("");
        setCartError("");
        setCartAdded(false);
        setFailedImages([]);

        const data = await getProductById(productId);

        if (!data || typeof data !== "object") {
          throw new Error(
            "Invalid product data received from the server."
          );
        }

        if (!isMounted) return;

        setProduct(data);

        const firstImage =
          Array.isArray(data.imageUrls)
            ? data.imageUrls.find(
                (url) =>
                  typeof url === "string" && url.trim()
              )
            : "";

        setActiveImage(firstImage || fallbackImage);
        setSelectedSize("");
        setSelectedColor("");
        setQuantity(1);
      } catch (err) {
        console.error("Product details error:", err);

        if (!isMounted) return;

        setProduct(null);
        setError(err.message || "Unable to load product.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [productId]);

  useEffect(() => {
    let isMounted = true;

    async function fetchRecommendations() {
      try {
        setRecommendationsLoading(true);

        const data = await getAllProducts();

        if (!isMounted) return;

        setAllProducts(
          Array.isArray(data) ? data : []
        );
      } catch (err) {
        console.error(
          "Recommended products error:",
          err
        );

        if (!isMounted) return;

        setAllProducts([]);
      } finally {
        if (isMounted) {
          setRecommendationsLoading(false);
        }
      }
    }

    fetchRecommendations();

    return () => {
      isMounted = false;
    };
  }, []);

  const recommendedProducts = useMemo(() => {
    if (!product || !Array.isArray(allProducts)) {
      return [];
    }

    const currentProductId = Number(
      product.productId
    );

    const currentCategory = String(
      product.categoryName || ""
    )
      .trim()
      .toLowerCase();

    const otherProducts = allProducts.filter(
      (item) =>
        Number(item.productId) !==
        currentProductId
    );

    const sameCategoryProducts =
      otherProducts.filter((item) => {
        const itemCategory = String(
          item.categoryName || ""
        )
          .trim()
          .toLowerCase();

        return (
          itemCategory === currentCategory
        );
      });

    const differentCategoryProducts =
      otherProducts.filter((item) => {
        const itemCategory = String(
          item.categoryName || ""
        )
          .trim()
          .toLowerCase();

        return (
          itemCategory !== currentCategory
        );
      });

    return [
      ...sameCategoryProducts,
      ...differentCategoryProducts,
    ].slice(0, 4);
  }, [allProducts, product]);

  const handleAddToCart = async () => {
    setCartMessage("");
    setCartError("");

    if (!product) {
      setCartError(
        "Product information is unavailable."
      );
      return;
    }

    if (!selectedSize) {
      setCartError("Please select a size.");
      return;
    }

    if (!selectedColor) {
      setCartError("Please select a colour.");
      return;
    }

    if (
      quantity < 1 ||
      quantity >
        Number(product.stockQuantity || 0)
    ) {
      setCartError(
        "Please select a valid quantity."
      );
      return;
    }

    try {
      setAddingToCart(true);

      await addProductToCart({
        productId: Number(product.productId),
        quantity,
        selectedSize,
        selectedColor,
      });

      setCartAdded(true);

      setTimeout(() => {
        setCartAdded(false);
      }, 3000);
    } catch (err) {
      console.error(
        "Add to cart error:",
        err
      );

      if (err.status === 401) {
        navigate("/login");
        return;
      }

      if (err.status === 403) {
        setCartError(
          "A customer account is required to add products to your bag."
        );
        return;
      }

      setCartError(
        err.message ||
          "Unable to add this product to your bag."
      );
    } finally {
      setAddingToCart(false);
    }
  };

  const handleThumbnailError = (image) => {
    setFailedImages((current) =>
      current.includes(image)
        ? current
        : [...current, image]
    );
  };

  if (loading) {
    return (
      <div className="product-status">
        Loading product details...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-status">
        <h2>
          {error || "Product not found."}
        </h2>
        <Link to="/home">
          Return to Home
        </Link>
      </div>
    );
  }

  const productPrice = Number(
    product.price || 0
  );

  const productDiscountPrice =
    product.discountPrice != null
      ? Number(product.discountPrice)
      : null;

  const hasDiscount =
    productDiscountPrice !== null &&
    productDiscountPrice < productPrice;

  const images = Array.isArray(
    product.imageUrls
  )
    ? product.imageUrls.filter(
        (url) =>
          typeof url === "string" &&
          url.trim()
      )
    : [];

  const availableImages = images.filter(
    (image) =>
      !failedImages.includes(image)
  );

  const sizes = Array.isArray(
    product.sizes
  )
    ? product.sizes
    : [];

  const colors = Array.isArray(
    product.colors
  )
    ? product.colors
    : [];

  const stockQuantity = Number(
    product.stockQuantity || 0
  );

  return (
    <main className="product-details-page">
      <header className="product-page-header">
        <Link
          to="/home"
          className="product-page-logo"
        >
          aún<span>.</span>
        </Link>

        <div className="product-header-actions">
          <Link
            to="/cart"
            className="product-cart-link"
            aria-label="Open shopping bag"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M5 8h14l1 13H4L5 8Z" />
              <path d="M9 9V6a3 3 0 0 1 6 0v3" />
            </svg>

            <span>Bag</span>
          </Link>

          <Link
            to="/home"
            className="back-home"
          >
            ← Continue shopping
          </Link>
        </div>
      </header>

      <div className="product-breadcrumb">
        <Link to="/home">
          Home
        </Link>

        <span>/</span>

        <span>
          {product.categoryName ||
            "Collection"}
        </span>

        <span>/</span>

        <span>
          {product.productName ||
            "Product"}
        </span>
      </div>

      <section className="product-details-layout">
        <div className="product-gallery">
          <div className="main-product-image">
            <img
              src={
                activeImage ||
                fallbackImage
              }
              alt={
                product.productName ||
                "Product"
              }
              onError={(event) => {
                event.currentTarget.onerror =
                  null;

                event.currentTarget.src =
                  fallbackImage;
              }}
            />
          </div>

          {availableImages.length > 1 && (
            <div className="product-thumbnails">
              {availableImages.map(
                (image, index) => (
                  <button
                    type="button"
                    key={`${image}-${index}`}
                    className={
                      activeImage ===
                      image
                        ? "thumbnail active"
                        : "thumbnail"
                    }
                    onClick={() =>
                      setActiveImage(
                        image
                      )
                    }
                  >
                    <img
                      src={image}
                      alt={`${
                        product.productName ||
                        "Product"
                      } ${
                        index + 1
                      }`}
                      onError={() =>
                        handleThumbnailError(
                          image
                        )
                      }
                    />
                  </button>
                )
              )}
            </div>
          )}
        </div>

        <div className="product-information">
          <span className="product-category-label">
            {product.categoryName ||
              "Collection"}
          </span>

          <h1>
            {product.productName ||
              "Product"}
          </h1>

          <div className="detail-prices">
            <span className="detail-current-price">
              {formatPrice(
                hasDiscount
                  ? productDiscountPrice
                  : productPrice
              )}
            </span>

            {hasDiscount && (
              <span className="detail-original-price">
                {formatPrice(
                  productPrice
                )}
              </span>
            )}
          </div>

          <p className="product-description">
            {product.description ||
              "No description available."}
          </p>

          <div className="detail-divider" />

          <div className="selection-group">
            <h3>
              Select size

              <span>
                {selectedSize ||
                  "Choose your size"}
              </span>
            </h3>

            <div className="size-options">
              {sizes.map((size) => (
                <button
                  type="button"
                  key={size}
                  className={
                    selectedSize ===
                    size
                      ? "size-option selected"
                      : "size-option"
                  }
                  onClick={() => {
                    setSelectedSize(
                      size
                    );
                    setCartMessage(
                      ""
                    );
                    setCartError(
                      ""
                    );
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="selection-group">
            <h3>
              Select colour

              <span>
                {selectedColor ||
                  "Choose your colour"}
              </span>
            </h3>

            <div className="color-options">
              {colors.map((color) => (
                <button
                  type="button"
                  key={color}
                  className={
                    selectedColor ===
                    color
                      ? "color-option selected"
                      : "color-option"
                  }
                  onClick={() => {
                    setSelectedColor(
                      color
                    );
                    setCartMessage(
                      ""
                    );
                    setCartError(
                      ""
                    );
                  }}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          <div className="stock-information">
            {stockQuantity > 0
              ? `${stockQuantity} items available`
              : "Out of stock"}
          </div>

          <div className="quantity-group">
            <span>
              Quantity
            </span>

            <div className="quantity-control">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() =>
                  setQuantity(
                    (current) =>
                      Math.max(
                        1,
                        current -
                          1
                      )
                  )
                }
                disabled={
                  quantity <=
                  1
                }
              >
                −
              </button>

              <span>
                {quantity}
              </span>

              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() =>
                  setQuantity(
                    (current) =>
                      Math.min(
                        stockQuantity,
                        current +
                          1
                      )
                  )
                }
                disabled={
                  quantity >=
                  stockQuantity
                }
              >
                +
              </button>
            </div>
          </div>

          {cartError && (
            <p
              className="cart-feedback cart-error"
              role="alert"
            >
              {cartError}
            </p>
          )}

          {cartMessage && (
            <p
              className="cart-feedback cart-success"
              role="status"
            >
              {cartMessage}
            </p>
          )}

          <button
            type="button"
            className={`add-to-cart-button ${
              cartAdded
                ? "added-to-cart"
                : ""
            }`}
            onClick={
              handleAddToCart
            }
            disabled={
              stockQuantity <=
                0 ||
              addingToCart ||
              cartAdded
            }
          >
            {addingToCart
              ? "ADDING..."
              : cartAdded
                ? "✓ ADDED TO BAG"
                : stockQuantity >
                    0
                  ? "ADD TO BAG ↗"
                  : "OUT OF STOCK"}
          </button>

          <p className="product-note">
            Thoughtfully chosen.
            Made for every version
            of you.
          </p>
        </div>
      </section>

      {/* =====================================================
          RECOMMENDED PRODUCTS
          ===================================================== */}

      <section className="recommended-products">
        <div className="recommended-header">
          <div>
            <p className="recommended-eyebrow">
              YOU MAY ALSO LIKE
            </p>

            <h2>
              Recommended for you
            </h2>
          </div>

          <Link
            to={`/category/${String(
              product.categoryName ||
                ""
            )
              .toLowerCase()
              .replace(
                /\s+/g,
                "-"
              )}`}
            className="recommended-view-all"
          >
            View collection ↗
          </Link>
        </div>

        {recommendationsLoading ? (
          <div className="recommended-message">
            Discovering more from aún...
          </div>
        ) : recommendedProducts.length ===
          0 ? (
          <div className="recommended-message">
            No recommendations available
            right now.
          </div>
        ) : (
          <div className="recommended-grid">
            {recommendedProducts.map(
              (recommendedProduct) => {
                const recommendationImages =
                  Array.isArray(
                    recommendedProduct.imageUrls
                  )
                    ? recommendedProduct.imageUrls.filter(
                        (url) =>
                          typeof url ===
                            "string" &&
                          url.trim()
                      )
                    : [];

                const image =
                  recommendationImages[0] ||
                  fallbackImage;

                const hasRecommendationDiscount =
                  recommendedProduct.discountPrice !=
                    null &&
                  Number(
                    recommendedProduct.discountPrice
                  ) <
                    Number(
                      recommendedProduct.price
                    );

                const displayPrice =
                  hasRecommendationDiscount
                    ? recommendedProduct.discountPrice
                    : recommendedProduct.price;

                return (
                  <article
                    key={
                      recommendedProduct.productId
                    }
                    className="recommended-card"
                  >
                    <Link
                      to={`/products/${recommendedProduct.productId}`}
                      className="recommended-image"
                    >
                      <img
                        src={image}
                        alt={
                          recommendedProduct.productName
                        }
                        onError={(
                          event
                        ) => {
                          event.currentTarget.onerror =
                            null;

                          event.currentTarget.src =
                            fallbackImage;
                        }}
                      />

                      <span className="recommended-view-product">
                        VIEW PRODUCT ↗
                      </span>
                    </Link>

                    <div className="recommended-info">
                      <div>
                        <p>
                          {recommendedProduct.categoryName ||
                            "AÚN"}
                        </p>

                        <h3>
                          {
                            recommendedProduct.productName
                          }
                        </h3>
                      </div>

                      <div className="recommended-prices">
                        {hasRecommendationDiscount && (
                          <span className="recommended-original-price">
                            {formatPrice(
                              recommendedProduct.price
                            )}
                          </span>
                        )}

                        <span className="recommended-price">
                          {formatPrice(
                            displayPrice
                          )}
                        </span>
                      </div>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}
      </section>
    </main>
  );
}
