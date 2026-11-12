import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../assets/account.css";

export default function Account() {
  const navigate = useNavigate();

  const username = sessionStorage.getItem("username");

  const handleLogout = () => {
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("email");
    sessionStorage.removeItem("role");

    navigate("/login", { replace: true });
  };

  return (
    <main className="account-page">
      <div className="account-container">

        {/* HEADER */}
        <header className="account-header">
          <div className="account-header-content">
            <p className="account-eyebrow">
              YOUR AÚN ACCOUNT
            </p>

            <h1>Account</h1>

            <p className="account-subtitle">
              Manage your profile, addresses and orders.
            </p>
          </div>

          <Link
            to="/home"
            className="account-home-link"
          >
            ← Back to Home
          </Link>
        </header>


        {/* PROFILE */}
        <section className="account-section">
          <div className="account-section-heading">
            <span>01</span>

            <div>
              <p className="account-section-label">
                PROFILE
              </p>

              <h2>Personal information</h2>
            </div>
          </div>

          <div className="profile-card">
            <div className="profile-avatar">
              {username
                ? username.charAt(0).toUpperCase()
                : "A"}
            </div>

            <div className="profile-info">
              <div className="account-field">
                <span>USERNAME</span>

                <p>
                  {username || "User"}
                </p>
              </div>
            </div>
          </div>
        </section>


        {/* ADDRESSES */}
        <section className="account-section">
          <div className="account-section-heading">
            <span>02</span>

            <div>
              <p className="account-section-label">
                DELIVERY
              </p>

              <h2>My addresses</h2>
            </div>
          </div>

          <div className="account-action-card">
            <div className="account-action-content">
              <span className="account-card-label">
                SAVED ADDRESSES
              </span>

              <h3>
                Manage your delivery addresses
              </h3>

              <p>
                View, add, edit or remove the addresses
                you use during checkout.
              </p>
            </div>

            <Link
              to="/account/addresses"
              className="account-action-button"
            >
              <span>View Addresses</span>
              <span className="action-arrow">↗</span>
            </Link>
          </div>
        </section>


        {/* ORDERS */}
        <section className="account-section">
          <div className="account-section-heading">
            <span>03</span>

            <div>
              <p className="account-section-label">
                ORDERS
              </p>

              <h2>Your purchases</h2>
            </div>
          </div>

          <div className="account-action-card">
            <div className="account-action-content">
              <span className="account-card-label">
                ORDER HISTORY
              </span>

              <h3>
                View your orders
              </h3>

              <p>
                Track your purchases and view complete
                order details.
              </p>
            </div>

            <Link
              to="/orders"
              className="account-action-button"
            >
              <span>View Orders</span>
              <span className="action-arrow">↗</span>
            </Link>
          </div>
        </section>


        {/* LOGOUT */}
        <section className="account-section logout-section">
          <div className="account-section-heading">
            <span>04</span>

            <div>
              <p className="account-section-label">
                SESSION
              </p>

              <h2>Sign out</h2>
            </div>
          </div>

          <div className="logout-card">
            <div>
              <h3>
                Ready to leave aún?
              </h3>

              <p>
                You can sign back in whenever you want.
              </p>
            </div>

            <button
              type="button"
              className="logout-button"
              onClick={handleLogout}
            >
              Log out
            </button>
          </div>
        </section>


        {/* FOOTER */}
        <footer className="account-footer">
          <Link
            to="/home"
            className="account-footer-logo"
          >
            aún<span>.</span>
          </Link>

          <p>
            MADE FOR EVERY VERSION OF YOU.
          </p>
        </footer>

      </div>
    </main>
  );
}
