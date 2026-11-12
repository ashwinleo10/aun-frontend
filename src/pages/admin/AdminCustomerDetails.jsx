import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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
  ShoppingCart,
} from "lucide-react";

import {
  getAdminCustomerById,
  activateAdminCustomer,
  deactivateAdminCustomer,
} from "../../services/adminCustomerService";

import "../../assets/admin.css";
import "../../assets/admin-customer-details.css";

export default function AdminCustomerDetails() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [actionLoading, setActionLoading] =
    useState(false);

  const [successMessage, setSuccessMessage] =
    useState("");

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  useEffect(() => {
    loadCustomer();
  }, [userId]);

  async function loadCustomer() {
    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");

      const data =
        await getAdminCustomerById(userId);

      setCustomer(data);
    } catch (err) {
      setError(
        err.message ||
          "Unable to load customer details."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleCustomer() {
    if (!customer) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");
      setSuccessMessage("");

      let updatedCustomer;

      if (customer.active) {
        updatedCustomer =
          await deactivateAdminCustomer(
            customer.userId
          );
      } else {
        updatedCustomer =
          await activateAdminCustomer(
            customer.userId
          );
      }

      setCustomer((currentCustomer) => ({
        ...currentCustomer,
        active:
          updatedCustomer.active,
        updatedAt:
          updatedCustomer.updatedAt,
      }));

      setSuccessMessage(
        updatedCustomer.active
          ? `${updatedCustomer.username} has been activated.`
          : `${updatedCustomer.username} has been deactivated.`
      );
    } catch (err) {
      setError(
        err.message ||
          "Unable to update customer status."
      );
    } finally {
      setActionLoading(false);
    }
  }

  function handleLogout() {
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("email");

    setMobileMenuOpen(false);

    navigate("/login", {
      replace: true,
    });
  }

  function handleBackToCustomers() {
    setMobileMenuOpen(false);
    navigate("/admin/customers");
  }

  function formatDate(dateValue) {
    if (!dateValue) {
      return "—";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  function formatPrice(amount) {
    if (
      amount === null ||
      amount === undefined
    ) {
      return "₹0.00";
    }

    return `₹${Number(amount).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  }

  function getInitial(username) {
    if (!username) {
      return "A";
    }

    return username
      .charAt(0)
      .toUpperCase();
  }

  return (
    <div className="admin-layout">

      {/* MOBILE OVERLAY */}
      {mobileMenuOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={() =>
            setMobileMenuOpen(false)
          }
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`admin-sidebar ${
          mobileMenuOpen
            ? "admin-sidebar-open"
            : ""
        }`}
      >

        <div className="admin-brand-area">

          <Link
            to="/admin"
            className="admin-brand"
            onClick={() =>
              setMobileMenuOpen(false)
            }
          >
            aún<span>.</span>
          </Link>

          <p className="admin-brand-label">
            ADMIN PANEL
          </p>

          <button
            type="button"
            className="admin-close-button"
            onClick={() =>
              setMobileMenuOpen(false)
            }
            aria-label="Close menu"
          >
            <X size={20} />
          </button>

        </div>

        <nav className="admin-navigation">

          <Link
            to="/admin"
            className="admin-nav-link"
            onClick={() =>
              setMobileMenuOpen(false)
            }
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/admin/categories"
            className="admin-nav-link"
            onClick={() =>
              setMobileMenuOpen(false)
            }
          >
            <Tags size={18} />
            <span>Categories</span>
          </Link>

          <Link
            to="/admin/products"
            className="admin-nav-link"
            onClick={() =>
              setMobileMenuOpen(false)
            }
          >
            <Package size={18} />
            <span>Products</span>
          </Link>

          <Link
            to="/admin/orders"
            className="admin-nav-link"
            onClick={() =>
              setMobileMenuOpen(false)
            }
          >
            <ShoppingBag size={18} />
            <span>Orders</span>
          </Link>

          <Link
            to="/admin/customers"
            className="admin-nav-link admin-nav-link-active"
            onClick={() =>
              setMobileMenuOpen(false)
            }
          >
            <Users size={18} />
            <span>Customers</span>
          </Link>

        </nav>

        <div className="admin-sidebar-bottom">

          <Link
            to="/home"
            className="admin-nav-link admin-store-link"
            onClick={() =>
              setMobileMenuOpen(false)
            }
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

      {/* MAIN CONTENT */}
      <main className="admin-main">

        {/* MOBILE HEADER */}
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
            onClick={() =>
              setMobileMenuOpen(true)
            }
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

        </div>

        {/* TOP BAR */}
        <header className="admin-topbar">

          <div>

            <p className="admin-topbar-label">
              AÚN / ADMIN
            </p>

            <h1>
              Customer Details
            </h1>

          </div>

          <div className="admin-user">

            <div className="admin-user-avatar">
              {(
                sessionStorage.getItem(
                  "username"
                ) || "A"
              )
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="admin-user-info">

              <span className="admin-user-name">
                {sessionStorage.getItem(
                  "username"
                ) || "Admin"}
              </span>

              <span className="admin-user-role">
                Administrator
              </span>

            </div>

          </div>

        </header>

        {/* CUSTOMER DETAILS */}
        <section className="admin-customer-details-content">

          {/* BACK BUTTON */}
          <div className="admin-customer-back-wrapper">

            <button
              type="button"
              className="admin-customer-back-button"
              onClick={
                handleBackToCustomers
              }
            >
              <ArrowLeft size={16} />
              <span>
                Back to Customers
              </span>
            </button>

          </div>

          {loading ? (

            <div className="admin-customer-details-loading">

              <div className="admin-loading-spinner" />

              <p>
                Loading customer details...
              </p>

            </div>

          ) : error ? (

            <div className="admin-customer-details-error">

              <h3>
                Unable to load customer
              </h3>

              <p>
                {error}
              </p>

              <button
                type="button"
                className="admin-customer-back-button"
                onClick={
                  handleBackToCustomers
                }
              >
                <ArrowLeft size={16} />
                Back to Customers
              </button>

            </div>

          ) : customer ? (

            <>

              {/* PAGE INTRO */}
              <div className="admin-customer-details-heading">

                <p className="admin-section-eyebrow">
                  CUSTOMER DETAILS
                </p>

                <h2>
                  {customer.username}
                </h2>

                <p>
                  Customer #{customer.userId}
                </p>

              </div>

              {/* SUCCESS */}
              {successMessage && (
                <div className="admin-success-message">
                  <span>
                    {successMessage}
                  </span>
                </div>
              )}

              {/* PROFILE CARD */}
              <section className="admin-customer-profile-card">

                <div className="admin-customer-profile-top">

                  <div className="admin-customer-avatar-large">
                    {getInitial(
                      customer.username
                    )}
                  </div>

                  <div className="admin-customer-profile-name">

                    <h3>
                      {customer.username}
                    </h3>

                    <span>
                      {customer.role}
                    </span>

                  </div>

                  <div className="admin-customer-details-status-area">

                    <span
                      className={`admin-customer-status ${
                        customer.active
                          ? "active"
                          : "inactive"
                      }`}
                    >
                      <span className="admin-customer-status-dot" />

                      {customer.active
                        ? "Active"
                        : "Inactive"}
                    </span>

                    <button
                      type="button"
                      className={`admin-customer-status-button ${
                        customer.active
                          ? "deactivate"
                          : "activate"
                      }`}
                      disabled={
                        actionLoading
                      }
                      onClick={
                        handleToggleCustomer
                      }
                    >
                      {actionLoading
                        ? "Updating..."
                        : customer.active
                        ? "Deactivate"
                        : "Activate"}
                    </button>

                  </div>

                </div>

                <div className="admin-customer-profile-divider" />

                <div className="admin-customer-info-grid">

                  <div className="admin-customer-info-item">

                    <span>
                      CUSTOMER ID
                    </span>

                    <strong>
                      #{customer.userId}
                    </strong>

                  </div>

                  <div className="admin-customer-info-item">

                    <span>
                      EMAIL
                    </span>

                    <strong>
                      {customer.email}
                    </strong>

                  </div>

                  <div className="admin-customer-info-item">

                    <span>
                      ROLE
                    </span>

                    <strong>
                      {customer.role}
                    </strong>

                  </div>

                  <div className="admin-customer-info-item">

                    <span>
                      JOINED
                    </span>

                    <strong>
                      {formatDate(
                        customer.createdAt
                      )}
                    </strong>

                  </div>

                </div>

              </section>

              {/* STATISTICS */}
              <section className="admin-customer-stats">

                <div className="admin-customer-stat-card">

                  <span>
                    TOTAL ORDERS
                  </span>

                  <strong>
                    {customer.totalOrders ||
                      0}
                  </strong>

                </div>

                <div className="admin-customer-stat-card">

                  <span>
                    TOTAL SPENT
                  </span>

                  <strong>
                    {formatPrice(
                      customer.totalSpent
                    )}
                  </strong>

                </div>

                <div className="admin-customer-stat-card">

                  <span>
                    PAID ORDERS
                  </span>

                  <strong>
                    {customer.orders
                      ? customer.orders.filter(
                          (order) =>
                            order.paymentStatus ===
                            "PAID"
                        ).length
                      : 0}
                  </strong>

                </div>

                <div className="admin-customer-stat-card">

                  <span>
                    ACCOUNT CREATED
                  </span>

                  <strong>
                    {formatDate(
                      customer.createdAt
                    )}
                  </strong>

                </div>

              </section>

              {/* ORDER HISTORY */}
              <section className="admin-customer-orders-section">

                <div className="admin-customer-orders-heading">

                  <div>

                    <p className="admin-section-eyebrow">
                      ORDER HISTORY
                    </p>

                    <h3>
                      Customer Orders
                    </h3>

                  </div>

                  <span>
                    {customer.totalOrders ||
                      0}{" "}
                    orders
                  </span>

                </div>

                {customer.orders &&
                customer.orders.length >
                  0 ? (

                  <div className="admin-customer-orders-table-wrapper">

                    <table className="admin-customer-orders-table">

                      <thead>
                        <tr>
                          <th>
                            ORDER
                          </th>

                          <th>
                            DATE
                          </th>

                          <th>
                            TOTAL
                          </th>

                          <th>
                            ORDER STATUS
                          </th>

                          <th>
                            PAYMENT
                          </th>

                          <th>
                            METHOD
                          </th>

                          <th>
                            ACTION
                          </th>
                        </tr>
                      </thead>

                      <tbody>

                        {customer.orders.map(
                          (order) => (
                            <tr
                              key={
                                order.orderId
                              }
                            >

                              <td>
                                <strong>
                                  #
                                  {
                                    order.orderId
                                  }
                                </strong>
                              </td>

                              <td>
                                {formatDate(
                                  order.createdAt
                                )}
                              </td>

                              <td>
                                <strong>
                                  {formatPrice(
                                    order.totalAmount
                                  )}
                                </strong>
                              </td>

                              <td>
                                <span
                                  className={`admin-customer-order-status ${order.orderStatus?.toLowerCase()}`}
                                >
                                  {
                                    order.orderStatus
                                  }
                                </span>
                              </td>

                              <td>
                                <span
                                  className={`admin-customer-payment-status ${order.paymentStatus?.toLowerCase()}`}
                                >
                                  {
                                    order.paymentStatus
                                  }
                                </span>
                              </td>

                              <td>
                                {
                                  order.paymentMethod
                                }
                              </td>

                              <td>

                                <button
                                  type="button"
                                  className="admin-customer-order-view-button"
                                  onClick={() =>
                                    navigate(
                                      `/admin/orders/${order.orderId}`
                                    )
                                  }
                                >
                                  View
                                </button>

                              </td>

                            </tr>
                          )
                        )}

                      </tbody>

                    </table>

                  </div>

                ) : (

                  <div className="admin-customer-orders-empty">

                    <ShoppingCart size={38} />

                    <h3>
                      No orders yet
                    </h3>

                    <p>
                      This customer has not
                      placed any orders.
                    </p>

                  </div>

                )}

              </section>

            </>

          ) : null}

        </section>

        {/* FOOTER */}
        <footer className="admin-footer">

          <span>
            ©{" "}
            {new Date().getFullYear()}{" "}
            aún.
          </span>

          <span>
            Admin Panel
          </span>

        </footer>

      </main>

    </div>
  );
}