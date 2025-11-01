import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

async function verifyData() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log('🔍 Verifying seeded data...\n');

  // Check products
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, name, base_price, featured_image_url, images')
    .limit(5);

  if (productsError) {
    console.error('❌ Error fetching products:', productsError.message);
    return;
  }

  console.log('📦 Sample Products:');
  products?.forEach((p) => {
    console.log(`  • ${p.name}`);
    console.log(`    Price: $${p.base_price}`);
    console.log(`    Featured Image: ${p.featured_image_url ? '✅' : '❌'}`);
    console.log(`    Images Count: ${p.images?.length || 0}`);
  });

  // Check variants
  const { data: variants, error: variantsError } = await supabase
    .from('product_variants')
    .select('id, name, price, image_url, images, product_id')
    .limit(5);

  if (variantsError) {
    console.error('❌ Error fetching variants:', variantsError.message);
    return;
  }

  console.log('\n🎯 Sample Variants:');
  variants?.forEach((v) => {
    console.log(`  • ${v.name}`);
    console.log(`    Price: $${v.price}`);
    console.log(`    Image: ${v.image_url ? '✅' : '❌'}`);
    console.log(`    Images Count: ${v.images?.length || 0}`);
  });

  // Summary stats
  const { count: productCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });

  const { count: variantCount } = await supabase
    .from('product_variants')
    .select('*', { count: 'exact', head: true });

  console.log('\n📊 Summary:');
  console.log(`  Total Products: ${productCount}`);
  console.log(`  Total Variants: ${variantCount}`);

  // Check for missing data
  const { count: noImages } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .is('featured_image_url', null);

  const { count: noPrices } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .lte('base_price', 0);

  console.log('\n⚠️  Data Quality:');
  console.log(`  Products without images: ${noImages}`);
  console.log(`  Products with invalid prices: ${noPrices}`);

  if (noImages === 0 && noPrices === 0) {
    console.log('\n✅ All products have valid images and prices!');
  }
}

verifyData().catch(console.error);
