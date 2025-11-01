'use client'

import { useWishlist } from '@/lib/hooks/use-wishlist'
import { useCart } from '@/lib/hooks/use-cart'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Trash2, ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'

export default function WishlistPage() {
  const { wishlist, loading, removeFromWishlist } = useWishlist()
  const { addToCart } = useCart()

  const handleRemove = async (productId: string) => {
    try {
      await removeFromWishlist(productId)
      toast.success('Removed from wishlist')
    } catch (error) {
      toast.error('Failed to remove from wishlist')
    }
  }

  const handleAddToCart = async (productId: string) => {
    try {
      await addToCart(productId)
      toast.success('Added to cart')
    } catch (error) {
      toast.error('Failed to add to cart')
    }
  }

  if (loading) {
    return <p>Loading wishlist...</p>
  }

  return (
    <div>
      <h1 className='mb-8 font-bold text-3xl'>My Wishlist</h1>

      {wishlist.length === 0 ? (
        <Card>
          <CardContent className='py-12 text-center'>
            <p className='text-muted-foreground'>Your wishlist is empty</p>
          </CardContent>
        </Card>
      ) : (
        <div className='gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
          {wishlist.map((item) => (
            <Card key={item.id}>
              <CardContent className='p-6'>
                {item.product?.image_url && (
                  <img
                    src={item.product.image_url}
                    alt={item.product.name}
                    className='mb-4 rounded-lg w-full h-48 object-cover'
                  />
                )}
                <h3 className='mb-2 font-semibold text-lg'>
                  {item.product?.name}
                </h3>
                <p className='mb-4 font-bold text-2xl'>
                  ${item.product?.price.toFixed(2)}
                </p>
                <div className='flex gap-2'>
                  <Button
                    variant='default'
                    className='flex-1'
                    onClick={() => handleAddToCart(item.product_id)}
                  >
                    <ShoppingCart className='mr-2 w-4 h-4' />
                    Add to Cart
                  </Button>
                  <Button
                    variant='outline'
                    size='icon'
                    onClick={() => handleRemove(item.product_id)}
                  >
                    <Trash2 className='w-4 h-4' />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
