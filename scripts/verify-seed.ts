import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { logger } from '../lib/utils/logger';

config({ path: '.env.local' });

async function verifyData() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseKey) {
    logger.error('❌ SUPABASE_SERVICE_ROLE_KEY not found');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  logger.audit('🔍 Verifying seeded data...\n');

  // Check products
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, name, base_price, featured_image_url, images')
    .limit(5);

  if (productsError) {
    logger.error('❌ Error fetching products', productsError);
    return;
  }

  logger.audit('📦 Sample Products:');
  products?.forEach((p) => {
    logger.audit(`  • ${p.name}`);
    logger.audit(`    Price: $${p.base_price}`);
    logger.audit(`    Featured Image: ${p.featured_image_url ? '✅' : '❌'}`);
    logger.audit(`    Images Count: ${p.images?.length || 0}`);
  });

  // Check variants
  const { data: variants, error: variantsError } = await supabase
    .from('product_variants')
    .select('id, name, price, image_url, images, product_id')
    .limit(5);

  if (variantsError) {
    logger.error('❌ Error fetching variants', variantsError);
    return;
  }

  logger.audit('\n🎯 Sample Variants:');
  variants?.forEach((v) => {
    logger.audit(`  • ${v.name}`);
    logger.audit(`    Price: $${v.price}`);
    logger.audit(`    Image: ${v.image_url ? '✅' : '❌'}`);
    logger.audit(`    Images Count: ${v.images?.length || 0}`);
  });

  // Summary stats
  const { count: productCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });

  const { count: variantCount } = await supabase
    .from('product_variants')
    .select('*', { count: 'exact', head: true });

  logger.audit('\n📊 Summary:');
  logger.audit(`  Total Products: ${productCount}`);
  logger.audit(`  Total Variants: ${variantCount}`);

  // Check for missing data
  const { count: noImages } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .is('featured_image_url', null);

  const { count: noPrices } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .lte('base_price', 0);

  logger.audit('\n⚠️  Data Quality:');
  logger.audit(`  Products without images: ${noImages}`);
  logger.audit(`  Products with invalid prices: ${noPrices}`);

  if (noImages === 0 && noPrices === 0) {
    logger.audit('\n✅ All products have valid images and prices!');
  }
}

verifyData().catch((error) => {
  logger.error('verify-seed script failed', error as Error);
  process.exit(1);
});
