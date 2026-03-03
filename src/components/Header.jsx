import React from "react";
import { Link } from "react-router-dom";
import { Map, MessageSquare, Database, Settings, Lock, LogOut } from "lucide-react";
import "./Header.css"; // import styles

function Header({
  isAdmin,
  handleLogout,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}) {
  return (
    <header className="header glass-panel">
      <div className="header-left">
        <button
          className={`menu-toggle ${isMobileMenuOpen ? "open" : ""}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <Link to="/" className="logo-link">
          <div className="logo-container">
            <img src="/MPO_Logo.jpg" alt="Logo" className="logo" />
          </div>
          <div className="title-container">
            <h1 className="header-title">Tri-Cities Area MPO</h1>
            <p className="header-subtitle">TIP / PLAN2050 Interactive Portal</p>
          </div>
        </Link>
      </div>

      <nav className={`nav ${isMobileMenuOpen ? "open" : ""}`}>
        <Link to="/" className="nav-link">
          <Map size={18} />
          <span>Explore Map</span>
        </Link>

        {isAdmin && (
          <div className="admin-nav-group">
            <Link to="/comments" className="nav-link">
              <MessageSquare size={18} />
              <span>Feedback</span>
            </Link>
            <Link to="/projects" className="nav-link">
              <Database size={18} />
              <span>Inventory</span>
            </Link>
            <Link to="/geojson-manager" className="nav-link">
              <Settings size={18} />
              <span>Data Manager</span>
            </Link>
          </div>
        )}

        <div className="nav-divider"></div>

        {isAdmin ? (
          <button onClick={handleLogout} className="btn-outline logout-btn">
            <LogOut size={16} />
            Sign Out
          </button>
        ) : (
          <Link to="/login" className="btn-primary login-btn">
            <Lock size={16} />
            Admin Access
          </Link>
        )}
      </nav>
    </header>
  );
}

export default Header;
