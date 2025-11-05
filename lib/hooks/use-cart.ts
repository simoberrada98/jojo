'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/contexts/auth-context';
import type { CartItem, Product } from '@/types/database';

type CartEntry = CartItem & { product: Product | null };

const isProduct = (candidate: unknown): candidate is Product =>
  !!candidate && typeof candidate === 'object' && 'id' in candidate;

export function useCart() {
  const [cart, setCart] = useState<CartEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const supabase = createClient();

  const fetchCart = useCallback(async () => {
    if (!user) {
      setCart([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('cart')
      .select(
        `
        *,
        product:products(*)
      `
      )
      .eq('user_id', user.id);

    if (!error && data) {
      const rows = data as Array<CartItem & { product?: unknown }>;
      const normalized: CartEntry[] = rows.map(({ product, ...rest }) => ({
        ...rest,
        product: isProduct(product) ? product : null,
      }));
      setCart(normalized);
    }
    setLoading(false);
  }, [user, supabase]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart, user, supabase]);

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!user) {
      throw new Error('Must be logged in to add to cart');
    }

    // Check if item already exists
    const existing = cart.find((item) => item.product_id === productId);

    if (existing) {
      // Update quantity
      const { error } = await supabase
        .from('cart')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id);

      if (error) throw error;
    } else {
      // Insert new item
      const { error } = await supabase
        .from('cart')
        .insert({ user_id: user.id, product_id: productId, quantity });

      if (error) throw error;
    }

    await fetchCart();
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (!user) return;

    if (quantity <= 0) {
      await removeFromCart(cartItemId);
      return;
    }

    const { error } = await supabase
      .from('cart')
      .update({ quantity })
      .eq('id', cartItemId);

    if (error) throw error;
    await fetchCart();
  };

  const removeFromCart = async (cartItemId: string) => {
    if (!user) return;

    const { error } = await supabase.from('cart').delete().eq('id', cartItemId);

    if (error) throw error;
    await fetchCart();
  };

  const clearCart = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('cart')
      .delete()
      .eq('user_id', user.id);

    if (error) throw error;
    await fetchCart();
  };

  const total = cart.reduce((sum, item) => {
    const price = item.product?.base_price ?? 0;
    return sum + price * item.quantity;
  }, 0);

  return {
    cart,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    total,
    itemCount: cart.length,
  };
}
