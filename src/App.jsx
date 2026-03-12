import React, { useState, useEffect, Suspense, lazy, useMemo, useCallback } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Routes, Route, Link, useNavigate, Navigate } from "react-router-dom";
import Header from "./components/Header";
import ProjectsTableIndex from "./components/ProjectsTableIndex";
import { Search, ChevronLeft, ChevronRight, FileText, Database, Map, X } from "lucide-react";
import "./components/FormElements.css";

// Lazy load heavy components
const MapView = lazy(() => import("./components/MapView"));
const AdminLogin = lazy(() => import("./components/AdminLogin"));
const CommentsTable = lazy(() => import("./components/CommentsTable"));
const ProjectsTable = lazy(() => import("./components/ProjectsTable"));
const GeoJSONManager = lazy(() => import("./components/GeoJSONManager"));
const FactSheetSidebar = lazy(() => import("./components/FactSheetSidebar"));

function App() {
  const [comments, setComments] = useState([]);
  const [isAdmin, setIsAdmin] = useState(
    localStorage.getItem("isAdmin") === "true"
  ); // New state for admin status
  const navigate = useNavigate();
  const [scopes, setScopes] = useState([]);
  const [counties, setCounties] = useState([]);
  const [types, setTypes] = useState([]);
  const [selectedUPC, setSelectedUPC] = useState("");
  const [selectedScope, setSelectedScope] = useState("All");
  const [selectedCounty, setSelectedCounty] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedFundingLayer, setSelectedFundingLayer] = useState("All");
  const [fundingSources, setFundingSources] = useState([]);
  const [projectTitle, setProjectTitle] = useState([]);
  const [geoData, setGeoData] = useState(null);
  const [currentGeoDataFilename, setCurrentGeoDataFilename] = useState(null); // New state for active GeoJSON filename
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 991);
  const [isFactSheetOpen, setIsFactSheetOpen] = useState(true);
  const [isLayersOpen, setIsLayersOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [activeProjectLayers, setActiveProjectLayers] = useState([]);
  const [highlightedProject, setHighlightedProject] = useState(null);
  const [propertyKeys, setPropertyKeys] = useState({
    scope: "Scope",
    county: "County",
    type: "Type",
    upc: "UPC",
    description: "Description"
  });

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get(
          "https://ecointeractive.onrender.com/api/comments"
        );
        setComments(response.data);
       
      } catch (err) {
       
      }
    };
    fetchComments();

    const processGeoData = (data, filename) => {
      setGeoData(data);
      setCurrentGeoDataFilename(filename);

      if (!data.features || data.features.length === 0) return;

      // Find all unique keys across all features
      const allKeys = Array.from(new Set(data.features.flatMap(f => Object.keys(f.properties || {}))));
      const keys = allKeys;

      const findKey = (possibleNames) => {
        return keys.find(k => possibleNames.some(name => k.toLowerCase() === name.toLowerCase()));
      };

      const scopeKey = findKey(['Scope', 'Work_Type', 'Category', 'Classification']) || keys[2] || "Scope";
      const countyKey = findKey(['County', 'Jurisdiction', 'City', 'Location', 'District']) || keys[4] || "County";
      const typeKey = findKey(['Type', 'Funding', 'Source', 'Program']) || keys[3] || "Type";
      const upcKey = findKey(['UPC', 'ID', 'ProjectID', 'Reference']) || keys[0] || "UPC";
      const descKey = findKey(['Description', 'Name', 'Project_Name', 'Title']) || keys[1] || "Description";

      setPropertyKeys({
        scope: scopeKey,
        county: countyKey,
        type: typeKey,
        upc: upcKey,
        description: descKey,
        allKeys: allKeys
      });

      const uniqueScopes = [
        ...new Set(data.features.map((f) => f.properties[scopeKey])),
      ].filter(Boolean);
      setScopes(["All", ...uniqueScopes.sort()]);

      const uniqueCounties = [
        ...new Set(data.features.map((f) => f.properties[countyKey])),
      ].filter(Boolean);
      setCounties(["All", ...uniqueCounties.sort()]);

      const uniqueTypes = [
        ...new Set(data.features.map((f) => f.properties[typeKey])),
      ].filter(Boolean);
      setTypes(["All", ...uniqueTypes.sort()]);

      const sources = [
        ...new Set(data.features.map((f) => f.properties[typeKey])),
      ].filter(Boolean);
      setFundingSources(["All", ...sources]);
      if (sources.length > 0) {
        setActiveProjectLayers(sources);
      }
    };

    const loadData = async () => {
      try {
        // Always try to load the active GeoJSON from API first
        const response = await axios.get(
          "https://ecointeractive.onrender.com/api/geojson/active"
        );
        if (response.data.geojsonData) {
          processGeoData(response.data.geojsonData, response.data.filename);
        } else {
          // Fallback to default file if no active GeoJSON
          const fallbackResponse = await fetch(
            `${window.location.origin}/projects_new.geojson`
          );
          const data = await fallbackResponse.json();
          processGeoData(data, "projects_new.geojson");
        }
      } catch (err) {
        // Fallback to default file if API fails
        fetch(`${window.location.origin}/projects_new.geojson`)
          .then((res) => res.json())
          .then((data) => {
            processGeoData(data, "projects_new.geojson");
          })
          .catch((fallbackErr) =>
            console.error("Failed to fetch fallback GeoJSON data:")
          );
      }
    };

    loadData();
  }, [isAdmin]);

  const addComment = async (comment) => {
    try {
      const response = await axios.post(
        "https://ecointeractive.onrender.com/api/comments",
        comment
      );
      console.log("Comment added:", response);
      setComments([...comments, response.data]);
      Swal.fire({
        icon: "success",
        title: "Comment Added!",
        text: "Your comment has been successfully submitted.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Failed to add comment:", err);
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: "There was an error submitting your comment. Please try again.",
      });
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem("isAdmin");
    navigate("/");
  };

  const handleProjectClick = (project) => {
    setHighlightedProject(project);
    navigate("/");
  };

  // Memoize filtered geoData to prevent unnecessary recalculations
  const filteredGeoData = useMemo(() => {
    if (!geoData) return null;
    return {
      ...geoData,
      features: geoData.features.filter((feature) => {
        const searchTerm = selectedUPC.toLowerCase();
        const matchesSearch = !searchTerm || Object.values(feature.properties).some(val =>
          String(val).toLowerCase().includes(searchTerm)
        );

        const matchesScope =
          selectedScope === "All" ||
          String(feature.properties[propertyKeys.scope]) === selectedScope;
        const matchesCounty =
          selectedCounty === "All" ||
          String(feature.properties[propertyKeys.county]) === selectedCounty;
        const matchesType =
          selectedType === "All" ||
          String(feature.properties[propertyKeys.type]) === selectedType;

        const matchesFundingLayer =
          selectedFundingLayer === "All" ||
          String(feature.properties[propertyKeys.type]) === selectedFundingLayer;

        return matchesSearch && matchesScope && matchesCounty && matchesType && matchesFundingLayer;
      }),
    };
  }, [geoData, selectedUPC, selectedScope, selectedCounty, selectedType, selectedFundingLayer, propertyKeys]);

  if (!geoData) {
    return (
      <div className="app-container" style={{ background: 'var(--bg-main)' }}>
        <Header isAdmin={isAdmin} handleLogout={handleLogout} />
        <div className="loading-container animate-slide-up">
          <div className="spinner shimmer"></div>
          <p style={{ color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.05em' }}>
            REGISTRY SYNCHRONIZING...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="app-container"
      style={{ display: "flex", flexDirection: "column", height: "100vh", position: 'relative' }}
    >
      <div className="ambient-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>
      <Header
        isAdmin={isAdmin}
        handleLogout={handleLogout}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        isFactSheetOpen={isFactSheetOpen}
        onOpenFactSheet={() => setIsFactSheetOpen(!isFactSheetOpen)}
        onCloseFactSheet={() => setIsFactSheetOpen(false)}
      />

      <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', width: '100%' }}>
        <Suspense fallback={
          <div className="loading-container" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="spinner shimmer"></div>
            <p style={{ color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.05em' }}>
              LOADING...
            </p>
          </div>
        }>
          <Routes>
            <Route
              path="/login"
              element={<AdminLogin setIsAdmin={setIsAdmin} navigate={navigate} />}
            />
            <Route
              path="/comments"
              element={
                isAdmin ? (
                  <CommentsTable comments={comments} setComments={setComments} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/projects"
              element={
                isAdmin ? (
                  <ProjectsTable
                    geoData={geoData}
                    headers={propertyKeys.allKeys}
                    onProjectClick={handleProjectClick}
                    comments={comments}
                    upcKey={propertyKeys.upc}
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/geojson-manager"
              element={
                isAdmin ? (
                  <GeoJSONManager
                    setGeoData={setGeoData}
                    currentGeoDataFilename={currentGeoDataFilename}
                    setCurrentGeoDataFilename={setCurrentGeoDataFilename}
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/"
              element={
              <div
                className="app-content_3_col"
                style={{ position: 'relative' }}
              >
                  {/* Backdrop for mobile overlays */}
                  <div 
                    className={`sidebar-backdrop ${(isSidebarOpen || isFactSheetOpen) ? "" : "hidden"}`}
                    onClick={() => {
                      setIsSidebarOpen(false);
                      setIsFactSheetOpen(false);
                    }}
                  />
                  {/* Sidebar 1: Fact Sheet */}
                <div style={{ position: 'relative', display: 'flex', height: '100%' }} className={isFactSheetOpen ? "open" : "closed"}>
                  <FactSheetSidebar 
                    isOpen={isFactSheetOpen} 
                    onClose={() => setIsFactSheetOpen(false)} 
                    onOpenFilters={() => {
                      setIsSidebarOpen(true);
                    }}
                  />
                  <button 
                    className="sidebar-tab" 
                    onClick={() => setIsFactSheetOpen(!isFactSheetOpen)}
                    title={isFactSheetOpen ? "Hide Fact Sheet" : "Show Fact Sheet"}
                  >
                    {isFactSheetOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                  </button>
                </div>

                {/* Sidebar 2: Project Filter & Inventory */}
                <div style={{ position: 'relative', display: 'flex', height: '100%' }} className={isSidebarOpen ? "open" : "closed"}>
                  <aside 
                   className={`asidebar ${isSidebarOpen ? "open" : "closed"}`}
                   style={{
                     padding: isSidebarOpen ? '1.5rem' : '0'
                   }}
                  >
                    {/* Close button for mobile/tablet */}
                    <button 
                      className="sidebar-close-btn mobile-only"
                      onClick={() => setIsSidebarOpen(false)}
                      aria-label="Close Sidebar"
                    >
                      X
                    </button>

                    {/* Visual Group: Filters */}
                    <div className="sidebar-group">
                      <header className="explorer-section-title" style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                          <div style={{ background: 'rgba(14, 165, 233, 0.1)', padding: '6px', borderRadius: '6px', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Search size={14} />
                          </div>
                          Project Filter
                        </div>
                        <button 
                          className="header-icon-btn desktop-only"
                          onClick={() => {
                            setIsFactSheetOpen(true);
                          }}
                          title="View Fact Sheet"
                          style={{ 
                            background: 'rgba(14, 165, 233, 0.1)', 
                            border: 'none',
                            padding: '6px', 
                            borderRadius: '6px', 
                            color: 'var(--accent)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease',
                            opacity: 0.8
                          }}
                          onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                          onMouseOut={(e) => e.currentTarget.style.opacity = '0.8'}
                        >
                          <FileText size={14} />
                        </button>
                      </header>
                      <div className="filter-grid">
                        <div className="filter-control">
                          <label>{propertyKeys.scope}</label>
                          <select
                            value={selectedScope}
                            onChange={(e) => setSelectedScope(e.target.value)}
                          >
                            {scopes.map((scope) => (
                              <option key={scope} value={scope}>{scope}</option>
                            ))}
                          </select>
                        </div>

                        <div className="filter-control">
                          <label>{propertyKeys.county}</label>
                          <select
                            value={selectedCounty}
                            onChange={(e) => setSelectedCounty(e.target.value)}
                          >
                            {counties.map((county) => (
                              <option key={county} value={county}>{county}</option>
                            ))}
                          </select>
                        </div>

                        <div className="filter-control">
                          <label>{propertyKeys.type}</label>
                          <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                          >
                            {types.map((type) => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>

                        <div className="filter-control">
                          <label>UPC Search</label>
                          <div style={{ position: 'relative' }}>
                            <input
                              type="text"
                              className="search-input"
                              value={selectedUPC}
                              onChange={(e) => setSelectedUPC(e.target.value)}
                              placeholder="Search UPC, Name, etc..."
                              style={{ paddingRight: '2.5rem' }}
                            />
                            <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}>
                              <Search size={16} />
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Projects Table Index */}
                    <div className="sidebar-group">
                        <header className="explorer-section-title">
                          <div style={{ background: 'rgba(79, 70, 229, 0.1)', padding: '6px', borderRadius: '6px', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Database size={14} />
                          </div>
                          Inventory Explorer
                        </header>
                        <ProjectsTableIndex 
                          geoData={filteredGeoData} 
                          allHeaders={propertyKeys.allKeys} 
                          onProjectClick={handleProjectClick}
                          comments={comments}
                          upcKey={propertyKeys.upc}
                          isAdmin={isAdmin}
                        />
                    </div>
                  </aside>
                  <button 
                    className="sidebar-tab" 
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    style={{ right: '-24px' }}
                    title={isSidebarOpen ? "Hide Inventory" : "Show Inventory"}
                  >
                    {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                  </button>
                </div>

                {/* Main Content: Map */}
                <main
                  className="main-content-wrapper"
                  style={{
                    flex: 1,
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "column",
                    height: '100%'
                  }}
                >
                    <div style={{ flex: 1, position: 'relative' }}>
                      <MapView
                        addComment={addComment}
                        comments={comments}
                        geoData={filteredGeoData}
                        activeProjectLayers={activeProjectLayers}
                        selectedScope={selectedScope}
                        selectedCounty={selectedCounty}
                        selectedUPC={selectedUPC}
                        selectedFundingLayer={selectedFundingLayer}
                        isAdmin={isAdmin}
                        propertyKeys={propertyKeys}
                        highlightedProject={highlightedProject}
                        setHighlightedProject={setHighlightedProject}
                        isSidebarOpen={isSidebarOpen}
                        isFactSheetOpen={isFactSheetOpen}
                      />
                  </div>
                  
                  {/* Floating Toggle (Mobile Only) */}
                  <button
                    className="sidebar-toggle-btn"
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    aria-label="Toggle Project Menu"
                  >
                    {isSidebarOpen ? <X size={24} /> : <Map size={24} />}
                  </button>
                </main>
              </div>
          }
        />
        </Routes>
        </Suspense>
      </main>

    </div>
  );
}
export default App;
