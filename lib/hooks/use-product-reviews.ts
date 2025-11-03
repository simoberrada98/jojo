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

export function useProductReviews(
  gtin?: string | null,
  fallbackQuery?: string,
  brand?: string | null
) {
  const normalizedGtin = gtin?.trim();
  const searchParams = new URLSearchParams();
  if (fallbackQuery) {
    searchParams.set('q', fallbackQuery);
  }
  if (brand) {
    searchParams.set('brand', brand);
  }

  const queryString = searchParams.toString();
  const url = normalizedGtin
    ? `/api/reviews/${encodeURIComponent(normalizedGtin)}${
        queryString ? `?${queryString}` : ''
      }`
    : null;

  const { data, error, isLoading } = useSWR<ExternalReviewSummary | null>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  return {
    summary: data,
    error,
    isLoading,
  };
}
