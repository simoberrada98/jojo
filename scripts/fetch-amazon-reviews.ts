#!/usr/bin/env ts-node
import '@/lib/config/load-env';
import { publishReviewsForGtin } from '@/lib/services/reviews/amazon-reviews.service';
import { logger } from '@/lib/utils/logger';
import { env } from '@/lib/config/env';
import { SupabaseAdminService } from '@/lib/services/supabase-admin.service';
import { promises as fs } from 'fs';
import path from 'path';

// Absolute paths provided by user
const XML_FEED_PATH = 'c:/Users/simoe/Documents/GitHub/miny/mintyos/data/products_feed_gtin.xml';
const PRODUCTS_CSV_PATH = 'c:/Users/simoe/Documents/GitHub/miny/mintyos/data/products.csv';
const VARIANTS_CSV_PATH = 'c:/Users/simoe/Documents/GitHub/miny/mintyos/data/product_variants_rows.csv';

function extractGtinsFromXml(xml: string): string[] {
  const gtins: string[] = [];
  const regex = /<g:gtin>([^<]+)<\/g:gtin>/gi;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(xml))) {
    const v = m[1].trim();
    if (v) gtins.push(v);
  }
  // Deduplicate
  return Array.from(new Set(gtins));
}

function parseCsvRows(csv: string): { headers: string[]; rows: string[][] } {
  // Minimal CSV parser that respects quotes
  const lines = csv.split(/\r?\n/).filter((l) => l.length > 0);
  const headers = parseCsvLine(lines[0]);
  const rows: string[][] = [];
  for (let i = 1; i < lines.length; i++) {
    rows.push(parseCsvLine(lines[i]));
  }
  return { headers, rows };
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        // Lookahead for escaped quote
        if (line[i + 1] === '"') {
          cur += '"';
          i++; // skip the escaped quote
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        result.push(cur);
        cur = '';
      } else {
        cur += ch;
      }
    }
  }
  result.push(cur);
  return result.map((s) => s.trim());
}

function buildIndex(headers: string[], rows: string[][]) {
  const idx: Record<string, number> = {};
  headers.forEach((h, i) => (idx[h] = i));
  return idx;
}

async function gatherGtinsFromXmlAndSupabase(): Promise<{ gtinsXml: string[]; matchedProducts: { id: string; gtin: string }[] }> {
  // Read XML
  const xml = await fs.readFile(XML_FEED_PATH, 'utf-8').catch((err) => {
    throw new Error(`Failed to read XML feed at ${XML_FEED_PATH}: ${err?.message || err}`);
  });
  const gtinsXml = extractGtinsFromXml(xml);
  if (gtinsXml.length === 0) {
    logger.warn('No GTINs found in XML feed');
  }

  // Query Supabase for products with gtin in list
  const admin = new SupabaseAdminService();
  const supabase = admin.getClient();
  const { data, error } = await supabase
    .from('products')
    .select('id, gtin')
    .in('gtin', gtinsXml);

  if (error) throw error;
  const matchedProducts = (data || []).filter((p) => !!p.gtin) as { id: string; gtin: string }[];
  return { gtinsXml, matchedProducts };
}

async function validateAgainstProductsCsv(gtinsXml: string[]) {
  const csv = await fs.readFile(PRODUCTS_CSV_PATH, 'utf-8').catch((err) => {
    throw new Error(`Failed to read products.csv at ${PRODUCTS_CSV_PATH}: ${err?.message || err}`);
  });
  const { headers, rows } = parseCsvRows(csv);
  const idx = buildIndex(headers, rows);
  const gtinCol = idx['gtin'];
  if (gtinCol === undefined) {
    logger.warn('gtin column not found in products.csv');
    return new Set<string>();
  }
  const gtinsCsv = new Set<string>();
  for (const row of rows) {
    const v = row[gtinCol]?.trim();
    if (v) gtinsCsv.add(v);
  }

  // Log any XML GTIN not present in CSV
  const missingInCsv = gtinsXml.filter((g) => !gtinsCsv.has(g));
  if (missingInCsv.length) {
    logger.warn('GTINs present in XML but missing in products.csv', undefined, { count: missingInCsv.length, list: missingInCsv.slice(0, 20) });
  }
  return gtinsCsv;
}

