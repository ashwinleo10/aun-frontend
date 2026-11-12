import React, { useEffect, useState } from "react";
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
  getAdminCategories,
  createCategory,
  updateCategory,
  activateCategory,
  deactivateCategory,
} from "../../services/adminCategoryService";

import "../../assets/admin.css";
import "../../assets/admin-categories.css";

export default function AdminCategories() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const username = sessionStorage.getItem("username");

  // ==========================================================
  // LOAD CATEGORIES
  // ==========================================================

  async function loadCategories() {
    try {
      setLoading(true);
      setError("");

      const data = await getAdminCategories();
      setCategories(data || []);
    } catch (err) {
      setError(err.message || "Unable to load categories.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  // ==========================================================
  // GO TO DASHBOARD
  // ==========================================================

  function handleBackToDashboard() {
    setMobileMenuOpen(false);
    navigate("/admin");
  }

  // ==========================================================
  // ADD CATEGORY
  // ==========================================================

  function handleAddCategory() {
    setEditingCategory(null);
    setCategoryName("");
    setDescription("");
    setMessage("");
    setError("");
    setShowForm(true);
  }

  // ==========================================================
  // EDIT CATEGORY
  // ==========================================================

  function handleEditCategory(category) {
    setEditingCategory(category);
    setCategoryName(category.categoryName || "");
    setDescription(category.description || "");
    setMessage("");
    setError("");
    setShowForm(true);
  }

  // ==========================================================
  // CLOSE FORM
  // ==========================================================

  function handleCloseForm() {
    if (saving) return;

    setShowForm(false);
    setEditingCategory(null);
    setCategoryName("");
    setDescription("");
    setError("");
  }

  // ==========================================================
  // CREATE / UPDATE
  // ==========================================================

  async function handleSubmit(e) {
    e.preventDefault();

    const trimmedName = categoryName.trim();
    const trimmedDescription = description.trim();

    if (!trimmedName) {
      setError("Category name is required.");
      return;
    }

    if (trimmedName.length > 100) {
      setError("Category name cannot exceed 100 characters.");
      return;
    }

    if (trimmedDescription.length > 500) {
      setError("Description cannot exceed 500 characters.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const categoryData = {
        categoryName: trimmedName,
        description: trimmedDescription,
      };

      if (editingCategory) {
        await updateCategory(
          editingCategory.categoryId,
          categoryData
        );

        setMessage("Category updated successfully.");
      } else {
        await createCategory(categoryData);

        setMessage("Category created successfully.");
      }

      setShowForm(false);
      setEditingCategory(null);
      setCategoryName("");
      setDescription("");

      await loadCategories();
    } catch (err) {
      setError(err.message || "Unable to save category.");
    } finally {
      setSaving(false);
    }
  }

  // ==========================================================
  // ACTIVATE
  // ==========================================================

  async function handleActivate(categoryId) {
    try {
      setError("");
      setMessage("");

      await activateCategory(categoryId);

      setMessage("Category activated successfully.");

      await loadCategories();
    } catch (err) {
      setError(err.message || "Unable to activate category.");
    }
  }

  // ==========================================================
  // DEACTIVATE
  // ==========================================================

  async function handleDeactivate(categoryId) {
    const confirmed = window.confirm(
      "Are you sure you want to deactivate this category?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      await deactivateCategory(categoryId);

      setMessage("Category deactivated successfully.");

      await loadCategories();
    } catch (err) {
      setError(err.message || "Unable to deactivate category.");
    }
  }

  // ==========================================================
  // LOGOUT
  // ==========================================================

  function handleLogout() {
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("email");

    window.location.href = "/login";
  }

  // ==========================================================
  // DATE FORMAT
  // ==========================================================

  function formatDate(dateValue) {
    if (!dateValue) return "—";

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

  return (
    <div className="admin-layout">

      {/* ======================================================
          SIDEBAR
      ====================================================== */}

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
            className="admin-close-button"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X size={20} />
          </button>

        </div>

        <div className="admin-navigation">

          <Link
            to="/admin"
            className="admin-nav-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </Link>

          <Link
            to="/admin/categories"
            className="admin-nav-link admin-nav-link-active"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Tags size={18} />
            Categories
          </Link>

          <Link
            to="/admin/products"
            className="admin-nav-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Package size={18} />
            Products
          </Link>

          <Link
            to="/admin/orders"
            className="admin-nav-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            <ShoppingBag size={18} />
            Orders
          </Link>

          <Link
            to="/admin/customers"
            className="admin-nav-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Users size={18} />
            Customers
          </Link>

        </div>

        <div className="admin-sidebar-bottom">

          <Link
            to="/home"
            className="admin-nav-link admin-store-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Store size={18} />
            View Store
          </Link>

          <button
            className="admin-nav-link admin-logout-button"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            Logout
          </button>

        </div>

      </aside>

      {/* ======================================================
          MOBILE OVERLAY
      ====================================================== */}

      {mobileMenuOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ======================================================
          MOBILE HEADER
      ====================================================== */}

      <header className="admin-mobile-header">

        <Link to="/admin" className="admin-mobile-logo">
          aún<span>.</span>
        </Link>

        <button
          className="admin-menu-button"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu size={21} />
        </button>

      </header>

      {/* ======================================================
          MAIN CONTENT
      ====================================================== */}

      <main className="admin-main">

        {/* ====================================================
            TOP BAR
        ==================================================== */}

        <header className="admin-topbar">

          <div>

            <p className="admin-topbar-label">
              AÚN / ADMIN
            </p>

            <h1>Categories</h1>

          </div>

          <div className="admin-user">

            <div className="admin-user-avatar">
              {username?.charAt(0)?.toUpperCase() || "A"}
            </div>

            <div className="admin-user-info">

              <span className="admin-user-name">
                {username || "Admin"}
              </span>

              <span className="admin-user-role">
                Administrator
              </span>

            </div>

          </div>

        </header>

        {/* ====================================================
            CONTENT
        ==================================================== */}

        <section className="admin-content">

          <div className="admin-page-heading">

            <div>

              {/* FIXED DASHBOARD BUTTON */}

              <button
                type="button"
                className="admin-back-link"
                onClick={handleBackToDashboard}
              >
                <ArrowLeft size={15} />
                Back to Dashboard
              </button>

              <h2>Category Management</h2>

              <p>
                Manage product categories and their
                visibility across the store.
              </p>

            </div>

            <button
              className="admin-primary-btn"
              onClick={handleAddCategory}
            >
              <Plus size={17} />
              Add Category
            </button>

          </div>

          {/* ==================================================
              ALERTS
          ================================================== */}

          {message && (
            <div className="admin-alert success">
              <CheckCircle2 size={18} />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="admin-alert error">
              <XCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* ==================================================
              ADD / EDIT FORM
          ================================================== */}

          {showForm && (
            <div className="category-form-card">

              <div className="category-form-header">

                <div>

                  <span className="form-eyebrow">
                    {editingCategory
                      ? "EDIT CATEGORY"
                      : "NEW CATEGORY"}
                  </span>

                  <h3>
                    {editingCategory
                      ? "Update Category"
                      : "Add New Category"}
                  </h3>

                </div>

                <button
                  className="form-close-btn"
                  onClick={handleCloseForm}
                  disabled={saving}
                >
                  <X size={18} />
                </button>

              </div>

              <form onSubmit={handleSubmit}>

                <div className="category-form-grid">

                  <div className="form-group">

                    <label htmlFor="categoryName">
                      Category Name
                    </label>

                    <input
                      id="categoryName"
                      type="text"
                      value={categoryName}
                      onChange={(e) =>
                        setCategoryName(e.target.value)
                      }
                      placeholder="e.g. T-Shirts"
                      disabled={saving}
                    />

                  </div>

                  <div className="form-group">

                    <label htmlFor="description">
                      Description
                    </label>

                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) =>
                        setDescription(e.target.value)
                      }
                      placeholder="Short description of the category"
                      rows="4"
                      disabled={saving}
                    />

                  </div>

                </div>

                <div className="form-actions">

                  <button
                    type="button"
                    className="admin-secondary-btn"
                    onClick={handleCloseForm}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="admin-primary-btn"
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : editingCategory
                      ? "Update Category"
                      : "Create Category"}
                  </button>

                </div>

              </form>

            </div>
          )}

          {/* ==================================================
              CATEGORY TABLE
          ================================================== */}

          <div className="category-table-card">

            <div className="category-table-header">

              <div>

                <span className="table-eyebrow">
                  ALL CATEGORIES
                </span>

                <h3>
                  {categories.length}{" "}
                  {categories.length === 1
                    ? "Category"
                    : "Categories"}
                </h3>

              </div>

            </div>

            {loading ? (
              <div className="category-loading">
                <div className="loading-line"></div>
                <div className="loading-line"></div>
                <div className="loading-line"></div>
              </div>
            ) : categories.length === 0 ? (
              <div className="category-empty">

                <Tags size={34} />

                <h3>
                  No categories found
                </h3>

                <p>
                  Create your first category to start
                  organizing products.
                </p>

                <button
                  className="admin-primary-btn"
                  onClick={handleAddCategory}
                >
                  <Plus size={17} />
                  Add Category
                </button>

              </div>
            ) : (
              <div className="category-table-wrapper">

                <table className="category-table">

                  <thead>

                    <tr>
                      <th>ID</th>
                      <th>Category</th>
                      <th>Description</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>

                  </thead>

                  <tbody>

                    {categories.map((category) => (

                      <tr key={category.categoryId}>

                        <td>
                          <span className="category-id">
                            #{category.categoryId}
                          </span>
                        </td>

                        <td>
                          <span className="category-name">
                            {category.categoryName}
                          </span>
                        </td>

                        <td>
                          <span className="category-description">
                            {category.description || "—"}
                          </span>
                        </td>

                        <td>

                          <span
                            className={`category-status ${
                              category.active
                                ? "active"
                                : "inactive"
                            }`}
                          >

                            <span className="status-dot"></span>

                            {category.active
                              ? "Active"
                              : "Inactive"}

                          </span>

                        </td>

                        <td>

                          <span className="category-date">
                            {formatDate(category.createdAt)}
                          </span>

                        </td>

                        <td>

                          <div className="category-actions">

                            <button
                              className="table-action edit"
                              onClick={() =>
                                handleEditCategory(category)
                              }
                            >
                              <Edit3 size={15} />
                              Edit
                            </button>

                            {category.active ? (

                              <button
                                className="table-action deactivate"
                                onClick={() =>
                                  handleDeactivate(
                                    category.categoryId
                                  )
                                }
                              >
                                <XCircle size={15} />
                                Deactivate
                              </button>

                            ) : (

                              <button
                                className="table-action activate"
                                onClick={() =>
                                  handleActivate(
                                    category.categoryId
                                  )
                                }
                              >
                                <CheckCircle2 size={15} />
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

          </div>

        </section>

        {/* ====================================================
            FOOTER
        ==================================================== */}

        <footer className="admin-footer">

          <span>
            © 2026 AÚN. Admin Panel.
          </span>

          <span>
            Built for a better store experience.
          </span>

        </footer>

      </main>
    </div>
  );
}