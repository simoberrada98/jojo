import type { SupabaseClient } from '@supabase/supabase-js';
import { logger } from '@/lib/utils/logger';

export type SerpStorageRecord = {
  provider: string;
  engine: string;
  query: string;
  gtin?: string | null;
  request_url: string;
  status_code: number;
  response_headers?: Record<string, unknown> | null;
  raw_response?: Record<string, unknown> | null;
  response_size_bytes?: number | null;
  fetch_duration_ms?: number | null;
  collected_at?: string | null;
  error_message?: string | null;
  request_id?: string | null;
};

/**
 * Persists SERPAPI responses with metadata for audit and reprocessing.
 * Designed to handle large payloads by storing JSONB directly.
 */
export class SerpStorageService {
  constructor(private readonly client: SupabaseClient) {}

  async storeResponse(record: SerpStorageRecord) {
    const payload = {
      provider: record.provider || 'serpapi',
      engine: record.engine,
      query: record.query,
      gtin: record.gtin ?? null,
      request_url: record.request_url,
      status_code: record.status_code,
      response_headers: record.response_headers ?? null,
      raw_response: record.raw_response ?? null,
      response_size_bytes: record.response_size_bytes ?? null,
      fetch_duration_ms: record.fetch_duration_ms ?? null,
      collected_at: record.collected_at ?? new Date().toISOString(),
      error_message: record.error_message ?? null,
      request_id: record.request_id ?? null,
    };

    const { error } = await this.client
      .from('serpapi_responses')
      .insert(payload);

    if (error) {
      logger.error('Failed to persist SERPAPI response', error, {
        engine: record.engine,
        query: record.query,
      });
    }

    return { success: !error };
  }
}

