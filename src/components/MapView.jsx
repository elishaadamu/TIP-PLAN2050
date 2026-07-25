import React, { useState, useEffect, useMemo, memo, useCallback, useRef } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from "react-leaflet";
import ProjectPopup from "./ProjectPopup";
import { ZoomIn, ZoomOut, Maximize2, Layers, Compass, Sparkles } from "lucide-react";
import "leaflet/dist/leaflet.css";

import icon from "leaflet/dist/images/marker-icon.png";
import iconRetina from "leaflet/dist/images/marker-icon-2x.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

// Map focus and animation component
function MapHighlightEffect({ project, setOpenPopupId, upcKey }) {
  const map = useMap();
  
  useEffect(() => {
    if (project && project.geometry && project.geometry.coordinates) {
      const [lng, lat] = project.geometry.coordinates;
      map.flyTo([lat, lng], 14, {
        duration: 1.5,
        easeLinearity: 0.25
      });
      setTimeout(() => {
        setOpenPopupId(project.properties[upcKey]);
      }, 1500);
    }
  }, [project, map, setOpenPopupId, upcKey]);

  return null;
}

const DefaultIcon = L.icon({
  iconUrl: icon,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const projectTypeColors = {
  Roadway: "#f43f5e",
  Transit: "#06b6d4",
  "Bike/Ped": "#10b981",
  Bridge: "#f59e0b",
  Safety: "#8b5cf6",
  Other: "#64748b"
};

const getProjectColor = (scope) => {
  const s = String(scope || "").toLowerCase();
  if (s.includes("pedestrian") || s.includes("bike") || s.includes("bicycle") || s.includes("trail") || s.includes("sidewalk")) return projectTypeColors["Bike/Ped"];
  if (s.includes("roadway") || s.includes("highway") || s.includes("reconstruction") || s.includes("widening") || s.includes("resurfacing")) return projectTypeColors.Roadway;
  if (s.includes("transit") || s.includes("bus") || s.includes("train")) return projectTypeColors.Transit;
  if (s.includes("bridge")) return projectTypeColors.Bridge;
  if (s.includes("safety") || s.includes("intersection") || s.includes("signal")) return projectTypeColors.Safety;
  return projectTypeColors.Other;
};

const createCustomIcon = (color, isHighlighted) => {
  const size = isHighlighted ? 22 : 14;
  const border = isHighlighted ? '3px solid #ffffff' : '2px solid #070a12';
  const glow = isHighlighted 
    ? `box-shadow: 0 0 20px ${color}, 0 0 10px #ffffff; z-index: 1000; transform: scale(1.2);` 
    : `box-shadow: 0 0 8px ${color};`;
  
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="
      background: ${color}; 
      width: ${size}px; 
      height: ${size}px; 
      border-radius: 50%; 
      border: ${border}; 
      ${glow} 
      margin: auto;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14],
  });
};

function ChangeView({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15, animate: true });
    }
  }, [bounds, map]);
  return null;
}

