'use server';
import 'server-only';
import { headers } from 'next/headers';
import { APP_CONFIG } from '@/lib/config/app.config';
import { logger } from '@/lib/utils/logger';
import { createHoodpayPaymentSession } from '@/lib/services/payment-strategies/hoodpay.strategy.server';

type HoodpaySessionInput = {
  amount: number;
  currency: string;
  metadata?: Record<string, unknown>;
  customer?: {
    email?: string;
  };
};

type HoodpaySessionResponse = {
  data?: {
    url: string;
    id: string;
  };
  url?: string;
  id?: string;
};

export async function createHoodpaySessionAction(input: HoodpaySessionInput) {
  const h = await headers();
  const ip = h.get('x-forwarded-for') || undefined;
  const userAgent = h.get('user-agent') || undefined;

  const baseUrl = APP_CONFIG.baseUrl;
  const redirectUrl = baseUrl ? `${baseUrl}/thank-you` : undefined;
  const notifyUrl = baseUrl ? `${baseUrl}/api/hoodpay/webhook` : undefined;

  const session = await createHoodpayPaymentSession({
    amount: input.amount, // already USD
    currency: 'USD',
    metadata: input.metadata,
    customer: { email: input.customer?.email, ip, userAgent },
    redirectUrl,
    notifyUrl,
    name: 'Order',
  });

  if (!session.checkoutUrl) {
    logger.error('Crypto API response', undefined, { status: 'no_url' });
    throw new Error('Failed to create Crypto session: missing checkout URL');
  }

  return session;
}
