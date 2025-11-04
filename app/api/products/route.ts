import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';
import { transformToDisplayProduct, type Product } from '@/types/product';

const DETAIL_CACHE_MAX_AGE_SECONDS = 300;
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

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const params = url.searchParams;

  const id = params.get('id') ?? undefined;
  const handle = params.get('handle') ?? undefined;
  const idsParam = params.get('ids') ?? undefined;
  const category = params.get('category') ?? undefined;
  const q = params.get('q') ?? params.get('search') ?? '';

  const rawLimit = Number(params.get('limit'));
  const rawOffset = Number(params.get('offset'));
  const limit = Number.isFinite(rawLimit)
    ? Math.min(Math.max(rawLimit, 1), 100)
    : 20;
  const offset = Number.isFinite(rawOffset) ? Math.max(rawOffset, 0) : 0;

  try {
    logger?.api?.('GET', '/api/products', {
      id,
      handle,
      ids: idsParam,
      q,
      limit,
      offset,
    });

    const supabase = await createClient();

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
        for (const row of data as Array<{
          product_id: string;
          rating: number;
        }>) {
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

    // Handle single product by handle/slug
    if (handle) {
      const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', handle)
        .eq('is_active', true)
        .eq('is_archived', false)
        .single();

      if (error || !product) {
        return NextResponse.json({ error: 'Not Found' }, { status: 404 });
      }
      const ratings = await getRatingsMap([(product as Product).id as string]);
      const pid = (product as Product).id as string;
      const meta = ratings.get(pid) || { avg: 0, count: 0 };
      return jsonWithCache(
        transformToDisplayProduct(product as Product, meta.avg, meta.count),
        DETAIL_CACHE_MAX_AGE_SECONDS
      );
    }

    // Handle single product by ID
    if (id) {
      const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .eq('is_archived', false)
        .single();

      if (error || !product) {
        return NextResponse.json({ error: 'Not Found' }, { status: 404 });
      }
      const ratings = await getRatingsMap([(product as Product).id as string]);
      const pid = (product as Product).id as string;
      const meta = ratings.get(pid) || { avg: 0, count: 0 };
      return jsonWithCache(
        transformToDisplayProduct(product as Product, meta.avg, meta.count),
        DETAIL_CACHE_MAX_AGE_SECONDS
      );
    }

    // Handle multiple products by IDs
    if (idsParam) {
      const ids = idsParam
        .split(',')
        .map((candidate) => candidate.trim())
        .filter(Boolean);

      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .in('id', ids)
        .eq('is_active', true)
        .eq('is_archived', false);

      if (error) {
        throw error;
      }

      const ratings = await getRatingsMap(
        (products || []).map((p: Product) => p.id as string)
      );
      const transformed = (products || []).map((p) => {
        const meta = ratings.get((p as Product).id as string) || {
          avg: 0,
          count: 0,
        };
        return transformToDisplayProduct(p as Product, meta.avg, meta.count);
      });
      return jsonWithCache(transformed, DETAIL_CACHE_MAX_AGE_SECONDS);
    }

    // Handle search/list query
    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .eq('is_archived', false);

    if (category) {
      query = query.eq('category', category);
    }

    // Add search filter if provided
    if (q) {
      query = query.or(
        `name.ilike.%${q}%,description.ilike.%${q}%,category.ilike.%${q}%`
      );
    }

    // Add pagination
    query = query.range(offset, offset + limit - 1);
    query = query.order('created_at', { ascending: false });

    const { data: products, error, count } = await query;

    if (error) {
      throw error;
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
    const isTimeout =
      error instanceof Error && /timed out/i.test(error.message);
    const status = isTimeout ? 504 : 500;
    logger?.error?.('/api/products failure', error, {
      id,
      handle,
      ids: idsParam,
      q,
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
