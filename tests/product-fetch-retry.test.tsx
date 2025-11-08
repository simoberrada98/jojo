import { describe, it, expect, vi } from 'vitest';
import { fetchWithRetry } from '@/lib/utils/fetch-with-retry';

describe('fetchWithRetry', () => {
  it('retries on network errors and eventually succeeds', async () => {
    const mockFetch = vi.fn()
      .mockRejectedValueOnce(new Error('Failed to fetch'))
      .mockRejectedValueOnce(new Error('Failed to fetch'))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    // @ts-expect-error override global
    global.fetch = mockFetch;

    const res = await fetchWithRetry('/api/products?limit=100');
    expect(res.ok).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it('does not retry on 400 errors', async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce(new Response('Bad', { status: 400 }));
    // @ts-expect-error override global
    global.fetch = mockFetch;

    await expect(fetchWithRetry('/api/products')).rejects.toThrow(/HTTP 400/);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});

