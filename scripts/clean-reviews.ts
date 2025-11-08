#!/usr/bin/env ts-node
import { SupabaseAdminService } from '@/lib/services/supabase-admin.service';
import { logger } from '@/lib/utils/logger';

const DAYS = Number(process.argv[2] ?? 90);

async function main() {
  const admin = new SupabaseAdminService();
  const supabase = admin.getClient();

  const cutoff = new Date(Date.now() - DAYS * 24 * 60 * 60 * 1000)
    .toISOString();

  // Remove unapproved and very old external reviews
  const { error } = await supabase
    .from('product_reviews')
    .delete()
    .is('user_id', null)
    .eq('is_approved', false)
    .lt('created_at', cutoff);

  if (error) {
    logger.error('Clean reviews failed', error, { cutoff, days: DAYS });
    process.exit(2);
  }

  logger.info('Clean reviews success', undefined, { cutoff, days: DAYS });
}

main();

