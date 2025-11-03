'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ShoppingCart, Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { Button, MotionButton } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import ProductImage from '@/components/product-image';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from '@/components/ui/sheet';
import { useAnimationConfig } from '@/lib/animation';
import { useCart, type CartItem } from '@/lib/contexts/cart-context';
import { useCurrency } from '@/lib/contexts/currency-context';
import { P } from '@/components/ui/typography';

interface CartButtonProps {
  cartCount: number;
}

const FREE_SHIPPING_THRESHOLD = 5000;

export function CartButton({ cartCount }: CartButtonProps) {
  const anim = useAnimationConfig();
  const {
    items,
    itemCount,
    total,
    isHydrated,
    clearCart,
    addItem,
    removeItem,
    updateQuantity,
  } = useCart();
  const { formatPrice } = useCurrency();

  const derivedCount = isHydrated ? itemCount : cartCount;
  const hasItems = derivedCount > 0;
  const shippingProgress = Math.min(
    100,
    (total / FREE_SHIPPING_THRESHOLD) * 100
  );
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - total);

  const handleRemove = (cartItem: CartItem) => {
    const snapshot = { ...cartItem };
    removeItem(cartItem.id);
    toast.success(`${cartItem.name} removed from cart.`, {
      action: {
        label: 'Undo',
        onClick: () => addItem(snapshot, snapshot.quantity),
      },
    });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <MotionButton
          variant="ghost"
          size="icon"
          className="relative rounded-full"
          aria-label="Cart preview"
        >
          <ShoppingCart className="w-5 h-5" />
          <AnimatePresence>
            {hasItems && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{
                  type: 'tween',
                  duration: anim.tap,
                  ease: anim.easeStandard,
                }}
                className="-top-2 -right-2 absolute flex justify-center items-center bg-accent shadow-sm rounded-full w-5 h-5 font-medium text-xs text-accent-foreground"
                aria-hidden
              >
                {derivedCount}
              </motion.span>
            )}
          </AnimatePresence>
        </MotionButton>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex flex-col p-0 sm:max-w-md h-full"
      >
        <div className="px-6 pt-6 pb-4 border-border border-b">
          <SheetHeader className="items-start text-left">
            <SheetTitle className="font-semibold text-xl">Your cart</SheetTitle>
            <SheetDescription className="text-muted-foreground text-sm">
              {hasItems
                ? `${derivedCount} item${derivedCount === 1 ? '' : 's'} ready to ship`
                : 'Your cart is empty right now.'}
            </SheetDescription>
          </SheetHeader>
        </div>
        {hasItems && (
          <div className="px-6 py-4 border-border border-b">
            <div className="flex justify-between items-center text-muted-foreground text-xs">
              <span>
                You&apos;re {formatPrice(amountToFreeShipping)} away from free
                shipping
              </span>
              <span className="font-medium text-foreground">
                {formatPrice(FREE_SHIPPING_THRESHOLD)}
              </span>
            </div>
            <Progress value={shippingProgress} className="mt-2 h-2" />
          </div>
        )}
        {hasItems && (
          <div className="flex justify-between items-center px-6 py-3 text-sm">
            <P className="font-medium text-foreground">
              {derivedCount} product{derivedCount === 1 ? '' : 's'}
            </P>
            <Button
              type="button"
              onClick={clearCart}
              className="text-muted-foreground hover:text-foreground hover:underline underline-offset-4 transition"
            >
              Clear all
            </Button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">
          {hasItems ? (
            <ul className="divide-y divide-border">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3 px-6 py-4 text-sm">
                  <Link
                    href={`/product/${item.handle}`}
                    className="block border border-border rounded-md w-20 h-20 overflow-hidden shrink-0"
                  >
                    <ProductImage
                      category={item.category}
                      image={item.image}
                      className="w-full h-full object-cover"
                    />
                  </Link>
                  <div className="flex flex-col flex-1 gap-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/product/${item.handle}`}
                          className="block max-w-[200px] font-medium text-foreground text-sm truncate"
                        >
                          {item.name}
                        </Link>
                        <span className="block mt-1 text-muted-foreground text-xs">
                          {formatPrice(item.priceUSD)}
                        </span>
                      </div>
                      <span className="font-semibold text-foreground text-sm">
                        {formatPrice(item.priceUSD * item.quantity)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center border border-input rounded-md h-9 overflow-hidden">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="flex justify-center items-center border-input border-r focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring w-10 h-full text-muted-foreground hover:text-foreground transition"
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-3 font-medium text-sm">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="flex justify-center items-center border-input border-l focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring w-10 h-full text-muted-foreground hover:text-foreground transition"
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemove(item)}
                        className="font-medium text-muted-foreground hover:text-foreground text-xs hover:underline underline-offset-4 transition"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-6 py-12 text-muted-foreground text-sm">
              Add your first product to see it here.
            </div>
          )}
        </div>
        {hasItems && (
          <div className="px-6 py-5 border-border border-t">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold text-foreground text-base">
                {formatPrice(total)}
              </span>
            </div>
            <P className="mt-1 text-muted-foreground text-xs">
              Shipping and taxes calculated at checkout.
            </P>
            <div className="flex flex-col gap-2 mt-4">
              <SheetClose asChild>
                <Button asChild className="w-full">
                  <Link href="/checkout">Checkout</Link>
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/cart">View cart</Link>
                </Button>
              </SheetClose>
            </div>
            <SheetClose asChild>
              <Link
                href="/"
                className="block mt-3 text-muted-foreground hover:text-foreground text-xs text-center hover:underline underline-offset-4 transition"
              >
                Continue shopping
              </Link>
            </SheetClose>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
