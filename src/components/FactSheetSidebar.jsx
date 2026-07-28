import React from "react";
import { FileText, Info, Users, Calendar, Map, Database, Sparkles, ExternalLink, ShieldCheck, Clock, QrCode } from "lucide-react";

function FactSheetSidebar({ isOpen, onClose, onOpenFilters }) {
  return (
    <aside
      className={`asidebar fact-sheet-sidebar ${isOpen ? "open" : "closed"}`}
      style={{
        padding: '1.75rem',
        overflowY: 'auto',
      }}
    >
      <header style={{
        marginBottom: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              background: 'var(--grad-cyan-purple)',
              padding: '8px',
              borderRadius: '10px',
              color: 'white',
              boxShadow: 'var(--shadow-neon-cyan)'
            }}>
              <FileText size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                PROGRAM FACT SHEET
              </h2>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              className="header-icon-btn desktop-only"
              onClick={onOpenFilters}
              title="Open Project Explorer & Filters"
              style={{
                background: 'rgba(6, 182, 212, 0.15)',
                border: '1px solid var(--border-cyan)',
                padding: '8px',
                borderRadius: '8px',
                color: 'var(--accent-cyan)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'var(--transition)',
              }}
            >
              <Database size={16} />
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

      <p style={{ color: 'var(--text-secondary)', fontSize: '0.813rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
        The Tri‑Cities Area Metropolitan Planning Organization (TCAMPO) directs regional transportation investments, multi-modal mobility, transit expansions, freight corridors, and roadway safety initiatives.
      </p>

      {/* Cyber Metric Stats Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0.75rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{
          background: 'rgba(6, 182, 212, 0.08)',
          border: '1px solid var(--border-cyan)',
          borderRadius: '12px',
          padding: '0.875rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.25rem' }}>
            <Sparkles size={14} style={{ color: 'var(--accent-cyan)' }} />
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>FY 2027 – 2030 MTIP</span>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>4-Year Plan</div>

        </div>

        <div style={{
          background: 'rgba(139, 92, 246, 0.08)',
          border: '1px solid var(--border-purple)',
          borderRadius: '12px',
          padding: '0.875rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.25rem' }}>
            <ShieldCheck size={14} style={{ color: '#c084fc' }} />
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Long Range Plan (LRTP)</span>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>PLAN2050</div>
        </div>
      </div>

      <section style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', color: 'var(--accent-cyan)', marginBottom: '0.75rem', lineHeight: 1.3, fontWeight: 800 }}>
          Conformity Assessment
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.813rem', lineHeight: 1.6 }}>
          Conformity assessment is a process that ensures that the Metropolitan Transportation Improvement Program (MTIP) and PLAN2050 complies with the federal Clean Air Act. It ensures that planned transportation investments will not create or worsen air quality problems or delay attainment and maintenance of federal air quality standards.
        </p>
      </section>

      {/* Program Pillars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          padding: '0.875rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <Info size={16} style={{ color: 'var(--accent-cyan)' }} />
            <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>MTIP Focus</h4>
          </div>
          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            A prioritized list of federally funded transportation capital projects scheduled for execution over FY 2027–2030.
          </p>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          padding: '0.875rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <Info size={16} style={{ color: 'var(--accent-purple)' }} />
            <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>PLAN2050 Focus</h4>
          </div>
          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Strategic framework steering multi-modal infrastructure and environmental sustainability goals through 2050.
          </p>
        </div>
      </div>

      {/* Public Participation Section */}
      <section className="glass-card" style={{
        padding: '1.25rem',
        marginBottom: '1.5rem',
        background: 'rgba(11, 15, 25, 0.8)',
        border: '1px solid var(--border-cyan)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
          <Users size={18} style={{ color: 'var(--accent-cyan)' }} />
          <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--accent-cyan)', fontWeight: 800 }}>Public Input Calendar</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '6px', borderRadius: '8px', color: 'var(--accent-emerald)', marginTop: '2px' }}>
              <Clock size={16} />
            </div>
            <div>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-emerald)' }}>Public Review Window</span>
              <p style={{ fontSize: '0.875rem', fontWeight: 700, margin: '2px 0 0 0', color: 'var(--text-primary)' }}>
                August 17 – September 16, 2026
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <div style={{ background: 'rgba(6, 182, 212, 0.15)', padding: '6px', borderRadius: '8px', color: 'var(--accent-cyan)', marginTop: '2px' }}>
              <Calendar size={16} />
            </div>
            <div>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-cyan)' }}>Live Public Hearing</span>
              <p style={{ fontSize: '0.875rem', fontWeight: 700, margin: '2px 0 0 0', color: 'var(--text-primary)' }}>
                Wednesday, September 9, 2026 | 5:00 – 6:30 PM
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: '2px 0 0 0' }}>
                Petersburg Public Library Conference Room, 201 W. Washington St.
              </p>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Download official drafts:
              <br />
              <a href="https://craterpdc.org/wp-content/uploads/2026/03/Draft-FFY27-30-TCAMPO-MTIP-03.06.2026.pdf" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-cyan)', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                <span>PLAN2050 & FY2027-30 MTIP</span> <ExternalLink size={12} />
              </a>
              <br />
              <a href="https://craterpdc.org/wp-content/uploads/2026/03/Draft-RCA-Richmond-Area-FY27-30-TIP-and-2045-LRTP-for-public-review-finalv3.pdf" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-purple)', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                <span>Regional Conformity Assessment (RCA)</span> <ExternalLink size={12} />
              </a>
            </p>
          </div>
        </div>

        {/* QR Code Comment Card */}
        <div style={{
          marginTop: '1.25rem',
          padding: '1.25rem',
          background: 'rgba(6, 182, 212, 0.06)',
          border: '1px solid var(--border-cyan)',
          borderRadius: '12px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <QrCode size={18} style={{ color: 'var(--accent-cyan)' }} />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              Submit your comments!
            </h3>
          </div>
          <div style={{
            background: '#ffffff',
            padding: '12px',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-neon-cyan)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img
              src="/qr-code.png"
              alt="Submit your comments QR Code"
              style={{ width: '150px', height: '150px', objectFit: 'contain' }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=" + encodeURIComponent(window.location.href);
              }}
            />
          </div>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            Scan with your phone camera to submit official public testimony and feedback.
          </p>
        </div>
      </section>

      {/* Quick Action Navigation */}
      <section style={{ marginTop: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          <button
            onClick={onClose}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '0.875rem',
              justifyContent: 'center',
              fontSize: '0.813rem',
              fontWeight: 700,
              gap: '0.5rem',
              borderRadius: '10px'
            }}
          >
            <Map size={16} />
            EXPLORE SPATIAL MAP
          </button>
          <button
            onClick={onOpenFilters}
            className="btn-secondary"
            style={{
              width: '100%',
              padding: '0.875rem',
              justifyContent: 'center',
              fontSize: '0.813rem',
              fontWeight: 700,
              gap: '0.5rem',
              borderRadius: '10px'
            }}
          >
            <Database size={16} />
            FILTER & SEARCH PROJECTS
          </button>
        </div>
      </section>
    </aside>
  );
}

export default FactSheetSidebar;
