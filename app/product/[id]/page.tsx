'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductInfo } from '@/components/product/product-info';
import { ProductImageGallery } from '@/components/product/product-image-gallery';
import PageLayout from '@/components/layout/PageLayout';
import ProductImage from '@/components/product-image';
import { useCurrency } from '@/lib/contexts/currency-context';
import { useProduct } from '@/lib/hooks/use-product';
import { useCart } from '@/lib/contexts/cart-context';
import { generateProductSchema, serializeSchema } from '@/lib/schema';
import toast from 'react-hot-toast';
import type { DisplayProduct } from '@/types/product';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { product, error, isLoading } = useProduct(params.id as string);
  const [selectedImage, setSelectedImage] = useState(0);
  const { currency } = useCurrency();
  const { addItem } = useCart();

  const handleAddToCart = () => {
    if (product) {
      addItem(product);
      toast.success(`${product.name} added to cart!`);
    }
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <p className="text-foreground/60">Loading product...</p>
        </div>
      </PageLayout>
    );
  }

  if (error || !product) {
    return (
      <PageLayout>
        <div className="flex flex-col justify-center items-center gap-4 min-h-[60vh]">
          <p className="text-destructive text-lg">
            {error?.message || 'Product not found'}
          </p>
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
        </div>
      </div>
    </PageLayout>
  );
}
