import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="home-navbar">
      {/* LOGO */}
      <Link to="/home" className="home-logo">
        aún<span>.</span>
      </Link>

      {/* NAVIGATION */}
      <nav className="nav-links">
        <Link to="/home" className="nav-active">
          Home
        </Link>

        <a href="/home#categories">
          Collections
        </a>

        <a href="/home#new-arrivals">
          New arrivals
        </a>

        <a href="/home#about">
          Our story
        </a>
      </nav>

      {/* ACTIONS */}
      <div className="nav-actions">

        {/* ACCOUNT */}
        <Link to="/login" aria-label="Account">
          <svg viewBox="0 0 24 24">
            <circle
              cx="12"
              cy="8"
              r="4"
            />

            <path
              d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"
            />
          </svg>
        </Link>

        {/* SHOPPING BAG */}
        <Link to="/cart" aria-label="Shopping bag">
          <svg viewBox="0 0 24 24">
            <path d="M5 8h14l1 13H4L5 8Z" />

            <path
              d="M9 9V6a3 3 0 0 1 6 0v3"
            />
          </svg>
        </Link>

        {/* SIGN IN */}
        <Link
          to="/login"
          className="nav-signin"
        >
          Sign in
        </Link>

      </div>
    </header>
  );
}
