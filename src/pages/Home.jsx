import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllProducts } from "../services/productService";
import { getAllCategories } from "../services/categoryService";
import Navbar from "../components/Navbar";
import "../assets/home.css";

const typingQuotes = [
  "Still becoming. Still creating. Still you.",
  "Wear what feels like you.",
  "Less noise. More expression.",
  "Style evolves. You do too.",
  "Made for every version of you.",
];

function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

function getProductImage(product) {
  return (
    product.imageUrls?.find((url) => url?.trim()) ||
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85"
  );
}

function hasDiscount(product) {
  return (
    product.discountPrice != null &&
    Number(product.discountPrice) < Number(product.price)
  );
}

/*
 * Convert category name into a safe URL slug.
 *
 * Examples:
 *
 * T-Shirts               -> t-shirts
 * Casual Shirts          -> casual-shirts
 * Hoodies                -> hoodies
 * Hoodies / Sweatshirts -> hoodies-sweatshirts
 * Activewear             -> activewear
 */
function createCategorySlug(categoryName) {
  return String(categoryName || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function ProductCard({ product }) {
  const discounted = hasDiscount(product);
  const image = getProductImage(product);

  return (
    <article className="home-product-card">
      <Link
        to={`/products/${product.productId}`}
        className="product-image-wrapper"
      >
        <img
          src={image}
          alt={product.productName}
          onError={(event) => {
            event.currentTarget.onerror = null;

            event.currentTarget.src =
              "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85";
          }}
        />

        <span className="product-tag">
          {discounted ? "SPECIAL PRICE" : "ESSENTIAL"}
        </span>

        <span className="product-view">
          VIEW PRODUCT ↗
        </span>
      </Link>

      <div className="product-details">
        <div>
          <p>
            {product.categoryName || "AÚN COLLECTION"}
          </p>

          <h3>
            {product.productName}
          </h3>
        </div>

        <div className="product-prices">
          {discounted && (
            <span className="product-original-price">
              {formatPrice(product.price)}
            </span>
          )}

          <span className="product-price">
            {formatPrice(
              discounted
                ? product.discountPrice
                : product.price
            )}
          </span>
        </div>
      </div>
    </article>
  );
}

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] =
    useState(true);

  const [error, setError] = useState("");
  const [categoriesError, setCategoriesError] =
    useState("");

  const [quoteIndex, setQuoteIndex] = useState(0);
  const [typedQuote, setTypedQuote] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  /*
   * FETCH PRODUCTS
   */
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setError("");

        const data = await getAllProducts();

        setProducts(
          Array.isArray(data) ? data : []
        );
      } catch (err) {
        console.error(
          "Product fetching failed:",
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
   * FETCH ACTIVE CATEGORIES
   */
  useEffect(() => {
    async function fetchCategories() {
      try {
        setCategoriesLoading(true);
        setCategoriesError("");

        const data = await getAllCategories();

        setCategories(
          Array.isArray(data) ? data : []
        );
      } catch (err) {
        console.error(
          "Category fetching failed:",
          err
        );

        setCategoriesError(
          "Unable to load collections."
        );
      } finally {
        setCategoriesLoading(false);
      }
    }

    fetchCategories();
  }, []);

  /*
   * CONTINUOUS TYPING QUOTE
   */
  useEffect(() => {
    const currentQuote =
      typingQuotes[quoteIndex];

    let timeout;

    if (
      !isDeleting &&
      typedQuote.length < currentQuote.length
    ) {
      timeout = setTimeout(() => {
        setTypedQuote(
          currentQuote.substring(
            0,
            typedQuote.length + 1
          )
        );
      }, 75);
    } else if (
      !isDeleting &&
      typedQuote.length === currentQuote.length
    ) {
      timeout = setTimeout(() => {
        setIsDeleting(true);
      }, 2200);
    } else if (
      isDeleting &&
      typedQuote.length > 0
    ) {
      timeout = setTimeout(() => {
        setTypedQuote(
          currentQuote.substring(
            0,
            typedQuote.length - 1
          )
        );
      }, 40);
    } else if (
      isDeleting &&
      typedQuote.length === 0
    ) {
      setIsDeleting(false);

      setQuoteIndex(
        (previousIndex) =>
          (previousIndex + 1) %
          typingQuotes.length
      );
    }

    return () => clearTimeout(timeout);
  }, [
    typedQuote,
    isDeleting,
    quoteIndex,
  ]);

  /*
   * NEWLY ADDED PRODUCTS
   */
  const newlyAddedProducts = [...products]
    .sort((a, b) => {
      const dateA = a.createdAt
        ? new Date(a.createdAt).getTime()
        : 0;

      const dateB = b.createdAt
        ? new Date(b.createdAt).getTime()
        : 0;

      return dateB - dateA;
    })
    .slice(0, 4);

  /*
   * BEST SELLING PRODUCTS
   */
  const bestSellingProducts = [...products]
    .sort((a, b) => {
      const salesA = Number(
        a.soldCount ??
          a.salesCount ??
          a.totalSold ??
          0
      );

      const salesB = Number(
        b.soldCount ??
          b.salesCount ??
          b.totalSold ??
          0
      );

      return salesB - salesA;
    })
    .slice(0, 4);

  return (
    <main className="aun-home">

      {/* =====================================================
          RUNNING ANNOUNCEMENT BAR
          ===================================================== */}

      <div className="announcement-bar">
        <div className="announcement-track">

          {/* GROUP 1 */}

          <div className="announcement-group">

            <span>
              WELCOME TO AÚN
            </span>

            <span className="announcement-separator">
              ·
            </span>

            <span>
              LESS, BUT BETTER. DISCOVER THE AÚN COLLECTION.
            </span>

            <span className="announcement-separator">
              ·
            </span>

            <span>
              MADE FOR EVERY YOU.
            </span>

            <span className="announcement-separator">
              ·
            </span>

          </div>

          {/* GROUP 2 - EXACT COPY */}

          <div className="announcement-group">

            <span>
              WELCOME TO AÚN
            </span>

            <span className="announcement-separator">
              ·
            </span>

            <span>
              LESS, BUT BETTER. DISCOVER THE AÚN COLLECTION.
            </span>

            <span className="announcement-separator">
              ·
            </span>

            <span>
              MADE FOR EVERY YOU.
            </span>

            <span className="announcement-separator">
              ·
            </span>

          </div>

        </div>
      </div>

      {/* =====================================================
          NAVIGATION
          ===================================================== */}

      <Navbar />

      {/* =====================================================
          HERO
          ===================================================== */}

      <section className="hero-section">

        <img
          className="hero-image"
          src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=2200&q=90"
          alt="Fashion editorial featuring contemporary clothing"
        />

        <div className="hero-overlay" />

        <div className="hero-content">

          <span className="hero-eyebrow">
            THE ART OF EVERYDAY STYLE
          </span>

          <h1>
            Wear less.
            <br />
            Express more.
          </h1>

          <p>
            Thoughtfully chosen pieces.
            <br />
            Made for every version of you.
          </p>

          <a
            href="#categories"
            className="hero-button"
          >
            EXPLORE COLLECTION
            <span>↗</span>
          </a>

        </div>

        <div className="hero-bottom">

          <span>
            EST. 2026
          </span>

          <span>
            STYLE WITHOUT LIMITS
          </span>

        </div>

        <span className="hero-side-text">
          AÚN — STILL YOURSELF
        </span>

      </section>

      {/* =====================================================
          CONTINUOUS TYPING QUOTE
          ===================================================== */}

      <section className="typing-quote-section">

        <div className="typing-quote-container">

          <span className="typing-quote-eyebrow">
            THE AÚN PHILOSOPHY
          </span>

          <h2 className="typing-quote">

            {typedQuote}

            <span className="typing-cursor">
              |
            </span>

          </h2>

        </div>

      </section>

      {/* =====================================================
          CATEGORIES
          ===================================================== */}

      <section
        className="category-section"
        id="categories"
      >

        <div className="section-heading">

          <div>

            <span className="section-eyebrow">
              FIND YOUR EXPRESSION
            </span>

            <h2>
              Explore collections
            </h2>

          </div>

          <a
            href="#new-arrivals"
            className="text-link"
          >
            DISCOVER MORE ↗
          </a>

        </div>

        {categoriesLoading && (
          <p className="products-message">
            Exploring collections...
          </p>
        )}

        {!categoriesLoading &&
          categoriesError && (
            <p className="products-error">
              {categoriesError}
            </p>
          )}

        {!categoriesLoading &&
          !categoriesError &&
          categories.length === 0 && (
            <p className="products-message">
              No collections are currently available.
            </p>
          )}

        {!categoriesLoading &&
          !categoriesError &&
          categories.length > 0 && (

            <div className="category-grid">

              {categories.map(
                (category, index) => {

                  return (
                    <Link
                      to={`/category/${createCategorySlug(
                        category.categoryName
                      )}`}
                      className="category-card"
                      key={category.categoryId}
                    >

                      <div className="category-info">

                        <div>

                          <span className="category-number">
                            {String(index + 1).padStart(
                              2,
                              "0"
                            )}
                          </span>

                          <h3>
                            {category.categoryName}
                          </h3>

                          <p>
                            {category.description ||
                              "Explore the AÚN collection"}
                          </p>

                        </div>

                        <span className="category-arrow">
                          ↗
                        </span>

                      </div>

                    </Link>
                  );
                }
              )}

            </div>

          )}

      </section>

      {/* =====================================================
          NEWLY ADDED PRODUCTS
          ===================================================== */}

      <section
        className="products-section new-arrivals-section"
        id="new-arrivals"
      >

        <div className="section-heading">

          <div>

            <span className="section-eyebrow">
              JUST IN
            </span>

            <h2>
              Newly added
            </h2>

          </div>

          <a
            href="#best-selling"
            className="text-link"
          >
            SEE WHAT'S NEXT ↗
          </a>

        </div>

        {loading && (
          <p className="products-message">
            Discovering the latest pieces...
          </p>
        )}

        {!loading &&
          error && (
            <p className="products-error">
              {error}
            </p>
          )}

        {!loading &&
          !error &&
          newlyAddedProducts.length === 0 && (
            <p className="products-message">
              No products are currently available.
            </p>
          )}

        {!loading &&
          !error &&
          newlyAddedProducts.length > 0 && (

            <div className="product-grid">

              {newlyAddedProducts.map(
                (product) => (
                  <ProductCard
                    key={product.productId}
                    product={product}
                  />
                )
              )}

            </div>

          )}

      </section>

      {/* =====================================================
          BEST SELLING PRODUCTS
          ===================================================== */}

      <section
        className="products-section best-selling-section"
        id="best-selling"
      >

        <div className="section-heading">

          <div>

            <span className="section-eyebrow">
              MOST LOVED
            </span>

            <h2>
              Best selling
            </h2>

          </div>

          <a
            href="#about"
            className="text-link"
          >
            DISCOVER AÚN ↗
          </a>

        </div>

        {loading && (
          <p className="products-message">
            Finding the pieces everyone loves...
          </p>
        )}

        {!loading &&
          !error &&
          bestSellingProducts.length > 0 && (

            <div className="product-grid">

              {bestSellingProducts.map(
                (product) => (
                  <ProductCard
                    key={product.productId}
                    product={product}
                  />
                )
              )}

            </div>

          )}

      </section>

      {/* =====================================================
          ABOUT AÚN
          ===================================================== */}

      <section
        className="about-section"
        id="about"
      >

        <div className="about-image">

          <img
            src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=85"
            alt="Contemporary fashion editorial"
          />

        </div>

        <div className="about-content">

          <span className="section-eyebrow">
            ABOUT AÚN
          </span>

          <h2>
            Still becoming.
            <br />
            Still evolving.
            <br />

            <span>
              Still you.
            </span>

          </h2>

          <p>
            Aún means "still".
            A reminder that style is never
            finished. It changes, grows and
            evolves with you.
          </p>

          <p>
            We create timeless essentials,
            effortless silhouettes and pieces
            designed for every version of who
            you are becoming.
          </p>

          <a
            href="#categories"
            className="story-link"
          >
            EXPLORE AÚN
            <span>
              ↗
            </span>
          </a>

        </div>

      </section>

      {/* =====================================================
          FOOTER
          ===================================================== */}

      <footer className="home-footer">

        <div className="footer-main">

          <div className="footer-brand">

            <Link
              to="/home"
              className="home-logo"
            >
              aún<span>.</span>
            </Link>

            <p>
              Made for every version of you.
            </p>

          </div>

          <div className="footer-column">

            <h4>
              EXPLORE
            </h4>

            <a href="#categories">
              Collections
            </a>

            <a href="#new-arrivals">
              New arrivals
            </a>

            <a href="#best-selling">
              Best selling
            </a>

            <a href="#about">
              About AÚN
            </a>

          </div>

          <div className="footer-column">

            <h4>
              YOUR ACCOUNT
            </h4>

            <Link to="/account">
              Account
            </Link>

            <Link to="/orders">
              Orders
            </Link>

            <Link to="/cart">
              Shopping bag
            </Link>

          </div>

          <div className="footer-column">

            <h4>
              FOLLOW ALONG
            </h4>

            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noreferrer"
            >
              Instagram ↗
            </a>

            <a
              href="https://www.pinterest.com/"
              target="_blank"
              rel="noreferrer"
            >
              Pinterest ↗
            </a>

          </div>

        </div>

        <div className="footer-bottom">

          <span>
            © 2026 AÚN. ALL RIGHTS RESERVED.
          </span>

          <span>
            MADE FOR EVERY YOU.
          </span>

          <a
            href="#top"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
          >
            BACK TO TOP ↑
          </a>

        </div>

      </footer>

    </main>
  );
}