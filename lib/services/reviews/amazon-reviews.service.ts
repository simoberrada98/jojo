// Note: Do not import 'server-only' here to allow CLI usage via tsx.

import { serpApiService } from '@/lib/services/serpapi.service';
import { SupabaseAdminService } from '@/lib/services/supabase-admin.service';
import { logger } from '@/lib/utils/logger';
import type { Database } from '@/types/supabase.types';

type Supabase = Database['public'];

type ReviewInsert = Supabase['Tables']['product_reviews']['Insert'];
type SerpCacheRow = Supabase['Tables']['serpapi_amazon_data']['Row'];

const admin = new SupabaseAdminService();
const supabase = admin.getClient();

// Simple rate limiter: max N requests per interval
class RateLimiter {
  private queue: Promise<void> = Promise.resolve();
  private readonly intervalMs: number;

  constructor(intervalMs = 1000) {
    this.intervalMs = intervalMs;
  }

  async wait(): Promise<void> {
    const prev = this.queue;
    let resolveFn: () => void;
    this.queue = new Promise<void>((resolve) => (resolveFn = resolve));
    await prev;
    await new Promise((r) => setTimeout(r, this.intervalMs));
    // Rate limit debug logging (noise reduced by default)
    logger.debug('Rate limiter delay applied', {
      interval_ms: this.intervalMs,
    });
    resolveFn!();
  }
}

const limiter = new RateLimiter(1000); // ~1 req/sec

export async function backoff<T>(
  fn: () => Promise<T>,
  tries = 3,
  baseMs = 500
): Promise<T> {
  let attempt = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      return await fn();
    } catch (err) {
      attempt += 1;
      if (attempt >= tries) throw err;
      const delay = baseMs * Math.pow(2, attempt - 1);
      logger.debug('Transient error, backing off before retry', {
        attempt,
        delay_ms: delay,
      });
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

function normalizeRating(value: number): number {
  if (!Number.isFinite(value)) return 0;
  // Clamp then round to nearest tenth
  const clamped = Math.max(0, Math.min(5, value));
  return Number(clamped.toFixed(1));
}

function extractExternalId(link?: string): string | null {
  if (!link) return null;
  try {
    const url = new URL(link);
    // Use pathname+query as a stable external reference
    return `${url.hostname}${url.pathname}${url.search}`.slice(0, 256);
  } catch {
    return link.slice(0, 256);
  }
}

export async function getOrFetchSerpApiRaw(
  gtin: string
): Promise<SerpCacheRow | null> {
  const { data: cached, error: cacheError } = await supabase
    .from('serpapi_amazon_data')
    .select('*')
    .eq('gtin', gtin)
    .maybeSingle();

  if (cacheError) {
    logger.warn('SerpAPI cache lookup failed', cacheError, { gtin });
  }

  const TTL_MS = 1000 * 60 * 60 * 24; // 24h
  const isFresh = cached?.last_fetched_at
    ? Date.now() - new Date(cached.last_fetched_at).getTime() < TTL_MS
    : false;

  if (cached && isFresh) {
    logger.info('SerpAPI cache hit (fresh)', {
      gtin,
      last_fetched_at: cached.last_fetched_at,
    });
    return cached as SerpCacheRow;
  }

  await limiter.wait();

  const fetchFn = async () => {
    // Trigger fetch and storage via SerpApiService. It will upsert the cache table.
    logger.groupStart('SerpAPI Fetch (cache miss or stale)', {
      gtin,
      cached_at: cached?.last_fetched_at ?? null,
    });
    await serpApiService.getGoogleProductReviews(gtin);
    const { data, error } = await supabase
      .from('serpapi_amazon_data')
      .select('*')
      .eq('gtin', gtin)
      .maybeSingle();
    if (error) throw error;
    logger.groupEnd();
    return data as SerpCacheRow;
  };

  try {
    const row = await backoff(fetchFn, 3, 500);
    return row;
  } catch (error) {
    logger.error('SerpAPI fetch failed', error as Error, { gtin });
    return cached ?? null; // Fall back to stale cache if present
  }
}

export async function mapSerpApiToReviews(
  gtin: string,
  productId: string
): Promise<ReviewInsert[]> {
  const raw = await getOrFetchSerpApiRaw(gtin);
  if (!raw) return [];

  try {
    const source = (raw.raw_response as any) ?? {};
    const reviews =
      source.reviews_results ||
      source.product_results?.reviews ||
      source.reviews ||
      [];
    const mapped: ReviewInsert[] = reviews.map((r: any) => ({
      product_id: productId,
      user_id: null,
      rating: normalizeRating(Number(r.rating ?? 0)),
      title: (r.title ?? '').slice(0, 120) || null,
      comment: (r.snippet ?? r.body ?? '').slice(0, 2000) || null,
      is_verified_purchase: Boolean(
        typeof r.source === 'string' && /verified/i.test(r.source)
      ),
      helpful_count: Number(r.helpful_count ?? 0) || null,
      source: 'amazon-serpapi',
      external_id: extractExternalId(r.link ?? undefined),
      is_approved: true,
      created_at: r.date
        ? new Date(r.date).toISOString()
        : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    logger.info('SerpAPI reviews mapped', {
      gtin,
      productId,
      count: mapped.length,
    });
    return mapped;
  } catch (error) {
    // Data parsing failure logging
    logger.error('SerpAPI data parsing failed', error as Error, {
      gtin,
      productId,
    });
    return [];
  }
}

export async function publishReviewsForGtin(
  gtin: string
): Promise<{ inserted: number; updated: number }> {
  // Lookup product by GTIN
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('id')
    .eq('gtin', gtin)
    .maybeSingle();

  if (productError || !product) {
    logger.warn('Product not found for GTIN', productError, { gtin });
    return { inserted: 0, updated: 0 };
  }

  const productId = (product as { id: string }).id;
  const mapped = await mapSerpApiToReviews(gtin, productId);
  if (mapped.length === 0) return { inserted: 0, updated: 0 };

  // Upsert by (product_id, external_id)
  const { data, error } = await supabase
    .from('product_reviews')
    .upsert(mapped, { onConflict: 'product_id,external_id' })
    .select('id');

  if (error) {
    logger.error('Failed to upsert product reviews', error, {
      gtin,
      productId,
    });
    return { inserted: 0, updated: 0 };
  }

  // Supabase returns all affected rows; we cannot easily split inserted vs updated without additional steps
  return { inserted: data?.length ?? 0, updated: 0 };
}
