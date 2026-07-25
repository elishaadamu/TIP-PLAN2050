import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, ArrowLeft, Loader2, ShieldCheck } from "lucide-react";

const AdminLogin = ({ setIsAdmin, navigate }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);
    try {
      const response = await axios.post(
        "https://ecointeractive.onrender.com/api/login",
        { email, password }
      );
      if (response.data.message === "Login successful!") {
        setIsAdmin(true);
        localStorage.setItem('isAdmin', 'true');
        navigate("/");
      } else {
        setErrorMessage(
          response.data.error || "Authentication failed. Please check your credentials."
        );
      }
    } catch (err) {
      console.error("Login error:", err);
      setErrorMessage("Authentication failed. Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
        padding: "2rem 1rem",
        minHeight: "calc(100vh - 72px)"
      }}
    >
      <div
        className="glass-card animate-slide-up"
        style={{
          width: "100%",
          maxWidth: "430px",
          padding: "2.5rem 2rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.75rem",
          background: "rgba(19, 27, 46, 0.95)",
          border: "1px solid var(--border-medium)",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)",
          borderRadius: "16px"
        }}
      >
        <div style={{ textAlign: "center" }}>
           <div style={{ 
             background: 'rgba(14, 165, 233, 0.12)', 
             display: 'inline-flex', 
             padding: '12px', 
             borderRadius: '16px', 
             marginBottom: '1rem',
             border: '1px solid rgba(14, 165, 233, 0.3)',
             color: 'var(--accent-cyan)'
           }}>
             <ShieldCheck size={28} />
           </div>
           
           <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.02em" }}>
             Administrator Sign In
           </h2>
           <p style={{ color: "var(--text-secondary)", fontSize: "0.813rem", marginTop: "0.4rem", lineHeight: 1.5 }}>
             Authorized access for regional planning dataset management and feedback registry moderation.
           </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.4rem",
                fontWeight: "700",
                fontSize: "0.68rem",
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--text-secondary)'
              }}
            >
              Institutional Email
            </label>
            <div style={{ position: "relative" }}>
              <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                placeholder="admin@mpo-tri-cities.gov"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ 
                  paddingLeft: '42px', 
                  background: 'rgba(13, 19, 34, 0.9)', 
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  fontSize: '0.875rem'
                }}
              />
            </div>
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.4rem",
                fontWeight: "700",
                fontSize: "0.68rem",
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--text-secondary)'
              }}
            >
              Secured Password
            </label>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ 
                  paddingLeft: '42px', 
                  paddingRight: '44px',
                  background: 'rgba(13, 19, 34, 0.9)', 
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  fontSize: '0.875rem'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="btn-ghost"
                style={{
                  position: "absolute",
                  right: "0.5rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  padding: "0.375rem",
                  width: "32px",
                  height: "32px",
                  color: 'var(--text-muted)'
                }}
                title={showPassword ? "Hide Password" : "Show Password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {errorMessage && (
            <div
              className="animate-slide-up"
              style={{
                color: "#f87171",
                textAlign: "center",
                fontSize: "0.813rem",
                background: "rgba(239, 68, 68, 0.1)",
                padding: "0.75rem",
                borderRadius: "10px",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                fontWeight: 600
              }}
            >
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ 
              width: "100%", 
              padding: '0.875rem', 
              marginTop: '0.25rem', 
              borderRadius: '10px',
              fontSize: '0.875rem',
              fontWeight: 700
            }}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Authenticating System...</span>
              </>
            ) : (
              <>
                <ShieldCheck size={16} />
                <span>Authorize Access</span>
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
          <Link to="/" style={{ fontSize: '0.813rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.375rem', textDecoration: 'none', transition: 'var(--transition)' }}>
             <ArrowLeft size={14} />
             <span>Return to Public Map Explorer</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
