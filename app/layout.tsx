import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { Toaster } from 'sonner';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { CurrencyProvider } from '@/lib/contexts/currency-context';
import { AuthProvider } from '@/lib/contexts/auth-context';
import { CartProvider } from '@/lib/contexts/cart-context';
import { siteMetadata } from '@/lib/seo/site-metadata';
import { getCookieConsentStatus } from '@/lib/cookies/preferences';
import { CookieBanner } from '@/components/cookie-banner';
import { ServiceWorkerProvider } from '@/components/service-worker-provider';
import { ReactNode } from 'react';
import { WebVitals } from '@/components/web-vitals';
import { ErrorBoundary } from '@/components/error-boundary';
import { env } from '@/lib/config/env';
import './globals.css';

// Preload fonts with modern font-display
const bodyTextFont = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
  fallback: ['system-ui', 'sans-serif'],
});

const technicalSpecsNumbersFont = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
  preload: true,
  fallback: ['monospace'],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  colorScheme: 'light dark',
  viewportFit: 'cover',
};

// Optimized background styles with reduced paint complexity
const gridOverlayStyle = {
  backgroundImage: `
    linear-gradient(
      to right,
      rgba(102, 204, 255, 0.05) 1px,
      transparent 1px
    ),
    linear-gradient(
      to bottom,
      rgba(102, 204, 255, 0.05) 1px,
      transparent 1px
    )
  `,
  backgroundSize: '50px 50px',
  backgroundPosition: '-1px -1px',
  willChange: 'background-position',
};

const glowOverlayStyle = {
  backgroundImage: `
    radial-gradient(
      circle at 25% 20%,
      rgba(56, 189, 248, 0.2) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 75% 80%,
      rgba(147, 51, 234, 0.15) 0%,
      transparent 50%
    )
  `,
  willChange: 'opacity',
};

// Performance-optimized metadata
export const metadata: Metadata = {
  metadataBase: new URL(siteMetadata.baseUrl),
  title: {
    default: siteMetadata.title,
    template: `%s | ${siteMetadata.siteName}`,
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
      'en-US': '/',
    },
  },
  formatDetection: {
    telephone: true,
    date: true,
    address: true,
    email: true,
    url: true,
  },
  openGraph: {
    type: 'website',
    locale: siteMetadata.locale,
    url: siteMetadata.baseUrl.toString(),
    title: siteMetadata.title,
    description: siteMetadata.description,
    siteName: siteMetadata.siteName,
    images: [
      {
        url: '/og/og_square.jpg',
        width: 1200,
        height: 1200,
        alt: siteMetadata.title,
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
  twitter: {
    card: 'summary_large_image',
    creator: siteMetadata.twitterHandle,
    title: siteMetadata.title,
    description: siteMetadata.description,
    images: ['/og/og_square.jpg'],
  },
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [{ url: '/favicon-96x96.png' }],
    apple: [{ url: '/apple-touch-icon.png' }],
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'link rel="preconnect" href="https://fonts.googleapis.com"': '',
    'link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"':
      '',
  },
  verification: {
    google: env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const cookieConsent = await getCookieConsentStatus();

  return (
    <html
      lang="en"
      className={`${bodyTextFont.variable} ${technicalSpecsNumbersFont.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <head>
        <meta charSet="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, viewport-fit=cover"
        />
        <meta name="theme-color" content="#ffffff" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-background min-h-screen font-sans antialiased">
        <ErrorBoundary>
          <AuthProvider>
            <CartProvider>
              <CurrencyProvider>
                <ServiceWorkerProvider />
                <div
                  className="-z-10 fixed inset-0"
                  style={{ content: ' ', ...gridOverlayStyle }}
                />
                <div
                  className="-z-20 fixed inset-0"
                  style={{ content: ' ', ...glowOverlayStyle }}
                />

                <div className="mx-auto px-4 sm:px-6 lg:px-8 container">
                  {children}
                </div>

                <Toaster position="top-center" />
                <Analytics />
                <SpeedInsights />
                <WebVitals />
                <CookieBanner initialStatus={cookieConsent} />
              </CurrencyProvider>
            </CartProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
