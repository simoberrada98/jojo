import 'server-only';
import { paymentServerConfig } from '@/lib/config/payment.config.server';
import { APP_CONFIG } from '@/lib/config/app.config';
import {
  createPayment,
  type HoodPayPaymentResponse,
} from '@/lib/hoodpayModule';
import { logger } from '@/lib/utils/logger';

type CreateSessionArgs = {
  amount: number;
  currency: string;
  baseUrl?: string;
  successUrl: string;
  cancelUrl?: string;
  notifyUrl?: string;
  cartId?: string;
  metadata?: Record<string, unknown>;
  customer?: {
    email?: string;
    ip?: string;
    userAgent?: string;
  };
  name?: string;
  description?: string;
};

export type HoodpaySessionResult = {
  checkoutUrl: string;
  id?: string;
  providerResponse: HoodPayPaymentResponse;
};

function normalizeBaseUrl(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

function safeStringify(value: unknown): string | undefined {
  try {
    return JSON.stringify(value);
  } catch {
    return undefined;
  }
}

export async function createHoodpayPaymentSession(
  args: CreateSessionArgs
): Promise<HoodpaySessionResult> {
  const {
    apiKey,
    businessId,
    baseUrl: configuredBaseUrl,
    cancelUrl: configCancelUrl,
  } = paymentServerConfig.hoodpay;

  if (!apiKey || !businessId) {
    throw new Error('Hoodpay credentials are not configured');
  }

  const baseUrl = normalizeBaseUrl(
    args.baseUrl ?? configuredBaseUrl ?? APP_CONFIG.baseUrl ?? ''
  );
  if (!baseUrl) {
    throw new Error('Base URL is not configured');
  }

  const redirectUrl = args.successUrl || `${baseUrl}/thank-you`;
  const notifyUrl = args.notifyUrl ?? `${baseUrl}/api/hoodpay/webhook`;

  const metadataSnippet = args.metadata
    ? safeStringify(args.metadata)
    : undefined;
  const description =
    args.description ??
    (metadataSnippet
      ? `Cart metadata: ${metadataSnippet.slice(0, 500)}`
      : undefined);

  const currency = (args.currency || 'USD').toUpperCase();
  const cancelUrl = args.cancelUrl ?? configCancelUrl ?? `${baseUrl}/checkout`;

  const response = await createPayment(apiKey, businessId, {
    currency,
    amount: args.amount,
    name: args.name ?? 'Order',
    description,
    customerEmail: args.customer?.email,
    customerIp: args.customer?.ip,
    customerUserAgent: args.customer?.userAgent,
    redirectUrl,
    notifyUrl,
    cancelUrl,
    metadata: {
      cart_id: args.cartId,
      selected_currency: (args.metadata as { selected_currency?: string })
        ?.selected_currency,
      subtotal:
        args.metadata &&
        (args.metadata as { totals?: { subtotal?: number } }).totals
          ? (args.metadata as { totals?: { subtotal?: number } }).totals
              ?.subtotal
          : undefined,
      tax:
        args.metadata && (args.metadata as { totals?: { tax?: number } }).totals
          ? (args.metadata as { totals?: { tax?: number } }).totals?.tax
          : undefined,
      shipping:
        args.metadata &&
        (args.metadata as { totals?: { shipping?: number } }).totals
          ? (args.metadata as { totals?: { shipping?: number } }).totals
              ?.shipping
          : undefined,
    },
  });

  const checkoutUrl =
    response?.paymentUrl ??
    (response as { payment_url?: string })?.payment_url ??
    (response as { checkout_url?: string })?.checkout_url ??
    (response as { url?: string })?.url ??
    (response as { data?: { url?: string } })?.data?.url;

  if (!checkoutUrl) {
    logger.error('Hoodpay session missing checkout URL', undefined, {
      response,
    });
    throw new Error('Crypto API did not return a checkout URL');
  }

  return {
    checkoutUrl,
    id:
      typeof response?.id === 'number' || typeof response?.id === 'string'
        ? String(response.id)
        : undefined,
    providerResponse: response,
  };
}
