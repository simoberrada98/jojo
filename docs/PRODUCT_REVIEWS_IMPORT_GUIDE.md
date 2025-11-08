# Product Reviews Import Guide

This guide explains how to generate an import-ready CSV for `public.product_reviews` and import it into Supabase.

## Prerequisites

- `data/product_reviews_rows.csv` exists (from SerpAPI synthesis).
- `data/products_rows_updated.csv` includes `id` (UUID) and `gtin` columns for product mapping.
- Supabase migrations creating `public.product_reviews` are applied (see `supabase/migrations/20251108_serpapi_amazon_reviews.sql`).

## Generate the import CSV

1. Run the transform:
   ```
   pnpm transform-reviews
   ```
2. Output: `data/product_reviews_import.csv` with columns:
   - `product_id`
   - `rating`
   - `title`
   - `comment`
   - `is_verified_purchase`
   - `is_approved`
   - `helpful_count`
   - `created_at`
   - `source`
   - `external_id`

Notes:
- `product_id` is mapped via `gtin` from `products_rows_updated.csv`.
- `rating` is clamped to 1–5 (neutral fallback of 3 where unknown).
- `created_at` comes from review `date` or defaults to current timestamp.
- `source` is `amazon-serpapi` for these rows.
- `external_id` is a stable hash derived from product identifiers and comment text.

## Import into Supabase

1. Open Supabase Studio.
2. Navigate: Table Editor → `public.product_reviews` → Import data.
3. Choose file: `data/product_reviews_import.csv`.
4. Confirm column mapping (should auto-map to same names).
5. Start import.

Duplicate handling:
- A unique index on `(product_id, external_id)` prevents exact duplicates. If importing the same rows again, the import will error on those duplicates. Clear or filter as needed before re-import.

## Verify the import

Run queries in the SQL editor:

```sql
-- Count total reviews
select count(*) from public.product_reviews;

-- Inspect recent imports
select product_id, rating, title, source, external_id, created_at
from public.product_reviews
order by created_at desc
limit 20;
```

## Troubleshooting

- Missing `product_id` mapping: ensure `products_rows_updated.csv` has matching `gtin` and `id`.
- Duplicate errors: indicates rows already imported; verify by querying with `external_id`.
- Wrong types: check column types in `public.product_reviews` match the CSV values (boolean, numeric, timestamp).

## Re-running

You can re-run `pnpm transform-reviews` anytime after updating source CSVs. The output file will be overwritten with the latest 1:1 compatible rows.

