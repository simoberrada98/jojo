import { describe, it, expect, vi } from 'vitest';
import { NextResponse } from 'next/server';

// Mock supabase SSR client creation
vi.mock('@supabase/ssr', () => {
  return {
    createServerClient: vi.fn(() => {
      return {
        auth: {
          getUser: vi.fn(async () => ({ data: { user: null } })),
        },
      } as { auth: { getUser: () => Promise<{ data: { user: null } }> } };
    }),
  };
});

import { proxy } from '@/proxy';

interface MockNextRequest {
  nextUrl: {
    pathname: string;
    clone(): URL;
  };
  headers: Map<string, string>;
  cookies: {
    getAll(): Array<{ name: string; value: string }>;
    set(name: string, value: string): void;
  };
}

function makeRequest(pathname: string) {
  const url = new URL(`http://localhost${pathname}`);
  const cookiesStore: Record<string, string> = {};
  return {
    nextUrl: {
      pathname: url.pathname,
      clone() {
        return new URL(url.toString());
      },
    },
    headers: new Map([['user-agent', 'test-agent']]),
    cookies: {
      getAll() {
        return Object.entries(cookiesStore).map(([name, value]) => ({ name, value }));
      },
      set(name: string, value: string) {
        cookiesStore[name] = value;
      },
    },
  } as MockNextRequest;
}

describe('proxy edge middleware routing', () => {
  it('redirects /shop to /collections/all', async () => {
    const req = makeRequest('/shop');
    const res = await proxy(req);
    expect(res).toBeInstanceOf(NextResponse);
    expect(res.headers.get('location')).toMatch(/\/collections\/all$/);
  });

  it('redirects unauthenticated dashboard requests to /auth/login', async () => {
    const req = makeRequest('/dashboard');
    const res = await proxy(req);
    expect(res.headers.get('location')).toMatch(/\/auth\/login$/);
  });

  it('does not redirect product pages', async () => {
    const req = makeRequest('/products/example-product');
    const res = await proxy(req);
    // NextResponse.next() does not set a Location header
    expect(res.headers.get('location')).toBeNull();
  });
});

