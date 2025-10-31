"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/contexts/auth-context";
import type { WishlistItem, Product } from "@/lib/types/database";

export function useWishlist() {
  const [wishlist, setWishlist] = useState<
    (WishlistItem & { product: Product })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const supabase = createClient();

  const fetchWishlist = async () => {
    if (!user) {
      setWishlist([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("wishlist")
      .select(
        `
        *,
        product:products(*)
      `
      )
      .eq("user_id", user.id);

    if (!error && data) {
      setWishlist(data as any);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWishlist();
  }, [user, supabase]);

  const addToWishlist = async (productId: string) => {
    if (!user) {
      throw new Error("Must be logged in to add to wishlist");
    }

    const { error } = await supabase
      .from("wishlist")
      .insert({ user_id: user.id, product_id: productId });

    if (error) throw error;
    await fetchWishlist();
  };

  const removeFromWishlist = async (productId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("wishlist")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", productId);

    if (error) throw error;
    await fetchWishlist();
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => item.product_id === productId);
  };

  return {
    wishlist,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  };
}
