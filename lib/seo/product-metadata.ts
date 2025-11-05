import type { Metadata } from 'next';
import type { DisplayProduct } from '@/types/product';
import { siteMetadata } from './site-metadata';

interface ProductMetadataOptions {
  product: DisplayProduct;
  baseUrl?: string;
}

/**
 * Generate Open Graph metadata for product pages
 */
export function generateProductMetadata({
  product,
  baseUrl = siteMetadata.baseUrl.toString(),
}: ProductMetadataOptions): Metadata {
  const productUrl = `${baseUrl}/products/${product.handle}`;
  
  // Use featured image or first image from gallery
  const ogImage = product.image || product.images[0] || '/og/og_square.jpg';
  
  // Generate a rich description for SEO
  const description = product.seo.description || 
    product.shortDescription || 
    `${product.name} - ${product.hashrate || 'High-performance'} cryptocurrency miner with ${product.power || 'efficient power consumption'}. ${product.algorithm ? `Algorithm: ${product.algorithm}.` : ''} ${product.inStock ? 'In stock and ready to ship.' : 'Contact us for availability.'}`;

  // Extract brand from product for better SEO
  const brandName = product.brand || product.name.split(' ')[0] || 'Jhuangnyc';
  
  // Generate title with brand and key specs
  const title = product.seo.title || 
    `${product.name} - ${product.hashrate || 'Crypto Miner'} | ${brandName}`;

  // Structured keywords combining SEO keywords, tags, and specs
  const keywords = [
    ...product.seo.keywords,
    ...product.tags,
    product.brand,
    product.category,
    product.algorithm,
    'ASIC miner',
    'cryptocurrency mining',
    'mining hardware',
  ].filter(Boolean) as string[];

  return {
    title,
    description,
    keywords: Array.from(new Set(keywords)), // Remove duplicates
    alternates: {
      canonical: `/products/${product.handle}`,
    },
    openGraph: {
      type: 'website',
      url: productUrl,
      title,
      description,
      siteName: siteMetadata.siteName,
      locale: siteMetadata.locale,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 1200,
          alt: product.name,
        },
        // Add additional images from gallery
        ...product.images.slice(0, 3).map((img) => ({
          url: img,
          width: 1200,
          height: 1200,
          alt: `${product.name} - additional view`,
        })),
      ],
      // Product-specific OG tags
      ...(product.priceUSD && {
        // @ts-ignore - These are valid OG product tags
        'product:price:amount': product.priceUSD.toFixed(2),
        'product:price:currency': 'USD',
      }),
      ...(product.inStock && {
        // @ts-ignore
        'product:availability': 'in stock',
      }),
      ...(product.brand && {
        // @ts-ignore
        'product:brand': product.brand,
      }),
      ...(product.category && {
        // @ts-ignore
        'product:category': product.category,
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
      creator: siteMetadata.twitterHandle,
    },
    robots: {
      index: product.inStock, // Only index in-stock products
      follow: true,
    },
  };
}

/**
 * Generate metadata for collection/category pages
 */
export function generateCollectionMetadata(
  collectionName: string,
  description?: string,
  baseUrl?: string
): Metadata {
  const url = baseUrl || siteMetadata.baseUrl.toString();
  const collectionUrl = `${url}/collections/${collectionName.toLowerCase().replace(/\s+/g, '-')}`;

  return {
    title: `${collectionName} - Mining Hardware Collection`,
    description: description || `Browse our ${collectionName} collection of premium cryptocurrency mining hardware and ASIC miners.`,
    alternates: {
      canonical: `/collections/${collectionName.toLowerCase().replace(/\s+/g, '-')}`,
    },
    openGraph: {
      type: 'website',
      url: collectionUrl,
      title: `${collectionName} Collection`,
      description: description || `Explore ${collectionName} cryptocurrency mining hardware`,
      siteName: siteMetadata.siteName,
      images: [
        {
          url: '/og/og_square.jpg',
          width: 1200,
          height: 1200,
          alt: `${collectionName} Collection`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${collectionName} Collection`,
      description: description || `Explore ${collectionName} mining hardware`,
      images: ['/og/og_square.jpg'],
    },
  };
}

/**
 * Generate BreadcrumbList schema for product pages
 */
export function generateBreadcrumbSchema(
  product: DisplayProduct,
  baseUrl: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Products',
        item: `${baseUrl}/products`,
      },
      ...(product.category
        ? [
            {
              '@type': 'ListItem',
              position: 3,
              name: product.category,
              item: `${baseUrl}/collections/${product.category.toLowerCase().replace(/\s+/g, '-')}`,
            },
            {
              '@type': 'ListItem',
              position: 4,
              name: product.name,
              item: `${baseUrl}/products/${product.handle}`,
            },
          ]
        : [
            {
              '@type': 'ListItem',
              position: 3,
              name: product.name,
              item: `${baseUrl}/products/${product.handle}`,
            },
          ]),
    ],
  };
}
