"use client"

import Header from "@/components/header"
import HeroSection from "@/components/hero-section"
import TopProducts from "@/components/top-products"
import ProductCatalog from "@/components/product-catalog"
import Footer from "@/components/footer"
import { useCart } from "@/lib/contexts/cart-context"

export default function Home() {
  const { itemCount } = useCart()

  return (
    <main className="min-h-screen bg-background">
      <Header cartCount={itemCount} />
      <HeroSection />
      <TopProducts />
      <ProductCatalog />
      <Footer />
    </main>
  )
}
