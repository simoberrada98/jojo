'use client';

import { Star } from 'lucide-react';
import { useProductReviews } from '@/lib/hooks/use-product-reviews';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type ProductReviewsProps = {
  gtin?: string | null;
  name: string;
  brand?: string | null;
};

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
            'h-4 w-4',
            score <= Math.round(value)
              ? 'text-accent fill-accent/30'
              : 'text-muted-foreground'
          )}
        />
      ))}
    </div>
  );
}

export function ProductReviews({ gtin, name, brand }: ProductReviewsProps) {
  const { summary, isLoading, error } = useProductReviews(gtin, name, brand);

  if (!gtin) {
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
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
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
            <p className="text-sm text-muted-foreground">
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
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <RatingStars value={summary.averageRating} />
            <span className="font-semibold text-foreground">
              {summary.averageRating.toFixed(1)} / 5.0
            </span>
            <span aria-hidden="true">•</span>
            <span>{summary.reviewCount} reviews</span>
            <span aria-hidden="true">•</span>
            <span>Source: {summary.source}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {summary.reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              This GTIN is registered, but no public review snippets were
              returned.
            </p>
          ) : (
            summary.reviews.map((review, index) => (
              <article
                key={`${review.reviewerName}-${index}`}
                className="space-y-2"
              >
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
            ))
          )}
          {summary.sourceUrl && (
            <a
              href={summary.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-accent underline"
            >
              View source dataset
            </a>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
