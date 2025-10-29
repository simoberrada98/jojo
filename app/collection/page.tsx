"use client"

import { useState } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { ChevronRight, Filter } from "lucide-react"

const collections = [
  {
    id: "asic-miners",
    name: "ASIC Miners",
    description: "Professional ASIC mining hardware for Bitcoin and other cryptocurrencies",
    image: "/asic-mining-hardware-professional.jpg",
    productCount: 12,
    featured: true,
  },
  {
    id: "gpu-rigs",
    name: "GPU Mining Rigs",
    description: "High-performance GPU rigs for Ethereum and altcoin mining",
    image: "/gpu-mining-rig-graphics-cards.jpg",
    productCount: 8,
    featured: true,
  },
  {
    id: "compact-miners",
    name: "Compact Miners",
    description: "Space-efficient mining solutions for home and small operations",
    image: "/compact-mining-device-portable.jpg",
    productCount: 6,
    featured: false,
  },
  {
    id: "enterprise-solutions",
    name: "Enterprise Solutions",
    description: "Large-scale mining infrastructure and datacenter equipment",
    image: "/enterprise-mining-cluster-datacenter.jpg",
    productCount: 15,
    featured: true,
  },
  {
    id: "accessories",
    name: "Mining Accessories",
    description: "Power supplies, cooling systems, and mining accessories",
    image: "/mining-accessories-power-cooling.jpg",
    productCount: 24,
    featured: false,
  },
  {
    id: "software-tools",
    name: "Software & Tools",
    description: "Mining software, monitoring tools, and optimization utilities",
    image: "/mining-software-dashboard-tools.jpg",
    productCount: 10,
    featured: false,
  },
]

export default function CollectionPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filteredCollections = selectedCategory ? collections.filter((c) => c.id === selectedCategory) : collections

  return (
    <div className="min-h-screen bg-background">
      <Header />

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
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Mining Hardware Collections</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Explore our curated collections of mining hardware, from entry-level to enterprise-grade solutions
              </p>
            </div>

            {/* Filter Bar */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-accent" />
                <span className="text-sm font-medium text-foreground">Filter by Category</span>
              </div>
              {selectedCategory && (
                <Button variant="outline" size="sm" onClick={() => setSelectedCategory(null)} className="text-xs">
                  Clear Filter
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Collections Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCollections.map((collection) => (
              <div
                key={collection.id}
                className="group cursor-pointer"
                onClick={() => setSelectedCategory(collection.id)}
              >
                <div className="relative overflow-hidden rounded-lg mb-4 h-64 bg-card border border-border">
                  <img
                    src={collection.image || "/placeholder.svg"}
                    alt={collection.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {collection.featured && (
                    <div className="absolute top-4 right-4 bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-semibold">
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
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
