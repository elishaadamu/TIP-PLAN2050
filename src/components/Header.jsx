import React from "react";
import { Link } from "react-router-dom";
import { Map, MessageSquare, Database, Settings, Lock, LogOut, FileText } from "lucide-react";
import "./Header.css"; // import styles

function Header({
  isAdmin,
  handleLogout,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  onOpenFactSheet
}) {
  return (
    <>
      <header className="header glass-panel">
        <div className="header-left">
          <Link to="/" className="logo-link" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="logo-container">
              <img src="/MPO_Logo.jpg" alt="Logo" className="logo" width="60" height="60" loading="eager" fetchpriority="high" />
            </div>
            <div className="title-container">
              <h1 className="header-title">Tri-Cities Area MPO</h1>
              <p className="header-subtitle">2027 - 2030 TIP INTERACTIVE PUBLIC INPUT PORTAL</p>
            </div>
          </Link>
        </div>

        {/* Desktop nav — visible above 991px, hidden on mobile */}
        <nav className="nav nav-desktop">
          <Link to="/" className="nav-link">
            <Map size={18} />
            <span>Explore Map</span>
          </Link>

          <button 
            onClick={onOpenFactSheet} 
            className="nav-link" 
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              fontFamily: 'inherit',
              textTransform: 'inherit',
              letterSpacing: 'inherit'
            }}
          >
            <FileText size={18} />
            <span className="text-uppercase">FACT SHEET</span>
          </button>

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

        <button
          className={`menu-toggle ${isMobileMenuOpen ? "open" : ""}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </header>

      {/* Mobile nav — rendered OUTSIDE the header to avoid backdrop-filter stacking context */}
      {isMobileMenuOpen && (
        <div className="nav-mobile-backdrop" onClick={() => setIsMobileMenuOpen(false)} />
      )}
      <nav className={`nav nav-mobile ${isMobileMenuOpen ? "open" : ""}`}>
        <Link to="/" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
          <Map size={18} />
          <span>Explore Map</span>
        </Link>

        <button 
          className="nav-link" 
          onClick={() => { onOpenFactSheet(); setIsMobileMenuOpen(false); }}
          style={{ 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer',
            fontFamily: 'inherit',
            textTransform: 'inherit',
            letterSpacing: 'inherit',
            width: '100%',
            justifyContent: 'center'
          }}
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
          <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="btn-outline logout-btn">
            <LogOut size={16} />
            Sign Out
          </button>
        ) : (
          <Link to="/login" className="btn-primary login-btn" onClick={() => setIsMobileMenuOpen(false)}>
            <Lock size={16} />
            Admin Access
          </Link>
        )}
      </nav>
    </>
  );
}

export default Header;
