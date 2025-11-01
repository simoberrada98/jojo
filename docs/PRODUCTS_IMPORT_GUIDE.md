# Product Import Guide

This guide explains how to import products with variants from JSON into your Supabase database.

## Overview

The new product schema supports:

- **Products** with full ecommerce attributes (SKU, pricing, inventory, SEO, etc.)
- **Product Variants** (e.g., different warranty options, colors, sizes)
- **Product Options** (e.g., "Warranty Period", "Color", "Size")
- **Collections** (product groupings like "Featured Miners", "Best Sellers")
- **Product Reviews** with ratings and comments

## Step 1: Run the Schema Migration

1. Open your Supabase dashboard
2. Go to **SQL Editor**
3. Open the file: `supabase/migrations/002_products_variants_schema.sql`
4. Copy and paste the entire SQL into the editor
5. Click **Run**

This will:

- Drop and recreate the products table with enhanced schema
- Create variant, option, collection, and review tables
- Set up indexes and RLS policies
- Add helper functions for price calculation, stock tracking, and ratings

## Step 2: Prepare Your Product Data

Create a JSON file with your product data. See `data/products.json` for the complete structure.

### Basic Product Structure

```json
{
  "collections": [],
  "products": [
    {
      "sku": "PRODUCT-SKU",
      "name": "Product Name",
      "slug": "product-name",
      "description": "Full product description",
      "shortDescription": "Brief description",
      "category": "ASIC Miners",
      "brand": "Bitmain",
      "tags": ["bitcoin", "asic"],
      "basePrice": 2499.0,
      "compareAtPrice": 3299.0,
      "hashRate": "110 TH/s",
      "powerConsumption": "3250W",
      "featuredImageUrl": "/images/product.jpg",
      "images": ["/images/1.jpg", "/images/2.jpg"],
      "stockQuantity": 50,
      "isFeatured": true,
      "metaTitle": "SEO Title",
      "metaDescription": "SEO Description"
    }
  ]
}
```

### Product with Variants

```json
{
  "sku": "BM-S19PRO-110",
  "name": "Bitmain Antminer S19 Pro",
  "basePrice": 2499.0,
  "options": [
    {
      "name": "warranty",
      "displayName": "Warranty Period",
      "type": "select",
      "values": [
        { "value": "6-months", "displayValue": "6 Months" },
        { "value": "12-months", "displayValue": "12 Months" }
      ]
    }
  ],
  "variants": [
    {
      "sku": "BM-S19PRO-110-6M",
      "name": "6 Months Warranty",
      "price": 2499.0,
      "options": { "warranty": "6-months" },
      "stockQuantity": 30
    },
    {
      "sku": "BM-S19PRO-110-12M",
      "name": "12 Months Warranty",
      "price": 2699.0,
      "options": { "warranty": "12-months" },
      "stockQuantity": 15
    }
  ]
}
```

## Step 3: Set Up the Import Script

1. Navigate to the scripts directory:

   ```bash
   cd scripts
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Make sure your `.env.local` has the service role key:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

## Step 4: Run the Import

From the scripts directory:

```bash
# Import the default products.json
pnpm run import:products

# Or specify a custom JSON file
pnpm run import:products ../data/my-products.json
```

## Import Process

The script will:

1. ✅ Import collections first
2. ✅ Create products
3. ✅ Create product options (if defined)
4. ✅ Create option values
5. ✅ Create product variants (if defined)
6. ✅ Link products to collections

Example output:

```
Importing 3 collections...
✓ Imported collection: Featured Miners
✓ Imported collection: GPU Rigs
✓ Imported collection: Best Sellers

Importing 5 products...
✓ Imported product: Bitmain Antminer S19 Pro
  ✓ Imported option: warranty with 3 values
  ✓ Imported option: psu with 2 values
  ✓ Imported variant: 6 Months Warranty / PSU Included
  ✓ Imported variant: 12 Months Warranty / PSU Included
✓ Imported product: Whatsminer M50
...

✅ Import completed!
```

## Schema Features

### 1. Product Variants

Products can have multiple variants with different:

- Prices
- SKUs
- Stock levels
- Options (size, color, warranty, etc.)

### 2. Product Options

Define selectable options like:

- **Type: select** - Dropdown menu
- **Type: radio** - Radio buttons
- **Type: swatch** - Color swatches (with hex colors)
- **Type: button** - Button selection

### 3. Collections

Group products into collections:

- Featured products
- Category collections
- Sale collections
- Custom collections

### 4. Helper Functions

The schema includes SQL functions:

```sql
-- Get the display price (lowest variant or base price)
SELECT get_product_display_price(product_id);

-- Get total stock (sum of variants or base stock)
SELECT get_product_total_stock(product_id);

-- Get average rating from reviews
SELECT get_product_average_rating(product_id);
```

## Querying Products

### Get products with variants

```typescript
const { data } = await supabase
  .from('products')
  .select(
    `
    *,
    variants:product_variants(*),
    options:product_options(
      *,
      values:product_option_values(*)
    )
  `
  )
  .eq('is_active', true)
```

### Get products in a collection

```typescript
const { data } = await supabase
  .from('product_collections')
  .select(
    `
    product:products(*)
  `
  )
  .eq('collection_id', collectionId)
```

### Get product with reviews

```typescript
const { data } = await supabase
  .from('products')
  .select(
    `
    *,
    reviews:product_reviews(
      *,
      user:profiles(full_name, avatar_url)
    )
  `
  )
  .eq('id', productId)
  .single()
```

## Product Data Model

```
products
├── product_variants (multiple per product)
├── product_options (e.g., "Color", "Size")
│   └── product_option_values (e.g., "Red", "Blue", "Large")
├── product_collections (many-to-many)
│   └── collections
└── product_reviews
    └── profiles (user info)
```

## Best Practices

1. **Unique SKUs**: Ensure all product and variant SKUs are unique
2. **Slugs**: Use SEO-friendly slugs (lowercase, hyphens)
3. **Images**: Store images in Supabase Storage or CDN
4. **Variants**: Use variants for products with different options
5. **Stock**: Track inventory at variant level for products with variants
6. **SEO**: Always fill meta_title and meta_description
7. **Categories**: Use consistent category names

## Troubleshooting

### "Duplicate key value violates unique constraint"

- Check that all SKUs are unique
- Check that slugs are unique
- Ensure variant SKUs don't conflict with product SKUs

### "Foreign key violation"

- Make sure collections are imported before products
- Verify collection slugs match in product data

### "RLS policy" errors

- The service role key bypasses RLS
- Ensure you're using `SUPABASE_SERVICE_ROLE_KEY` in the script

## Next Steps

After importing products:

1. **Verify in Supabase**: Check the tables in your dashboard
2. **Update components**: Modify product display components to use new schema
3. **Add filters**: Implement category, tag, and collection filters
4. **Product pages**: Create dynamic product pages with variant selection
5. **Reviews**: Add review submission functionality
6. **Inventory management**: Build admin tools for stock management

## Sample Products Included

The `data/products.json` file includes:

- Bitmain Antminer S19 Pro (with warranty variants)
- Whatsminer M50 (simple product)
- GPU Mining Rig 8x RTX 4090 (with OS variants)
- Antminer L7 (simple product)
- Mining Power Supply 3000W (accessory)

Use these as templates for your own product data!
