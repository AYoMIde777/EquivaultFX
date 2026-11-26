import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Eye, EyeOff, Check, X } from "lucide-react";
import efxLogo from "../assets/EFX logo.jpg";
import { supabase } from "../lib/supabase";

const COUNTRIES = [
  "Nigeria",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "South Africa",
  "Canada",
  "Germany",
  "Singapore",
];

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const initialMode =
    searchParams.get("mode") === "signup" ? "signup" : "login";
  const [mode, setMode] = useState(initialMode); // "login" | "signup" | "forgot" | "recovery"

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [country, setCountry] = useState("Nigeria");
  const [phone, setPhone] = useState("");
  const [accountCurrency, setAccountCurrency] = useState("USD");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [logoError, setLogoError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setMode("recovery");
        setErrorMsg("");
        setInfoMsg("Enter your new password below to complete recovery.");
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const checks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
  const strengthScore = Object.values(checks).filter(Boolean).length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");

    if (mode === "forgot") {
      const cleanEmail = email.trim();
      if (!cleanEmail) {
        setErrorMsg("Enter the email address linked to your account.");
        return;
      }

      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${window.location.origin}/auth?reset=1`,
      });
      setLoading(false);

      if (error) {
        setErrorMsg(error.message);
        return;
      }
      setInfoMsg(
        "Password reset instructions sent. Check your inbox and spam folder."
      );
      return;
    }

    if (mode === "recovery") {
      if (password.length < 6) {
        setErrorMsg("New password must be at least 6 characters.");
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg("Passwords do not match.");
        return;
      }

      setLoading(true);
      const { error } = await supabase.auth.updateUser({ password });
      setLoading(false);

      if (error) {
        setErrorMsg(error.message);
        return;
      }
      setInfoMsg("Password updated. Redirecting to trading terminal...");
      setTimeout(() => navigate("/dashboard"), 1000);
      return;
    }

    if (mode === "signup") {
      if (strengthScore < 3) {
        setErrorMsg(
          "Use at least 8 characters including uppercase, number, and symbol."
        );
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg("Passwords do not match.");
        return;
      }
      if (!agreedTerms) {
        setErrorMsg("Please accept the Risk Disclosure and Client Agreement.");
        return;
      }

      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            username: username.trim().toLowerCase(),
            country,
            phone: phone.trim(),
            account_currency: accountCurrency,
          },
        },
      });
      setLoading(false);

      if (error) {
        setErrorMsg(error.message);
        return;
      }
      if (data.session) {
        navigate("/dashboard");
      } else {
        setInfoMsg("Account registered. Verify your email link, then sign in.");
        setMode("login");
      }
    } else {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      setLoading(false);

      if (error) {
        setErrorMsg(error.message);
        return;
      }
      navigate("/dashboard");
    }
  };

  return (
    <div
      className="auth-page"
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        boxSizing: "border-box",
      }}
    >
      <div
        className="auth-card"
        style={{
          width: "100%",
          maxWidth: mode === "signup" ? "520px" : "430px",
          margin: "0 auto",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Link to="/" className="brand-mark">
            {!logoError ? (
              <img
                src={efxLogo}
                alt="EquivaultFX"
                className="brand-logo-img"
                onError={() => setLogoError(true)}
              />
            ) : (
              <span className="brand-logo-fallback">EF</span>
            )}
            <span>
              Equivault<span className="brand-accent">FX</span>
            </span>
          </Link>

          <Link
            to="/"
            style={{
              fontSize: "13px",
              color: "var(--text-secondary)",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <ArrowLeft size={14} /> Home
          </Link>
        </div>

        {(mode === "login" || mode === "signup") && (
          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab ${mode === "login" ? "active" : ""}`}
              onClick={() => {
                setMode("login");
                setErrorMsg("");
              }}
            >
              Client Log In
            </button>
            <button
              type="button"
              className={`auth-tab ${mode === "signup" ? "active" : ""}`}
              onClick={() => {
                setMode("signup");
                setErrorMsg("");
              }}
            >
              Open Live Account
            </button>
          </div>
        )}

        {mode === "forgot" && (
          <div style={{ marginTop: "14px", marginBottom: "12px" }}>
            <h3 style={{ fontSize: "18px", marginBottom: "4px" }}>
              Forgot Password
            </h3>
            <p style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}>
              Enter your account email to receive a password reset link.
            </p>
          </div>
        )}

        {mode === "recovery" && (
          <div style={{ marginTop: "14px", marginBottom: "12px" }}>
            <h3 style={{ fontSize: "18px", marginBottom: "4px" }}>
              Set New Password
            </h3>
            <p style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}>
              Enter and confirm your new password below.
            </p>
          </div>
        )}

        {errorMsg && <div className="auth-alert error">{errorMsg}</div>}
        {infoMsg && <div className="auth-alert success">{infoMsg}</div>}

        <form onSubmit={handleSubmit}>
          {mode === "signup" && (
            <>
              <div className="auth-grid-2">
                <div className="form-group">
                  <label className="form-label">Full Legal Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Alex Mercer"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Trader Username</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="amercer_fx"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="auth-grid-2">
                <div className="form-group">
                  <label className="form-label">Country of Residence</label>
                  <select
                    className="form-control"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="+234 800 000 0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Base Account Currency</label>
                <select
                  className="form-control"
                  value={accountCurrency}
                  onChange={(e) => setAccountCurrency(e.target.value)}
                >
                  <option value="USD">USD — US Dollar</option>
                  <option value="USDT">USDT — Tether Stablecoin</option>
                  <option value="EUR">EUR — Euro</option>
                  <option value="GBP">GBP — British Pound</option>
                </select>
              </div>
            </>
          )}

          {(mode === "login" || mode === "signup" || mode === "forgot") && (
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-control"
                placeholder="trader@equivaultfx.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          )}

          {(mode === "login" || mode === "signup" || mode === "recovery") && (
            <div className="form-group">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <label className="form-label">
                  {mode === "recovery" ? "New Password" : "Password"}
                </label>
                {mode === "login" && (
                  <button
                    type="button"
                    className="auth-inline-btn"
                    onClick={() => {
                      setErrorMsg("");
                      setInfoMsg("");
                      setMode("forgot");
                    }}
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingRight: "40px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "55%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}

          {mode === "signup" && (
            <>
              <div className="password-meter">
                <div
                  className={`meter-bar ${strengthScore >= 1 ? "active" : ""}`}
                />
                <div
                  className={`meter-bar ${strengthScore >= 2 ? "active" : ""}`}
                />
                <div
                  className={`meter-bar ${strengthScore >= 3 ? "active" : ""}`}
                />
                <div
                  className={`meter-bar ${strengthScore >= 4 ? "active" : ""}`}
                />
              </div>

              <div className="password-checklist">
                <span>
                  {checks.length ? <Check size={12} /> : <X size={12} />} 8+
                  chars
                </span>
                <span>
                  {checks.upper ? <Check size={12} /> : <X size={12} />}{" "}
                  Uppercase
                </span>
                <span>
                  {checks.number ? <Check size={12} /> : <X size={12} />} Number
                </span>
                <span>
                  {checks.special ? <Check size={12} /> : <X size={12} />}{" "}
                  Symbol
                </span>
              </div>
            </>
          )}

          {(mode === "signup" || mode === "recovery") && (
            <div className="form-group" style={{ marginTop: "12px" }}>
              <label className="form-label">
                {mode === "recovery" ? "Confirm New Password" : "Confirm Password"}
              </label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          )}

          {mode === "signup" && (
            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
                fontSize: "12px",
                color: "var(--text-secondary)",
                marginBottom: "14px",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                style={{ marginTop: "3px" }}
              />
              <span>
                I confirm I am at least 18 years old and agree to the
                EquivaultFX Client Terms, Anti-Money Laundering Policy, and
                Leveraged Risk Disclosure.
              </span>
            </label>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-crimson"
            style={{ width: "100%", marginTop: "6px" }}
          >
            {loading
              ? "Verifying Credentials..."
              : mode === "login"
                ? "Access Trading Terminal"
                : mode === "signup"
                  ? "Create Verified Account"
                  : mode === "forgot"
                    ? "Send Password Reset Link"
                    : "Update Password"}
          </button>

          {mode === "forgot" && (
            <div style={{ marginTop: "12px", textAlign: "center" }}>
              <button
                type="button"
                className="auth-inline-btn"
                onClick={() => {
                  setErrorMsg("");
                  setInfoMsg("");
                  setMode("login");
                }}
              >
                Back to Client Log In
              </button>
            </div>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              marginTop: "14px",
              fontSize: "12px",
              color: "var(--text-secondary)",
            }}
          >
          </div>
        </form>
      </div>
    </div>
  );
}