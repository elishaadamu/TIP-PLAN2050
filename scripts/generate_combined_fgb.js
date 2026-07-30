import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { geojson as fgbGeojson } from 'flatgeobuf';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, '..', 'public');

async function buildCombinedFgb() {
  const files = [
    'gdf_mtip_and_lrtp_projects.fgb',
    'gdf_projects.fgb',
    'mtip_27-30_projects.geojson',
    'projects_new.geojson',
    'projects.geojson'
  ];

  let combinedFeatures = [];
  const seenUpcs = new Set();

  for (const file of files) {
    const filePath = path.join(publicDir, file);
    if (!fs.existsSync(filePath)) continue;

    console.log(`Processing ${file}...`);
    let features = [];

    if (file.endsWith('.fgb')) {
      const buffer = fs.readFileSync(filePath);
      const uint8 = new Uint8Array(buffer);
      const iter = fgbGeojson.deserialize(uint8);
      for await (const feature of iter) {
        features.push(feature);
      }
    } else if (file.endsWith('.geojson') || file.endsWith('.json')) {
      const text = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(text);
      features = data.features || [];
    }

    console.log(`  -> Found ${features.length} features in ${file}`);

    for (const f of features) {
      const upc = f.properties?.UPC || f.properties?.upc || f.properties?.ID || f.properties?.project_id;
      const key = upc ? String(upc) : JSON.stringify(f.geometry);
      if (!seenUpcs.has(key)) {
        seenUpcs.add(key);
        combinedFeatures.push(f);
      }
    }
  }

  console.log(`\nTotal unique features combined: ${combinedFeatures.length}`);

  const combinedGeoJSON = {
    type: 'FeatureCollection',
    features: combinedFeatures
  };

  // Write combined.geojson
  const geojsonPath = path.join(publicDir, 'combined.geojson');
  fs.writeFileSync(geojsonPath, JSON.stringify(combinedGeoJSON, null, 2));
  console.log(`Saved ${geojsonPath}`);

  // Serialize to FlatGeobuf binary
  try {
    const fgbUint8 = fgbGeojson.serialize(combinedGeoJSON);
    const fgbPath = path.join(publicDir, 'combined.fgb');
    fs.writeFileSync(fgbPath, Buffer.from(fgbUint8));
    console.log(`Saved ${fgbPath} (${fgbUint8.length} bytes)`);

    // Verify deserialization
    const verifyBuffer = fs.readFileSync(fgbPath);
    const verifyIter = fgbGeojson.deserialize(new Uint8Array(verifyBuffer));
    let count = 0;
    for await (const feat of verifyIter) {
      count++;
    }
    console.log(`Verification: successfully deserialized ${count} features from combined.fgb!`);
  } catch (err) {
    console.error("Error serializing to FGB:", err);
  }
}

buildCombinedFgb();
