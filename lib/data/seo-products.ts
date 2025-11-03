import 'server-only';
import { logger } from '@/lib/utils/logger';

interface SeoProduct {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  short_description?: string | null;
  category: string;
  base_price: number;
  compare_at_price: number | null;
  brand: string | null;
  stock_quantity: number;
  featured_image_url: string | null;
  updated_at: string;
  meta_title: string | null;
  meta_description: string | null;
  hash_rate: string | null;
  power_consumption: string | null;
  algorithm: string | null;
  efficiency: string | null;
  noise_level?: string | null;
}

const SUPABASE_REST_PATH = 'products';
const SUPABASE_REST_SELECT = [
  'id',
  'slug',
  'name',
  'description',
  'short_description',
  'category',
  'base_price',
  'compare_at_price',
  'brand',
  'stock_quantity',
  'featured_image_url',
  'updated_at',
  'meta_title',
  'meta_description',
  'hash_rate',
  'power_consumption',
  'algorithm',
  'efficiency',
].join(',');

function getSupabaseInfo() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

  if (!url || !anonKey) {
    throw new Error('Missing Supabase configuration for SEO helpers');
  }

  return { url, anonKey };
}

export async function fetchActiveProductsForSeo(): Promise<SeoProduct[]> {
  const { url, anonKey } = getSupabaseInfo();
  const requestUrl = new URL(`${url}/rest/v1/${SUPABASE_REST_PATH}`);

  requestUrl.searchParams.set('select', SUPABASE_REST_SELECT);
  requestUrl.searchParams.set('order', 'updated_at.desc');
  requestUrl.searchParams.set('is_active', 'eq.true');
  requestUrl.searchParams.set('is_archived', 'eq.false');

  const response = await fetch(requestUrl, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      Accept: 'application/json',
    },
    next: {
      revalidate: 60 * 60, // 1 hour
    },
  });

  if (!response.ok) {
    const details = await response.text();
    logger.error('Failed to fetch Supabase products for SEO', undefined, {
      status: response.status,
      details,
    });
    return [];
  }

  return (await response.json()) as SeoProduct[];
}

export type { SeoProduct };
