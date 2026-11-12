import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../services/cartService";
import { getProductById } from "../services/productService";
import "../assets/cart.css";

const fallbackImage =
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=500&q=80";

function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(price || 0));
}

export default function Cart() {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [productData, setProductData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingItem, setUpdatingItem] = useState(null);
  const [removingItem, setRemovingItem] = useState(null);
  const [clearingCart, setClearingCart] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

  async function loadCart() {
    try {
      setLoading(true);
      setError("");

      const data = await getCart();
      setCart(data);

      /*
       * Cart API gives us productId but does not include
       * stockQuantity or imageUrls.
       *
       * Fetch the product details once for each cart item.
       * We use the result for:
       * 1. Product image
       * 2. Available stock
       */
      const items = data?.items || [];

      const productEntries = await Promise.all(
        items.map(async (item) => {
          if (!item.productId) {
            return [
              item.cartItemId,
              {
                image: fallbackImage,
                stockQuantity: null,
              },
            ];
          }

          try {
            const product = await getProductById(item.productId);

            const image =
              product?.imageUrls?.find(
                (url) =>
                  typeof url === "string" && url.trim()
              ) || fallbackImage;

            return [
              item.cartItemId,
              {
                image,
                stockQuantity: Number(
                  product?.stockQuantity ?? 0
                ),
              },
            ];
          } catch (productError) {
            console.error(
              `Unable to load product ${item.productId}:`,
              productError
            );

            return [
              item.cartItemId,
              {
                image: fallbackImage,
                stockQuantity: null,
              },
            ];
          }
        })
      );

      setProductData(
        Object.fromEntries(productEntries)
      );
    } catch (err) {
      console.error("Cart loading error:", err);

      if (err.status === 401) {
        navigate("/login");
        return;
      }

      setError(
        err.message || "Unable to load your shopping bag."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleQuantityChange(item, newQuantity) {
    const product = productData[item.cartItemId];

    /*
     * Prevent quantity from going below 1.
     */
    if (newQuantity < 1) {
      return;
    }

    /*
     * If stock information is available, prevent the
     * quantity from going above available stock.
     */
    if (
      product?.stockQuantity != null &&
      newQuantity > product.stockQuantity
    ) {
      setError(
        `Only ${product.stockQuantity} item${
          product.stockQuantity === 1 ? "" : "s"
        } available for ${item.productName}.`
      );
      return;
    }

    try {
      setUpdatingItem(item.cartItemId);
      setError("");

      const updatedCart = await updateCartItem(
        item.cartItemId,
        newQuantity
      );

      setCart(updatedCart);
    } catch (err) {
      console.error("Quantity update error:", err);

      if (err.status === 401) {
        navigate("/login");
        return;
      }

      setError(
        err.message || "Unable to update quantity."
      );
    } finally {
      setUpdatingItem(null);
    }
  }

  async function handleRemoveItem(itemId) {
    try {
      setRemovingItem(itemId);
      setError("");

      const updatedCart = await removeCartItem(itemId);

      setCart(updatedCart);

      setProductData((current) => {
        const updated = { ...current };
        delete updated[itemId];
        return updated;
      });
    } catch (err) {
      console.error("Remove item error:", err);

      if (err.status === 401) {
        navigate("/login");
        return;
      }

      setError(
        err.message || "Unable to remove this item."
      );
    } finally {
      setRemovingItem(null);
    }
  }

  async function handleClearCart() {
    if (
      !window.confirm(
        "Are you sure you want to clear your bag?"
      )
    ) {
      return;
    }

    try {
      setClearingCart(true);
      setError("");

      const updatedCart = await clearCart();

      setCart(updatedCart);
      setProductData({});
    } catch (err) {
      console.error("Clear cart error:", err);

      if (err.status === 401) {
        navigate("/login");
        return;
      }

      setError(
        err.message || "Unable to clear your bag."
      );
    } finally {
      setClearingCart(false);
    }
  }

  if (loading) {
    return (
      <div className="cart-status">
        Loading your shopping bag...
      </div>
    );
  }

  if (error && !cart) {
    return (
      <div className="cart-status">
        <h2>Unable to load your bag</h2>

        <p>{error}</p>

        <button
          type="button"
          onClick={loadCart}
        >
          TRY AGAIN
        </button>

        <Link to="/home">
          Continue shopping
        </Link>
      </div>
    );
  }

  const items = cart?.items || [];
  const isEmpty = items.length === 0;

  return (
    <main className="cart-page">
      <header className="cart-header">
        <Link to="/home" className="cart-logo">
          aún<span>.</span>
        </Link>

        <Link
          to="/home"
          className="cart-continue-link"
        >
          ← Continue shopping
        </Link>
      </header>

      <section className="cart-content">
        <div className="cart-title-row">
          <div>
            <span className="cart-eyebrow">
              YOUR SELECTION
            </span>

            <h1>Your shopping bag</h1>

            <p>
              {cart?.totalItems || 0}{" "}
              {(cart?.totalItems || 0) === 1
                ? "item"
                : "items"}{" "}
              in your bag
            </p>
          </div>

          {!isEmpty && (
            <button
              type="button"
              className="clear-cart-button"
              onClick={handleClearCart}
              disabled={clearingCart}
            >
              {clearingCart
                ? "CLEARING..."
                : "CLEAR BAG"}
            </button>
          )}
        </div>

        {error && (
          <p
            className="cart-error-message"
            role="alert"
          >
            {error}
          </p>
        )}

        {isEmpty ? (
          <div className="empty-cart">
            <div className="empty-cart-icon">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M5 8h14l1 13H4L5 8Z" />
                <path d="M9 9V6a3 3 0 0 1 6 0v3" />
              </svg>
            </div>

            <h2>Your bag is waiting.</h2>

            <p>
              Looks like you haven't added anything
              to your bag yet. Discover something
              that feels like you.
            </p>

            <Link
              to="/home"
              className="empty-cart-button"
            >
              EXPLORE COLLECTION ↗
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items-section">
              <div className="cart-items-heading">
                <span>PRODUCT</span>
                <span>SUBTOTAL</span>
              </div>

              {items.map((item) => {
                const hasDiscount =
                  item.discountPrice != null &&
                  Number(item.discountPrice) <
                    Number(item.price);

                const unitPrice = hasDiscount
                  ? item.discountPrice
                  : item.price;

                const product =
                  productData[item.cartItemId];

                const productImage =
                  product?.image ||
                  fallbackImage;

                const stockQuantity =
                  product?.stockQuantity;

                const isUpdating =
                  updatingItem ===
                  item.cartItemId;

                const isAtStockLimit =
                  stockQuantity != null &&
                  item.quantity >=
                    stockQuantity;

                return (
                  <article
                    className="cart-item"
                    key={item.cartItemId}
                  >
                    <div className="cart-item-image">
                      <img
                        src={productImage}
                        alt={item.productName}
                        onError={(event) => {
                          event.currentTarget.onerror =
                            null;
                          event.currentTarget.src =
                            fallbackImage;
                        }}
                      />
                    </div>

                    <div className="cart-item-information">
                      <span className="cart-item-category">
                        {item.categoryName ||
                          "AÚN COLLECTION"}
                      </span>

                      <h2>
                        {item.productName}
                      </h2>

                      <p className="cart-item-price">
                        {formatPrice(unitPrice)}

                        {hasDiscount && (
                          <span>
                            {formatPrice(
                              item.price
                            )}
                          </span>
                        )}
                      </p>

                      <div className="cart-item-variants">
                        {item.selectedSize && (
                          <span>
                            Size:{" "}
                            {item.selectedSize}
                          </span>
                        )}

                        {item.selectedColor && (
                          <span>
                            Colour:{" "}
                            {item.selectedColor}
                          </span>
                        )}
                      </div>

                      <div className="cart-item-actions">
                        <div className="cart-quantity-control">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            onClick={() =>
                              handleQuantityChange(
                                item,
                                item.quantity -
                                  1
                              )
                            }
                            disabled={
                              isUpdating ||
                              item.quantity <=
                                1
                            }
                          >
                            −
                          </button>

                          <span>
                            {isUpdating
                              ? "..."
                              : item.quantity}
                          </span>

                          <button
                            type="button"
                            aria-label="Increase quantity"
                            onClick={() =>
                              handleQuantityChange(
                                item,
                                item.quantity +
                                  1
                              )
                            }
                            disabled={
                              isUpdating ||
                              isAtStockLimit
                            }
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          className="remove-cart-item"
                          onClick={() =>
                            handleRemoveItem(
                              item.cartItemId
                            )
                          }
                          disabled={
                            removingItem ===
                            item.cartItemId
                          }
                        >
                          {removingItem ===
                          item.cartItemId
                            ? "REMOVING..."
                            : "REMOVE"}
                        </button>
                      </div>

                      {isAtStockLimit && (
                        <p
                          style={{
                            marginTop: "8px",
                            color: "#888",
                            fontSize: "10px",
                          }}
                        >
                          Maximum available
                          quantity reached.
                        </p>
                      )}
                    </div>

                    <div className="cart-item-subtotal">
                      {formatPrice(
                        item.subtotal
                      )}
                    </div>
                  </article>
                );
              })}
            </div>

            <aside className="cart-summary">
              <span className="cart-eyebrow">
                ORDER SUMMARY
              </span>

              <h2>Order details</h2>

              <div className="summary-line">
                <span>Items</span>
                <span>
                  {cart?.totalItems || 0}
                </span>
              </div>

              <div className="summary-line">
                <span>Subtotal</span>
                <span>
                  {formatPrice(
                    cart?.totalAmount
                  )}
                </span>
              </div>

              <div className="summary-divider" />

              <div className="summary-total">
                <span>Total</span>

                <strong>
                  {formatPrice(
                    cart?.totalAmount
                  )}
                </strong>
              </div>

              <p className="summary-note">
                Shipping charges and applicable
                taxes will be calculated during
                checkout.
              </p>

              <button
                type="button"
                className="checkout-button"
                onClick={() =>
                  navigate("/checkout")
                }
              >
                PROCEED TO CHECKOUT ↗
              </button>

              <Link
                to="/home"
                className="summary-continue"
              >
                CONTINUE SHOPPING
              </Link>
            </aside>
          </div>
        )}
      </section>

      <footer className="cart-footer">
        <span>
          © 2026 AÚN. ALL RIGHTS RESERVED.
        </span>

        <span>
          MADE FOR EVERY YOU.
        </span>
      </footer>
    </main>
  );
}
