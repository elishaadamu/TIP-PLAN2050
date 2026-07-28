import { geojson as fgbGeojson } from "flatgeobuf";

/**
 * Parses an ArrayBuffer containing FlatGeobuf binary data into a GeoJSON FeatureCollection.
 * @param {ArrayBuffer} arrayBuffer 
 * @returns {Promise<{type: "FeatureCollection", features: Array}>}
 */
export async function parseFgbBuffer(arrayBuffer) {
  const uint8 = new Uint8Array(arrayBuffer);
  const iterator = fgbGeojson.deserialize(uint8);
  const features = [];
  for await (const feature of iterator) {
    features.push(feature);
  }
  return {
    type: "FeatureCollection",
    features
  };
}

/**
 * Fetches or parses spatial data from a File, Blob, or URL string (.fgb or .geojson).
 * @param {string|File|Blob} target 
 * @returns {Promise<{type: "FeatureCollection", features: Array}>}
 */
export async function fetchSpatialData(target) {
  if (!target) throw new Error("No spatial dataset provided");

  if (typeof File !== "undefined" && (target instanceof File || target instanceof Blob)) {
    const isFgb = target.name ? target.name.toLowerCase().endsWith(".fgb") : true;
    if (isFgb) {
      const buffer = await target.arrayBuffer();
      return await parseFgbBuffer(buffer);
    } else {
      const text = await target.text();
      return JSON.parse(text);
    }
  }

  const url = String(target);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch spatial file from ${url}: ${res.statusText}`);
  }

  if (url.toLowerCase().includes(".fgb")) {
    const buffer = await res.arrayBuffer();
    return await parseFgbBuffer(buffer);
  } else {
    return await res.json();
  }
}

