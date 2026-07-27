import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Download, Eye, ChevronLeft, ChevronRight, X, Database, Search } from "lucide-react";

const ProjectsTable = ({ geoData, headers: explicitHeaders, onProjectClick, comments, upcKey }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;

  const exportToCsv = (data, filename) => {
    if (!data || data.length === 0) {
      alert("No data to export.");
      return;
    }

    const csvRows = [];
    const headers = Object.keys(data[0].properties);
    csvRows.push(headers.join(","));

    for (const feature of data) {
      const values = headers.map((header) => {
        const escaped = ("" + (feature.properties[header] ?? "")).replace(/"/g, '""');
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

  const handleExportAllProjects = () => {
    if (filteredProjects && filteredProjects.length > 0) {
      exportToCsv(filteredProjects, "mpo_inventory_full.csv");
    } else {
      alert("No project data available to export.");
    }
  };

  const handleExportRow = (feature) => {
    exportToCsv([feature], `project_${feature.properties.UPC || 'export'}.csv`);
  };

  const projects = geoData ? geoData.features : [];

  const filteredProjects = projects.filter((feature) => {
    const term = searchTerm.toLowerCase();
    if (!term) return true;
    return Object.values(feature.properties || {}).some(val =>
      String(val).toLowerCase().includes(term)
    );
  });

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProjects = filteredProjects.slice(indexOfFirstItem, indexOfLastItem);

  const getCommentCount = (projectId) => {
    if (!comments) return 0;
    return comments.filter(c => String(c.projectId) === String(projectId)).length;
  };

  const headers = projects.length > 0
    ? [...Array.from(new Set(projects.flatMap(f => Object.keys(f.properties || {})))), "Feedback"]
    : [];

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="admin-inventory-view animate-slide-up" style={{
      padding: 'clamp(1rem, 4vw, 2.5rem)',
      maxWidth: '1400px',
      margin: '0 auto',
      width: '100%',
      position: 'relative'
    }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.5rem' }}>
            <Database size={24} style={{ color: 'var(--accent-cyan)' }} />
            <h1 className="gradient-text" style={{ fontSize: '2.25rem', fontWeight: 800 }}>Master Project Inventory</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.938rem' }}>Full GIS dataset management and project parameter audit.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button className="btn-outline" onClick={handleExportAllProjects} style={{ fontSize: '0.813rem', borderRadius: '8px' }}>
            <Download size={16} />
            Export CSV
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

      {/* Search Bar */}
      <div style={{ marginBottom: '1.25rem', position: 'relative', maxWidth: '400px' }}>
        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Filter master inventory by keyword or UPC..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          style={{ paddingLeft: '38px', background: 'rgba(17, 24, 39, 0.8)', border: '1px solid var(--border-subtle)', borderRadius: '10px' }}
        />
      </div>

      <div className="glass-card" style={{ padding: '0', overflow: 'hidden', borderRadius: '16px' }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: '0.813rem' }}>
            <thead>
              <tr style={{ background: 'rgba(11, 15, 25, 0.9)', borderBottom: '1px solid var(--border-subtle)' }}>
                {headers.map((header) => (
                  <th
                    key={header}
                    style={{
                      padding: "1rem 1rem",
                      textAlign: "left",
                      color: "var(--accent-cyan)",
                      fontWeight: "800",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      fontSize: "0.65rem",
                      minWidth: '140px'
                    }}
                  >
                    {header}
                  </th>
                ))}
                <th style={{ padding: "1rem 1rem", textAlign: "right", color: "var(--accent-cyan)", fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentProjects.length > 0 ? (
                currentProjects.map((feature, index) => (
                  <tr
                    key={(feature.properties.UPC || feature.properties.ID || index) + "-" + index}
                    style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'var(--transition)', cursor: 'pointer' }}
                    onClick={() => onProjectClick && onProjectClick(feature)}
                    className="inventory-row"
                  >
                    {headers.map((header) => (
                      <td
                        key={header}
                        style={{ padding: "0.875rem 1rem", color: "var(--text-primary)" }}
                      >
                        {header === "Feedback"
                          ? (
                            <span style={{
                              background: getCommentCount(feature.properties[upcKey]) > 0 ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255,255,255,0.04)',
                              color: getCommentCount(feature.properties[upcKey]) > 0 ? 'var(--accent-cyan)' : 'var(--text-muted)',
                              border: getCommentCount(feature.properties[upcKey]) > 0 ? '1px solid var(--border-cyan)' : '1px solid var(--border-subtle)',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '6px',
                              fontSize: '0.7rem',
                              fontWeight: '700'
                            }}>
                              {getCommentCount(feature.properties[upcKey])} Submissions
                            </span>
                          )
                          : (
                            <div style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {String(feature.properties[header] ?? "—")}
                            </div>
                          )
                        }
                      </td>
                    ))}
                    <td style={{ padding: "0.875rem 1rem", textAlign: "right" }}>
                      <button
                        className="btn-outline"
                        onClick={(e) => { e.stopPropagation(); handleExportRow(feature); }}
                        style={{ padding: '0.35rem 0.65rem', borderRadius: '6px' }}
                        title="Export Project CSV"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={headers.length + 1} style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No infrastructure project matching current query.
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
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Page {currentPage} of {totalPages} ({filteredProjects.length} total features)
            </span>
            <div style={{ display: 'flex', gap: '0.375rem' }}>
              <button
                className="btn-outline"
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                style={{ padding: '0.35rem 0.65rem', borderRadius: '6px' }}
              >
                <ChevronLeft size={14} />
              </button>
              <button
                className="btn-outline"
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{ padding: '0.35rem 0.65rem', borderRadius: '6px' }}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsTable;
