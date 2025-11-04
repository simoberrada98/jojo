import 'server-only';

import type { ExternalReviewSummary } from '@/types/review';
import { env } from '@/lib/config/env';

const REVIEW_DATASET_URL =
  'https://dummyjson.com/products?limit=200&select=id,title,description,rating,reviews,meta';
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour

type DummyReview = {
  rating: number;
  comment: string;
  date?: string;
  reviewerName?: string;
};

type DummyProduct = {
  id: number;
  title: string;
  description?: string;
  rating?: number;
  reviews?: DummyReview[];
  meta?: {
    barcode?: string;
  };
};

let cachedProducts: DummyProduct[] | null = null;
let cacheExpiresAt = 0;
const serpCache = new Map<
  string,
  { summary: ExternalReviewSummary; expiresAt: number }
>();

function normalizeGtin(value?: string | null): string {
  return value?.replace(/\D+/g, '').trim() ?? '';
}

async function loadProducts(): Promise<DummyProduct[]> {
  const now = Date.now();
  if (cachedProducts && now < cacheExpiresAt) {
    return cachedProducts;
  }

  const response = await fetch(REVIEW_DATASET_URL, {
    headers: {
      Accept: 'application/json',
    },
    next: {
      revalidate: 60 * 60, // 1 hour
    },
  });

  if (!response.ok) {
    throw new Error('Failed to download review dataset');
  }

  const payload = (await response.json()) as { products?: DummyProduct[] };
  cachedProducts = payload.products ?? [];
  cacheExpiresAt = now + CACHE_TTL_MS;
  return cachedProducts;
}

async function fetchSerpApiSummary(
  query: string,
  requestedGtin?: string
): Promise<ExternalReviewSummary | null> {
  const cacheKey = `serp:${query}`;
  const now = Date.now();
  const cached = serpCache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    return cached.summary;
  }

  const apiKey = env.SERPAPI_API_KEY;
  if (!apiKey) return null;

  const url = new URL('https://serpapi.com/search.json');
  url.searchParams.set('engine', 'google_shopping');
  url.searchParams.set('q', query);
  url.searchParams.set('gl', 'us');
  url.searchParams.set('hl', 'en');
  url.searchParams.set('api_key', apiKey);

  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
  if (!res.ok) return null;

  type SerpShoppingResult = {
    title?: string;
    rating?: number;
    reviews?: string | number;
    product_id?: string;
    link?: string;
  };
  type SerpResponse = {
    shopping_results?: SerpShoppingResult[];
    search_metadata?: { serpapi_search_url?: string };
  };

  const data = (await res.json()) as SerpResponse;
  const results = data.shopping_results || [];
  const rated = results.filter((r) => typeof r.rating === 'number');
  if (rated.length === 0) return null;

  let totalWeight = 0;
  let weighted = 0;
  let simpleSum = 0;
  for (const r of rated) {
    const rating = r.rating as number;
    const reviewStr =
      typeof r.reviews === 'string' ? r.reviews : String(r.reviews ?? '0');
    const count = Number((reviewStr.match(/\d+/g) || []).join('')) || 0;
    if (count > 0) {
      weighted += rating * count;
      totalWeight += count;
    }
    simpleSum += rating;
  }
  const average =
    totalWeight > 0 ? weighted / totalWeight : simpleSum / rated.length;
  const reviewCount = rated.reduce((acc, r) => {
    const s =
      typeof r.reviews === 'string' ? r.reviews : String(r.reviews ?? '0');
    return acc + (Number((s.match(/\d+/g) || []).join('')) || 0);
  }, 0);

  const summary: ExternalReviewSummary = {
    gtin: normalizeGtin(requestedGtin) || '',
    productTitle: rated[0]?.title,
    averageRating: Number(average.toFixed(2)),
    reviewCount,
    source: 'SerpAPI Google Shopping',
    sourceUrl: data.search_metadata?.serpapi_search_url,
    productDescription: undefined,
    reviews: [],
  };

  serpCache.set(cacheKey, { summary, expiresAt: now + CACHE_TTL_MS });
  return summary;
}

function toSummary(
  product: DummyProduct,
  requestedGtin?: string
): ExternalReviewSummary {
  const reviews = product.reviews ?? [];
  const reviewCount = reviews.length || (product.rating ? 1 : 0);
  const averageRating = reviewCount
    ? reviews.reduce((sum, item) => sum + item.rating, 0) / reviewCount
    : (product.rating ?? 0);

  return {
    gtin: normalizeGtin(requestedGtin) || normalizeGtin(product.meta?.barcode),
    productTitle: product.title,
    productDescription: product.description,
    averageRating: Number(averageRating.toFixed(2)),
    reviewCount,
    source: 'DummyJSON',
    sourceUrl: `https://dummyjson.com/products/${product.id}`,
    reviews: reviews.slice(0, 5).map((entry) => ({
      rating: entry.rating,
      comment: entry.comment,
      reviewerName: entry.reviewerName,
      date: entry.date,
    })),
  };
}

function matchByFallback(
  products: DummyProduct[],
  query?: string | null
): DummyProduct | null {
  if (!query) return null;
  const normalized = query.toLowerCase();
  return (
    products.find((product) =>
      product.title.toLowerCase().includes(normalized)
    ) || null
  );
}

export async function getExternalReviewSummary(
  gtin?: string | null,
  fallback?: { name?: string | null; brand?: string | null }
): Promise<ExternalReviewSummary | null> {
  const normalizedGtin = normalizeGtin(gtin);
  const fallbackQuery = [fallback?.brand, fallback?.name]
    .filter(Boolean)
    .join(' ')
    .trim();

  // Use SerpAPI exclusively when configured; otherwise return null to avoid mock data
  const serpQuery = normalizedGtin || fallbackQuery;
  if (!env.SERPAPI_API_KEY || !serpQuery) return null;
  try {
    const serp = await fetchSerpApiSummary(serpQuery, normalizedGtin);
    return serp;
  } catch {
    return null;
  }
}
