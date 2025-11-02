import { Shield } from 'lucide-react';
import type { DisplayProduct } from '@/types/product';
import { H3 } from '../ui/typography';

interface ProductKeyFeaturesProps {
  product: DisplayProduct;
}

export function ProductKeyFeatures({ product }: ProductKeyFeaturesProps) {
  if (product.features.length === 0) {
    return null;
  }

  return (
    <div className="bg-card mt-12 p-6 border border-border rounded-xl">
      <div className="flex items-center gap-2 mb-4 text-accent">
        <Shield className="w-5 h-5" />
        <H3 className="font-semibold text-foreground text-lg">Key features</H3>
      </div>
      <ul className="space-y-3">
        {product.features.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-3 text-foreground/80"
          >
            <span
              aria-hidden="true"
              className="inline-block bg-accent mt-1.5 rounded-full w-2 h-2"
            />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
