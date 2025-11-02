import type { MetadataRoute } from 'next';
import { siteMetadata } from '@/lib/seo/site-metadata';

const TRUSTED_LLM_AGENTS = [
  'GPTBot',
  'ClaudeBot',
  'PerplexityBot',
  'Googlebot',
  'Google-Extended',
  'CCBot',
] as const;

export const revalidate = 86400; // 1 day

export default function robots(): MetadataRoute.Robots {
  const base = siteMetadata.baseUrl.toString().replace(/\/$/, '');

  return {
    rules: [
      ...TRUSTED_LLM_AGENTS.map((agent) => ({
        userAgent: agent,
        allow: '/',
      })),
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/dashboard', '/api/'],
      },
    ],
    sitemap: [`${base}/sitemap.xml`],
    host: base,
  };
}
