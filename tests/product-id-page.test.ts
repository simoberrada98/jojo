import { describe, it, expect, vi } from 'vitest';

// Mock next/navigation to capture redirects and notFound
vi.mock('next/navigation', () => {
  return {
    redirect: vi.fn(),
    notFound: vi.fn(() => {
      // Simulate Next.js throwing a notFound; we just mark it
    }),
  };
});

import { redirect, notFound } from 'next/navigation';
import ProductPage from '@/app/product/[id]/page';

interface ProductPageProps {
  params: {
    id: string;
  };
}

describe('Product ID redirect page', () => {
  it('redirects to slug route when id is present', async () => {
    const params = Promise.resolve({ id: 'abc-123' });
    await ProductPage({ params } as ProductPageProps);
    expect(redirect).toHaveBeenCalledWith('/products/abc-123');
    expect(notFound).not.toHaveBeenCalled();
  });

  it('triggers notFound when id is missing or empty', async () => {
    const paramsEmpty = Promise.resolve({ id: '' });
    await ProductPage({ params: paramsEmpty } as ProductPageProps);
    expect(notFound).toHaveBeenCalled();
  });
});

