import { FileText, Info, Users, Calendar, ChevronLeft, X, Map, Database } from "lucide-react";

function FactSheetSidebar({ isOpen, onClose, onOpenFilters }) {

  return (
    <aside 
      className={`asidebar fact-sheet-sidebar ${isOpen ? "open" : "closed"}`}
      style={{
        padding: '2rem',
        overflowY: 'auto',
      }}
    >
      <header style={{
        marginBottom: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'var(--grad-primary)', padding: '8px', borderRadius: '8px', color: 'white' }}>
              <FileText size={18} />
            </div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0 }}>FACT SHEET</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button 
              className="header-icon-btn desktop-only"
              onClick={onOpenFilters}
              title="View Project Filter"
              style={{ 
                background: 'rgba(79, 70, 229, 0.1)', 
                border: 'none',
                padding: '8px', 
                borderRadius: '8px', 
                color: 'var(--primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                opacity: 0.8
              }}
              onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
              onMouseOut={(e) => e.currentTarget.style.opacity = '0.8'}
            >
              <Database size={18} />
            </button>
            <button 
              className="sidebar-close-btn mobile-only"
              onClick={onClose}
              aria-label="Close Fact Sheet"
            >
              X
            </button>
          </div>
        </div>


      </header>

      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', color: 'var(--primary)', marginBottom: '1rem', lineHeight: 1.3 }}>
          FFY 2027-30 MTIP & Draft Conformity Assessment
        </h3>
        <p style={{ color: 'var(--text-main)', fontSize: '0.875rem', lineHeight: 1.6 }}>
          The Tri‑Cities Area Metropolitan Planning Organization (TCAMPO) guides regional investments in transportation, multi-modal mobility, freight movement, and road safety projects:
        </p>
      </section>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="sidebar-group" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Info size={16} style={{ color: 'var(--primary)' }} />
            <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700 }}>MTIP</h4>
          </div>
          <p style={{ margin: 0, fontSize: '0.813rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Short-range list of projects planned for the Tri-Cities area over the next four years (FY 2027–2030).
          </p>
        </div>

        <div className="sidebar-group" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Info size={16} style={{ color: 'var(--secondary)' }} />
            <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700 }}>LRTP</h4>
          </div>
          <p style={{ margin: 0, fontSize: '0.813rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            The region’s transportation vision through 2045.
          </p>
        </div>
      </div>

      <section className="bg-gradient-dark" style={{ 
        padding: '1.5rem', 
        borderRadius: 'var(--radius-lg)', 
        color: 'white',
        boxShadow: 'var(--shadow-lg)',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <Users size={20} style={{ color: 'var(--accent)' }} />
          <h3 style={{ margin: 0, fontSize: '1.125rem', color: 'white' }}>How to Participate</h3>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', opacity: 0.8 }}>
              <Calendar size={12} />
              <span style={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase' }}>Review Period</span>
            </div>
            <p style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
              March 13 – April 12, 2026
            </p>
          </div>
          
          <p style={{ fontSize: '0.813rem', opacity: 0.9, lineHeight: 1.5, margin: 0 }}>
            Review the <a href="https://craterpdc.org/wp-content/uploads/2026/03/Draft-FFY27-30-TCAMPO-MTIP-03.06.2026.pdf" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'underline' }}>Federal Fiscal year 2027-2030 MTIP</a> and the <a href="https://craterpdc.org/wp-content/uploads/2026/03/Draft-RCA-Richmond-Area-FY27-30-TIP-and-2045-LRTP-for-public-review-final.pdf" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'underline' }}>Draft Regional Conformity Report</a> online.
          </p>
        </div>
      </section>

      <section className="mobile-only" style={{ marginTop: '2rem' }}>
        <h3 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
          Quick Actions
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button 
            onClick={onClose}
            className="btn-primary"
            style={{ 
              width: '100%', 
              padding: '1rem', 
              justifyContent: 'center',
              fontSize: '0.813rem',
              fontWeight: 700,
              gap: '0.75rem'
            }}
          >
            <Map size={18} />
            EXPLORE INTERACTIVE MAP
          </button>
          <button 
            onClick={onOpenFilters}
            className="btn-secondary"
            style={{ 
              width: '100%', 
              padding: '1rem', 
              justifyContent: 'center',
              fontSize: '0.813rem',
              fontWeight: 700,
              gap: '0.75rem',
              background: 'rgba(79, 70, 229, 0.05)',
              border: '1px solid var(--primary)',
              color: 'var(--primary)'
            }}
          >
            <Database size={18} />
            FILTER PROJECTS
          </button>
        </div>
      </section>
    </aside>
  );
}

export default FactSheetSidebar;
