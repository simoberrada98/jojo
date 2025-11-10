import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import React from 'react';

import { SearchResultsPage } from '@/components/search/SearchResultsPage';

describe('SearchResultsPage', () => {
  beforeEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders controls and empty state initially', () => {
    render(<SearchResultsPage />);
    expect(screen.getByLabelText(/Search products/i)).toBeDefined();
    expect(screen.getByText(/No results/i)).toBeDefined();
  });

  it('fetches and renders results when query is entered', async () => {
    const mockResults = {
      total: 1,
      offset: 0,
      limit: 24,
      results: [
        {
          id: 'p1',
          handle: 'asic-x',
          name: 'ASIC X',
          category: 'ASIC Miner',
          brand: 'BrandX',
          priceUSD: 1000,
          rating: 4.2,
          reviewCount: 12,
          images: [],
          inStock: true,
        },
      ],
      hasMore: false,
    };

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce(
        new Response(JSON.stringify(mockResults), { status: 200 })
      )
    );

    render(<SearchResultsPage />);
    const input = screen.getByLabelText(/Search products/i);
    fireEvent.change(input, { target: { value: 'asic' } });

    // Allow hooks/effects to run
    await vi.runAllTicks();

    // Should render product card
    expect(await screen.findByText(/ASIC X/i)).toBeDefined();
    // Status text shows results count
    expect(screen.getByText(/Showing 1 of 1 results/i)).toBeDefined();
  });

  it('shows error message on failed response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce(new Response('Bad', { status: 500 }))
    );

    render(<SearchResultsPage />);
    const input = screen.getByLabelText(/Search products/i);
    fireEvent.change(input, { target: { value: 'gpu' } });

    await vi.runAllTicks();

    expect(await screen.findByText(/Error: HTTP 500/i)).toBeDefined();
  });
});

