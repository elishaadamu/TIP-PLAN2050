import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Download, FileSpreadsheet, Eye, ChevronLeft, ChevronRight, X } from "lucide-react";

const ProjectsTable = ({ geoData, headers: explicitHeaders, onProjectClick, comments, upcKey }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const getGeometryLabel = (geometry) => {
    if (!geometry) return "No Data";
    if (geometry.type === 'Point') {
      const [lng, lat] = geometry.coordinates;
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
    if (geometry.type === 'LineString') {
      return `Line (${geometry.coordinates.length} pts)`;
    }
    if (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') {
      return "Area Data";
    }
    return geometry.type;
  };

  const exportToCsv = (data, filename) => {
    if (!data || data.length === 0) {
      alert("No data to export.");
      return;
    }

    const csvRows = [];
    // Get headers from the properties of the first feature
    const headers = Object.keys(data[0].properties);
    csvRows.push(headers.join(","));

    // Loop over the features (rows)
    for (const feature of data) {
      const values = headers.map((header) => {
        const escaped = ("" + feature.properties[header]).replace(/"/g, '"');
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
    if (geoData && geoData.features) {
      exportToCsv(geoData.features, "all_projects.csv");
    } else {
      alert("No project data available to export.");
    }
  };

  const handleExportRow = (feature) => {
    exportToCsv([feature], `project_${feature.properties.UPC || 'export'}.csv`);
  };

  const projects = geoData ? geoData.features : [];
  const totalPages = Math.ceil(projects.length / itemsPerPage);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProjects = projects.slice(indexOfFirstItem, indexOfLastItem);

  const getCommentCount = (projectId) => {
    if (!comments) return 0;
    return comments.filter(c => String(c.projectId) === String(projectId)).length;
  };

  const headers = projects.length > 0 
    ? [...Array.from(new Set(projects.flatMap(f => Object.keys(f.properties || {})))), "Feedback", "Geometry"] 
    : [];

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="admin-inventory-view animate-slide-up" style={{ 
      padding: 'clamp(1rem, 5vw, 3rem)', 
      maxWidth: '100%', 
      width: '1400px', 
      margin: '0 auto', 
      position: 'relative',
      boxSizing: 'border-box'
    }}>
      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '2.75rem', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1 }}>Project Inventory</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem', marginTop: '0.5rem', fontWeight: 500 }}>Manage and audit all regional infrastructure projects.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
           <button className="btn-outline" onClick={handleExportAllProjects} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <Download size={16} />
             Export Registry
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

      <div className="card glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.02)', borderBottom: '2px solid var(--border-light)' }}>
                {headers.map((header) => (
                  <th
                    key={header}
                    style={{
                      padding: "1.25rem 1rem",
                      textAlign: "left",
                      color: "var(--text-muted)",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      fontSize: "0.75rem",
                      minWidth: '150px'
                    }}
                  >
                    {header}
                  </th>
                ))}
                <th style={{ padding: "1.25rem 1rem", textAlign: "right", color: "var(--text-muted)", fontSize: '0.75rem' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentProjects.length > 0 ? (
                currentProjects.map((feature, index) => (
                  <tr 
                    key={feature.properties.UPC || feature.properties.ID || index}
                    style={{ borderBottom: '1px solid var(--border-light)', transition: 'var(--transition)', cursor: 'pointer' }}
                    onClick={() => onProjectClick && onProjectClick(feature)}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {headers.map((header) => (
                      <td
                        key={header}
                        style={{ padding: "1.25rem 1rem", color: "var(--text-main)" }}
                      >
                        {header === "Feedback"
                          ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                              <span style={{ 
                                background: getCommentCount(feature.properties[upcKey]) > 0 ? 'rgba(79, 70, 229, 0.1)' : 'rgba(0,0,0,0.05)',
                                color: getCommentCount(feature.properties[upcKey]) > 0 ? 'var(--primary)' : 'var(--text-muted)',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: '700'
                              }}>
                                {getCommentCount(feature.properties[upcKey])}
                              </span>
                            </div>
                          )
                          : header === "Geometry"
                          ? (
                            <span style={{ 
                              background: 'rgba(79, 70, 229, 0.1)', 
                              color: 'var(--primary)', 
                              padding: '0.3rem 0.6rem', 
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: '600'
                            }}>
                              {getGeometryLabel(feature.geometry)}
                            </span>
                          )
                          : (
                            <div style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {String(feature.properties[header] || "—")}
                            </div>
                          )
                        }
                      </td>
                    ))}
                    <td style={{ padding: "1rem", textAlign: "right" }}>
                      <button 
                         className="btn-outline" 
                         onClick={(e) => { e.stopPropagation(); handleExportRow(feature); }}
                         style={{ padding: '0.5rem', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                         title="Export Details"
                       >
                         <Eye size={16} />
                       </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={headers.length + 1} style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No infrastructure data found in the current dataset.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Improved Pagination */}
        {totalPages > 1 && (
          <div style={{ 
            padding: '1.5rem', 
            borderTop: '1px solid var(--border-light)', 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '0.5rem',
            background: 'var(--surface)' 
          }}>
            <button
              className="btn-outline"
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem' }}
            >
              <ChevronLeft size={20} />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                className={currentPage === i+1 ? "btn-primary" : "btn-outline"}
                onClick={() => paginate(i + 1)}
                style={{ minWidth: '40px', fontWeight: '600' }}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="btn-outline"
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem' }}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsTable;
