import React, { useState } from "react";
import { MessageSquare, Info, ShieldCheck, X } from "lucide-react";
import CommentForm from "./CommentForm";

function ProjectPopup({ project, addComment, comments, onClosePopup, isAdmin }) {
  const [showForm, setShowForm] = useState(false);

  const props = project.properties || {};

  return (
    <>
      <div className="project-popup premium-popup animate-slide-up" style={{ padding: '0.875rem' }}>
        <header style={{ 
          marginBottom: '0.75rem', 
          paddingBottom: '0.75rem', 
          borderBottom: '1px solid var(--border-subtle)', 
          display: 'flex', 
          alignItems: 'flex-start', 
          gap: '0.75rem' 
        }}>
          <div style={{ 
            background: 'rgba(14, 165, 233, 0.15)', 
            padding: '8px', 
            borderRadius: '10px', 
            color: 'var(--accent-cyan)',
            border: '1px solid var(--border-cyan)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Info size={18} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.25rem' }}>
              <span style={{ 
                fontSize: '0.65rem', 
                fontWeight: 700, 
                background: 'rgba(139, 92, 246, 0.2)', 
                color: '#c084fc', 
                padding: '0.1rem 0.4rem', 
                borderRadius: '4px',
                border: '1px solid rgba(139, 92, 246, 0.3)'
              }}>
                UPC #{props.UPC || props.upc || props.ID || 'N/A'}
              </span>
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, lineHeight: 1.3 }}>
              {props.Description || props.description || "Transportation Infrastructure Project"}
            </h3>
          </div>
        </header>

        {/* Grid of properties */}
        <div className="project-data-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.5rem 0.75rem',
          marginBottom: '0.875rem',
          maxHeight: '120px',
          overflowY: 'auto',
          paddingRight: '0.25rem'
        }}>
          {Object.entries(props).map(([key, value]) => {
            const k = key.toLowerCase();
            if (k === 'description' || k === 'geom' || k === 'geometry' || k === 'upc') return null;
            return (
              <div key={key} style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '0.15rem', 
                background: 'rgba(255, 255, 255, 0.03)', 
                padding: '0.375rem 0.5rem', 
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
                <span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                  {key}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-primary)', fontWeight: 600, wordBreak: 'break-word' }}>
                  {value === null || value === "" ? '—' : String(value)}
                </span>
              </div>
            );
          })}
        </div>

        <section style={{ marginBottom: '0.875rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
             <MessageSquare size={14} style={{ color: 'var(--accent-cyan)' }} />
             <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
               {isAdmin ? 'Public Testimony Feed' : 'Public Input Stats'}
             </span>
             <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }}></div>
          </div>
          
          {comments.length > 0 ? (
            isAdmin ? (
              <div className="comment-feed" style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                maxHeight: '90px',
                overflowY: 'auto'
              }}>
                {comments.map((c) => (
                  <div key={c._id} className="comment-bubble" style={{ 
                    background: 'rgba(255, 255, 255, 0.03)', 
                    padding: '0.5rem 0.625rem', 
                    borderRadius: '8px', 
                    border: '1px solid var(--border-subtle)' 
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.65rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>{c.name || 'Anonymous Citizen'}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{new Date(c.createdAt || Date.now()).toLocaleDateString()}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>{c.comment || c.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                padding: '0.625rem 0.875rem', 
                background: 'rgba(14, 165, 233, 0.08)', 
                borderRadius: '10px', 
                border: '1px solid var(--border-cyan)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>{comments.length}</div>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>Comments Registered</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Verified Input Period Active</div>
                  </div>
                </div>
                <ShieldCheck size={18} style={{ color: 'var(--accent-emerald)' }} />
              </div>
            )
          ) : (
            <div style={{ textAlign: 'center', padding: '0.75rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', border: '1px dashed var(--border-subtle)' }}>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>No public testimony logged yet. Be the first to comment!</p>
            </div>
          )}
        </section>

        <footer className="popup-actions" style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.625rem' }}>
          <button 
            className="btn-primary" 
            onClick={() => setShowForm(true)}
            style={{ flex: 1, fontSize: '0.75rem', padding: '0.5rem' }}
          >
            <MessageSquare size={14} />
            Submit Public Comment
          </button>
        </footer>
      </div>

      {/* Screen Overlay Modal for Full Unclipped Comment Form */}
      {showForm && (
        <div 
          className="comment-modal-backdrop animate-fade-in"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(7, 10, 18, 0.82)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowForm(false);
            }
          }}
        >
          <div 
            className="glass-card animate-slide-up"
            style={{
              width: '100%',
              maxWidth: '500px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-medium)',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Public Testimony Registration
                </span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: '2px 0 0 0', lineHeight: 1.3 }}>
                  {props.Description || props.description || "Infrastructure Project Input"}
                </h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  UPC #{props.UPC || props.upc || props.ID || 'N/A'}
                </div>
              </div>
              <button 
                onClick={() => setShowForm(false)}
                className="btn-ghost"
                style={{ padding: '4px', borderRadius: '50%', width: '32px', height: '32px', color: 'var(--text-muted)' }}
                title="Close Modal"
              >
                <X size={18} />
              </button>
            </div>

            <CommentForm
              projectId={props.UPC || props.upc || props.ID || props.id}
              addComment={addComment}
              onClosePopup={() => {
                onClosePopup();
                setShowForm(false);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default ProjectPopup;
