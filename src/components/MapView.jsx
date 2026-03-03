import React, { useState, useEffect } from "react";
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

let DefaultIcon = L.icon({
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
  Roadway: "#FF6B6B", 
  Transit: "#4ECDC4", 
  "Bike/Ped": "#ccd145ff",
  Bridge: "#A8E6CF",
  Safety: "#FFD3B6",
  Other: "#808080"
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
  return L.divIcon({
    className: `custom-div-icon ${isHighlighted ? 'blink-marker' : ''}`,
    html: `<div style=\"background-color: ${color}; width: 15px; height: 15px; border-radius: 50%; border: 2.5px solid #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.2);\"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
  });
};

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
  const [filteredData, setFilteredData] = useState(null);
  const [openPopupId, setOpenPopupId] = useState(null);
  const [bounds, setBounds] = useState(null);
  const onClosePopup = () => {
    setOpenPopupId(null);
  };

  useEffect(() => {
    if (geoData && geoData.features) {
      const filtered = {
        ...geoData,
        features: geoData.features.filter((feature) => {
          const matchesScope =
            selectedScope === "All" ||
            feature.properties[propertyKeys.scope] === selectedScope;
          
          const matchesFundingLayer =
            selectedFundingLayer === "All" ||
            feature.properties[propertyKeys.type] === selectedFundingLayer;
          const matchesCounty =
            selectedCounty === "All" ||
            feature.properties[propertyKeys.county] === selectedCounty;
          const matchesUPC =
            !selectedUPC ||
            String(feature.properties[propertyKeys.upc]).includes(selectedUPC);

          return (
            matchesScope &&
            matchesCounty &&
            matchesUPC &&
            matchesFundingLayer
          );
        }),
      };

      setFilteredData(filtered);

      // Calculate bounds including both points and paths
      if (filtered.features.length > 0) {
        const points = filtered.features
          .filter(f => f.geometry && f.geometry.coordinates)
          .map((f) => [
            f.geometry.coordinates[1],
            f.geometry.coordinates[0],
          ]);

        if (points.length > 0) {
          // Calculate the center of all points
          const center = points.reduce(
            (acc, curr) => [
              acc[0] + curr[0] / points.length,
              acc[1] + curr[1] / points.length,
            ],
            [0, 0]
          );

          // Calculate the spread to add padding
          const spread = points.reduce(
            (acc, curr) => [
              Math.max(acc[0], Math.abs(curr[0] - center[0])),
              Math.max(acc[1], Math.abs(curr[1] - center[1])),
            ],
            [0, 0]
          );

          // Add padding to the bounds
          const padding = 0.02; // Adjust this value to increase/decrease padding
          setBounds([
            [center[0] - spread[0] - padding, center[1] - spread[1] - padding],
            [center[0] + spread[0] + padding, center[1] + spread[1] + padding],
          ]);
        }
      }
    }
  }, [
    geoData,
    activeProjectLayers,
    selectedFundingLayer,
    selectedScope,
    selectedCounty,
    selectedUPC,
    propertyKeys
  ]);

  if (!bounds || !filteredData) {
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
      onMoveStart={() => setHighlightedProject && setHighlightedProject(null)}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />

      <MapHighlightEffect 
        project={highlightedProject} 
        setOpenPopupId={setOpenPopupId} 
        upcKey={propertyKeys.upc} 
      />

      {/* Render both pointer and colored circle markers */}
      {filteredData &&
        filteredData.features.map((feature, i) => {
          const isHighlighted = highlightedProject && 
            feature.properties[propertyKeys.upc] === highlightedProject.properties[propertyKeys.upc];
            
          return (
            <React.Fragment key={`marker-group-${i}`}>
              {/* Pointer Marker */}
              <Marker
                key={`pointer-${i}`}
                position={[
                  feature.geometry.coordinates[1],
                  feature.geometry.coordinates[0],
                ]}
                icon={DefaultIcon}
                zIndexOffset={isHighlighted ? 3000 : 1000} // Keep highlighted pointer on top
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
                    comments={comments.filter(
                      (c) =>
                        String(c.projectId) === String(feature.properties[propertyKeys.upc])
                    )}
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
                icon={createCustomIcon(
                  getProjectColor(feature.properties[propertyKeys.scope]),
                  isHighlighted
                )}
                zIndexOffset={isHighlighted ? 2900 : 900} 
              />
            </React.Fragment>
          );
        })}
    </MapContainer>
  );
}

export default MapView;
