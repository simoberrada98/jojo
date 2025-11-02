'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import type { DisplayProduct } from '@/types/product';
import type { CartItem } from '@/types/cart';

export type { CartItem };
import { PricingService } from '@/lib/services/pricing.service';
import { STORAGE_KEYS } from '@/lib/config/app.config';
import { logger } from '@/lib/utils/logger';

interface CartContextType {
  items: CartItem[];
  addItem: (product: DisplayProduct, quantity?: number) => void;
  removeItem: (productId: string | number) => void;
  updateQuantity: (productId: string | number, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  total: number;
  isHydrated: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem(STORAGE_KEYS.cart);
      if (savedCart) {
        try {
          setItems(JSON.parse(savedCart));
        } catch (e) {
          logger.error('Failed to load cart', e as Error);
        }
      }
    }
    setIsHydrated(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(items));
    }
  }, [items]);

  const addItem = (product: DisplayProduct, quantity?: number) => {
    const proposed = quantity ?? 1;
    const resolvedQuantity = Number.isFinite(proposed)
      ? Math.floor(proposed)
      : 1;
    const normalizedQuantity = Math.max(1, resolvedQuantity);

    setItems((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + normalizedQuantity }
            : item
        );
      }
      return [...current, { ...product, quantity: normalizedQuantity }];
    });
  };

  const removeItem = (productId: string | number) => {
    setItems((current) => current.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string | number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((current) =>
      current.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = PricingService.calculateItemCount(items);
  const total = PricingService.calculateSubtotal(items);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        total,
        isHydrated,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
