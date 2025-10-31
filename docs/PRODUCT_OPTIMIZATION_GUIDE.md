# Product Optimization Guide

This guide explains how to optimize product titles, handles (URLs), and descriptions from your JSON product files for better SEO and user experience.

## What Gets Optimized

### 1. **Product Titles**

- ❌ **Before**: "New BITMAIN Antminer L7 9050M ASIC Miner (0.36J/TH, 3260W, 220V), Best Air-Cooling High Productive Litecoin/Dogecoin Home Mining Machines, w/Power Supply"
- ✅ **After**: "Bitmain Antminer L7 9050MH/s Litecoin Miner 3260W with PSU"

**Improvements:**

- Removes unnecessary words like "New", "Best", marketing fluff
- Leads with brand and model
- Includes key specs (hash rate, power)
- Mentions PSU inclusion
- Shorter, cleaner, more professional

### 2. **Product Handles (URLs)**

- ❌ **Before**: `new-bitmain-antminer-l7-9050m-asic-miner-0-36j-th-3260w-220v-best-air-cooling-high-productive-litecoin-dogecoin-home-mining-machines-w-power-supply`
- ✅ **After**: `bitmain-antminer-l7-9050mhs-litecoin-miner-3260w-with-psu`

**Improvements:**

- SEO-friendly, readable URLs
- Max 100 characters
- Clear product identification
- No special characters

### 3. **Product Descriptions**

**Removed:**

- Excessive promotional language
- Restocking fee warnings
- "Buy with confidence" type phrases
- Package dimension details (better as metadata)
- EAN codes (better as metadata)

**Improved:**

- Cleaner HTML structure
- Focus on technical specifications
- Professional tone
- Key features highlighted

## How to Run the Optimization

### Prerequisites

1. Navigate to scripts directory:

   ```bash
   cd scripts
   ```

2. Install dependencies (if not already done):
   ```bash
   pnpm install
   ```

### Run Optimization

```bash
pnpm run optimize:products
```

### Output

The script will:

1. Read all JSON files from `lib/data/json/`
2. Optimize each product
3. Save optimized versions to `lib/data/json-optimized/`
4. Display progress and changes

Example output:

```
Found 21 product files to optimize

Original: New BITMAIN Antminer L7 9050M ASIC Miner (0.36J/TH, 3260W, 220V)...
Optimized: Bitmain Antminer L7 9050MH/s Litecoin Miner 3260W with PSU
Handle: bitmain-antminer-l7-9050mhs-litecoin-miner-3260w-with-psu
Meta: Bitmain Antminer L7 9050MH/s Litecoin Miner 3260W with PSU. Hash rate: 9050 MH/s. Includes power supply. Professional cryptocurrency mining hardware.
---

✅ Optimized 21 products
Output directory: lib/data/json-optimized
```

## Optimization Rules

### Title Optimization

The script extracts and prioritizes information in this order:

1. **Brand** (if Bitmain/Whatsminer)

   - Example: "Bitmain"

2. **Model Name**

   - Extracts: S19, S21, L7, L9, KA3, E9, etc.
   - Example: "Antminer S21 Pro"

3. **Hash Rate**

   - Formats: TH/s, GH/s, MH/s
   - Example: "235TH/s" or "9050MH/s"

4. **Coin Type**

   - Bitcoin, Litecoin, Dogecoin, Kadena, Ethereum Classic
   - Example: "Bitcoin Miner"

5. **Power Consumption**

   - Example: "3645W"

6. **Key Features**
   - PSU inclusion
   - Example: "with PSU"

### Handle (URL) Rules

- Converts title to lowercase
- Replaces spaces with hyphens
- Removes special characters
- Limits to 100 characters
- Creates SEO-friendly URLs

### Description Cleaning

**Removes:**

- `<p><b>Brand:</b> ...</p>`
- `<p><b>Binding:</b> ...</p>`
- `<p><b>EAN:</b> ...</p>`
- `<p><b>Package Dimensions:</b> ...</p>`
- Excessive promotional language
- Unicode escape sequences (converted to actual characters)

**Improves:**

- Replaces "much cheaper than" → "Competitive alternative to"
- Replaces "much better than" → "Superior performance to"
- Removes restocking fee warnings from descriptions

## Examples of Optimized Products

