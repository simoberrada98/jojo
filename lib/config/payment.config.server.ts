import 'server-only'
import { env } from '@/lib/config/env';

export const paymentServerConfig = {
  hoodpay: {
    apiKey: env.HOODPAY_API_KEY!,        // server-only
    businessId: env.HOODPAY_BUSINESS_ID!,// server-only
    webhookSecret: env.HOODPAY_WEBHOOK_SECRET!, // server-only
  },
}