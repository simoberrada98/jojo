-- Alter products table to add category_tags to match CSV structure
-- Adds GIN index for efficient array membership queries

BEGIN;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS category_tags TEXT[] NULL;

-- Index to support filtering by category_tags elements
CREATE INDEX IF NOT EXISTS idx_products_category_tags
  ON public.products USING GIN (category_tags);

COMMIT;

