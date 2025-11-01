import type { MetadataRoute } from 'next'
import { siteMetadata } from '@/lib/seo/site-metadata'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteMetadata.name,
    short_name: 'Jhuangnyc',
    description: siteMetadata.description,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#020817',
    theme_color: '#0ea5e9',
    lang: 'en-US',
    orientation: 'portrait',
    icons: [
      {
        src: '/favicon.ico',
        sizes: '64x64 32x32 24x24 16x16',
        type: 'image/x-icon'
      }
    ]
  }
}
