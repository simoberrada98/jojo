import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/utils/logger';

config({ path: '.env.local' });

type CsvRow = Record<string, string>;

function parseCsv(content: string): CsvRow[] {
  // Simple but robust CSV parser with quoted-field support
  const out: CsvRow[] = [];
  const records: string[][] = [];
  let row: string[] = [];
  let field = '';
  let i = 0;
  let inQ = false;
  let wasQ = false;
  const pushField = () => {
    const v = wasQ ? field.replace(/""/g, '"') : field;
    row.push(v);
    field = '';
    wasQ = false;
  };
  while (i < content.length) {
    const ch = content[i];
    if (inQ) {
      if (ch === '"') {
        if (content[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        } else {
          inQ = false;
          wasQ = true;
          i++;
          continue;
        }
      }
      field += ch;
      i++;
      continue;
    } else {
      if (ch === '"') {
        inQ = true;
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
        records.push(row);
        row = [];
        i++;
        continue;
      }
      field += ch;
      i++;
    }
  }
  pushField();
  if (row.length) records.push(row);
  if (records.length === 0) return [];
  const header = records[0]
    .map((h) => h.trim())
    .map((h) => h.replace(/^"|"$/g, ''));
  for (let r = 1; r < records.length; r++) {
    const obj: CsvRow = {};
    header.forEach((h, idx) => {
      obj[h] = records[r][idx] ?? '';
    });
    out.push(obj);
  }
  return out;
}

async function main() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseKey) {
    logger.error('❌ SUPABASE_SERVICE_ROLE_KEY missing. Add to .env.local');
    process.exit(1);
  }
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const csvPath = path.resolve('data', 'products.csv');
  const raw = fs.readFileSync(csvPath, 'utf8');
  const sanitized = raw
    .split('\n')
    .filter((l) => !l.trim().startsWith('#'))
    .join('\n');
  const csvRows = parseCsv(sanitized);
  if (!csvRows.length) {
    logger.error('❌ CSV parse produced 0 rows');
    process.exit(1);
  }

  // Counts
  const { count: altCount, error: altCountErr } = await supabase
    .from('alt')
    .select('*', { count: 'exact', head: true });
  if (altCountErr) {
    logger.error('❌ Counting alt failed', altCountErr);
    process.exit(1);
  }
  const { count: productsCount, error: productsCountErr } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });
  if (productsCountErr) {
    logger.error('❌ Counting products failed', productsCountErr);
    process.exit(1);
  }

  // Build products slug set
  const productsSlugs = new Set<string>();
  let from = 0;
  const page = 1000;
  while (true) {
    const { data, error } = await supabase
      .from('products')
      .select('slug')
      .range(from, from + page - 1);
    if (error) {
      logger.error('❌ Fetching products slugs failed', error);
      process.exit(1);
    }
    if (!data?.length) break;
    for (const r of data) if (r.slug) productsSlugs.add(r.slug);
    if (data.length < page) break;
    from += page;
  }

  const missingFromProducts = csvRows.filter(
    (r) => r.slug && !productsSlugs.has(r.slug.trim())
  ).length;
  logger.audit(
    `📊 CSV rows: ${csvRows.length}, products: ${productsCount}, expected missing: ${missingFromProducts}, alt: ${altCount}`
  );

  if (altCount !== missingFromProducts) {
    logger.warn(
      '⚠️ Alt count does not equal expected missing rows. Investigate loader or existing alt content.'
    );
  } else {
    logger.audit('✅ Alt count matches expected missing rows from CSV');
  }

  // Integrity: check duplicates within alt
  const altSlugs = new Map<string, number>();
  const altSkus = new Map<string, number>();
  from = 0;
  while (true) {
    const { data, error } = await supabase
      .from('alt')
      .select('slug, sku, name')
      .range(from, from + page - 1);
    if (error) {
      logger.error('❌ Fetching alt rows failed', error);
      process.exit(1);
    }
    if (!data?.length) break;
    for (const r of data) {
      const slug = r.slug?.trim();
      const sku = r.sku?.trim();
      if (slug) altSlugs.set(slug, (altSlugs.get(slug) || 0) + 1);
      if (sku) altSkus.set(sku, (altSkus.get(sku) || 0) + 1);
      if (!slug || !sku || !r.name) {
        logger.warn('⚠️ Alt row missing required fields', r);
      }
    }
    if (data.length < page) break;
    from += page;
  }
  const dupAltSlugs = [...altSlugs.entries()].filter(([, c]) => c > 1).length;
  const dupAltSkus = [...altSkus.entries()].filter(([, c]) => c > 1).length;
  if (dupAltSlugs || dupAltSkus) {
    logger.error(
      `❌ Duplicates in alt — slugs: ${dupAltSlugs}, skus: ${dupAltSkus}`
    );
    process.exit(1);
  } else {
    logger.audit('✅ No duplicate slugs or skus in alt');
  }

  // CRUD tests: insert -> read -> update -> delete
  const testSlug = `verify-alt-${Date.now()}`;
  const testSku = `VERIFY-${Date.now()}`;
  const insertPayload = {
    slug: testSlug,
    sku: testSku,
    name: 'Verification Row',
    category: 'test',
    base_price: 0,
  };
  {
    const { error } = await supabase.from('alt').insert(insertPayload);
    if (error) {
      logger.error('❌ CRUD insert failed', error);
      process.exit(1);
    }
    logger.audit('✅ CRUD insert ok');
  }
  {
    const { data, error } = await supabase
      .from('alt')
      .select('*')
      .eq('slug', testSlug)
      .single();
    if (error || !data) {
      logger.error('❌ CRUD read failed', error);
      process.exit(1);
    }
    logger.audit('✅ CRUD read ok');
  }
  {
    const { error } = await supabase
      .from('alt')
      .update({ name: 'Verification Row Updated' })
      .eq('slug', testSlug);
    if (error) {
      logger.error('❌ CRUD update failed', error);
      process.exit(1);
    }
    logger.audit('✅ CRUD update ok');
  }
  {
    const { error } = await supabase.from('alt').delete().eq('slug', testSlug);
    if (error) {
      logger.error('❌ CRUD delete failed', error);
      process.exit(1);
    }
    logger.audit('✅ CRUD delete ok');
  }

  // Relationship validation (if applicable): ensure no alt slug overlaps with products
  const overlap = [...altSlugs.keys()].filter((s) => productsSlugs.has(s));
  if (overlap.length) {
    logger.error('❌ Alt contains slugs that already exist in products', {
      count: overlap.length,
    });
    process.exit(1);
  } else {
    logger.audit('✅ No slug overlaps between alt and products');
  }

  logger.audit('🎉 Verification complete');
}

main().catch((err) => {
  logger.error('verify-alt failed', err as Error);
  process.exit(1);
});
