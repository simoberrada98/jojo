import 'server-only';

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { supabaseConfig } from '@/lib/supabase/config';
import { env } from '@/lib/config/env';
import { logger } from '@/lib/utils/logger';

/**
 * Guest User Service
 * Handles guest orders and converts guests to registered users
 */
export class GuestUserService {
  private client: SupabaseClient;

  constructor(supabaseUrl?: string, serviceKey?: string) {
    const url = supabaseUrl || supabaseConfig.url;
    const key = serviceKey || env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!url || !key) {
      throw new Error('Supabase credentials are required');
    }
    
    this.client = createClient(url, key);
  }

  /**
   * Get or create a user ID for a guest checkout
   * 1. If user is authenticated, use their ID
   * 2. If email exists in profiles, use that user's ID
   * 3. Otherwise create a guest user entry and send invitation
   */
  async getOrCreateUserIdForGuest(options: {
    userId?: string | null;
    email?: string;
    name?: string;
    phone?: string;
  }): Promise<{ userId: string; isGuest: boolean }> {
    const { userId, email, name, phone } = options;

    // 1. User is authenticated - use their ID
    if (userId) {
      return { userId, isGuest: false };
    }

    // 2. No email provided - use system guest user
    if (!email) {
      logger.warn('No user ID or email provided for order, using system guest user');
      return { 
        userId: '00000000-0000-0000-0000-000000000000',
        isGuest: true 
      };
    }

    // 3. Check if email exists in auth.users
    const { data: existingUser, error: userError } = await this.client.auth.admin.listUsers();
    
    if (!userError && existingUser?.users) {
      const matchedUser = existingUser.users.find(u => u.email === email);
      if (matchedUser) {
        logger.info('Found existing user by email', { email, userId: matchedUser.id });
        return { userId: matchedUser.id, isGuest: false };
      }
    }

    // 4. Email doesn't exist - create guest profile and send invitation
    try {
      const guestUser = await this.createGuestUserAndInvite({
        email,
        name,
        phone,
      });

      return { userId: guestUser.userId, isGuest: true };
    } catch (error) {
      logger.error('Failed to create guest user', error as Error, { email });
      // Fallback to system guest user
      return {
        userId: '00000000-0000-0000-0000-000000000000',
        isGuest: true,
      };
    }
  }

  /**
   * Create a guest user entry and send signup invitation
   */
  private async createGuestUserAndInvite(options: {
    email: string;
    name?: string;
    phone?: string;
  }): Promise<{ userId: string; invited: boolean }> {
    const { email, name, phone } = options;

    // Create guest user in profiles table with metadata
    // This creates a placeholder that can be claimed later
    const guestId = crypto.randomUUID();
    
    // Insert guest profile with only fields that exist in schema
    const { data: profile, error: profileError} = await this.client
      .from('profiles')
      .insert({
        id: guestId,
        email,
        full_name: name || null,
        phone: phone || null,
        role: 'guest', // Mark as guest via role field
      })
      .select()
      .single();

    if (profileError) {
      logger.error('Failed to create guest profile', profileError);
      throw new Error('Failed to create guest profile');
    }

    // Send invitation email via Supabase Auth
    try {
      const { data: inviteData, error: inviteError } = await this.client.auth.admin.inviteUserByEmail(
        email,
        {
          data: {
            full_name: name,
            phone: phone,
            invited_as_guest: true,
            guest_profile_id: guestId,
          },
          redirectTo: `${env.NEXT_PUBLIC_BASE_URL || env.BASE_URL}/auth/complete-profile`,
        }
      );

      if (inviteError) {
        logger.warn('Failed to send invitation email', inviteError, { email });
        // Don't fail the order if invitation fails
        return { userId: guestId, invited: false };
      }

      logger.info('Sent invitation to guest user', { email, userId: guestId });
      return { userId: guestId, invited: true };
    } catch (error) {
      logger.warn('Error sending invitation', error as Error, { email });
      return { userId: guestId, invited: false };
    }
  }

  /**
   * Convert a guest profile to a full user after signup
   */
  async convertGuestToUser(guestId: string, userId: string): Promise<boolean> {
    try {
      // Update the guest profile to link it to the real user
      const { error } = await this.client
        .from('profiles')
        .update({
          role: 'user', // Change from guest to user
        })
        .eq('id', guestId);

      if (error) {
        logger.error('Failed to convert guest to user', error);
        return false;
      }

      // Update any orders that were created with the guest ID
      await this.client
        .from('orders')
        .update({ user_id: userId })
        .eq('user_id', guestId);

      logger.info('Converted guest to full user', { guestId, userId });
      return true;
    } catch (error) {
      logger.error('Error converting guest to user', error as Error);
      return false;
    }
  }

  /**
   * Get guest orders for conversion
   */
  async getGuestOrders(guestId: string) {
    const { data, error } = await this.client
      .from('orders')
      .select('*')
      .eq('user_id', guestId)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Failed to fetch guest orders', error);
      return [];
    }

    return data || [];
  }
}

export function createGuestUserService(
  supabaseUrl?: string,
  serviceKey?: string
): GuestUserService {
  return new GuestUserService(supabaseUrl, serviceKey);
}

export const guestUserService = createGuestUserService();
