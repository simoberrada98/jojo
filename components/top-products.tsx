'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Star } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import ProductImage from '@/components/product-image'
import { useCurrency } from '@/lib/contexts/currency-context'
import { useCart } from '@/lib/contexts/cart-context'
import type { DisplayProduct } from '@/types/product'

export default function TopProducts() {
  const [products, setProducts] = useState<DisplayProduct[]>([])
  const [loading, setLoading] = useState(true)
  const { currency, formatPrice } = useCurrency()
  const { addItem } = useCart()

  useEffect(() => {
    async function fetchTopProducts() {
      try {
        setLoading(true)
        // Fetch all products and sort by rating
        const response = await fetch('/api/products?limit=50')
        if (!response.ok) throw new Error('Failed to fetch products')

        const data = await response.json()
        // Get top 3 products by rating
        const topRated = [...data.results]
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 3)

        setProducts(topRated)
      } catch (error) {
        console.error('Error fetching top products:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchTopProducts()
  }, [])

  if (loading) {
    return (
      <section className='px-4 sm:px-6 lg:px-8 py-20'>
        <div className='mx-auto max-w-7xl'>
          <div className='text-center'>
            <p className='text-foreground/60'>Loading top products...</p>
          </div>
        </div>
      </section>
    )
  }

  if (products.length === 0) return null

  return (
    <section className='px-4 sm:px-6 lg:px-8 py-20'>
      <div className='mx-auto max-w-7xl'>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className='mb-12 text-center'
        >
          <h2 className='mb-4 font-bold text-3xl sm:text-4xl lg:text-5xl text-balance'>
            <span className='bg-clip-text bg-linear-to-r from-primary via-accent to-secondary text-transparent'>
              Top Rated Products
            </span>
          </h2>
          <p className='mx-auto max-w-2xl text-foreground/70 text-lg'>
            Our most popular and highest-rated mining hardware trusted by
            professionals worldwide.
          </p>
        </motion.div>

        {/* Products Grid */}
        <div className='gap-6 grid grid-cols-1 md:grid-cols-3 mb-12'>
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className='group relative bg-card hover:shadow-accent/10 hover:shadow-lg border border-border hover:border-accent/50 rounded-xl overflow-hidden transition-all duration-300'
            >
              {/* Best Seller Badge */}
              <Link href={`/product/${product.handle}`} className='block'>
                <div className='top-4 right-4 z-10 absolute bg-primary/90 backdrop-blur-sm px-3 py-1 rounded-full'>
                  <span className='flex items-center gap-1 font-bold text-primary-foreground text-xs'>
                    <Star className='fill-current w-3 h-3' />
                    {product.rating}
                  </span>
                </div>
              </Link>

              {/* Product Visual */}
              <Link href={`/product/${product.handle}`} className='block'>
                <div className='relative h-64 overflow-hidden'>
                  <ProductImage
                    category={product.category}
                    image={product.image}
                  />
                  <div className='absolute inset-0 bg-linear-to-t from-card via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
                </div>
              </Link>

              {/* Product Info */}
              <div className='p-6'>
                <Link href={`/product/${product.handle}`} className='block'>
                  <div className='mb-4'>
                    <span className='inline-block bg-accent/20 mb-2 px-2 py-1 rounded font-semibold text-accent text-xs'>
                      {product.category}
                    </span>
                    <h3 className='mb-2 font-bold text-foreground group-hover:text-accent text-xl transition-colors'>
                      {product.name}
                    </h3>
                    <p className='mb-2 font-mono text-foreground/60 text-sm'>
                      {product.hashrate} • {product.power}
                    </p>
                  </div>

                  {/* Rating */}
                  <div className='flex items-center gap-2 mb-4'>
                    <div className='flex'>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(product.rating)
                              ? 'fill-accent text-accent'
                              : 'text-muted'
                          }`}
                        />
                      ))}
                    </div>
                    <span className='text-foreground/60 text-sm'>
                      ({product.reviews} reviews)
                    </span>
                  </div>

                  {/* Price */}
                  <div className='flex items-baseline gap-2 mb-4'>
                    <span className='font-mono font-bold text-accent text-2xl'>
                      {formatPrice(product.priceUSD)} {currency}
                    </span>
                    <span className='font-mono text-foreground/60 text-sm'>
                      ${product.priceUSD.toLocaleString()} USD
                    </span>
                  </div>

                  {/* Specs Preview */}
                  <div className='space-y-1 mb-4'>
                    {product.specs.slice(0, 2).map((spec, idx) => (
                      <div
                        key={idx}
                        className='flex items-center gap-2 text-foreground/60 text-xs'
                      >
                        <span className='bg-accent rounded-full w-1 h-1' />
                        {spec}
                      </div>
                    ))}
                  </div>
                </Link>

                {/* Action Button */}
                <motion.div whileTap={{ scale: 0.95 }}>
                  <Button
                    className='bg-primary hover:bg-primary/90 w-full text-primary-foreground'
                    onClick={() => {
                      addItem(product)
                      toast.success(`${product.name} added to cart!`)
                    }}
                  >
                    Add to Cart
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className='text-center'
        >
          <Link href='#products'>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size='lg'
                variant='outline'
                className='bg-transparent hover:bg-accent/10 border-accent text-accent'
              >
                View All Products
              </Button>
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
