"use client"

import { useState, useMemo } from "react"
import ProductCard from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"

interface ProductCatalogProps {
  onAddToCart: () => void
}

const PRODUCTS = [
  {
    id: 1,
    name: "ProMiner X1000",
    price: 2.5,
    priceUSD: 85000,
    category: "ASIC",
    hashrate: "100 TH/s",
    power: "3250W",
    image: "/placeholder.svg?key=vofbb",
    model3d: "/assets/3d/duck.glb",
    specs: ["100 TH/s Hashrate", "3250W Power", "Cooling System", "WiFi Enabled"],
    rating: 4.8,
    reviews: 124,
  },
  {
    id: 2,
    name: "GPU Rig Pro",
    price: 1.8,
    priceUSD: 62000,
    category: "GPU",
    hashrate: "450 MH/s",
    power: "2100W",
    image: "/placeholder.svg?key=0na3z",
    model3d: "/assets/3d/duck.glb",
    specs: ["450 MH/s Hashrate", "2100W Power", "6x RTX 4090", "Modular Design"],
    rating: 4.6,
    reviews: 89,
  },
  {
    id: 3,
    name: "UltraHash 5000",
    price: 3.2,
    priceUSD: 110000,
    category: "ASIC",
    hashrate: "150 TH/s",
    power: "4500W",
    image: "/placeholder.svg?key=y5wp5",
    model3d: "/assets/3d/duck.glb",
    specs: ["150 TH/s Hashrate", "4500W Power", "Advanced Cooling", "Smart Control"],
    rating: 4.9,
    reviews: 156,
  },
  {
    id: 4,
    name: "MiniMiner Compact",
    price: 0.8,
    priceUSD: 28000,
    category: "Compact",
    hashrate: "50 TH/s",
    power: "1500W",
    image: "/placeholder.svg?key=pdsz3",
    model3d: "/assets/3d/duck.glb",
    specs: ["50 TH/s Hashrate", "1500W Power", "Portable", "Quiet Operation"],
    rating: 4.5,
    reviews: 67,
  },
  {
    id: 5,
    name: "Enterprise Cluster",
    price: 5.0,
    priceUSD: 175000,
    category: "Enterprise",
    hashrate: "300 TH/s",
    power: "8000W",
    image: "/placeholder.svg?key=qkpl4",
    model3d: "/assets/3d/duck.glb",
    specs: ["300 TH/s Hashrate", "8000W Power", "Redundant Systems", "API Access"],
    rating: 4.7,
    reviews: 42,
  },
  {
    id: 6,
    name: "HyperHash Pro",
    price: 2.0,
    priceUSD: 70000,
    category: "ASIC",
    hashrate: "80 TH/s",
    power: "2800W",
    image: "/placeholder.svg?key=ldd0f",
    model3d: "/assets/3d/duck.glb",
    specs: ["80 TH/s Hashrate", "2800W Power", "Efficient Cooling", "Remote Monitoring"],
    rating: 4.7,
    reviews: 98,
  },
]

const CATEGORIES = ["All", "ASIC", "GPU", "Compact", "Enterprise"]
const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Highest Rated", value: "rating" },
  { label: "Most Popular", value: "popular" },
]

export default function ProductCatalog({ onAddToCart }: ProductCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [sortBy, setSortBy] = useState("newest")
  const [showFilters, setShowFilters] = useState(false)
  const [priceRange, setPriceRange] = useState([0, 200000])

  const filteredAndSortedProducts = useMemo(() => {
    const result = PRODUCTS.filter((p) => {
      const categoryMatch = selectedCategory === "All" || p.category === selectedCategory
      const priceMatch = p.priceUSD >= priceRange[0] && p.priceUSD <= priceRange[1]
      return categoryMatch && priceMatch
    })

    // Apply sorting
    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.priceUSD - b.priceUSD)
        break
      case "price-desc":
        result.sort((a, b) => b.priceUSD - a.priceUSD)
        break
      case "rating":
        result.sort((a, b) => b.rating - a.rating)
        break
      case "popular":
        result.sort((a, b) => b.reviews - a.reviews)
        break
      default:
        // newest - keep original order
        break
    }

    return result
  }, [selectedCategory, sortBy, priceRange])

  return (
    <section id="products" className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-balance">Premium Mining Hardware</h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Choose from our selection of professional-grade mining equipment. All products support crypto payments.
          </p>
        </div>

        {/* Filters and Sorting */}
        <div className="mb-12 space-y-6">
          {/* Category Filter */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Category</h3>
            <div className="flex flex-wrap gap-3">
              {CATEGORIES.map((category) => (
                <Button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className={
                    selectedCategory === category
                      ? "bg-primary hover:bg-primary/90"
                      : "border-accent text-accent hover:bg-accent/10"
                  }
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-accent hover:text-accent/80 transition"
            >
              <span className="text-sm font-semibold">Advanced Filters</span>
              <ChevronDown
                className="w-4 h-4 transition-transform"
                style={{ transform: showFilters ? "rotate(180deg)" : "rotate(0deg)" }}
              />
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-foreground/70">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Price Range Filter */}
          {showFilters && (
            <div className="p-4 rounded-lg bg-card border border-border">
              <h4 className="text-sm font-semibold text-foreground mb-4">Price Range</h4>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-xs text-foreground/60 mb-2 block">Min Price</label>
                    <input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="$0"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-foreground/60 mb-2 block">Max Price</label>
                    <input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="$200,000"
                    />
                  </div>
                </div>
                <div className="text-xs text-foreground/60">
                  Showing products between ${priceRange[0].toLocaleString()} - ${priceRange[1].toLocaleString()}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6 text-sm text-foreground/70">
          Showing {filteredAndSortedProducts.length} of {PRODUCTS.length} products
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedProducts.length > 0 ? (
            filteredAndSortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-foreground/60">No products found matching your filters.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
