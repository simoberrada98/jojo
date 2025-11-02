import type { MetadataRoute } from 'next';
import { fetchActiveProductsForSeo } from '@/lib/data/seo-products';
import { siteMetadata } from '@/lib/seo/site-metadata';

type StaticEntry = {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority: number;
};

const STATIC_ENTRIES: StaticEntry[] = [
  { path: '/', changeFrequency: 'daily', priority: 1 },
  { path: '/miners', changeFrequency: 'daily', priority: 0.9 },
  { path: '/categories', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/miners/specs', changeFrequency: 'weekly', priority: 0.8 },
  {
    path: '/guides/asic-buying-guide',
    changeFrequency: 'monthly',
    priority: 0.7,
  },
  { path: '/policies/warranty', changeFrequency: 'yearly', priority: 0.4 },
  { path: '/policies/returns', changeFrequency: 'yearly', priority: 0.4 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/learn-more', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/contact', changeFrequency: 'monthly', priority: 0.6 },
];

export const revalidate = 3600; // 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteMetadata.baseUrl.toString().replace(/\/$/, '');
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = STATIC_ENTRIES.map(
    ({ path, changeFrequency, priority }) => ({
      url: `${base}${path}`,
      lastModified: now,
      changeFrequency,
      priority,
    })
  );

  const products = await fetchActiveProductsForSeo();

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => {
    const updatedAt = product.updated_at ? new Date(product.updated_at) : now;

    return {
      url: `${base}/miners/${product.slug}`,
      lastModified: updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    };
  });

  return [...staticRoutes, ...productRoutes];
}
