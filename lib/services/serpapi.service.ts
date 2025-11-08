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
  body?: string;
}

interface SerpApiResult {
  product_results?: {
    reviews?: SerpApiReview[];
  };
  reviews_results?: SerpApiReview[];
  reviews?: SerpApiReview[];
  organic_results?: Array<{
    asin?: string;
    title?: string;
    rating?: number;
    reviews?: number;
    link?: string;
  }>;
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
    productQuery: string, // GTIN or fallback query
    limit: number = 5
  ): Promise<SerpApiReview[]> {
    if (!this.apiKey) {
      return [];
    }

    try {
      // 1) Search Amazon by GTIN to resolve ASIN
      const searchStart = Date.now();
      const searchParams = new URLSearchParams({
        api_key: this.apiKey,
        engine: 'amazon',
        k: productQuery,
        amazon_domain: 'amazon.com',
      });

      const searchUrl = `${this.baseUrl}.json?${searchParams.toString()}`;
      logger.groupStart('SerpAPI Request: Amazon Search (resolve ASIN)', {
        timestamp: new Date().toISOString(),
        gtin: productQuery,
        engine: 'amazon',
        request_url: searchUrl,
        params: Object.fromEntries(searchParams.entries()),
        target: { asin: null, amazon_domain: 'amazon.com' },
      });
      const searchResp = await fetch(searchUrl);
      const searchStatus = searchResp.status;
      const searchHeaders: Record<string, string> = {};
      searchResp.headers.forEach((v, k) => (searchHeaders[k] = v));

      if (!searchResp.ok) {
        const errorText = await searchResp.text();
        logger.error(
          'SerpAPI Amazon search failed',
          { message: errorText, status_code: searchResp.status },
          { gtin: productQuery, request_url: searchUrl }
        );
        logger.debug('SerpAPI Response Meta', {
          status_code: searchStatus,
          response_headers: searchHeaders,
          fetch_duration_ms: Date.now() - searchStart,
        });
        await this.serpStorage?.storeResponse({
          provider: 'serpapi',
          engine: 'amazon',
          query: productQuery,
          gtin: productQuery,
          request_url: searchUrl,
          status_code: searchStatus,
          response_headers: searchHeaders,
          raw_response: null,
          response_size_bytes: undefined,
          fetch_duration_ms: Date.now() - searchStart,
          error_message: errorText,
          collected_at: new Date().toISOString(),
        });
        logger.groupEnd();
        return [];
      }

      const searchData: SerpApiResult = await searchResp.json();
      const searchRawStr = JSON.stringify(searchData);
      const searchSizeBytes = Buffer.byteLength(searchRawStr, 'utf8');
      logger.debug('SerpAPI Response Meta', {
        status_code: searchStatus,
        response_headers: searchHeaders,
        response_size_bytes: searchSizeBytes,
        fetch_duration_ms: Date.now() - searchStart,
      });
      logger.debug('SerpAPI Raw Response', searchData);
      await this.serpStorage?.storeResponse({
        provider: 'serpapi',
        engine: 'amazon',
        query: productQuery,
        gtin: productQuery,
        request_url: searchUrl,
        status_code: searchStatus,
        response_headers: searchHeaders,
        raw_response: searchData as unknown as Record<string, unknown>,
        response_size_bytes: searchSizeBytes,
        fetch_duration_ms: Date.now() - searchStart,
        collected_at: new Date().toISOString(),
      });

      const asin = searchData.organic_results?.[0]?.asin || null;
      logger.debug('Resolved ASIN from Amazon search', { asin });
      logger.groupEnd();

      // 2) If we have an ASIN, fetch reviews via amazon_reviews engine
      if (asin) {
        const reviewsStart = Date.now();
        const reviewsParams = new URLSearchParams({
          api_key: this.apiKey,
          engine: 'amazon_reviews',
          asin,
          amazon_domain: 'amazon.com',
        });
        const reviewsUrl = `${this.baseUrl}.json?${reviewsParams.toString()}`;
        logger.groupStart('SerpAPI Request: Amazon Reviews by ASIN', {
          timestamp: new Date().toISOString(),
          gtin: productQuery,
          asin,
          engine: 'amazon_reviews',
          request_url: reviewsUrl,
          params: Object.fromEntries(reviewsParams.entries()),
          target: { asin, amazon_domain: 'amazon.com' },
        });
        const reviewsResp = await fetch(reviewsUrl);
        const reviewsStatus = reviewsResp.status;
        const reviewsHeaders: Record<string, string> = {};
        reviewsResp.headers.forEach((v, k) => (reviewsHeaders[k] = v));
        if (!reviewsResp.ok) {
          const errorText = await reviewsResp.text();
          logger.error(
            'SerpAPI amazon_reviews request failed',
            { message: errorText, status_code: reviewsResp.status },
            { gtin: productQuery, asin, request_url: reviewsUrl }
          );
          logger.debug('SerpAPI Response Meta', {
            status_code: reviewsStatus,
            response_headers: reviewsHeaders,
            fetch_duration_ms: Date.now() - reviewsStart,
          });
          await this.serpStorage?.storeResponse({
            provider: 'serpapi',
            engine: 'amazon_reviews',
            query: productQuery,
            gtin: productQuery,
            request_url: reviewsUrl,
            status_code: reviewsStatus,
            response_headers: reviewsHeaders,
            raw_response: null,
            response_size_bytes: undefined,
            fetch_duration_ms: Date.now() - reviewsStart,
            error_message: errorText,
            collected_at: new Date().toISOString(),
          });
          logger.groupEnd();
          return [];
        }

        const reviewsData: SerpApiResult = await reviewsResp.json();
        const reviewsRawStr = JSON.stringify(reviewsData);
        const reviewsSizeBytes = Buffer.byteLength(reviewsRawStr, 'utf8');
        logger.debug('SerpAPI Response Meta', {
          status_code: reviewsStatus,
          response_headers: reviewsHeaders,
          response_size_bytes: reviewsSizeBytes,
          fetch_duration_ms: Date.now() - reviewsStart,
        });
        logger.debug('SerpAPI Raw Response', reviewsData);
        await this.serpStorage?.storeResponse({
          provider: 'serpapi',
          engine: 'amazon_reviews',
          query: productQuery,
          gtin: productQuery,
          request_url: reviewsUrl,
          status_code: reviewsStatus,
          response_headers: reviewsHeaders,
          raw_response: reviewsData as unknown as Record<string, unknown>,
          response_size_bytes: reviewsSizeBytes,
          fetch_duration_ms: Date.now() - reviewsStart,
          collected_at: new Date().toISOString(),
        });

        // Persist the reviews payload into serpapi_amazon_data cache table
        const supabase = this.supabaseAdminService.getClient();
        const { error: supabaseError } = await supabase
          .from('serpapi_amazon_data')
          .upsert(
            {
              gtin: productQuery,
              raw_response: reviewsData as unknown as any,
              last_fetched_at: new Date().toISOString(),
            },
            { onConflict: 'gtin' }
          );
        if (supabaseError) {
          logger.error('Error saving SerpApi response to Supabase', supabaseError, {
            productQuery,
          });
        }

        const reviewsArr =
          reviewsData.reviews_results ||
          reviewsData.product_results?.reviews ||
          reviewsData.reviews ||
          [];
        logger.debug('Parsed Amazon Reviews', {
          count: reviewsArr.length,
          sample: reviewsArr.slice(0, 3),
        });
        logger.groupEnd();
        return reviewsArr.slice(0, limit).map((review) => ({
          title: review.title || 'No title',
          snippet: review.snippet || (review.body ?? 'No snippet'),
          date: review.date || 'Unknown date',
          rating: review.rating || 0,
          source: review.source || 'Unknown source',
          link: review.link || '#',
        }));
      }

      // Fallback: attempt to parse reviews from the search response (often none)
      const fallbackReviews =
        searchData.reviews_results || searchData.product_results?.reviews || searchData.reviews || [];
      const supabase = this.supabaseAdminService.getClient();
      const { error: fallbackUpsertErr } = await supabase
        .from('serpapi_amazon_data')
        .upsert(
          {
            gtin: productQuery,
            raw_response: searchData as unknown as any,
            last_fetched_at: new Date().toISOString(),
          },
          { onConflict: 'gtin' }
        );
      if (fallbackUpsertErr) {
        logger.error('Error saving fallback SerpApi response to Supabase', fallbackUpsertErr, {
          productQuery,
        });
      }
      logger.debug('Parsed Amazon Reviews (fallback search)', {
        count: fallbackReviews.length,
        sample: fallbackReviews.slice(0, 3),
      });
      return fallbackReviews.slice(0, limit).map((review) => ({
        title: review.title || 'No title',
        snippet: review.snippet || (review.body ?? 'No snippet'),
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
        engine: 'amazon_reviews',
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
