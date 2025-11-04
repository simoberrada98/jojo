-- Drop tables if they exist (destructive operation)
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
-- Create the 'orders' table
CREATE TABLE public.orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    total_amount numeric(10, 2) NOT NULL,
    currency text NOT NULL,
    status text DEFAULT 'pending' NOT NULL,
    shipping_address jsonb,
    billing_address jsonb,
    payment_method text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
-- Enable Row Level Security for 'orders'
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
-- Policy for 'orders': Users can view and manage their own orders
CREATE POLICY "Users can view their own orders" ON public.orders
FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own orders" ON public.orders
FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own orders" ON public.orders
FOR UPDATE USING (auth.uid() = user_id);
-- Create the 'order_items' table
CREATE TABLE public.order_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id text NOT NULL, -- Assuming product_id is a string
    quantity integer NOT NULL,
    unit_price numeric(10, 2) NOT NULL,
    total_price numeric(10, 2) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
-- Enable Row Level Security for 'order_items'
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
-- Policy for 'order_items': Users can view their own order items
CREATE POLICY "Users can view their own order items" ON public.order_items
FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid())
);
-- Policy for 'order_items': Users can insert their own order items
CREATE POLICY "Users can insert their own order items" ON public.order_items
FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid())
);
