import type { DisplayProduct } from '../types/product'

export interface OrganizationSchema {
  '@context': 'https://schema.org'
  '@type': 'Organization'
  name: string
  url: string
  logo?: string
  description?: string
  address?: {
    '@type': 'PostalAddress'
    streetAddress?: string
    addressLocality?: string
    addressRegion?: string
    postalCode?: string
    addressCountry?: string
  }
  contactPoint?: {
    '@type': 'ContactPoint'
    contactType: string
    email?: string
    telephone?: string
  }
  sameAs?: string[]
}

export interface ProductSchema {
  '@context': 'https://schema.org'
  '@type': 'Product'
  name: string
  description: string
  image?: string
  sku?: string
  brand?: {
    '@type': 'Brand'
    name: string
  }
  offers: {
    '@type': 'Offer'
    url: string
    priceCurrency: string
    price: number
    priceValidUntil?: string
    availability: string
    itemCondition: string
  }
  aggregateRating?: {
    '@type': 'AggregateRating'
    ratingValue: number
    reviewCount: number
    bestRating: number
    worstRating: number
  }
  category?: string
}

export interface WebSiteSchema {
  '@context': 'https://schema.org'
  '@type': 'WebSite'
  name: string
  url: string
  description?: string
  potentialAction?: {
    '@type': 'SearchAction'
    target: {
      '@type': 'EntryPoint'
      urlTemplate: string
    }
    'query-input': string
  }
}

/**
 * Generate Organization schema for the site
 */
export function generateOrganizationSchema(
  baseUrl: string
): OrganizationSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Jhuangnyc',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description:
      'Premium cryptocurrency mining hardware store offering ASIC miners, GPU rigs, and enterprise solutions with crypto payment support.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '26 Laurel Ave',
      addressLocality: 'East Islip',
      addressRegion: 'NY',
      postalCode: '11730',
      addressCountry: 'US'
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'contact@jhuangnyc.com',
      telephone: '+1-631-224-3534'
    }
  }
}

/**
 * Generate Product schema from Product data
 */
export function generateProductSchema(
  product: DisplayProduct,
  baseUrl: string,
  currency: string = 'USD'
): ProductSchema {
  const productUrl = `${baseUrl}/product/${product.handle}`

  // Calculate price valid until (1 year from now)
  const priceValidUntil = new Date()
  priceValidUntil.setFullYear(priceValidUntil.getFullYear() + 1)

  // Extract brand from product name (e.g., "Bitmain Antminer S19" -> "Bitmain")
  const brandName = product.name.split(' ')[0] || 'Jhuangnyc'

  const schema: ProductSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: `${product.name} - ${product.hashrate} hashrate, ${
      product.power
    } power consumption. ${product.specs.join('. ')}`,
    sku: product.id.toString(),
    brand: {
      '@type': 'Brand',
      name: brandName
    },
    category: product.category,
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: currency,
      price: product.priceUSD,
      priceValidUntil: priceValidUntil.toISOString().split('T')[0],
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition'
    }
  }

  // Add aggregate rating if available
  if (product.rating && product.reviews) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviews,
      bestRating: 5,
      worstRating: 1
    }
  }

  return schema
}

/**
 * Generate WebSite schema
 */
export function generateWebSiteSchema(baseUrl: string): WebSiteSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Jhuangnyc - Crypto Mining Hardware Store',
    url: baseUrl,
    description:
      'Premium mining hardware with crypto payment support. ASIC miners, GPU rigs, and enterprise solutions.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/collection?search={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  }
}

/**
 * Helper to serialize schema to JSON-LD script tag
 */
export function serializeSchema(schema: Record<string, any>): string {
  return JSON.stringify(schema, null, 2)
}
