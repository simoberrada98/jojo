
import { SerpApiService } from '@/lib/services/serpapi.service';
import { SupabaseAdminService } from '@/lib/services/supabase-admin.service';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock SupabaseAdminService
vi.mock('@/lib/services/supabase-admin.service', () => {
  const mockUpsert = vi.fn().mockResolvedValue({ error: null });
  const mockFrom = vi.fn(() => ({ upsert: mockUpsert }));
  const mockGetClient = vi.fn(() => ({ from: mockFrom }));
  return {
    SupabaseAdminService: vi.fn(() => ({
      getClient: mockGetClient,
    })),
  };
});

// Mock fetch
global.fetch = vi.fn();

describe('SerpApiService', () => {
  let serpApiService: SerpApiService;
  let supabaseAdminService: SupabaseAdminService;

  beforeEach(() => {
    serpApiService = new SerpApiService();
    supabaseAdminService = new SupabaseAdminService();
    vi.clearAllMocks();
  });

  it('should fetch reviews and store the raw response in Supabase', async () => {
    const productQuery = '1234567890123'; // Example GTIN
    const mockSerpApiResponse = {
      search_metadata: { id: '123' },
      reviews_results: [
        {
          title: 'Great product!',
          snippet: 'I loved this product.',
          date: '2023-01-01',
          rating: 5,
          source: 'Example Reviews',
          link: 'http://example.com/review',
        },
      ],
    };

    (fetch as vi.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockSerpApiResponse),
    });

    await serpApiService.getGoogleProductReviews(productQuery);

    const supabaseClient = supabaseAdminService.getClient();
    const fromClause = supabaseClient.from('serpapi_amazon_data');
    const upsertClause = (fromClause as any).upsert;

    expect(supabaseClient.from).toHaveBeenCalledWith('serpapi_amazon_data');
    expect(upsertClause).toHaveBeenCalledWith({
      gtin: productQuery,
      raw_response: mockSerpApiResponse,
    });
  });
});
