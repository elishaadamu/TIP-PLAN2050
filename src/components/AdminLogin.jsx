import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const AdminLogin = ({ setIsAdmin, navigate }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // Clear previous errors
    setLoading(true); // Set loading to true
    try {
      const response = await axios.post(
        "https://ecointeractive.onrender.com/api/login",
        {
          email,
          password,
        }
      );
      if (response.data.message === "Login successful!") {
        setIsAdmin(true);
        localStorage.setItem('isAdmin', 'true');
        navigate("/");
      } else {
        setErrorMessage(
          response.data.error || "Login failed. Please check your credentials."
        );
      }
    } catch (err) {
      console.error("Login error:", err);
      setErrorMessage(
        "Login failed. Please check your credentials and try again."
      );
    } finally {
      setLoading(false); // Set loading to false regardless of success or failure
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
        padding: "20px",
        background: "var(--bg-main)"
      }}
    >
      <div
        className="card glass-panel animate-slide-up"
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "3rem",
          display: "flex",
          flexDirection: "column",
          gap: "2rem"
        }}
      >
        <div style={{ textAlign: "center" }}>
           <div style={{ 
             background: 'white', 
             display: 'inline-flex', 
             padding: '10px', 
             borderRadius: '12px', 
             boxShadow: 'var(--shadow-premium)',
             marginBottom: '1.5rem'
           }}>
             <img src="/MPO_Logo.jpg" alt="Logo" style={{ height: "64px" }} />
           </div>
           <h2 style={{ fontSize: "1.75rem", fontWeight: 800 }}>Admin Portal</h2>
           <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: "0.5rem" }}>
             Secure access for regional planning authorities.
           </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "600",
                fontSize: "0.75rem",
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--text-muted)'
              }}
            >
              Institutional Email
            </label>
            <input
              type="email"
              placeholder="admin@mpo-tri-cities.gov"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "600",
                fontSize: "0.75rem",
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--text-muted)'
              }}
            >
              Secured Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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
                  padding: "0.5rem",
                  width: "36px",
                  height: "36px"
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {errorMessage && (
            <div
              className="animate-slide-up"
              style={{
                color: "#ef4444",
                textAlign: "center",
                fontSize: "0.813rem",
                background: "rgba(239, 68, 68, 0.05)",
                padding: "0.75rem",
                borderRadius: "8px",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                fontWeight: 500
              }}
            >
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: "100%", padding: '1rem', marginTop: '0.5rem' }}
          >
            {loading ? "Authenticating..." : "Authorize Login"}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <Link to="/" style={{ fontSize: '0.813rem', color: 'var(--text-muted)', fontWeight: 500 }}>
             ← Return to Explorer Map
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
