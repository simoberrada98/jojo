import type { DisplayProduct } from '@/types/product';

export interface OrganizationSchema {
  [key: string]: unknown; // Add index signature
  '@context': 'https://schema.org';
  '@type': 'Organization';
  name: string;
  url: string;
  logo?: string;
  description?: string;
  address?: {
    '@type': 'PostalAddress';
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
  contactPoint?: {
    '@type': 'ContactPoint';
    contactType: string;
    email?: string;
    telephone?: string;
  };
  sameAs?: string[];
}

export interface ProductSchema {
  [key: string]: unknown; // Add index signature
  '@context': 'https://schema.org';
  '@type': 'Product';
  name: string;
  description: string;
  image?: string | string[];
  sku?: string;
  brand?: {
    '@type': 'Brand';
    name: string;
  };
  offers: {
    '@type': 'Offer';
    url: string;
    priceCurrency: string;
    price: string;
    priceValidUntil?: string;
    availability: string;
    itemCondition: string;
    inventoryLevel?: {
      '@type': 'QuantitativeValue';
      value: number;
      unitCode?: string;
    };
  };
  aggregateRating?: {
    '@type': 'AggregateRating';
    ratingValue: number;
    reviewCount: number;
    bestRating: number;
    worstRating: number;
  };
  category?: string;
  additionalProperty?: Array<{
    '@type': 'PropertyValue';
    name: string;
    value: string | number;
  }>;
  url?: string;
}

type SpecName = 'Algorithm' | 'Hashrate' | 'Power' | 'Efficiency' | 'Noise';

const SPEC_REGEXPS: Record<SpecName, RegExp[]> = {
  Algorithm: [/algorithm[:\s-]*([A-Za-z0-9\/\-\s]+)/i],
  Hashrate: [
    /hash(?:rate)?[:\s-]*([0-9.,]+\s?(?:[kKmMgGtT]?(?:h|H)\/s|[kKmMgGtT]H))/,
    /([0-9.,]+\s?(?:TH|GH|MH|KH|PH)\/s)/i,
  ],
  Power: [
    /power(?: consumption)?[:\s-]*([0-9.,]+\s?(?:W|kW))/i,
    /([0-9.,]+\s?(?:W|kW))\s?(?:draw|input)/i,
  ],
  Efficiency: [
    /efficiency[:\s-]*([0-9.,]+\s?(?:J\/TH|W\/TH|GH\/W))/i,
    /([0-9.,]+\s?(?:J\/TH|W\/TH|GH\/W))/i,
  ],
  Noise: [
    /(noise|sound|acoustic)[^0-9]{0,12}([0-9]{2,3}\s?(?:dB|DB))/i,
    /([0-9]{2,3})\s?(?:dB|DB)/i,
  ],
};

function stripHtml(value: string | null | undefined): string {
  if (!value) {
    return '';
  }
  return value.replace(/<[^>]+>/g, ' ');
}

function normaliseSpecValue(
  name: SpecName,
  raw: string | null | undefined
): string {
  if (!raw) {
    return 'Not specified';
  }

  const value = raw.trim();
  if (!value) {
    return 'Not specified';
  }

  switch (name) {
    case 'Hashrate':
      return value
        .replace(/ths?/i, 'TH/s')
        .replace(/ghs?/i, 'GH/s')
        .replace(/mhs?/i, 'MH/s')
        .replace(/khs?/i, 'KH/s')
        .replace(/phs?/i, 'PH/s')
        .replace(/\s{2,}/g, ' ');
    case 'Power':
      return value.replace(/\s?w$/i, ' W').replace(/\s{2,}/g, ' ');
    case 'Efficiency':
      return value.toUpperCase();
    case 'Noise':
      return value.replace(/\s?(dB|DB)/, ' dB');
    default:
      return value;
  }
}

function inferSpecFromText(
  name: SpecName,
  textCorpus: string,
  fallback: string | null | undefined
): string {
  for (const pattern of SPEC_REGEXPS[name]) {
    const match = pattern.exec(textCorpus);
    if (match) {
      const candidate = match[2] ?? match[1];
      if (candidate) {
        return normaliseSpecValue(name, candidate);
      }
    }
  }

  return normaliseSpecValue(name, fallback);
}

function buildAdditionalProperties(
  product?: DisplayProduct | null
): Array<{ '@type': 'PropertyValue'; name: SpecName; value: string }> {
  if (!product) {
    return (
      ['Algorithm', 'Hashrate', 'Power', 'Efficiency', 'Noise'] as const
    ).map((name) => ({
      '@type': 'PropertyValue' as const,
      name,
      value: 'Not specified',
    }));
  }

  const toStringArray = (value: unknown): string[] =>
    Array.isArray(value)
      ? value.filter((item): item is string => typeof item === 'string')
      : [];
  const safeSpecs = toStringArray(product.specs);
  const safeFeatures = toStringArray(product.features);

  const textCorpus = [
    product.algorithm,
    product.hashrate,
    product.power,
    product.efficiency,
    product.shortDescription,
    ...safeSpecs,
    ...safeFeatures,
    stripHtml(product.description),
  ]
    .filter(Boolean)
    .join('\n');

  const specFallback: Record<SpecName, string | undefined> = {
    Algorithm: product.algorithm || undefined,
    Hashrate: product.hashrate || undefined,
    Power: product.power || undefined,
    Efficiency: product.efficiency || undefined,
    Noise: undefined,
  };

  return (
    ['Algorithm', 'Hashrate', 'Power', 'Efficiency', 'Noise'] as SpecName[]
  ).map((name) => ({
    '@type': 'PropertyValue' as const,
    name,
    value: inferSpecFromText(name, textCorpus, specFallback[name]),
  }));
}

export interface WebSiteSchema {
  [key: string]: unknown; // Add index signature
  '@context': 'https://schema.org';
  '@type': 'WebSite';
  name: string;
  url: string;
  description?: string;
  potentialAction?: {
    '@type': 'SearchAction';
    target: {
      '@type': 'EntryPoint';
      urlTemplate: string;
    };
    'query-input': string;
  };
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
      'Premium cryptocurrency mining hardware store offering ASIC products, GPU rigs, and enterprise solutions with crypto payment support.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '26 Laurel Ave',
      addressLocality: 'East Islip',
      addressRegion: 'NY',
      postalCode: '11730',
      addressCountry: 'US',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'contact@jhuangnyc.com',
      telephone: '+1-631-224-3534',
    },
  };
}

