import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';
import { transformToDisplayProduct, type Product } from '@/types/product';

const LIST_CACHE_MAX_AGE_SECONDS = 120;
const STALE_WHILE_REVALIDATE_SECONDS = 600;

function jsonWithCache<T>(payload: T, maxAgeSeconds: number) {
  const response = NextResponse.json(payload);
  response.headers.set(
    'Cache-Control',
    `public, s-maxage=${maxAgeSeconds}, stale-while-revalidate=${STALE_WHILE_REVALIDATE_SECONDS}`
  );
  return response;
}

function sanitizeSearchTerm(input: string | null): string {
  if (!input) return '';
  const cleaned = input
    .replace(/[,%()]/g, ' ')
    .replace(/[\%_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const params = url.searchParams;

  const category = params.get('category') ?? undefined;
  const rawQ = params.get('q') ?? params.get('search') ?? '';
  const q = sanitizeSearchTerm(rawQ);

  const inStockOnly = (params.get('inStockOnly') ?? 'false') === 'true';
  const minPrice = Number(params.get('minPrice'));
  const maxPrice = Number(params.get('maxPrice'));
  const sort = params.get('sort') ?? undefined; // price-asc | price-desc | newest | relevance

  const rawLimit = Number(params.get('limit'));
  const rawOffset = Number(params.get('offset'));
  const limit = Number.isFinite(rawLimit)
    ? Math.min(Math.max(rawLimit, 1), 100)
    : 24;
  const offset = Number.isFinite(rawOffset) ? Math.max(rawOffset, 0) : 0;

  try {
    logger?.api?.('GET', '/api/search', {
      category,
      q,
      inStockOnly,
      minPrice,
      maxPrice,
      sort,
      limit,
      offset,
    });

    const supabase = await createClient();

    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .eq('is_archived', false);

    if (category) {
      query = query.eq('category', category);
    }

    if (q && q.length > 0) {
      if (rawQ !== q) {
        logger?.debug?.('Search term sanitized', { raw: rawQ, sanitized: q });
      }
      query = query.or(
        `name.ilike.%${q}%,description.ilike.%${q}%,category.ilike.%${q}%`
      );
    }

    if (inStockOnly) {
      query = query.gt('stock_quantity', 0);
    }
    if (Number.isFinite(minPrice)) {
      query = query.gte('base_price', Number(minPrice));
    }
    if (Number.isFinite(maxPrice)) {
      query = query.lte('base_price', Number(maxPrice));
    }

    // Sorting
    if (sort === 'price-asc') {
      query = query.order('base_price', { ascending: true });
    } else if (sort === 'price-desc') {
      query = query.order('base_price', { ascending: false });
    } else {
      // newest or relevance fall back to created_at desc
      query = query.order('created_at', { ascending: false });
    }

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data: products, error, count } = await query;

    if (error) {
      throw error;
    }

    // Ratings aggregation for display
    async function getRatingsMap(ids: string[]) {
      if (ids.length === 0)
        return new Map<string, { avg: number; count: number }>();
      const { data, error } = await supabase
        .from('product_reviews')
        .select('product_id, rating')
        .in('product_id', ids)
        .eq('is_approved', true);
      const map = new Map<string, { sum: number; count: number }>();
      if (!error && data) {
        for (const row of data as Array<{ product_id: string; rating: number }>) {
          const pid = row.product_id;
          const entry = map.get(pid) || { sum: 0, count: 0 };
          entry.sum += Number(row.rating || 0);
          entry.count += 1;
          map.set(pid, entry);
        }
      }
      const out = new Map<string, { avg: number; count: number }>();
      for (const [pid, { sum, count }] of map.entries()) {
        out.set(pid, { avg: count > 0 ? sum / count : 0, count });
      }
      return out;
    }

    const ratings = await getRatingsMap(
      (products || []).map((p: Product) => p.id as string)
    );
    const results = (products || []).map((p) => {
      const meta = ratings.get((p as Product).id as string) || {
        avg: 0,
        count: 0,
      };
      return transformToDisplayProduct(p as Product, meta.avg, meta.count);
    });

    const total = count || 0;
    const payload = {
      total,
      offset,
      limit,
      results,
      hasMore: offset + limit < total,
    };

    return jsonWithCache(payload, LIST_CACHE_MAX_AGE_SECONDS);
  } catch (error) {
    const isTimeout = error instanceof Error && /timed out/i.test(error.message);
    const status = isTimeout ? 504 : 500;
    logger?.error?.('/api/search failure', error, {
      category,
      q,
      inStockOnly,
      minPrice,
      maxPrice,
      sort,
      limit,
      offset,
    });
    return NextResponse.json(
      {
        error: isTimeout ? 'Request timed out' : 'Internal Server Error',
        total: 0,
        offset: 0,
        limit: 0,
        results: [],
        hasMore: false,
      },
      { status }
    );
  }
}