### Example 1: Antminer S21+

```
Original:
- Title: "New Antminer S21+ 235T 3878W (US Stock) Bitcoin Miner Asic Miner..."
- Handle: "new-antminer-s21-235t-3878w-us-stock-bitcoin-miner-asic-miner..."

Optimized:
- Title: "Bitmain Antminer S21+ 235TH/s Bitcoin Miner 3878W with PSU"
- Handle: "bitmain-antminer-s21-235ths-bitcoin-miner-3878w-with-psu"
```

### Example 2: Antminer L9

```
Original:
- Title: "TheTechWave - Bitmain Antminer L9 17 GH 3400W Scrypt ASIC Miner Crypto..."
- Handle: "thetechwave-bitmain-antminer-l9-17-gh-3400w-scrypt-asic-miner-crypto..."

Optimized:
- Title: "Bitmain Antminer L9 17GH/s Litecoin Miner 3400W with PSU"
- Handle: "bitmain-antminer-l9-17ghs-litecoin-miner-3400w-with-psu"
```

### Example 3: Antminer S19K Pro

```
Original:
- Title: "Bitmain Antminer S19kpro 120Th 2760w BTC Bitcoin Miner - Asic Crypto..."
- Handle: "bitmain-antminer-s19kpro-120th-2760w-btc-bitcoin-miner-asic-crypto..."

Optimized:
- Title: "Bitmain Antminer S19K Pro 120TH/s Bitcoin Miner 2760W with PSU"
- Handle: "bitmain-antminer-s19k-pro-120ths-bitcoin-miner-2760w-with-psu"
```

## Benefits of Optimization

### SEO Benefits

✅ Cleaner, more keyword-focused titles  
✅ Readable URLs that include key terms  
✅ Better search engine ranking potential  
✅ Improved click-through rates from search results

### User Experience Benefits

✅ Easier to scan and compare products  
✅ Clear, professional presentation  
✅ Quick identification of key specs  
✅ Less clutter and marketing noise

### E-commerce Benefits

✅ Consistent product naming  
✅ Better inventory management  
✅ Easier product comparison  
✅ Professional brand image

## Next Steps

After optimization:

1. **Review Optimized Files**

   - Check `lib/data/json-optimized/` directory
   - Verify titles and handles look correct

2. **Import to Database**

   - Use optimized JSON files for Supabase import
   - Follow PRODUCTS_IMPORT_GUIDE.md

3. **Update Images**

   - Ensure product images match optimized names
   - Use consistent naming convention

4. **Set Up Redirects**
   - If replacing existing products, create 301 redirects
   - Map old handles to new optimized handles

## Customization

To customize optimization rules, edit `scripts/optimize-products.ts`:

### Change Title Format

```typescript
function optimizeTitle(product: ProductJSON): string {
  // Modify the title building logic here
  // Add or remove components as needed
}
```

### Add Custom Rules

```typescript
// Add your own extraction patterns
const customMatch = originalTitle.match(/your-pattern/i);
```

### Modify Cleaning Rules

```typescript
function cleanDescription(bodyHtml: string): string {
  // Add more cleanup rules
  cleaned = cleaned.replace(/your-pattern/gi, "replacement");
}
```

## Troubleshooting

### "Cannot find module"

```bash
cd scripts
pnpm install
```

### "No files found"

- Check that JSON files exist in `lib/data/json/`
- Verify file extensions are `.json`

### "Output directory not created"

- Script will auto-create `lib/data/json-optimized/`
- Check write permissions

## File Structure

```
jhuangnyc/
├── lib/
│   └── data/
│       ├── json/              # Original product files
│       └── json-optimized/    # Optimized output (created by script)
└── scripts/
    ├── optimize-products.ts   # Optimization script
    └── package.json           # Script dependencies
```

## Quality Checklist

Before importing optimized products:

- [ ] All titles are under 100 characters
- [ ] Handles are SEO-friendly and readable
- [ ] Descriptions are clean and professional
- [ ] Key specs are preserved
- [ ] No special characters in URLs
- [ ] Brand and model names are correct
- [ ] Hash rates are properly formatted
- [ ] Power consumption is included
- [ ] PSU inclusion is noted when applicable

---

**Note**: Always backup your original JSON files before running optimization!
