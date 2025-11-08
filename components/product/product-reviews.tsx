'use client';

import { Star } from 'lucide-react';
import { useProductReviews } from '@/lib/hooks/use-product-reviews';
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

export function ProductReviews({ gtin, name, brand }: ProductReviewsProps) {
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
              {summary.averageRating.toFixed(1)} / 5.0
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
          {summary.reviews.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              This GTIN is registered, but no public review snippets were
              returned.
            </p>
          ) : (
            summary.reviews.map((review, index) => (
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
            ))
          )}
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

          {/* Submission form */}
          <div className="mt-8 pt-6 border-t">
            <h4 className="mb-3 font-medium text-sm">Submit your review</h4>
            <div className="gap-4 grid sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="sub-rating">Rating</Label>
                <Select
                  value={String(subRating)}
                  onValueChange={(v) => setSubRating(Number(v))}
                >
                  <SelectTrigger id="sub-rating" className="w-32">
                    <SelectValue placeholder="Rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="sub-title">Title (optional)</Label>
                <Input
                  id="sub-title"
                  value={subTitle}
                  onChange={(e) => setSubTitle(e.target.value)}
                  placeholder="Short summary"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="sub-comment">Comment</Label>
                <Textarea
                  id="sub-comment"
                  value={subComment}
                  onChange={(e) => setSubComment(e.target.value)}
                  placeholder="Share your experience"
                  rows={4}
                />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <Button onClick={handleSubmitReview} disabled={submitting}>
                Submit Review
              </Button>
              {submitError && (
                <span className="text-red-600 text-sm">{submitError}</span>
              )}
              {submitSuccess && (
                <span className="text-green-600 text-sm">
                  Thanks! Your review is pending approval.
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
