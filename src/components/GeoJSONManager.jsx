import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import { Target, Upload, FileJson, Trash2, X } from "lucide-react";
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
    <div className="geojson-manager animate-slide-up" style={{ 
      padding: 'clamp(1rem, 5vw, 3rem)', 
      maxWidth: '100%', 
      width: '1200px', 
      margin: '0 auto', 
      position: 'relative',
      boxSizing: 'border-box'
    }}>
      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ textAlign: 'left' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)' }}>Data Registry</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem', marginTop: '0.5rem' }}>
            Upload, configure, and manage regional infrastructure datasets.
          </p>
        </div>
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
            transition: 'var(--transition)',
            marginTop: '0.5rem'
          }}
          title="Close and return to Map"
        >
          <X size={24} />
        </Link>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        
        {/* Dataset Selection */}
        <div className="card glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
               <div style={{ background: 'rgba(79, 70, 229, 0.1)', padding: '8px', borderRadius: '8px', color: 'var(--primary)' }}>
                 <Target size={20} />
               </div>
               <h2 style={{ fontSize: '1.25rem' }}>Active Dataset</h2>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Set the primary project data currently visible to all platform users.
            </p>
          </div>

          <div style={{ marginBottom: '1.5rem', flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Select Source File
            </label>
            <select
              value={selectedFile}
              onChange={handleFileChange}
              style={{ padding: '0.875rem' }}
            >
              <option value="">Choose a file...</option>
              {availableGeoJSONs.map((filename) => (
                <option key={filename} value={filename}>
                  {filename}
                </option>
              ))}
            </select>
          </div>

          <button className="btn-primary" onClick={handleSetActiveGeoJSON} style={{ width: '100%', padding: '1rem' }}>
            Deploy Dataset
          </button>

          {currentGeoDataFilename && (
            <div style={{ 
              marginTop: '1.5rem', 
              padding: '1rem', 
              background: 'rgba(79, 70, 229, 0.03)', 
              borderRadius: '8px', 
              border: '1px solid var(--border-light)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <p style={{ fontSize: '0.688rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Active Status</p>
                <p style={{ fontSize: '0.938rem', fontWeight: 600, color: 'var(--primary)' }}>{currentGeoDataFilename}</p>
              </div>
              <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 0 4px rgba(16, 185, 129, 0.2)' }}></div>
            </div>
          )}
        </div>

        {/* Upload Interface */}
        <div className="card">
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
               <div style={{ background: 'rgba(79, 70, 229, 0.1)', padding: '8px', borderRadius: '8px', color: 'var(--primary)' }}>
                 <Upload size={20} />
               </div>
               <h2 style={{ fontSize: '1.25rem' }}>Ingest Data</h2>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Drag and drop GeoJSON files to enrich the regional database.
            </p>
          </div>

          <div style={{ 
            border: '2px dashed var(--border-light)', 
            borderRadius: 'var(--radius-md)', 
            padding: '2.5rem', 
            textAlign: 'center',
            marginBottom: '1.5rem',
            background: 'var(--bg-main)',
            transition: 'var(--transition)',
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-light)'}
          >
            <input
              type="file"
              id="geo-upload"
              accept=".geojson"
              onChange={handleFileChangeForUpload}
              style={{ display: 'none' }}
            />
            <label htmlFor="geo-upload" style={{ cursor: 'pointer' }}>
              <div style={{ marginBottom: '1rem', color: 'var(--primary)', opacity: 0.6 }}>
                <FileJson size={48} style={{ margin: '0 auto' }} />
              </div>
              <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>{fileToUpload ? fileToUpload.name : 'Select GeoJSON'}</div>
              <div style={{ fontSize: '0.813rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Standard GeoJSON Specification only</div>
            </label>
          </div>

          <button className="btn-outline" onClick={handleFileUpload} style={{ width: '100%', padding: '1rem' }} disabled={!fileToUpload}>
            Initialize Upload
          </button>
        </div>

        {/* Stored Files Table */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem' }}>Dataset Registry</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Manage all previously ingested spatial datasets.</p>
            </div>
            <button className="btn-ghost" onClick={handleDeleteAllGeoJSONs} style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Trash2 size={16} />
              Purge Registry
            </button>
          </div>

          <div style={{ overflowX: 'auto', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border-light)' }}>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: '700', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Source Filename</th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'center', fontWeight: '700', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Provisioning</th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: '700', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {availableGeoJSONs.length > 0 ? (
                  availableGeoJSONs.map((filename) => (
                    <tr key={filename} style={{ borderBottom: '1px solid var(--border-light)', transition: 'background 0.2s' }}>
                      <td style={{ padding: '1.25rem 1.5rem', fontWeight: '600', color: 'var(--text-main)' }}>{filename}</td>
                      <td style={{ padding: '1.25rem 1.5rem', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>MPO Server</span>
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                        {filename === currentGeoDataFilename ? (
                          <span style={{ 
                            background: '#dcfce7', 
                            color: '#065f46', 
                            padding: '0.4rem 0.8rem', 
                            borderRadius: '2rem',
                            fontSize: '0.75rem',
                            fontWeight: '700'
                          }}>PRODUCTION</span>
                        ) : (
                          <span style={{ 
                            background: 'var(--bg-main)', 
                            color: 'var(--text-muted)', 
                            padding: '0.4rem 0.8rem', 
                            borderRadius: '2rem',
                            fontSize: '0.75rem',
                            fontWeight: '600'
                          }}>ARCHIVED</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" style={{ padding: '4rem', textAlign: 'center' }}>
                       <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No datasets currently registered.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GeoJSONManager;
