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
import { H2, P } from '@/components/ui/typography';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { product, error, isLoading } = useProduct(params.id as string);
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
        <div className="flex justify-center items-center min-h-[60vh]">
          <P className="text-foreground/60">Loading product...</P>
        </div>
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
  const productSchema = generateProductSchema(product, baseUrl, currency);

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

          <div className="gap-12 grid grid-cols-1 lg:grid-cols-2">
            {/* Product Visual */}
            <ProductImageGallery
              product={product}
              selectedImage={selectedImage}
              setSelectedImage={setSelectedImage}
            />

            {/* Product Info */}
            <ProductInfo product={product} />
          </div>

          <aside className="gap-4 grid grid-cols-3 backdrop-blur-md mt-12 p-12 border border-accent-foreground/10 rounded-xl bg-accent-foreground/5">
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
        </div>
      </div>
    </PageLayout>
  );
}
