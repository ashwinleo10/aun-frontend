import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getOrderById } from "../services/orderService";
import "../assets/order-details.css";

export default function OrderDetails() {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getOrderById(orderId);

        setOrder(data);
      } catch (err) {
        setError(err.message || "Unable to load order details.");
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatAmount = (amount) =>
    Number(amount || 0).toLocaleString("en-IN");

  const formatStatus = (status) =>
    status ? status.replaceAll("_", " ") : "—";

  if (loading) {
    return (
      <div className="order-details-message">
        Loading order details...
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-details-message">
        <p>{error || "Order not found."}</p>

        <Link to="/orders">
          Back to My Orders
        </Link>
      </div>
    );
  }

  return (
    <main className="order-details-page">
      <div className="order-details-top">
        <Link to="/orders" className="back-orders-link">
          ← Back to My Orders
        </Link>
      </div>

      <header className="order-details-header">
        <div>
          <p className="order-details-eyebrow">
            ORDER CONFIRMATION
          </p>

          <h1>Order #{order.orderId}</h1>

          <p>
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>

        <span
          className={`order-details-status status-${String(
            order.orderStatus || ""
          ).toLowerCase()}`}
        >
          {formatStatus(order.orderStatus)}
        </span>
      </header>

      <section className="order-details-grid">
        <div className="order-details-main">

          {/* ITEMS */}

          <div className="details-section">
            <div className="section-heading">
              <span>01</span>
              <h2>Items Ordered</h2>
            </div>

            <div className="details-items">
              {order.items?.map((item) => (
                <div
                  className="details-item"
                  key={item.orderItemId}
                >
                  <div className="details-item-image">
                    <span>AÚN</span>
                  </div>

                  <div className="details-item-info">
                    <h3>{item.productName}</h3>

                    <p>
                      Size: {item.selectedSize || "—"}
                    </p>

                    <p>
                      Color: {item.selectedColor || "—"}
                    </p>

                    <p>
                      Quantity: {item.quantity}
                    </p>
                  </div>

                  <div className="details-item-price">
                    <p>
                      ₹{formatAmount(item.unitPrice)}
                    </p>

                    <span>
                      ₹{formatAmount(item.subtotal)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DELIVERY ADDRESS */}

          <div className="details-section">
            <div className="section-heading">
              <span>02</span>
              <h2>Delivery Address</h2>
            </div>

            <div className="delivery-address">
              {order.shippingAddress ? (
                <div className="shipping-address-snapshot">
                  {order.shippingAddress
                    .split("\n")
                    .map((line, index) => {
                      const [label, ...valueParts] =
                        line.split(":");

                      const value =
                        valueParts.join(":").trim();

                      return (
                        <p key={index}>
                          {value ? (
                            <>
                              <strong>
                                {label}:
                              </strong>{" "}
                              {value}
                            </>
                          ) : (
                            line
                          )}
                        </p>
                      );
                    })}
                </div>
              ) : (
                <p>
                  Delivery address unavailable.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ORDER SUMMARY */}

        <aside className="order-summary-card">
          <div className="summary-heading">
            <span>03</span>
            <h2>Order Summary</h2>
          </div>

          <div className="summary-row">
            <span>Subtotal</span>

            <span>
              ₹{formatAmount(order.totalAmount)}
            </span>
          </div>

          <div className="summary-row">
            <span>Shipping</span>

            <span>FREE</span>
          </div>

          <div className="summary-divider" />

          <div className="summary-total">
            <span>Total</span>

            <strong>
              ₹{formatAmount(order.totalAmount)}
            </strong>
          </div>

          <div className="payment-information">
            <p className="summary-label">
              PAYMENT METHOD
            </p>

            <p>
              {order.paymentMethod || "—"}
            </p>

            <p className="summary-label payment-status-label">
              PAYMENT STATUS
            </p>

            <p
              className={`payment-status payment-${String(
                order.paymentStatus || ""
              ).toLowerCase()}`}
            >
              {formatStatus(order.paymentStatus)}
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}
