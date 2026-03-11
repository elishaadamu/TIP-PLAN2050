import React from "react";
import { X, FileText, Calendar, Users, Info, ExternalLink } from "lucide-react";

const FactSheetModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="modal-backdrop"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(8px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
      onClick={onClose}
    >
      <div 
        className="modal-container animate-slide-up"
        style={{
          background: 'var(--surface)',
          width: '100%',
          maxWidth: '800px',
          maxHeight: '90vh',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg), 0 0 0 1px rgba(0,0,0,0.05)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header style={{
          padding: '1.5rem 2rem',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--grad-surface)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ 
              background: 'var(--grad-primary)', 
              width: '40px', 
              height: '40px', 
              borderRadius: '10px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'white',
              boxShadow: 'var(--shadow-md)'
            }}>
              <FileText size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>Public Comment Period</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                TCAMPO Regional Updates
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{ 
                  background: 'white', 
                  padding: '8px', 
                  borderRadius: '10px', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.origin)}`} 
                    alt="Scan to visit portal" 
                    title="Scan to visit portal"
                    style={{ width: '100px', height: '100px' }}
                  />
                </div>
                <span style={{ fontSize: '0.625rem', fontWeight: 800, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.03em', color: 'var(--text-main)' }}>Scan for Mobile</span>
            </div>
            <button 
              onClick={onClose}
              style={{ 
                background: 'var(--bg-main)', 
                color: 'var(--text-muted)', 
                padding: '8px', 
                borderRadius: '8px',
                border: '1px solid var(--border-light)',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </header>

        {/* Content */}
        <div style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}>
          <section style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '1rem', lineHeight: 1.3 }}>
              FFY 2027-30 Metropolitan Transportation Improvement Program (MTIP) & Draft Regional Conformity Assessment
            </h3>
            <p style={{ color: 'var(--text-main)', fontSize: '1rem', lineHeight: 1.6 }}>
              The Tri‑Cities Area Metropolitan Planning Organization (TCAMPO) develops and updates two major plans that guide regional investments in transportation, multi-modal mobility, freight movement, and road safety projects:
            </p>
          </section>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <div style={{ 
              padding: '1.5rem', 
              background: 'rgba(79, 70, 229, 0.03)', 
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(79, 70, 229, 0.1)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <Info size={18} style={{ color: 'var(--primary)' }} />
                <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700 }}>MTIP</h4>
              </div>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                <strong>Metropolitan Transportation Improvement Program</strong> – A short-range list of projects planned for the Tri-Cities area over the next four years (FY 2027–2030).
              </p>
            </div>

            <div style={{ 
              padding: '1.5rem', 
              background: 'rgba(236, 72, 153, 0.03)', 
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(236, 72, 153, 0.1)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <Info size={18} style={{ color: 'var(--secondary)' }} />
                <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700 }}>LRTP</h4>
              </div>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                <strong>Long‑Range Transportation Plan</strong> – The region’s transportation vision through 2045.
              </p>
            </div>
          </div>

          <section style={{ 
            background: 'var(--grad-dark)', 
            padding: '2rem', 
            borderRadius: 'var(--radius-lg)', 
            color: 'white',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '12px' }}>
                <Users size={24} style={{ color: 'var(--accent)' }} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'white' }}>How to Participate</h3>
            </div>
            
            <div style={{ display: 'flex', gap: '2rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', opacity: 0.8 }}>
                  <Calendar size={14} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Review Period</span>
                </div>
                <p style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0 }}>
                  March 13 – April 12, 2026
                </p>
              </div>
              <div style={{ flex: 1.5 }}>
                 <p style={{ fontSize: '0.9rem', opacity: 0.9, lineHeight: 1.6, margin: 0 }}>
                   Review the <a href="https://craterpdc.org/wp-content/uploads/2026/03/Draft-FFY27-30-TCAMPO-MTIP-03.06.2026.pdf" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'underline' }}>Federal Fiscal year 2027-2030 MTIP</a> and the <a href="https://craterpdc.org/wp-content/uploads/2026/03/Draft-RCA-Richmond-Area-FY27-30-TIP-and-2045-LRTP-for-public-review-final.pdf" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'underline' }}>Draft Regional Conformity Report</a> online to provide your feedback.
                 </p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer style={{
          padding: '1.5rem 2rem',
          background: 'var(--bg-main)',
          borderTop: '1px solid var(--border-light)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '1rem'
        }}>
          <button 
            onClick={onClose}
            className="btn-outline"
            style={{ minWidth: '120px' }}
          >
            I Understand
          </button>
        </footer>
      </div>
    </div>
  );
};

export default FactSheetModal;
