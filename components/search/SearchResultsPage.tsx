'use client';

import { useEffect, useMemo, useRef, useState, useDeferredValue } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { H1, H3, Muted, P } from '@/components/ui/typography';
import ProductCard from '@/components/product-card';
import { ProductCardSkeleton } from '@/components/product/product-card-skeleton';
import type { DisplayProduct } from '@/types/product';
import { fetchWithRetry } from '@/lib/utils/fetch-with-retry';
import { PRODUCT_CONFIG } from '@/lib/config/product.config';
import { cn } from '@/lib/utils';

type SearchResponse = {
  total: number;
  offset: number;
  limit: number;
  results: DisplayProduct[];
  hasMore: boolean;
  error?: string;
};

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Rating' },
];

function sanitizeQuery(input: string): string {
  // Limit length, trim, collapse whitespace; API also sanitizes, this is defense-in-depth
  return input
    .replace(/[\n\r]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 128);
}

function buildQueryParams({
  q,
  category,
  limit,
  offset,
  inStockOnly,
  sort,
}: {
  q: string;
  category?: string;
  limit: number;
  offset: number;
  inStockOnly?: boolean;
  sort?: string;
}): string {
  const params = new URLSearchParams();
  const safeQ = sanitizeQuery(q);
  if (safeQ) params.set('q', safeQ);
  if (category) params.set('category', category);
  params.set('limit', String(limit));
  params.set('offset', String(offset));
  if (typeof inStockOnly === 'boolean') params.set('inStockOnly', String(inStockOnly));
  if (sort) params.set('sort', sort);
  return params.toString();
}

