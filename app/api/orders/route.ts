import 'server-only';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const revalidate = 0;

type OrderRow = {
  id: string;
  user_id: string;
  total_amount: number;
  currency: string;
  status: string;
  shipping_address: unknown | null;
  billing_address: unknown | null;
  payment_method: string | null;
  created_at: string;
  updated_at: string;
};

type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
};

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch user's orders (RLS enforced)
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (ordersError) {
    return NextResponse.json(
      { error: 'Failed to fetch orders', details: ordersError.message },
      { status: 500 }
    );
  }

  const orderList = (orders || []) as OrderRow[];
  const orderIds = orderList.map((o) => o.id);

  if (orderIds.length === 0) {
    return NextResponse.json({ orders: [] });
  }

  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('*')
    .in('order_id', orderIds);

  if (itemsError) {
    return NextResponse.json(
      { error: 'Failed to fetch order items', details: itemsError.message },
      { status: 500 }
    );
  }

  const itemsByOrder = new Map<string, OrderItemRow[]>();
  for (const item of (items || []) as OrderItemRow[]) {
    const arr = itemsByOrder.get(item.order_id) || [];
    arr.push(item);
    itemsByOrder.set(item.order_id, arr);
  }

  const payload = orderList.map((o) => ({
    ...o,
    items: itemsByOrder.get(o.id) || [],
  }));

  return NextResponse.json({ orders: payload });
}
