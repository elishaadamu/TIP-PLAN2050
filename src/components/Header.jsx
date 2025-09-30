import React from "react";
import { Link } from "react-router-dom";
import "./Header.css"; // import styles

function Header({
  isAdmin,
  handleLogout,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}) {
  return (
    <header className="header">
      <div className="header-left">
        <button
          className={`menu-toggle ${isMobileMenuOpen ? "open" : ""}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <Link to="/" className="logo-link">
          <img src="/MPO_Logo.jpg" alt="Logo" className="logo" />
          <span className="header-title">
            Tri-Cities Area MPO TIP/PLAN2050 Projects
          </span>
        </Link>
      </div>

      <nav className={`nav ${isMobileMenuOpen ? "open" : ""}`}>
        <Link to="/" className="nav-link">
          Home
        </Link>

        {isAdmin && (
          <>
            <Link to="/comments" className="nav-link">
              View Comments
            </Link>
            <Link to="/projects" className="nav-link">
              View Projects
            </Link>
            <Link to="/geojson-manager" className="nav-link">
              Manage GeoJSON
            </Link>
          </>
        )}

        {isAdmin ? (
          <button onClick={handleLogout} className="nav-link nav-button">
            Logout
          </button>
        ) : (
          <Link to="/login" className="nav-link">
            Login as admin
          </Link>
        )}
      </nav>
    </header>
  );
}

export default Header;
