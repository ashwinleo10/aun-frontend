import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const location = useLocation();

  const username = sessionStorage.getItem("username");
  const role = sessionStorage.getItem("role");

  // User is not logged in
  if (!username) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  // Admin should stay inside the admin module
  if (role === "ADMIN") {
    return (
      <Navigate
        to="/admin"
        replace
      />
    );
  }

  return children;
}
