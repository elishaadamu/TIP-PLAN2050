import React, { useState } from "react";
import { Send, Loader2, MessageSquare } from "lucide-react";

function CommentForm({ projectId, addComment, onClosePopup }) {
  const [comment, setComment] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setLoading(true);

    const newComment = {
      projectId,
      name: name.trim() || "Anonymous Citizen",
      comment: comment.trim(),
      timestamp: new Date().toISOString(),
    };

    try {
      await addComment(newComment);
      setComment("");
      setName("");
      onClosePopup();
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '0.875rem', background: 'rgba(11, 15, 25, 0.95)', border: '1px solid var(--border-cyan)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <MessageSquare size={14} style={{ color: 'var(--accent-cyan)' }} />
          <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent-cyan)', letterSpacing: '0.05em' }}>
            Submit Official Testimony
          </span>
        </div>

        <div>
          <label style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
            Your Name / Affiliation (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Jane Doe, Resident"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '0.5rem 0.75rem', 
              fontSize: '0.813rem',
              background: 'rgba(17, 24, 39, 0.8)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              color: 'var(--text-primary)'
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
            Public Testimony / Feedback *
          </label>
          <textarea
            placeholder="Provide your constructive feedback or questions on this infrastructure project..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            disabled={loading}
            rows={3}
            style={{ 
              width: '100%', 
              padding: '0.625rem 0.75rem', 
              borderRadius: '6px', 
              border: '1px solid var(--border-subtle)',
              background: 'rgba(17, 24, 39, 0.8)',
              color: 'var(--text-primary)',
              fontSize: '0.813rem',
              resize: 'none'
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !comment.trim()}
          className="btn-primary"
          style={{ 
            width: '100%', 
            padding: '0.625rem', 
            fontSize: '0.78rem',
            borderRadius: '6px',
            gap: '0.5rem'
          }}
        >
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Registering Input...</span>
            </>
          ) : (
            <>
              <Send size={14} />
              <span>Submit Testimony</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default CommentForm;
