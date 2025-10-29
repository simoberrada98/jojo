import type React from "react"
import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "sonner"
import { CurrencyProvider } from "@/lib/contexts/currency-context"
import { AuthProvider } from "@/lib/contexts/auth-context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { generateOrganizationSchema, generateWebSiteSchema, serializeSchema } from "@/lib/schema"
import "./globals.css"

// Modern, professional font for body text
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

// Monospace font for technical specs and numbers
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
})


export const metadata: Metadata = {
  title: "MineHub - Crypto Mining Hardware Store",
  description: "Premium mining hardware with crypto payment support. ASIC miners, GPU rigs, and enterprise solutions.",

}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Get base URL - use environment variable or fallback
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://minehub.com"
  
  // Generate Schema.org structured data
  const organizationSchema = generateOrganizationSchema(baseUrl)
  const websiteSchema = generateWebSiteSchema(baseUrl)

  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        {/* Schema.org Organization markup */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeSchema(organizationSchema),
          }}
        />
        {/* Schema.org WebSite markup */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeSchema(websiteSchema),
          }}
        />
      </head>
      <body className="font-sans antialiased">
        {/* Skip to main content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-primary focus:text-primary-foreground focus:top-0 focus:left-0"
        >
          Skip to main content
        </a>
        <AuthProvider>
          <CurrencyProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main id="main-content" className="flex-1" role="main">
                {children}
              </main>
              <Footer />
            </div>
          </CurrencyProvider>
        </AuthProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
