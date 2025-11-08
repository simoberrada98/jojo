'use client';

import useSWR from 'swr';
import type { ExternalReviewSummary } from '@/types/review';

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error('Failed to load reviews');
  }
  return (await response.json()) as ExternalReviewSummary;
};

export type UseProductReviewsOptions = {
  sort?: 'helpful' | 'latest';
  rating?: number; // 1..5
  page?: number;
  pageSize?: number;
};

export function useProductReviews(
  gtin?: string | null,
  fallbackQuery?: string,
  brand?: string | null,
  options: UseProductReviewsOptions = {}
) {
  const normalizedGtin = gtin?.trim();
  const searchParams = new URLSearchParams();
  if (fallbackQuery) {
    searchParams.set('q', fallbackQuery);
  }
  if (brand) {
    searchParams.set('brand', brand);
  }
  if (options.sort) searchParams.set('sort', options.sort);
  if (options.rating && options.rating >= 1 && options.rating <= 5)
    searchParams.set('rating', String(options.rating));
  if (options.page) searchParams.set('page', String(Math.max(1, options.page)));
  if (options.pageSize)
    searchParams.set('pageSize', String(Math.max(1, Math.min(50, options.pageSize))));

  const queryString = searchParams.toString();
  const url = normalizedGtin
    ? `/api/reviews/${encodeURIComponent(normalizedGtin)}${
        queryString ? `?${queryString}` : ''
      }`
    : null;

  const { data, error, isLoading, mutate } = useSWR<ExternalReviewSummary | null>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  async function submitReview(input: {
    rating: number;
    comment: string;
    title?: string;
    accessToken: string;
  }) {
    if (!normalizedGtin) throw new Error('No GTIN specified');
    const res = await fetch(`/api/reviews/${encodeURIComponent(normalizedGtin)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${input.accessToken}`,
      },
      body: JSON.stringify({ rating: input.rating, comment: input.comment, title: input.title }),
    });
    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      throw new Error(payload?.error || 'Failed to submit review');
    }
    await mutate();
    return true;
  }

  return {
    summary: data,
    error,
    isLoading,
    submitReview,
  };
}