/**
 * Generate Product schema from Product data
 */
export function generateProductSchema(
  product: DisplayProduct | null | undefined,
  baseUrl: string,
  currency: string = 'USD'
): ProductSchema {
  const hasHandle =
    typeof product?.handle === 'string' && product.handle.length > 0;
  const productUrl = hasHandle
    ? `${baseUrl}/products/${product!.handle}`
    : `${baseUrl}/products`;

  // Calculate price valid until (1 year from now)
  const priceValidUntil = new Date();
  priceValidUntil.setFullYear(priceValidUntil.getFullYear() + 1);

  // Extract brand from product name (e.g., "Bitmain Antminer S19" -> "Bitmain")
  const safeName = (product?.name || '').toString();
  const brandName = (
    safeName.split(' ')[0] ||
    product?.brand ||
    'Jhuangnyc'
  ).toString();
  const imageSet =
    product?.images?.length && product.images.some(Boolean)
      ? product.images.filter(Boolean)
      : product?.image
        ? [product.image]
        : undefined;
  const availability = product?.inStock
    ? 'https://schema.org/InStock'
    : 'https://schema.org/OutOfStock';
  const additionalProperty = buildAdditionalProperties(product);
  const specLookup = Object.fromEntries(
    additionalProperty.map((property) => [property.name, property.value])
  ) as Record<SpecName, string>;

  const schema: ProductSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: safeName || 'Unknown Product',
    url: productUrl,
    description: `${safeName || 'This product'} with ${
      specLookup.Hashrate ?? 'not specified hashrate'
    }, ${specLookup.Power ?? 'not specified power draw'}, and ${
      specLookup.Efficiency ?? 'efficiency data pending'
    }. Algorithm: ${specLookup.Algorithm ?? 'unspecified'}. Acoustic profile: ${
      specLookup.Noise ?? 'not specified'
    }.`,
    image: imageSet,
    sku: String(product?.id ?? 'unknown'),
    brand: {
      '@type': 'Brand',
      name: brandName,
    },
    category: product?.category,
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: currency,
      price: (product?.priceUSD ?? 0).toFixed(2),
      priceValidUntil: priceValidUntil.toISOString().split('T')[0],
      availability,
      itemCondition: 'https://schema.org/NewCondition',
      inventoryLevel:
        typeof product?.stock === 'number'
          ? {
              '@type': 'QuantitativeValue',
              value: product!.stock,
              unitCode: 'EA',
            }
          : undefined,
    },
    additionalProperty,
  };

  // Add aggregate rating if available
  if (product?.rating && (product?.reviewCount ?? 0) > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount!,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return schema;
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
      'Premium mining hardware with crypto payment support. ASIC products, GPU rigs, and enterprise solutions.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/collection?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Helper to serialize schema to JSON-LD script tag
 */
export function serializeSchema(schema: Record<string, unknown>): string {
  return JSON.stringify(schema, null, 2);
}
