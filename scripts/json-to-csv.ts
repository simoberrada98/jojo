import fs from 'fs';
import path from 'path';
import { logger } from '../lib/utils/logger';

interface ProductJSON {
  id: number;
  title: string;
  handle: string;
  body_html: string;
  published_at: string;
  created_at: string;
  updated_at: string;
  vendor: string;
  product_type: string;
  tags: string[];
  variants: Array<{
    id: number;
    title: string;
    option1: string | null;
    option2: string | null;
    option3: string | null;
    sku: string;
    requires_shipping: boolean;
    taxable: boolean;
    featured_image: string | null;
    available: boolean;
    price: string;
    grams: number;
    compare_at_price: string | null;
    position: number;
    product_id: number;
    created_at: string;
    updated_at: string;
  }>;
  images: Array<{
    id: number;
    created_at: string;
    position: number;
    updated_at: string;
    product_id: number;
    variant_ids: number[];
    src: string;
    width: number;
    height: number;
  }>;
  options: Array<{
    name: string;
    position: number;
    values: string[];
  }>;
}

function extractSpecs(bodyHtml: string): {
  hashRate?: string;
  power?: string;
  algorithm?: string;
  efficiency?: string;
} {
  const specs: any = {};

  // Extract hash rate
  const hashRateMatch = bodyHtml.match(
    /(\d+(?:,\d+)?)\s*(?:MH\/s|TH\/s|GH\/s)/i
  );
  if (hashRateMatch) {
    specs.hashRate = hashRateMatch[0].replace(',', '');
  }

  // Extract power consumption
  const powerMatch = bodyHtml.match(/(\d+(?:,\d+)?)\s*W(?:att)?/i);
  if (powerMatch) {
    specs.power = powerMatch[1].replace(',', '') + 'W';
  }

  // Extract algorithm
  const algoMatch = bodyHtml.match(
    /(?:Algorithm|Cryptocurrency)[:\s]+(\w+(?:\s+\|\s+\w+)?)/i
  );
  if (algoMatch) {
    specs.algorithm = algoMatch[1].split('|')[0].trim();
  }

  // Extract efficiency
  const efficiencyMatch = bodyHtml.match(/([\d.]+)\s*J\/(?:TH|MH|GH)/i);
  if (efficiencyMatch) {
    specs.efficiency = efficiencyMatch[0];
  }

  return specs;
}

function extractDimensions(bodyHtml: string): {
  length?: number;
  width?: number;
  height?: number;
  weight?: number;
} {
  const dimensions: any = {};

  // Extract dimensions in inches, convert to cm
  const dimMatch = bodyHtml.match(
    /([\d.]+)\s*x\s*([\d.]+)\s*x\s*([\d.]+)\s*inches/i
  );
  if (dimMatch) {
    dimensions.length = (parseFloat(dimMatch[1]) * 2.54).toFixed(2);
    dimensions.width = (parseFloat(dimMatch[2]) * 2.54).toFixed(2);
    dimensions.height = (parseFloat(dimMatch[3]) * 2.54).toFixed(2);
  }

  // Extract weight in lbs, convert to kg
  const weightMatch = bodyHtml.match(/(?:Net weight)[:\s]+([\d.]+)\s*lbs/i);
  if (weightMatch) {
    dimensions.weight = (parseFloat(weightMatch[1]) * 0.453592).toFixed(2);
  }

  return dimensions;
}

function generateMetaDescription(title: string, bodyHtml: string): string {
  const specs = extractSpecs(bodyHtml);
  const parts: string[] = [];

  parts.push(title + '.');
  if (specs.hashRate) parts.push(`Hash rate: ${specs.hashRate}.`);
  if (specs.efficiency) parts.push(`Efficiency: ${specs.efficiency}.`);
  if (bodyHtml.match(/PSU|Power Supply/i)) parts.push('Includes power supply.');
  parts.push('Professional cryptocurrency mining hardware.');

  return parts.join(' ').substring(0, 160);
}

