import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function AdminProtectedRoute({ children }) {
  const location = useLocation();

  const username = sessionStorage.getItem("username");
  const role = sessionStorage.getItem("role");

  // Not logged in
  if (!username) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  // Logged-in customer trying to access admin
  if (role !== "ADMIN") {
    return (
      <Navigate
        to="/home"
        replace
      />
    );
  }

  return children;
}
