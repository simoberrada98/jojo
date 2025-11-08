// Slug normalization for products.csv
// Usage: node scripts/normalize-slugs.mjs --file "C:\\path\\to\\products.csv"
// Creates a backup alongside the original, then rewrites only the slug column.

import fs from 'fs';
import path from 'path';

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--file') {
      opts.file = args[i + 1];
      i++;
    }
  }
  if (!opts.file) {
    console.error('Error: --file <absolute-path-to-products.csv> is required');
    process.exit(1);
  }
  return opts;
}

// Robust CSV parsing: handles quoted fields with commas and newlines.
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
        if (next === '"') {
          // Escaped quote
          field += '"';
          i += 2;
          continue;
        } else {
          inQuotes = false;
          i++;
          continue;
        }
      } else {
        field += ch;
        i++;
        continue;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
        i++;
        continue;
      }
      if (ch === ',') {
        row.push(field);
        field = '';
        i++;
        continue;
      }
      if (ch === '\n') {
        row.push(field);
        rows.push(row);
        field = '';
        row = [];
        i++;
        continue;
      }
      if (ch === '\r') {
        // Handle CRLF: consume CR, and if next is LF, consume as newline
        const next = content[i + 1];
        if (next === '\n') {
          row.push(field);
          rows.push(row);
          field = '';
          row = [];
          i += 2;
          continue;
        } else {
          // Treat CR as whitespace
          i++;
          continue;
        }
      }
      field += ch;
      i++;
    }
  }
  // Push last field/row if any
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function escapeCsvField(value) {
  if (value == null) return '';
  const str = String(value);
  if (
    str.includes('"') ||
    str.includes(',') ||
    str.includes('\n') ||
    str.includes('\r')
  ) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function stringifyCsv(rows) {
  return rows.map((r) => r.map(escapeCsvField).join(',')).join('\n');
}

// Stop words to drop from slugs (generic + ecommerce fillers)
const STOP_WORDS = new Set([
  'the',
  'a',
  'an',
  'and',
  'or',
  'for',
  'to',
  'of',
  'in',
  'on',
  'with',
  'by',
  'at',
  'from',
  'as',
  'is',
  'are',
  'be',
  'that',
  'this',
  'these',
  'those',
  'it',
  'its',
  'your',
  'you',
  'our',
  'their',
  'my',
  'we',
  'new',
  'best',
  'top',
  'high',
  'quality',
  'powerful',
  'performance',
  'premium',
  'original',
  'official',
  'brand',
  'model',
  'series',
  'version',
  'edition',
  'plus',
  'pro',
  'max',
  'ultra',
  'set',
  'bundle',
  'includes',
  'include',
  'kit',
  'pack',
  'unit',
  'device',
  'machine',
  'server',
  'psu',
  'hashrate',
  'mining',
  'miner',
  'asic',
  'gpu',
  'rig',
  'shop',
  'store',
  'sale',
]);

function sanitizeToken(t) {
  return t
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim();
}

function tokenize(source) {
  // Break on non-alphanumeric, hyphens, underscores, and spaces
  return source
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}

function meaningfulTokens(tokens) {
  return tokens.filter((t) => !STOP_WORDS.has(t) && t.length > 1);
}

function buildSlug(tokens, maxWords = 7, minWords = 3, maxLength = 75) {
  // Limit tokens to 3-7 words while keeping within maxLength
  let selected = tokens.slice(0, maxWords);
  if (selected.length < minWords) {
    selected = tokens.slice(0, Math.min(tokens.length, minWords));
  }
  // Sanitize each token
  selected = selected.map(sanitizeToken).filter(Boolean);
  if (selected.length === 0) return '';
  // If length exceeds maxLength, gradually drop tokens from the end
  let slug = selected.join('-');
  while (slug.length > maxLength && selected.length > minWords) {
    selected.pop();
    slug = selected.join('-');
  }
  // If still too long, hard trim and avoid cutting in the middle of a hyphen
  if (slug.length > maxLength) {
    slug = slug.slice(0, maxLength);
    slug = slug.replace(/-+$/g, '');
  }
  return slug;
}

function normalizeSlug(existingSlug, name, sku) {
  const base =
    existingSlug && existingSlug.trim().length > 0 ? existingSlug : name || '';
  let tokens = tokenize(base);
  tokens = meaningfulTokens(tokens);
  if (tokens.length === 0) {
    // Fallback to sku tokens
    tokens = meaningfulTokens(tokenize(sku || ''));
  }
  let slug = buildSlug(tokens);
  if (!slug) {
    // Last resort: use sanitized SKU or name
    const fallback = (sku || name || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    slug = fallback.slice(0, 75);
  }
  return slug;
}

function main() {
  const { file } = parseArgs();
  const abs = path.resolve(file);
  const original = fs.readFileSync(abs, 'utf8');

  // Parse CSV
  const rows = parseCsv(original);
  if (rows.length === 0) {
    console.error('Error: CSV appears empty.');
    process.exit(1);
  }
  const header = rows[0];
  const slugIdx = header.indexOf('slug');
  const nameIdx = header.indexOf('name');
  const skuIdx = header.indexOf('sku');
  if (slugIdx === -1) {
    console.error('Error: CSV header missing "slug" column.');
    process.exit(1);
  }

  // Prepare uniqueness map
  const seen = new Map();

  // Update rows with normalized slugs
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const currentSlug = row[slugIdx] || '';
    const name = nameIdx !== -1 ? row[nameIdx] || '' : '';
    const sku = skuIdx !== -1 ? row[skuIdx] || '' : '';

    let nextSlug = normalizeSlug(currentSlug, name, sku);
    // Enforce uniqueness by appending sanitized SKU if needed
    const base = nextSlug;
    if (seen.has(base)) {
      const suffix = sku ? sanitizeToken(sku) : String(seen.get(base) + 1);
      nextSlug = buildSlug([...tokenize(base), suffix]);
    }
    seen.set(base, (seen.get(base) || 0) + 1);

    row[slugIdx] = nextSlug;
  }

  // Create backup
  const dir = path.dirname(abs);
  const baseName = path.basename(abs);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupName = `${baseName}.bak-${timestamp}`;
  const backupPath = path.join(dir, backupName);
  fs.writeFileSync(backupPath, original, 'utf8');

  // Write updated CSV
  const updated = stringifyCsv(rows);
  fs.writeFileSync(abs, updated, 'utf8');

  console.log(`Backup created: ${backupPath}`);
  console.log(`Updated CSV written: ${abs}`);
}

main();
