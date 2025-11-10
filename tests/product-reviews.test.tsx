import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import React from 'react';

// Mock the reviews hook so we can control its behavior
vi.mock('@/lib/hooks/use-product-reviews', () => {
  return {
    useProductReviews: vi.fn(),
  };
});

import { ProductReviews } from '@/components/product/product-reviews';
import { useProductReviews } from '@/lib/hooks/use-product-reviews';

describe('ProductReviews component', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('returns null and does not call hook when reviewCount is 0', () => {
    const mock = useProductReviews as ReturnType<typeof vi.fn>;

    render(
      <ProductReviews
        gtin={'1234567890123'}
        name={'Test Product'}
        brand={'BrandX'}
        reviewCount={0}
      />
    );

    // Should render nothing
    expect(document.body.innerHTML).not.toContain('External reviews');
    expect(document.body.innerHTML).toBe('');

    // Hook should not be invoked due to early-return
    expect(mock).not.toHaveBeenCalled();
  });

  it('renders full component when reviews exist', () => {
    const mock = useProductReviews as ReturnType<typeof vi.fn>;
    mock.mockReturnValue({
      summary: {
        gtin: '1234567890123',
        averageRating: 4.5,
        reviewCount: 2,
        source: 'amazon-serpapi',
        sourceUrl: 'https://example.com/source',
        reviews: [
          { rating: 5, comment: 'Great product!', reviewerName: 'Alice' },
          { rating: 4, comment: 'Works well', reviewerName: 'Bob' },
        ],
      },
      isLoading: false,
      error: null,
      submitReview: vi.fn(),
    });

    render(
      <ProductReviews
        gtin={'1234567890123'}
        name={'Test Product'}
        brand={'BrandX'}
        reviewCount={2}
      />
    );

    // Should render the header and review content
    expect(
      screen.getByText(/Verified feedback tied to GTIN 1234567890123/i)
    ).toBeDefined();
    expect(screen.getByText('Great product!')).toBeDefined();
    expect(screen.getByText('Works well')).toBeDefined();

    // Hook should have been called
    expect(mock).toHaveBeenCalled();
  });
});
