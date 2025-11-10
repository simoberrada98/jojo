import { describe, it, expect, vi } from 'vitest';
import * as svc from '@/lib/services/reviews/amazon-reviews.service';
import type { Json } from '@/types/supabase.types';

describe('mapSerpApiToReviews', () => {
  it('transforms SerpAPI reviews to product_reviews rows', async () => {
    const gtin = '0123456789012';
    const productId = 'product-1';

    const raw = {
      reviews_results: [
        {
          title: 'Great miner',
          snippet: 'Works very well',
          date: '2024-10-01',
          rating: 4.7,
          source: 'Verified Purchase',
          link: 'https://amazon.com/review/R123?ref=abc',
          helpful_count: 12,
        },
        {
          title: '',
          snippet: 'ok',
          date: '2024-05-10',
          rating: 6, // should clamp to 5
          source: 'User',
          link: 'invalid-url',
          helpful_count: null,
        },
      ],
    };

    vi.spyOn(svc, 'getOrFetchSerpApiRaw').mockResolvedValue({
      id: 'cache-1',
      gtin,
      raw_response: raw as Json,
      last_fetched_at: new Date().toISOString(),
    });

    const rows = await svc.mapSerpApiToReviews(gtin, productId);
    expect(rows).toHaveLength(2);
    const first = rows[0];
    expect(first.product_id).toBe(productId);
    expect(first.is_verified_purchase).toBe(true);
    expect(first.helpful_count).toBe(12);
    expect(first.rating).toBe(4.7);
    expect(first.source).toBe('amazon-serpapi');
    expect(first.external_id).toContain('amazon.com');

    const second = rows[1];
    expect(second.rating).toBe(5.0); // clamped
    expect(second.is_verified_purchase).toBe(false);
    expect(second.helpful_count).toBeNull();
  });
});

describe('backoff', () => {
  it('retries with exponential delays', async () => {
    let calls = 0;
    const fn = async () => {
      calls += 1;
      if (calls < 3) throw new Error('fail');
      return 'ok';
    };

    const result = await svc.backoff(fn, 3, 10);
    expect(result).toBe('ok');
    expect(calls).toBe(3);
  });
});