function escapeCsvField(field: any): string {
  if (field === null || field === undefined) return '';
  const str = String(field);
  // Escape quotes and wrap in quotes if contains comma, newline, or quote
  if (str.includes(',') || str.includes('\n') || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function convertProductsToCSV(products: ProductJSON[]) {
  const productRows: string[] = [];
  const variantRows: string[] = [];

  // CSV headers for products
  const productHeaders = [
    'shopify_id',
    'sku',
    'name',
    'slug',
    'description',
    'short_description',
    'category',
    'brand',
    'tags',
    'base_price',
    'compare_at_price',
    'hash_rate',
    'power_consumption',
    'algorithm',
    'efficiency',
    'weight',
    'dimensions_length',
    'dimensions_width',
    'dimensions_height',
    'featured_image_url',
    'images',
    'meta_title',
    'meta_description',
    'is_featured',
    'is_active',
    'published_at',
    'created_at',
    'updated_at',
  ];

  // CSV headers for variants
  const variantHeaders = [
    'shopify_id',
    'product_shopify_id',
    'sku',
    'name',
    'price',
    'compare_at_price',
    'stock_quantity',
    'is_active',
    'position',
    'created_at',
    'updated_at',
  ];

  productRows.push(productHeaders.join(','));
  variantRows.push(variantHeaders.join(','));

  for (const product of products) {
    const specs = extractSpecs(product.body_html);
    const dimensions = extractDimensions(product.body_html);

    // Determine brand from title or vendor
    let brand = '';
    if (product.title.toLowerCase().includes('bitmain')) brand = 'Bitmain';
    else if (product.title.toLowerCase().includes('whatsminer'))
      brand = 'MicroBT';
    else if (product.title.toLowerCase().includes('antminer'))
      brand = 'Bitmain';

    // Determine category from product type or tags
    let category = 'ASIC Miners';
    if (product.product_type) {
      category = product.product_type;
    }

    // Extract short description (first 200 chars without HTML)
    const shortDescription =
      product.body_html
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 200) + '...';

    // Get first variant for base price
    const firstVariant = product.variants[0];

    // Prepare product row
    const productRow = [
      product.id,
      firstVariant?.sku || `PROD-${product.id}`,
      product.title,
      product.handle,
      product.body_html.replace(/\n/g, ' ').replace(/\r/g, ''),
      shortDescription,
      category,
      brand,
      `{${product.tags.map((t) => `"${t}"`).join(',')}}`, // PostgreSQL array format
      firstVariant?.price || '0',
      firstVariant?.compare_at_price || '',
      specs.hashRate || '',
      specs.power || '',
      specs.algorithm || '',
      specs.efficiency || '',
      dimensions.weight || '',
      dimensions.length || '',
      dimensions.width || '',
      dimensions.height || '',
      product.images[0]?.src || '',
      `{${product.images.map((img) => `"${img.src}"`).join(',')}}`, // PostgreSQL array format
      product.title, // meta_title same as title
      generateMetaDescription(product.title, product.body_html),
      'false', // is_featured
      'true', // is_active
      product.published_at,
      product.created_at,
      product.updated_at,
    ];

    productRows.push(productRow.map(escapeCsvField).join(','));

    // Add variants
    for (const variant of product.variants) {
      const variantRow = [
        variant.id,
        product.id,
        variant.sku,
        variant.title,
        variant.price,
        variant.compare_at_price || '',
        '10', // default stock quantity
        variant.available ? 'true' : 'false',
        variant.position,
        variant.created_at,
        variant.updated_at,
      ];

      variantRows.push(variantRow.map(escapeCsvField).join(','));
    }
  }

  return {
    productsCSV: productRows.join('\n'),
    variantsCSV: variantRows.join('\n'),
  };
}

async function main() {
  const jsonDir = path.join(process.cwd(), 'lib/data/json-optimized');
  const outputDir = path.join(process.cwd(), 'lib/data/csv');

  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Read all JSON files
  const files = fs.readdirSync(jsonDir).filter((f) => f.endsWith('.json'));
  logger.audit(`Found ${files.length} product files to convert\n`);

  const products: ProductJSON[] = [];

  for (const file of files) {
    const filePath = path.join(jsonDir, file);
    const product: ProductJSON = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    products.push(product);
  }

  // Convert to CSV
  const { productsCSV, variantsCSV } = convertProductsToCSV(products);

  // Write CSV files
  fs.writeFileSync(path.join(outputDir, 'products.csv'), productsCSV);
  fs.writeFileSync(path.join(outputDir, 'product_variants.csv'), variantsCSV);

  logger.audit(`✅ Converted ${products.length} products to CSV`);
  logger.audit(`📁 Products CSV: ${path.join(outputDir, 'products.csv')}`);
  logger.audit(
    `📁 Variants CSV: ${path.join(outputDir, 'product_variants.csv')}`
  );
}

main().catch((error) => {
  logger.error('json-to-csv script failed', error as Error);
  process.exit(1);
});
