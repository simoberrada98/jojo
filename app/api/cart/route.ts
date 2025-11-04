import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const revalidate = 0;

type CartItem = {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at?: string;
  updated_at?: string;
};

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ items: [] });
  }

  const { data, error } = await supabase
    .from('cart')
    .select('*')
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch cart', details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ items: (data || []) as CartItem[] });
}

interface CartItemInput {
  product_id: string;
  quantity: number;
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const items: CartItemInput[] = Array.isArray(body.items) ? body.items : [];

  const toDelete = items
    .filter((i) => Number(i.quantity) <= 0 && i.product_id)
    .map((i) => String(i.product_id));
  if (toDelete.length > 0) {
    await supabase
      .from('cart')
      .delete()
      .eq('user_id', user.id)
      .in('product_id', toDelete);
  }

  const toUpsert = items
    .filter((i) => Number(i.quantity) > 0 && i.product_id)
    .map((i) => ({
      user_id: user.id,
      product_id: String(i.product_id),
      quantity: Number(i.quantity),
    }));

  if (toUpsert.length > 0) {
    const { error: upsertError } = await supabase
      .from('cart')
      .upsert(toUpsert, { onConflict: 'user_id,product_id' });
    if (upsertError) {
      return NextResponse.json(
        { error: 'Failed to update cart', details: upsertError.message },
        { status: 500 }
      );
    }
  }

  const { data } = await supabase
    .from('cart')
    .select('*')
    .eq('user_id', user.id);

  return NextResponse.json({ items: (data || []) as CartItem[] });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('product_id');
  if (!productId) {
    return NextResponse.json(
      { error: 'product_id is required' },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from('cart')
    .delete()
    .eq('user_id', user.id)
    .eq('product_id', productId);

  if (error) {
    return NextResponse.json(
      { error: 'Failed to remove item', details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
