#!/usr/bin/env ts-node
import '@/lib/config/load-env';
import { publishReviewsForGtin } from '@/lib/services/reviews/amazon-reviews.service';
import { SupabaseAdminService } from '@/lib/services/supabase-admin.service';
import { logger } from '@/lib/utils/logger';
import { env } from '@/lib/config/env';
import type { Database } from '@/types/supabase.types';

async function main() {
  if (!env.SERPAPI_API_KEY) {
    console.error('SERPAPI_API_KEY is not configured. Aborting.');
    process.exit(1);
  }

  const admin = new SupabaseAdminService();
  const supabase = admin.getClient();

  const { data, error } = await supabase
    .from('products')
    .select('gtin')
    .eq('is_active', true)
    .eq('is_archived', false)
    .not('gtin', 'is', null)
    .order('updated_at', { ascending: false })
    .limit(500);

  if (error) {
    logger.error('Failed to list products for refresh', error);
    process.exit(2);
  }

  const gtins: string[] = (data || [])
    .map((r: Pick<Database['public']['Tables']['products']['Row'], 'gtin'>) =>
      String(r.gtin).trim()
    )
    .filter(Boolean);

  logger.info(`Refreshing reviews for ${gtins.length} products`);

  let success = 0;
  for (const gtin of gtins) {
    try {
      const res = await publishReviewsForGtin(gtin);
      success += res.inserted + res.updated;
      // Small delay to respect rate limiting inside service
      await new Promise((r) => setTimeout(r, 250));
    } catch (err) {
      logger.warn('Refresh failed for GTIN', err as Error, { gtin });
    }
  }

  logger.info('Refresh complete', undefined, { affected: success });
  console.log(JSON.stringify({ affected: success }));
}

main();
