'use client';

import { useCart } from '@/lib/hooks/use-cart';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

export default function CartPage() {
  const { cart, loading, updateQuantity, removeFromCart, total } = useCart();

  const handleQuantityChange = async (
    cartItemId: string,
    newQuantity: number
  ) => {
    try {
      await updateQuantity(cartItemId, newQuantity);
    } catch (_error) {
      toast.error('Failed to update quantity');
    }
  };

  const handleRemove = async (cartItemId: string) => {
    try {
      await removeFromCart(cartItemId);
      toast.success('Removed from cart');
    } catch (_error) {
      toast.error('Failed to remove from cart');
    }
  };

  if (loading) {
    return <p>Loading cart...</p>;
  }

  return (
    <div>
      <h1 className="mb-8 font-bold text-3xl">Shopping Cart</h1>

      {cart.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Your cart is empty</p>
          </CardContent>
        </Card>
      ) : (
        <div className="gap-6 grid grid-cols-1 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {cart.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {item.product?.image_url && (
                      <Image
                        src={item.product.image_url}
                        alt={item.product.name || 'Product image'}
                        width={96}
                        height={96}
                        className="rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="mb-1 font-semibold text-lg">
                        {item.product?.name}
                      </h3>
                      <p className="mb-2 text-muted-foreground">
                        ${item.product?.price.toFixed(2)}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity - 1)
                          }
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            handleQuantityChange(
                              item.id,
                              parseInt(e.target.value) || 1
                            )
                          }
                          className="w-20 text-center"
                          min="1"
                        />
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity + 1)
                          }
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="mb-2 font-bold text-xl">
                        $
                        {((item.product?.price || 0) * item.quantity).toFixed(
                          2
                        )}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemove(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>$0.00</span>
                </div>
                <div className="mt-2 pt-2 border-t">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" size="lg">
                  Proceed to Checkout
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