async function validateVariantLinkage(gtinByProductId: Map<string, string>) {
  const csv = await fs.readFile(VARIANTS_CSV_PATH, 'utf-8').catch((err) => {
    throw new Error(`Failed to read product_variants_rows.csv at ${VARIANTS_CSV_PATH}: ${err?.message || err}`);
  });
  const { headers, rows } = parseCsvRows(csv);
  const idx = buildIndex(headers, rows);
  const productIdCol = idx['product_id'];
  const gtinCol = idx['gtin'];
  if (productIdCol === undefined) {
    logger.warn('product_id column not found in variants CSV');
    return;
  }

  let linked = 0;
  let missingParent = 0;
  let mismatched = 0;

  for (const row of rows) {
    const pid = row[productIdCol]?.trim();
    if (!pid) continue;
    const parentGtin = gtinByProductId.get(pid);
    const variantGtin = gtinCol !== undefined ? row[gtinCol]?.trim() || '' : '';
    if (!parentGtin) {
      missingParent += 1;
      continue;
    }
    if (variantGtin && variantGtin !== parentGtin) {
      mismatched += 1;
    } else {
      linked += 1;
    }
  }

  logger.info('Variant linkage validation complete', undefined, { linked, missingParent, mismatched });
}

async function processGtins(gtins: string[]) {
  if (!env.SERPAPI_API_KEY) {
    console.error('SERPAPI_API_KEY is not configured. Aborting.');
    process.exit(1);
  }

  let totalInserted = 0;
  let totalUpdated = 0;
  for (const gtin of gtins) {
    try {
      logger.info('Processing GTIN', undefined, { gtin });
      const result = await publishReviewsForGtin(gtin);
      totalInserted += result.inserted;
      totalUpdated += result.updated;
      logger.info('Publish complete', undefined, { gtin, ...result });
    } catch (error) {
      logger.error('Failed processing GTIN', error as Error, { gtin });
    }
  }

  logger.info('All GTINs processed', undefined, { totalInserted, totalUpdated });
}

async function main() {
  const singleArg = process.argv[2]?.trim();

  try {
    if (singleArg) {
      // Backward-compat mode: process a single GTIN provided via CLI argument
      logger.info('Running in single-GTIN mode', undefined, { gtin: singleArg });
      await processGtins([singleArg]);
      return;
    }

    // Auto mode: read XML -> cross-reference CSV -> query Supabase -> process
    logger.info('Starting auto GTIN discovery from XML and Supabase');
    const { gtinsXml, matchedProducts } = await gatherGtinsFromXmlAndSupabase();
    logger.info('GTINs found in XML', undefined, { count: gtinsXml.length });
    logger.info('Products matched in Supabase', undefined, { count: matchedProducts.length });

    // Build productId -> gtin map and set of matched GTINs
    const gtinByProductId = new Map<string, string>();
    const matchedGtins = new Set<string>();
    matchedProducts.forEach((p) => {
      gtinByProductId.set(p.id, p.gtin);
      matchedGtins.add(p.gtin);
    });

    // Cross-validate with products.csv
    const gtinsCsv = await validateAgainstProductsCsv(gtinsXml);
    const finalGtins = Array.from(new Set([...gtinsXml].filter((g) => matchedGtins.has(g))));

    logger.info('Final GTIN set to process', undefined, {
      count: finalGtins.length,
      sample: finalGtins.slice(0, 20),
    });

    // Validate variants linkage for observability
    await validateVariantLinkage(gtinByProductId);

    // Process
    await processGtins(finalGtins);
  } catch (err) {
    logger.error('fetch-amazon-reviews failed', err as Error);
    process.exit(2);
  }
}

main();