// Custom Map Floating Toolbar Component
function MapFloatingControls({ bounds, mapTileStyle, setMapTileStyle, featureCount }) {
  const map = useMap();

  const handleZoomIn = () => map.zoomIn();
  const handleZoomOut = () => map.zoomOut();
  const handleReset = () => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50], animate: true });
    }
  };

  const toggleStyle = () => {
    setMapTileStyle(prev => prev === 'dark' ? 'voyager' : 'dark');
  };

  return (
    <div className="map-floating-widget glass-panel" style={{
      position: 'absolute',
      bottom: '24px',
      right: '24px',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      padding: '8px',
      borderRadius: '16px',
      border: '1px solid var(--border-cyan)',
      boxShadow: 'var(--shadow-glass), var(--shadow-neon-cyan)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 8px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '4px' }}>
        <Sparkles size={14} style={{ color: 'var(--accent-cyan)' }} />
        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.05em' }}>
          {featureCount} PROJECTS
        </span>
      </div>

      <div style={{ display: 'flex', gap: '4px' }}>
        <button 
          onClick={handleZoomIn} 
          title="Zoom In"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', padding: '8px', borderRadius: '8px', width: '36px', height: '36px' }}
        >
          <ZoomIn size={16} />
        </button>
        <button 
          onClick={handleZoomOut} 
          title="Zoom Out"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', padding: '8px', borderRadius: '8px', width: '36px', height: '36px' }}
        >
          <ZoomOut size={16} />
        </button>
        <button 
          onClick={handleReset} 
          title="Reset Fit Bounds"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', padding: '8px', borderRadius: '8px', width: '36px', height: '36px' }}
        >
          <Maximize2 size={16} />
        </button>
        <button 
          onClick={toggleStyle} 
          title={`Switch Map Theme (Current: ${mapTileStyle.toUpperCase()})`}
          style={{ 
            background: mapTileStyle === 'dark' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(139, 92, 246, 0.2)', 
            border: '1px solid var(--border-cyan)', 
            color: 'var(--accent-cyan)', 
            padding: '8px', 
            borderRadius: '8px', 
            width: '36px', 
            height: '36px' 
          }}
        >
          <Layers size={16} />
        </button>
      </div>
    </div>
  );
}

function MapView({
  addComment,
  comments,
  geoData,
  activeProjectLayers = [],
  selectedFundingLayer,
  selectedScope,
  selectedCounty,
  selectedUPC,
  isAdmin,
  highlightedProject,
  setHighlightedProject,
  isSidebarOpen,
  isFactSheetOpen,
  isLoading,
  propertyKeys = {
    scope: "Scope",
    county: "County",
    type: "Type",
    upc: "UPC",
    description: "Description"
  }
}) {
  const [openPopupId, setOpenPopupId] = useState(null);
  const [bounds, setBounds] = useState(null);
  const [mapTileStyle, setMapTileStyle] = useState('voyager');
  const mapRef = useRef(null);

  const MapController = () => {
    const map = useMap();
    useEffect(() => {
      mapRef.current = map;
    }, [map]);
    return null;
  };

  const MapAutoAlign = () => {
    const map = useMap();
    useEffect(() => {
      const timer = setTimeout(() => {
        map.invalidateSize();
        if (bounds) {
          map.fitBounds(bounds, { padding: [50, 50], animate: true });
        }
      }, 550);
      return () => clearTimeout(timer);
    }, [isSidebarOpen, isFactSheetOpen, map, bounds]);
    return null;
  };

  const panToCenterPopup = useCallback((lat, lng) => {
    const map = mapRef.current;
    if (!map) return;
    const headerOffset = 120;
    const currentPoint = map.latLngToContainerPoint([lat, lng]);
    const newPoint = L.point(currentPoint.x, currentPoint.y + headerOffset);
    const newLatLng = map.containerPointToLatLng(newPoint);
    
    map.flyTo(newLatLng, map.getZoom(), {
      duration: 0.5,
      easeLinearity: 0.25
    });
  }, []);
  
  const onClosePopup = useCallback(() => {
    setOpenPopupId(null);
  }, []);

  const markers = useMemo(() => {
    if (!geoData?.features) return [];

    return geoData.features.map((feature, i) => {
      const isHighlighted = highlightedProject &&
        feature.properties[propertyKeys.upc] === highlightedProject.properties[propertyKeys.upc];

      const projectComments = comments.filter(
        (c) => String(c.projectId) === String(feature.properties[propertyKeys.upc])
      );

      return {
        feature,
        i,
        isHighlighted,
        projectComments,
        color: getProjectColor(feature.properties[propertyKeys.scope]),
      };
    });
  }, [geoData, highlightedProject, propertyKeys.upc, propertyKeys.scope, comments]);

  useEffect(() => {
    if (geoData && geoData.features && geoData.features.length > 0) {
      const leafletBounds = L.latLngBounds([]);
      let hasCoordinates = false;

      geoData.features.forEach(feature => {
        if (feature.geometry && feature.geometry.coordinates) {
          const [lng, lat] = feature.geometry.coordinates;
          if (!isNaN(lat) && !isNaN(lng)) {
            leafletBounds.extend([lat, lng]);
            hasCoordinates = true;
          }
        }
      });

      if (hasCoordinates) {
        const b = [
          [leafletBounds.getSouthWest().lat, leafletBounds.getSouthWest().lng],
          [leafletBounds.getNorthEast().lat, leafletBounds.getNorthEast().lng]
        ];
        setBounds(b);
      }
    } else {
      setBounds([[37.0, -77.6], [37.4, -77.2]]);
    }
  }, [geoData]);

  const tileUrl = mapTileStyle === 'dark' 
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

  if (isLoading || !bounds || !geoData) {
    return (
      <div style={{ height: "100%", width: "100%", position: 'relative', background: '#090d16' }}>
         <MapContainer
          center={[37.2, -77.4]}
          zoom={10}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url={tileUrl}
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
        </MapContainer>
        <div className="map-loading-overlay glass-panel" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          gap: '1.25rem'
        }}>
          <div className="spinner shimmer" style={{ width: '48px', height: '48px', borderTopColor: 'var(--accent-cyan)' }}></div>
          <span style={{ 
            color: 'var(--accent-cyan)', 
            fontWeight: 800, 
            fontSize: '0.75rem', 
            letterSpacing: '0.15em',
            textTransform: 'uppercase'
          }}>
            INITIALIZING SPATIAL GEOSPATIAL ENGINE...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <MapContainer
        bounds={bounds}
        style={{ height: "100%", width: "100%" }}
        zoom={12}
        maxZoom={18}
        minZoom={10}
        zoomControl={false}
        onMoveStart={() => setHighlightedProject && setHighlightedProject(null)}
      >
        <TileLayer
          url={tileUrl}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          maxNativeZoom={19}
          maxZoom={18}
          minZoom={10}
          tileSize={256}
          updateWhenIdle={true}
          updateWhenZooming={false}
        />

        <MapController />
        <ChangeView bounds={bounds} />
        <MapAutoAlign />

        <MapHighlightEffect
          project={highlightedProject}
          setOpenPopupId={setOpenPopupId}
          upcKey={propertyKeys.upc}
        />

        <MapFloatingControls 
          bounds={bounds} 
          mapTileStyle={mapTileStyle} 
          setMapTileStyle={setMapTileStyle} 
          featureCount={markers.length} 
        />

        {markers.map(({ feature, i, isHighlighted, projectComments, color }) => (
          <React.Fragment key={`marker-group-${i}`}>
            <Marker
              key={`pointer-${i}`}
              position={[
                feature.geometry.coordinates[1],
                feature.geometry.coordinates[0],
              ]}
              icon={DefaultIcon}
              zIndexOffset={isHighlighted ? 3000 : 1000}
              ref={(ref) => {
                if (ref && openPopupId !== null && openPopupId === feature.properties[propertyKeys.upc]) {
                  ref.openPopup();
                }
              }}
              eventHandlers={{
                click: () => {
                  const lat = feature.geometry.coordinates[1];
                  const lng = feature.geometry.coordinates[0];
                  panToCenterPopup(lat, lng);
                  setOpenPopupId(feature.properties[propertyKeys.upc]);
                  if (setHighlightedProject) setHighlightedProject(null);
                },
              }}
            >
              <Tooltip>{feature.properties[propertyKeys.description] || feature.properties[propertyKeys.upc]}</Tooltip>
              <Popup onClose={() => {
                onClosePopup();
                if (setHighlightedProject) setHighlightedProject(null);
              }}>
                <ProjectPopup
                  project={feature}
                  addComment={addComment}
                  comments={projectComments}
                  onClosePopup={onClosePopup}
                  isAdmin={isAdmin}
                />
              </Popup>
            </Marker>
            <Marker
              key={`circle-${i}`}
              position={[
                feature.geometry.coordinates[1],
                feature.geometry.coordinates[0],
              ]}
              icon={createCustomIcon(color, isHighlighted)}
              zIndexOffset={isHighlighted ? 2900 : 900}
            />
          </React.Fragment>
        ))}
      </MapContainer>
    </div>
  );
}

export default memo(MapView);
