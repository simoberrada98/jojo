import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { logger } from '../lib/utils/logger';

// Load environment variables from .env.local
config({ path: '.env.local' });

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
    title?: string;
    sku: string;
    price: string;
    compare_at_price: string | null;
    available: boolean;
    position: number;
    created_at: string;
    updated_at: string;
  }>;
  images: Array<{
    src: string;
    position: number;
  }>;
}

interface ProductSpecs {
  hashRate?: string;
  power?: string;
  algorithm?: string;
  efficiency?: string;
}

function extractSpecs(bodyHtml: string): ProductSpecs {
  const specs: ProductSpecs = {};

  const hashRateMatch = bodyHtml.match(
    /(\d+(?:,\d+)?)\s*(?:MH\/s|TH\/s|GH\/s)/i
  );
  if (hashRateMatch) specs.hashRate = hashRateMatch[0].replace(',', '');

  const powerMatch = bodyHtml.match(/(\d+(?:,\d+)?)\s*W(?:att)?/i);
  if (powerMatch) specs.power = powerMatch[1].replace(',', '') + 'W';

  const algoMatch = bodyHtml.match(
    /(?:Algorithm|Cryptocurrency)[:\s]+(\w+(?:\s+\|\s+\w+)?)/i
  );
  if (algoMatch) specs.algorithm = algoMatch[1].split('|')[0].trim();

  const efficiencyMatch = bodyHtml.match(/([\d.]+)\s*J\/(?:TH|MH|GH)/i);
  if (efficiencyMatch) specs.efficiency = efficiencyMatch[0];

  return specs;
}

interface ProductDimensions {
  length?: number;
  width?: number;
  height?: number;
  weight?: number;
}

function extractDimensions(bodyHtml: string): ProductDimensions {
  const dimensions: ProductDimensions = {};

  const dimMatch = bodyHtml.match(
    /([\d.]+)\s*x\s*([\d.]+)\s*x\s*([\d.]+)\s*inches/i
  );
  if (dimMatch) {
    dimensions.length = parseFloat((parseFloat(dimMatch[1]) * 2.54).toFixed(2));
    dimensions.width = parseFloat((parseFloat(dimMatch[2]) * 2.54).toFixed(2));
    dimensions.height = parseFloat((parseFloat(dimMatch[3]) * 2.54).toFixed(2));
  }

  const weightMatch = bodyHtml.match(/(?:Net weight)[:\s]+([\d.]+)\s*lbs/i);
  if (weightMatch) {
    dimensions.weight = parseFloat(
      (parseFloat(weightMatch[1]) * 0.453592).toFixed(2)
    );
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

async function seedDatabase() {
  // Initialize Supabase client with service role key
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseKey) {
    logger.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in environment');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  logger.audit('🌱 Starting database seed...\n');

  // Read all optimized JSON files
  const jsonDir = path.join(process.cwd(), 'lib/data/json-optimized');
  const files = fs.readdirSync(jsonDir).filter((f) => f.endsWith('.json'));

  logger.audit(`📦 Found ${files.length} products to import\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const file of files) {
    try {
      const filePath = path.join(jsonDir, file);
      const product: ProductJSON = JSON.parse(
        fs.readFileSync(filePath, 'utf-8')
      );

      // Skip products without variants or images
      if (!product.variants || product.variants.length === 0) {
        logger.audit(`⚠️  Skipping ${product.title}: No variants`);
        continue;
      }

      if (!product.images || product.images.length === 0) {
        logger.audit(`⚠️  Skipping ${product.title}: No images`);
        continue;
      }

      const specs = extractSpecs(product.body_html);
      const dimensions = extractDimensions(product.body_html);

      // Determine brand
      let brand = '';
      if (product.title.toLowerCase().includes('bitmain')) brand = 'Bitmain';
      else if (product.title.toLowerCase().includes('whatsminer'))
        brand = 'MicroBT';
      else if (product.title.toLowerCase().includes('antminer'))
        brand = 'Bitmain';

      const category = product.product_type || 'ASIC Miners';

      const shortDescription =
        product.body_html
          .replace(/<[^>]*>/g, '')
          .replace(/\s+/g, ' ')
          .trim()
          .substring(0, 200) + '...';

      const firstVariant = product.variants[0];

      // Validate first variant has a price
      if (!firstVariant.price || parseFloat(firstVariant.price) <= 0) {
        logger.audit(`⚠️  Skipping ${product.title}: Invalid or missing price`);
        continue;
      }

      // Insert product
      const { data: insertedProduct, error: productError } = await supabase
        .from('products')
        .insert({
          sku: firstVariant?.sku || `PROD-${product.id}`,
          name: product.title,
          slug: product.handle,
          description: product.body_html,
          short_description: shortDescription,
          category,
          brand,
          tags: product.tags,
          base_price: parseFloat(firstVariant?.price || '0'),
          compare_at_price: firstVariant?.compare_at_price
            ? parseFloat(firstVariant.compare_at_price)
            : null,
          hash_rate: specs.hashRate || null,
          power_consumption: specs.power || null,
          algorithm: specs.algorithm || null,
          efficiency: specs.efficiency || null,
          weight: dimensions.weight ? dimensions.weight.toString() : null,
          dimensions_length: dimensions.length
            ? dimensions.length.toString()
            : null,
          dimensions_width: dimensions.width
            ? dimensions.width.toString()
            : null,
          dimensions_height: dimensions.height
            ? dimensions.height.toString()
            : null,
          featured_image_url: product.images[0]?.src || null,
          images: product.images.map((img) => img.src),
          meta_title: product.title,
          meta_description: generateMetaDescription(
            product.title,
            product.body_html
          ),
          is_featured: false,
          is_active: true,
          published_at: product.published_at,
          stock_quantity: 10,
        })
        .select()
        .single();

      if (productError) {
        logger.error(
          `❌ Error inserting product ${product.title}`,
          productError
        );
        errorCount++;
        continue;
      }

      // Insert variants
      for (const variant of product.variants) {
        // Skip variants without valid prices
        if (!variant.price || parseFloat(variant.price) <= 0) {
          logger.audit(`⚠️  Skipping variant ${variant.sku}: Invalid price`);
          continue;
        }

        const { error: variantError } = await supabase
          .from('product_variants')
          .insert({
            product_id: insertedProduct.id,
            sku: variant.sku,
            name: variant.title || 'Default Title',
            price: parseFloat(variant.price),
            compare_at_price: variant.compare_at_price
              ? parseFloat(variant.compare_at_price)
              : null,
            image_url: product.images[0]?.src || null,
            images: product.images.map((img) => img.src),
            stock_quantity: 10,
            is_active: variant.available,
            position: variant.position,
          });

        if (variantError) {
          logger.error(
            `⚠️  Error inserting variant for ${product.title}`,
            variantError
          );
        }
      }

      logger.audit(`✅ Imported: ${product.title}`);
      successCount++;
    } catch (error) {
      logger.error(`❌ Error processing ${file}`, error as Error);
      errorCount++;
    }
  }

  logger.audit(`\n📊 Import Summary:`);
  logger.audit(`   ✅ Success: ${successCount}`);
  logger.audit(`   ❌ Errors: ${errorCount}`);
  logger.audit(`   📦 Total: ${files.length}`);

  // Verify data
  const { count } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });

  logger.audit(`\n🔍 Database verification:`);
  logger.audit(`   Products in database: ${count}`);
}

seedDatabase().catch((error) => {
  logger.error('seed-database script failed', error as Error);
  process.exit(1);
});
