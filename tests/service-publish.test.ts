import { describe, it, expect, vi } from 'vitest';
import { publishReviewsForGtin } from '@/lib/services/reviews/amazon-reviews.service';
import { SupabaseAdminService } from '@/lib/services/supabase-admin.service';

// Mock Supabase client methods used in publishReviewsForGtin
const mockFrom = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockMaybeSingle = vi.fn();
const mockUpsert = vi.fn();

vi.spyOn(SupabaseAdminService.prototype, 'getClient').mockReturnValue({
  from: (table: string) => {
    if (table === 'products') {
      return {
        select: mockSelect.mockReturnValue({
          eq: mockEq.mockReturnValue({ maybeSingle: mockMaybeSingle }),
        }),
      } as any;
    }
    if (table === 'product_reviews') {
      return {
        upsert: mockUpsert.mockReturnValue({ select: () => ({ data: [], error: null }) }),
      } as any;
    }
    return {} as any;
  },
} as any);

describe('publishReviewsForGtin', () => {
  it('returns zeroes when product not found', async () => {
    mockMaybeSingle.mockResolvedValueOnce({ data: null, error: null });
    const res = await publishReviewsForGtin('0000000000000');
    expect(res).toEqual({ inserted: 0, updated: 0 });
  });
});

