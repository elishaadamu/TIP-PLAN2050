import React, { useState, useEffect } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from "react-leaflet";
import ProjectPopup from "./ProjectPopup";
import "leaflet/dist/leaflet.css";
import icon from "leaflet/dist/images/marker-icon.png";
import iconRetina from "leaflet/dist/images/marker-icon-2x.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

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
  Roadway: "#FF6B6B", // Coral Red
  Transit: "#4ECDC4", // Teal
  "Bike/Ped": "#ccd145ff", // Sky Blue
};

const createCustomIcon = (color) => {
  return L.divIcon({
    className: "custom-div-icon",
    html: `<div style=\"background-color: ${color}; width: 15px; height: 15px; border-radius: 50%; border: 1px solid #000;\"></div>`,
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
            feature.properties.Scope === selectedScope;
          const isLayerActive = activeProjectLayers.includes(
            feature.properties.project_type
          );
          const matchesFundingLayer =
            selectedFundingLayer === "All" ||
            feature.properties.Type === selectedFundingLayer;
          const matchesCounty =
            selectedCounty === "All" ||
            feature.properties.County === selectedCounty;
          const matchesUPC =
            !selectedUPC ||
            String(feature.properties.UPC).includes(selectedUPC);

          return (
            matchesScope &&
            matchesCounty &&
            matchesUPC &&
            (selectedFundingLayer === "All" ||
              feature.properties.Type === selectedFundingLayer)
          );
        }),
      };

      setFilteredData(filtered);

      // Calculate bounds including both points and paths
      if (filtered.features.length > 0) {
        const points = filtered.features.map((f) => [
          f.geometry.coordinates[1],
          f.geometry.coordinates[0],
        ]);

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
  }, [
    geoData,
    activeProjectLayers,
    selectedFundingLayer,
    selectedScope,
    selectedCounty,
    selectedUPC,
  ]);

  if (!bounds) {
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
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />

      {/* Render both pointer and colored circle markers */}
      {filteredData &&
        filteredData.features.map((feature, i) => (
          <React.Fragment key={`marker-group-${i}`}>
            {/* Pointer Marker */}
            <Marker
              key={`pointer-${i}`}
              position={[
                feature.geometry.coordinates[1],
                feature.geometry.coordinates[0],
              ]}
              icon={DefaultIcon}
              zIndexOffset={1000} // Keep pointer on top
              eventHandlers={{
                click: () => {
                  setOpenPopupId(feature.properties.UPC);
                },
              }}
            >
              <Tooltip>{feature.properties.Description}</Tooltip>
              <Popup onClose={onClosePopup}>
                <ProjectPopup
                  project={feature.properties}
                  addComment={addComment}
                  comments={comments.filter(
                    (c) =>
                      String(c.projectId) === String(feature.properties.UPC)
                  )}
                  onClosePopup={onClosePopup}
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
                projectTypeColors[feature.properties.Scope] || "#808080" // Default to gray if scope not in colors
              )}
              zIndexOffset={900} // Keep circle below pointer
            />
          </React.Fragment>
        ))}
    </MapContainer>
  );
}

export default MapView;
