import type { DisplayProduct } from "@/lib/types/product"

/**
 * Sort options for products
 */
export const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Highest Rated", value: "rating" },
  { label: "Most Popular", value: "popular" },
] as const

export type SortOption = typeof SORT_OPTIONS[number]["value"]

/**
 * Sort products by specified option
 */
export function sortProducts(
  products: DisplayProduct[],
  sortBy: SortOption
): DisplayProduct[] {
  const sorted = [...products]

  switch (sortBy) {
    case "price-asc":
      return sorted.sort((a, b) => a.priceUSD - b.priceUSD)
    
    case "price-desc":
      return sorted.sort((a, b) => b.priceUSD - a.priceUSD)
    
    case "rating":
      return sorted.sort((a, b) => b.rating - a.rating)
    
    case "popular":
      return sorted.sort((a, b) => b.reviews - a.reviews)
    
    case "newest":
    default:
      // Keep original order for newest
      return sorted
  }
}
