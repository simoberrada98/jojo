import { useState, useMemo } from "react"
import type { DisplayProduct } from "@/lib/types/product"
import { sortProducts, type SortOption } from "@/lib/utils/product-sorting"

interface UseProductFiltersProps {
  products: DisplayProduct[]
}

interface PriceRange {
  min: number
  max: number
}

export function useProductFilters({ products }: UseProductFiltersProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [sortBy, setSortBy] = useState<SortOption>("newest")
  const [priceRange, setPriceRange] = useState<PriceRange>({ min: 0, max: 200000 })

  // Extract unique categories from products
  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category))
    return ["All", ...Array.from(cats).sort()]
  }, [products])

  // Apply filters and sorting
  const filteredAndSortedProducts = useMemo(() => {
    // Filter by category and price
    const filtered = products.filter((p) => {
      const categoryMatch = selectedCategory === "All" || p.category === selectedCategory
      const priceMatch = p.priceUSD >= priceRange.min && p.priceUSD <= priceRange.max
      return categoryMatch && priceMatch
    })

    // Sort
    return sortProducts(filtered, sortBy)
  }, [products, selectedCategory, sortBy, priceRange])

  return {
    // State
    selectedCategory,
    sortBy,
    priceRange,
    
    // Setters
    setSelectedCategory,
    setSortBy,
    setPriceRange,
    
    // Computed
    categories,
    filteredAndSortedProducts,
  }
}
