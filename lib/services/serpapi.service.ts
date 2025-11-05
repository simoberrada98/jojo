import { env } from '@/lib/config/env';
import { logger } from '@/lib/utils/logger';

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

  constructor() {
    this.apiKey = env.SERPAPI_API_KEY;
    if (!this.apiKey) {
      logger.warn('SERPAPI_API_KEY is not configured.');
      // Optionally throw an error or disable functionality
    }
  }

  async getGoogleProductReviews(
    productQuery: string,
    limit: number = 5
  ): Promise<SerpApiReview[]> {
    if (!this.apiKey) {
      return [];
    }

    try {
      const params = new URLSearchParams({
        api_key: this.apiKey,
        engine: 'google_product_reviews',
        q: productQuery,
        num: String(limit),
      });

      const url = `${this.baseUrl}?${params.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(
          `SerpApi request failed with status ${response.status}: ${errorText}`,
          { productQuery }
        );
        return [];
      }

      const data: SerpApiResult = await response.json();

      // SerpApi can return reviews in different structures
      const reviews =
        data.reviews_results || data.product_results?.reviews || [];

      return reviews.map((review) => ({
        title: review.title || 'No title',
        snippet: review.snippet || 'No snippet',
        date: review.date || 'Unknown date',
        rating: review.rating || 0,
        source: review.source || 'Unknown source',
        link: review.link || '#',
      }));
    } catch (error) {
      logger.error('Error fetching product reviews from SerpApi', error, {
        productQuery,
      });
      return [];
    }
  }
}

export const serpApiService = new SerpApiService();
