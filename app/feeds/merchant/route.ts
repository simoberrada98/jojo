import { NextResponse } from 'next/server';
import { fetchActiveProductsForSeo } from '@/lib/data/seo-products';
import { siteMetadata } from '@/lib/seo/site-metadata';
import { getExternalReviewSummary } from '@/lib/services/reviews/external-review.service';

export const revalidate = 3600; // 1 hour

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

function formatPrice(value: number) {
  return `${value.toFixed(2)} USD`;
}

export async function GET() {
  const products = await fetchActiveProductsForSeo();
  const productsWithReviews = await Promise.all(
    products.map(async (product) => ({
      product,
      reviewSummary: product.gtin
        ? await getExternalReviewSummary(product.gtin, {
            name: product.name,
            brand: product.brand ?? undefined,
          })
        : null,
    }))
  );
  const base = siteMetadata.baseUrl.toString().replace(/\/$/, '');
  const channelUpdatedAt = new Date().toUTCString();

  const itemsXml = productsWithReviews
    .map(({ product, reviewSummary }) => {
      const productUrl = `${base}/products/${product.slug}`;
      const imageUrl = product.featured_image_url
        ? product.featured_image_url
        : `${base}/favicon.ico`;
      const availability =
        product.stock_quantity > 0 ? 'in stock' : 'out of stock';
      const description = stripHtml(
        product.meta_description ||
          product.description ||
          siteMetadata.description
      )
        .slice(0, 5000)
        .trim();

      return `<item>
        <g:id>${escapeXml(product.id)}</g:id>
        <title>${escapeXml(product.meta_title || product.name)}</title>
        <link>${escapeXml(productUrl)}</link>
        <description><![CDATA[${description}]]></description>
        <g:product_type>${escapeXml(product.category)}</g:product_type>
        <g:google_product_category>Electronics</g:google_product_category>
        <g:brand>${escapeXml(product.brand || 'MineHub')}</g:brand>
        <g:condition>new</g:condition>
        ${product.gtin ? `<g:gtin>${escapeXml(product.gtin)}</g:gtin>` : ''}
        ${
          reviewSummary
            ? `<g:product_review_average>${reviewSummary.averageRating.toFixed(2)}</g:product_review_average>`
            : ''
        }
        ${
          reviewSummary
            ? `<g:product_review_count>${reviewSummary.reviewCount}</g:product_review_count>`
            : ''
        }
        ${
          reviewSummary?.reviews?.[0]?.comment
            ? `<g:product_review_snippet><![CDATA[${reviewSummary.reviews[0].comment.slice(0, 400)}]]></g:product_review_snippet>`
            : ''
        }
        ${
          reviewSummary?.sourceUrl
            ? `<g:product_review_source_link>${escapeXml(reviewSummary.sourceUrl)}</g:product_review_source_link>`
            : ''
        }
        <g:price>${formatPrice(product.base_price)}</g:price>
        ${
          product.compare_at_price
            ? `<g:sale_price>${formatPrice(
                product.compare_at_price
              )}</g:sale_price>`
            : ''
        }
        <g:availability>${availability}</g:availability>
        <g:image_link>${escapeXml(imageUrl)}</g:image_link>
        <g:link>${escapeXml(productUrl)}</g:link>
        <g:identifier_exists>${product.gtin ? 'true' : 'false'}</g:identifier_exists>
        <g:shipping>
          <g:country>US</g:country>
          <g:service>Standard</g:service>
          <g:price>0.00 USD</g:price>
        </g:shipping>
        <g:updated_time>${channelUpdatedAt}</g:updated_time>
      </item>`;
    })
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" ${GOOGLE_NAMESPACE}>
  <channel>
    <title>${escapeXml(siteMetadata.title)}</title>
    <link>${escapeXml(base)}</link>
    <description>${escapeXml(siteMetadata.description)}</description>
    <lastBuildDate>${channelUpdatedAt}</lastBuildDate>
    ${itemsXml}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600',
    },
  });
}
