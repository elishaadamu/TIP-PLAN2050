import { geojson as fgbGeojson } from "flatgeobuf";

/**
 * Parses an ArrayBuffer containing FlatGeobuf binary data or GeoJSON text fallback.
 * @param {ArrayBuffer} arrayBuffer 
 * @returns {Promise<{type: "FeatureCollection", features: Array}>}
 */
export async function parseFgbBuffer(arrayBuffer) {
  const uint8 = new Uint8Array(arrayBuffer);

  // Check if buffer is actually HTML (e.g., Vite/SPA 404 index.html fallback)
  const textHeader = new TextDecoder().decode(uint8.subarray(0, 150)).trim();
  if (textHeader.toLowerCase().startsWith("<!doctype") || textHeader.toLowerCase().startsWith("<html")) {
    throw new Error("File not found on server (received HTML page response instead of FlatGeobuf binary dataset)");
  }

  // Try parsing as FlatGeobuf binary
  try {
    const iterator = fgbGeojson.deserialize(uint8);
    const features = [];
    for await (const feature of iterator) {
      features.push(feature);
    }
    return {
      type: "FeatureCollection",
      features
    };
  } catch (err) {
    // Fallback: If file was saved as JSON / GeoJSON despite .fgb extension
    if (textHeader.startsWith("{") || textHeader.startsWith("[")) {
      try {
        const textContent = new TextDecoder().decode(uint8);
        const parsed = JSON.parse(textContent);
        if (parsed && (parsed.type === "FeatureCollection" || Array.isArray(parsed.features))) {
          return parsed;
        }
      } catch (jsonErr) {
        // Ignore and rethrow original fgb error below
      }
    }
    throw new Error(`Invalid FlatGeobuf binary format: ${err.message}`);
  }
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
    const buffer = await target.arrayBuffer();
    if (isFgb) {
      try {
        return await parseFgbBuffer(buffer);
      } catch (err) {
        try {
          const text = new TextDecoder().decode(buffer);
          return JSON.parse(text);
        } catch (e) {
          throw err;
        }
      }
    } else {
      const text = new TextDecoder().decode(buffer);
      return JSON.parse(text);
    }
  }

  const url = String(target);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch spatial file from ${url}: ${res.statusText}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("text/html")) {
    throw new Error(`File at ${url} was not found on server (received HTML page).`);
  }

  if (url.toLowerCase().includes(".fgb")) {
    const buffer = await res.arrayBuffer();
    return await parseFgbBuffer(buffer);
  } else {
    return await res.json();
  }
}

