import { NextResponse } from 'next/server';
import { fetchActiveProductsForSeo } from '@/lib/data/seo-products';
import { siteMetadata } from '@/lib/seo/site-metadata';
import { getExternalReviewSummary } from '@/lib/services/reviews/external-review.service';
import { logger } from '@/lib/utils/logger';
import {
  SUPPORTED_KEY_SET,
  formatCurrencyUSD,
  normalizeAvailability,
} from '@/lib/feeds/merchant/schema';
import { getGoogleCategoryPath } from '@/lib/taxonomy/google-taxonomy';
import type { SeoProduct } from '@/lib/data/seo-products';

// This route supports query-parameter filtering and reads request.url.
// Opt out of static rendering to avoid DynamicServerError during build.
// Caching is controlled via response headers below.
export const dynamic = 'force-dynamic';

const GOOGLE_NAMESPACE = 'xmlns:g="http://base.google.com/ns/1.0"';

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, '');
}

function isValidUrl(url: string): boolean {
  try {
    // Allow relative URLs to be normalized by caller; here validate only absolute
    const u = new URL(url);
    return Boolean(u.protocol && u.host);
  } catch {
    return false;
  }
}

function sanitizeDescription(raw: string): string {
  return stripHtml(raw).slice(0, 5000).trim();
}

type ReviewSummary = Awaited<
  ReturnType<typeof getExternalReviewSummary>
> | null;

function buildItemXml(
  product: SeoProduct,
  reviewSummary: ReviewSummary,
  baseUrl: string,
  channelUpdatedAt: string
) {
  // Validate required core fields; skip item if critical data is missing
  const missingCritical: string[] = [];
  if (!product?.id) missingCritical.push('id');
  if (!product?.slug) missingCritical.push('slug');
  if (typeof product?.base_price !== 'number')
    missingCritical.push('base_price');
  if (!product?.category) missingCritical.push('category');

  if (missingCritical.length) {
    logger.error('Skipping product due to missing critical fields', undefined, {
      productId: product?.id,
      slug: product?.slug,
      missingCritical,
    });
    return null;
  }

  const productUrl = `${baseUrl}/products/${product.slug}`;
  if (!isValidUrl(productUrl)) {
    logger.warn('Invalid product URL', { productUrl, productId: product.id });
  }

  const imageUrl = product.featured_image_url
    ? product.featured_image_url
    : `${baseUrl}/favicon.ico`;
  if (!isValidUrl(imageUrl)) {
    logger.warn('Invalid image URL', { imageUrl, productId: product.id });
  }

  const availability = normalizeAvailability(product.stock_quantity ?? 0);
  const description = sanitizeDescription(
    product.meta_description || product.description || siteMetadata.description
  );

  // Prepare key-value pairs and validate membership against supported schema
  const kv: Record<string, string> = {
    'g:id': String(product.id),
    'g:product_type': String(product.category),
    // Map Google Product Category using taxonomy resolver
    'g:google_product_category': getGoogleCategoryPath({
      product_type: product.category,
      category: product.category,
      tags: null,
    }),
    'g:brand': String(product.brand || 'MineHub'),
    'g:condition': 'new',
    ...(product.gtin ? { 'g:gtin': String(product.gtin) } : {}),
    'g:price': formatCurrencyUSD(product.base_price),
    ...(product.compare_at_price
      ? { 'g:sale_price': formatCurrencyUSD(product.compare_at_price) }
      : {}),
    'g:availability': availability,
    'g:image_link': imageUrl,
    'g:link': productUrl,
    'g:identifier_exists': product.gtin ? 'true' : 'false',
    'g:updated_time': channelUpdatedAt,
  };

  // Log any keys not in supported set (helps catch typos/outdated names)
  for (const k of Object.keys(kv)) {
    if (!SUPPORTED_KEY_SET.has(k)) {
      logger.warn('Unsupported merchant key detected', { key: k });
    }
  }

  // Compose XML
  const xmlParts: string[] = [];
  xmlParts.push('<item>');
  xmlParts.push(`<g:id>${escapeXml(kv['g:id'])}</g:id>`);
  xmlParts.push(
    `<title>${escapeXml(product.meta_title || product.name)}</title>`
  );
  xmlParts.push(`<link>${escapeXml(productUrl)}</link>`);
  xmlParts.push(`<description><![CDATA[${description}]]></description>`);
  xmlParts.push(
    `<g:product_type>${escapeXml(kv['g:product_type'])}</g:product_type>`
  );
  xmlParts.push(
    `<g:google_product_category>${escapeXml(
      kv['g:google_product_category']
    )}</g:google_product_category>`
  );
  xmlParts.push(`<g:brand>${escapeXml(kv['g:brand'])}</g:brand>`);
  xmlParts.push('<g:condition>new</g:condition>');
  if (product.gtin) {
    xmlParts.push(`<g:gtin>${escapeXml(String(product.gtin))}</g:gtin>`);
  }

  // Backward-compatible custom review attributes
  if (reviewSummary) {
    xmlParts.push(
      `<g:product_review_average>${reviewSummary.averageRating.toFixed(2)}</g:product_review_average>`
    );
    xmlParts.push(
      `<g:product_review_count>${String(reviewSummary.reviewCount)}</g:product_review_count>`
    );
    const snippet = reviewSummary?.reviews?.[0]?.comment;
    if (snippet) {
      xmlParts.push(
        `<g:product_review_snippet><![CDATA[${snippet.slice(0, 400)}]]></g:product_review_snippet>`
      );
    }
    if (reviewSummary?.sourceUrl) {
      xmlParts.push(
        `<g:product_review_source_link>${escapeXml(reviewSummary.sourceUrl)}</g:product_review_source_link>`
      );
    }
  }

  xmlParts.push(`<g:price>${kv['g:price']}</g:price>`);
  if (kv['g:sale_price']) {
    xmlParts.push(`<g:sale_price>${kv['g:sale_price']}</g:sale_price>`);
  }
  xmlParts.push(`<g:availability>${kv['g:availability']}</g:availability>`);
  xmlParts.push(
    `<g:image_link>${escapeXml(kv['g:image_link'])}</g:image_link>`
  );
  xmlParts.push(`<g:link>${escapeXml(kv['g:link'])}</g:link>`);
  xmlParts.push(
    `<g:identifier_exists>${kv['g:identifier_exists']}</g:identifier_exists>`
  );
  xmlParts.push(`<g:shipping>
    <g:country>US</g:country>
    <g:service>Standard</g:service>
    <g:price>0.00 USD</g:price>
  </g:shipping>`);
  xmlParts.push(`<g:updated_time>${kv['g:updated_time']}</g:updated_time>`);
  xmlParts.push('</item>');

  return xmlParts.join('\n');
}

