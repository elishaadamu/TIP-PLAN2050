import React, { useState } from "react";
import { MessageCircle, Info } from "lucide-react";
import CommentForm from "./CommentForm";

function ProjectPopup({ project, addComment, comments, onClosePopup, isAdmin }) {
  const [showForm, setShowForm] = useState(false);

  const props = project.properties || {};
  const geometry = project.geometry || {};

  return (
    <div className="project-popup premium-popup animate-slide-up" style={{ padding: '0.5rem' }}>
      <header style={{ marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ background: 'var(--primary-glow)', padding: '8px', borderRadius: '8px', color: 'var(--primary)' }}>
          <Info size={18} />
        </div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, lineHeight: 1.4 }}>
          {props.Description || props.description || "Infrastructure Node"}
        </h3>
      </header>

      <div className="project-data-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '1rem', 
        marginBottom: '1.5rem',
        maxHeight: '260px',
        overflowY: 'auto',
        paddingRight: '0.5rem'
      }}>
        {Object.entries(props).map(([key, value]) => {
          const k = key.toLowerCase();
          if (k === 'description' || k === 'geom' || k === 'geometry') return null;
          return (
            <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                {key}
              </span>
              <span style={{ fontSize: '0.813rem', color: 'var(--text-main)', fontWeight: 500, wordBreak: 'break-word' }}>
                {value === null || value === "" ? '—' : String(value)}
              </span>
            </div>
          );
        })}
      </div>

      <section style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
           <MessageCircle size={14} style={{ color: 'var(--text-muted)' }} />
           <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
             {isAdmin ? 'Public Testimony' : 'Participation Count'}
           </span>
           <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }}></div>
        </div>
        
        {comments.length > 0 ? (
          isAdmin ? (
            <div className="comment-feed" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {comments.map((c) => (
                <div key={c._id} className="comment-bubble" style={{ 
                  background: 'var(--bg-main)', 
                  padding: '0.75rem', 
                  borderRadius: '8px', 
                  border: '1px solid var(--border-light)' 
                }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.25rem', fontSize: '0.7rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{new Date(c.createdAt || Date.now()).toLocaleDateString()}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-main)', lineHeight: 1.5 }}>{c.comment || c.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '0.75rem', 
              padding: '1.5rem', 
              background: 'var(--bg-main)', 
              borderRadius: '12px', 
              border: '1px solid var(--border-light)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>{comments.length}</div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.813rem', fontWeight: 700, color: 'var(--text-main)' }}>Submissions Logged</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Content restricted to Admin</div>
              </div>
            </div>
          )
        ) : (
          <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--bg-main)', borderRadius: '8px', border: '1px dashed var(--border-light)' }}>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>No public testimony found.</p>
          </div>
        )}
      </section>

      <footer className="popup-actions" style={{ display: 'flex', gap: '1rem', borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
        <button 
          className={showForm ? "btn-outline" : "btn-primary"} 
          onClick={() => setShowForm(!showForm)}
          style={{ flex: 1, fontSize: '0.75rem', padding: '0.625rem' }}
        >
          {showForm ? "Cancel Entry" : "Register Testimony"}
        </button>
      </footer>

      {showForm && (
        <div className="comment-form-panel animate-slide-up" style={{ marginTop: '1rem' }}>
          <CommentForm
            projectId={props.UPC || props.ID || props.id}
            addComment={addComment}
            onClosePopup={() => {
              onClosePopup();
              setShowForm(false);
            }}
          />
        </div>
      )}
    </div>
  );
}

export default ProjectPopup;
