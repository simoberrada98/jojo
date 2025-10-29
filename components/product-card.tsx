"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Zap, Cpu, Star } from "lucide-react"
import Model3DViewer from "@/components/model-3d-viewer"

interface Product {
  id: number
  name: string
  price: number
  priceUSD: number
  category: string
  hashrate: string
  power: string
  image: string
  model3d: string
  specs: string[]
  rating?: number
  reviews?: number
}

interface ProductCardProps {
  product: Product
  onAddToCart: () => void
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [show3D, setShow3D] = useState(false)
  const [isAdded, setIsAdded] = useState(false)

  const handleAddToCart = () => {
    onAddToCart()
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2000)
  }

  return (
    <div className="group relative bg-card border border-border rounded-lg overflow-hidden hover:border-accent transition-all duration-300 glow-accent-hover">
      {/* Image/3D Model Container */}
      <div className="relative h-64 bg-gradient-to-br from-primary/10 to-accent/10 overflow-hidden">
        {show3D ? (
          <Model3DViewer modelPath={product.model3d} />
        ) : (
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
          />
        )}

        {/* 3D Toggle Button */}
        <button
          onClick={() => setShow3D(!show3D)}
          className="absolute top-3 right-3 bg-primary/80 hover:bg-primary text-white px-3 py-1 rounded-full text-sm font-medium transition"
        >
          {show3D ? "2D" : "3D"}
        </button>

        {/* Category Badge */}
        <div className="absolute top-3 left-3 bg-accent/90 text-accent-foreground px-3 py-1 rounded-full text-xs font-semibold">
          {product.category}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title and Rating */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-bold text-foreground flex-1">{product.name}</h3>
          {product.rating && (
            <div className="flex items-center gap-1 ml-2">
              <Star className="w-4 h-4 fill-accent text-accent" />
              <span className="text-sm font-semibold text-accent">{product.rating}</span>
            </div>
          )}
        </div>

        {/* Reviews Count */}
        {product.reviews && <p className="text-xs text-foreground/60 mb-4">({product.reviews} reviews)</p>}

        {/* Specs */}
        <div className="flex gap-4 mb-4 text-sm text-foreground/70">
          <div className="flex items-center gap-1">
            <Zap className="w-4 h-4 text-accent" />
            {product.hashrate}
          </div>
          <div className="flex items-center gap-1">
            <Cpu className="w-4 h-4 text-accent" />
            {product.power}
          </div>
        </div>

        {/* Features List */}
        <ul className="space-y-2 mb-6">
          {product.specs.slice(0, 2).map((spec, idx) => (
            <li key={idx} className="text-sm text-foreground/60 flex items-start gap-2">
              <span className="text-accent mt-1">•</span>
              {spec}
            </li>
          ))}
        </ul>

        {/* Price */}
        <div className="mb-6 pb-6 border-b border-border">
          <div className="text-3xl font-bold text-accent mb-1">{product.price} BTC</div>
          <div className="text-sm text-foreground/60">${product.priceUSD.toLocaleString()}</div>
        </div>

        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2 glow-accent-hover transition-all duration-300"
        >
          <ShoppingCart className="w-4 h-4" />
          {isAdded ? "Added to Cart!" : "Add to Cart"}
        </Button>
      </div>
    </div>
  )
}
