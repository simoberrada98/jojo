-- Drop existing products table and recreate with enhanced schema
DROP TABLE IF EXISTS public.products CASCADE;

-- Products table (base product information)
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  category TEXT NOT NULL,
  brand TEXT,
  tags TEXT[], -- Array of tags for filtering
  
  -- Pricing (base price, can be overridden by variants)
  base_price DECIMAL(10, 2) NOT NULL,
  compare_at_price DECIMAL(10, 2), -- Original price for showing discounts
  cost_price DECIMAL(10, 2), -- Cost for profit calculations
  
  -- Mining-specific attributes
  hash_rate TEXT,
  power_consumption TEXT,
  algorithm TEXT,
  efficiency TEXT, -- e.g., "J/TH", "W/MH"
  
  -- Physical attributes
  weight DECIMAL(10, 2), -- in kg
  dimensions_length DECIMAL(10, 2), -- in cm
  dimensions_width DECIMAL(10, 2),
  dimensions_height DECIMAL(10, 2),
  
  -- Media
  featured_image_url TEXT,
  images TEXT[], -- Array of image URLs
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
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product variants table (different options of the same product)
CREATE TABLE public.product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL, -- e.g., "8GB RAM / 256GB SSD"
  
  -- Variant-specific pricing (overrides base price if set)
  price DECIMAL(10, 2),
  compare_at_price DECIMAL(10, 2),
  cost_price DECIMAL(10, 2),
  
  -- Variant options (stored as JSONB for flexibility)
  options JSONB, -- e.g., {"memory": "8GB", "storage": "256GB", "color": "Black"}
  
  -- Variant-specific attributes
  weight DECIMAL(10, 2),
  dimensions_length DECIMAL(10, 2),
  dimensions_width DECIMAL(10, 2),
  dimensions_height DECIMAL(10, 2),
  
  -- Media
  image_url TEXT,
  images TEXT[],
  
  -- Inventory
  stock_quantity INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 5,
  allow_backorder BOOLEAN DEFAULT false,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  position INTEGER DEFAULT 0, -- For sorting variants
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product options table (defines available options like "Color", "Size", "Memory")
CREATE TABLE public.product_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL, -- e.g., "Color", "Memory", "Storage"
  display_name TEXT NOT NULL, -- e.g., "Choose Color"
  type TEXT NOT NULL DEFAULT 'select', -- select, radio, swatch, button
  position INTEGER DEFAULT 0,
  required BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product option values table (defines specific values like "Red", "8GB", etc.)
CREATE TABLE public.product_option_values (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  option_id UUID REFERENCES public.product_options(id) ON DELETE CASCADE NOT NULL,
  value TEXT NOT NULL, -- e.g., "8GB", "Red", "256GB"
  display_value TEXT, -- e.g., "8 Gigabytes", if different from value
  color_hex TEXT, -- For color swatches
  image_url TEXT, -- For image swatches
  position INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product collections table (for grouping products)
CREATE TABLE public.collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product collection mapping (many-to-many)
CREATE TABLE public.product_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  collection_id UUID REFERENCES public.collections(id) ON DELETE CASCADE NOT NULL,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, collection_id)
);

-- Product reviews table
CREATE TABLE public.product_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Indexes for better query performance
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

-- Triggers for updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON public.product_variants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON public.collections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_reviews_updated_at BEFORE UPDATE ON public.product_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Products policies (public read for active products)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active products"
  ON public.products FOR SELECT
  USING (is_active = true AND is_archived = false);

-- Product variants policies
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active product variants"
  ON public.product_variants FOR SELECT
  USING (
    is_active = true AND EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = product_variants.product_id
      AND products.is_active = true
      AND products.is_archived = false
    )
  );

-- Product options policies
ALTER TABLE public.product_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view product options"
  ON public.product_options FOR SELECT
  USING (true);

-- Product option values policies
ALTER TABLE public.product_option_values ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view product option values"
  ON public.product_option_values FOR SELECT
  USING (true);

-- Collections policies
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view collections"
  ON public.collections FOR SELECT
  USING (true);

-- Product collections policies
ALTER TABLE public.product_collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view product collections"
  ON public.product_collections FOR SELECT
  USING (true);

-- Product reviews policies
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved reviews"
  ON public.product_reviews FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Users can create their own reviews"
  ON public.product_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON public.product_reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
  ON public.product_reviews FOR DELETE
  USING (auth.uid() = user_id);

-- Helper function to get product with lowest variant price
CREATE OR REPLACE FUNCTION get_product_display_price(product_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  lowest_variant_price DECIMAL;
  base_price DECIMAL;
BEGIN
  -- Get base price
  SELECT p.base_price INTO base_price
  FROM public.products p
  WHERE p.id = product_id;
  
  -- Get lowest variant price
  SELECT MIN(pv.price) INTO lowest_variant_price
  FROM public.product_variants pv
  WHERE pv.product_id = product_id AND pv.is_active = true;
  
  -- Return lowest variant price if exists, otherwise base price
  RETURN COALESCE(lowest_variant_price, base_price);
END;
$$ LANGUAGE plpgsql;

-- Helper function to get total stock for a product (including variants)
CREATE OR REPLACE FUNCTION get_product_total_stock(product_id UUID)
RETURNS INTEGER AS $$
DECLARE
  variant_stock INTEGER;
  base_stock INTEGER;
  has_variants BOOLEAN;
BEGIN
  -- Check if product has variants
  SELECT EXISTS(
    SELECT 1 FROM public.product_variants
    WHERE product_variants.product_id = product_id
  ) INTO has_variants;
  
  IF has_variants THEN
    -- Sum variant stock
    SELECT COALESCE(SUM(stock_quantity), 0) INTO variant_stock
    FROM public.product_variants
    WHERE product_variants.product_id = product_id AND is_active = true;
    RETURN variant_stock;
  ELSE
    -- Return base product stock
    SELECT stock_quantity INTO base_stock
    FROM public.products
    WHERE id = product_id;
    RETURN COALESCE(base_stock, 0);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Helper function to calculate average rating
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

-- Function to generate unique slug
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
