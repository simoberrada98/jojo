import 'server-only';
import { createClient } from '@/lib/supabase/server';
import PageLayout from '@/components/layout/PageLayout';
import { H1, Muted } from '@/components/ui/typography';

type Order = {
  id: string;
  total_amount: number;
  currency: string;
  status: string;
  created_at: string;
  items?: Array<{
    id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
};

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

async function getOrders() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, orders: [] as Order[] };

  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (ordersError) return { user, orders: [] as Order[] };

  const ids = (orders || []).map((o) => o.id);
  if (ids.length === 0) return { user, orders: [] as Order[] };

  const { data: items } = await supabase
    .from('order_items')
    .select('*')
    .in('order_id', ids);

  const itemsByOrder = new Map<string, Order['items']>();
  for (const item of (items as OrderItem[]) || []) {
    const arr = itemsByOrder.get(item.order_id) || [];
    arr.push({
      id: item.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: Number(item.unit_price),
      total_price: Number(item.total_price),
    });
    itemsByOrder.set(item.order_id, arr);
  }

  const output = ((orders as Order[]) || []).map((o) => ({
    id: o.id as string,
    total_amount: Number(o.total_amount),
    currency: o.currency as string,
    status: o.status as string,
    created_at: o.created_at as string,
    items: itemsByOrder.get(o.id) || [],
  }));

  return { user, orders: output };
}

export default async function OrdersPage() {
  const { user, orders } = await getOrders();

  return (
    <PageLayout>
      <main className="pt-20">
        <section className="mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-5xl">
          <H1 className="mb-6 text-3xl">My Orders</H1>
          {!user ? (
            <Muted>Please sign in to view your orders.</Muted>
          ) : orders.length === 0 ? (
            <Muted>No orders yet. Your recent orders will appear here.</Muted>
          ) : (
            <div className="space-y-4">
              {orders.map((o) => (
                <div
                  key={o.id}
                  className="bg-card p-4 border border-border rounded-lg"
                >
                  <div className="flex justify-between items-center">
                    <div className="font-semibold">
                      Order #{o.id.slice(0, 8)}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {new Date(o.created_at).toLocaleString('en-US')}
                    </div>
                  </div>
                  <div className="flex justify-between mt-2 text-sm">
                    <div>
                      <span className="text-foreground/70">Status:</span>{' '}
                      <span className="font-medium">{o.status}</span>
                    </div>
                    <div>
                      <span className="text-foreground/70">Total:</span>{' '}
                      <span className="font-semibold">
                        {o.total_amount.toFixed(2)} {o.currency}
                      </span>
                    </div>
                  </div>
                  {o.items && o.items.length > 0 && (
                    <div className="mt-3 text-sm">
                      <div className="mb-1 text-foreground/70">Items</div>
                      <ul className="space-y-1 pl-5 list-disc">
                        {o.items.map((it) => (
                          <li key={it.id}>
                            <span className="text-foreground/80">
                              {it.product_id}
                            </span>{' '}
                            × {it.quantity} — {it.total_price.toFixed(2)}{' '}
                            {o.currency}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </PageLayout>
  );
}
