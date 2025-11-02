'use client';

import { useProductsByCategory } from '@/lib/hooks/use-products-by-category';
import { SmallProductCard } from './small-product-card';
import { H3 } from '@/components/ui/typography';
import { SmallProductCardSkeleton } from './small-product-card-skeleton';

interface RelatedProductsProps {
  category: string | null;
  currentProductId: string;
}

export function RelatedProducts({
  category,
  currentProductId,
}: RelatedProductsProps) {
  const { products, isLoading } = useProductsByCategory(category, 5); // Fetch 5, filter out current, show 4

  if (isLoading) {
    return (
      <div className="mt-12">
        <H3>Related Products</H3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SmallProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  const relatedProducts = products
    ?.filter((p) => p.id !== currentProductId)
    .slice(0, 4);

  if (!relatedProducts || relatedProducts.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <H3>Related Products</H3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        {relatedProducts.map((product) => (
          <SmallProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
