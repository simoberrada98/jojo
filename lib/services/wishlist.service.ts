import { createClient } from '@/lib/supabase/client';
import { logger } from '@/lib/utils/logger';
import type { ServiceResponse } from '@/types/service';

interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

export class WishlistService {
  private readonly supabase = createClient();
  private readonly tableName = 'wishlist_items';

  private get client() {
    return this.supabase;
  }

  private buildErrorResponse<T>(
    error: unknown,
    code: string,
    fallbackMessage: string,
    context?: Record<string, unknown>
  ): ServiceResponse<T> {
    logger.error(fallbackMessage, error, context);
    return {
      success: false,
      error: {
        code,
        message:
          error instanceof Error ? error.message : fallbackMessage,
        details: error instanceof Error ? error.message : String(error),
        retryable: false,
      },
    };
  }

  async addToWishlist(
    userId: string,
    productId: string
  ): Promise<ServiceResponse<WishlistItem>> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .insert({ user_id: userId, product_id: productId })
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error: unknown) {
      return this.buildErrorResponse<WishlistItem>(
        error,
        'WISHLIST_ADD_ERROR',
        'Failed to add to wishlist',
        { userId, productId }
      );
    }
  }

  async removeFromWishlist(
    userId: string,
    productId: string
  ): Promise<ServiceResponse<null>> {
    try {
      const { error } = await this.client
        .from(this.tableName)
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);

      if (error) throw error;

      return { success: true, data: null };
    } catch (error: unknown) {
      return this.buildErrorResponse<null>(
        error,
        'WISHLIST_REMOVE_ERROR',
        'Failed to remove from wishlist',
        { userId, productId }
      );
    }
  }

  async isProductWished(
    userId: string,
    productId: string
  ): Promise<ServiceResponse<boolean>> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 means no rows found

      return { success: true, data: !!data };
    } catch (error: unknown) {
      return this.buildErrorResponse<boolean>(
        error,
        'WISHLIST_CHECK_ERROR',
        'Failed to check wishlist status',
        { userId, productId }
      );
    }
  }

  async getWishlistItems(
    userId: string
  ): Promise<ServiceResponse<WishlistItem[]>> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error: unknown) {
      return this.buildErrorResponse<WishlistItem[]>(
        error,
        'WISHLIST_GET_ERROR',
        'Failed to get wishlist items',
        { userId }
      );
    }
  }
}

export const wishlistService = new WishlistService();
