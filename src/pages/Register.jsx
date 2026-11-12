
import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { registerUser } from "../services/authService";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (
      !username.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill in all fields.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

        const response = await registerUser({
        username: username.trim(),
        email: email.trim(),
        password: password
        });
        
      setSuccess(response.message || "Account created successfully!");

      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">

      {/* Left editorial section */}
      <section className="auth-visual">
        <img
          className="auth-image"
          src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1800&q=85"
          alt="Editorial fashion model"
        />

        <div className="visual-overlay" />

        <Link to="/login" className="brand-logo">
          aún<span>.</span>
        </Link>

        <div className="visual-content">
          <p className="visual-eyebrow">
            A NEW WAY TO EXPRESS YOURSELF
          </p>

          <h1>
            Your style.
            <br />
            Your identity.
          </h1>

          <p className="visual-description">
            Find your own expression.
            Discover a wardrobe that feels uniquely yours.
          </p>
        </div>

        <div className="visual-footer">
          <span>EST. 2026</span>
          <span>STYLE WITHOUT LIMITS</span>
        </div>
      </section>

      {/* Right registration section */}
      <section className="auth-form-section">

        <div className="mobile-brand">
          <Link to="/login" className="brand-logo dark-logo">
            aún<span>.</span>
          </Link>
        </div>

        <div className="auth-form-container register-container">

          <div className="form-heading">
            <p className="form-eyebrow">JOIN THE COMMUNITY</p>

            <h2>Create your account</h2>

            <p className="form-subtitle">
              Start your style journey with aún.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">

            <div className="form-group">
              <label htmlFor="register-username">Username</label>

              <input
                id="register-username"
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="register-email">Email address</label>

              <input
                id="register-email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="register-password">Password</label>

              <div className="password-wrapper">
                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  disabled={loading}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password">
                Confirm password
              </label>

              <div className="password-wrapper">
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  disabled={loading}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="form-message" role="alert">
                {error}
              </p>
            )}

            {success && (
              <p className="form-success" role="status">
                {success} You can now sign in.
              </p>
            )}

            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              <span>
                {loading ? "Creating account..." : "Create account"}
              </span>

              {!loading && <ArrowRight size={18} />}
            </button>

          </form>

          <div className="auth-divider">
            <span />
            <p>ALREADY A MEMBER?</p>
            <span />
          </div>

          <p className="register-text">
            Already have an account?{" "}
            <Link to="/login">Sign in</Link>
          </p>

        </div>

        <footer className="auth-bottom">
          <span>© 2026 AÚN. ALL RIGHTS RESERVED.</span>
          <span>MADE FOR EVERY YOU.</span>
        </footer>

      </section>
    </main>
  );
}
