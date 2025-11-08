/**
 * Script: transform-product-reviews-csv.ts
 *
 * Purpose: Transform the synthesized CSV at data/product_reviews_rows.csv into
 * a schema-compatible CSV for the Supabase table public.product_reviews.
 *
 * Input:  data/product_reviews_rows.csv (from synthesize-reviews-from-serpapi.ts)
 * Helper: lib/data/csv/products_rows_updated.csv (maps product_id <-> gtin)
 * Output: data/product_reviews_import.csv (headers match product_reviews table)
 *
 * Output CSV headers:
 *   product_id,rating,title,comment,is_verified_purchase,is_approved,
 *   helpful_count,created_at,source,external_id
 *
 * Notes:
 * - Maps GTIN to product_id by reading products_rows_updated.csv.
 * - Clamps/synthesizes rating to 1..5 (neutral fallback=3 when missing/invalid).
 * - Copies title/comment if present; otherwise leaves empty.
 * - Sets is_verified_purchase to boolean; defaults to false when missing.
 * - Sets is_approved to boolean; defaults to true when missing.
 * - Uses collected date from `date` or `collected_at`.
 * - Sets source (e.g., 'amazon-serpapi') if present; else 'external'.
 * - Synthesizes external_id when missing to avoid duplicates.
 */

import fs from 'fs';
import path from 'path';

type RowObj = Record<string, string>;

// Robust CSV parser (quoted fields, commas/newlines in fields, escaped quotes)
function parseCsv(content: string): { headers: string[]; rows: string[][] } {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  let wasInQuotes = false;

  const pushField = () => {
    const v = wasInQuotes ? field.replace(/""/g, '"') : field;
    row.push(v);
    field = '';
    wasInQuotes = false;
  };

  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    if (inQuotes) {
      if (ch === '"') {
        const next = content[i + 1];
        if (next === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
          wasInQuotes = true;
        }
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        pushField();
      } else if (ch === '\r') {
        // ignore CR (handle CRLF in \n)
      } else if (ch === '\n') {
        pushField();
        rows.push(row);
        row = [];
      } else {
        field += ch;
      }
    }
  }

  if (field.length > 0 || row.length > 0) {
    pushField();
    rows.push(row);
  }

  if (rows.length === 0) return { headers: [], rows: [] };
  // Skip leading empty rows
  let firstIdx = 0;
  while (firstIdx < rows.length) {
    const r = rows[firstIdx];
    const isEmpty = r.length === 0 || r.every((c) => (c ?? '').trim() === '');
    if (!isEmpty) break;
    firstIdx++;
  }
  const headers = rows[firstIdx] || [];
  const dataRows = rows.slice(firstIdx + 1);
  return { headers, rows: dataRows };
}

function toObjects(headers: string[], rows: string[][]): RowObj[] {
  return rows.map((r) => {
    const o: RowObj = {};
    headers.forEach((h, i) => (o[h] = r[i] ?? ''));
    return o;
  });
}

