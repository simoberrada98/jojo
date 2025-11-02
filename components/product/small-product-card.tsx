'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import ProductImage from '@/components/product-image';
import { useCurrency } from '@/lib/contexts/currency-context';
import { useCart } from '@/lib/contexts/cart-context';
import type { DisplayProduct } from '@/types/product';

interface SmallProductCardProps {
  product: DisplayProduct;
}

export function SmallProductCard({ product }: SmallProductCardProps) {
  const [isAdded, setIsAdded] = useState(false);
  const { currency, formatPrice } = useCurrency();
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem(product);
    setIsAdded(true);
    toast.success(`${product.name} added to cart!`);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="group relative border border-border rounded-lg overflow-hidden transition-all duration-300">
      <Link href={`/product/${product.handle}`} className="block">
        {/* Image Container */}
        <div className="relative w-full aspect-square overflow-hidden">
          <ProductImage category={product.category} image={product.image} />
        </div>

        {/* Content */}
        <div className="p-3">
          {/* Title */}
          <h4 className="font-medium text-sm text-foreground truncate mb-1">
            {product.name}
          </h4>

          {/* Price */}
          <div className="font-mono font-bold text-accent text-lg mb-2">
            {formatPrice(product.priceUSD)} {currency}
          </div>
        </div>
      </Link>

      {/* Add to Cart Button */}
      <div className="p-3 pt-0">
        <Button
          onClick={handleAddToCart}
          size="sm"
          className="gap-1 w-full text-xs"
        >
          <ShoppingCart className="w-3 h-3" />
          {isAdded ? 'Added!' : 'Add to Cart'}
        </Button>
      </div>
    </div>
  );
}
