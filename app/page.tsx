"use client"

import { useState } from "react"
import Header from "@/components/header"
import HeroSection from "@/components/hero-section"
import TopProducts from "@/components/top-products"
import ProductCatalog from "@/components/product-catalog"
import Footer from "@/components/footer"

export default function Home() {
  const [cartCount, setCartCount] = useState(0)

  return (
    <main className="min-h-screen bg-background">
      <Header cartCount={cartCount} />
      <HeroSection />
      <TopProducts onAddToCart={() => setCartCount((c) => c + 1)} />
      <ProductCatalog onAddToCart={() => setCartCount((c) => c + 1)} />
      <Footer />
    </main>
  )
}
