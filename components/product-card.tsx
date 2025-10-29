"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Zap, Cpu, Star } from "lucide-react"
import { toast } from "sonner"
import ProductImage from "@/components/product-image"
import { useCurrency } from "@/lib/contexts/currency-context"
import { useCart } from "@/lib/contexts/cart-context"
import type { DisplayProduct } from "@/lib/types/product"

interface ProductCardProps {
  product: DisplayProduct
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isAdded, setIsAdded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const { currency, formatPrice } = useCurrency()
  const { addItem } = useCart()
  
  // Get hover image (second image if available)
  const hoverImage = product.images && product.images.length > 1 ? product.images[1] : null

  const handleAddToCart = () => {
    addItem(product)
    setIsAdded(true)
    toast.success(`${product.name} added to cart!`)
    setTimeout(() => setIsAdded(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative bg-card border border-border rounded-lg overflow-hidden hover:border-accent transition-all duration-300 hover:shadow-2xl hover:shadow-accent/20"
    >
      <Link href={`/product/${product.handle}`} className="block">
        {/* Image Container */}
        <div className="relative h-64 overflow-hidden">
          {/* Primary Image */}
          <div className="absolute inset-0 transition-opacity duration-500 ease-in-out">
            <ProductImage category={product.category} image={product.image} />
          </div>
          
          {/* Secondary Image (shown on hover) */}
          {hoverImage && (
            <div 
              className="absolute inset-0 transition-opacity duration-500 ease-in-out"
              style={{ opacity: isHovered ? 1 : 0 }}
            >
              <ProductImage category={product.category} image={hoverImage} />
            </div>
          )}

          {/* Category Badge */}
          <div className="absolute top-3 left-3 bg-accent/90 backdrop-blur-sm text-accent-foreground px-3 py-1 rounded-full text-xs font-semibold z-10 transition-all duration-300 group-hover:bg-accent">
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
              <span className="font-mono">{product.hashrate}</span>
            </div>
            <div className="flex items-center gap-1">
              <Cpu className="w-4 h-4 text-accent" />
              <span className="font-mono">{product.power}</span>
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
        </div>
      </Link>

      {/* Price and Action */}
      <div className="p-6 pt-0">
        {/* Price */}
        <div className="mb-6 pb-6 border-b border-border">
          <div className="text-3xl font-bold text-accent mb-1 font-mono">
            {formatPrice(product.priceUSD)} {currency}
          </div>
          <div className="text-sm text-foreground/60 font-mono">${product.priceUSD.toLocaleString()} USD</div>
        </div>

        {/* Add to Cart Button */}
        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            onClick={handleAddToCart}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2 glow-accent-hover transition-all duration-300"
          >
            <ShoppingCart className="w-4 h-4" />
            {isAdded ? "Added to Cart!" : "Add to Cart"}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}