export function SearchResultsPage() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('');
  const [sort, setSort] = useState<string>('relevance');
  const [pageSize, setPageSize] = useState<number>(PRODUCT_CONFIG.itemsPerPage);
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);

  const [results, setResults] = useState<DisplayProduct[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestLoading, setSuggestLoading] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  const deferredQuery = useDeferredValue(query);
  const abortRef = useRef<AbortController | null>(null);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total, pageSize]
  );

  // Initialize state from URL params (supports deep links like /search?q=miner)
  useEffect(() => {
    const q = searchParams.get('q') || '';
    const cat = searchParams.get('category') || '';
    // Optional: accept limit for page size when present
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : NaN;
    setQuery(q);
    setCategory(cat);
    if (!Number.isNaN(limit) && [12, 24, 48].includes(limit)) {
      setPageSize(limit);
    }
    // If offset is present, derive page index
    const offsetParam = searchParams.get('offset');
    const offset = offsetParam ? parseInt(offsetParam, 10) : NaN;
    if (!Number.isNaN(offset)) {
      const size =
        !Number.isNaN(limit) && [12, 24, 48].includes(limit) ? limit : pageSize;
      setPageIndex(Math.max(0, Math.floor(offset / size)));
    }
  }, [searchParams]);

  // Sort client-side for options the API does not support
  const sortedResults = useMemo(() => {
    const base = inStockOnly ? results.filter((r) => r.inStock) : results;
    switch (sort) {
      case 'price-asc':
        return [...base].sort((a, b) => a.priceUSD - b.priceUSD);
      case 'price-desc':
        return [...base].sort((a, b) => b.priceUSD - a.priceUSD);
      case 'rating':
        return [...base].sort((a, b) => b.rating - a.rating);
      case 'newest':
        // API orders by created_at desc already, but ensure client-side as well
        return base;
      case 'relevance':
      default:
        return base;
    }
  }, [results, sort, inStockOnly]);

  async function fetchPage(currentIndex: number, signal?: AbortSignal) {
    setLoading(true);
    setError(null);
    try {
      const offset = currentIndex * pageSize;
      const qs = buildQueryParams({
        q: deferredQuery,
        category,
        limit: pageSize,
        offset,
        inStockOnly,
        sort,
      });
      const res = await fetchWithRetry(`/api/search?${qs}`, { signal });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = (await res.json()) as SearchResponse;
      setResults(data.results || []);
      setTotal(data.total || 0);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      setResults([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  // Fetch whenever query, category, pageSize, or pageIndex change
  useEffect(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    fetchPage(pageIndex, controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deferredQuery, category, pageSize, pageIndex]);

  // Reset to first page on query or category change
  useEffect(() => {
    setPageIndex(0);
  }, [deferredQuery, category, pageSize]);

  const onNextPage = () => setPageIndex((p) => Math.min(p + 1, totalPages - 1));
  const onPrevPage = () => setPageIndex((p) => Math.max(0, p - 1));
  const onClear = () => {
    setQuery('');
    setCategory('');
    setSort('relevance');
    setPageSize(PRODUCT_CONFIG.itemsPerPage);
    setInStockOnly(false);
    setPageIndex(0);
  };

  const resultsCountText = loading
    ? 'Loading results…'
    : error
      ? `Error: ${error}`
      : `Showing ${sortedResults.length} of ${total} results`;

  // Autocomplete suggestions for query input
  useEffect(() => {
    const term = sanitizeQuery(query);
    if (!term || term.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    let canceled = false;
    const timeout = setTimeout(async () => {
      try {
        setSuggestLoading(true);
        const res = await fetchWithRetry(`/api/search/suggest?q=${encodeURIComponent(term)}&limit=6`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { suggestions?: string[] };
        if (!canceled) {
          setSuggestions(data.suggestions || []);
          setShowSuggestions(true);
        }
      } catch {
        if (!canceled) {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } finally {
        if (!canceled) setSuggestLoading(false);
      }
    }, 250);
    return () => {
      canceled = true;
      clearTimeout(timeout);
    };
  }, [query]);

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <H1 className="mb-6 font-bold text-3xl">Search</H1>

        {/* Controls */}
        <Card className="p-4">
          <div className="gap-4 grid grid-cols-1 md:grid-cols-3">
            <div className="relative">
              <Label htmlFor="search-input">Search products</Label>
              <Input
                id="search-input"
                aria-label="Search products"
                aria-controls="search-results"
                placeholder="Search by name, description, or category"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="mt-2"
              />
              {showSuggestions && (
                <Card className="absolute left-0 right-0 z-20 mt-2 p-2">
                  {suggestLoading && <Muted>Loading suggestions…</Muted>}
                  {!suggestLoading && suggestions.length === 0 && (
                    <Muted>No suggestions</Muted>
                  )}
                  {!suggestLoading && suggestions.length > 0 && (
                    <ul>
                      {suggestions.map((s) => (
                        <li key={s}>
                          <button
                            type="button"
                            className="w-full text-left px-2 py-1 hover:bg-muted rounded"
                            onClick={() => {
                              setQuery(s);
                              setShowSuggestions(false);
                              setPageIndex(0);
                            }}
                          >
                            {s}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
              )}
            </div>
            <div>
              <Label htmlFor="category-input">Category</Label>
              <Input
                id="category-input"
                aria-label="Filter by category"
                placeholder="Optional: e.g., ASIC Miner"
                value={category}
                onChange={(e) => setCategory(e.target.value.trim())}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Sort</Label>
              <Select value={sort} onValueChange={(v) => setSort(v)}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select sort" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="items-end gap-4 grid grid-cols-1 md:grid-cols-3 mt-4">
            <div className="flex items-center gap-2">
              <input
                id="in-stock-only"
                type="checkbox"
                aria-label="Only show in-stock items"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
              />
              <Label htmlFor="in-stock-only" className="cursor-pointer">
                In stock only
              </Label>
            </div>
            <div>
              <Label>Items per page</Label>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => setPageSize(Number(v))}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Items per page" />
                </SelectTrigger>
                <SelectContent>
                  {[12, 24, 48].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={onClear}
                aria-label="Clear search and filters"
              >
                Clear
              </Button>
              <Button
                onClick={() => fetchPage(pageIndex)}
                aria-label="Refresh results"
              >
                Apply
              </Button>
            </div>
          </div>
        </Card>

        {/* Status */}
        <div className="mt-4" aria-live="polite" role="status">
          <Muted>{resultsCountText}</Muted>
        </div>

        {/* Results Grid */}
        <div
          id="search-results"
          className={cn(
            'gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-6'
          )}
        >
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))
          ) : error ? (
            <div className="col-span-full py-12 text-center">
              <P className="text-destructive">{error}</P>
            </div>
          ) : sortedResults.length > 0 ? (
            sortedResults.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-full py-12 text-center">
              <H3 className="mb-2 font-semibold text-2xl">No results</H3>
              <P className="text-foreground/70">
                Try adjusting your search terms or filters.
              </P>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-8">
          <Muted>
            Page {pageIndex + 1} of {totalPages}
          </Muted>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onPrevPage}
              disabled={pageIndex === 0 || loading}
              aria-label="Previous page"
            >
              Previous
            </Button>
            <Button
              onClick={onNextPage}
              disabled={pageIndex >= totalPages - 1 || loading}
              aria-label="Next page"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
