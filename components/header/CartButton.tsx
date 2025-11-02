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
  const amountToFreeShipping = Math.max(
    0,
    FREE_SHIPPING_THRESHOLD - total
  );

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
                className="-top-2 -right-2 absolute flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-medium text-accent-foreground shadow-sm"
                aria-hidden
              >
                {derivedCount}
              </motion.span>
            )}
          </AnimatePresence>
        </MotionButton>
      </SheetTrigger>
      <SheetContent side="right" className="flex h-full flex-col p-0 sm:max-w-md">
        <div className="border-b border-border px-6 pb-4 pt-6">
          <SheetHeader className="items-start text-left">
            <SheetTitle className="text-xl font-semibold">Your cart</SheetTitle>
            <SheetDescription className="text-sm text-muted-foreground">
              {hasItems
                ? `${derivedCount} item${derivedCount === 1 ? '' : 's'} ready to ship`
                : 'Your cart is empty right now.'}
            </SheetDescription>
          </SheetHeader>
        </div>
        {hasItems && (
          <div className="border-b border-border px-6 py-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                You&apos;re {formatPrice(amountToFreeShipping)} away from free shipping
              </span>
              <span className="font-medium text-foreground">
                {formatPrice(FREE_SHIPPING_THRESHOLD)}
              </span>
            </div>
            <Progress value={shippingProgress} className="mt-2 h-2" />
          </div>
        )}
        {hasItems && (
          <div className="flex items-center justify-between px-6 py-3 text-sm">
            <p className="font-medium text-foreground">
              {derivedCount} product{derivedCount === 1 ? '' : 's'}
            </p>
            <button
              type="button"
              onClick={clearCart}
              className="text-muted-foreground underline-offset-4 transition hover:text-foreground hover:underline"
            >
              Clear all
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">
          {hasItems ? (
            <ul className="divide-y divide-border">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3 px-6 py-4 text-sm">
                  <Link
                    href={`/product/${item.handle}`}
                    className="block h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-border"
                  >
                    <ProductImage
                      category={item.category}
                      image={item.image}
                      className="h-full w-full object-cover"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/product/${item.handle}`}
                          className="block max-w-[200px] truncate text-sm font-medium text-foreground"
                        >
                          {item.name}
                        </Link>
                        <span className="mt-1 block text-xs text-muted-foreground">
                          {formatPrice(item.priceUSD)}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-foreground">
                        {formatPrice(item.priceUSD * item.quantity)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex h-9 items-center overflow-hidden rounded-md border border-input">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="flex h-full w-10 items-center justify-center border-r border-input text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="px-3 text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="flex h-full w-10 items-center justify-center border-l border-input text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemove(item)}
                        className="text-xs font-medium text-muted-foreground underline-offset-4 transition hover:text-foreground hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-6 py-12 text-sm text-muted-foreground">
              Add your first product to see it here.
            </div>
          )}
        </div>
        {hasItems && (
          <div className="border-t border-border px-6 py-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-base font-semibold text-foreground">
                {formatPrice(total)}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Shipping and taxes calculated at checkout.
            </p>
            <div className="mt-4 flex flex-col gap-2">
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
                className="mt-3 block text-center text-xs text-muted-foreground underline-offset-4 transition hover:text-foreground hover:underline"
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
