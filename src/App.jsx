import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import RazorpayTest from "./pages/RazorpayTest";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/MyOrders";
import OrderDetails from "./pages/OrderDetails";
import Account from "./pages/Account";
import Addresses from "./pages/Addresses";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import CategoryProducts from "./pages/CategoryProducts";

// Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminProductForm from "./pages/admin/AdminProductForm";
import AdminOrderDetails from "./pages/admin/AdminOrderDetails";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminCustomerDetails from "./pages/admin/AdminCustomerDetails";

function AnimatedRoutes() {
  const location = useLocation();

  const pageVariants = {
    initial: (direction) => ({
      x: direction === "forward" ? "100%" : "-100%",
      opacity: 0.8,
    }),

    animate: {
      x: 0,
      opacity: 1,
      transition: {
        x: {
          type: "tween",
          duration: 0.65,
          ease: [0.22, 1, 0.36, 1],
        },
        opacity: {
          duration: 0.4,
        },
      },
    },

    exit: (direction) => ({
      x: direction === "forward" ? "-100%" : "100%",
      opacity: 0.8,
      transition: {
        x: {
          type: "tween",
          duration: 0.65,
          ease: [0.22, 1, 0.36, 1],
        },
        opacity: {
          duration: 0.4,
        },
      },
    }),
  };

  const direction =
    location.pathname === "/register"
      ? "forward"
      : "backward";

  return (
    <div className="route-container">
      <AnimatePresence
        mode="sync"
        custom={direction}
      >
        <motion.div
          key={location.pathname}
          className="route-page"
          custom={direction}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <Routes location={location}>

            {/* ==================================================
                AUTH ROUTES
            ================================================== */}

            <Route
              path="/login"
              element={<Login />}
            />

            <Route
              path="/register"
              element={<Register />}
            />

            {/* ==================================================
                CUSTOMER PUBLIC ROUTES
                ADMIN USERS ARE SENT TO /admin
            ================================================== */}

            <Route
              path="/"
              element={
                <Navigate
                  to="/home"
                  replace
                />
              }
            />

            <Route
              path="/home"
              element={
                <CustomerOnlyRoute>
                  <Home />
                </CustomerOnlyRoute>
              }
            />

            <Route
              path="/razorpay-test"
              element={
                <CustomerOnlyRoute>
                  <RazorpayTest />
                </CustomerOnlyRoute>
              }
            />

            <Route
              path="/products/:productId"
              element={
                <CustomerOnlyRoute>
                  <ProductDetails />
                </CustomerOnlyRoute>
              }
            />

            <Route
              path="/cart"
              element={
                <CustomerOnlyRoute>
                  <Cart />
                </CustomerOnlyRoute>
              }
            />

            <Route
              path="/category/:category"
              element={
                <CustomerOnlyRoute>
                  <CategoryProducts />
                </CustomerOnlyRoute>
              }
            />

            {/* ==================================================
                CUSTOMER PROTECTED ROUTES
            ================================================== */}

            <Route
              path="/account"
              element={
                <ProtectedRoute>
                  <Account />
                </ProtectedRoute>
              }
            />

            <Route
              path="/account/addresses"
              element={
                <ProtectedRoute>
                  <Addresses />
                </ProtectedRoute>
              }
            />

            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />

            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <MyOrders />
                </ProtectedRoute>
              }
            />

            <Route
              path="/orders/:orderId"
              element={
                <ProtectedRoute>
                  <OrderDetails />
                </ProtectedRoute>
              }
            />

            {/* ==================================================
                ADMIN ROUTES
            ================================================== */}

            <Route
              path="/admin"
              element={
                <AdminProtectedRoute>
                  <AdminDashboard />
                </AdminProtectedRoute>
              }
            />

            <Route
              path="/admin/categories"
              element={
                <AdminProtectedRoute>
                  <AdminCategories />
                </AdminProtectedRoute>
              }
            />

            <Route
              path="/admin/products"
              element={
                <AdminProtectedRoute>
                  <AdminProducts />
                </AdminProtectedRoute>
              }
            />

            <Route
              path="/admin/products/add"
              element={
                <AdminProtectedRoute>
                  <AdminProductForm />
                </AdminProtectedRoute>
              }
            />

            <Route
              path="/admin/products/edit/:productId"
              element={
                <AdminProtectedRoute>
                  <AdminProductForm />
                </AdminProtectedRoute>
              }
            />

            <Route
              path="/admin/orders"
              element={
                <AdminProtectedRoute>
                  <AdminOrders />
                </AdminProtectedRoute>
              }
            />

            <Route
              path="/admin/orders/:orderId"
              element={
                <AdminProtectedRoute>
                  <AdminOrderDetails />
                </AdminProtectedRoute>
              }
            />

            <Route
              path="/admin/customers"
              element={
                <AdminProtectedRoute>
                  <AdminCustomers />
                </AdminProtectedRoute>
              }
            />

            <Route
              path="/admin/customers/:userId"
              element={
                <AdminProtectedRoute>
                  <AdminCustomerDetails />
                </AdminProtectedRoute>
              }
            />

          </Routes>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/*
 * Prevent ADMIN users from entering the
 * customer-facing website.
 */
function CustomerOnlyRoute({ children }) {
  const username = sessionStorage.getItem("username");
  const role = sessionStorage.getItem("role");

  // Admin is already logged in
  if (username && role === "ADMIN") {
    return (
      <Navigate
        to="/admin"
        replace
      />
    );
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}