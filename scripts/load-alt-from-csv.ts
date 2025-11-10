import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/utils/logger';
import type { Database } from '@/types/supabase.types';

config({ path: '.env.local' });

type CsvRow = Record<string, string>;

function stripNonPrintable(s: string) {
  return s.replace(/[\u0000-\u001F\u007F]/g, '');
}

function parseCsv(content: string): CsvRow[] {
  // Robust CSV parser that handles quoted fields, embedded commas, and newlines
  const rows: CsvRow[] = [];
  const lines: string[] = [];

  let i = 0;
  let field = '';
  let row: string[] = [];
  let inQuotes = false;
  let wasInQuotes = false;

  const pushField = () => {
    // Unescape quotes if quoted
    const v = wasInQuotes ? field.replace(/""/g, '"') : field;
    row.push(v);
    field = '';
    wasInQuotes = false;
  };

  while (i < content.length) {
    const ch = content[i];
    if (inQuotes) {
      if (ch === '"') {
        if (content[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        } else {
          inQuotes = false;
          wasInQuotes = true;
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
        pushField();
        i++;
        continue;
      }
      if (ch === '\n') {
        pushField();
        lines.push(row.join(','));
        row = [];
        i++;
        continue;
      }
      field += ch;
      i++;
    }
  }
  // Flush last field/row
  pushField();
  if (row.length) lines.push(row.join(','));

  if (lines.length === 0) return [];
  const header = lines[0]
    .split(',')
    .map((h) => h.trim())
    .map((h) => h.replace(/^"|"$/g, ''));
  for (let li = 1; li < lines.length; li++) {
    const cols = [] as string[];
    // Re-split line into fields respecting quotes (second pass to preserve structure)
    let j = 0;
    let buf = '';
    let q = false;
    while (j < lines[li].length) {
      const c = lines[li][j];
      if (q) {
        if (c === '"') {
          if (lines[li][j + 1] === '"') {
            buf += '"';
            j += 2;
            continue;
          } else {
            q = false;
            j++;
            continue;
          }
        } else {
          buf += c;
          j++;
          continue;
        }
      } else {
        if (c === '"') {
          q = true;
          j++;
          continue;
        }
        if (c === ',') {
          cols.push(buf);
          buf = '';
          j++;
          continue;
        }
        buf += c;
        j++;
      }
    }
    cols.push(buf);
    const rowObj: CsvRow = {};
    header.forEach((h, idx) => {
      rowObj[h] = cols[idx] ?? '';
    });
    rows.push(rowObj);
  }
  return rows;
}

function parseArray(value: string): string[] | null {
  const v = value?.trim();
  if (!v) return null;
  // JSON array like ["a","b"]
  if (v.startsWith('[')) {
    try {
      const arr = JSON.parse(v);
      if (Array.isArray(arr)) return arr.map((x) => String(x));
    } catch {}
    return null;
  }
  // Postgres array like {"a","b"}
  if (v.startsWith('{') && v.endsWith('}')) {
    const inner = v.substring(1, v.length - 1);
    if (!inner) return [];
    // Split by commas not inside quotes
    const out: string[] = [];
    let k = 0;
    let acc = '';
    let inQ = false;
    while (k < inner.length) {
      const ch = inner[k];
      if (inQ) {
        if (ch === '"') {
          if (inner[k + 1] === '"') {
            acc += '"';
            k += 2;
            continue;
          } else {
            inQ = false;
            k++;
            continue;
          }
        }
        acc += ch;
        k++;
        continue;
      } else {
        if (ch === '"') {
          inQ = true;
          k++;
          continue;
        }
        if (ch === ',') {
          out.push(acc);
          acc = '';
          k++;
          continue;
        }
        acc += ch;
        k++;
      }
    }
    out.push(acc);
    return out.map((s) => s.replace(/^"|"$/g, ''));
  }
  // Single value
  return [v];
}

function toDecimal(value: string): number | null {
  const v = value?.trim();
  if (!v) return null;
  const n = Number(v.replace(/[^0-9.\-]/g, ''));
  return Number.isFinite(n) ? n : null;
}

function toBoolean(value: string): boolean | null {
  const v = value?.trim().toLowerCase();
  if (v === 'true') return true;
  if (v === 'false') return false;
  return null;
}

function normalizeGtin(value: string): string | null {
  const digits = (value || '').replace(/[^0-9]/g, '');
  if (!digits) return null;
  // Accept common GTIN lengths: 8, 12, 13, 14
  if ([8, 12, 13, 14].includes(digits.length)) return digits;
  return digits; // keep best-effort normalization
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseKey) {
    logger.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in .env.local');
    process.exit(1);
  }
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const csvPath = path.resolve('data', 'products.csv');
  logger.audit(`📄 Loading CSV: ${csvPath}`);
  const raw = fs.readFileSync(csvPath, 'utf8');

  // Strip any leading comment lines starting with '#'
  const sanitized = raw
    .split('\n')
    .filter((line) => !line.trim().startsWith('#'))
    .join('\n');
  const rows = parseCsv(sanitized);
  if (rows.length === 0) {
    logger.error('❌ No rows parsed from CSV');
    process.exit(1);
  }

  // Build sets of existing identifiers from products and alt
  const existingSlugs = new Set<string>();
  const existingSkus = new Set<string>();
  const existingAltSlugs = new Set<string>();

  // Page through products to gather slugs/skus
  let from = 0;
  const page = 1000;
  while (true) {
    const { data, error } = await supabase
      .from('products')
      .select('slug, sku')
      .range(from, from + page - 1);
    if (error) {
      logger.error('❌ Failed to fetch products slugs/skus', error);
      process.exit(1);
    }
    if (!data || data.length === 0) break;
    for (const p of data) {
      if (p.slug) existingSlugs.add(p.slug);
      if (p.sku) existingSkus.add(p.sku);
    }
    if (data.length < page) break;
    from += page;
  }

  // Fetch existing alt slugs to prevent duplicate insert into alt
  from = 0;
  while (true) {
    const { data, error } = await supabase
      .from('alt')
      .select('slug')
      .range(from, from + page - 1);
    if (error) {
      logger.error('❌ Failed to fetch alt slugs', error);
      process.exit(1);
    }
    if (!data || data.length === 0) break;
    for (const r of data) existingAltSlugs.add(r.slug);
    if (data.length < page) break;
    from += page;
  }

  // Detect duplicates within CSV by slug/sku
  const seenCsvSlugs = new Set<string>();
  const seenCsvSkus = new Set<string>();
  let dupSlugCount = 0;
  let dupSkuCount = 0;

  const toInsert: Database['public']['Tables']['products']['Insert'][] = [];

  for (const r of rows) {
    const slug = r.slug?.trim();
    const sku = r.sku?.trim();
    if (!slug || !sku) continue; // must have identifiers

    if (seenCsvSlugs.has(slug)) dupSlugCount++;
    else seenCsvSlugs.add(slug);
    if (seenCsvSkus.has(sku)) dupSkuCount++;
    else seenCsvSkus.add(sku);

    // Only insert if missing from products AND not already in alt
    if (existingSlugs.has(slug) || existingAltSlugs.has(slug)) continue;

    const tags = parseArray(r.tags || '') || null;
    const images = parseArray(r.images || '') || null;
    const metaKeywords = parseArray(r.meta_keywords || '') || null;
    const categoryTags = parseArray(r.category_tags || '') || null;

    toInsert.push({
      id: r.id?.trim() || undefined, // allow DB default if missing
      sku,
      name: stripNonPrintable((r.name || '').trim()),
      slug,
      description: (r.description || '').trim(),
      short_description: (r.short_description || '').trim(),
      category: (r.category || '').trim(),
      brand: (r.brand || '').trim() || null,
      tags,
      base_price: toDecimal(r.base_price) ?? 0,
      compare_at_price: toDecimal(r.compare_at_price),
      cost_price: toDecimal(r.cost_price),
      hash_rate: (r.hash_rate || '').trim() || null,
      power_consumption: (r.power_consumption || '').trim() || null,
      algorithm: (r.algorithm || '').trim() || null,
      efficiency: (r.efficiency || '').trim() || null,
      weight: toDecimal(r.weight),
      dimensions_length: toDecimal(r.dimensions_length),
      dimensions_width: toDecimal(r.dimensions_width),
      dimensions_height: toDecimal(r.dimensions_height),
      featured_image_url: (r.featured_image_url || '').trim() || null,
      images,
      video_url: (r.video_url || '').trim() || null,
      model_3d_url: (r.model_3d_url || '').trim() || null,
      track_inventory: toBoolean(r.track_inventory) ?? true,
      stock_quantity: Number((r.stock_quantity || '0').replace(/[^0-9\-]/g, '')) || 0,
      low_stock_threshold: Number((r.low_stock_threshold || '5').replace(/[^0-9\-]/g, '')) || 5,
      allow_backorder: toBoolean(r.allow_backorder) ?? false,
      meta_title: (r.meta_title || '').trim() || null,
      meta_description: (r.meta_description || '').trim() || null,
      meta_keywords: metaKeywords,
      is_featured: toBoolean(r.is_featured) ?? false,
      is_active: toBoolean(r.is_active) ?? true,
      is_archived: toBoolean(r.is_archived) ?? false,
      published_at: (r.published_at || '').trim() || null,
      created_at: (r.created_at || '').trim() || null,
      updated_at: (r.updated_at || '').trim() || null,
      gtin: normalizeGtin(r.gtin || ''),
      category_tags: categoryTags,
    });
  }

  logger.audit(`🧹 CSV duplicates — slug: ${dupSlugCount}, sku: ${dupSkuCount}`);
  logger.audit(`🧮 New missing records to insert into alt: ${toInsert.length}`);

  // Batch insert to avoid payload limits
  const chunk = 200;
  for (let idx = 0; idx < toInsert.length; idx += chunk) {
    const batch = toInsert.slice(idx, idx + chunk);
    const { error } = await supabase.from('alt').insert(batch, {
      defaultToNull: true,
    });
    if (error) {
      logger.error('❌ Insert batch failed', error, { offset: idx, size: batch.length });
      process.exit(1);
    }
    logger.audit(`✅ Inserted ${batch.length} records into alt`);
  }

  // Final counts
  const { count: altCount, error: countErr } = await supabase
    .from('alt')
    .select('*', { count: 'exact', head: true });
  if (countErr) {
    logger.error('❌ Failed to count alt rows', countErr);
    process.exit(1);
  }
  logger.audit(`📊 Alt row count: ${altCount}`);
}

main().catch((err) => {
  logger.error('load-alt-from-csv failed', err as Error);
  process.exit(1);
});

