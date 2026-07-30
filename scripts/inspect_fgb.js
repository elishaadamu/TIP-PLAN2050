import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { geojson as fgbGeojson } from 'flatgeobuf';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function inspectDataset() {
  let geojson = null;
  const fgbPath = path.join(__dirname, '..', 'public', 'combined.fgb');
  const geojsonPath = path.join(__dirname, '..', 'public', 'combined.geojson');

  // 1. Try local combined.fgb
  if (fs.existsSync(fgbPath)) {
    console.log(`Loading local FlatGeobuf binary: ${fgbPath}`);
    const buffer = fs.readFileSync(fgbPath);
    const uint8 = new Uint8Array(buffer);
    const iter = fgbGeojson.deserialize(uint8);
    const features = [];
    for await (const feature of iter) {
      features.push(feature);
    }
    geojson = { type: 'FeatureCollection', features };
  } 
  // 2. Try local combined.geojson
  else if (fs.existsSync(geojsonPath)) {
    console.log(`Loading local GeoJSON file: ${geojsonPath}`);
    geojson = JSON.parse(fs.readFileSync(geojsonPath, 'utf8'));
  } 
  // 3. Try fetching from MongoDB API
  else {
    console.log(`Local file not found, fetching combined.fgb from MongoDB API...`);
    try {
      const res = await axios.get('https://ecointeractive.onrender.com/api/geojson/get/combined.fgb');
      geojson = res.data.geojsonData;
    } catch (e) {
      try {
        const activeRes = await axios.get('https://ecointeractive.onrender.com/api/geojson/active');
        geojson = activeRes.data.geojsonData;
      } catch (err2) {
        console.error("Could not fetch dataset from DB or local filesystem.");
        return;
      }
    }
  }

  if (!geojson || !geojson.features || geojson.features.length === 0) {
    console.log("Dataset is empty or contains 0 features.");
    return;
  }

  console.log(`\n==================================================`);
  console.log(`DATASET SUMMARY`);
  console.log(`==================================================`);
  console.log(`Total Features: ${geojson.features.length}`);

  // Collect all unique property keys (headers)
  const headers = new Set();
  const geometryTypes = new Set();

  geojson.features.forEach(f => {
    if (f.geometry && f.geometry.type) {
      geometryTypes.add(f.geometry.type);
    }
    if (f.properties) {
      Object.keys(f.properties).forEach(k => headers.add(k));
    }
  });

  console.log(`\nGeometry Types Found:`, Array.from(geometryTypes).join(', '));
  console.log(`\nProperty Headers / Column Keys (${headers.size} total):`);
  const headerList = Array.from(headers);
  headerList.forEach((h, index) => {
    console.log(`  ${index + 1}. "${h}"`);
  });

  console.log(`\n==================================================`);
  console.log(`SAMPLE FEATURE (Feature #1)`);
  console.log(`==================================================`);
  const sample = geojson.features[0];
  console.log(`Geometry Type:`, sample.geometry?.type);
  console.log(`Coordinates:`, JSON.stringify(sample.geometry?.coordinates));
  console.log(`Properties:`);
  console.dir(sample.properties, { depth: null, colors: true });

  if (geojson.features.length > 1) {
    console.log(`\n==================================================`);
    console.log(`SAMPLE FEATURE (Feature #2)`);
    console.log(`==================================================`);
    console.dir(geojson.features[1].properties, { depth: null, colors: true });
  }
}

inspectDataset();
