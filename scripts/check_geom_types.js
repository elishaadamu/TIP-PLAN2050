import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { geojson as fgbGeojson } from 'flatgeobuf';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const fgbPath = path.join(__dirname, '..', 'public', 'combined.fgb');
  const buffer = fs.readFileSync(fgbPath);
  const iter = fgbGeojson.deserialize(new Uint8Array(buffer));
  const typeCounts = {};
  for await (const f of iter) {
    const t = f.geometry?.type || 'NO_GEOMETRY';
    typeCounts[t] = (typeCounts[t] || 0) + 1;
  }
  console.log('Geometry type counts:', typeCounts);
}
main();
