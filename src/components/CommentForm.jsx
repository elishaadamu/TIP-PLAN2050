import React, { useState } from "react";
import Swal from "sweetalert2";

function CommentForm({ projectId, addComment, onClosePopup }) {
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const newComment = {
      projectId,
      name,
      comment,
      timestamp: new Date().toISOString(),
    };

    try {
      await addComment(newComment);
      setName("");
      setComment("");
      
      onClosePopup(); // Close the popup after successful submission
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="premium-form">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="filter-control">
          <label style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Affiliation / Name</label>
          <input
            type="text"
            placeholder="e.g. Petersburg Resident"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        
        <div className="filter-control">
          <label style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Public Testimony</label>
          <textarea
            placeholder="Provide your feedback on this infrastructure project..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            disabled={loading}
            rows={4}
            style={{ 
              width: '100%', 
              padding: '0.75rem', 
              borderRadius: 'var(--radius-sm)', 
              border: '1px solid var(--border-light)',
              background: 'var(--surface)',
              color: 'var(--text-main)',
              fontSize: '0.875rem'
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
          style={{ width: '100%', padding: '0.75rem' }}
        >
          {loading ? "Transmitting..." : "Submit to Registry"}
        </button>
      </div>
    </form>
  );
}

export default CommentForm;
