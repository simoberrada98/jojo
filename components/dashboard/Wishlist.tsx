'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/contexts/auth-context';
import { wishlistService } from '@/lib/services/wishlist.service';
import { H3, P, Muted } from '@/components/ui/typography';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, HeartCrack, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import type { DisplayProduct } from '@/types/product';

interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

export default function Wishlist() {
  const { user } = useAuth();
  const [_wishlistItems, _setWishlistItems] = useState<WishlistItem[]>([]);
  const [wishedProducts, setWishedProducts] = useState<DisplayProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      const {
        success,
        data,
        error: fetchError,
      } = await wishlistService.getWishlistItems(user.id);

      if (success && data) {
        _setWishlistItems(data);
        // Fetch product details for each wished item
        const productIds = data.map((item) => item.product_id);
        if (productIds.length > 0) {
          try {
            const response = await fetch(
              `/api/products?ids=${productIds.join(',')}`
            );
            if (!response.ok) {
              throw new Error('Failed to fetch product details');
            }
            const productsData: DisplayProduct[] = await response.json();
            setWishedProducts(productsData);
          } catch (err: unknown) {
            setError(
              err instanceof Error
                ? err.message
                : 'Failed to load product details'
            );
          }
        }
      } else if (fetchError) {
        setError(fetchError.message || 'Failed to load wishlist');
      }
      setLoading(false);
    };

    fetchWishlist();
  }, [user]);

  const handleRemoveFromWishlist = async (productId: string) => {
    if (!user) return;

    const { success, error: removeError } =
      await wishlistService.removeFromWishlist(user.id, productId);

    if (success) {
      _setWishlistItems((prev) =>
        prev.filter((item) => item.product_id !== productId)
      );
      setWishedProducts((prev) =>
        prev.filter((product) => product.id !== productId)
      );
      toast.success('Product removed from wishlist.');
    } else {
      toast.error(
        removeError?.message || 'Failed to remove product from wishlist.'
      );
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Wishlist</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-40">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <P className="ml-2">Loading wishlist...</P>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Wishlist</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <P className="text-destructive">Error: {error}</P>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Wishlist</CardTitle>
      </CardHeader>
      <CardContent>
        {wishedProducts.length === 0 ? (
          <div className="flex flex-col justify-center items-center py-8 text-center">
            <HeartCrack className="mb-4 w-16 h-16 text-muted-foreground" />
            <H3 className="mb-2 font-semibold text-2xl">
              Your wishlist is empty
            </H3>
            <P className="max-w-md text-muted-foreground">
              Looks like you haven&apos;t added any products to your wishlist
              yet. Start browsing to find items you love!
            </P>
            <Button asChild className="mt-6">
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {wishedProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center space-x-4 pb-4 last:pb-0 border-b last:border-b-0"
              >
                <Link href={`/products/${product.handle}`} className="shrink-0">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={80}
                    height={80}
                    className="rounded-md object-cover"
                  />
                </Link>
                <div className="flex-1">
                  <Link href={`/products/${product.handle}`}>
                    <H3 className="font-semibold text-lg hover:underline">
                      {product.name}
                    </H3>
                  </Link>
                  <Muted className="text-sm">
                    {product.priceUSD.toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    })}
                  </Muted>
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleRemoveFromWishlist(product.id)}
                  aria-label="Remove from wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
