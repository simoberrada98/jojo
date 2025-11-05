import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchProductByHandle } from '@/lib/data/fetch-product';
import { generateProductMetadata, generateBreadcrumbSchema } from '@/lib/seo/product-metadata';
import { generateProductSchema, serializeSchema } from '@/lib/schema';
import { env } from '@/lib/config/env';
import { ProductPageClient } from './product-page-client';

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * Generate metadata for the product page
 */
export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductByHandle(slug);

  if (!product) {
    return {
      title: 'Product Not Found',
      description: 'The requested product could not be found.',
    };
  }

  const baseUrl = env.NEXT_PUBLIC_BASE_URL || 'https://jhuangnyc.com';
  return generateProductMetadata({ product, baseUrl });
}

/**
 * Server component for product detail page with SEO optimization
 */
export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await fetchProductByHandle(slug);

  if (!product) {
    notFound();
  }

  // Generate schemas
  const baseUrl = env.NEXT_PUBLIC_BASE_URL || 'https://jhuangnyc.com';
  const canonicalUrl = `${baseUrl}/products/${product.handle}`;
  const productSchema = generateProductSchema(product, baseUrl, 'USD');
  const breadcrumbSchema = generateBreadcrumbSchema(product, baseUrl);

  // Calculate updated label
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
    <>
      {/* Schema.org Product markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeSchema(productSchema),
        }}
      />
      {/* Schema.org BreadcrumbList markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeSchema(breadcrumbSchema),
        }}
      />

      <ProductPageClient
        product={product}
        canonicalUrl={canonicalUrl}
        updatedLabel={updatedLabel}
      />
    </>
  );
}

// Enable ISR with revalidation
export const revalidate = 300; // Revalidate every 5 minutes
