"use client"

import { useCart } from "@/lib/hooks/use-cart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Trash2, Plus, Minus } from "lucide-react"
import { toast } from "sonner"

export default function CartPage() {
  const { cart, loading, updateQuantity, removeFromCart, total } = useCart()

  const handleQuantityChange = async (cartItemId: string, newQuantity: number) => {
    try {
      await updateQuantity(cartItemId, newQuantity)
    } catch (error) {
      toast.error("Failed to update quantity")
    }
  }

  const handleRemove = async (cartItemId: string) => {
    try {
      await removeFromCart(cartItemId)
      toast.success("Removed from cart")
    } catch (error) {
      toast.error("Failed to remove from cart")
    }
  }

  if (loading) {
    return <p>Loading cart...</p>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      {cart.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Your cart is empty</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {item.product?.image_url && (
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">
                        {item.product?.name}
                      </h3>
                      <p className="text-muted-foreground mb-2">
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
                          <Minus className="h-4 w-4" />
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
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold mb-2">
                        ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemove(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
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
                <div className="border-t pt-2 mt-2">
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
  )
}
