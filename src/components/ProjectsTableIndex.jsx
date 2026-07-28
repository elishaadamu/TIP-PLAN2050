import React, { useState, useMemo, memo } from "react";
import { Download, ChevronLeft, ChevronRight, FileSpreadsheet, Layers } from "lucide-react";

const ProjectsTableIndex = memo(({ geoData, allHeaders, onProjectClick, comments, upcKey, isAdmin, isLoading }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const commentCountMap = useMemo(() => {
    if (!comments) return new Map();
    const map = new Map();
    comments.forEach(c => {
      const projectId = String(c.projectId);
      map.set(projectId, (map.get(projectId) || 0) + 1);
    });
    return map;
  }, [comments]);

  const getCommentCount = (projectId) => {
    return commentCountMap.get(String(projectId)) || 0;
  };

  const exportToCsv = (data, filename) => {
    if (!data || data.length === 0) {
      alert("No data available to export.");
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
    if (geoData && geoData.features) {
      exportToCsv(geoData.features, "mpo_projects_2027_2030.csv");
    } else {
      alert("No project data available to export.");
    }
  };

  const projects = useMemo(() => geoData?.features || [], [geoData]);

  const totalPages = useMemo(() => Math.ceil(projects.length / itemsPerPage), [projects.length]);

  const currentProjects = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return projects.slice(indexOfFirstItem, indexOfLastItem);
  }, [projects, currentPage]);

  const headers = useMemo(() => {
    if (isLoading) return ["Project Registry", "Status", "Feedback"];
    if (projects.length === 0) return [];
    return [...Array.from(new Set(projects.flatMap(f => Object.keys(f.properties || {})))), "Feedback"];
  }, [projects, isLoading]);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="sidebar-inventory animate-slide-up">
      <div
        style={{
          padding: "0 0 1rem 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h2 className="gradient-text" style={{ fontSize: '1.25rem', fontWeight: 800 }}>Project Inventory</h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 700, letterSpacing: '0.05em' }}>
            {isLoading ? "SYNCING..." : `${projects.length} TOTAL REGISTERED NODES`}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={handleExportAllProjects}
            className="btn-outline"
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', borderRadius: '8px' }}
            disabled={isLoading}
          >
            <Download size={14} />
            Export CSV
          </button>
        )}
      </div>

      <div className="table-container glass-card" style={{ padding: '0', overflow: 'hidden', borderRadius: '12px' }}>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.813rem",
            }}
          >
            <thead>
              <tr style={{ background: 'rgba(11, 15, 25, 0.9)', borderBottom: '1px solid var(--border-subtle)' }}>
                {headers.map((header) => (
                  <th
                    key={header}
                    style={{
                      padding: "0.875rem 1rem",
                      textAlign: "left",
                      color: "var(--accent-cyan)",
                      fontWeight: "800",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      fontSize: "0.65rem",
                      minWidth: "120px"
                    }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={`loader-${i}`} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    {headers.map((h, j) => (
                      <td key={`cell-${i}-${j}`} style={{ padding: "0.875rem 1rem" }}>
                        <div className="shimmer" style={{ height: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', width: j === 0 ? '80%' : '50%' }}></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : currentProjects.length === 0 ? (
                <tr>
                  <td colSpan={headers.length} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No project records match the current filter selection.
                  </td>
                </tr>
              ) : (
                currentProjects.map((feature, index) => (
                  <tr
                    key={(feature.properties.UPC || feature.properties.ID || feature.properties.id || index) + "-" + index}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'var(--transition)',
                      cursor: 'pointer'
                    }}
                    className="inventory-row"
                    onClick={() => onProjectClick && onProjectClick(feature)}
                  >
                    {headers.map((header) => (
                      <td
                        key={header}
                        style={{ padding: "0.875rem 1rem" }}
                      >
                        {header === "Feedback"
                          ? (
                            <span style={{
                              background: getCommentCount(feature.properties[upcKey]) > 0 ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255,255,255,0.04)',
                              color: getCommentCount(feature.properties[upcKey]) > 0 ? 'var(--accent-cyan)' : 'var(--text-muted)',
                              border: getCommentCount(feature.properties[upcKey]) > 0 ? '1px solid var(--border-cyan)' : '1px solid var(--border-subtle)',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '6px',
                              fontSize: '0.7rem',
                              fontWeight: '700'
                            }}>
                              {getCommentCount(feature.properties[upcKey])} Submissions
                            </span>
                          )
                          : (
                            <div style={{
                              maxWidth: '180px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              color: 'var(--text-primary)',
                              fontWeight: 500
                            }}>
                              {String(feature.properties[header] ?? "—")}
                            </div>
                          )
                        }
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "1rem",
            padding: "0.75rem 1rem",
            background: "var(--bg-card)",
            borderRadius: "10px",
            border: "1px solid var(--border-subtle)"
          }}
        >
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Page {currentPage} of {totalPages}
          </span>
          <div style={{ display: 'flex', gap: '0.375rem' }}>
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="btn-outline"
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', borderRadius: '6px' }}
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="btn-outline"
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', borderRadius: '6px' }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

export default ProjectsTableIndex;
