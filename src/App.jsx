import React, { useState, useEffect, Suspense, lazy, useMemo, useCallback } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Routes, Route, Link, useNavigate, Navigate } from "react-router-dom";
import Header from "./components/Header";
import ProjectsTableIndex from "./components/ProjectsTableIndex";
import { Search, ChevronLeft, ChevronRight, FileText, Database, Map, X, SlidersHorizontal, RefreshCw } from "lucide-react";
import "./components/FormElements.css";

import { fetchSpatialData } from "./utils/fgbLoader";

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
  );
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
  const [currentGeoDataFilename, setCurrentGeoDataFilename] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 991);
  const [isFactSheetOpen, setIsFactSheetOpen] = useState(false);
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
        console.error("Failed to fetch comments:", err);
      }
    };
    fetchComments();

    const processGeoData = (data, filename) => {
      setGeoData(data);
      setCurrentGeoDataFilename(filename);

      if (!data.features || data.features.length === 0) return;

      const allKeys = Array.from(new Set(data.features.flatMap(f => Object.keys(f.properties || {}))));
      const keys = allKeys;

      const findKey = (possibleNames) => {
        return keys.find(k => possibleNames.some(name => k.toLowerCase() === name.toLowerCase()));
      };

      const scopeKey = findKey(['Scope', 'Work_Type', 'Category', 'Classification', 'improvement', 'project_type']) || keys[2] || "Scope";
      const countyKey = findKey(['County', 'Jurisdiction', 'City', 'Location', 'District', 'locality']) || keys[4] || "County";
      const typeKey = findKey(['Type', 'Funding', 'Source', 'Program', 'product', 'project_type']) || keys[3] || "Type";
      const upcKey = findKey(['UPC', 'ID', 'ProjectID', 'Reference', 'project_id']) || keys[0] || "UPC";
      const descKey = findKey(['Description', 'Name', 'Project_Name', 'Title', 'project_title']) || keys[1] || "Description";

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
      const savedActiveFilename = localStorage.getItem("activeGeoDataFilename");

      try {
        const response = await axios.get(
          "https://ecointeractive.onrender.com/api/geojson/active"
        );
        if (response.data && response.data.geojsonData) {
          processGeoData(response.data.geojsonData, response.data.filename);
          localStorage.setItem("activeGeoDataFilename", response.data.filename);
          return;
        }
      } catch (err) {
        console.warn("Backend active GeoJSON check note:", err);
      }

      if (savedActiveFilename) {
        try {
          const cachedJson = localStorage.getItem("activeSpatialDataContent_" + savedActiveFilename);
          if (cachedJson) {
            const parsed = JSON.parse(cachedJson);
            processGeoData(parsed, savedActiveFilename);
            return;
          }
        } catch (e) { }

        try {
          const apiRes = await axios.get(
            `https://ecointeractive.onrender.com/api/geojson/get/${encodeURIComponent(savedActiveFilename)}`
          );
          if (apiRes.data && apiRes.data.geojsonData) {
            processGeoData(apiRes.data.geojsonData, savedActiveFilename);
            return;
          }
        } catch (e) { }

        try {
          const data = await fetchSpatialData(`${window.location.origin}/${savedActiveFilename}`);
          processGeoData(data, savedActiveFilename);
          return;
        } catch (err) { }
      }

      // No active dataset in DB or cache
      processGeoData({ type: "FeatureCollection", features: [] }, null);
      localStorage.removeItem("activeGeoDataFilename");
    };

    loadData();
  }, [isAdmin]);

  const addComment = async (comment) => {
    try {
      const response = await axios.post(
        "https://ecointeractive.onrender.com/api/comments",
        comment
      );
      setComments(prev => [...prev, response.data]);
      Swal.fire({
        icon: "success",
        title: "Testimony Registered!",
        text: "Your public comment has been successfully recorded.",
        timer: 2000,
        showConfirmButton: false,
        background: "#111827",
        color: "#f8fafc"
      });
    } catch (err) {
      console.error("Failed to add comment:", err);
      Swal.fire({
        icon: "error",
        title: "Submission Error",
        text: "There was an issue registering your comment. Please try again.",
        background: "#111827",
        color: "#f8fafc"
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

  const handleResetFilters = () => {
    setSelectedScope("All");
    setSelectedCounty("All");
    setSelectedType("All");
    setSelectedUPC("");
    setSelectedFundingLayer("All");
  };

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

  const isLoading = !geoData;
  const isFiltered = selectedScope !== "All" || selectedCounty !== "All" || selectedType !== "All" || selectedUPC !== "";

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
            <p style={{ color: 'var(--accent-cyan)', fontWeight: 700, letterSpacing: '0.1em' }}>
              INITIALIZING PORTAL DATA...
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

                      {/* Filter Widget Group */}
                      <div className="sidebar-group glass-card" style={{ padding: '1.25rem', borderRadius: '14px' }}>
                        <header className="explorer-section-title" style={{ display: 'flex', alignItems: 'center', width: '100%', marginBottom: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                            <div style={{ background: 'rgba(6, 182, 212, 0.15)', padding: '6px', borderRadius: '8px', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <SlidersHorizontal size={14} />
                            </div>
                            <span style={{ color: 'var(--text-primary)', fontWeight: 800 }}>Spatial Filters</span>
                          </div>
                          {isFiltered && (
                            <button
                              onClick={handleResetFilters}
                              title="Reset all filters"
                              style={{
                                background: 'rgba(239, 68, 68, 0.15)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                color: '#f87171',
                                fontSize: '0.68rem',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <RefreshCw size={10} /> Reset
                            </button>
                          )}
                        </header>

                        <div className="filter-grid" style={{ gap: '0.875rem' }}>
                          <div className="filter-control">
                            <label style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700 }}>
                              {propertyKeys.scope}
                            </label>
                            <select
                              value={selectedScope}
                              onChange={(e) => setSelectedScope(e.target.value)}
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <option>Loading Scopes...</option>
                              ) : (
                                scopes.map((scope) => (
                                  <option key={scope} value={scope}>{scope}</option>
                                ))
                              )}
                            </select>
                          </div>

                          <div className="filter-control">
                            <label style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700 }}>
                              {propertyKeys.county}
                            </label>
                            <select
                              value={selectedCounty}
                              onChange={(e) => setSelectedCounty(e.target.value)}
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <option>Loading Counties...</option>
                              ) : (
                                counties.map((county) => (
                                  <option key={county} value={county}>{county}</option>
                                ))
                              )}
                            </select>
                          </div>

                          <div className="filter-control">
                            <label style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700 }}>
                              {propertyKeys.type}
                            </label>
                            <select
                              value={selectedType}
                              onChange={(e) => setSelectedType(e.target.value)}
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <option>Loading Type...</option>
                              ) : (
                                types.map((type) => (
                                  <option key={type} value={type}>{type}</option>
                                ))
                              )}
                            </select>
                          </div>

                          <div className="filter-control">
                            <label style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700 }}>
                              Quick Search (UPC / Title)
                            </label>
                            <div style={{ position: 'relative' }}>
                              <input
                                type="text"
                                className="search-input"
                                value={selectedUPC}
                                onChange={(e) => setSelectedUPC(e.target.value)}
                                placeholder={isLoading ? "Loading projects..." : "Search UPC or keyword..."}
                                disabled={isLoading}
                                style={{ paddingRight: '2.5rem' }}
                              />
                              <span style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                                <Search size={14} />
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Projects Table Index */}
                      <div className="sidebar-group glass-card" style={{ padding: '1.25rem', borderRadius: '14px' }}>
                        <ProjectsTableIndex
                          geoData={filteredGeoData}
                          allHeaders={propertyKeys.allKeys}
                          onProjectClick={handleProjectClick}
                          comments={comments}
                          upcKey={propertyKeys.upc}
                          isAdmin={isAdmin}
                          isLoading={isLoading}
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

                  {/* Main Content Map Container */}
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
                        isLoading={isLoading}
                      />
                    </div>

                    {/* Floating Toggle Button (Mobile) */}
                    <button
                      className="sidebar-toggle-btn"
                      onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                      aria-label="Toggle Project Menu"
                    >
                      {isSidebarOpen ? <X size={22} /> : <Map size={22} />}
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
