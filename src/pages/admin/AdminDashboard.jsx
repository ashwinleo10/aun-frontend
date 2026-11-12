import React, {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  LayoutDashboard,
  Tags,
  Package,
  ShoppingBag,
  Users,
  Store,
  LogOut,
  Menu,
  X,
  ArrowRight,
} from "lucide-react";

import {
  getAdminCustomers,
} from "../../services/adminCustomerService";

import {
  getAdminCategories,
} from "../../services/adminCategoryService";

import {
  getAdminProducts,
} from "../../services/adminProductService";

import {
  getAdminOrders,
} from "../../services/adminOrderService";

import "../../assets/admin.css";


export default function AdminDashboard() {

  const navigate = useNavigate();

  const [
    sidebarOpen,
    setSidebarOpen,
  ] = useState(false);

  const [
    stats,
    setStats,
  ] = useState({
    products: 0,
    categories: 0,
    orders: 0,
    customers: 0,
  });

  const [
    orderStatusCounts,
    setOrderStatusCounts,
  ] = useState({
    PLACED: 0,
    CONFIRMED: 0,
    SHIPPED: 0,
    DELIVERED: 0,
    CANCELLED: 0,
  });

  const [
    recentOrders,
    setRecentOrders,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const username =
    sessionStorage.getItem(
      "username"
    ) || "Admin";


  useEffect(() => {
    loadDashboardData();
  }, []);


  async function loadDashboardData() {

    try {

      setLoading(true);
      setError("");

      const [
        products,
        categories,
        orders,
        customers,
      ] = await Promise.all([
        getAdminProducts(),
        getAdminCategories(),
        getAdminOrders(),
        getAdminCustomers(),
      ]);


      const activeCategories =
        Array.isArray(categories)
          ? categories.filter(
              (category) =>
                category.active
            ).length
          : 0;


      const orderStatus = {
        PLACED: 0,
        CONFIRMED: 0,
        SHIPPED: 0,
        DELIVERED: 0,
        CANCELLED: 0,
      };


      if (Array.isArray(orders)) {

        orders.forEach(
          (order) => {

            const status =
              order.orderStatus;

            if (
              Object.prototype.hasOwnProperty.call(
                orderStatus,
                status
              )
            ) {
              orderStatus[status]++;
            }

          }
        );

      }


      const sortedOrders =
        Array.isArray(orders)
          ? [...orders]
              .sort(
                (a, b) =>
                  new Date(
                    b.createdAt
                  ) -
                  new Date(
                    a.createdAt
                  )
              )
              .slice(0, 5)
          : [];


      setStats({
        products:
          Array.isArray(products)
            ? products.length
            : 0,

        categories:
          activeCategories,

        orders:
          Array.isArray(orders)
            ? orders.length
            : 0,

        customers:
          Array.isArray(customers)
            ? customers.length
            : 0,
      });


      setOrderStatusCounts(
        orderStatus
      );


      setRecentOrders(
        sortedOrders
      );

    } catch (err) {

      setError(
        err.message ||
          "Unable to load dashboard data."
      );

    } finally {

      setLoading(false);

    }

  }


  const handleLogout = () => {

    sessionStorage.removeItem(
      "username"
    );

    sessionStorage.removeItem(
      "role"
    );

    sessionStorage.removeItem(
      "email"
    );

    navigate("/login", {
      replace: true,
    });

  };


  const closeSidebar = () => {
    setSidebarOpen(false);
  };


  function formatPrice(amount) {

    if (
      amount === null ||
      amount === undefined
    ) {
      return "₹0.00";
    }

    return `₹${Number(
      amount
    ).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;

  }


  function formatDate(dateValue) {

    if (!dateValue) {
      return "—";
    }

    const date =
      new Date(dateValue);

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


  function getStatusClass(
    status
  ) {

    return status
      ? status.toLowerCase()
      : "";

  }


  return (
    <div className="admin-layout">

      {/* MOBILE TOP BAR */}

      <header className="admin-mobile-header">

        <button
          className="admin-menu-button"
          onClick={() =>
            setSidebarOpen(true)
          }
          aria-label="Open admin menu"
        >
          <Menu size={22} />
        </button>

        <Link
          to="/admin"
          className="admin-mobile-logo"
        >
          aún<span>.</span>
        </Link>

      </header>


      {/* MOBILE OVERLAY */}

      {sidebarOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={
            closeSidebar
          }
        />
      )}


      {/* SIDEBAR */}

      <aside
        className={`admin-sidebar ${
          sidebarOpen
            ? "admin-sidebar-open"
            : ""
        }`}
      >

        <div className="admin-brand-area">

          <Link
            to="/admin"
            className="admin-brand"
            onClick={
              closeSidebar
            }
          >
            aún<span>.</span>
          </Link>

          <p className="admin-brand-label">
            ADMIN PANEL
          </p>

          <button
            className="admin-close-button"
            onClick={
              closeSidebar
            }
            aria-label="Close admin menu"
          >
            <X size={20} />
          </button>

        </div>


        <nav className="admin-navigation">

          <Link
            to="/admin"
            className="admin-nav-link admin-nav-link-active"
            onClick={
              closeSidebar
            }
          >
            <LayoutDashboard size={18} />
            <span>
              Dashboard
            </span>
          </Link>


          <Link
            to="/admin/categories"
            className="admin-nav-link"
            onClick={
              closeSidebar
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
            onClick={
              closeSidebar
            }
          >
            <Package size={18} />
            <span>
              Products
            </span>
          </Link>


          <Link
            to="/admin/orders"
            className="admin-nav-link"
            onClick={
              closeSidebar
            }
          >
            <ShoppingBag size={18} />
            <span>
              Orders
            </span>
          </Link>


          <Link
            to="/admin/customers"
            className="admin-nav-link"
            onClick={
              closeSidebar
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
            onClick={
              closeSidebar
            }
          >
            <Store size={18} />
            <span>
              View Store
            </span>
          </Link>


          <button
            className="admin-nav-link admin-logout-button"
            onClick={
              handleLogout
            }
          >
            <LogOut size={18} />
            <span>
              Logout
            </span>
          </button>

        </div>

      </aside>


      {/* MAIN CONTENT */}

      <main className="admin-main">

        {/* DESKTOP HEADER */}

        <header className="admin-topbar">

          <div>

            <p className="admin-topbar-label">
              AÚN / ADMIN
            </p>

            <h1>
              Dashboard
            </h1>

          </div>


          <div className="admin-user">

            <div className="admin-user-avatar">

              {username
                .charAt(0)
                .toUpperCase()}

            </div>


            <div className="admin-user-info">

              <span className="admin-user-name">
                {username}
              </span>

              <span className="admin-user-role">
                Administrator
              </span>

            </div>

          </div>

        </header>


        {/* WELCOME */}

        <section className="admin-welcome">

          <p className="admin-eyebrow">
            OVERVIEW
          </p>

          <h2>
            Welcome back,{" "}
            {username}.
          </h2>

          <p>
            Manage your AÚN store
            from one place.
          </p>

        </section>


        {/* ERROR */}

        {error && (
          <div className="admin-error-message">
            {error}
          </div>
        )}


        {/* MAIN STATISTICS */}

        <section className="admin-stats">

          <div className="admin-stat-card">

            <span>
              PRODUCTS
            </span>

            <strong>
              {loading
                ? "—"
                : stats.products}
            </strong>

            <p>
              Total products
            </p>

          </div>


          <div className="admin-stat-card">

            <span>
              CATEGORIES
            </span>

            <strong>
              {loading
                ? "—"
                : stats.categories}
            </strong>

            <p>
              Active categories
            </p>

          </div>


          <div className="admin-stat-card">

            <span>
              ORDERS
            </span>

            <strong>
              {loading
                ? "—"
                : stats.orders}
            </strong>

            <p>
              Total orders
            </p>

          </div>


          <div className="admin-stat-card">

            <span>
              CUSTOMERS
            </span>

            <strong>
              {loading
                ? "—"
                : stats.customers}
            </strong>

            <p>
              Registered customers
            </p>

          </div>

        </section>


        {/* ORDER STATUS OVERVIEW */}

        <section className="admin-section">

          <div className="admin-section-header">

            <div>

              <p className="admin-eyebrow">
                ORDER OVERVIEW
              </p>

              <h2>
                Order status
              </h2>

            </div>

          </div>


          <div className="admin-stats">

            <div className="admin-stat-card">

              <span>
                PLACED
              </span>

              <strong>
                {loading
                  ? "—"
                  : orderStatusCounts.PLACED}
              </strong>

              <p>
                Orders awaiting confirmation
              </p>

            </div>


            <div className="admin-stat-card">

              <span>
                CONFIRMED
              </span>

              <strong>
                {loading
                  ? "—"
                  : orderStatusCounts.CONFIRMED}
              </strong>

              <p>
                Confirmed orders
              </p>

            </div>


            <div className="admin-stat-card">

              <span>
                SHIPPED
              </span>

              <strong>
                {loading
                  ? "—"
                  : orderStatusCounts.SHIPPED}
              </strong>

              <p>
                Orders in transit
              </p>

            </div>


            <div className="admin-stat-card">

              <span>
                DELIVERED
              </span>

              <strong>
                {loading
                  ? "—"
                  : orderStatusCounts.DELIVERED}
              </strong>

              <p>
                Successfully delivered
              </p>

            </div>


            <div className="admin-stat-card">

              <span>
                CANCELLED
              </span>

              <strong>
                {loading
                  ? "—"
                  : orderStatusCounts.CANCELLED}
              </strong>

              <p>
                Cancelled orders
              </p>

            </div>

          </div>

        </section>


        {/* RECENT ORDERS */}

        <section className="admin-section admin-recent-orders-section">

          <div className="admin-section-header">

            <div>

              <p className="admin-eyebrow">
                RECENT ACTIVITY
              </p>

              <h2>
                Recent orders
              </h2>

            </div>


            <Link
              to="/admin/orders"
              className="admin-view-all-link"
            >
              View all orders
              <ArrowRight size={15} />
            </Link>

          </div>


          {loading ? (

            <div className="admin-recent-orders-loading">
              Loading recent orders...
            </div>

          ) : recentOrders.length === 0 ? (

            <div className="admin-recent-orders-empty">
              No orders found.
            </div>

          ) : (

            <div className="admin-recent-orders-table-wrapper">

              <table className="admin-recent-orders-table">

                <thead>

                  <tr>

                    <th>
                      ORDER
                    </th>

                    <th>
                      CUSTOMER
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
                      ACTION
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {recentOrders.map(
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
                          Customer #
                          {
                            order.userId
                          }
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
                            className={`admin-recent-order-status ${getStatusClass(
                              order.orderStatus
                            )}`}
                          >
                            {
                              order.orderStatus
                            }
                          </span>

                        </td>


                        <td>

                          <span
                            className={`admin-recent-payment-status ${getStatusClass(
                              order.paymentStatus
                            )}`}
                          >
                            {
                              order.paymentStatus
                            }
                          </span>

                        </td>


                        <td>

                          <button
                            type="button"
                            className="admin-recent-order-view-button"
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

          )}

        </section>


        {/* FOOTER */}

        <footer className="admin-footer">

          <span>
            ©{" "}
            {new Date().getFullYear()}{" "}
            AÚN
          </span>

          <span>
            ADMINISTRATION PANEL
          </span>

        </footer>

      </main>

    </div>
  );
}