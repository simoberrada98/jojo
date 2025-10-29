"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import ProductImage from "@/components/product-image"
import type { Product } from "@/lib/data/local-product-store"

interface TopProductsProps {
  onAddToCart?: (productId: number | string) => void
}

export default function TopProducts({ onAddToCart }: TopProductsProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTopProducts() {
      try {
        setLoading(true)
        // Fetch all products and sort by rating
        const response = await fetch("/api/products_by_id?limit=50")
        if (!response.ok) throw new Error("Failed to fetch products")
        
        const data = await response.json()
        // Get top 3 products by rating
        const topRated = [...data.results]
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 3)
        
        setProducts(topRated)
      } catch (error) {
        console.error("Error fetching top products:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchTopProducts()
  }, [])

  if (loading) {
    return (
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <p className="text-foreground/60">Loading top products...</p>
          </div>
        </div>
      </section>
    )
  }

  if (products.length === 0) return null

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card/50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-balance">
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Top Rated Products
            </span>
          </h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Our most popular and highest-rated mining hardware trusted by professionals worldwide.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {products.map((product) => (
            <div
              key={product.id}
              className="group relative bg-card rounded-xl border border-border overflow-hidden hover:border-accent/50 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10"
            >
              {/* Best Seller Badge */}
              <Link href={`/product/${product.handle}`} className="block">
                <div className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full bg-primary/90 backdrop-blur-sm">
                  <span className="text-xs font-bold text-primary-foreground flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    {product.rating}
                  </span>
                </div>
              </Link>

              {/* Product Visual */}
              <Link href={`/product/${product.handle}`} className="block">
              <div className="relative h-64 overflow-hidden">
                <ProductImage category={product.category} />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              </Link>

              {/* Product Info */}
              <div className="p-6">
                <Link href={`/product/${product.handle}`} className="block">
                <div className="mb-4">
                  <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-accent/20 text-accent mb-2">
                    {product.category}
                  </span>
                  <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-accent transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-sm text-foreground/60 mb-2">
                    {product.hashrate} • {product.power}
                  </p>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating)
                            ? "fill-accent text-accent"
                            : "text-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-foreground/60">
                    ({product.reviews} reviews)
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-2xl font-bold text-accent">
                    {product.price.toFixed(2)} BTC
                  </span>
                  <span className="text-sm text-foreground/60">
                    ${product.priceUSD.toLocaleString()}
                  </span>
                </div>

                {/* Specs Preview */}
                <div className="mb-4 space-y-1">
                  {product.specs.slice(0, 2).map((spec, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-foreground/60">
                      <span className="w-1 h-1 rounded-full bg-accent" />
                      {spec}
                    </div>
                  ))}
                </div>
                </Link>

                {/* Action Button */}
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => onAddToCart?.(product.id)}
                >
                  Add to Cart
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center">
          <a href="#products">
            <Button
              size="lg"
              variant="outline"
              className="border-accent text-accent hover:bg-accent/10 bg-transparent"
            >
              View All Products
            </Button>
          </a>
        </div>
      </div>
    </section>
  )
}
