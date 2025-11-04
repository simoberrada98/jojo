-- Drop tables if they exist (destructive operation)
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;

-- Create the 'orders' table
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_amount numeric(10,2) NOT NULL,
  currency text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  shipping_address jsonb,
  billing_address jsonb,
  payment_method text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security for 'orders'
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Policies for 'orders': Users can view and manage their own orders
CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert their own orders" ON public.orders
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own orders" ON public.orders
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own orders" ON public.orders
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- Index to support policy checks
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);

-- Create the 'order_items' table
CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id text NOT NULL,
  quantity integer NOT NULL,
  unit_price numeric(10,2) NOT NULL,
  total_price numeric(10,2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security for 'order_items'
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Policies for 'order_items': Users can operate only on items that belong to their orders
CREATE POLICY "Users can view their own order items" ON public.order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND o.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can insert their own order items" ON public.order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND o.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can update their own order items" ON public.order_items
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND o.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND o.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can delete their own order items" ON public.order_items
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND o.user_id = (SELECT auth.uid())
    )
  );

-- Index to support policy checks
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);