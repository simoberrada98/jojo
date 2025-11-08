#!/usr/bin/env ts-node
import { SupabaseAdminService } from '@/lib/services/supabase-admin.service';
import { logger } from '@/lib/utils/logger';

async function main() {
  const admin = new SupabaseAdminService();
  const supabase = admin.getClient();

  const { data, error } = await supabase
    .from('product_reviews')
    .select('product_id, rating, helpful_count, created_at');

  if (error) {
    logger.error('Stats query failed', error);
    process.exit(2);
  }

  const map = new Map<string, { sum: number; count: number; helpful: number; latest?: string }>();
  for (const row of (data || []) as Array<{ product_id: string; rating: number; helpful_count: number | null; created_at: string | null }>) {
    const entry = map.get(row.product_id) || { sum: 0, count: 0, helpful: 0 };
    entry.sum += Number(row.rating || 0);
    entry.count += 1;
    entry.helpful += Number(row.helpful_count || 0);
    if (row.created_at && (!entry.latest || row.created_at > entry.latest)) {
      entry.latest = row.created_at;
    }
    map.set(row.product_id, entry);
  }

  const stats = Array.from(map.entries()).map(([product_id, { sum, count, helpful, latest }]) => ({
    product_id,
    average_rating: count ? Number((sum / count).toFixed(2)) : 0,
    review_count: count,
    total_helpful_votes: helpful,
    latest_review_at: latest ?? null,
  }));

  console.log(JSON.stringify({ stats }, null, 2));
}

main();

