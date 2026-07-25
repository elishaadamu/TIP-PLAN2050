import React from "react";
import { Link } from "react-router-dom";
import { Map, MessageSquare, Database, Settings, ShieldCheck, LogOut, FileText } from "lucide-react";
import "./Header.css";

function Header({
  isAdmin,
  handleLogout,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  onOpenFactSheet,
  onCloseFactSheet,
  isFactSheetOpen
}) {
  return (
    <>
      <header className="header glass-panel">
        <div className="header-left">
          <Link to="/" className="logo-link" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="logo-container">
              <img src="/MPO_Logo.jpg" alt="Tri-Cities MPO Logo" className="logo" width="44" height="44" loading="eager" />
            </div>
            <div className="title-container">
              <div className="title-row">
                <h1 className="header-title">Tri-Cities MPO</h1>
                <span className="live-badge">
                  <span className="pulse-dot"></span> LIVE PORTAL
                </span>
              </div>
              <p className="header-subtitle">2027 - 2030 TIP & PLAN 2050 INTERACTIVE PORTAL</p>
            </div>
          </Link>
        </div>

        {/* Desktop Navbar */}
        <nav className="nav nav-desktop">
          <div className="nav-pill-group">
            <Link 
              to="/" 
              className={`nav-link ${!isFactSheetOpen ? "active" : ""}`}
              onClick={onCloseFactSheet}
            >
              <Map size={16} />
              <span>Explore Map</span>
            </Link>

            <button 
              onClick={onOpenFactSheet} 
              className={`nav-link ${isFactSheetOpen ? "active" : ""}`}
            >
              <FileText size={16} />
              <span>Fact Sheet</span>
            </button>
          </div>

          {isAdmin && (
            <div className="admin-nav-group">
              <Link to="/comments" className="nav-link">
                <MessageSquare size={16} />
                <span>Feedback</span>
              </Link>
              <Link to="/projects" className="nav-link">
                <Database size={16} />
                <span>Inventory</span>
              </Link>
              <Link to="/geojson-manager" className="nav-link">
                <Settings size={16} />
                <span>Data Manager</span>
              </Link>
            </div>
          )}

          <div className="nav-divider"></div>

          {isAdmin ? (
            <button onClick={handleLogout} className="logout-btn">
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
          ) : (
            <Link to="/login" className="admin-access-btn">
              <div className="admin-icon-wrapper">
                <ShieldCheck size={14} />
              </div>
              <span>Admin Access</span>
            </Link>
          )}
        </nav>

        {/* Hamburger Menu Toggle */}
        <button
          className={`menu-toggle ${isMobileMenuOpen ? "open" : ""}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </header>

      {/* Mobile Nav Overlay */}
      {isMobileMenuOpen && (
        <div className="nav-mobile-backdrop" onClick={() => setIsMobileMenuOpen(false)} />
      )}
      <nav className={`nav nav-mobile ${isMobileMenuOpen ? "open" : ""}`}>
        <Link 
          to="/" 
          className={`nav-link ${!isFactSheetOpen ? "active" : ""}`}
          onClick={() => { onCloseFactSheet(); setIsMobileMenuOpen(false); }}
        >
          <Map size={18} />
          <span>Explore Map</span>
        </Link>

        <button 
          className={`nav-link ${isFactSheetOpen ? "active" : ""}`}
          onClick={() => { onOpenFactSheet(); setIsMobileMenuOpen(false); }}
        >
          <FileText size={18} />
          <span>Fact Sheet</span>
        </button>

        {isAdmin && (
          <div className="admin-nav-group">
            <Link to="/comments" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
              <MessageSquare size={18} />
              <span>Feedback</span>
            </Link>
            <Link to="/projects" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
              <Database size={18} />
              <span>Inventory</span>
            </Link>
            <Link to="/geojson-manager" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
              <Settings size={18} />
              <span>Data Manager</span>
            </Link>
          </div>
        )}

        <div className="nav-divider-mobile"></div>

        {isAdmin ? (
          <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="logout-btn" style={{ width: '100%', justifyContent: 'center', height: '46px' }}>
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        ) : (
          <Link to="/login" className="admin-access-btn" onClick={() => setIsMobileMenuOpen(false)} style={{ width: '100%', justifyContent: 'center', height: '46px' }}>
            <div className="admin-icon-wrapper">
              <ShieldCheck size={16} />
            </div>
            <span>Admin Access</span>
          </Link>
        )}
      </nav>
    </>
  );
}

export default Header;
