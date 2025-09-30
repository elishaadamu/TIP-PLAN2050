import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "./GeoJSONManager.css"; // import styles

function GeoJSONManager({
  setGeoData,
  currentGeoDataFilename,
  setCurrentGeoDataFilename,
}) {
  const [availableGeoJSONs, setAvailableGeoJSONs] = useState([]);
  const [selectedFile, setSelectedFile] = useState("");
  const [fileToUpload, setFileToUpload] = useState(null);

  const fetchAvailableGeoJSONs = useCallback(async () => {
    try {
      const response = await axios.get(
        "https://ecointeractive.onrender.com/api/geojson/list"
      );
      setAvailableGeoJSONs(response.data);
    } catch (error) {
      Swal.fire("Error", "Failed to load available GeoJSON files.", "error");
    }
  }, []);

  useEffect(() => {
    const fetchInitialGeoJSONData = async () => {
      try {
        const response = await axios.get(
          "https://ecointeractive.onrender.com/api/geojson/active"
        );
        setGeoData(response.data.geojsonData);
        setCurrentGeoDataFilename(response.data.filename);
        setSelectedFile(response.data.filename);
      } catch (error) {
        Swal.fire("Error", "Failed to load initial GeoJSON data.", "error");
      }
    };

    fetchInitialGeoJSONData();
    fetchAvailableGeoJSONs();
  }, [setGeoData, setCurrentGeoDataFilename, fetchAvailableGeoJSONs]);

  const handleFileChange = (e) => setSelectedFile(e.target.value);

  const handleSetActiveGeoJSON = async () => {
    if (!selectedFile) {
      Swal.fire("Warning", "Please select a GeoJSON file.", "warning");
      return;
    }

    try {
      await axios.post(
        "https://ecointeractive.onrender.com/api/geojson/set-active",
        {
          filename: selectedFile,
        }
      );

      const response = await axios.get(
        "https://ecointeractive.onrender.com/api/geojson/active"
      );
      setGeoData(response.data.geojsonData);
      setCurrentGeoDataFilename(response.data.filename);

      Swal.fire(
        "Success",
        `${selectedFile} is now the active GeoJSON file!`,
        "success"
      );
    } catch (error) {
      Swal.fire("Error", "Failed to set active GeoJSON file.", "error");
    }
  };

  const handleFileChangeForUpload = (e) => setFileToUpload(e.target.files[0]);

  const handleFileUpload = async () => {
    if (!fileToUpload) {
      Swal.fire("Warning", "Please select a file to upload.", "warning");
      return;
    }

    const formData = new FormData();
    formData.append("geojson", fileToUpload);

    try {
      await axios.post(
        "https://ecointeractive.onrender.com/api/geojson/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      Swal.fire(
        "Success",
        `${fileToUpload.name} uploaded successfully!`,
        "success"
      );
      setFileToUpload(null);
      fetchAvailableGeoJSONs();
    } catch (error) {
      Swal.fire("Error", "Failed to upload GeoJSON file.", "error");
    }
  };

  const handleDeleteAllGeoJSONs = async () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will not be able to recover these files!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete all!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(
            "https://ecointeractive.onrender.com/api/geojson/delete-all"
          );
          Swal.fire(
            "Deleted!",
            "All GeoJSON files have been deleted.",
            "success"
          );
          fetchAvailableGeoJSONs();
          setGeoData(null);
          setCurrentGeoDataFilename(null);
          setSelectedFile("");
        } catch (error) {
          Swal.fire("Error", "Failed to delete GeoJSON files.", "error");
        }
      }
    });
  };

  return (
    <div className="geojson-manager">
      {/* Set Active Section */}
      <div className="card">
        <h2>Manage GeoJSON Projects</h2>
        <p>
          Select a GeoJSON file to make it the active project data for all
          users.
        </p>

        <label htmlFor="geojson-select">Available GeoJSON Files:</label>
        <select
          id="geojson-select"
          value={selectedFile}
          onChange={handleFileChange}
          className="select-input"
        >
          <option value="">-- Select a file --</option>
          {availableGeoJSONs.map((filename) => (
            <option key={filename} value={filename}>
              {filename}
            </option>
          ))}
        </select>

        <button className="btn btn-primary" onClick={handleSetActiveGeoJSON}>
          Set as Active GeoJSON
        </button>

        {currentGeoDataFilename && (
          <p className="active-file">
            Currently Active: <strong>{currentGeoDataFilename}</strong>
          </p>
        )}
      </div>

      {/* Upload Section */}
      <div className="card">
        <h2>Upload New GeoJSON File</h2>
        <p>Select a GeoJSON file from your computer to upload to the server.</p>

        <input
          type="file"
          accept=".geojson"
          onChange={handleFileChangeForUpload}
        />
        <button className="btn btn-success" onClick={handleFileUpload}>
          Upload GeoJSON
        </button>
      </div>

      {/* List & Delete Section */}
      <div className="card">
        <h2>Manage Stored GeoJSON Files</h2>
        {availableGeoJSONs.length > 0 ? (
          <table className="file-table">
            <thead>
              <tr>
                <th>Filename</th>
              </tr>
            </thead>
            <tbody>
              {availableGeoJSONs.map((filename) => (
                <tr key={filename}>
                  <td>{filename}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No GeoJSON files found.</p>
        )}

        <button className="btn btn-danger" onClick={handleDeleteAllGeoJSONs}>
          Delete All GeoJSON Files
        </button>
      </div>
    </div>
  );
}

export default GeoJSONManager;
