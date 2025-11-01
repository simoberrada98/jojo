import type { MetadataRoute } from 'next'
import { siteMetadata } from '@/lib/seo/site-metadata'

export const revalidate = 86400 // 1 day

export default function robots(): MetadataRoute.Robots {
  const base = siteMetadata.baseUrl.toString().replace(/\/$/, '')

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/dashboard', '/api/']
      }
    ],
    sitemap: [`${base}/sitemap.xml`],
    host: base
  }
}
