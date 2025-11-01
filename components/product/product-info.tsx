'use client';

import { Star, Zap, Cpu, Shield, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useCurrency } from '@/lib/contexts/currency-context';
import { useCart } from '@/lib/contexts/cart-context';
import type { DisplayProduct } from '@/types/product';

interface ProductInfoProps {
  product: DisplayProduct;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const { currency, formatPrice } = useCurrency();
  const { addItem } = useCart();

  const handleAddToCart = () => {
    if (product) {
      addItem(product);
      toast.success(`${product.name} added to cart!`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title and Rating */}
      <div>
        <h1 className="mb-4 font-bold text-foreground text-4xl">
          {product.name}
        </h1>
        {product.rating && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating!)
                        ? 'fill-accent text-accent'
                        : 'text-muted'
                    }`}
                  />
                ))}
              </div>
              <span className="font-semibold text-accent text-lg">
                {product.rating}
              </span>
            </div>
            {product.reviews && (
              <span className="text-foreground/60">
                ({product.reviews} reviews)
              </span>
            )}
          </div>
        )}
      </div>

      {/* Price */}
      <div className="bg-card p-6 border border-border rounded-xl">
        <div className="mb-2 font-mono font-bold text-accent text-4xl">
          {formatPrice(product.priceUSD)} {currency}
        </div>
        <div className="font-mono text-foreground/70 text-xl">
          ${product.priceUSD.toLocaleString()} USD
        </div>
      </div>

      {/* Key Specs */}
      <div className="gap-4 grid grid-cols-2">
        <div className="bg-card p-4 border border-border rounded-xl">
          <div className="flex items-center gap-2 mb-2 text-accent">
            <Zap className="w-5 h-5" />
            <span className="font-semibold">Hashrate</span>
          </div>
          <div className="font-mono font-bold text-foreground text-2xl">
            {product.hashrate}
          </div>
        </div>
        <div className="bg-card p-4 border border-border rounded-xl">
          <div className="flex items-center gap-2 mb-2 text-accent">
            <Cpu className="w-5 h-5" />
            <span className="font-semibold">Power</span>
          </div>
          <div className="font-mono font-bold text-foreground text-2xl">
            {product.power}
          </div>
        </div>
      </div>

      {/* Specifications */}
      <div className="bg-card p-6 border border-border rounded-xl">
        <h3 className="flex items-center gap-2 mb-4 font-bold text-foreground text-xl">
          <Shield className="w-5 h-5 text-accent" />
          Specifications
        </h3>
        <ul className="space-y-3">
          {product.specs.map((spec, idx) => (
            <li key={idx} className="flex items-start gap-3 text-foreground/80">
              <span className="mt-1 text-accent">•</span>
              <span>{spec}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Add to Cart */}
      <Button
        onClick={handleAddToCart}
        size="lg"
        className="bg-primary hover:bg-primary/90 py-6 w-full font-semibold text-primary-foreground text-lg"
      >
        <ShoppingCart className="mr-2 w-5 h-5" />
        Add to Cart
      </Button>

      {/* Trust Badges */}
      <div className="gap-4 grid grid-cols-3 pt-4">
        <div className="text-center">
          <div className="mb-1 font-mono font-bold text-accent text-2xl">
            24/7
          </div>
          <div className="text-foreground/60 text-xs">Support</div>
        </div>
        <div className="text-center">
          <div className="mb-1 font-mono font-bold text-accent text-2xl">
            2 Year
          </div>
          <div className="text-foreground/60 text-xs">Warranty</div>
        </div>
        <div className="text-center">
          <div className="mb-1 font-mono font-bold text-accent text-2xl">
            Free
          </div>
          <div className="text-foreground/60 text-xs">Shipping</div>
        </div>
      </div>
    </div>
  );
}
