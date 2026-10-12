// One-time extractor: pulls the `const DATA = {...}` blob out of the original
// single-file dashboard and writes it as a static JSON asset (plus a decoded
// logo image) that the React app fetches at runtime.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const htmlPath = resolve(root, 'VF_MIS_Dashboard.html');
const html = readFileSync(htmlPath, 'utf8');

const dataLine = html
  .split('\n')
  .find((l) => l.startsWith('const DATA = '));

if (!dataLine) {
  throw new Error('Could not find the `const DATA = ...` line in VF_MIS_Dashboard.html');
}

const jsonText = dataLine.replace(/^const DATA = /, '').replace(/;\s*$/, '');
const data = JSON.parse(jsonText);

const outDir = resolve(root, 'public');
mkdirSync(resolve(outDir, 'data'), { recursive: true });

// Decode the embedded logo (a base64 data URL) into a real asset.
const logo = data.logo;
if (typeof logo === 'string' && logo.startsWith('data:image/')) {
  const comma = logo.indexOf(',');
  const meta = logo.slice(0, comma);
  const base64 = logo.slice(comma + 1);
  const ext = meta.includes('png') ? 'png' : meta.includes('gif') ? 'gif' : 'jpg';
  writeFileSync(resolve(outDir, `logo.${ext}`), Buffer.from(base64, 'base64'));
  console.log(`Wrote public/logo.${ext}`);
}
delete data.logo;

writeFileSync(resolve(outDir, 'data/mis-dashboard.json'), JSON.stringify(data, null, 2));

console.log('Wrote public/data/mis-dashboard.json');
console.log('Top-level keys:', Object.keys(data).join(', '));
console.log('Roster rows:', Array.isArray(data.roster) ? data.roster.length : 'n/a');
console.log('Issues:', Array.isArray(data.issues) ? data.issues.length : 'n/a');
console.log('Schools:', Array.isArray(data.schools) ? data.schools.length : 'n/a');
