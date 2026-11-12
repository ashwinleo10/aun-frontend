import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { loginUser } from "../services/authService";

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!username.trim() || !password) {
      setError(
        "Please enter both username and password."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await loginUser({
        username: username.trim(),
        password: password,
      });

      /*
       * Store only non-sensitive information
       * required by the frontend UI.
       *
       * The JWT remains inside the HttpOnly
       * authentication cookie.
       */
      sessionStorage.setItem(
        "username",
        response.username
      );

      sessionStorage.setItem(
        "role",
        response.role
      );

      if (response.email) {
        sessionStorage.setItem(
          "email",
          response.email
        );
      } else {
        sessionStorage.removeItem(
          "email"
        );
      }

      /*
       * Redirect based on the user's role.
       */
      if (response.role === "ADMIN") {
        navigate("/admin", {
          replace: true,
        });
      } else {
        navigate("/home", {
          replace: true,
        });
      }

    } catch (err) {
      setError(
        err.message ||
          "Unable to log in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">

      {/* LEFT EDITORIAL SECTION */}
      <section className="auth-visual">
        <img
          className="auth-image"
          src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1800&q=85"
          alt="Editorial fashion model"
        />

        <div className="visual-overlay" />

        <Link
          to="/login"
          className="brand-logo"
        >
          aún<span>.</span>
        </Link>

        <div className="visual-content">
          <p className="visual-eyebrow">
            THE ART OF EVERYDAY STYLE
          </p>

          <h1>
            Wear your story.
            <br />
            Define your style.
          </h1>

          <p className="visual-description">
            Discover pieces that feel like you.
            Made for every version of yourself.
          </p>
        </div>

        <div className="visual-footer">
          <span>EST. 2026</span>
          <span>STYLE WITHOUT LIMITS</span>
        </div>
      </section>

      {/* RIGHT LOGIN SECTION */}
      <section className="auth-form-section">

        <div className="mobile-brand">
          <Link
            to="/login"
            className="brand-logo dark-logo"
          >
            aún<span>.</span>
          </Link>
        </div>

        <div className="auth-form-container">

          <div className="form-heading">
            <p className="form-eyebrow">
              WELCOME BACK
            </p>

            <h2>
              Sign in to aún
            </h2>

            <p className="form-subtitle">
              Your style journey continues here.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="auth-form"
          >

            <div className="form-group">
              <label htmlFor="username">
                Username
              </label>

              <input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
                autoComplete="username"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                Password
              </label>

              <div className="password-wrapper">
                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  autoComplete="current-password"
                  disabled={loading}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="remember-option">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) =>
                    setRememberMe(
                      e.target.checked
                    )
                  }
                  disabled={loading}
                />

                <span>
                  Remember me
                </span>
              </label>

              <Link
                to="/forgot-password"
                className="forgot-link"
              >
                Forgot password?
              </Link>
            </div>

            {error && (
              <p
                className="form-message"
                role="alert"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              <span>
                {loading
                  ? "Signing in..."
                  : "Sign in"}
              </span>

              {!loading && (
                <ArrowRight size={18} />
              )}
            </button>

          </form>

          <div className="auth-divider">
            <span />
            <p>NEW TO AÚN?</p>
            <span />
          </div>

          <p className="register-text">
            Don't have an account?{" "}
            <Link to="/register">
              Create account
            </Link>
          </p>

        </div>

        <footer className="auth-bottom">
          <span>
            © 2026 AÚN. ALL RIGHTS RESERVED.
          </span>

          <span>
            MADE FOR EVERY YOU.
          </span>
        </footer>

      </section>
    </main>
  );
}
