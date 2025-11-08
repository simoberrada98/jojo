'use client';

import { Star } from 'lucide-react';
import { useProductReviews } from '@/lib/hooks/use-product-reviews';
import type {
  ExternalReviewSummary,
  ExternalReviewEntry,
} from '@/types/review';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';

/**
 * ProductReviews
 *
 * Conditionally renders external review summaries for a product. This component
 * will return `null` (and skip any network calls) when the current product's
 * known review count is zero. When reviews exist or the count is unknown, it
 * fetches and renders the full reviews UI.
 *
 * Behavior:
 * - Early-return before any hooks or expensive work when `reviewCount` is 0.
 * - Maintains full functionality when reviews exist.
 * - Adds type guards to validate the review summary structure.
 * - Minimizes unnecessary re-renders by gating on stable product props.
 */
type ProductReviewsProps = {
  gtin?: string | null;
  name: string;
  brand?: string | null;
  /**
   * Known count of reviews for the product (from product relations). When 0,
   * the component will not render and will avoid making API calls.
   */
  reviewCount?: number | null;
};

// Type guard: checks that a review summary contains a non-empty reviews array
function hasExternalReviews(
  summary: ExternalReviewSummary | null | undefined
): summary is ExternalReviewSummary & { reviews: ExternalReviewEntry[] } {
  return (
    !!summary && Array.isArray(summary.reviews) && summary.reviews.length > 0
  );
}

// Type guard: validates a positive review count hint from product props
function hasIncomingReviewsHint(
  reviewCount?: number | null
): reviewCount is number {
  return typeof reviewCount === 'number' && reviewCount > 0;
}

function RatingStars({ value }: { value: number }) {
  return (
    <div
      className="flex items-center gap-1"
      aria-label={`Rated ${value} out of 5`}
    >
      {Array.from({ length: 5 }, (_, index) => index + 1).map((score) => (
        <Star
          key={score}
          className={cn(
            'w-4 h-4',
            score <= Math.round(value)
              ? 'text-accent fill-accent/30'
              : 'text-muted-foreground'
          )}
        />
      ))}
    </div>
  );
}

export function ProductReviews({
  gtin,
  name,
  brand,
  reviewCount,
}: ProductReviewsProps) {
  // Early guard: skip rendering entirely when GTIN is missing or product reviewCount is 0.
  // This prevents calling hooks and making network requests when there are no reviews.
  if (!gtin) {
    return null;
  }
  if (reviewCount === 0) {
    return null;
  }
  const [sort, setSort] = useState<'helpful' | 'latest'>('helpful');
  const [ratingFilter, setRatingFilter] = useState<number | undefined>(
    undefined
  );
  const [page, setPage] = useState<number>(1);
  const pageSize = 10;

  const { summary, isLoading, error, submitReview } = useProductReviews(
    gtin,
    name,
    brand,
    { sort, rating: ratingFilter, page, pageSize }
  );

  // Submission form state
  const [subRating, setSubRating] = useState<number>(5);
  const [subTitle, setSubTitle] = useState<string>('');
  const [subComment, setSubComment] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  async function handleSubmitReview() {
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);
    try {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        setSubmitError('Please sign in to submit a review.');
        setSubmitting(false);
        return;
      }
      await submitReview({
        rating: subRating,
        comment: subComment,
        title: subTitle,
        accessToken: token,
      });
      setSubmitSuccess(true);
      setSubTitle('');
      setSubComment('');
      setSubRating(5);
    } catch (e: any) {
      setSubmitError(e?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  }

  // If the server-provided summary indicates no reviews, hide the component.
  // This maintains the strict requirement to only render when reviews exist.
  if (summary && !hasExternalReviews(summary)) {
    return null;
  }

  if (isLoading) {
    return (
      <section aria-label="Product reviews" className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle>External reviews</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="w-2/3 h-6" />
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-5/6 h-4" />
          </CardContent>
        </Card>
      </section>
    );
  }

  if (error) {
    return (
      <section aria-label="Product reviews" className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle>External reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Unable to load external reviews right now.
            </p>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <section aria-label="Product reviews" className="mt-12" id="reviews">
      <Card>
        <CardHeader className="flex flex-col gap-2">
          <CardTitle className="flex items-center gap-2">
            Verified feedback tied to GTIN {summary.gtin}
          </CardTitle>
          <div className="flex flex-wrap items-center gap-3 text-muted-foreground text-sm">
            <RatingStars value={summary.averageRating} />
            <span className="font-semibold text-foreground">
              {summary.averageRating.toFixed(2)} / 5.0
            </span>
            <span aria-hidden="true">•</span>
            <span>{summary.reviewCount} reviews</span>
            <span aria-hidden="true">•</span>
            <span>Source: {summary.source}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="sort">Sort</Label>
              <Select
                value={sort}
                onValueChange={(v) => {
                  setSort(v as 'helpful' | 'latest');
                  setPage(1);
                }}
              >
                <SelectTrigger id="sort" className="w-40">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="helpful">Most helpful</SelectItem>
                  <SelectItem value="latest">Latest</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="rating">Rating</Label>
              <Select
                value={String(ratingFilter ?? 'all')}
                onValueChange={(v) => {
                  if (v === 'all') {
                    setRatingFilter(undefined);
                  } else {
                    setRatingFilter(Number(v));
                  }
                  setPage(1);
                }}
              >
                <SelectTrigger id="rating" className="w-40">
                  <SelectValue placeholder="All ratings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="5">5 stars</SelectItem>
                  <SelectItem value="4">4 stars</SelectItem>
                  <SelectItem value="3">3 stars</SelectItem>
                  <SelectItem value="2">2 stars</SelectItem>
                  <SelectItem value="1">1 star</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 ml-auto text-sm">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={(summary.page ?? page) <= 1}
              >
                Prev
              </Button>
              <span className="text-muted-foreground">
                Page {summary.page ?? page} of {summary.totalPages ?? 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={(summary.page ?? page) >= (summary.totalPages ?? 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {summary.reviews.map((review, index) => (
            <article
              key={`${review.reviewerName}-${index}`}
              className="space-y-2"
            >
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <RatingStars value={review.rating} />
                {review.reviewerName && <span>{review.reviewerName}</span>}
                {review.date && (
                  <span>
                    {new Date(review.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                )}
              </div>
              <p className="text-foreground text-sm">{review.comment}</p>
            </article>
          ))}
          {summary.sourceUrl && (
            <a
              href={summary.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="text-accent text-sm underline"
            >
              View source dataset
            </a>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
