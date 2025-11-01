import { env } from './env';

export interface PaymentConfig {
  paymentTimeoutSeconds: number;
  paymentStatusPollIntervalSeconds: number;
  supportedMethods: Array<'hoodpay' | 'web-payment'>;
  hoodpay: {
    apiKey?: string;
    businessId?: string;
    webhookSecret?: string;
  };
}

export const PAYMENT_CONFIG: PaymentConfig = {
  paymentTimeoutSeconds: 15 * 60,
  paymentStatusPollIntervalSeconds: 5,
  supportedMethods: ['hoodpay', 'web-payment'],
  hoodpay: {
    apiKey: env.HOODPAY_API_KEY,
    businessId: env.HOODPAY_BUSINESS_ID,
    webhookSecret: env.HOODPAY_WEBHOOK_SECRET,
  },
} as const;
