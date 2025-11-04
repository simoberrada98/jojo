import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';
import { ServiceResponse } from '@/types/payment'; // Reusing ServiceResponse type

interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

export class WishlistService {
  private supabasePromise = createClient();

  private async getSupabaseClient() {
    return await this.supabasePromise;
  }

  async addToWishlist(
    userId: string,
    productId: string
  ): Promise<ServiceResponse<WishlistItem>> {
    try {
      const supabase = await this.getSupabaseClient();
      const { data, error } = await supabase
        .from('wishlist_items')
        .insert({ user_id: userId, product_id: productId })
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error: unknown) {
      logger.error('Failed to add to wishlist', error);
      return {
        success: false,
        error: {
          code: 'WISHLIST_ADD_ERROR',
          message: (error instanceof Error ? error.message : 'Failed to add to wishlist'),
          details: error,
          retryable: false,
        },
      };
    }
  }

  async removeFromWishlist(
    userId: string,
    productId: string
  ): Promise<ServiceResponse<null>> {
    try {
      const supabase = await this.getSupabaseClient();
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);

      if (error) throw error;

      return { success: true, data: null };
    } catch (error: unknown) {
      logger.error('Failed to remove from wishlist', error);
      return {
        success: false,
        error: {
          code: 'WISHLIST_REMOVE_ERROR',
          message: (error instanceof Error ? error.message : 'Failed to remove from wishlist'),
          details: error,
          retryable: false,
        },
      };
    }
  }

  async isProductWished(
    userId: string,
    productId: string
  ): Promise<ServiceResponse<boolean>> {
    try {
      const supabase = await this.getSupabaseClient();
      const { data, error } = await supabase
        .from('wishlist_items')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 means no rows found

      return { success: true, data: !!data };
    } catch (error: unknown) {
      logger.error('Failed to check wishlist status', error);
      return {
        success: false,
        error: {
          code: 'WISHLIST_CHECK_ERROR',
          message: (error instanceof Error ? error.message : 'Failed to check wishlist status'),
          details: error,
          retryable: false,
        },
      };
    }
  }

  async getWishlistItems(
    userId: string
  ): Promise<ServiceResponse<WishlistItem[]>> {
    try {
      const supabase = await this.getSupabaseClient();
      const { data, error } = await supabase
        .from('wishlist_items')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error: unknown) {
      logger.error('Failed to get wishlist items', error);
      return {
        success: false,
        error: {
          code: 'WISHLIST_GET_ERROR',
          message: (error instanceof Error ? error.message : 'Failed to get wishlist items'),
          details: error,
          retryable: false,
        },
      };
    }
  }
}

export const wishlistService = new WishlistService();
