import 'server-only';
import { env } from './env';

export const paymentServerConfig = {
  hoodpay: {
    apiKey: env.HOODPAY_API_KEY,
    businessId: env.HOODPAY_BUSINESS_ID,
    storeId: env.HOODPAY_STORE_ID,
    webhookSecret: env.HOODPAY_WEBHOOK_SECRET,
    baseUrl: env.BASE_URL ?? env.NEXT_PUBLIC_BASE_URL,
    successUrl:
      env.CHECKOUT_SUCCESS_URL ??
      ((env.BASE_URL ?? env.NEXT_PUBLIC_BASE_URL)
        ? `${(env.BASE_URL ?? env.NEXT_PUBLIC_BASE_URL).replace(/\/$/, '')}/thank-you`
        : undefined),
    cancelUrl:
      env.CHECKOUT_CANCEL_URL ??
      ((env.BASE_URL ?? env.NEXT_PUBLIC_BASE_URL)
        ? `${(env.BASE_URL ?? env.NEXT_PUBLIC_BASE_URL).replace(/\/$/, '')}/checkout`
        : undefined),
  },
} as const;
