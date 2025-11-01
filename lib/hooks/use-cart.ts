'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/contexts/auth-context';
import type { CartItem, Product } from '@/types/database';

export function useCart() {
  const [cart, setCart] = useState<(CartItem & { product: Product })[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const supabase = createClient();

  const fetchCart = async () => {
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
      setCart(data as any);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCart();
  }, [user, supabase]);

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

  const total = cart.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );

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
