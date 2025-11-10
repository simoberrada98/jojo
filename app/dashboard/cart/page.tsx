'use client';

import { H1, P } from '@/components/ui/typography';
import { Card, CardContent } from '@/components/ui/card';
import { CartItem } from '@/components/cart/cart-item';
import { OrderSummary } from '@/components/cart/order-summary';
import { CART_COPY } from '@/lib/constants/strings';
import { useCart } from '@/lib/hooks/use-cart';
import { formatCurrency } from '@/lib/utils/currency';
import { toast } from 'sonner';

export default function CartPage() {
  const { cart, loading, updateQuantity, removeFromCart, total } = useCart();

  const handleQuantityChange = async (
    cartItemId: string,
    newQuantity: number
  ) => {
    try {
      await updateQuantity(cartItemId, newQuantity);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`${CART_COPY.quantityUpdateError}: ${message}`);
    }
  };

  const handleRemove = async (cartItemId: string) => {
    try {
      await removeFromCart(cartItemId);
      toast.success(CART_COPY.removeSuccess);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`${CART_COPY.removeError}: ${message}`);
    }
  };

  const formatAmount = (value: number) => formatCurrency(value);

  if (loading) {
    return <P>{CART_COPY.loading}</P>;
  }

  return (
    <div>
      <H1 className="mb-8 font-bold text-3xl">{CART_COPY.title}</H1>

      {cart.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <P className="text-muted-foreground">{CART_COPY.empty}</P>
          </CardContent>
        </Card>
      ) : (
        <div className="gap-6 grid grid-cols-1 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {cart.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemove}
                formatAmount={formatAmount}
              />
            ))}
          </div>

          <OrderSummary
            subtotal={total}
            total={total}
            copy={{
              title: CART_COPY.summaryTitle,
              subtotalLabel: CART_COPY.subtotalLabel,
              shippingLabel: CART_COPY.shippingLabel,
              totalLabel: CART_COPY.totalLabel,
              checkoutCta: CART_COPY.checkoutCta,
            }}
            formatAmount={formatAmount}
            shippingAmount={0}
          />
        </div>
      )}
    </div>
  );
}
