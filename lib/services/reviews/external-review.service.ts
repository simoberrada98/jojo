import 'server-only';

import type { ExternalReviewSummary } from '@/types/review';

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
  const products = await loadProducts();
  const normalizedGtin = normalizeGtin(gtin);

  let product: DummyProduct | null = null;
  if (normalizedGtin) {
    product =
      products.find(
        (candidate) => normalizeGtin(candidate.meta?.barcode) === normalizedGtin
      ) || null;
  }

  if (!product && fallback?.name) {
    product = matchByFallback(products, fallback.name);
  }

  if (!product && fallback?.brand) {
    product = matchByFallback(products, fallback.brand);
  }

  if (!product) {
    return null;
  }

  return toSummary(product, normalizedGtin || fallback?.name || undefined);
}