export async function GET(request: Request) {
  try {
    const products = await fetchActiveProductsForSeo();
    const base = siteMetadata.baseUrl.toString().replace(/\/$/, '');
    const channelUpdatedAt = new Date().toUTCString();

    // Optional feed-level filters via query params (safe parsing)
    let qp: URLSearchParams;
    try {
      const url = new URL(request.url);
      qp = url.searchParams;
    } catch (err) {
      logger.warn(
        'Failed to parse request.url; proceeding without filters',
        err as Error
      );
      qp = new URLSearchParams();
    }
    const filterCategory = qp.get('category'); // e.g. "laptops"
    const filterAvailability = qp.get('availability'); // 'in stock' | 'out of stock'
    const priceMinRaw = qp.get('price_min');
    const priceMaxRaw = qp.get('price_max');
    const priceMin = priceMinRaw ? Number(priceMinRaw) : undefined;
    const priceMax = priceMaxRaw ? Number(priceMaxRaw) : undefined;

    // Validate numeric filters
    if (priceMinRaw && Number.isNaN(priceMin)) {
      logger.warn('Invalid price_min filter, ignoring', { priceMinRaw });
    }
    if (priceMaxRaw && Number.isNaN(priceMax)) {
      logger.warn('Invalid price_max filter, ignoring', { priceMaxRaw });
    }

    // Fetch reviews with simple concurrency limit to optimize performance
    const limit = Math.min(
      8,
      Math.max(2, Math.floor((products.length || 1) / 4))
    );
    async function mapWithConcurrency<T, R>(
      items: T[],
      worker: (item: T) => Promise<R>,
      concurrency: number
    ): Promise<R[]> {
      const results: R[] = new Array(items.length);
      let index = 0;
      const runners: Promise<void>[] = [];
      async function run() {
        while (index < items.length) {
          const current = index++;
          try {
            results[current] = await worker(items[current]);
          } catch (err) {
            logger.error('Review summary fetch failed', err as Error, {
              productIndex: current,
            });
            // Fallback: treat as no review summary
            results[current] = null as unknown as R;
          }
        }
      }
      for (let i = 0; i < concurrency; i++) {
        runners.push(run());
      }
      await Promise.all(runners);
      return results;
    }

    // Apply filters prior to review fetch to minimize calls
    const filteredProducts = products.filter((p: SeoProduct) => {
      // Category filter (match normalized category string)
      if (filterCategory) {
        const cat = String(p.category || '')
          .trim()
          .toLowerCase();
        if (cat !== filterCategory.trim().toLowerCase()) return false;
      }
      // Availability filter
      if (filterAvailability) {
        const avail = normalizeAvailability(p.stock_quantity ?? 0);
        if (avail !== filterAvailability.trim().toLowerCase()) return false;
      }
      // Price bounds
      if (typeof priceMin === 'number' && p.base_price < priceMin) return false;
      if (typeof priceMax === 'number' && p.base_price > priceMax) return false;
      return true;
    });

    const productsWithReviews = await mapWithConcurrency(
      filteredProducts,
      async (product) => ({
        product,
        reviewSummary: product.gtin
          ? await getExternalReviewSummary(product.gtin, {
              name: product.name,
              brand: product.brand ?? undefined,
            })
          : null,
      }),
      limit
    );

    const itemsXmlParts: string[] = [];
    let skippedCount = 0;

    for (const { product, reviewSummary } of productsWithReviews) {
      const item = buildItemXml(product, reviewSummary, base, channelUpdatedAt);
      if (item) {
        itemsXmlParts.push(item);
      } else {
        skippedCount++;
      }
    }

    if (skippedCount > 0) {
      logger.warn('Some products were skipped due to missing critical fields', {
        skippedCount,
      });
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" ${GOOGLE_NAMESPACE}>
  <channel>
    <title>${escapeXml(siteMetadata.title)}</title>
    <link>${escapeXml(base)}</link>
    <description>${escapeXml(siteMetadata.description)}</description>
    <lastBuildDate>${channelUpdatedAt}</lastBuildDate>
    ${itemsXmlParts.join('')}
  </channel>
</rss>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=0, s-maxage=3600',
      },
    });
  } catch (error) {
    logger.error('Failed to build merchant feed', error as Error);
    const base = siteMetadata.baseUrl.toString().replace(/\/$/, '');
    const channelUpdatedAt = new Date().toUTCString();
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" ${GOOGLE_NAMESPACE}>
  <channel>
    <title>${escapeXml(siteMetadata.title)}</title>
    <link>${escapeXml(base)}</link>
    <description>${escapeXml(siteMetadata.description)}</description>
    <lastBuildDate>${channelUpdatedAt}</lastBuildDate>
  </channel>
</rss>`;
    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=0, s-maxage=3600',
      },
    });
  }
}
