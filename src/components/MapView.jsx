import React, { useState, useEffect, useMemo, memo, useCallback } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from "react-leaflet";
import ProjectPopup from "./ProjectPopup";
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
      // Auto-open the popup after a short delay
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
  Transit: "#3b82f6",
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
  const size = isHighlighted ? 18 : 14;
  const border = isHighlighted ? '3px solid #fff' : '2px solid #fff';
  const glow = isHighlighted ? `box-shadow: 0 0 12px ${color}; z-index: 1000;` : 'box-shadow: 0 2px 4px rgba(0,0,0,0.3);';
  
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style=\"
      background: ${color}; 
      width: ${size}px; 
      height: ${size}px; 
      border-radius: 50%; 
      border: ${border}; 
      ${glow} 
      margin: auto;
      transition: all 0.2s ease-out;
    \"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

// Bounds adjustment component
function ChangeView({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15, animate: true });
    }
  }, [bounds, map]);
  return null;
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
  
  const onClosePopup = useCallback(() => {
    setOpenPopupId(null);
  }, []);

  // Memoize filtered features and markers for performance
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
        // Convert Leaflet bounds to simple array for state to trigger effect
        const b = [
          [leafletBounds.getSouthWest().lat, leafletBounds.getSouthWest().lng],
          [leafletBounds.getNorthEast().lat, leafletBounds.getNorthEast().lng]
        ];
        setBounds(b);
      }
    } else {
      // Default bounds if no data
      setBounds([[37.0, -77.6], [37.4, -77.2]]);
    }
  }, [geoData]);

  if (!bounds || !geoData) {
    // Set default bounds if no data is available to prevent crashing
    return (
      <MapContainer
        center={[37.2, -77.4]}
        zoom={10}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
      </MapContainer>
    );
  }

  return (
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
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        maxNativeZoom={19}
        maxZoom={18}
        minZoom={10}
        tileSize={256}
        updateWhenIdle={true}
        updateWhenZooming={false}
      />

      <ChangeView bounds={bounds} />

      <MapHighlightEffect
        project={highlightedProject}
        setOpenPopupId={setOpenPopupId}
        upcKey={propertyKeys.upc}
      />

      {markers.map(({ feature, i, isHighlighted, projectComments, color }) => (
        <React.Fragment key={`marker-group-${i}`}>
          {/* Pointer Marker */}
          <Marker
            key={`pointer-${i}`}
            position={[
              feature.geometry.coordinates[1],
              feature.geometry.coordinates[0],
            ]}
            icon={DefaultIcon}
            zIndexOffset={isHighlighted ? 3000 : 1000}
            ref={(ref) => {
              if (ref && openPopupId === feature.properties[propertyKeys.upc]) {
                ref.openPopup();
              }
            }}
            eventHandlers={{
              click: () => {
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
          {/* Colored Circle Marker */}
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
  );
}

export default memo(MapView);
