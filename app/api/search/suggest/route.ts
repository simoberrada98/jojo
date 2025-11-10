import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';

const LIST_CACHE_MAX_AGE_SECONDS = 60;
const STALE_WHILE_REVALIDATE_SECONDS = 300;

function jsonWithCache<T>(payload: T, maxAgeSeconds: number) {
  const response = NextResponse.json(payload);
  response.headers.set(
    'Cache-Control',
    `public, s-maxage=${maxAgeSeconds}, stale-while-revalidate=${STALE_WHILE_REVALIDATE_SECONDS}`
  );
  return response;
}

function sanitizeSearchTerm(input: string | null): string {
  if (!input) return '';
  const cleaned = input
    .replace(/[,%()]/g, ' ')
    .replace(/[\%_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const params = url.searchParams;
  const rawQ = params.get('q') ?? '';
  const q = sanitizeSearchTerm(rawQ);

  try {
    logger?.api?.('GET', '/api/search/suggest', { q });
    const supabase = await createClient();

    if (!q || q.length < 2) {
      return jsonWithCache({ suggestions: [] }, LIST_CACHE_MAX_AGE_SECONDS);
    }

    // Suggest product names and categories
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, slug, category')
      .eq('is_active', true)
      .eq('is_archived', false)
      .or(`name.ilike.%${q}%,category.ilike.%${q}%`)
      .order('created_at', { ascending: false })
      .limit(8);

    if (error) throw error;

    const suggestions = (products || []).map((p) => ({
      type: 'product',
      label: p.name as string,
      value: p.slug as string,
      category: p.category as string,
    }));

    return jsonWithCache({ suggestions }, LIST_CACHE_MAX_AGE_SECONDS);
  } catch (error) {
    const isTimeout = error instanceof Error && /timed out/i.test(error.message);
    const status = isTimeout ? 504 : 500;
    logger?.error?.('/api/search/suggest failure', error, { q });
    return NextResponse.json({ suggestions: [] }, { status });
  }
}

