import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Menu,
  X,
  LayoutDashboard,
  Tags,
  Package,
  ShoppingBag,
  Users,
  Store,
  LogOut,
  Eye,
  Clock3,
  CheckCircle2,
  XCircle,
  Truck,
  PackageCheck,
} from "lucide-react";

import { getAdminOrders } from "../../services/adminOrderService";

import "../../assets/admin.css";
import "../../assets/admin-orders.css";

export default function AdminOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      setLoading(true);
      setError("");

      const data = await getAdminOrders();
      setOrders(data);
    } catch (err) {
      setError(err.message || "Unable to load orders.");
    } finally {
      setLoading(false);
    }
  }

  function handleBackToDashboard() {
    setMobileMenuOpen(false);
    navigate("/admin");
  }

  function handleLogout() {
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("email");

    setMobileMenuOpen(false);
    navigate("/login", { replace: true });
  }

  const filteredOrders = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !search ||
        String(order.orderId).includes(search) ||
        String(order.userId).includes(search) ||
        order.paymentMethod?.toLowerCase().includes(search) ||
        order.orderStatus?.toLowerCase().includes(search) ||
        order.paymentStatus?.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "ALL" ||
        order.orderStatus === statusFilter;

      const matchesPayment =
        paymentFilter === "ALL" ||
        order.paymentStatus === paymentFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPayment
      );
    });
  }, [
    orders,
    searchTerm,
    statusFilter,
    paymentFilter,
  ]);

  function formatPrice(amount) {
    if (amount === null || amount === undefined) {
      return "—";
    }

    return `₹${Number(amount).toLocaleString("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  }

  function formatDate(dateValue) {
    if (!dateValue) {
      return "—";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatTime(dateValue) {
    if (!dateValue) {
      return "";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getOrderStatusIcon(status) {
    switch (status) {
      case "PLACED":
        return <Clock3 size={14} />;

      case "CONFIRMED":
        return <CheckCircle2 size={14} />;

      case "SHIPPED":
        return <Truck size={14} />;

      case "DELIVERED":
        return <PackageCheck size={14} />;

      case "CANCELLED":
        return <XCircle size={14} />;

      default:
        return <Clock3 size={14} />;
    }
  }

  function getOrderStatusClass(status) {
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
        return "pending";
    }
  }

  function getPaymentStatusClass(status) {
    switch (status) {
      case "PAID":
        return "paid";

      case "FAILED":
        return "failed";

      case "REFUNDED":
        return "refunded";

      case "PENDING":
        return "payment-pending";

      default:
        return "payment-pending";
    }
  }

  function getItemCount(order) {
    if (!order.items || order.items.length === 0) {
      return 0;
    }

    return order.items.reduce(
      (total, item) => total + Number(item.quantity || 0),
      0
    );
  }

  return (
    <div className="admin-layout">
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`admin-sidebar ${
          mobileMenuOpen ? "admin-sidebar-open" : ""
        }`}
      >
        <div className="admin-brand-area">
          <Link to="/admin" className="admin-brand">
            aún<span>.</span>
          </Link>

          <p className="admin-brand-label">
            ADMIN PANEL
          </p>

          <button
            type="button"
            className="admin-close-button"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={21} />
          </button>
        </div>

        <nav className="admin-navigation">
          <Link
            to="/admin"
            className="admin-nav-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/admin/categories"
            className="admin-nav-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Tags size={18} />
            <span>Categories</span>
          </Link>

          <Link
            to="/admin/products"
            className="admin-nav-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Package size={18} />
            <span>Products</span>
          </Link>

          <Link
            to="/admin/orders"
            className="admin-nav-link admin-nav-link-active"
            onClick={() => setMobileMenuOpen(false)}
          >
            <ShoppingBag size={18} />
            <span>Orders</span>
          </Link>

          <Link
            to="/admin/customers"
            className="admin-nav-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Users size={18} />
            <span>Customers</span>
          </Link>
        </nav>

        <div className="admin-sidebar-bottom">
          <Link
            to="/home"
            className="admin-nav-link admin-store-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Store size={18} />
            <span>View Store</span>
          </Link>

          <button
            type="button"
            className="admin-nav-link admin-logout-button"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="admin-main">
        {/* Mobile header */}
        <div className="admin-mobile-header">
          <Link
            to="/admin"
            className="admin-mobile-logo"
          >
            aún<span>.</span>
          </Link>

          <button
            type="button"
            className="admin-menu-button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
        </div>

        {/* Top bar */}
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <div>
              <p className="admin-topbar-label">
                AÚN / ADMIN
              </p>

              <h1>Orders</h1>
            </div>
          </div>

          <div className="admin-user">
            <div className="admin-user-avatar">
              {(sessionStorage.getItem("username") || "A")
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="admin-user-info">
              <span className="admin-user-name">
                {sessionStorage.getItem("username") ||
                  "Admin"}
              </span>

              <span className="admin-user-role">
                Administrator
              </span>
            </div>
          </div>
        </header>

        {/* Orders content */}
        <section className="admin-orders-content">
          <div className="admin-orders-heading">
            <div>
              <button
                type="button"
                className="admin-back-link"
                onClick={handleBackToDashboard}
              >
                <ArrowLeft size={15} />
                Back to Dashboard
              </button>

              <p className="admin-section-eyebrow">
                ORDER MANAGEMENT
              </p>

              <h2>Orders</h2>

              <p>
                View and manage customer orders,
                payments and delivery status.
              </p>
            </div>
          </div>

          {error && (
            <div className="admin-orders-error">
              <XCircle size={17} />
              <span>{error}</span>
            </div>
          )}

          {/* Search + filters */}
          <section className="admin-orders-toolbar">
            <div className="admin-order-search">
              <input
                type="text"
                placeholder="Search by order ID, customer ID, status..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
              />
            </div>

            <div className="admin-order-filters">
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
              >
                <option value="ALL">
                  All Order Status
                </option>

                <option value="PLACED">
                  Placed
                </option>

                <option value="CONFIRMED">
                  Confirmed
                </option>

                <option value="SHIPPED">
                  Shipped
                </option>

                <option value="DELIVERED">
                  Delivered
                </option>

                <option value="CANCELLED">
                  Cancelled
                </option>
              </select>

              <select
                value={paymentFilter}
                onChange={(event) =>
                  setPaymentFilter(event.target.value)
                }
              >
                <option value="ALL">
                  All Payments
                </option>

                <option value="PAID">
                  Paid
                </option>

                <option value="PENDING">
                  Pending
                </option>

                <option value="FAILED">
                  Failed
                </option>

                <option value="REFUNDED">
                  Refunded
                </option>
              </select>
            </div>
          </section>

          {/* Summary */}
          <div className="admin-orders-summary">
            <span>
              Showing{" "}
              <strong>
                {filteredOrders.length}
              </strong>{" "}
              of{" "}
              <strong>
                {orders.length}
              </strong>{" "}
              orders
            </span>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="admin-orders-loading">
              <div className="admin-loading-spinner" />
              <p>Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            /* Empty */
            <div className="admin-orders-empty">
              <ShoppingBag size={38} />

              <h3>No orders found</h3>

              <p>
                {searchTerm ||
                statusFilter !== "ALL" ||
                paymentFilter !== "ALL"
                  ? "Try changing your search or filters."
                  : "There are currently no customer orders."}
              </p>
            </div>
          ) : (
            /* Orders table */
            <div className="admin-orders-table-wrapper">
              <table className="admin-orders-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Order Status</th>
                    <th>Payment</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.orderId}>
                      {/* Order */}
                      <td>
                        <div className="admin-order-id-cell">
                          <span className="admin-order-id">
                            #{order.orderId}
                          </span>

                          <span className="admin-order-method">
                            {order.paymentMethod}
                          </span>
                        </div>
                      </td>

                      {/* Customer */}
                      <td>
                        <div className="admin-customer-cell">
                          <span className="admin-customer-id">
                            Customer #{order.userId}
                          </span>

                          <span className="admin-customer-address">
                            {order.shippingAddress
                              ?.split("\n")
                              .find((line) =>
                                line.startsWith("City:")
                              )
                              ?.replace("City:", "")
                              .trim() ||
                              "Address unavailable"}
                          </span>
                        </div>
                      </td>

                      {/* Items */}
                      <td>
                        <span className="admin-order-items-count">
                          {getItemCount(order)}{" "}
                          {getItemCount(order) === 1
                            ? "item"
                            : "items"}
                        </span>
                      </td>

                      {/* Total */}
                      <td>
                        <span className="admin-order-total">
                          {formatPrice(
                            order.totalAmount
                          )}
                        </span>
                      </td>

                      {/* Order status */}
                      <td>
                        <span
                          className={`admin-order-status ${getOrderStatusClass(
                            order.orderStatus
                          )}`}
                        >
                          {getOrderStatusIcon(
                            order.orderStatus
                          )}

                          {order.orderStatus}
                        </span>
                      </td>

                      {/* Payment */}
                      <td>
                        <div className="admin-payment-cell">
                          <span
                            className={`admin-payment-status ${getPaymentStatusClass(
                              order.paymentStatus
                            )}`}
                          >
                            {order.paymentStatus}
                          </span>

                          <span className="admin-payment-method">
                            {order.paymentMethod}
                          </span>
                        </div>
                      </td>

                      {/* Date */}
                      <td>
                        <div className="admin-order-date">
                          <span>
                            {formatDate(
                              order.createdAt
                            )}
                          </span>

                          <span>
                            {formatTime(
                              order.createdAt
                            )}
                          </span>
                        </div>
                      </td>

                      {/* Action */}
                      <td>
                        <button
                          type="button"
                          className="admin-view-order-btn"
                          onClick={() =>
                            navigate(
                              `/admin/orders/${order.orderId}`
                            )
                          }
                        >
                          <Eye size={15} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer className="admin-footer">
          <span>
            © {new Date().getFullYear()} aún.
          </span>

          <span>Admin Panel</span>
        </footer>
      </main>
    </div>
  );
}