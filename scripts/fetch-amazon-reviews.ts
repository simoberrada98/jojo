#!/usr/bin/env ts-node
import { publishReviewsForGtin } from '@/lib/services/reviews/amazon-reviews.service';
import { logger } from '@/lib/utils/logger';
import { env } from '@/lib/config/env';

async function main() {
  const gtin = process.argv[2]?.trim();
  if (!gtin) {
    console.error('Usage: pnpm fetch-amazon-reviews <GTIN>');
    process.exit(1);
  }

  if (!env.SERPAPI_API_KEY) {
    console.error('SERPAPI_API_KEY is not configured. Aborting.');
    process.exit(1);
  }

  try {
    logger.info('Fetching Amazon reviews via SerpAPI', undefined, { gtin });
    const result = await publishReviewsForGtin(gtin);
    logger.info('Publish complete', undefined, result);
    console.log(JSON.stringify(result));
  } catch (error) {
    logger.error('fetch-amazon-reviews failed', error as Error, { gtin });
    process.exit(2);
  }
}

main();

