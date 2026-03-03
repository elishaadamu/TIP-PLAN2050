import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import { X, Download, Trash2, Eye } from "lucide-react";

const CommentsTable = ({ comments, setComments }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const exportToCsv = (data, filename) => {
    const csvRows = [];
    // Get headers
    const headers = Object.keys(data[0] || {});
    csvRows.push(headers.join(","));

    // Loop over the rows
    for (const row of data) {
      const values = headers.map((header) => {
        const escaped = ("" + row[header]).replace(/"/g, '"');
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
    exportToCsv(comments, "all_comments.csv");
  };

  const handleExportRow = (comment) => {
    exportToCsv([comment], `comment_${comment.id || new Date().getTime()}.csv`);
  };

  const handleDeleteAllComments = async () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete all!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(
            "https://ecointeractive.onrender.com/api/comments"
          );
          setComments([]); // Clear comments in state
          Swal.fire("Deleted!", "All comments have been deleted.", "success");
        } catch (error) {
          console.error("Failed to delete all comments:", error);
          Swal.fire("Error!", "Failed to delete comments.", "error");
        }
      }
    });
  };

  const totalPages = Math.ceil(comments.length / itemsPerPage);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentComments = comments.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="comments-view animate-slide-up" style={{ 
      padding: 'clamp(1rem, 5vw, 3rem)', 
      maxWidth: '100%', 
      width: '1200px', 
      margin: '0 auto', 
      position: 'relative',
      boxSizing: 'border-box'
    }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.75rem', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1 }}>Project Comments</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem', marginTop: '0.5rem', fontWeight: 500 }}>Review and audit community feedback on regional infrastructure.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button className="btn-outline" onClick={handleExportAll} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <Download size={16} />
             Export Registry
          </button>
          <button className="btn-outline" onClick={handleDeleteAllComments} style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <Trash2 size={16} />
             Purge All
          </button>
          <Link 
            to="/" 
            className="btn-ghost" 
            style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'var(--transition)'
            }}
            title="Close and return to Map"
          >
            <X size={24} />
          </Link>
        </div>
      </header>

      <div className="card glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.02)', borderBottom: '2px solid var(--border)' }}>
                <th style={{ padding: '1.25rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)' }}>Project ID</th>
                <th style={{ padding: '1.25rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)' }}>Comment</th>
                <th style={{ padding: '1.25rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)' }}>Date</th>
                <th style={{ padding: '1.25rem', textAlign: 'right', fontWeight: '600', color: 'var(--text-muted)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentComments.length > 0 ? (
                currentComments.map((comment, index) => (
                  <tr key={comment._id || index} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '1rem', fontWeight: '600', color: 'var(--primary)' }}>
                      {comment.projectId || (indexOfFirstItem + index + 1)}
                    </td>
                    <td style={{ padding: '1rem', maxWidth: '300px' }}>
                      <div style={{ 
                        whiteSpace: 'nowrap', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis' 
                      }} title={comment.comment}>
                        {comment.comment}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      {new Date(comment.timestamp).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button 
                         className="btn-outline" 
                         onClick={() => handleExportRow(comment)}
                         style={{ padding: '0.5rem', borderRadius: '6px' }}
                         title="Export Row"
                       >
                         <Eye size={16} />
                       </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No comments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ 
            padding: '1.25rem', 
            borderTop: '1px solid var(--border)', 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '0.5rem',
            background: 'rgba(0,0,0,0.01)'
          }}>
            <button
              className="btn-outline"
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              style={{ padding: '0.5rem 1rem' }}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                className={currentPage === i + 1 ? "btn-primary" : "btn-outline"}
                onClick={() => paginate(i + 1)}
                style={{ padding: '0.5rem 1rem', minWidth: '40px' }}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="btn-outline"
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{ padding: '0.5rem 1rem' }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentsTable;
