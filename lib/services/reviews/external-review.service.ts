import 'server-only';

import type { ExternalReviewSummary } from '@/types/review';
import { env } from '@/lib/config/env';
import { serpApiService } from '@/lib/services/serpapi.service';
import { logger } from '@/lib/utils/logger';

const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour

const serpCache = new Map<
  string,
  { summary: ExternalReviewSummary; expiresAt: number }
>();

function normalizeGtin(value?: string | null): string {
  return value?.replace(/\D+/g, '').trim() ?? '';
}

async function fetchAndCacheSerpApiReviews(
  productQuery: string,
  requestedGtin?: string
): Promise<ExternalReviewSummary | null> {
  const cacheKey = `serp:${productQuery}`;
  const now = Date.now();
  const cached = serpCache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    return cached.summary;
  }

  const serpReviews = await serpApiService.getGoogleProductReviews(productQuery);

  if (serpReviews.length === 0) {
    return null;
  }

  const totalRating = serpReviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / serpReviews.length;

  const summary: ExternalReviewSummary = {
    gtin: normalizeGtin(requestedGtin) || '',
    productTitle: productQuery,
    productDescription: undefined,
    averageRating: Number(averageRating.toFixed(2)),
    reviewCount: serpReviews.length,
    source: 'SerpApi Google Product Reviews',
    sourceUrl: serpReviews[0]?.link, // Use the link from the first review as a general source URL
    reviews: serpReviews.map((review) => ({
      rating: review.rating,
      comment: review.snippet,
      reviewerName: review.source, // Using source as reviewer name for now
      date: review.date,
    })),
  };

  serpCache.set(cacheKey, { summary, expiresAt: now + CACHE_TTL_MS });
  return summary;
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

  const productQuery = normalizedGtin || fallbackQuery;

  if (!env.SERPAPI_API_KEY || !productQuery) {
    logger.info('SerpApi not enabled or product query missing.', { normalizedGtin, fallbackQuery });
    return null;
  }

  try {
    const serpSummary = await fetchAndCacheSerpApiReviews(productQuery, normalizedGtin);
    if (serpSummary) {
      return serpSummary;
    }
  } catch (error) {
    logger.error('Error fetching external reviews from SerpApi', error, { gtin, fallbackQuery });
  }

  return null;
}
