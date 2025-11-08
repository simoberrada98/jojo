# CSV Import Instructions for Supabase

This directory contains CSV files ready to be imported into Supabase.

## Files

- `products.csv` - Main product information
- `product_variants.csv` - Product variants with pricing and inventory
- `product_reviews_import.csv` - Import-ready reviews for `public.product_reviews` (see docs)

## Before Import

1. Make sure your database has been migrated with the schema from:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_products_variants_schema.sql`

2. Run migrations if you haven't already:
   ```bash
   supabase db push
   ```

## Import Steps

### Method 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **Table Editor**
3. Select the `products` table
4. Click **Insert** → **Import data from CSV**
5. Upload `products.csv`
6. Map the columns (should auto-detect)
7. Click **Import**
8. Repeat steps 3-7 for `product_variants` table with `product_variants.csv`

### Method 2: Using SQL Commands

You can also import via SQL using the `COPY` command:

```sql
-- Import products
COPY public.products(
  shopify_id, sku, name, slug, description, short_description,
  category, brand, tags, base_price, compare_at_price,
  hash_rate, power_consumption, algorithm, efficiency,
  weight, dimensions_length, dimensions_width, dimensions_height,
  featured_image_url, images, meta_title, meta_description,
  is_featured, is_active, published_at, created_at, updated_at,
  category_tags
)
FROM '/path/to/products.csv'
DELIMITER ','
CSV HEADER;

-- Import variants
COPY public.product_variants(
  shopify_id, product_shopify_id, sku, name, price,
  compare_at_price, stock_quantity, is_active, position,
  created_at, updated_at
)
FROM '/path/to/product_variants.csv'
DELIMITER ','
CSV HEADER;
```

### Method 3: Using Supabase CLI

```bash
# Import products
supabase db execute "$(cat lib/data/csv/products.csv)" --csv

# Import variants
supabase db execute "$(cat lib/data/csv/product_variants.csv)" --csv
```

## Post-Import Steps

1. **Link products to variants** - The CSV includes `product_shopify_id` which references the Shopify ID. You may need to update foreign keys:

```sql
-- Update product_variants to link to products by UUID
UPDATE product_variants pv
SET product_id = p.id
FROM products p
WHERE pv.product_shopify_id = p.shopify_id;
```

2. **Verify data**:

```sql
-- Check products count
SELECT COUNT(*) FROM products;

-- Check variants count
SELECT COUNT(*) FROM product_variants;

-- Check products with their variants
SELECT p.name, COUNT(pv.id) as variant_count
FROM products p
LEFT JOIN product_variants pv ON pv.product_id = p.id
GROUP BY p.id, p.name;
```

3. **Test queries**:

```sql
-- Get all active products with their lowest price
SELECT
  p.name,
  p.slug,
  get_product_display_price(p.id) as price,
  get_product_total_stock(p.id) as stock
FROM products p
WHERE p.is_active = true
ORDER BY p.created_at DESC;
```

## Data Structure

### Products CSV Columns

- `shopify_id` - Original Shopify product ID
- `sku` - Stock keeping unit
- `name` - Product title
- `slug` - URL-friendly identifier
- `description` - Full HTML description
- `short_description` - Plain text summary
- `category` - Product category
- `brand` - Manufacturer (Bitmain, MicroBT, etc.)
- `tags` - PostgreSQL array of tags
- `category_tags` - PostgreSQL array of normalized category tags used for faceting
- `base_price` - Base price in USD
- `compare_at_price` - Original price (for discounts)
- `hash_rate` - Mining hash rate (e.g., "9050 MH/s")
- `power_consumption` - Power usage (e.g., "3260W")
- `algorithm` - Mining algorithm (Scrypt, SHA-256, etc.)
- `efficiency` - Energy efficiency (e.g., "0.36 J/TH")
- `weight` - Product weight in kg
- `dimensions_*` - Dimensions in cm
- `featured_image_url` - Main product image
- `images` - PostgreSQL array of all image URLs
- `meta_title` - SEO title
- `meta_description` - SEO description
- `is_featured` - Featured product flag
- `is_active` - Active/visible flag
- `published_at` - Publication timestamp
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### Product Variants CSV Columns

- `shopify_id` - Original Shopify variant ID
- `product_shopify_id` - Links to product's Shopify ID
- `sku` - Variant SKU
- `name` - Variant name (e.g., "Default Title")
- `price` - Variant-specific price
- `compare_at_price` - Original price
- `stock_quantity` - Available stock
- `is_active` - Active flag
- `position` - Display order
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

## Troubleshooting

### Issue: Foreign key constraint errors

**Solution**: Import products first, then variants. Make sure to run the post-import SQL to link variants to products.

### Issue: Array format errors

**Solution**: The CSV uses PostgreSQL array format `{"item1","item2"}`. If this doesn't work, you may need to import as text and convert after.

### Issue: Date/timestamp format errors

**Solution**: Ensure timestamps are in ISO 8601 format. You can convert them post-import if needed:

```sql
UPDATE products
SET published_at = to_timestamp(published_at, 'YYYY-MM-DD"T"HH24:MI:SS');
```

## Regenerating CSV Files

If you need to regenerate the CSV files from the optimized JSON:

```bash
pnpm run json-to-csv
```

This will read from `lib/data/json-optimized/` and create fresh CSV files.

## Product Reviews Import

- Generate import file: `pnpm transform-reviews` → outputs `data/product_reviews_import.csv`.
- Detailed steps: see `docs/PRODUCT_REVIEWS_IMPORT_GUIDE.md`.
