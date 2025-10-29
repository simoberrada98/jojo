"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import ProductImage from "@/components/product-image"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"

const collections = [
  {
    id: "asic-miners",
    name: "ASIC Miners",
    category: "ASIC",
    description: "Professional ASIC mining hardware for Bitcoin and other cryptocurrencies",
    productCount: 12,
    featured: true,
  },
  {
    id: "gpu-rigs",
    name: "GPU Mining Rigs",
    category: "GPU",
    description: "High-performance GPU rigs for Ethereum and altcoin mining",
    productCount: 8,
    featured: true,
  },
  {
    id: "compact-miners",
    name: "Compact Miners",
    category: "Compact",
    description: "Space-efficient mining solutions for home and small operations",
    productCount: 6,
    featured: false,
  },
  {
    id: "enterprise-solutions",
    name: "Enterprise Solutions",
    category: "Enterprise",
    description: "Large-scale mining infrastructure and datacenter equipment",
    productCount: 15,
    featured: true,
  },
  {
    id: "accessories",
    name: "Mining Accessories",
    category: "ASIC",
    description: "Power supplies, cooling systems, and mining accessories",
    productCount: 24,
    featured: false,
  },
  {
    id: "software-tools",
    name: "Software & Tools",
    category: "GPU",
    description: "Mining software, monitoring tools, and optimization utilities",
    productCount: 10,
    featured: false,
  },
]

export default function CollectionPage() {
  const router = useRouter()
  const [cartCount, setCartCount] = useState(0)

  return (
    <div className="min-h-screen bg-background">
      <Header cartCount={cartCount} />

      <main className="pt-20">
        {/* Breadcrumb */}
        <div className="border-b border-border bg-card/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-2 text-sm">
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground font-medium">Collections</span>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <section className="bg-gradient-to-b from-card/50 to-background py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Mining Hardware Collections</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Explore our curated collections of mining hardware, from entry-level to enterprise-grade solutions
              </p>
            </div>
          </div>
        </section>

        {/* Collections Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection) => (
              <Link
                key={collection.id}
                href="/#products"
                className="group block"
              >
                <div className="relative overflow-hidden rounded-lg mb-4 h-64 border border-border group-hover:border-accent transition-all duration-300">
                  <div className="group-hover:scale-105 transition-transform duration-500 h-full">
                    <ProductImage category={collection.category} />
                  </div>
                  {collection.featured && (
                    <div className="absolute top-4 right-4 bg-accent/90 backdrop-blur-sm text-accent-foreground px-3 py-1 rounded-full text-xs font-semibold z-10">
                      Featured
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-accent transition-colors">
                  {collection.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">{collection.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-accent">{collection.productCount} Products</span>
                  <Button variant="ghost" size="sm" className="text-accent hover:text-accent hover:bg-accent/10">
                    Explore →
                  </Button>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
