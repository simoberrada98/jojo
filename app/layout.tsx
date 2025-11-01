import type React from 'react'
import type { CSSProperties } from 'react'
import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import { CurrencyProvider } from '@/lib/contexts/currency-context'
import { AuthProvider } from '@/lib/contexts/auth-context'
import { CartProvider } from '@/lib/contexts/cart-context'
import {
  generateOrganizationSchema,
  generateWebSiteSchema,
  serializeSchema
} from '@/lib/schema'
import { siteMetadata } from '@/lib/seo/site-metadata'
import { getCookieConsentStatus } from '@/lib/cookies/preferences'
import { CookieBanner } from '@/components/cookie-banner'
import { ServiceWorkerProvider } from '@/components/service-worker-provider'
import './globals.css'
import Link from 'next/link'
import { env } from '@/lib/config/env'
import { SpeedInsights } from '@vercel/speed-insights/next'

// Modern, professional font for body text
const bodyTextFont = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
})

// Monospace font for technical specs and numbers
const technicalSpecsNumbersFont = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap'
})

const gridOverlayStyle: CSSProperties = {
  backgroundImage: `
    linear-gradient(
      0deg,
      transparent 24%,
      rgba(102, 204, 255, 0.05) 25%,
      rgba(102, 204, 255, 0.05) 26%,
      transparent 27%,
      transparent 74%,
      rgba(102, 204, 255, 0.05) 75%,
      rgba(102, 204, 255, 0.05) 76%,
      transparent 77%,
      transparent
    ),
    linear-gradient(
      90deg,
      transparent 24%,
      rgba(102, 204, 255, 0.05) 25%,
      rgba(102, 204, 255, 0.05) 26%,
      transparent 27%,
      transparent 74%,
      rgba(102, 204, 255, 0.05) 75%,
      rgba(102, 204, 255, 0.05) 76%,
      transparent 77%,
      transparent
    )
  `,
  backgroundSize: '50px 50px'
}

const glowOverlayStyle: CSSProperties = {
  background: `
    radial-gradient(
      circle at 25% 20%,
      rgba(56, 189, 248, 0.35),
      transparent 55%
    ),
    radial-gradient(
      circle at 75% 80%,
      rgba(147, 51, 234, 0.3),
      transparent 60%
    )
  `
}

export const metadata: Metadata = {
  metadataBase: siteMetadata.baseUrl,
  title: {
    default: siteMetadata.title,
    template: `%s | ${siteMetadata.siteName}`
  },
  description: siteMetadata.description,
  applicationName: siteMetadata.name,
  keywords: siteMetadata.keywords,
  category: siteMetadata.category,
  authors: [{ name: siteMetadata.creator }],
  publisher: siteMetadata.publisher,
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/'
    }
  },
  openGraph: {
    type: 'website',
    locale: siteMetadata.locale,
    url: siteMetadata.baseUrl.toString(),
    title: siteMetadata.title,
    description: siteMetadata.description,
    siteName: siteMetadata.siteName
  },
  robots: {
    index: true,
    follow: true
  },
  twitter: {
    card: 'summary_large_image',
    creator: siteMetadata.twitterHandle,
    title: siteMetadata.title,
    description: siteMetadata.description
  },
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [{ url: '/favicon-96x96.png' }],
    apple: [{ url: '/apple-touch-icon.png' }]
  },
  verification: {
    google: env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined
  }
}

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieConsent = await getCookieConsentStatus()
  // Get base URL - use environment variable or fallback
  const baseUrl = env.NEXT_PUBLIC_BASE_URL || 'https://jhuangnyc.com'

  // Generate Schema.org structured data
  const organizationSchema = generateOrganizationSchema(baseUrl)
  const websiteSchema = generateWebSiteSchema(baseUrl)

  return (
    <html
      lang='en'
      className={`${bodyTextFont.variable} ${technicalSpecsNumbersFont.variable}`}
    >
      <head>
        <link
          rel='icon'
          type='image/png'
          href='/favicon-96x96.png'
          sizes='96x96'
        />
        <link rel='icon' type='image/svg+xml' href='/favicon.svg' />
        <link rel='shortcut icon' href='/favicon.ico' />
        <link
          rel='apple-touch-icon'
          sizes='180x180'
          href='/apple-touch-icon.png'
        />
        <meta name='apple-mobile-web-app-title' content='JhuangNYC' />
        <link rel='manifest' href='/site.webmanifest' />
        {/* Schema.org Organization markup */}
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: serializeSchema(organizationSchema)
          }}
        />
        {/* Schema.org WebSite markup */}
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: serializeSchema(websiteSchema)
          }}
        />
      </head>
      <body className='relative bg-background overflow-x-hidden font-sans antialiased'>
        <div
          aria-hidden
          className='z-0 fixed inset-0 overflow-hidden pointer-events-none'
        >
          <div className='absolute inset-0 bg-linear-to-b from-primary/25 via-background/85 to-background' />
          <div
            className='absolute inset-0 opacity-10'
            style={gridOverlayStyle}
          />
          <div
            className='absolute inset-0 opacity-40 transition-transform duration-500 ease-out mix-blend-screen'
            style={glowOverlayStyle}
          />
          <div className='-top-32 -left-24 absolute bg-primary/20 blur-3xl rounded-full w-[420px] h-[420px]' />
          <div className='right-[-180px] bottom-[-260px] absolute bg-accent/25 blur-3xl rounded-full w-[520px] h-[520px]' />
        </div>
        <div className='z-10 relative flex flex-col min-h-screen'>
          {/* Skip to main content link for accessibility */}
          <Link
            href='#main-content'
            className='sr-only focus:not-sr-only focus:top-0 focus:left-0 focus:z-50 focus:absolute focus:bg-primary focus:p-4 focus:text-primary-foreground'
          >
            Skip to main content
          </Link>
          <AuthProvider>
            <CurrencyProvider>
              <CartProvider>
                <main id='main-content' className='flex-1' role='main'>
                  {children}
                </main>
              </CartProvider>
            </CurrencyProvider>
          </AuthProvider>
          <Toaster />
          <ServiceWorkerProvider />
          <CookieBanner initialStatus={cookieConsent} />
          <Analytics />
          <SpeedInsights />
        </div>
      </body>
    </html>
  )
}
