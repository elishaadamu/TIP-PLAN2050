import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import { X, Download, Trash2, Search, MessageSquare, ShieldAlert, ChevronLeft, ChevronRight, QrCode } from "lucide-react";

const CommentsTable = ({ comments = [], setComments }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [showQrModal, setShowQrModal] = useState(false);
  const itemsPerPage = 8;

  const exportToCsv = (data, filename) => {
    if (!data || data.length === 0) return;
    const csvRows = [];
    const headers = Object.keys(data[0] || {});
    csvRows.push(headers.join(","));

    for (const row of data) {
      const values = headers.map((header) => {
        const escaped = ("" + (row[header] ?? "")).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(","));
    }

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", filename);
    a.click();
  };

  const handleExportAll = () => {
    exportToCsv(filteredComments, "public_testimony_logs.csv");
  };

  const handleDeleteAllComments = async () => {
    Swal.fire({
      title: "Purge All Comments?",
      text: "This action will permanently delete all public testimony submissions!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#06b6d4",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Yes, Purge Registry",
      background: "#111827",
      color: "#f8fafc"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete("https://ecointeractive.onrender.com/api/comments");
          setComments([]);
          Swal.fire({
            title: "Purged!",
            text: "All public testimony logs deleted.",
            icon: "success",
            background: "#111827",
            color: "#f8fafc"
          });
        } catch (error) {
          console.error("Failed to delete comments:", error);
          Swal.fire({
            title: "Error!",
            text: "Failed to purge comments.",
            icon: "error",
            background: "#111827",
            color: "#f8fafc"
          });
        }
      }
    });
  };

  const filteredComments = comments.filter((c) => {
    const text = String(c.comment || c.text || "").toLowerCase();
    const pid = String(c.projectId || "").toLowerCase();
    const name = String(c.name || "").toLowerCase();
    const term = searchTerm.toLowerCase();
    return text.includes(term) || pid.includes(term) || name.includes(term);
  });

  const totalPages = Math.ceil(filteredComments.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentComments = filteredComments.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="comments-view animate-slide-up" style={{ 
      padding: 'clamp(1rem, 4vw, 2.5rem)', 
      maxWidth: '1200px', 
      margin: '0 auto', 
      width: '100%',
      position: 'relative'
    }}>
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.5rem' }}>
            <MessageSquare size={24} style={{ color: 'var(--accent-cyan)' }} />
            <h1 className="gradient-text" style={{ fontSize: '2.25rem', fontWeight: 800 }}>Public Feedback Registry</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.938rem' }}>Review and audit public testimony submitted for 2027–2030 TIP projects.</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button className="btn-primary" onClick={() => setShowQrModal(true)} style={{ fontSize: '0.813rem', borderRadius: '8px', gap: '0.375rem' }}>
             <QrCode size={16} />
             Submit Comments QR
          </button>
          <button className="btn-outline" onClick={handleExportAll} style={{ fontSize: '0.813rem', borderRadius: '8px' }}>
             <Download size={16} />
             Export CSV
          </button>
          <button className="btn-outline" onClick={handleDeleteAllComments} style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.1)', fontSize: '0.813rem', borderRadius: '8px' }}>
             <Trash2 size={16} />
             Purge All
          </button>
          <Link 
            to="/" 
            className="btn-ghost" 
            style={{ 
              width: '38px', 
              height: '38px', 
              borderRadius: '50%', 
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)'
            }}
            title="Return to Map"
          >
            <X size={20} />
          </Link>
        </div>
      </header>

      {/* Search Input Bar */}
      <div style={{ marginBottom: '1.25rem', position: 'relative', maxWidth: '400px' }}>
        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input 
          type="text"
          placeholder="Filter feedback by UPC, comment, or name..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          style={{ paddingLeft: '38px', background: 'rgba(17, 24, 39, 0.8)', border: '1px solid var(--border-subtle)', borderRadius: '10px' }}
        />
      </div>

      <div className="glass-card" style={{ padding: '0', overflow: 'hidden', borderRadius: '16px' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(11, 15, 25, 0.9)', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '1rem 1.25rem', textAlign: 'left', fontWeight: '800', color: 'var(--accent-cyan)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Project UPC / ID</th>
                <th style={{ padding: '1rem 1.25rem', textAlign: 'left', fontWeight: '800', color: 'var(--accent-cyan)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Citizen Name</th>
                <th style={{ padding: '1rem 1.25rem', textAlign: 'left', fontWeight: '800', color: 'var(--accent-cyan)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Testimony Detail</th>
                <th style={{ padding: '1rem 1.25rem', textAlign: 'left', fontWeight: '800', color: 'var(--accent-cyan)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date Recorded</th>
              </tr>
            </thead>
            <tbody>
              {currentComments.length > 0 ? (
                currentComments.map((comment, index) => (
                  <tr key={comment._id || index} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'var(--transition)' }} className="inventory-row">
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span style={{ 
                        background: 'rgba(6, 182, 212, 0.15)', 
                        color: 'var(--accent-cyan)', 
                        border: '1px solid var(--border-cyan)',
                        padding: '0.2rem 0.5rem', 
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '700'
                      }}>
                        UPC #{comment.projectId || 'General'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.875rem' }}>
                      {comment.name || 'Anonymous Citizen'}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', maxWidth: '400px' }}>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5 }}>
                        {comment.comment || comment.text}
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                      {new Date(comment.timestamp || comment.createdAt || Date.now()).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No testimony entries found matching your query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div style={{ 
            padding: '1rem 1.25rem', 
            borderTop: '1px solid var(--border-subtle)', 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center', 
            background: 'rgba(11, 15, 25, 0.6)'
          }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Page {currentPage} of {totalPages} ({filteredComments.length} total entries)
            </span>
            <div style={{ display: 'flex', gap: '0.375rem' }}>
              <button
                className="btn-outline"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                style={{ padding: '0.35rem 0.65rem', borderRadius: '6px' }}
              >
                <ChevronLeft size={14} />
              </button>
              <button
                className="btn-outline"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                style={{ padding: '0.35rem 0.65rem', borderRadius: '6px' }}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {showQrModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div className="glass-card animate-scale-up" style={{
            background: '#0d1322',
            border: '1px solid var(--border-cyan)',
            borderRadius: '16px',
            padding: '2rem',
            maxWidth: '380px',
            width: '100%',
            textAlign: 'center',
            boxShadow: 'var(--shadow-neon-cyan)',
            position: 'relative'
          }}>
            <button 
              onClick={() => setShowQrModal(false)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'rgba(255,255,255,0.08)',
                border: 'none',
                color: 'var(--text-secondary)',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
              Submit your comments!
            </h2>

            <div style={{
              background: '#ffffff',
              padding: '16px',
              borderRadius: '16px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              boxShadow: '0 8px 30px rgba(6, 182, 212, 0.25)'
            }}>
              <img 
                src="/qr-code.png" 
                alt="Submit your comments QR Code" 
                style={{ width: '220px', height: '220px', objectFit: 'contain' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=" + encodeURIComponent(window.location.href);
                }}
              />
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>
              Scan this QR code with your mobile camera to quickly open public testimony submission and share feedback on TIP-PLAN2050 projects.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentsTable;
