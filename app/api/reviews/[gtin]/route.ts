import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from '@/lib/supabase/config';
import { logger } from '@/lib/utils/logger';
import { getExternalReviewSummary } from '@/lib/services/reviews/external-review.service';

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
      { gtin: '', averageRating: 0, reviewCount: 0, reviews: [], source: 'Supabase Reviews' },
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
          'rating, title, comment, is_verified_purchase, helpful_count, created_at'
        )
        .eq('product_id', productId)
        .eq('is_approved', true)
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

  const reviewCount = reviews.length;
  const averageRating =
    reviewCount > 0
      ? reviews.reduce((sum, row) => sum + normalizeNumber(row.rating), 0) /
        reviewCount
      : 0;

  if (reviewCount === 0) {
    try {
      const fallback = await getExternalReviewSummary(gtin, {
        name: fallbackName,
        brand,
      });
      if (fallback) {
        return NextResponse.json(fallback, { status: 200 });
      }
    } catch (error) {
      logger.error('Reviews: external fallback failed', error as Error, {
        gtin,
      });
    }
  }

  const payload = {
    gtin,
    productTitle: productTitle ?? fallbackName,
    productDescription,
    averageRating: Number(averageRating.toFixed(2)),
    reviewCount,
    source: 'Supabase Reviews',
    sourceUrl: undefined,
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
