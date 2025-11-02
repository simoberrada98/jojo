'use server';
import { paymentServerConfig } from '@/lib/config/payment.config.server';
import 'server-only';

import { CONVERSION_RATES, Currency } from '@/lib/config/currency.config';
import { PricingService } from '@/lib/services/pricing.service';
import { logger } from '@/lib/utils/logger';

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

export async function createHoodpaySessionAction(
  input: HoodpaySessionInput
) {
  const { apiKey, businessId } = paymentServerConfig.hoodpay;
  if (!apiKey || !businessId) {
    throw new Error('HoodPay credentials are not configured');
  }
  const payload = {
    amount: PricingService.convertPrice(
      input.amount,
      input.currency as Currency,
      CONVERSION_RATES
    ),
    currency: 'USD',
    metadata: input.metadata ?? {},
    customerEmail: input.customer?.email,
  };
  const res = await fetch(
    `https://api.hoodpay.io/v1/businesses/${businessId}/payments`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    }
  );
  if (!res.ok) {
    logger.error('HoodPay API response', undefined, { status: res.status });
    throw new Error(`Failed to create HoodPay session: ${await res.text()}`);
  }
  const data = (await res.json()) as HoodpaySessionResponse;
  const session = data?.data ?? data;
  return { checkoutUrl: session.url, id: session.id };
}
