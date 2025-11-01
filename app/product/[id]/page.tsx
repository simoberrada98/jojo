'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Star, Zap, Cpu, Shield, ArrowLeft, ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import PageLayout from '@/components/layout/PageLayout'
import ProductImage from '@/components/product-image'
import { useCurrency } from '@/lib/contexts/currency-context'
import { useCart } from '@/lib/contexts/cart-context'
import { generateProductSchema, serializeSchema } from '@/lib/schema'
import type { DisplayProduct } from '@/types/product'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<DisplayProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const { currency, formatPrice } = useCurrency()
  const { addItem } = useCart()

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true)
        // Try fetching by handle first, fallback to ID if it's numeric
        const isNumericId = /^\d+$/.test(params.id as string)
        const queryParam = isNumericId
          ? `id=${params.id}`
          : `handle=${params.id}`
        const response = await fetch(`/api/products?${queryParam}`)
        if (!response.ok) {
          throw new Error('Product not found')
        }
        const data = await response.json()
        setProduct(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load product')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProduct()
    }
  }, [params.id])

  const handleAddToCart = () => {
    if (product) {
      addItem(product)
      toast.success(`${product.name} added to cart!`)
    }
  }

  if (loading) {
    return (
      <PageLayout>
        <div className='flex justify-center items-center min-h-[60vh]'>
          <p className='text-foreground/60'>Loading product...</p>
        </div>
      </PageLayout>
    )
  }

  if (error || !product) {
    return (
      <PageLayout>
        <div className='flex flex-col justify-center items-center gap-4 min-h-[60vh]'>
          <p className='text-destructive text-lg'>
            {error || 'Product not found'}
          </p>
          <Button onClick={() => router.push('/')} variant='outline'>
            <ArrowLeft className='mr-2 w-4 h-4' />
            Back to Home
          </Button>
        </div>
      </PageLayout>
    )
  }

  // Generate Product Schema
  const baseUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://jhuangnyc.com'
  const productSchema = generateProductSchema(product, baseUrl, currency)

  return (
    <PageLayout>
      {/* Schema.org Product markup */}
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: serializeSchema(productSchema)
        }}
      />

      <div className='px-4 sm:px-6 lg:px-8 pt-24 pb-20'>
        <div className='mx-auto max-w-7xl'>
          {/* Back Button */}
          <Button
            onClick={() => router.back()}
            variant='outline'
            className='hover:bg-accent/10 mb-8 border-accent text-accent'
          >
            <ArrowLeft className='mr-2 w-4 h-4' />
            Back
          </Button>

          <div className='gap-12 grid grid-cols-1 lg:grid-cols-2'>
            {/* Product Visual */}
            <div className='space-y-4'>
              {/* Main Image */}
              <div className='relative border border-border rounded-xl h-96 lg:h-[600px] overflow-hidden'>
                <ProductImage
                  category={product.category}
                  image={product.images?.[selectedImage] || product.image}
                />

                {/* Category Badge */}
                <div className='top-4 left-4 z-10 absolute bg-accent/90 backdrop-blur-sm px-4 py-2 rounded-lg font-semibold text-accent-foreground'>
                  {product.category}
                </div>
              </div>

              {/* Thumbnail Gallery */}
              {product.images && product.images.length > 1 && (
                <div className='flex gap-3 pb-2 overflow-x-auto'>
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`relative shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                        selectedImage === idx
                          ? 'border-accent scale-105'
                          : 'border-border hover:border-accent/50'
                      }`}
                    >
                      <ProductImage category={product.category} image={img} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className='space-y-6'>
              {/* Title and Rating */}
              <div>
                <h1 className='mb-4 font-bold text-foreground text-4xl'>
                  {product.name}
                </h1>
                {product.rating && (
                  <div className='flex items-center gap-4'>
                    <div className='flex items-center gap-2'>
                      <div className='flex'>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < Math.floor(product.rating!)
                                ? 'fill-accent text-accent'
                                : 'text-muted'
                            }`}
                          />
                        ))}
                      </div>
                      <span className='font-semibold text-accent text-lg'>
                        {product.rating}
                      </span>
                    </div>
                    {product.reviews && (
                      <span className='text-foreground/60'>
                        ({product.reviews} reviews)
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Price */}
              <div className='bg-card p-6 border border-border rounded-xl'>
                <div className='mb-2 font-mono font-bold text-accent text-4xl'>
                  {formatPrice(product.priceUSD)} {currency}
                </div>
                <div className='font-mono text-foreground/70 text-xl'>
                  ${product.priceUSD.toLocaleString()} USD
                </div>
              </div>

              {/* Key Specs */}
              <div className='gap-4 grid grid-cols-2'>
                <div className='bg-card p-4 border border-border rounded-xl'>
                  <div className='flex items-center gap-2 mb-2 text-accent'>
                    <Zap className='w-5 h-5' />
                    <span className='font-semibold'>Hashrate</span>
                  </div>
                  <div className='font-mono font-bold text-foreground text-2xl'>
                    {product.hashrate}
                  </div>
                </div>
                <div className='bg-card p-4 border border-border rounded-xl'>
                  <div className='flex items-center gap-2 mb-2 text-accent'>
                    <Cpu className='w-5 h-5' />
                    <span className='font-semibold'>Power</span>
                  </div>
                  <div className='font-mono font-bold text-foreground text-2xl'>
                    {product.power}
                  </div>
                </div>
              </div>

              {/* Specifications */}
              <div className='bg-card p-6 border border-border rounded-xl'>
                <h3 className='flex items-center gap-2 mb-4 font-bold text-foreground text-xl'>
                  <Shield className='w-5 h-5 text-accent' />
                  Specifications
                </h3>
                <ul className='space-y-3'>
                  {product.specs.map((spec, idx) => (
                    <li
                      key={idx}
                      className='flex items-start gap-3 text-foreground/80'
                    >
                      <span className='mt-1 text-accent'>•</span>
                      <span>{spec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Add to Cart */}
              <Button
                onClick={handleAddToCart}
                size='lg'
                className='bg-primary hover:bg-primary/90 py-6 w-full font-semibold text-primary-foreground text-lg'
              >
                <ShoppingCart className='mr-2 w-5 h-5' />
                Add to Cart
              </Button>

              {/* Trust Badges */}
              <div className='gap-4 grid grid-cols-3 pt-4'>
                <div className='text-center'>
                  <div className='mb-1 font-mono font-bold text-accent text-2xl'>
                    24/7
                  </div>
                  <div className='text-foreground/60 text-xs'>Support</div>
                </div>
                <div className='text-center'>
                  <div className='mb-1 font-mono font-bold text-accent text-2xl'>
                    2 Year
                  </div>
                  <div className='text-foreground/60 text-xs'>Warranty</div>
                </div>
                <div className='text-center'>
                  <div className='mb-1 font-mono font-bold text-accent text-2xl'>
                    Free
                  </div>
                  <div className='text-foreground/60 text-xs'>Shipping</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
