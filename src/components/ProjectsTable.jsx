import React, { useState } from "react";

const ProjectsTable = ({ geoData }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  const projects = geoData ? geoData.features : [];
  const totalPages = Math.ceil(projects.length / itemsPerPage);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProjects = projects.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div
      style={{
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      <div
        style={{
          padding: "0px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>{geoData?.name || "Projects"}</h2>
        <button
          onClick={handleExportAllProjects}
          style={{
            padding: "10px 15px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Export All Projects
        </button>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "14px",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f2f2f2" }}>
              <th
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  textAlign: "left",
                  minWidth: "100px", // Added minWidth for better mobile display
                }}
              >
                UPC
              </th>
              <th
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  textAlign: "left",
                  minWidth: "200px",
                }}
              >
                Description
              </th>
              <th
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  textAlign: "left",
                  minWidth: "150px",
                }}
              >
                Scope
              </th>
              <th
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  textAlign: "left",
                  minWidth: "80px",
                }}
              >
                Type
              </th>
              <th
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  textAlign: "left",
                  minWidth: "120px",
                }}
              >
                County
              </th>
              {/* Add more headers as needed based on your geoData properties */}
            </tr>
          </thead>
          <tbody>
            {currentProjects.map((feature, index) => (
              <tr key={feature.properties.UPC + "-" + index}>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {feature.properties.UPC}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {feature.properties.Description}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {feature.properties.Scope}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {feature.properties.Type}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {feature.properties.County}
                </td>
                {/* Add more data cells as needed */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "20px",
        }}
      >
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            padding: "8px 15px",
            margin: "0 5px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Previous
        </button>
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index}
            onClick={() => paginate(index + 1)}
            style={{
              padding: "8px 15px",
              margin: "0 5px",
              backgroundColor:
                currentPage === index + 1 ? "#0056b3" : "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            {index + 1}
          </button>
        ))}
        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            padding: "8px 15px",
            margin: "0 5px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ProjectsTable;
