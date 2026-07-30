import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { geojson as fgbGeojson } from 'flatgeobuf';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function checkMissing() {
  const fgbPath = path.join(__dirname, '..', 'public', 'combined.fgb');
  if (!fs.existsSync(fgbPath)) {
    console.log("public/combined.fgb not found.");
    return;
  }

  const buffer = fs.readFileSync(fgbPath);
  const iter = fgbGeojson.deserialize(new Uint8Array(buffer));
  const features = [];
  for await (const f of iter) {
    features.push(f);
  }

  console.log(`Total features in file: ${features.length}`);
  const invalid = [];

  features.forEach((f, idx) => {
    const geom = f.geometry;
    if (!geom || !geom.coordinates || !Array.isArray(geom.coordinates) || geom.coordinates.length === 0) {
      invalid.push({ idx, reason: "Missing geometry or coordinates", properties: f.properties });
      return;
    }

    const { type, coordinates } = geom;
    let lat = null, lng = null;

    if (type === "Point") {
      lng = Number(coordinates[0]);
      lat = Number(coordinates[1]);
    } else if (type === "LineString" && coordinates[0]) {
      lng = Number(coordinates[0][0]);
      lat = Number(coordinates[0][1]);
    } else if (type === "MultiLineString" && coordinates[0] && coordinates[0][0]) {
      lng = Number(coordinates[0][0][0]);
      lat = Number(coordinates[0][0][1]);
    }

    if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
      invalid.push({ idx, reason: `Invalid lat/lng: lat=${lat}, lng=${lng}`, type, properties: f.properties });
    }
  });

  console.log(`Features with invalid or missing map coordinates (${invalid.length} total):`);
  console.dir(invalid, { depth: null, colors: true });
}

checkMissing();
