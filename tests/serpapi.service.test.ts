import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SerpApiService } from '@/lib/services/serpapi.service';
import { SupabaseAdminService } from '@/lib/services/supabase-admin.service';

// Mock env
vi.mock('@/lib/config/env', () => ({
  env: {
    SERPAPI_API_KEY: 'test-key',
    NEXT_PUBLIC_SUPABASE_URL: 'http://localhost:54321',
    SUPABASE_SERVICE_ROLE_KEY: 'service-role',
  },
}));

// Mock Supabase client
const fromMock = vi.fn();
const supabaseClientMock = { from: fromMock } as any;

vi.mock('@/lib/services/supabase-admin.service', async (orig) => {
  const actual = await orig();
  return {
    ...actual,
    SupabaseAdminService: class {
      getClient() { return supabaseClientMock; }
    }
  };
});

// Mock fetch
const mockJson = vi.fn();
const mockText = vi.fn();
const headersFor = (h: Record<string,string>) => ({
  forEach: (cb: (val: string, key: string) => void) => Object.entries(h).forEach(([k,v]) => cb(v,k))
});

describe('SerpApiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('stores full response and updates cache table on success', async () => {
    const responseBody = { reviews_results: [{ title: 't', snippet: 's', date: 'd', rating: 4, source: 'x', link: 'l' }] };
    mockJson.mockResolvedValue(responseBody);
    const fetchMock = vi.spyOn(global, 'fetch' as any).mockResolvedValue({
      ok: true,
      status: 200,
      json: mockJson,
      headers: headersFor({ 'content-type': 'application/json' }),
    });

    // Supabase upsert mocks
    const upsertMock = vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ maybeSingle: vi.fn() }), error: null });
    fromMock.mockReturnValue({ upsert: upsertMock });

    const service = new SerpApiService();
    const reviews = await service.getGoogleProductReviews('1234567890');

    expect(fetchMock).toHaveBeenCalled();
    expect(upsertMock).toHaveBeenCalled();
    expect(reviews.length).toBe(1);
  });

  it('persists error metadata when response not ok', async () => {
    mockText.mockResolvedValue('Bad Request');
    const fetchMock = vi.spyOn(global, 'fetch' as any).mockResolvedValue({
      ok: false,
      status: 400,
      text: mockText,
      headers: headersFor({ 'content-type': 'application/json' }),
    });

    // Supabase upsert should not be called
    const upsertMock = vi.fn();
    fromMock.mockReturnValue({ upsert: upsertMock });

    const service = new SerpApiService();
    const reviews = await service.getGoogleProductReviews('1234567890');

    expect(fetchMock).toHaveBeenCalled();
    expect(upsertMock).not.toHaveBeenCalled();
    expect(reviews.length).toBe(0);
  });
});

