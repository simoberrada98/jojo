'use client';

import type { ReactNode } from 'react';
import {
  Star,
  Zap,
  Cpu,
  Shield,
  ShoppingCart,
  Tag,
  Info,
  Ruler,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useCurrency } from '@/lib/contexts/currency-context';
import { useCart } from '@/lib/contexts/cart-context';
import type { DisplayProduct } from '@/types/product';

import { H1, H2, H3, P } from '@/components/ui/typography';
import { ProductTrustedBy } from './product-trusted-by';

interface ProductInfoProps {
  product: DisplayProduct;
}

interface InfoItemProps {
  label: string;
  value: ReactNode;
}

function InfoItem({ label, value }: InfoItemProps) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <dt className="text-foreground/60">{label}</dt>
      <dd className="font-medium text-foreground text-right">
        {value ?? 'N/A'}
      </dd>
    </div>
  );
}

export function ProductInfo({ product }: ProductInfoProps) {
  const { currency, formatPrice } = useCurrency();
  const { addItem } = useCart();

  const appendTrackingParams = (url: string, medium: 'video' | 'model') => {
    try {
      const traced = new URL(url);
      traced.searchParams.set('utm_source', 'minehub');
      traced.searchParams.set('utm_medium', medium);
      traced.searchParams.set('utm_campaign', 'product-page');
      traced.searchParams.set('utm_content', product.handle);
      return traced.toString();
    } catch {
      return url;
    }
  };

  const handleAddToCart = () => {
    addItem(product);
    toast.success(`${product.name} added to cart!`);
  };

  const hasAllDimensions =
    product.dimensions.length !== null &&
    product.dimensions.width !== null &&
    product.dimensions.height !== null;
  const hasAnyDimension =
    product.dimensions.length !== null ||
    product.dimensions.width !== null ||
    product.dimensions.height !== null;

  const dimensionLine = hasAllDimensions
    ? `${product.dimensions.length} x ${product.dimensions.width} x ${product.dimensions.height} in`
    : hasAnyDimension
      ? `${product.dimensions.length ?? '?'} x ${product.dimensions.width ?? '?'} x ${product.dimensions.height ?? '?'} in`
      : null;

  const weightLabel =
    product.dimensions.weight !== null
      ? `${product.dimensions.weight} lbs`
      : 'N/A';

  return (
    <div className="space-y-6">
      <div>
        <H1 className="mb-3 font-bold text-foreground text-4xl">
          {product.name}
        </H1>
        {product.shortDescription && (
          <P className="mb-4 text-foreground/70 leading-relaxed">
            {product.shortDescription}
          </P>
        )}
        {product.rating && (
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={`h-5 w-5 ${
                      index < Math.floor(product.rating!)
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
            {product.reviewCount && (
              <span className="text-foreground/60 text-sm">
                ({product.reviewCount} reviews)
              </span>
            )}
          </div>
        )}
      </div>

      <div className="bg-card p-6 border border-border rounded-xl">
        <div className="flex items-end gap-3">
          <div className="font-mono font-bold text-accent text-4xl">
            {formatPrice(product.priceUSD)} {currency}
          </div>
          <div className="font-mono text-foreground/60 text-sm">
            ${product.priceUSD.toLocaleString()} USD
          </div>
        </div>
        <div className="space-y-2 mt-4 text-sm">
          {product.compareAtPrice && (
            <div className="flex justify-between text-foreground/70">
              <span>Compare at price</span>
              <span className="font-mono">
                ${product.compareAtPrice.toLocaleString()}
              </span>
            </div>
          )}
          {product.costPrice !== null && product.costPrice !== undefined && (
            <div className="flex justify-between text-foreground/70">
              <span>Cost price</span>
              <span className="font-mono">
                ${Number(product.costPrice).toLocaleString()}
              </span>
            </div>
          )}
        </div>
        <Button
          onClick={handleAddToCart}
          size="lg"
          className="bg-primary hover:bg-primary/90 mt-6 py-6 w-full font-semibold text-primary-foreground text-lg"
        >
          <ShoppingCart className="mr-2 w-5 h-5" />
          Add to Cart
        </Button>
      </div>

      <ProductTrustedBy />

      <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
        <div className="bg-card p-4 border border-border rounded-xl">
          <div className="flex items-center gap-2 mb-2 text-accent">
            <Zap className="w-5 h-5" />
            <span className="font-semibold">Hashrate</span>
          </div>
          <div className="font-mono font-bold text-foreground text-2xl">
            {product.hash_rate || product.hashrate || 'N/A'}
          </div>
        </div>
        <div className="bg-card p-4 border border-border rounded-xl">
          <div className="flex items-center gap-2 mb-2 text-accent">
            <Cpu className="w-5 h-5" />
            <span className="font-semibold">Power consumption</span>
          </div>
          <div className="font-mono font-bold text-foreground text-2xl">
            {product.power || 'N/A'}
          </div>
        </div>
      </div>

      <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
        <div className="bg-card p-6 border border-border rounded-xl">
          <div className="flex items-center gap-2 mb-4 text-accent">
            <Info className="w-5 h-5" />
            <H3 className="font-semibold text-foreground text-lg">
              Product details
            </H3>
          </div>
          <dl className="space-y-3">
            <InfoItem label="SKU" value={product.sku || 'N/A'} />
            <InfoItem label="Category" value={product.category || 'N/A'} />
            <InfoItem label="Brand" value={product.brand || 'N/A'} />
          </dl>
          {product.tags.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2 text-foreground/60 text-sm">
                <Tag className="w-4 h-4" />
                <span className="uppercase tracking-wide">Tags</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-accent/10 px-3 py-1 rounded-full font-medium text-accent text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="bg-card p-6 border border-border rounded-xl">
          <div className="flex items-center gap-2 mb-4 text-accent">
            <Ruler className="w-5 h-5" />
            <H3 className="font-semibold text-foreground text-lg">
              Physical characteristics
            </H3>
          </div>
          <dl className="space-y-3">
            <InfoItem label="Weight" value={weightLabel} />
            <InfoItem label="Dimensions" value={dimensionLine ?? 'N/A'} />
          </dl>
          {(product.videoUrl || product.model3dUrl) && (
            <div className="space-y-2 mt-4 text-foreground/70 text-sm">
              {product.videoUrl && (
                <a
                  href={appendTrackingParams(product.videoUrl, 'video')}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent hover:underline underline-offset-4"
                >
                  View product video
                </a>
              )}
              {product.model3dUrl && (
                <a
                  href={appendTrackingParams(product.model3dUrl, 'model')}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent hover:underline underline-offset-4"
                >
                  View 3D model
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="bg-card p-6 border border-border rounded-xl">
        <div className="flex items-center gap-2 mb-4 text-accent">
          <Shield className="w-5 h-5" />
          <H3 className="font-semibold text-foreground text-lg">
            Technical specifications
          </H3>
        </div>
        <ul className="space-y-3">
          {product.specs.length === 0 && (
            <li className="text-foreground/60 text-sm">
              No specifications recorded.
            </li>
          )}
          {product.specs.map((spec) => (
            <li
              key={spec}
              className="flex items-start gap-3 text-foreground/80"
            >
              <span
                aria-hidden="true"
                className="inline-block bg-accent mt-1.5 rounded-full w-2 h-2"
              />
              <span>{spec}</span>
            </li>
          ))}
        </ul>
      </div>

      {product.description && (
        <section className="hidden visible bg-card mt-12 p-6 border border-border rounded-xl">
          <H2 className="mb-4 font-semibold text-foreground text-2xl">
            Detailed description
          </H2>
          <div
            className="space-y-4 [&>li]:mt-1 [&>p]:mt-2 [&>ol]:pl-6 [&>ul]:pl-6 text-foreground/80 leading-relaxed [&>ol]:list-decimal [&>ul]:list-disc"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        </section>
      )}
    </div>
  );
}
