-- Create ALT table: holds records from CSV that are missing in public.products
-- Matches products schema and includes any extra CSV columns (e.g., category_tags)

CREATE TABLE IF NOT EXISTS public.alt (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  category TEXT NOT NULL,
  brand TEXT,
  tags TEXT[],

  -- Pricing
  base_price DECIMAL(10, 2) NOT NULL,
  compare_at_price DECIMAL(10, 2),
  cost_price DECIMAL(10, 2),

  -- Mining-specific attributes
  hash_rate TEXT,
  power_consumption TEXT,
  algorithm TEXT,
  efficiency TEXT,

  -- Physical attributes
  weight DECIMAL(10, 2),
  dimensions_length DECIMAL(10, 2),
  dimensions_width DECIMAL(10, 2),
  dimensions_height DECIMAL(10, 2),

  -- Media
  featured_image_url TEXT,
  images TEXT[],
  video_url TEXT,
  model_3d_url TEXT,

  -- Inventory
  track_inventory BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 5,
  allow_backorder BOOLEAN DEFAULT false,

  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT[],

  -- Status
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  is_archived BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Extra columns from CSV
  gtin TEXT,
  category_tags TEXT[]
);

-- Indexes for query performance and duplicate prevention
CREATE INDEX IF NOT EXISTS idx_alt_slug ON public.alt(slug);
CREATE INDEX IF NOT EXISTS idx_alt_sku ON public.alt(sku);
CREATE INDEX IF NOT EXISTS idx_alt_category ON public.alt(category);
CREATE INDEX IF NOT EXISTS idx_alt_brand ON public.alt(brand);
CREATE INDEX IF NOT EXISTS idx_alt_tags ON public.alt USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_alt_gtin ON public.alt(gtin);
CREATE INDEX IF NOT EXISTS idx_alt_category_tags ON public.alt USING GIN(category_tags);

-- Keep updated_at fresh on updates (function defined in main schema)
CREATE TRIGGER update_alt_updated_at BEFORE UPDATE ON public.alt
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Optional: enable RLS later if needed; by default, keep table internal-only
-- ALTER TABLE public.alt ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Admins can manage alt" ON public.alt
--   FOR ALL TO authenticated USING (true) WITH CHECK (true);

