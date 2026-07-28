import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import { Target, Upload, FileJson, Trash2, X, CheckCircle, Database, Server } from "lucide-react";
import { fetchSpatialData, parseFgbBuffer } from "../utils/fgbLoader";
import "./GeoJSONManager.css";

const defaultPublicDatasets = [
  "gdf_projects.fgb",
  "gdf_mtip_and_lrtp_projects.fgb",
  "mtip_27-30_projects.geojson",
  "projects_new.geojson",
  "projects.geojson"
];

const inMemorySpatialCache = new Map();

function GeoJSONManager({
  setGeoData,
  currentGeoDataFilename,
  setCurrentGeoDataFilename,
}) {
  const [availableGeoJSONs, setAvailableGeoJSONs] = useState(defaultPublicDatasets);
  const [selectedFile, setSelectedFile] = useState(currentGeoDataFilename || "gdf_mtip_and_lrtp_projects.fgb");
  const [fileToUpload, setFileToUpload] = useState(null);

  const fetchAvailableGeoJSONs = useCallback(async () => {
    try {
      const response = await axios.get(
        "https://ecointeractive.onrender.com/api/geojson/list"
      );
      const remoteList = response.data || [];
      const merged = Array.from(new Set([...defaultPublicDatasets, ...remoteList, ...Array.from(inMemorySpatialCache.keys())]));
      setAvailableGeoJSONs(merged);
    } catch (error) {
      const merged = Array.from(new Set([...defaultPublicDatasets, ...Array.from(inMemorySpatialCache.keys())]));
      setAvailableGeoJSONs(merged);
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
          const fgbData = await fetchSpatialData(`${window.location.origin}/gdf_mtip_and_lrtp_projects.fgb`);
          setGeoData(fgbData);
          setCurrentGeoDataFilename("gdf_mtip_and_lrtp_projects.fgb");
          setSelectedFile("gdf_mtip_and_lrtp_projects.fgb");
        }
      } catch (error) {
        try {
          const fgbData = await fetchSpatialData(`${window.location.origin}/gdf_mtip_and_lrtp_projects.fgb`);
          setGeoData(fgbData);
          setCurrentGeoDataFilename("gdf_mtip_and_lrtp_projects.fgb");
          setSelectedFile("gdf_mtip_and_lrtp_projects.fgb");
        } catch (fgbErr) {
          console.error("Failed to load initial FGB spatial data:", fgbErr);
        }
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
        const url = selectedFile.startsWith("http") ? selectedFile : `${window.location.origin}/${selectedFile}`;
        spatialData = await fetchSpatialData(url);
      }

      setGeoData(spatialData);
      setCurrentGeoDataFilename(selectedFile);
      localStorage.setItem("activeGeoDataFilename", selectedFile);
      try {
        localStorage.setItem("activeSpatialDataContent_" + selectedFile, JSON.stringify(spatialData));
      } catch (e) {}

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
        text: `Failed to set active spatial dataset ${selectedFile}.`,
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
      } catch (e) {}

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
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.938rem' }}>Upload, deploy, and switch regional GIS GeoJSON datasets.</p>
        </div>
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
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        
        {/* Upload Interface Card */}
        <div className="glass-card" style={{ padding: '1.5rem', background: 'rgba(17, 24, 39, 0.9)' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
               <div style={{ background: 'rgba(6, 182, 212, 0.15)', padding: '8px', borderRadius: '10px', color: 'var(--accent-cyan)', border: '1px solid var(--border-cyan)' }}>
                 <Upload size={20} />
               </div>
               <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>1. Ingest New GeoJSON</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.813rem' }}>
              Upload standard GeoJSON files containing feature geometries & properties.
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
               <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>2. Active Dataset Deployment</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.813rem' }}>
              Select the active GeoJSON dataset powering the live map and public portal.
            </p>
          </div>

          <div style={{ marginBottom: '1.25rem', flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '0.375rem', fontWeight: '700', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
              Available Server Datasets
            </label>
            <select
              value={selectedFile}
              onChange={handleFileChange}
              style={{ padding: '0.75rem', background: 'rgba(11, 15, 25, 0.8)', border: '1px solid var(--border-subtle)', borderRadius: '10px' }}
            >
              <option value="">Choose a GeoJSON file...</option>
              {availableGeoJSONs.map((filename) => (
                <option key={filename} value={filename}>
                  {filename}
                </option>
              ))}
            </select>
          </div>

          <button className="btn-secondary" onClick={handleSetActiveGeoJSON} style={{ width: '100%', padding: '0.875rem', borderRadius: '10px', marginBottom: '1.25rem' }}>
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
