import 'server-only';
import { paymentServerConfig } from '@/lib/config/payment.config.server';
import { APP_CONFIG } from '@/lib/config/app.config';
import { createPayment } from '@/lib/hoodpayModule';
import { logger } from '@/lib/utils/logger';

export type HoodpaySessionInput = {
  amount: number; // USD amount
  currency: string; // Display currency (we submit USD to HP)
  metadata?: Record<string, unknown>;
  customer?: {
    email?: string;
    ip?: string;
    userAgent?: string;
  };
  redirectUrl?: string;
  notifyUrl?: string;
  name?: string;
  description?: string;
};

export type HoodpaySessionResult = {
  checkoutUrl: string;
  id: string;
};

/**
 * Create a HoodPay payment session using server credentials.
 * - Always submits currency as USD; amount expected to be USD.
 * - Embeds metadata into the description (compact JSON) for shipping context.
 */
export async function createHoodpayPaymentSession(
  input: HoodpaySessionInput
): Promise<HoodpaySessionResult> {
  const { apiKey, businessId } = paymentServerConfig.hoodpay;

  if (!apiKey || !businessId) {
    throw new Error('HP credentials are not configured');
  }

  const baseUrl = APP_CONFIG.baseUrl;
  const redirectUrl =
    input.redirectUrl || (baseUrl ? `${baseUrl}/thank-you` : undefined);
  const notifyUrl =
    input.notifyUrl || (baseUrl ? `${baseUrl}/api/hoodpay/webhook` : undefined);

  const safeStringify = (obj: unknown, max = 600): string | undefined => {
    if (!obj) return undefined;
    try {
      const s = JSON.stringify(obj);
      return s.length > max ? `${s.slice(0, max)}...` : s;
    } catch (_e) {
      return undefined;
    }
  };

  const metaJson = safeStringify(input.metadata);

  const name = input.name || 'Order';
  const description =
    input.description ||
    (metaJson
      ? `Order metadata: ${metaJson}`
      : 'Order created via website checkout');

  try {
    const res = await createPayment(apiKey, businessId, {
      currency: 'USD',
      amount: input.amount,
      name,
      description,
      customerEmail: input.customer?.email,
      customerIp: input.customer?.ip,
      customerUserAgent: input.customer?.userAgent,
      redirectUrl,
      notifyUrl,
    });

    // Extract checkout URL and id without using `any`
    const isRecord = (v: unknown): v is Record<string, unknown> =>
      typeof v === 'object' && v !== null;

    let checkoutUrl: string | undefined;
    let id: string | undefined;

    if (isRecord(res)) {
      if (typeof res.paymentUrl === 'string') checkoutUrl = res.paymentUrl;
      // Some environments may return snake_case or a fallback `url`
      if (
        !checkoutUrl &&
        typeof (res as { payment_url?: unknown }).payment_url === 'string'
      ) {
        checkoutUrl = (res as { payment_url?: string }).payment_url;
      }
      if (!checkoutUrl && typeof (res as { url?: unknown }).url === 'string') {
        checkoutUrl = (res as { url?: string }).url;
      }
      if (typeof res.id === 'string' || typeof res.id === 'number') {
        id = String(res.id);
      }
    }

    if (!checkoutUrl) {
      throw new Error('Crypto API did not return a checkout URL');
    }
    return { checkoutUrl, id: id ?? '' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create session';
    logger.error('Crypto API response', undefined, { error: msg });
    throw new Error(`Failed to create Crypto session: ${msg}`);
  }
}
