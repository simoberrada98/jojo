'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { H2, H3, H4, Muted } from '@/components/ui/typography';
import { ChevronDown } from 'lucide-react';
import type { DisplayProduct } from '@/types/product';

const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Highest Rated', value: 'rating' },
  { label: 'Most Popular', value: 'popular' },
];

function ProductCatalogContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<DisplayProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 200000]);

  // Set category from URL params
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  // Fetch all products on mount
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const response = await fetch('/api/products?limit=100');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data.results || []);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load products'
        );
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const filteredAndSortedProducts = useMemo(() => {
    const result = products.filter((p) => {
      const categoryMatch =
        selectedCategory === 'All' || p.category === selectedCategory;
      const priceMatch =
        p.priceUSD >= priceRange[0] && p.priceUSD <= priceRange[1];
      return categoryMatch && priceMatch;
    });

    // Apply sorting
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.priceUSD - b.priceUSD);
        break;
      case 'price-desc':
        result.sort((a, b) => b.priceUSD - a.priceUSD);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'popular':
        result.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      default:
        // newest - keep original order
        break;
    }

    return result;
  }, [products, selectedCategory, sortBy, priceRange]);

  // Generate categories from products
  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category));
    return ['All', ...Array.from(cats).sort()];
  }, [products]);

  return (
    <section id="products" className="px-4 sm:px-6 lg:px-8 py-20">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <H2 className="mb-4 text-3xl sm:text-4xl lg:text-5xl text-balance">
            Premium Mining Hardware
          </H2>
          <Muted className="m-0 mx-auto max-w-2xl text-lg">
            Choose from our selection of professional-grade mining equipment.
            All products support crypto payments.
          </Muted>
        </div>

        {/* Filters and Sorting */}
        <div className="space-y-6 mb-12">
          {/* Category Filter */}
          <div>
            <H3 className="mb-3 font-semibold text-sm">Category</H3>
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <Button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  variant={
                    selectedCategory === category ? 'default' : 'outline'
                  }
                  className={
                    selectedCategory === category
                      ? 'bg-primary hover:bg-primary/90'
                      : 'border-accent text-accent hover:bg-accent/10'
                  }
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-accent hover:text-accent/80 transition"
            >
              <span className="font-semibold text-sm">Advanced Filters</span>
              <ChevronDown
                className="w-4 h-4 transition-transform"
                style={{
                  transform: showFilters ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              />
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <Muted className="m-0">Sort by:</Muted>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Price Range Filter */}
          {showFilters && (
            <div className="bg-card p-4 border border-border rounded-lg">
              <H4 className="mb-4 font-semibold text-sm">Price Range</H4>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label className="block mb-2 text-xs">Min Price</Label>
                    <Input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) =>
                        setPriceRange([Number(e.target.value), priceRange[1]])
                      }
                      placeholder="$0"
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="block mb-2 text-xs">Max Price</Label>
                    <Input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) =>
                        setPriceRange([priceRange[0], Number(e.target.value)])
                      }
                      placeholder="$200,000"
                    />
                  </div>
                </div>
                <Muted className="m-0 text-xs">
                  Showing products between ${priceRange[0].toLocaleString()} - $
                  {priceRange[1].toLocaleString()}
                </Muted>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6 text-foreground/70 text-sm">
          {loading ? (
            'Loading products...'
          ) : error ? (
            <span className="text-destructive">{error}</span>
          ) : (
            `Showing ${filteredAndSortedProducts.length} of ${products.length} products`
          )}
        </div>

        {/* Products Grid */}
        <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-full py-12 text-center">
              <p className="text-foreground/60">Loading products...</p>
            </div>
          ) : error ? (
            <div className="col-span-full py-12 text-center">
              <p className="text-destructive">{error}</p>
            </div>
          ) : filteredAndSortedProducts.length > 0 ? (
            filteredAndSortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-full py-12 text-center">
              <p className="text-foreground/60">
                No products found matching your filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default function ProductCatalog() {
  return (
    <Suspense
      fallback={
        <section className="px-4 sm:px-6 lg:px-8 py-20">
          <div className="mx-auto max-w-7xl text-center">
            <div className="mx-auto border-accent border-b-2 rounded-full w-12 h-12 animate-spin"></div>
          </div>
        </section>
      }
    >
      <ProductCatalogContent />
    </Suspense>
  );
}
