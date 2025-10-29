"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Star, Zap, Cpu, Shield, ArrowLeft, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import Header from "@/components/header"
import Footer from "@/components/footer"
import ProductImage from "@/components/product-image"
import type { Product } from "@/lib/data/local-product-store"

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true)
        // Try fetching by handle first, fallback to ID if it's numeric
        const isNumericId = /^\d+$/.test(params.id as string)
        const queryParam = isNumericId ? `id=${params.id}` : `handle=${params.id}`
        const response = await fetch(`/api/products_by_id?${queryParam}`)
        if (!response.ok) {
          throw new Error("Product not found")
        }
        const data = await response.json()
        setProduct(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load product")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProduct()
    }
  }, [params.id])

  const handleAddToCart = () => {
    setCartCount((c) => c + 1)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Header cartCount={cartCount} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-foreground/60">Loading product...</p>
        </div>
        <Footer />
      </main>
    )
  }

  if (error || !product) {
    return (
      <main className="min-h-screen bg-background">
        <Header cartCount={cartCount} />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <p className="text-destructive text-lg">{error || "Product not found"}</p>
          <Button onClick={() => router.push("/")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Header cartCount={cartCount} />

      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="mb-8 border-accent text-accent hover:bg-accent/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Visual */}
            <div className="space-y-4">
              <div className="relative h-96 lg:h-[600px] bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 rounded-xl overflow-hidden border border-border">
                <ProductImage category={product.category} />

                {/* Category Badge */}
                <div className="absolute top-4 left-4 bg-accent/90 text-accent-foreground px-4 py-2 rounded-lg font-semibold">
                  {product.category}
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Title and Rating */}
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-4">{product.name}</h1>
                {product.rating && (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < Math.floor(product.rating!)
                                ? "fill-accent text-accent"
                                : "text-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-lg font-semibold text-accent">{product.rating}</span>
                    </div>
                    {product.reviews && (
                      <span className="text-foreground/60">({product.reviews} reviews)</span>
                    )}
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="p-6 bg-card rounded-xl border border-border">
                <div className="text-4xl font-bold text-accent mb-2">
                  {product.price.toFixed(2)} BTC
                </div>
                <div className="text-xl text-foreground/70">
                  ${product.priceUSD.toLocaleString()} USD
                </div>
              </div>

              {/* Key Specs */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-card rounded-xl border border-border">
                  <div className="flex items-center gap-2 text-accent mb-2">
                    <Zap className="w-5 h-5" />
                    <span className="font-semibold">Hashrate</span>
                  </div>
                  <div className="text-2xl font-bold text-foreground">{product.hashrate}</div>
                </div>
                <div className="p-4 bg-card rounded-xl border border-border">
                  <div className="flex items-center gap-2 text-accent mb-2">
                    <Cpu className="w-5 h-5" />
                    <span className="font-semibold">Power</span>
                  </div>
                  <div className="text-2xl font-bold text-foreground">{product.power}</div>
                </div>
              </div>

              {/* Specifications */}
              <div className="p-6 bg-card rounded-xl border border-border">
                <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-accent" />
                  Specifications
                </h3>
                <ul className="space-y-3">
                  {product.specs.map((spec, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-foreground/80">
                      <span className="text-accent mt-1">•</span>
                      <span>{spec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Add to Cart */}
              <Button
                onClick={handleAddToCart}
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg py-6"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent mb-1">24/7</div>
                  <div className="text-xs text-foreground/60">Support</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent mb-1">2 Year</div>
                  <div className="text-xs text-foreground/60">Warranty</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent mb-1">Free</div>
                  <div className="text-xs text-foreground/60">Shipping</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
