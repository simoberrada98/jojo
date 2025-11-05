import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { env } from '@/lib/config/env';

/**
 * Provides a singleton Supabase client authenticated with the service role key.
 * This should only be used in trusted server environments.
 */
export class SupabaseAdminService {
  private readonly client: SupabaseClient;

  constructor() {
    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase admin credentials are not configured.');
    }

    this.client = createClient(supabaseUrl, supabaseServiceKey);
  }

  getClient(): SupabaseClient {
    return this.client;
  }
}
