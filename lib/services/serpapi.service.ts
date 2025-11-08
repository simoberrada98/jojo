import { env } from '@/lib/config/env';
import { logger } from '@/lib/utils/logger';
import { SupabaseAdminService } from './supabase-admin.service';
import { SerpStorageService } from './serp-storage.service';

interface SerpApiReview {
  title: string;
  snippet: string;
  date: string;
  rating: number;
  source: string;
  link: string;
}

interface SerpApiResult {
  product_results?: {
    reviews?: SerpApiReview[];
  };
  reviews_results?: SerpApiReview[];
  // Add other relevant fields from SerpApi response if needed
}

export class SerpApiService {
  private apiKey: string;
  private baseUrl: string = 'https://serpapi.com/search';
  private supabaseAdminService: SupabaseAdminService;
  private serpStorage?: SerpStorageService;

  constructor() {
    this.apiKey = env.SERPAPI_API_KEY;
    if (!this.apiKey) {
      logger.warn('SERPAPI_API_KEY is not configured.');
      // Optionally throw an error or disable functionality
    }
    this.supabaseAdminService = new SupabaseAdminService();
    this.serpStorage = new SerpStorageService(this.supabaseAdminService.getClient());
  }

  async getGoogleProductReviews(
    productQuery: string, // Assuming productQuery is the GTIN
    limit: number = 5
  ): Promise<SerpApiReview[]> {
    if (!this.apiKey) {
      return [];
    }

    try {
      const start = Date.now();
      const params = new URLSearchParams({
        api_key: this.apiKey,
        engine: 'amazon',
        k: productQuery,
        amazon_domain: 'amazon.com',
      });

      const url = `${this.baseUrl}.json?${params.toString()}`;
      // Request initiation logging
      logger.groupStart('SerpAPI Request: Amazon Reviews', {
        timestamp: new Date().toISOString(),
        gtin: productQuery,
        engine: 'amazon',
        request_url: url,
        params: Object.fromEntries(params.entries()),
        target: { asin: null, amazon_domain: 'amazon.com' },
      });
      const response = await fetch(url);
      const status = response.status;
      const headersObj: Record<string, string> = {};
      response.headers.forEach((v, k) => (headersObj[k] = v));

      if (!response.ok) {
        const errorText = await response.text();
        // Error logging
        logger.error(
          `SerpAPI request failed`,
          { message: errorText, status_code: response.status },
          { gtin: productQuery, request_url: url }
        );
        logger.debug('SerpAPI Response Meta', {
          status_code: status,
          response_headers: headersObj,
          fetch_duration_ms: Date.now() - start,
        });
        // Persist error metadata for audit
        await this.serpStorage?.storeResponse({
          provider: 'serpapi',
          engine: 'amazon',
          query: productQuery,
          gtin: productQuery,
          request_url: url,
          status_code: status,
          response_headers: headersObj,
          raw_response: null,
          response_size_bytes: undefined,
          fetch_duration_ms: Date.now() - start,
          error_message: errorText,
          collected_at: new Date().toISOString(),
        });
        logger.groupEnd();
        return [];
      }

      const data: SerpApiResult = await response.json();
      const rawStr = JSON.stringify(data);
      const sizeBytes = Buffer.byteLength(rawStr, 'utf8');

      // Response handling logs
      logger.debug('SerpAPI Response Meta', {
        status_code: status,
        response_headers: headersObj,
        response_size_bytes: sizeBytes,
        fetch_duration_ms: Date.now() - start,
      });
      logger.debug('SerpAPI Raw Response', data);

      // Store the full raw response with metadata for audit
      await this.serpStorage?.storeResponse({
        provider: 'serpapi',
        engine: 'amazon',
        query: productQuery,
        gtin: productQuery,
        request_url: url,
        status_code: status,
        response_headers: headersObj,
        raw_response: data as unknown as Record<string, unknown>,
        response_size_bytes: sizeBytes,
        fetch_duration_ms: Date.now() - start,
        collected_at: new Date().toISOString(),
      });

      // Store the raw response in Supabase
      const supabase = this.supabaseAdminService.getClient();
      const { error: supabaseError } = await supabase
        .from('serpapi_amazon_data')
        .upsert({
          gtin: productQuery,
          raw_response: data as unknown as any,
          last_fetched_at: new Date().toISOString(),
        }, { onConflict: 'gtin' });

      if (supabaseError) {
        logger.error('Error saving SerpApi response to Supabase', supabaseError, {
          productQuery,
        });
      }

      // SerpApi can return reviews in different structures
      const reviews =
        data.reviews_results || data.product_results?.reviews || [];

      // Parsed review data structure
      logger.debug('Parsed Amazon Reviews', {
        count: reviews.length,
        sample: reviews.slice(0, 3),
      });
      logger.groupEnd();

      return reviews.map((review) => ({
        title: review.title || 'No title',
        snippet: review.snippet || 'No snippet',
        date: review.date || 'Unknown date',
        rating: review.rating || 0,
        source: review.source || 'Unknown source',
        link: review.link || '#',
      }));
    } catch (error) {
      // Error logging for exceptions (e.g., parsing failures, network issues)
      logger.error('Error fetching product reviews from SerpAPI', error, {
        gtin: productQuery,
      });
      // Persist exception metadata
      await this.serpStorage?.storeResponse({
        provider: 'serpapi',
        engine: 'amazon',
        query: productQuery,
        gtin: productQuery,
        request_url: `${this.baseUrl}.json`,
        status_code: 0,
        response_headers: null,
        raw_response: null,
        response_size_bytes: undefined,
        fetch_duration_ms: undefined,
        error_message:
          error instanceof Error ? error.message : 'Unknown SERPAPI error',
        collected_at: new Date().toISOString(),
      });
      logger.groupEnd();
      return [];
    }
  }
}

export const serpApiService = new SerpApiService();