function escapeCsvField(field: unknown): string {
  if (field === null || field === undefined) return '';
  const str = String(field);
  if (str.includes(',') || str.includes('\n') || str.includes('"')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function cleanText(input: string): string {
  let s = input || '';
  s = s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  s = s.replace(/\s+/g, ' ').trim();
  s = s.replace(/[\u0000-\u001F\u007F]/g, '');
  return s;
}

function clampRating(raw: string): number {
  const n = parseFloat(raw);
  if (!isFinite(n) || n <= 0) return 3; // neutral fallback
  // Round to nearest integer and clamp 1..5
  const v = Math.round(n);
  return Math.max(1, Math.min(5, v));
}

function toBool(raw: string | undefined, fallback: boolean): boolean {
  if (raw === undefined || raw === '') return fallback;
  const s = String(raw).trim().toLowerCase();
  return s === 'true' || s === 't' || s === '1';
}

function synthesizeExternalId(
  asin: string,
  title: string,
  date: string
): string {
  const base = `${asin}|${cleanText(title)}|${date}`;
  let h = 0 >>> 0;
  for (let i = 0; i < base.length; i++) {
    h = (h * 31 + base.charCodeAt(i)) >>> 0;
  }
  return `serpapi-${asin || 'unknown'}-${h.toString(16)}`;
}

async function main() {
  const root = process.cwd();
  const inputCsvPath = path.resolve(root, 'data', 'product_reviews_rows.csv');
  const productsCsvPath = path.resolve(
    root,
    'lib',
    'data',
    'csv',
    'products_rows_updated.csv'
  );
  const outputCsvPath = path.resolve(
    root,
    'data',
    'product_reviews_import.csv'
  );

  // Read inputs
  const inputRaw = fs.readFileSync(inputCsvPath, 'utf8');
  const productsRaw = fs.readFileSync(productsCsvPath, 'utf8');

  const { headers: inHeaders, rows: inRows } = parseCsv(inputRaw);
  const inObjs = toObjects(inHeaders, inRows);

  const { headers: prodHeaders, rows: prodRows } = parseCsv(productsRaw);
  const prodObjs = toObjects(prodHeaders, prodRows);

  // Build GTIN -> product_id map from products CSV
  const idxId = prodHeaders.indexOf('id');
  const idxGtin = prodHeaders.indexOf('gtin');
  if (idxId === -1 || idxGtin === -1) {
    throw new Error(
      'products_rows_updated.csv must contain id and gtin columns'
    );
  }
  const productIdByGtin = new Map<string, string>();
  for (const r of prodRows) {
    const id = (r[idxId] || '').trim();
    const gtin = (r[idxGtin] || '').trim();
    if (id && gtin) productIdByGtin.set(gtin, id);
  }

  // Prepare output
  const outHeaders = [
    'product_id',
    'rating',
    'title',
    'comment',
    'is_verified_purchase',
    'is_approved',
    'helpful_count',
    'created_at',
    'source',
    'external_id',
  ];

  const lines: string[] = [];
  lines.push(outHeaders.join(','));

  let written = 0;
  let skippedNoProduct = 0;

  for (const r of inObjs) {
    const gtin = (r['gtin'] || '').trim();
    if (!gtin) {
      skippedNoProduct++;
      continue;
    }
    const productId = productIdByGtin.get(gtin);
    if (!productId) {
      skippedNoProduct++;
      continue;
    }

    const rating = clampRating(r['rating'] || '');
    const title = (r['title'] || '').trim();
    const comment = (
      r['comment_processed'] ||
      r['comment_original'] ||
      ''
    ).trim();
    const isVerified = toBool(r['is_verified_purchase'], false);
    const isApproved = toBool(r['is_approved'], true);
    const helpful = Number.parseInt((r['helpful_count'] || '0').trim(), 10);
    const createdAt = (r['date'] || r['collected_at'] || '').trim();
    const source = (r['source'] || 'external').trim();
    const asin = (r['asin'] || '').trim();
    const externalId = synthesizeExternalId(asin, title, createdAt);

    const outRow = [
      escapeCsvField(productId),
      escapeCsvField(String(rating)),
      escapeCsvField(title),
      escapeCsvField(comment),
      escapeCsvField(isVerified ? 'true' : 'false'),
      escapeCsvField(isApproved ? 'true' : 'false'),
      escapeCsvField(Number.isFinite(helpful) ? String(helpful) : '0'),
      escapeCsvField(createdAt),
      escapeCsvField(source),
      escapeCsvField(externalId),
    ];
    lines.push(outRow.join(','));
    written++;
  }

  fs.writeFileSync(outputCsvPath, lines.join('\n') + '\n', 'utf8');
  console.log(
    `Wrote ${written} review rows to ${outputCsvPath}. Skipped (no product_id): ${skippedNoProduct}.`
  );
}

main().catch((err) => {
  console.error('Transform failed:', err);
  process.exit(1);
});
