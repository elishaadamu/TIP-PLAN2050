import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import { Target, Upload, FileJson, Trash2, X, CheckCircle, Database, Server } from "lucide-react";
import { fetchSpatialData, parseFgbBuffer } from "../utils/fgbLoader";
import "./GeoJSONManager.css";

const inMemorySpatialCache = new Map();

function GeoJSONManager({
  setGeoData,
  currentGeoDataFilename,
  setCurrentGeoDataFilename,
}) {
  const [availableGeoJSONs, setAvailableGeoJSONs] = useState([]);
  const [selectedFile, setSelectedFile] = useState(currentGeoDataFilename || "");
  const [fileToUpload, setFileToUpload] = useState(null);

  const fetchAvailableGeoJSONs = useCallback(async () => {
    try {
      const response = await axios.get(
        "https://ecointeractive.onrender.com/api/geojson/list"
      );
      setAvailableGeoJSONs(response.data || []);
    } catch (error) {
      console.error("Error fetching available datasets:", error);
      setAvailableGeoJSONs([]);
    }
  }, []);

  useEffect(() => {
    const fetchInitialGeoJSONData = async () => {
      if (currentGeoDataFilename) {
        setSelectedFile(currentGeoDataFilename);
        return;
      }
      try {
        const response = await axios.get(
          "https://ecointeractive.onrender.com/api/geojson/active"
        );
        if (response.data && response.data.geojsonData) {
          setGeoData(response.data.geojsonData);
          setCurrentGeoDataFilename(response.data.filename);
          setSelectedFile(response.data.filename);
        } else {
          setGeoData({ type: "FeatureCollection", features: [] });
          setCurrentGeoDataFilename(null);
          setSelectedFile("");
        }
      } catch (error) {
        setGeoData({ type: "FeatureCollection", features: [] });
        setCurrentGeoDataFilename(null);
        setSelectedFile("");
      }
    };

    fetchInitialGeoJSONData();
    fetchAvailableGeoJSONs();
  }, [setGeoData, setCurrentGeoDataFilename, fetchAvailableGeoJSONs, currentGeoDataFilename]);

  const handleFileChange = (e) => setSelectedFile(e.target.value);

  const handleSetActiveGeoJSON = async () => {
    if (!selectedFile) {
      Swal.fire({
        title: "Warning",
        text: "Please select a dataset file.",
        icon: "warning",
        background: "#111827",
        color: "#f8fafc"
      });
      return;
    }

    try {
      let spatialData;
      if (inMemorySpatialCache.has(selectedFile)) {
        spatialData = inMemorySpatialCache.get(selectedFile);
      } else {
        // First attempt: Fetch dataset directly from MongoDB API
        try {
          const apiRes = await axios.get(
            `https://ecointeractive.onrender.com/api/geojson/get/${encodeURIComponent(selectedFile)}`
          );
          if (apiRes.data && apiRes.data.geojsonData) {
            spatialData = apiRes.data.geojsonData;
          }
        } catch (apiErr) {
          try {
            const activeRes = await axios.get("https://ecointeractive.onrender.com/api/geojson/active");
            if (activeRes.data && activeRes.data.filename === selectedFile && activeRes.data.geojsonData) {
              spatialData = activeRes.data.geojsonData;
            }
          } catch (e) { }
        }

        // Second attempt: Fetch static file from server
        if (!spatialData) {
          const url = selectedFile.startsWith("http") ? selectedFile : `${window.location.origin}/${selectedFile}`;
          spatialData = await fetchSpatialData(url);
        }
      }

      setGeoData(spatialData);
      setCurrentGeoDataFilename(selectedFile);
      localStorage.setItem("activeGeoDataFilename", selectedFile);
      try {
        localStorage.setItem("activeSpatialDataContent_" + selectedFile, JSON.stringify(spatialData));
      } catch (e) { }

      // Sync with backend API
      try {
        await axios.post(
          "https://ecointeractive.onrender.com/api/geojson/set-active",
          { filename: selectedFile, geojsonData: spatialData }
        );
      } catch (bgErr) {
        console.warn("Backend sync note:", bgErr);
      }

      Swal.fire({
        title: "Success",
        text: `${selectedFile} is now deployed as the active dataset (${spatialData.features.length} points)!`,
        icon: "success",
        background: "#111827",
        color: "#f8fafc"
      });
    } catch (error) {
      console.error("Set active dataset error:", error);
      Swal.fire({
        title: "Error",
        text: `Failed to set active spatial dataset ${selectedFile}: ${error.message}`,
        icon: "error",
        background: "#111827",
        color: "#f8fafc"
      });
    }
  };

  const handleFileChangeForUpload = (e) => setFileToUpload(e.target.files[0]);

  const handleFileUpload = async () => {
    if (!fileToUpload) {
      Swal.fire({
        title: "Warning",
        text: "Please select a file to upload.",
        icon: "warning",
        background: "#111827",
        color: "#f8fafc"
      });
      return;
    }

    try {
      const spatialData = await fetchSpatialData(fileToUpload);
      const filename = fileToUpload.name;

      inMemorySpatialCache.set(filename, spatialData);
      setGeoData(spatialData);
      setCurrentGeoDataFilename(filename);
      localStorage.setItem("activeGeoDataFilename", filename);
      try {
        localStorage.setItem("activeSpatialDataContent_" + filename, JSON.stringify(spatialData));
      } catch (e) { }

      if (!availableGeoJSONs.includes(filename)) {
        setAvailableGeoJSONs(prev => [filename, ...prev]);
      }
      setSelectedFile(filename);

      Swal.fire({
        title: "Success",
        text: `${filename} uploaded & deployed as active dataset with ${spatialData.features.length} points!`,
        icon: "success",
        background: "#111827",
        color: "#f8fafc"
      });

      setFileToUpload(null);

      // Send to backend API in background
      try {
        const formData = new FormData();
        formData.append("geojson", fileToUpload);
        await axios.post(
          "https://ecointeractive.onrender.com/api/geojson/upload",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        await axios.post(
          "https://ecointeractive.onrender.com/api/geojson/set-active",
          { filename, geojsonData: spatialData }
        );
      } catch (bgErr) {
        console.warn("Background server sync note:", bgErr);
      }

    } catch (error) {
      console.error("Upload error:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to parse or upload spatial dataset file.",
        icon: "error",
        background: "#111827",
        color: "#f8fafc"
      });
    }
  };

  const handleDeleteSingleDataset = (filenameToDelete) => {
    Swal.fire({
      title: `Delete Dataset?`,
      text: `Are you sure you want to delete ${filenameToDelete} from the database?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Delete File",
      background: "#111827",
      color: "#f8fafc"
    }).then(async (result) => {
      if (result.isConfirmed) {
        // Try backend delete
        try {
          await axios.delete(`https://ecointeractive.onrender.com/api/geojson/delete/${encodeURIComponent(filenameToDelete)}`);
        } catch (apiErr) {
          console.warn("Backend single dataset delete note (proceeding with local deletion):", apiErr);
        }

        // Always clean up local cache & state
        inMemorySpatialCache.delete(filenameToDelete);
        localStorage.removeItem("activeSpatialDataContent_" + filenameToDelete);

        const updatedList = availableGeoJSONs.filter(f => f !== filenameToDelete);
        setAvailableGeoJSONs(updatedList);

        if (currentGeoDataFilename === filenameToDelete) {
          const nextFile = updatedList[0] || null;
          if (nextFile) {
            try {
              const data = await fetchSpatialData(`${window.location.origin}/${nextFile}`);
              setGeoData(data);
              setCurrentGeoDataFilename(nextFile);
              setSelectedFile(nextFile);
              localStorage.setItem("activeGeoDataFilename", nextFile);
            } catch (e) { }
          } else {
            setGeoData({ type: "FeatureCollection", features: [] });
            setCurrentGeoDataFilename(null);
            setSelectedFile("");
            localStorage.removeItem("activeGeoDataFilename");
          }
        } else if (selectedFile === filenameToDelete) {
          setSelectedFile(updatedList[0] || "");
        }

        Swal.fire({
          title: "Deleted!",
          text: `${filenameToDelete} deleted successfully.`,
          icon: "success",
          background: "#111827",
          color: "#f8fafc"
        });
      }
    });
  };

  const handleDeleteAllDatasets = () => {
    Swal.fire({
      title: "Purge All Datasets?",
      text: "This action will permanently delete all spatial dataset files from the database!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Purge All Datasets",
      background: "#111827",
      color: "#f8fafc"
    }).then(async (result) => {
      if (result.isConfirmed) {
        // Try backend purge
        try {
          await axios.delete("https://ecointeractive.onrender.com/api/geojson/delete-all");
        } catch (apiErr) {
          console.warn("Backend purge datasets note (proceeding with local purge):", apiErr);
        }

        // Always clean up local cache & state
        inMemorySpatialCache.clear();
        setAvailableGeoJSONs([]);
        setSelectedFile("");
        setGeoData({ type: "FeatureCollection", features: [] });
        setCurrentGeoDataFilename(null);
        localStorage.removeItem("activeGeoDataFilename");

        Swal.fire({
          title: "Purged!",
          text: "All spatial datasets purged successfully.",
          icon: "success",
          background: "#111827",
          color: "#f8fafc"
        });
      }
    });
  };

  return (
    <div className="geojson-manager animate-slide-up" style={{
      padding: 'clamp(1rem, 4vw, 2.5rem)',
      maxWidth: '1200px',
      margin: '0 auto',
      width: '100%',
      position: 'relative'
    }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.5rem' }}>
            <Server size={24} style={{ color: 'var(--accent-cyan)' }} />
            <h1 className="gradient-text" style={{ fontSize: '2.25rem', fontWeight: 800 }}>Spatial Dataset Manager</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.938rem' }}>Upload, deploy, manage, and delete regional GIS datasets.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={handleDeleteAllDatasets}
            className="btn-outline"
            style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.1)', fontSize: '0.813rem', borderRadius: '8px', gap: '0.375rem' }}
          >
            <Trash2 size={16} />
            Purge All Datasets
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>

        {/* Upload Interface Card */}
        <div className="glass-card" style={{ padding: '1.5rem', background: 'rgba(17, 24, 39, 0.9)' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{ background: 'rgba(6, 182, 212, 0.15)', padding: '8px', borderRadius: '10px', color: 'var(--accent-cyan)', border: '1px solid var(--border-cyan)' }}>
                <Upload size={20} />
              </div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>1. Ingest New Spatial Dataset</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.813rem' }}>
              Upload FlatGeobuf (.fgb) binary or standard GeoJSON (.geojson) dataset files.
            </p>
          </div>

          <div style={{
            border: '2px dashed var(--border-cyan)',
            borderRadius: '12px',
            padding: '2rem 1.5rem',
            textAlign: 'center',
            marginBottom: '1.25rem',
            background: 'rgba(11, 15, 25, 0.6)',
            transition: 'var(--transition)'
          }}>
            <input
              type="file"
              id="geo-upload"
              accept=".fgb,.geojson,.json"
              onChange={handleFileChangeForUpload}
              style={{ display: 'none' }}
            />
            <label htmlFor="geo-upload" style={{ cursor: 'pointer' }}>
              <div style={{ marginBottom: '0.75rem', color: 'var(--accent-cyan)' }}>
                <FileJson size={40} style={{ margin: '0 auto' }} />
              </div>
              <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                {fileToUpload ? fileToUpload.name : 'Click to Select FlatGeobuf (.fgb) or GeoJSON File'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Supports FlatGeobuf (.fgb) binary & standard GeoJSON formats
              </div>
            </label>
          </div>

          <button className="btn-primary" onClick={handleFileUpload} style={{ width: '100%', padding: '0.875rem', borderRadius: '10px' }} disabled={!fileToUpload}>
            Initialize Dataset Upload
          </button>
        </div>

        {/* Dataset Active Deployment Card */}
        <div className="glass-card" style={{ padding: '1.5rem', background: 'rgba(17, 24, 39, 0.9)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{ background: 'rgba(139, 92, 246, 0.15)', padding: '8px', borderRadius: '10px', color: '#c084fc', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                <Target size={20} />
              </div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>2. Manage & Deploy Datasets</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.813rem' }}>
              Select active dataset for the portal or delete dataset files from database.
            </p>
          </div>

          <div style={{ marginBottom: '1.25rem', flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '0.375rem', fontWeight: '700', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
              Available Database Datasets
            </label>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto', marginBottom: '1rem', paddingRight: '4px' }}>
              {availableGeoJSONs.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic', margin: 0 }}>No datasets found in database.</p>
              ) : (
                availableGeoJSONs.map((filename) => {
                  const isActive = currentGeoDataFilename === filename;
                  const isSelected = selectedFile === filename;
                  return (
                    <div
                      key={filename}
                      onClick={() => setSelectedFile(filename)}
                      style={{
                        padding: '0.625rem 0.75rem',
                        borderRadius: '8px',
                        background: isSelected ? 'rgba(6, 182, 212, 0.15)' : 'rgba(11, 15, 25, 0.6)',
                        border: isSelected ? '1px solid var(--border-cyan)' : '1px solid var(--border-subtle)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'var(--transition)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                        <Database size={14} style={{ color: isActive ? 'var(--accent-emerald)' : 'var(--accent-cyan)' }} />
                        <span style={{ fontSize: '0.813rem', fontWeight: isSelected ? 700 : 500, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {filename}
                        </span>
                        {isActive && (
                          <span style={{ fontSize: '0.6rem', padding: '1px 6px', background: 'rgba(16, 185, 129, 0.2)', color: 'var(--accent-emerald)', borderRadius: '4px', fontWeight: 800 }}>ACTIVE</span>
                        )}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSingleDataset(filename);
                        }}
                        style={{
                          background: 'rgba(239, 68, 68, 0.15)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#f87171',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.7rem'
                        }}
                        title={`Delete ${filename} from database`}
                      >
                        <Trash2 size={12} />
                        Delete
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <button className="btn-secondary" onClick={handleSetActiveGeoJSON} style={{ width: '100%', padding: '0.875rem', borderRadius: '10px', marginBottom: '1.25rem' }} disabled={!selectedFile}>
            Deploy Selected Dataset
          </button>

          {currentGeoDataFilename && (
            <div style={{
              padding: '0.875rem 1rem',
              background: 'rgba(16, 185, 129, 0.08)',
              borderRadius: '10px',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <p style={{ fontSize: '0.65rem', color: 'var(--accent-emerald)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                  Currently Active Dataset
                </p>
                <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {currentGeoDataFilename}
                </p>
              </div>
              <CheckCircle size={20} style={{ color: 'var(--accent-emerald)' }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GeoJSONManager;
