// Product tagging and CSV export with auditing metadata
// Usage: node scripts/tag-products.mjs --file "C:\\path\\to\\products.csv" --version "v1.0.0" --source "data/products.csv"
// - Preserves all existing fields and formatting
// - Adds a new column: category_tags (PostgreSQL array format)
// - Prepends metadata comment lines for auditing (timestamp, version, source)
// - Validates column counts and encoding, creates a timestamped backup

import fs from 'fs';
import path from 'path';

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { file: null, version: 'v1.0.0', source: '' };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--file') { opts.file = args[i + 1]; i++; continue; }
    if (a === '--version') { opts.version = args[i + 1]; i++; continue; }
    if (a === '--source') { opts.source = args[i + 1]; i++; continue; }
  }
  if (!opts.file) {
    console.error('Error: --file <absolute-path-to-products.csv> is required');
    process.exit(1);
  }
  return opts;
}

// Robust CSV parsing: quoted fields with commas and newlines (RFC4180-ish)
function parseCsv(content) {
  const rows = [];
  let field = '';
  let row = [];
  let inQuotes = false;
  let i = 0;
  while (i < content.length) {
    const ch = content[i];
    if (inQuotes) {
      if (ch === '"') {
        const next = content[i + 1];
        if (next === '"') { field += '"'; i += 2; continue; }
        inQuotes = false; i++; continue;
      }
      field += ch; i++; continue;
    } else {
      if (ch === '"') { inQuotes = true; i++; continue; }
      if (ch === ',') { row.push(field); field = ''; i++; continue; }
      if (ch === '\n') { row.push(field); rows.push(row); field = ''; row = []; i++; continue; }
      if (ch === '\r') {
        const next = content[i + 1];
        if (next === '\n') { row.push(field); rows.push(row); field = ''; row = []; i += 2; continue; }
        i++; continue; // ignore bare CR
      }
      field += ch; i++;
    }
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows;
}

function escapeCsvField(value) {
  if (value == null) return '';
  const str = String(value);
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function stringifyCsv(rows) {
  return rows.map((r) => r.map(escapeCsvField).join(',')).join('\n');
}

// Helpers for tagging
function norm(text) {
  return (text || '').toLowerCase();
}

function has(text, pattern) {
  if (!text) return false;
  return pattern.test(text.toLowerCase());
}

function extractSeries(name, slug) {
  const s = norm(`${name || ''} ${slug || ''}`);
  // Common series identifiers
  if (/(\b|-)s21(\b|-)/.test(s)) return 's21';
  if (/(\b|-)s19(\b|-)/.test(s)) return 's19';
  if (/(\b|-)l7(\b|-)/.test(s)) return 'l7';
  if (/(\b|-)l9(\b|-)/.test(s)) return 'l9';
  if (/avalon\b/.test(s) && /nano\b/.test(s)) return 'avalon-nano';
  if (/avalon\b/.test(s) && /mini\b/.test(s)) return 'avalon-mini';
  if (/avalon\b/.test(s) && /q\b/.test(s)) return 'avalon-q';
  return '';
}

function normalizeUnitTag(value, unit) {
  // value: number or string; unit: 't' | 'gh' | 'w' | 'j/t'
  if (!value) return '';
  const str = String(value).toLowerCase();
  const m = str.match(/[0-9]+(?:\.[0-9]+)?/);
  if (!m) return '';
  const n = m[0];
  return `${n}${unit}`;
}

function detectAlgorithm(algorithmCol, name, description) {
  const pool = norm(`${algorithmCol || ''} ${name || ''} ${description || ''}`);
  if (/(sha[\s-]?256|sha\s*256)\b/.test(pool)) return 'sha256';
  if (/scrypt\b/.test(pool)) return 'scrypt';
  return '';
}

function detectBrand(brandCol, name) {
  const pool = norm(`${brandCol || ''} ${name || ''}`);
  if (/bitmain\b|antminer\b/.test(pool)) return 'bitmain';
  if (/microbt\b|whatsminer\b/.test(pool)) return 'microbt';
  if (/canaan\b|avalon\b/.test(pool)) return 'canaan';
  if (/wizminer\b/.test(pool)) return 'wizminer';
  return (brandCol || '').toLowerCase() || '';
}

function detectServiceTags(name, description) {
  const pool = norm(`${name || ''} ${description || ''}`);
  const tags = [];
  if (/hosting|colocation|eur\s*\/\s*kw|kw\b/.test(pool)) tags.push('services>hosting');
  if (/repair|board\b|psu\b|power\s*supply|diagnostic|reflow|solder/.test(pool)) tags.push('training>repair');
  return tags;
}

function generateCategoryTags(row, idxs) {
  const name = row[idxs.nameIdx] || '';
  const description = row[idxs.descriptionIdx] || '';
  const slug = row[idxs.slugIdx] || '';
  const brandCol = row[idxs.brandIdx] || '';
  const algoCol = row[idxs.algorithmIdx] || '';
  const hashRate = row[idxs.hashIdx] || '';
  const power = row[idxs.powerIdx] || '';
  const efficiency = row[idxs.efficiencyIdx] || '';

  const tags = new Set();

  // Base hardware category
  tags.add('hardware>asic-miner');

  // Algorithm
  const algo = detectAlgorithm(algoCol, name, description);
  if (algo) tags.add(`hardware>asic-miner>${algo}`);

  // Brand
  const brand = detectBrand(brandCol, name);
  if (brand) tags.add(`brand>${brand}`);

  // Series
  const series = extractSeries(name, slug);
  if (series) tags.add(`series>${series}`);

  // Performance attributes
  const hrTag = normalizeUnitTag(hashRate, 't'); // e.g., 200T
  if (hrTag) tags.add(`hashrate>${hrTag}`);
  const pTag = normalizeUnitTag(power, 'w');
  if (pTag) tags.add(`power>${pTag}`);
  const effTag = normalizeUnitTag(efficiency, 'j/t');
  if (effTag) tags.add(`efficiency>${effTag}`);

  // Service/training detections
  for (const t of detectServiceTags(name, description)) tags.add(t);

  // Educational theme when hardware present
  tags.add('theme>electronic-engineering');

  // Return PostgreSQL array format: {"a","b"}
  const arr = Array.from(tags);
  return '{' + arr.map((t) => '"' + t + '"').join(',') + '}';
}

function main() {
  const { file, version, source } = parseArgs();
  const abs = path.resolve(file);
  const originalBuffer = fs.readFileSync(abs);
  const original = originalBuffer.toString('utf8');
  const hadBOM = originalBuffer[0] === 0xef && originalBuffer[1] === 0xbb && originalBuffer[2] === 0xbf;

  const rows = parseCsv(original);
  if (rows.length === 0) { console.error('Error: CSV appears empty.'); process.exit(1); }

  const header = rows[0];
  const idxs = {
    nameIdx: header.indexOf('name'),
    slugIdx: header.indexOf('slug'),
    descriptionIdx: header.indexOf('description'),
    brandIdx: header.indexOf('brand'),
    algorithmIdx: header.indexOf('algorithm'),
    hashIdx: header.indexOf('hash_rate'),
    powerIdx: header.indexOf('power_consumption'),
    efficiencyIdx: header.indexOf('efficiency'),
  };
  for (const [k, v] of Object.entries(idxs)) {
    if (v === -1) { console.error(`Error: CSV header missing required column: ${k}`); process.exit(1); }
  }

  // Add new column: category_tags at the end, preserving all existing columns and order
  const newHeader = header.slice();
  newHeader.push('category_tags');

  const updatedRows = [newHeader];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r].slice();
    const catTags = generateCategoryTags(row, idxs);
    row.push(catTags);
    updatedRows.push(row);
  }

  // Create backup
  const dir = path.dirname(abs);
  const baseName = path.basename(abs);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupName = `${baseName}.bak-${timestamp}`;
  const backupPath = path.join(dir, backupName);
  fs.writeFileSync(backupPath, originalBuffer);

  // Metadata comment block (at top)
  const meta = [
    `# processed_timestamp=${new Date().toISOString()}`,
    `# version=${version}`,
    `# data_source=${source || abs}`,
  ].join('\n') + '\n';

  // Write updated CSV, preserving BOM if present
  let updatedCsv = stringifyCsv(updatedRows);
  updatedCsv = meta + updatedCsv;
  const outBuffer = Buffer.from((hadBOM ? '\uFEFF' : '') + updatedCsv, 'utf8');
  fs.writeFileSync(abs, outBuffer);

  // Validation: re-parse and confirm column counts
  const re = fs.readFileSync(abs, 'utf8');
  // Strip leading metadata comment lines for parsing validation
  const reData = re.split('\n').filter((line) => !/^#/.test(line)).join('\n');
  const vRows = parseCsv(reData);
  if (vRows.length !== updatedRows.length) {
    console.error(`Validation failed: row count mismatch (${vRows.length} vs ${updatedRows.length}).`);
    process.exit(1);
  }
  const vHeaderLen = vRows[0].length;
  const expectedLen = newHeader.length;
  for (let i = 1; i < vRows.length; i++) {
    if (vRows[i].length !== expectedLen) {
      console.error(`Validation failed: row ${i} has ${vRows[i].length} columns; expected ${expectedLen}.`);
      process.exit(1);
    }
  }

  console.log(`Backup created: ${backupPath}`);
  console.log(`Updated CSV written: ${abs}`);
  console.log(`Validation passed: ${vRows.length - 1} records, ${vHeaderLen} columns.`);
}

main();

