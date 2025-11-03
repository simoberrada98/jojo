-- Add GTIN (barcode) columns to products and product_variants
-- This supports merchant feeds and barcode-based integrations.

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS gtin TEXT;

ALTER TABLE public.product_variants
  ADD COLUMN IF NOT EXISTS gtin TEXT;

-- No unique constraint is enforced here because GTINs may be shared across
-- variants or reused by some catalogs. Add a unique index later if needed.

