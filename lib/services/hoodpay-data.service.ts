import type { SupabaseClient } from '@supabase/supabase-js';

import { logger } from '@/lib/utils/logger';

export type SupabaseInsertResult<T> = {
  data: T[];
};

export class HoodpayDataService {
  constructor(private readonly client: SupabaseClient) {}

  /**
   * Persist raw Hoodpay payment rows into Supabase.
   */
  async savePayments<T>(
    payments: T[],
    table: string = 'hoodpay_payments'
  ): Promise<SupabaseInsertResult<T>> {
    if (!Array.isArray(payments)) {
      throw new TypeError('Payments payload must be an array.');
    }

    if (payments.length === 0) {
      return { data: [] };
    }

    const { data, error } = await this.client.from(table).insert(payments).select();

    if (error) {
      logger.error('Failed to persist Hoodpay payments', error);
      throw error;
    }

    return { data: (data ?? []) as T[] };
  }

  getClient(): SupabaseClient {
    return this.client;
  }
}
