import 'server-only';

import { env } from '@/lib/config/env';
import { APP_CONFIG } from './app.config';

const rawHoodpayConfig = {
  apiKey: env.HOODPAY_API_KEY,
  businessId: env.HOODPAY_BUSINESS_ID,
  storeId: env.HOODPAY_STORE_ID,
  webhookSecret: env.HOODPAY_WEBHOOK_SECRET,
  baseUrl: env.HOODPAY_API_URL,
  successUrl: env.CHECKOUT_SUCCESS_URL,
  cancelUrl: env.CHECKOUT_CANCEL_URL,
} as const;

const normalizeBaseUrl = (value: string): string => {
  const trimmed = value.trim();
  return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
};

export type HoodpayServerConfig = {
  apiKey: string;
  businessId: string;
  webhookSecret?: string;
  baseUrl: string;
  successUrl: string;
  cancelUrl: string;
  notifyUrl: string;
};

let cachedConfig: HoodpayServerConfig | null = null;

export function resolveHoodpayConfig(options?: {
  force?: boolean;
}): HoodpayServerConfig | null {
  if (!env.NEXT_PUBLIC_ENABLE_HOODPAY) {
    return null;
  }

  if (cachedConfig && !options?.force) {
    return cachedConfig;
  }

  const baseUrlCandidate =
    rawHoodpayConfig.baseUrl ?? env.BASE_URL ?? APP_CONFIG.baseUrl;
  const baseUrl =
    typeof baseUrlCandidate === 'string'
      ? normalizeBaseUrl(baseUrlCandidate)
      : undefined;

  const successUrl =
    rawHoodpayConfig.successUrl ??
    (baseUrl ? `${baseUrl}/thank-you` : undefined);

  const cancelUrl =
    rawHoodpayConfig.cancelUrl ?? (baseUrl ? `${baseUrl}/checkout-cancel` : undefined);

  const notifyUrl = baseUrl ? `${baseUrl}/api/hoodpay/webhook` : undefined;

  const requiredConfig: Record<string, string | undefined> = {
    HOODPAY_API_KEY: rawHoodpayConfig.apiKey,
    HOODPAY_STORE_ID:
      rawHoodpayConfig.storeId ?? rawHoodpayConfig.businessId,
    CHECKOUT_SUCCESS_URL: successUrl,
    BASE_URL: baseUrl,
  };

  const missing = Object.entries(requiredConfig)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(`Hoodpay configuration missing: ${missing.join(', ')}`);
  }

  cachedConfig = {
    apiKey: requiredConfig.HOODPAY_API_KEY!,
    businessId: requiredConfig.HOODPAY_STORE_ID!,
    webhookSecret: rawHoodpayConfig.webhookSecret ?? undefined,
    baseUrl: baseUrl!,
    successUrl: successUrl!,
    cancelUrl: cancelUrl ?? `${baseUrl!}/checkout`,
    notifyUrl: notifyUrl ?? `${baseUrl!}/api/hoodpay/webhook`,
  };

  return cachedConfig;
}

export const paymentServerConfig = {
  get hoodpay(): HoodpayServerConfig | null {
    return resolveHoodpayConfig();
  },
} as const;

export const PAYMENT_CONFIG = {
  paymentTimeoutSeconds: 15 * 60,
  paymentStatusPollIntervalSeconds: 5,
  supportedMethods: ['hoodpay'],
  hoodpay: {
    apiKey: env.HOODPAY_API_KEY,
    businessId: env.HOODPAY_BUSINESS_ID,
    webhookSecret: env.HOODPAY_WEBHOOK_SECRET,
  },
} as const;
