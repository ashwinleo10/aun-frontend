import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit3,
  Plus,
  CheckCircle2,
  XCircle,
  Menu,
  X,
  LayoutDashboard,
  Tags,
  Package,
  ShoppingBag,
  Users,
  Store,
  LogOut,
} from "lucide-react";

import {
  getAdminProducts,
  deactivateProduct,
  activateProduct,
} from "../../services/adminProductService";

import "../../assets/admin.css";
import "../../assets/admin-products.css";

export default function AdminProducts() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      setLoading(true);
      setError("");

      const data = await getAdminProducts();
      setProducts(data);
    } catch (err) {
      setError(err.message || "Unable to load products.");
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

  async function handleDeactivate(productId) {
    const confirmed = window.confirm(
      "Are you sure you want to deactivate this product?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deactivateProduct(productId);

      await loadProducts();
    } catch (err) {
      setError(err.message || "Unable to deactivate product.");
    }
  }

  async function handleActivate(productId) {
    const confirmed = window.confirm(
      "Are you sure you want to activate this product?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await activateProduct(productId);

      await loadProducts();
    } catch (err) {
      setError(err.message || "Unable to activate product.");
    }
  }

  const filteredProducts = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !search ||
        product.productName?.toLowerCase().includes(search) ||
        product.categoryName?.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && product.active === true) ||
        (statusFilter === "INACTIVE" && product.active === false);

      return matchesSearch && matchesStatus;
    });
  }, [products, searchTerm, statusFilter]);

  function formatPrice(price) {
    if (price === null || price === undefined) {
      return "—";
    }

    return `₹${Number(price).toLocaleString("en-IN")}`;
  }

  function getStockClass(stock) {
    if (stock === 0) {
      return "stock-out";
    }

    if (stock <= 5) {
      return "stock-low";
    }

    return "stock-good";
  }

  function getStockLabel(stock) {
    if (stock === 0) {
      return "Out of stock";
    }

    if (stock <= 5) {
      return "Low stock";
    }

    return `${stock} units`;
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

          <p className="admin-brand-label">ADMIN PANEL</p>

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
            className="admin-nav-link admin-nav-link-active"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Package size={18} />
            <span>Products</span>
          </Link>

          <Link
            to="/admin/orders"
            className="admin-nav-link"
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
          <Link to="/admin" className="admin-mobile-logo">
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
              <p className="admin-topbar-label">AÚN / ADMIN</p>
              <h1>Products</h1>
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
                {sessionStorage.getItem("username") || "Admin"}
              </span>

              <span className="admin-user-role">
                Administrator
              </span>
            </div>
          </div>
        </header>

        {/* Products content */}
        <section className="admin-products-content">
          <div className="admin-products-heading">
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
                PRODUCT MANAGEMENT
              </p>

              <h2>Products</h2>

              <p>
                Manage your product catalogue, pricing, stock and
                availability.
              </p>
            </div>

            <button
              type="button"
              className="admin-add-product-btn"
              onClick={() => navigate("/admin/products/add")}
            >
              <Plus size={17} />
              Add Product
            </button>
          </div>

          {error && (
            <div className="admin-products-error">
              <XCircle size={17} />
              <span>{error}</span>
            </div>
          )}

          {/* Search + filters */}
          <section className="admin-products-toolbar">
            <div className="admin-product-search">
              <input
                type="text"
                placeholder="Search products or categories..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
              />
            </div>

            <div className="admin-product-filters">
              <button
                type="button"
                className={statusFilter === "ALL" ? "active" : ""}
                onClick={() => setStatusFilter("ALL")}
              >
                All
              </button>

              <button
                type="button"
                className={
                  statusFilter === "ACTIVE" ? "active" : ""
                }
                onClick={() => setStatusFilter("ACTIVE")}
              >
                Active
              </button>

              <button
                type="button"
                className={
                  statusFilter === "INACTIVE" ? "active" : ""
                }
                onClick={() => setStatusFilter("INACTIVE")}
              >
                Inactive
              </button>
            </div>
          </section>

          <div className="admin-products-summary">
            <span>
              Showing{" "}
              <strong>{filteredProducts.length}</strong> of{" "}
              <strong>{products.length}</strong> products
            </span>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="admin-products-loading">
              <div className="admin-loading-spinner" />
              <p>Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            /* Empty */
            <div className="admin-products-empty">
              <Package size={38} />

              <h3>No products found</h3>

              <p>
                {searchTerm || statusFilter !== "ALL"
                  ? "Try changing your search or filter."
                  : "Your product catalogue is currently empty."}
              </p>

              {!searchTerm && statusFilter === "ALL" && (
                <button
                  type="button"
                  onClick={() =>
                    navigate("/admin/products/add")
                  }
                >
                  <Plus size={16} />
                  Add Product
                </button>
              )}
            </div>
          ) : (
            /* Product table */
            <div className="admin-products-table-wrapper">
              <table className="admin-products-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.productId}>
                      {/* Product */}
                      <td>
                        <div className="admin-product-name-cell">
                          <div className="admin-product-image">
                            {product.imageUrls?.length > 0 ? (
                              <img
                                src={product.imageUrls[0]}
                                alt={product.productName}
                                onError={(event) => {
                                  event.currentTarget.style.display =
                                    "none";
                                }}
                              />
                            ) : (
                              <Package size={20} />
                            )}
                          </div>

                          <div>
                            <span className="admin-product-name">
                              {product.productName}
                            </span>

                            <span className="admin-product-id">
                              ID #{product.productId}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td>
                        <span className="admin-category-name">
                          {product.categoryName || "—"}
                        </span>
                      </td>

                      {/* Price */}
                      <td>
                        <div className="admin-product-price">
                          {product.discountPrice &&
                          Number(product.discountPrice) <
                            Number(product.price) ? (
                            <>
                              <span className="admin-discount-price">
                                {formatPrice(
                                  product.discountPrice
                                )}
                              </span>

                              <span className="admin-original-price">
                                {formatPrice(product.price)}
                              </span>
                            </>
                          ) : (
                            <span>
                              {formatPrice(product.price)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Stock */}
                      <td>
                        <span
                          className={`admin-stock ${getStockClass(
                            product.stockQuantity
                          )}`}
                        >
                          {getStockLabel(
                            product.stockQuantity
                          )}
                        </span>
                      </td>

                      {/* Status */}
                      <td>
                        {product.active ? (
                          <span className="admin-status active">
                            <CheckCircle2 size={14} />
                            Active
                          </span>
                        ) : (
                          <span className="admin-status inactive">
                            <XCircle size={14} />
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="admin-product-actions">
                          <button
                            type="button"
                            className="admin-edit-btn"
                            onClick={() =>
                              navigate(
                                `/admin/products/edit/${product.productId}`
                              )
                            }
                          >
                            <Edit3 size={15} />
                            Edit
                          </button>

                          {product.active ? (
                            <button
                              type="button"
                              className="admin-deactivate-btn"
                              onClick={() =>
                                handleDeactivate(
                                  product.productId
                                )
                              }
                            >
                              Deactivate
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="admin-activate-btn"
                              onClick={() =>
                                handleActivate(
                                  product.productId
                                )
                              }
                            >
                              Activate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer className="admin-footer">
          <span>© {new Date().getFullYear()} aún.</span>
          <span>Admin Panel</span>
        </footer>
      </main>
    </div>
  );
}