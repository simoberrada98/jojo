import 'server-only';
import { paymentServerConfig } from '@/lib/config/payment.config.server';
import { APP_CONFIG } from '@/lib/config/app.config';
import { logger } from '@/lib/utils/logger';

type CreateSessionArgs = {
  amount: number;
  currency: string;
  baseUrl?: string;
  successUrl: string;
  cancelUrl: string;
  cartId?: string;
  metadata?: Record<string, unknown>;
  customer?: {
    email?: string;
    ip?: string;
    userAgent?: string;
  };
};

export type HoodpaySessionResult = {
  checkoutUrl: string;
  id?: string;
};

const HOODPAY_ENDPOINT = 'https://api.hoodpay.io/v1/checkout/sessions';

function normalizeBaseUrl(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

export async function createHoodpayPaymentSession(
  args: CreateSessionArgs
): Promise<HoodpaySessionResult> {
  const { apiKey, storeId, businessId, baseUrl: configuredBaseUrl } =
    paymentServerConfig.hoodpay;

  if (!apiKey || !(storeId || businessId)) {
    throw new Error('Hoodpay credentials are not configured');
  }

  const baseUrl = normalizeBaseUrl(
    args.baseUrl ?? configuredBaseUrl ?? APP_CONFIG.baseUrl ?? ''
  );
  if (!baseUrl) {
    throw new Error('Base URL is not configured');
  }

  const payload = {
    store_id: storeId ?? businessId,
    amount: args.amount,
    currency: String(args.currency || 'USD').toUpperCase(),
    success_url: args.successUrl,
    cancel_url: args.cancelUrl,
    callback_url: `${baseUrl}/api/hoodpay/webhook`,
    customer_email: args.customer?.email,
    customer_ip: args.customer?.ip,
    customer_user_agent: args.customer?.userAgent,
    metadata: {
      ...(args.cartId ? { cartId: args.cartId } : {}),
      ...(args.metadata ?? {}),
    },
  };

  const response = await fetch(HOODPAY_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  const rawBody = await response.text();
  let parsed: Record<string, unknown> | undefined;
  try {
    parsed = rawBody ? (JSON.parse(rawBody) as Record<string, unknown>) : undefined;
  } catch {
    parsed = undefined;
  }

  if (!response.ok) {
    logger.error('Hoodpay session creation failed', undefined, {
      status: response.status,
      body: rawBody.slice(0, 500),
    });
    throw new Error('Failed to create Crypto session: provider error');
  }

  const extractString = (...candidates: Array<unknown>): string | undefined => {
    for (const candidate of candidates) {
      if (typeof candidate === 'string' && candidate.length > 0) {
        return candidate;
      }
    }
    return undefined;
  };

  const checkoutUrl = extractString(
    parsed?.checkout_url,
    parsed?.paymentUrl,
    parsed?.payment_url,
    (parsed as { url?: unknown })?.url,
    (parsed as { data?: Record<string, unknown> })?.data?.checkout_url,
    (parsed as { data?: Record<string, unknown> })?.data?.paymentUrl,
    (parsed as { data?: Record<string, unknown> })?.data?.payment_url,
    (parsed as { data?: Record<string, unknown> })?.data?.url
  );

  const id = extractString(
    parsed?.id,
    (parsed as { data?: Record<string, unknown> })?.data?.id
  );

  if (!checkoutUrl) {
    logger.error('Hoodpay session missing checkout URL', undefined, {
      response: rawBody.slice(0, 500),
    });
    throw new Error('Crypto API did not return a checkout URL');
  }

  return {
    checkoutUrl,
    id,
  };
}
