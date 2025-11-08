import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from '@/lib/supabase/config';
import { logger } from '@/lib/utils/logger';
import { getExternalReviewSummary } from '@/lib/services/reviews/external-review.service';
import type { ExternalReviewEntry, ExternalReviewSummary, ReviewRecord, ReviewRecordInsert } from '@/types/review';

export const revalidate = 600;
export const runtime = 'nodejs';

type ReviewRow = {
  rating: number;
  title: string | null;
  comment: string | null;
  is_verified_purchase: boolean | null;
  helpful_count: number | null;
  created_at: string;
};

function normalizeNumber(value: unknown): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ gtin: string }> }
) {
  const { gtin } = await context.params;
  if (!gtin) {
    return NextResponse.json(
      {
        gtin: '',
        averageRating: 0,
        reviewCount: 0,
        reviews: [],
        source: 'Supabase Reviews',
      },
      { status: 200 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const fallbackName = searchParams.get('q') ?? undefined;
  const brand = searchParams.get('brand') ?? undefined;

  const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey, {
    auth: { persistSession: false },
  });

  let productId: string | null = null;
  let productTitle: string | undefined;
  let productDescription: string | undefined;

  try {
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name, description, short_description')
      .eq('gtin', gtin)
      .maybeSingle();

    if (productError) {
      logger.error('Reviews: failed to resolve product', productError, {
        gtin,
      });
    }

    if (product) {
      productId = product.id as string;
      productTitle = (product.name as string) ?? fallbackName;
      productDescription =
        (product.short_description as string) ??
        (product.description as string) ??
        undefined;
    }
  } catch (error) {
    logger.error('Reviews: product lookup exception', error as Error, { gtin });
  }

  let reviews: ReviewRow[] = [];
  if (productId) {
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select(
          'rating, title, comment, is_verified_purchase, helpful_count, created_at, source, external_id'
        )
        .eq('product_id', productId)
        .eq('is_approved', true)
        .order('helpful_count', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        logger.error('Reviews: query failure', error, { productId, gtin });
      } else if (Array.isArray(data)) {
        reviews = data as ReviewRow[];
      }
    } catch (error) {
      logger.error('Reviews: query exception', error as Error, {
        productId,
        gtin,
      });
    }
  }

  let externalReviewSummary: ExternalReviewSummary | null = null;
  if (reviews.length === 0) {
    try {
      externalReviewSummary = await getExternalReviewSummary(gtin, {
        name: fallbackName,
        brand,
      });

      if (externalReviewSummary && productId) {
        const reviewsToUpsert: ReviewRecordInsert[] = externalReviewSummary.reviews.map(extReview => ({
          product_id: productId!,
          user_id: null, // External reviews don't have a user_id
          rating: extReview.rating,
          title: extReview.comment ? extReview.comment.substring(0, 50) : null, // Use comment as title, truncated
          comment: extReview.comment,
          is_verified_purchase: false, // External reviews are not verified purchases from our system
          helpful_count: 0,
          is_approved: true, // Assume external reviews are approved
          source: extReview.source || externalReviewSummary!.source,
          external_id: extReview.link ? btoa(extReview.link) : null, // Use base64 encoded link as external_id for uniqueness
          created_at: extReview.date || new Date().toISOString(),
        }));

        if (reviewsToUpsert.length > 0) {
          const { error: upsertError } = await supabase
            .from('product_reviews')
            .upsert(reviewsToUpsert, { onConflict: 'product_id, external_id' });

          if (upsertError) {
            logger.error('Reviews: failed to upsert external reviews', upsertError, { gtin, productId });
          } else {
            // Re-fetch reviews from Supabase to include newly upserted ones
            const { data, error } = await supabase
              .from('product_reviews')
              .select(
                'rating, title, comment, is_verified_purchase, helpful_count, created_at, source, external_id'
              )
              .eq('product_id', productId)
              .eq('is_approved', true)
              .order('helpful_count', { ascending: false })
              .order('created_at', { ascending: false })
              .limit(50);

            if (error) {
              logger.error('Reviews: re-fetch after upsert failed', error, { productId, gtin });
            } else if (Array.isArray(data)) {
              reviews = data as ReviewRow[];
            }
          }
        }
      }
    } catch (error) {
      logger.error('Reviews: external fallback failed', error as Error, {
        gtin,
      });
    }
  }

  const reviewCount = reviews.length;
  const averageRating =
    reviewCount > 0
      ? reviews.reduce((sum, row) => sum + normalizeNumber(row.rating), 0) /
        reviewCount
      : 0;

  const payload = {
    gtin,
    productTitle: productTitle ?? fallbackName,
    productDescription,
    averageRating: Number(averageRating.toFixed(2)),
    reviewCount,
    source: externalReviewSummary?.source || 'Supabase Reviews',
    sourceUrl: externalReviewSummary?.sourceUrl || undefined,
    reviews: reviews.map((row) => ({
      rating: normalizeNumber(row.rating),
      comment: row.comment ?? row.title ?? 'Verified review',
      reviewerName: row.is_verified_purchase ? 'Verified purchaser' : undefined,
      date: row.created_at,
    })),
  };

  const response = NextResponse.json(payload, { status: 200 });
  response.headers.set(
    'Cache-Control',
    'public, s-maxage=600, stale-while-revalidate=3600'
  );
  return response;
}
