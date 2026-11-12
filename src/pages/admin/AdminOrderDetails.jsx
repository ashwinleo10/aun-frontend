import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  LayoutDashboard,
  Tags,
  Package,
  ShoppingBag,
  Users,
  Store,
  LogOut,
  MapPin,
  CreditCard,
  User,
  Calendar,
  Truck,
  CheckCircle,
} from "lucide-react";

import {
  getAdminOrderById,
  updateAdminOrderStatus,
  confirmCodPayment,
} from "../../services/adminOrderService";

import "../../assets/admin.css";
import "../../assets/admin-order-details.css";

export default function AdminOrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [confirmingPayment, setConfirmingPayment] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAdminOrderById(orderId);
      setOrder(data);
    } catch (err) {
      console.error("Failed to load order:", err);
      setError(err.message || "Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (amount) => {
    if (amount == null) {
      return "₹0";
    }

    return `₹${Number(amount).toLocaleString("en-IN")}`;
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatStatus = (status) => {
    if (!status) {
      return "-";
    }

    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getOrderStatusClass = (status) => {
    switch (status) {
      case "PLACED":
        return "placed";

      case "CONFIRMED":
        return "confirmed";

      case "SHIPPED":
        return "shipped";

      case "DELIVERED":
        return "delivered";

      case "CANCELLED":
        return "cancelled";

      default:
        return "";
    }
  };

  const getPaymentStatusClass = (status) => {
    switch (status) {
      case "PAID":
        return "paid";

      case "PENDING":
        return "payment-pending";

      case "FAILED":
        return "failed";

      case "REFUNDED":
        return "refunded";

      default:
        return "";
    }
  };

  const getProductName = (item) => {
    return (
      item.productName ||
      item.name ||
      item.product?.productName ||
      `Product #${item.productId || "-"}`
    );
  };

  const getProductImage = (item) => {
    return (
      item.imageUrl ||
      item.productImage ||
      item.image ||
      item.product?.imageUrl ||
      item.product?.image ||
      null
    );
  };

  const getItemPrice = (item) => {
    return (
      item.price ??
      item.unitPrice ??
      item.productPrice ??
      item.product?.price ??
      0
    );
  };

  const getNextStatus = () => {
    switch (order?.orderStatus) {
      case "PLACED":
        return "CONFIRMED";

      case "CONFIRMED":
        return "SHIPPED";

      case "SHIPPED":
        return "DELIVERED";

      default:
        return null;
    }
  };

  const getNextStatusLabel = () => {
    switch (order?.orderStatus) {
      case "PLACED":
        return "Confirm Order";

      case "CONFIRMED":
        return "Mark as Shipped";

      case "SHIPPED":
        return "Mark as Delivered";

      default:
        return null;
    }
  };

  const canConfirmCodPayment =
    order?.orderStatus === "DELIVERED" &&
    order?.paymentMethod === "COD" &&
    order?.paymentStatus === "PENDING";

  const handleStatusUpdate = async () => {
    const nextStatus = getNextStatus();

    if (!nextStatus || updatingStatus) {
      return;
    }

    try {
      setUpdatingStatus(true);
      setError("");
      setSuccess("");

      const updatedOrder = await updateAdminOrderStatus(
        orderId,
        nextStatus
      );

      setOrder(updatedOrder);

      setSuccess(
        `Order status updated to ${formatStatus(nextStatus)}.`
      );
    } catch (err) {
      console.error("Failed to update order status:", err);

      setError(
        err.message || "Failed to update order status."
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleConfirmCodPayment = async () => {
    if (!canConfirmCodPayment || confirmingPayment) {
      return;
    }

    try {
      setConfirmingPayment(true);
      setError("");
      setSuccess("");

      const updatedOrder = await confirmCodPayment(orderId);

      setOrder(updatedOrder);

      setSuccess(
        "COD payment confirmed successfully."
      );
    } catch (err) {
      console.error(
        "Failed to confirm COD payment:",
        err
      );

      setError(
        err.message ||
          "Failed to confirm COD payment."
      );
    } finally {
      setConfirmingPayment(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="admin-layout">
        <AdminSidebar
          navigate={navigate}
          handleLogout={handleLogout}
        />

        <main className="admin-main">
          <div className="admin-order-details-loading">
            <div className="admin-order-spinner"></div>

            <p>
              Loading order...
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="admin-layout">
        <AdminSidebar
          navigate={navigate}
          handleLogout={handleLogout}
        />

        <main className="admin-main">
          <div className="admin-order-details-page">

            <button
              className="admin-order-back-button"
              onClick={() =>
                navigate("/admin/orders")
              }
            >
              <ArrowLeft size={16} />
              Back to Orders
            </button>

            <div className="admin-order-error">
              {error}
            </div>

          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <AdminSidebar
        navigate={navigate}
        handleLogout={handleLogout}
      />

      <main className="admin-main">

        <div className="admin-order-details-page">

          {/* Back button */}
          <button
            className="admin-order-back-button"
            onClick={() =>
              navigate("/admin/orders")
            }
          >
            <ArrowLeft size={16} />
            Back to Orders
          </button>

          {/* Header */}
          <div className="admin-order-header">

            <div>

              <p className="admin-order-eyebrow">
                ORDER DETAILS
              </p>

              <h1>
                Order #{order.orderId}
              </h1>

              <p className="admin-order-date">
                Placed on{" "}
                {formatDate(order.createdAt)}{" "}
                at{" "}
                {formatTime(order.createdAt)}
              </p>

            </div>

            <div className="admin-order-header-status">

              <span
                className={`admin-order-status ${getOrderStatusClass(
                  order.orderStatus
                )}`}
              >
                {formatStatus(
                  order.orderStatus
                )}
              </span>

              <span
                className={`admin-payment-status ${getPaymentStatusClass(
                  order.paymentStatus
                )}`}
              >
                {formatStatus(
                  order.paymentStatus
                )}
              </span>

            </div>

          </div>

          {/* Success / Error */}
          {success && (
            <div className="admin-order-success">
              <CheckCircle size={18} />
              <span>{success}</span>
            </div>
          )}

          {error && order && (
            <div className="admin-order-error">
              {error}
            </div>
          )}

          {/* Status Management */}
          {getNextStatus() && (
            <section className="admin-order-status-management">

              <div>

                <p className="admin-order-card-label">
                  ORDER STATUS
                </p>

                <h2>
                  Update delivery progress
                </h2>

                <p className="admin-order-status-help">
                  Current status:{" "}
                  <strong>
                    {formatStatus(
                      order.orderStatus
                    )}
                  </strong>
                </p>

              </div>

              <button
                className="admin-order-status-update-button"
                onClick={handleStatusUpdate}
                disabled={updatingStatus}
              >
                {updatingStatus ? (
                  <>
                    <span className="admin-order-button-spinner"></span>
                    Updating...
                  </>
                ) : (
                  <>
                    <Truck size={17} />
                    {getNextStatusLabel()}
                  </>
                )}
              </button>

            </section>
          )}

          {/* Delivered / Cancelled message */}
          {!getNextStatus() && (
            <section className="admin-order-status-complete">

              <CheckCircle size={19} />

              <div>
                <strong>
                  {order.orderStatus === "DELIVERED"
                    ? "Order delivered"
                    : order.orderStatus === "CANCELLED"
                    ? "Order cancelled"
                    : "Order status complete"}
                </strong>

                <p>
                  No further status transition is
                  available for this order.
                </p>
              </div>

            </section>
          )}

          {/* Details grid */}
          <div className="admin-order-details-grid">

            {/* Order Items */}
            <section className="admin-order-details-card admin-order-items-card">

              <div className="admin-order-card-header">

                <div>

                  <p className="admin-order-card-label">
                    ORDER ITEMS
                  </p>

                  <h2>
                    {order.items?.length || 0}{" "}
                    {order.items?.length === 1
                      ? "item"
                      : "items"}
                  </h2>

                </div>

                <Package size={20} />

              </div>

              <div className="admin-order-items">

                {order.items?.map((item, index) => {

                  const imageUrl =
                    getProductImage(item);

                  const quantity =
                    item.quantity ?? 0;

                  const itemPrice =
                    getItemPrice(item);

                  return (
                    <div
                      className="admin-order-item"
                      key={
                        item.orderItemId ||
                        item.productId ||
                        index
                      }
                    >

                      <div className="admin-order-item-image">

                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={getProductName(
                              item
                            )}
                          />
                        ) : (
                          <div className="admin-order-item-placeholder">
                            <Package size={22} />
                          </div>
                        )}

                      </div>

                      <div className="admin-order-item-info">

                        <h3>
                          {getProductName(
                            item
                          )}
                        </h3>

                        <p>
                          Product ID:{" "}
                          {item.productId ||
                            item.product
                              ?.productId ||
                            "-"}
                        </p>

                        <p>
                          Quantity:{" "}
                          {quantity}
                        </p>

                      </div>

                      <div className="admin-order-item-price">

                        <strong>
                          {formatPrice(
                            itemPrice
                          )}
                        </strong>

                        <span>
                          {quantity} ×{" "}
                          {formatPrice(
                            itemPrice
                          )}
                        </span>

                      </div>

                    </div>
                  );
                })}

              </div>

              <div className="admin-order-total">

                <span>
                  Total
                </span>

                <strong>
                  {formatPrice(
                    order.totalAmount
                  )}
                </strong>

              </div>

            </section>

            {/* Customer */}
            <section className="admin-order-details-card">

              <div className="admin-order-card-header">

                <div>

                  <p className="admin-order-card-label">
                    CUSTOMER
                  </p>

                  <h2>
                    Customer #{order.userId}
                  </h2>

                </div>

                <User size={20} />

              </div>

              <div className="admin-order-info-list">

                <div className="admin-order-info-row">

                  <span>
                    Customer ID
                  </span>

                  <strong>
                    #{order.userId}
                  </strong>

                </div>

              </div>

            </section>

            {/* Payment */}
            <section className="admin-order-details-card">

              <div className="admin-order-card-header">

                <div>

                  <p className="admin-order-card-label">
                    PAYMENT
                  </p>

                  <h2>
                    {formatStatus(
                      order.paymentMethod
                    )}
                  </h2>

                </div>

                <CreditCard size={20} />

              </div>

              <div className="admin-order-info-list">

                <div className="admin-order-info-row">

                  <span>
                    Payment Method
                  </span>

                  <strong>
                    {formatStatus(
                      order.paymentMethod
                    )}
                  </strong>

                </div>

                <div className="admin-order-info-row">

                  <span>
                    Payment Status
                  </span>

                  <span
                    className={`admin-payment-status ${getPaymentStatusClass(
                      order.paymentStatus
                    )}`}
                  >
                    {formatStatus(
                      order.paymentStatus
                    )}
                  </span>

                </div>

                {order.razorpayOrderId && (
                  <div className="admin-order-info-row">

                    <span>
                      Razorpay Order ID
                    </span>

                    <strong className="admin-razorpay-id">
                      {order.razorpayOrderId}
                    </strong>

                  </div>
                )}

              </div>

              {/* COD Payment Confirmation */}
              {canConfirmCodPayment && (
                <div className="admin-order-payment-action">

                  <p className="admin-order-status-help">
                    Order delivered. Confirm once the
                    COD payment has been collected.
                  </p>

                  <button
                    className="admin-order-status-update-button"
                    onClick={
                      handleConfirmCodPayment
                    }
                    disabled={
                      confirmingPayment
                    }
                  >
                    {confirmingPayment ? (
                      <>
                        <span className="admin-order-button-spinner"></span>
                        Confirming Payment...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={17} />
                        Mark Payment as Received
                      </>
                    )}
                  </button>

                </div>
              )}

            </section>

            {/* Order Information */}
            <section className="admin-order-details-card">

              <div className="admin-order-card-header">

                <div>

                  <p className="admin-order-card-label">
                    ORDER TIMELINE
                  </p>

                  <h2>
                    Order Information
                  </h2>

                </div>

                <Calendar size={20} />

              </div>

              <div className="admin-order-info-list">

                <div className="admin-order-info-row">

                  <span>
                    Order ID
                  </span>

                  <strong>
                    #{order.orderId}
                  </strong>

                </div>

                <div className="admin-order-info-row">

                  <span>
                    Created
                  </span>

                  <strong>
                    {formatDate(
                      order.createdAt
                    )}
                  </strong>

                </div>

                <div className="admin-order-info-row">

                  <span>
                    Last Updated
                  </span>

                  <strong>
                    {formatDate(
                      order.updatedAt
                    )}
                  </strong>

                </div>

                <div className="admin-order-info-row">

                  <span>
                    Current Status
                  </span>

                  <span
                    className={`admin-order-status ${getOrderStatusClass(
                      order.orderStatus
                    )}`}
                  >
                    {formatStatus(
                      order.orderStatus
                    )}
                  </span>

                </div>

              </div>

            </section>

            {/* Shipping Address */}
            <section className="admin-order-details-card admin-order-address-card">

              <div className="admin-order-card-header">

                <div>

                  <p className="admin-order-card-label">
                    SHIPPING ADDRESS
                  </p>

                  <h2>
                    Delivery Address
                  </h2>

                </div>

                <MapPin size={20} />

              </div>

              <div className="admin-shipping-address">

                {order.shippingAddress ? (
                  order.shippingAddress
                    .split("\n")
                    .map((line, index) => (
                      <p key={index}>
                        {line}
                      </p>
                    ))
                ) : (
                  <p>
                    No shipping address
                    available.
                  </p>
                )}

              </div>

            </section>

          </div>

        </div>

      </main>
    </div>
  );
}

function AdminSidebar({
  navigate,
  handleLogout,
}) {
  return (
    <aside className="admin-sidebar">

      <div className="admin-brand-area">

        <div className="admin-brand-name">
          aún.
        </div>

        <div className="admin-brand-subtitle">
          ADMIN PANEL
        </div>

      </div>

      <nav className="admin-navigation">

        <button
          className="admin-nav-link"
          onClick={() =>
            navigate("/admin")
          }
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </button>

        <button
          className="admin-nav-link"
          onClick={() =>
            navigate("/admin/categories")
          }
        >
          <Tags size={18} />
          <span>Categories</span>
        </button>

        <button
          className="admin-nav-link"
          onClick={() =>
            navigate("/admin/products")
          }
        >
          <Package size={18} />
          <span>Products</span>
        </button>

        <button
          className="admin-nav-link admin-nav-link-active"
          onClick={() =>
            navigate("/admin/orders")
          }
        >
          <ShoppingBag size={18} />
          <span>Orders</span>
        </button>

        <button
          className="admin-nav-link"
          onClick={() =>
            navigate("/admin/customers")
          }
        >
          <Users size={18} />
          <span>Customers</span>
        </button>

      </nav>

      <div className="admin-sidebar-bottom">

        <button
          className="admin-store-link"
          onClick={() =>
            navigate("/")
          }
        >
          <Store size={18} />
          <span>View Store</span>
        </button>

        <button
          className="admin-logout-button"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>

      </div>

    </aside>
  );
}