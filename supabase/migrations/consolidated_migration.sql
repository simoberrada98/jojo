-- Consolidated Migration File
-- Generated from the following migration files:
-- - 001_initial_schema.sql
-- - 002_products_variants_schema.sql
-- - 20240115_create_order_tracking.sql
-- - 20251030_payments_webhooks.sql
-- - 20251101000000_create_create_new_order_rpc.sql
-- - 20251101000005_create_get_my_claim_function.sql
-- - 20251101000006_add_rls_to_payments.sql
-- - 20251101000008_refine_order_tracking_rls.sql
-- - 20251101000009_cleanup_schema.sql
-- - 20251101000010_enable_realtime.sql
-- - 20251101_create_orders_and_order_items_tables.sql
-- - 20251103_add_gtin_columns.sql

-- From: 001_initial_schema.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.addresses (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  label TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'USA',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.wishlist (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID, -- REFERENCES public.products(id) ON DELETE CASCADE NOT NULL, -- Reference added later
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE TABLE public.cart (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID, -- REFERENCES public.products(id) ON DELETE CASCADE NOT NULL, -- Reference added later
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE TABLE public.payment_methods (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  label TEXT NOT NULL,
  crypto_address TEXT,
  crypto_currency TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON public.addresses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cart_updated_at BEFORE UPDATE ON public.cart
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON public.payment_methods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can view their own addresses" ON public.addresses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own addresses" ON public.addresses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own addresses" ON public.addresses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own addresses" ON public.addresses FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own wishlist" ON public.wishlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add to their own wishlist" ON public.wishlist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove from their own wishlist" ON public.wishlist FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own cart" ON public.cart FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add to their own cart" ON public.cart FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own cart" ON public.cart FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can remove from their own cart" ON public.cart FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own payment methods" ON public.payment_methods FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add their own payment methods" ON public.payment_methods FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own payment methods" ON public.payment_methods FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own payment methods" ON public.payment_methods FOR DELETE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_order_number TEXT;
  counter INTEGER := 0;
BEGIN
  LOOP
    new_order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.orders WHERE order_number = new_order_number);
    counter := counter + 1;
    IF counter > 10 THEN
      RAISE EXCEPTION 'Could not generate unique order number';
    END IF;
  END LOOP;
  RETURN new_order_number;
END;
$$ LANGUAGE plpgsql;

-- From: 002_products_variants_schema.sql
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  category TEXT NOT NULL,
  brand TEXT,
  tags TEXT[],
  base_price DECIMAL(10, 2) NOT NULL,
  compare_at_price DECIMAL(10, 2),
  cost_price DECIMAL(10, 2),
  hash_rate TEXT,
  power_consumption TEXT,
  algorithm TEXT,
  efficiency TEXT,
  weight DECIMAL(10, 2),
  dimensions_length DECIMAL(10, 2),
  dimensions_width DECIMAL(10, 2),
  dimensions_height DECIMAL(10, 2),
  featured_image_url TEXT,
  images TEXT[],
  video_url TEXT,
  model_3d_url TEXT,
  track_inventory BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 5,
  allow_backorder BOOLEAN DEFAULT false,
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT[],
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  is_archived BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.wishlist ADD CONSTRAINT fk_wishlist_product_id FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;
ALTER TABLE public.cart ADD CONSTRAINT fk_cart_product_id FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

CREATE TABLE public.product_variants (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  price DECIMAL(10, 2),
  compare_at_price DECIMAL(10, 2),
  cost_price DECIMAL(10, 2),
  options JSONB,
  weight DECIMAL(10, 2),
  dimensions_length DECIMAL(10, 2),
  dimensions_width DECIMAL(10, 2),
  dimensions_height DECIMAL(10, 2),
  image_url TEXT,
  images TEXT[],
  stock_quantity INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 5,
  allow_backorder BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.product_options (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'select',
  position INTEGER DEFAULT 0,
  required BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.product_option_values (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  option_id UUID REFERENCES public.product_options(id) ON DELETE CASCADE NOT NULL,
  value TEXT NOT NULL,
  display_value TEXT,
  color_hex TEXT,
  image_url TEXT,
  position INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.collections (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.product_collections (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  collection_id UUID REFERENCES public.collections(id) ON DELETE CASCADE NOT NULL,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, collection_id)
);

CREATE TABLE public.product_reviews (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  is_verified_purchase BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT true,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_brand ON public.products(brand);
CREATE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_products_sku ON public.products(sku);
CREATE INDEX idx_products_is_featured ON public.products(is_featured);
CREATE INDEX idx_products_is_active ON public.products(is_active);
CREATE INDEX idx_products_tags ON public.products USING GIN(tags);
CREATE INDEX idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX idx_product_variants_sku ON public.product_variants(sku);
CREATE INDEX idx_product_variants_options ON public.product_variants USING GIN(options);
CREATE INDEX idx_product_options_product_id ON public.product_options(product_id);
CREATE INDEX idx_product_option_values_option_id ON public.product_option_values(option_id);
CREATE INDEX idx_collections_slug ON public.collections(slug);
CREATE INDEX idx_product_collections_product_id ON public.product_collections(product_id);
CREATE INDEX idx_product_collections_collection_id ON public.product_collections(collection_id);
CREATE INDEX idx_product_reviews_product_id ON public.product_reviews(product_id);
CREATE INDEX idx_product_reviews_user_id ON public.product_reviews(user_id);
CREATE INDEX idx_product_reviews_rating ON public.product_reviews(rating);

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON public.product_variants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON public.collections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_reviews_updated_at BEFORE UPDATE ON public.product_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active products" ON public.products FOR SELECT USING (is_active = true AND is_archived = false);
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active product variants" ON public.product_variants FOR SELECT USING (is_active = true AND EXISTS (SELECT 1 FROM public.products WHERE products.id = product_variants.product_id AND products.is_active = true AND products.is_archived = false));
ALTER TABLE public.product_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view product options" ON public.product_options FOR SELECT USING (true);
ALTER TABLE public.product_option_values ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view product option values" ON public.product_option_values FOR SELECT USING (true);
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view collections" ON public.collections FOR SELECT USING (true);
ALTER TABLE public.product_collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view product collections" ON public.product_collections FOR SELECT USING (true);
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view approved reviews" ON public.product_reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "Users can create their own reviews" ON public.product_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reviews" ON public.product_reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reviews" ON public.product_reviews FOR DELETE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION get_product_display_price(product_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  lowest_variant_price DECIMAL;
  base_price DECIMAL;
BEGIN
  SELECT p.base_price INTO base_price
  FROM public.products p
  WHERE p.id = product_id;
  
  SELECT MIN(pv.price) INTO lowest_variant_price
  FROM public.product_variants pv
  WHERE pv.product_id = product_id AND pv.is_active = true;
  
  RETURN COALESCE(lowest_variant_price, base_price);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_product_total_stock(product_id UUID)
RETURNS INTEGER AS $$
DECLARE
  variant_stock INTEGER;
  base_stock INTEGER;
  has_variants BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM public.product_variants
    WHERE product_variants.product_id = product_id
  ) INTO has_variants;
  
  IF has_variants THEN
    SELECT COALESCE(SUM(stock_quantity), 0) INTO variant_stock
    FROM public.product_variants
    WHERE product_variants.product_id = product_id AND is_active = true;
    RETURN variant_stock;
  ELSE
    SELECT stock_quantity INTO base_stock
    FROM public.products
    WHERE id = product_id;
    RETURN COALESCE(base_stock, 0);
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_product_average_rating(product_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  avg_rating DECIMAL;
BEGIN
  SELECT COALESCE(AVG(rating), 0) INTO avg_rating
  FROM public.product_reviews
  WHERE product_reviews.product_id = product_id
    AND is_approved = true;
  
  RETURN ROUND(avg_rating, 1);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_unique_slug(base_slug TEXT, table_name TEXT)
RETURNS TEXT AS $$
DECLARE
  new_slug TEXT;
  counter INTEGER := 1;
  slug_exists BOOLEAN;
BEGIN
  new_slug := base_slug;
  
  LOOP
    EXECUTE format('SELECT EXISTS(SELECT 1 FROM %I WHERE slug = $1)', table_name)
    INTO slug_exists
    USING new_slug;
    
    EXIT WHEN NOT slug_exists;
    
    new_slug := base_slug || '-' || counter;
    counter := counter + 1;
  END LOOP;
  
  RETURN new_slug;
END;
$$ LANGUAGE plpgsql;

-- From: 20240115_create_order_tracking.sql
CREATE TABLE IF NOT EXISTS order_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'shipped', 'delivered')),
  message TEXT NOT NULL,
  location TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_order_tracking_order_number_timestamp 
ON order_tracking(order_number, timestamp DESC);

ALTER TABLE order_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to order tracking" ON order_tracking FOR SELECT USING (true);
ALTER PUBLICATION supabase_realtime ADD TABLE order_tracking;

-- From: 20251030_payments_webhooks.sql
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  hp_payment_id text unique,
  business_id text not null,
  session_id text not null,
  amount numeric not null,
  currency text not null,
  status text not null,
  method text,
  customer_email text,
  customer_ip text,
  metadata jsonb,
  checkout_data jsonb,
  hoodpay_response jsonb,
  web_payment_response jsonb,
  error_log jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  expires_at timestamptz
);
create index if not exists payments_business_id_idx on public.payments (business_id);
create index if not exists payments_status_idx on public.payments (status);
create index if not exists payments_created_at_idx on public.payments (created_at desc);

create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  payment_id text,
  business_id text,
  payload jsonb not null,
  signature text,
  verified boolean not null default false,
  processed boolean not null default false,
  processing_error text,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  retry_count integer not null default 0
);
create index if not exists webhook_events_event_type_idx on public.webhook_events (event_type);
create index if not exists webhook_events_received_at_idx on public.webhook_events (received_at desc);

create table if not exists public.payment_attempts (
  id uuid primary key default gen_random_uuid(),
  payment_id text not null,
  attempt_number integer not null,
  method text not null,
  status text not null,
  error jsonb,
  request_data jsonb,
  response_data jsonb,
  created_at timestamptz not null default now()
);
create index if not exists payment_attempts_payment_id_idx on public.payment_attempts (payment_id);

-- From: 20251101_create_orders_and_order_items_tables.sql
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

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own orders" ON public.orders FOR UPDATE USING (auth.uid() = user_id);

CREATE TABLE public.order_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id text NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric(10, 2) NOT NULL,
    total_price numeric(10, 2) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own order items" ON public.order_items FOR SELECT USING (EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert their own order items" ON public.order_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid()));

-- From: 20251101000000_create_create_new_order_rpc.sql
CREATE OR REPLACE FUNCTION public.create_new_order(
    p_user_id uuid,
    p_total_amount numeric,
    p_currency text,
    p_shipping_address jsonb,
    p_billing_address jsonb,
    p_payment_method text,
    p_order_items jsonb
)
RETURNS public.orders
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_order_id uuid;
    v_order_row public.orders;
    item jsonb;
BEGIN
    INSERT INTO public.orders (
        user_id,
        total_amount,
        currency,
        shipping_address,
        billing_address,
        payment_method,
        status
    )
    VALUES (
        p_user_id,
        p_total_amount,
        p_currency,
        p_shipping_address,
        p_billing_address,
        p_payment_method,
        'pending'
    )
    RETURNING id INTO v_order_id;

    FOR item IN SELECT * FROM jsonb_array_elements(p_order_items)
    LOOP
        INSERT INTO public.order_items (
            order_id,
            product_id,
            quantity,
            unit_price,
            total_price
        )
        VALUES (
            v_order_id,
            item->>'product_id',
            (item->>'quantity')::integer,
            (item->>'unit_price')::numeric,
            (item->>'total_price')::numeric
        );
    END LOOP;

    SELECT * INTO v_order_row FROM public.orders WHERE id = v_order_id;
    RETURN v_order_row;
END;
$$;

-- From: 20251101000005_create_get_my_claim_function.sql
CREATE OR REPLACE FUNCTION get_my_claim(claim TEXT)
RETURNS jsonb AS $$
  SELECT coalesce(current_setting('request.jwt.claims', true)::jsonb ->> claim, null)::jsonb
$$ LANGUAGE sql STABLE;

-- From: 20251101000006_add_rls_to_payments.sql
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payments" ON public.payments FOR SELECT USING (auth.uid() = (metadata->>'user_id')::uuid);
CREATE POLICY "Admins can view all payments" ON public.payments FOR SELECT USING (get_my_claim('user_role')::text = '"admin"');
CREATE POLICY "Admins can view all webhook events" ON public.webhook_events FOR SELECT USING (get_my_claim('user_role')::text = '"admin"');
CREATE POLICY "Users can view their own payment attempts" ON public.payment_attempts FOR SELECT USING (EXISTS (SELECT 1 FROM payments WHERE payments.hp_payment_id = payment_attempts.payment_id AND (payments.metadata->>'user_id')::uuid = auth.uid()));
CREATE POLICY "Admins can view all payment attempts" ON public.payment_attempts FOR SELECT USING (get_my_claim('user_role')::text = '"admin"');

-- From: 20251101000008_refine_order_tracking_rls.sql
CREATE POLICY "Allow admin insert to order tracking"
ON order_tracking FOR INSERT
WITH CHECK (get_my_claim('user_role')::text = '"admin"');

-- From: 20251101000009_cleanup_schema.sql
ALTER TABLE public.payment_attempts ADD CONSTRAINT fk_payment_attempts_payment_id FOREIGN KEY (payment_id) REFERENCES public.payments(hp_payment_id);

-- From: 20251101000010_enable_realtime.sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cart;

-- From: 20251103_add_gtin_columns.sql
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS gtin TEXT;

ALTER TABLE public.product_variants
  ADD COLUMN IF NOT EXISTS gtin TEXT;