'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Headset, ShieldCheck, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductInfo } from '@/components/product/product-info';
import { ProductImageGallery } from '@/components/product/product-image-gallery';
import PageLayout from '@/components/layout/PageLayout';
import { useCurrency } from '@/lib/contexts/currency-context';
import { useProduct } from '@/lib/hooks/use-product';
import { generateProductSchema, serializeSchema } from '@/lib/schema';
import { P } from '@/components/ui/typography';
import { ProductKeyFeatures } from '@/components/product/product-key-features';
import { RelatedProducts } from '@/components/product/related-products';
import { ProductDetailSkeleton } from '@/components/product/product-detail-skeleton';

export default function MinerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { product, error, isLoading } = useProduct(params.slug as string);
  const [selectedImage, setSelectedImage] = useState(0);
  const { currency } = useCurrency();
  const perks = [
    { icon: Headset, highlight: '24/7', description: 'Support' },
    { icon: ShieldCheck, highlight: '2 Year', description: 'Warranty' },
    { icon: Truck, highlight: 'Free', description: 'Shipping' },
  ];

  if (isLoading) {
    return (
      <PageLayout>
        <ProductDetailSkeleton />
      </PageLayout>
    );
  }

  if (error || !product) {
    return (
      <PageLayout>
        <div className="flex flex-col justify-center items-center gap-4 min-h-[60vh]">
          <P className="text-destructive text-lg">
            {error?.message || 'Product not found'}
          </P>
          <Button onClick={() => router.push('/')} variant="outline">
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back to Home
          </Button>
        </div>
      </PageLayout>
    );
  }

  // Generate Product Schema
  const baseUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://jhuangnyc.com';
  const canonicalUrl = `${baseUrl}/miners/${product.handle}`;
  const productSchema = generateProductSchema(product, baseUrl, currency);
  const fallbackUpdatedLabel = 'Nov 2 2025';
  let updatedLabel = fallbackUpdatedLabel;
  if (product.updated_at) {
    const timestamp = new Date(product.updated_at);
    if (!Number.isNaN(timestamp.valueOf())) {
      updatedLabel = timestamp
        .toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
        .replace(',', '');
    }
  }

  return (
    <PageLayout>
      {/* Schema.org Product markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeSchema(productSchema),
        }}
      />

      <div className="px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        <div className="mx-auto max-w-7xl">
          {/* Back Button */}
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="hover:bg-accent/10 mb-8 border-accent text-accent"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back
          </Button>

          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>Updated {updatedLabel}</span>
            <span aria-hidden="true">|</span>
            <a
              href={`${canonicalUrl}#technical-specifications`}
              className="text-accent hover:underline underline-offset-4"
            >
              Cite this page
            </a>
          </div>

          <div className="gap-12 grid grid-cols-1 lg:grid-cols-2">
            {/* Product Visuals and Key Features */}
            <section id="visual-overview">
              <ProductImageGallery
                product={product}
                selectedImage={selectedImage}
                setSelectedImage={setSelectedImage}
              />
              <div id="key-features" className="mt-12">
                <ProductKeyFeatures product={product} />
              </div>
            </section>

            {/* Product Info */}
            <section id="technical-specifications">
              <ProductInfo product={product} />
            </section>
          </div>

          <aside
            id="miner-benefits"
            className="gap-4 grid grid-cols-3 backdrop-blur-md mt-12 p-12 border border-accent-foreground/10 rounded-xl bg-accent-foreground/5"
          >
            {perks.map(({ icon: Icon, highlight, description }) => (
              <div
                className="flex flex-col items-center text-center gap-2"
                key={highlight}
              >
                <div className="flex justify-center items-center bg-accent/10 rounded-full text-accent w-12 h-12">
                  <Icon aria-hidden="true" className="w-6 h-6" />
                </div>
                <div className="font-mono font-bold text-accent text-2xl">
                  {highlight}
                </div>
                <div className="text-foreground/60 text-xs">{description}</div>
              </div>
            ))}
          </aside>

          <section id="related-miners" className="mt-12">
            <RelatedProducts
              category={product.category}
              currentProductId={product.id}
            />
          </section>
        </div>
      </div>
    </PageLayout>
  );
}
