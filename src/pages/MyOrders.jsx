import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyOrders } from "../services/orderService";
import "../assets/my-orders.css";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getMyOrders();

        const orderList = Array.isArray(data)
          ? data
          : data?.orders || [];

        setOrders(orderList);
      } catch (err) {
        setError(err.message || "Unable to load your orders.");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatAmount = (amount) =>
    Number(amount || 0).toLocaleString("en-IN");

  const formatStatus = (status) =>
    status ? status.replaceAll("_", " ") : "—";

  if (loading) {
    return (
      <div className="orders-message">
        <p>Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-message">
        <p className="orders-error">{error}</p>

        <button onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <main className="my-orders-page">
      <div className="orders-header">
        <div className="orders-header-content">
          <p className="orders-eyebrow">YOUR ACCOUNT</p>

          <h1>My Orders</h1>

          <p className="orders-subtitle">
            View and track your recent purchases.
          </p>
        </div>

        <Link to="/home" className="orders-shop-link">
          Continue Shopping
        </Link>
      </div>

      {orders.length === 0 ? (
        <section className="orders-empty">
          <div className="empty-order-mark">AÚN</div>

          <p className="orders-empty-eyebrow">YOUR ORDER HISTORY</p>

          <h2>No orders yet.</h2>

          <p>
            You haven't placed any orders yet.
            <br />
            Discover something you love at aún.
          </p>

          <Link to="/home" className="orders-primary-button">
            Explore Collection
          </Link>
        </section>
      ) : (
        <section className="orders-list">
          <div className="orders-list-header">
            <span className="orders-count">
              {orders.length}{" "}
              {orders.length === 1 ? "ORDER" : "ORDERS"}
            </span>

            <span className="orders-list-note">
              YOUR PURCHASE HISTORY
            </span>
          </div>

          {orders.map((order) => (
            <article
              className="order-card"
              key={order.orderId}
            >
              <div className="order-card-header">
                <div>
                  <span className="order-label">
                    ORDER ID
                  </span>

                  <h2>#{order.orderId}</h2>
                </div>

                <span
                  className={`order-status status-${String(
                    order.orderStatus || ""
                  ).toLowerCase()}`}
                >
                  {formatStatus(order.orderStatus)}
                </span>
              </div>

              <div className="order-card-details">
                <div className="order-detail-block">
                  <span className="order-label">
                    ORDER DATE
                  </span>

                  <p>{formatDate(order.createdAt)}</p>
                </div>

                <div className="order-detail-block">
                  <span className="order-label">
                    TOTAL AMOUNT
                  </span>

                  <p>
                    ₹{formatAmount(order.totalAmount)}
                  </p>
                </div>

                <div className="order-detail-block">
                  <span className="order-label">
                    PAYMENT METHOD
                  </span>

                  <p>
                    {order.paymentMethod || "—"}
                  </p>
                </div>

                <div className="order-detail-block">
                  <span className="order-label">
                    PAYMENT STATUS
                  </span>

                  <p
                    className={`payment-status payment-${String(
                      order.paymentStatus || ""
                    ).toLowerCase()}`}
                  >
                    {formatStatus(order.paymentStatus)}
                  </p>
                </div>
              </div>

              {order.items?.length > 0 && (
                <div className="order-items-preview">
                  <div className="order-items-heading">
                    <span className="order-label">
                      ITEMS
                    </span>

                    <span className="item-count">
                      {order.items.length}{" "}
                      {order.items.length === 1
                        ? "ITEM"
                        : "ITEMS"}
                    </span>
                  </div>

                  <div className="order-items-list">
                    {order.items.map((item, index) => (
                      <div
                        className="order-item-preview"
                        key={item.orderItemId || index}
                      >
                        <div className="order-item-number">
                          {String(index + 1).padStart(2, "0")}
                        </div>

                        <div className="order-item-info">
                          <p className="order-item-name">
                            {item.productName}
                          </p>

                          <p className="order-item-meta">
                            Size: {item.selectedSize || "—"}
                            {" · "}
                            Color: {item.selectedColor || "—"}
                            {" · "}
                            Qty: {item.quantity}
                          </p>
                        </div>

                        <p className="order-item-subtotal">
                          ₹{formatAmount(item.subtotal)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="order-card-actions">
                <Link
                  to={`/orders/${order.orderId}`}
                  className="order-details-button"
                >
                  <span>View Order Details</span>
                  <span className="order-details-arrow">
                    →
                  </span>
                </Link>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
