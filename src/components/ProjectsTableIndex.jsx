import React, { useState, useMemo, memo } from "react";

const ProjectsTableIndex = memo(({ geoData, allHeaders, onProjectClick, comments, upcKey, isAdmin }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Memoize comment count lookup
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

  const projects = useMemo(() => geoData?.features || [], [geoData]);

  const totalPages = useMemo(() => Math.ceil(projects.length / itemsPerPage), [projects.length]);

  const currentProjects = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return projects.slice(indexOfFirstItem, indexOfLastItem);
  }, [projects, currentPage]);

  const headers = useMemo(() => {
    if (projects.length === 0) return [];
    return [...Array.from(new Set(projects.flatMap(f => Object.keys(f.properties || {})))), "Feedback", "Geometry"];
  }, [projects]);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="sidebar-inventory animate-slide-up">
      <div
        style={{
          padding: "0 0 1.5rem 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h2 className="gradient-text" style={{ fontSize: '1.5rem', fontWeight: 800 }}>Inventory Registry</h2>
          <p style={{ fontSize: '0.813rem', color: 'var(--secondary)', fontWeight: 700, letterSpacing: '0.05em' }}>
            {projects.length} PROJECTS LOGGED
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={handleExportAllProjects}
            className="btn-outline"
            style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem' }}
          >
            Export CSV
          </button>
        )}
      </div>

      <div className="table-container card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.813rem",
            }}
          >
            <thead>
              <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border-light)' }}>
                {headers.map((header) => (
                  <th
                    key={header}
                    style={{
                      padding: "1rem",
                      textAlign: "left",
                      color: "var(--primary)",
                      fontWeight: "800",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      fontSize: "0.688rem",
                      minWidth: "120px"
                    }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentProjects.map((feature, index) => (
                <tr 
                  key={(feature.properties.UPC || feature.properties.ID || feature.properties.id || index) + "-" + index}
                  style={{ 
                    borderBottom: '1px solid var(--border-light)',
                    transition: 'var(--transition)',
                    cursor: 'pointer'
                  }}
                  className="inventory-row"
                  onClick={() => onProjectClick && onProjectClick(feature)}
                >
                  {headers.map((header) => (
                    <td
                      key={header}
                      style={{ padding: "1rem" }}
                    >
                      {header === "Feedback"
                        ? (
                           <span style={{ 
                             background: getCommentCount(feature.properties[upcKey]) > 0 ? 'rgba(79, 70, 229, 0.1)' : 'rgba(0,0,0,0.05)',
                             color: getCommentCount(feature.properties[upcKey]) > 0 ? 'var(--primary)' : 'var(--text-muted)',
                             padding: '0.2rem 0.4rem',
                             borderRadius: '4px',
                             fontSize: '0.7rem',
                             fontWeight: '700'
                           }}>
                             {getCommentCount(feature.properties[upcKey])}
                           </span>
                        )
                        : header === "Geometry"
                        ? (
                          <span style={{ 
                            background: 'rgba(79, 70, 229, 0.1)', 
                            color: 'var(--primary)', 
                            padding: '0.25rem 0.5rem', 
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            fontWeight: '600',
                            fontFamily: 'monospace'
                          }}>
                            {getGeometryLabel(feature.geometry)}
                          </span>
                        )
                        : (
                          <div style={{ 
                            maxWidth: '180px', 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis', 
                            whiteSpace: 'nowrap',
                            color: 'var(--text-main)'
                          }}>
                            {String(feature.properties[header] || "—")}
                          </div>
                        )
                      }
                    </td>
                  ))}
                </tr>
              ))}
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
            marginTop: "1.5rem",
            padding: "1rem",
            background: "var(--surface)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-light)"
          }}
        >
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
             {currentPage} of {totalPages}
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="btn-outline"
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
            >
              Prev
            </button>
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="btn-outline"
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

export default ProjectsTableIndex;
