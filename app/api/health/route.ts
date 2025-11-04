import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateSupabaseConfig } from '@/lib/supabase/config';

export const revalidate = 0;

export async function GET() {
  const supabaseConfigured = validateSupabaseConfig();

  try {
    const supabase = await createClient();
    const { error, count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .eq('is_archived', false);

    const ok = !error;
    const status = ok && supabaseConfigured ? 200 : 500;

    return NextResponse.json(
      {
        ok,
        supabaseConfigured,
        productsCount: count ?? 0,
        error: error?.message ?? null,
      },
      { status }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { ok: false, supabaseConfigured, error: message },
      { status: 500 }
    );
  }
}
