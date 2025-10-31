"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Zap, Cpu, Star } from "lucide-react";
import { toast } from "sonner";
import ProductImage from "@/components/product-image";
import { useCurrency } from "@/lib/contexts/currency-context";
import { useCart } from "@/lib/contexts/cart-context";
import type { DisplayProduct } from "@/lib/types/product";

interface ProductCardProps {
  product: DisplayProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isAdded, setIsAdded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { currency, formatPrice } = useCurrency();
  const { addItem } = useCart();

  // Get hover image (second image if available)
  const hoverImage =
    product.images && product.images.length > 1 ? product.images[1] : null;

  const handleAddToCart = () => {
    addItem(product);
    setIsAdded(true);
    toast.success(`${product.name} added to cart!`);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative hover:shadow-2xl hover:shadow-accent/20 border border-border hover:border-accent rounded-lg overflow-hidden transition-all duration-300"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-card/25 group-hover:bg-card/35 backdrop-blur-xl transition-all duration-500 pointer-events-none"
      />

      <Link href={`/product/${product.handle}`} className="block z-10 relative">
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
          <div className="top-3 left-3 z-10 absolute bg-accent/90 group-hover:bg-accent backdrop-blur-sm px-3 py-1 rounded-full font-semibold text-xs transition-all duration-300 text-accent-foreground">
            {product.category}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Title and Rating */}
          <div className="flex justify-between items-start mb-2">
            <h3 className="flex-1 font-bold text-foreground text-xl">
              {product.name}
            </h3>
            {product.rating && (
              <div className="flex items-center gap-1 ml-2">
                <Star className="fill-accent w-4 h-4 text-accent" />
                <span className="font-semibold text-accent text-sm">
                  {product.rating}
                </span>
              </div>
            )}
          </div>

          {/* Reviews Count */}
          {product.reviews && (
            <p className="mb-4 text-foreground/60 text-xs">
              ({product.reviews} reviews)
            </p>
          )}

          {/* Specs */}
          <div className="flex gap-4 mb-4 text-foreground/70 text-sm">
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
              <li
                key={idx}
                className="flex items-start gap-2 text-foreground/60 text-sm"
              >
                <span className="mt-1 text-accent">•</span>
                {spec}
              </li>
            ))}
          </ul>
        </div>
      </Link>

      {/* Price and Action */}
      <div className="z-10 relative p-6 pt-0">
        {/* Price */}
        <div className="mb-6 pb-6 border-border border-b">
          <div className="mb-1 font-mono font-bold text-accent text-3xl">
            {formatPrice(product.priceUSD)} {currency}
          </div>
          <div className="font-mono text-foreground/60 text-sm">
            ${product.priceUSD.toLocaleString()} USD
          </div>
        </div>

        {/* Add to Cart Button */}
        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            onClick={handleAddToCart}
            className="gap-2 bg-primary hover:bg-primary/90 w-full font-semibold text-primary-foreground transition-all duration-300 glow-accent-hover"
          >
            <ShoppingCart className="w-4 h-4" />
            {isAdded ? "Added to Cart!" : "Add to Cart"}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
