import 'server-only';
import { env } from './env';

export const paymentServerConfig = {
  hoodpay: {
    apiKey: env.HOODPAY_API_KEY,
    businessId: env.HOODPAY_BUSINESS_ID,
    webhookSecret: env.HOODPAY_WEBHOOK_SECRET,
  },
} as const;
