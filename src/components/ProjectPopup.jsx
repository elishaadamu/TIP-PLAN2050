import React, { useState } from "react";
import { MessageSquare, Info, ShieldCheck, X, ChevronUp, ChevronDown } from "lucide-react";
import CommentForm from "./CommentForm";

function ProjectPopup({ project, addComment, comments = [], onClosePopup, isAdmin }) {
  const [showForm, setShowForm] = useState(false);

  if (!project) return null;
  const props = project.properties || {};

  return (
    <div className="project-floating-panel glass-card animate-slide-up">
      <header className="panel-header">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', flex: 1 }}>
          <div style={{ 
            background: 'rgba(14, 165, 233, 0.15)', 
            padding: '6px', 
            borderRadius: '8px', 
            color: 'var(--accent-cyan)',
            border: '1px solid var(--border-cyan)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '2px'
          }}>
            <Info size={16} />
          </div>
          <div>
            <span style={{ 
              fontSize: '0.65rem', 
              fontWeight: 700, 
              color: 'var(--accent-cyan)', 
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              UPC #{props.UPC || props.upc || props.ID || 'N/A'}
            </span>
            <h3 style={{ fontSize: '0.938rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, lineHeight: 1.3 }}>
              {props.Description || props.description || "Transportation Infrastructure Project"}
            </h3>
          </div>
        </div>
        
        <button 
          onClick={onClosePopup}
          className="btn-ghost"
          style={{ padding: '4px', borderRadius: '50%', width: '30px', height: '30px', color: 'var(--text-muted)' }}
          title="Close Panel"
        >
          <X size={18} />
        </button>
      </header>

      <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {/* Project Property Attributes Grid */}
        <div className="project-data-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.4rem 0.5rem',
          maxHeight: '130px',
          overflowY: 'auto'
        }}>
          {Object.entries(props).map(([key, value]) => {
            const k = key.toLowerCase();
            if (k === 'description' || k === 'geom' || k === 'geometry' || k === 'upc') return null;
            return (
              <div key={key} style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '0.15rem', 
                background: 'rgba(13, 19, 34, 0.6)', 
                padding: '0.35rem 0.5rem', 
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)'
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

        {/* Public Testimony Stats Section */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
             <MessageSquare size={14} style={{ color: 'var(--accent-cyan)' }} />
             <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
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
                maxHeight: '120px',
                overflowY: 'auto'
              }}>
                {comments.map((c) => (
                  <div key={c._id} className="comment-bubble" style={{ 
                    background: 'rgba(13, 19, 34, 0.8)', 
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
                padding: '0.5rem 0.75rem', 
                background: 'rgba(14, 165, 233, 0.08)', 
                borderRadius: '10px', 
                border: '1px solid var(--border-cyan)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>{comments.length}</div>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>Comments Registered</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Verified Input Period Active</div>
                  </div>
                </div>
                <ShieldCheck size={16} style={{ color: 'var(--accent-emerald)' }} />
              </div>
            )
          ) : (
            <div style={{ textAlign: 'center', padding: '0.625rem', background: 'rgba(13, 19, 34, 0.4)', borderRadius: '8px', border: '1px dashed var(--border-subtle)' }}>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>No public testimony logged yet. Be the first to comment!</p>
            </div>
          )}
        </section>

        {/* Comment Form Section */}
        {!showForm ? (
          <button 
            className="btn-primary" 
            onClick={() => setShowForm(true)}
            style={{ width: '100%', padding: '0.65rem', fontSize: '0.813rem' }}
          >
            <MessageSquare size={15} />
            <span>Submit Public Comment</span>
          </button>
        ) : (
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.625rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
                Testimony Submission Form
              </span>
              <button 
                onClick={() => setShowForm(false)}
                className="btn-ghost"
                style={{ fontSize: '0.7rem', padding: '2px 6px' }}
              >
                Cancel
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
        )}
      </div>
    </div>
  );
}

export default ProjectPopup;
