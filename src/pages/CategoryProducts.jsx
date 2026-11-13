import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getAllProducts } from "../services/productService";
import Navbar from "../components/Navbar";
import "../assets/category-products.css";

const priceRanges = [
  {
    label: "All prices",
    min: 0,
    max: Infinity,
  },
  {
    label: "Under ₹999",
    min: 0,
    max: 999,
  },
  {
    label: "₹999 – ₹1,999",
    min: 999,
    max: 1999,
  },
  {
    label: "₹2,000 – ₹2,999",
    min: 2000,
    max: 2999,
  },
  {
    label: "₹3,000+",
    min: 3000,
    max: Infinity,
  },
];

const sortOptions = [
  {
    label: "Newest",
    value: "newest",
  },
  {
    label: "Price: Low → High",
    value: "price-low",
  },
  {
    label: "Price: High → Low",
    value: "price-high",
  },
];

const fallbackImage =
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=85";

/*
 * Convert category name into the same URL format
 * used by Home.jsx.
 *
 * Examples:
 * T-Shirts              → t-shirts
 * Shirts                → shirts
 * Hoodies               → hoodies
 * Hoodies / Sweatshirts → hoodies-sweatshirts
 * Casual Shirts         → casual-shirts
 * Activewear            → activewear
 */
function createCategorySlug(categoryName) {
  return String(categoryName || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

function getProductPrice(product) {
  if (
    product.discountPrice != null &&
    Number(product.discountPrice) < Number(product.price)
  ) {
    return Number(product.discountPrice);
  }

  return Number(product.price);
}

export default function CategoryProducts() {
  const { category } = useParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPrice, setSelectedPrice] = useState(0);
  const [selectedSort, setSelectedSort] = useState("newest");

  /*
   * FIND ACTUAL CATEGORY NAME
   *
   * Instead of hardcoding category names,
   * find the category from the products returned
   * by the backend.
   */
  const categoryTitle = useMemo(() => {
    const matchingProduct = products.find(
      (product) =>
        createCategorySlug(product.categoryName) === category
    );

    return matchingProduct?.categoryName || "Collection";
  }, [products, category]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setError("");

        const data = await getAllProducts();

        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(
          "Category product fetching failed:",
          err
        );

        setError(
          "Unable to load products. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  /*
   * FILTER PRODUCTS BY CATEGORY
   */
  const categoryProducts = useMemo(() => {
    return products.filter((product) => {
      const productCategorySlug =
        createCategorySlug(product.categoryName);

      return productCategorySlug === category;
    });
  }, [products, category]);

  /*
   * SEARCH PRODUCTS
   */
  const searchedProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return categoryProducts;
    }

    return categoryProducts.filter((product) => {
      const productName = String(
        product.productName || ""
      ).toLowerCase();

      return productName.includes(query);
    });
  }, [categoryProducts, searchQuery]);

  /*
   * FILTER PRODUCTS BY PRICE
   */
  const filteredProducts = useMemo(() => {
    const selectedRange =
      priceRanges[selectedPrice];

    return searchedProducts.filter((product) => {
      const actualPrice =
        getProductPrice(product);

      return (
        actualPrice >= selectedRange.min &&
        actualPrice <= selectedRange.max
      );
    });
  }, [searchedProducts, selectedPrice]);

  /*
   * SORT PRODUCTS
   */
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];

    if (selectedSort === "price-low") {
      sorted.sort(
        (a, b) =>
          getProductPrice(a) -
          getProductPrice(b)
      );
    }

    if (selectedSort === "price-high") {
      sorted.sort(
        (a, b) =>
          getProductPrice(b) -
          getProductPrice(a)
      );
    }

    if (selectedSort === "newest") {
      sorted.sort((a, b) => {
        const dateA = a.createdAt
          ? new Date(a.createdAt).getTime()
          : 0;

        const dateB = b.createdAt
          ? new Date(b.createdAt).getTime()
          : 0;

        return dateB - dateA;
      });
    }

    return sorted;
  }, [filteredProducts, selectedSort]);

  return (
    <main className="category-products-page">

      {/* ANNOUNCEMENT */}

      <div className="category-products-announcement">
        <p>
          LESS, BUT BETTER. DISCOVER THE AÚN COLLECTION.
        </p>
      </div>

      {/* NAVBAR */}

      <Navbar />

      {/* HEADER */}

      <section className="category-products-header">

        <div>

          <Link
            to="/home"
            className="category-back-link"
          >
            ← Back to Home
          </Link>

          <p className="category-eyebrow">
            AÚN COLLECTION
          </p>

          <h1>
            {categoryTitle}
          </h1>

          <p className="category-description">
            Discover pieces designed for every
            version of you.
          </p>

        </div>

        <div className="category-count">

          <span>
            {sortedProducts.length}
          </span>

          <p>
            {sortedProducts.length === 1
              ? "PRODUCT"
              : "PRODUCTS"}
          </p>

        </div>

      </section>

      {/* PRODUCTS CONTENT */}

      <section className="category-products-content">

        {/* PRICE FILTER */}

        <aside className="price-filter">

          <div className="filter-heading">

            <span>
              FILTER
            </span>

            <h2>
              Price
            </h2>

          </div>

          <div className="price-options">

            {priceRanges.map(
              (range, index) => (

                <label
                  key={range.label}
                  className={`price-option ${
                    selectedPrice === index
                      ? "selected"
                      : ""
                  }`}
                >

                  <input
                    type="radio"
                    name="price"
                    checked={
                      selectedPrice === index
                    }
                    onChange={() =>
                      setSelectedPrice(index)
                    }
                  />

                  <span className="custom-radio" />

                  <span>
                    {range.label}
                  </span>

                </label>

              )
            )}

          </div>

        </aside>

        {/* PRODUCTS */}

        <div className="category-product-area">

          {/* SEARCH + SORT BAR */}

          {!loading &&
            !error &&
            categoryProducts.length > 0 && (

              <div className="category-sort-bar">

                <div className="category-results-count">

                  <span>
                    {sortedProducts.length}
                  </span>

                  <p>
                    {sortedProducts.length === 1
                      ? "ITEM"
                      : "ITEMS"}
                  </p>

                </div>

                <div className="category-search">

                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(event) =>
                      setSearchQuery(
                        event.target.value
                      )
                    }
                  />

                </div>

                <div className="sort-control">

                  <label htmlFor="sort-products">
                    SORT BY
                  </label>

                  <select
                    id="sort-products"
                    value={selectedSort}
                    onChange={(event) =>
                      setSelectedSort(
                        event.target.value
                      )
                    }
                  >

                    {sortOptions.map(
                      (option) => (

                        <option
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </option>

                      )
                    )}

                  </select>

                </div>

              </div>

            )}

          {/* LOADING */}

          {loading && (
            <div className="category-products-message">
              Discovering your essentials...
            </div>
          )}

          {/* ERROR */}

          {!loading &&
            error && (

              <div className="category-products-message error">
                {error}
              </div>

            )}

          {/* NO CATEGORY PRODUCTS */}

          {!loading &&
            !error &&
            categoryProducts.length === 0 && (

              <div className="category-products-message">

                <h2>
                  No{" "}
                  {categoryTitle.toLowerCase()}{" "}
                  found.
                </h2>

                <p>
                  There are currently no
                  products in this collection.
                </p>

              </div>

            )}

          {/* NO SEARCH RESULTS */}

          {!loading &&
            !error &&
            categoryProducts.length > 0 &&
            searchedProducts.length === 0 && (

              <div className="category-products-message">

                <h2>
                  No products found.
                </h2>

                <p>
                  No products match "{searchQuery}".
                </p>

              </div>

            )}

          {/* NO PRODUCTS IN PRICE RANGE */}

          {!loading &&
            !error &&
            searchedProducts.length > 0 &&
            sortedProducts.length === 0 && (

              <div className="category-products-message">

                <h2>
                  No products in this price range.
                </h2>

                <p>
                  Try selecting another price range.
                </p>

              </div>

            )}

          {/* PRODUCT GRID */}

          {!loading &&
            !error &&
            sortedProducts.length > 0 && (

              <div className="category-product-grid">

                {sortedProducts.map((product) => {

                  const image =
                    product.imageUrls?.find(
                      (url) => url?.trim()
                    ) || fallbackImage;

                  const hasDiscount =
                    product.discountPrice != null &&
                    Number(product.discountPrice) <
                      Number(product.price);

                  const displayPrice =
                    hasDiscount
                      ? product.discountPrice
                      : product.price;

                  return (

                    <article
                      className="category-product-card"
                      key={product.productId}
                    >

                      <Link
                        to={`/products/${product.productId}`}
                        className="category-product-image"
                      >

                        <img
                          src={image}
                          alt={product.productName}
                          onError={(event) => {

                            event.currentTarget.onerror =
                              null;

                            event.currentTarget.src =
                              fallbackImage;

                          }}
                        />

                        <span className="category-product-tag">
                          {hasDiscount
                            ? "SPECIAL PRICE"
                            : "ESSENTIAL"}
                        </span>

                        <span className="category-product-view">
                          VIEW PRODUCT ↗
                        </span>

                      </Link>

                      <div className="category-product-info">

                        <div>

                          <p>
                            {product.categoryName}
                          </p>

                          <h3>
                            {product.productName}
                          </h3>

                        </div>

                        <div className="category-product-prices">

                          {hasDiscount && (

                            <span className="category-original-price">
                              {formatPrice(
                                product.price
                              )}
                            </span>

                          )}

                          <span className="category-product-price">
                            {formatPrice(
                              displayPrice
                            )}
                          </span>

                        </div>

                      </div>

                    </article>

                  );
                })}

              </div>

            )}

        </div>

      </section>

    </main>
  );
}