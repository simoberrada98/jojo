-- Migration: Add 'source' and 'external_id' columns to 'product_reviews'
-- Purpose: Support tracking of review origin and external identifier mapping
-- Notes:
-- - Adds 'source' (VARCHAR(255), NOT NULL, DEFAULT '') for the review origin (e.g., 'amazon', 'internal')
-- - Adds 'external_id' (VARCHAR(255), NULL) for mapping reviews from external providers
-- - Uses IF NOT EXISTS for backward-compatible, idempotent deployment
-- - Wrapped in a transaction for atomicity

BEGIN;

-- Add 'source' column (NOT NULL with default empty string)
ALTER TABLE IF EXISTS public.product_reviews
  ADD COLUMN IF NOT EXISTS source VARCHAR(255) NOT NULL DEFAULT '';

-- Add 'external_id' column (NULL allowed)
ALTER TABLE IF EXISTS public.product_reviews
  ADD COLUMN IF NOT EXISTS external_id VARCHAR(255);

COMMIT;

-- Rollback Instructions (manual):
-- If a rollback is required, evaluate data dependencies before dropping columns,
-- as this operation is destructive and will remove data.
-- Suggested rollback SQL:
-- BEGIN;
-- ALTER TABLE IF EXISTS public.product_reviews
--   DROP COLUMN IF EXISTS external_id;
-- ALTER TABLE IF EXISTS public.product_reviews
--   DROP COLUMN IF EXISTS source;
-- COMMIT;

-- Potential impacts:
-- - Existing rows will have 'source' set to '' due to DEFAULT, ensuring NOT NULL compatibility.
-- - Application code reading 'source' may need to treat '' as unspecified.
-- - No indexes or constraints are added here; consider unique/indexes separately if needed.
