import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  LayoutDashboard,
  Tags,
  Package,
  ShoppingBag,
  Users,
  Store,
  LogOut,
  UserCheck,
  UserX,
} from "lucide-react";

import {
  getAdminCustomers,
  activateAdminCustomer,
  deactivateAdminCustomer,
} from "../../services/adminCustomerService";

import "../../assets/admin.css";
import "../../assets/admin-customers.css";

export default function AdminCustomers() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [actionLoadingId, setActionLoadingId] =
    useState(null);

  const [successMessage, setSuccessMessage] =
    useState("");

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    try {
      setLoading(true);
      setError("");

      const data =
        await getAdminCustomers();

      setCustomers(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      setError(
        err.message ||
          "Unable to load customers."
      );
    } finally {
      setLoading(false);
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

  function handleViewCustomer(userId) {
    setMobileMenuOpen(false);

    navigate(
      `/admin/customers/${userId}`
    );
  }

  async function handleToggleCustomer(customer) {
    try {
      setActionLoadingId(
        customer.userId
      );

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

      setCustomers((currentCustomers) =>
        currentCustomers.map(
          (currentCustomer) =>
            currentCustomer.userId ===
            updatedCustomer.userId
              ? updatedCustomer
              : currentCustomer
        )
      );

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
      setActionLoadingId(null);
    }
  }

  function formatDate(dateValue) {
    if (!dateValue) {
      return "—";
    }

    const date = new Date(
      dateValue
    );

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
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

  const filteredCustomers =
    useMemo(() => {
      const value =
        searchTerm
          .trim()
          .toLowerCase();

      if (!value) {
        return customers;
      }

      return customers.filter(
        (customer) =>
          String(
            customer.userId
          )
            .toLowerCase()
            .includes(value) ||
          customer.username
            ?.toLowerCase()
            .includes(value) ||
          customer.email
            ?.toLowerCase()
            .includes(value)
      );
    }, [
      customers,
      searchTerm,
    ]);

  const activeCustomers =
    customers.filter(
      (customer) =>
        customer.active
    ).length;

  const inactiveCustomers =
    customers.filter(
      (customer) =>
        !customer.active
    ).length;

  return (
    <div className="admin-layout">

      {/* MOBILE OVERLAY */}
      {mobileMenuOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={() =>
            setMobileMenuOpen(
              false
            )
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
              setMobileMenuOpen(
                false
              )
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
              setMobileMenuOpen(
                false
              )
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
              setMobileMenuOpen(
                false
              )
            }
          >
            <LayoutDashboard
              size={18}
            />
            <span>
              Dashboard
            </span>
          </Link>

          <Link
            to="/admin/categories"
            className="admin-nav-link"
            onClick={() =>
              setMobileMenuOpen(
                false
              )
            }
          >
            <Tags size={18} />
            <span>
              Categories
            </span>
          </Link>

          <Link
            to="/admin/products"
            className="admin-nav-link"
            onClick={() =>
              setMobileMenuOpen(
                false
              )
            }
          >
            <Package
              size={18}
            />
            <span>
              Products
            </span>
          </Link>

          <Link
            to="/admin/orders"
            className="admin-nav-link"
            onClick={() =>
              setMobileMenuOpen(
                false
              )
            }
          >
            <ShoppingBag
              size={18}
            />
            <span>
              Orders
            </span>
          </Link>

          <Link
            to="/admin/customers"
            className="admin-nav-link admin-nav-link-active"
            onClick={() =>
              setMobileMenuOpen(
                false
              )
            }
          >
            <Users size={18} />
            <span>
              Customers
            </span>
          </Link>

        </nav>

        <div className="admin-sidebar-bottom">

          <Link
            to="/home"
            className="admin-nav-link admin-store-link"
            onClick={() =>
              setMobileMenuOpen(
                false
              )
            }
          >
            <Store size={18} />
            <span>
              View Store
            </span>
          </Link>

          <button
            type="button"
            className="admin-nav-link admin-logout-button"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>
              Logout
            </span>
          </button>

        </div>

      </aside>

      {/* MAIN */}
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
              setMobileMenuOpen(
                true
              )
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
              Customers
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

        {/* CONTENT */}
        <section className="admin-content">

          {/* PAGE HEADER */}
          <div className="admin-page-header">

            <div>

              <p className="admin-section-eyebrow">
                CUSTOMER MANAGEMENT
              </p>

              <h2>
                Customers
              </h2>

              <p className="admin-page-description">
                View and manage registered
                customers.
              </p>

            </div>

          </div>

          {/* SUCCESS */}
          {successMessage && (
            <div className="admin-success-message">
              <UserCheck size={17} />
              <span>
                {successMessage}
              </span>
            </div>
          )}

          {/* ERROR */}
          {error && (
            <div className="admin-error-message">
              <UserX size={17} />
              <span>
                {error}
              </span>
            </div>
          )}

          {/* STATS */}
          <div className="admin-customer-summary">

            <div className="admin-customer-summary-card">

              <span>
                TOTAL CUSTOMERS
              </span>

              <strong>
                {customers.length}
              </strong>

            </div>

            <div className="admin-customer-summary-card">

              <span>
                ACTIVE
              </span>

              <strong>
                {activeCustomers}
              </strong>

            </div>

            <div className="admin-customer-summary-card">

              <span>
                INACTIVE
              </span>

              <strong>
                {inactiveCustomers}
              </strong>

            </div>

            <div className="admin-customer-summary-card">

              <span>
                SHOWING
              </span>

              <strong>
                {filteredCustomers.length}
              </strong>

            </div>

          </div>

          {/* SEARCH */}
          <div className="admin-customer-toolbar">

            <div className="admin-customer-search">

              <input
                type="text"
                placeholder="Search by ID, username or email..."
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(
                    e.target.value
                  )
                }
              />

            </div>

          </div>

          {/* TABLE */}
          {loading ? (

            <div className="admin-customer-loading">
              <div className="admin-loading-spinner" />
              <p>
                Loading customers...
              </p>
            </div>

          ) : filteredCustomers.length ===
            0 ? (

            <div className="admin-customer-empty">

              <Users size={38} />

              <h3>
                No customers found
              </h3>

              <p>
                Try changing your
                search.
              </p>

            </div>

          ) : (

            <div className="admin-customer-table-wrapper">

              <table className="admin-customer-table">

                <thead>

                  <tr>
                    <th>
                      CUSTOMER
                    </th>

                    <th>
                      EMAIL
                    </th>

                    <th>
                      CUSTOMER ID
                    </th>

                    <th>
                      STATUS
                    </th>

                    <th>
                      JOINED
                    </th>

                    <th>
                      LAST UPDATED
                    </th>

                    <th>
                      ACTION
                    </th>
                  </tr>

                </thead>

                <tbody>

                  {filteredCustomers.map(
                    (customer) => {

                      const isUpdating =
                        actionLoadingId ===
                        customer.userId;

                      return (
                        <tr
                          key={
                            customer.userId
                          }
                        >

                          {/* CUSTOMER */}
                          <td>

                            <div className="admin-customer-name-cell">

                              <div className="admin-customer-avatar-small">
                                {customer.username
                                  ?.charAt(
                                    0
                                  )
                                  .toUpperCase()}
                              </div>

                              <div>

                                <strong>
                                  {
                                    customer.username
                                  }
                                </strong>

                                <span>
                                  Customer
                                </span>

                              </div>

                            </div>

                          </td>

                          {/* EMAIL */}
                          <td>
                            {
                              customer.email
                            }
                          </td>

                          {/* ID */}
                          <td>
                            <strong>
                              #
                              {
                                customer.userId
                              }
                            </strong>
                          </td>

                          {/* STATUS */}
                          <td>

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

                          </td>

                          {/* JOINED */}
                          <td>
                            {formatDate(
                              customer.createdAt
                            )}
                          </td>

                          {/* UPDATED */}
                          <td>
                            {formatDate(
                              customer.updatedAt
                            )}
                          </td>

                          {/* ACTION */}
                          <td>

                            <div className="admin-customer-actions">

                              <button
                                type="button"
                                className="admin-view-customer-btn"
                                onClick={() =>
                                  handleViewCustomer(
                                    customer.userId
                                  )
                                }
                              >
                                View
                              </button>

                              <button
                                type="button"
                                className={`admin-customer-status-button ${
                                  customer.active
                                    ? "deactivate"
                                    : "activate"
                                }`}
                                disabled={
                                  isUpdating
                                }
                                onClick={() =>
                                  handleToggleCustomer(
                                    customer
                                  )
                                }
                              >
                                {isUpdating
                                  ? "Updating..."
                                  : customer.active
                                  ? "Deactivate"
                                  : "Activate"}
                              </button>

                            </div>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

          )}

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