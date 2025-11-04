import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from '@/lib/supabase/config';
import { logger } from '@/lib/utils/logger';

type CollectionRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  position: number | null;
};

export const runtime = 'nodejs';
export const revalidate = 300;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get('q') ?? undefined;

  const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey, {
    auth: { persistSession: false },
  });

  try {
    let builder = supabase
      .from('collections')
      .select('id, name, slug, description, image_url, position')
      .order('position', { ascending: true });

    if (query) {
      builder = builder.ilike('name', `%${query}%`);
    }

    const { data, error } = await builder;
    if (error) {
      logger.error('Collection feed error', error, { query });
      return NextResponse.json(
        { items: [], query: query ?? null },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        items: (data as CollectionRow[]) ?? [],
        query: query ?? null,
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Collection feed exception', error as Error, { query });
    return NextResponse.json(
      { items: [], query: query ?? null },
      { status: 200 }
    );
  }
}
