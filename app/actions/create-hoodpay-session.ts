'use server';
import { paymentServerConfig } from '@/lib/config/payment.config.server';
import 'server-only';

import { CONVERSION_RATES } from '@/lib/config/currency.config';
import { PricingService } from '@/lib/services/pricing.service';

export async function createHoodpaySessionAction(input: {
  amount: any;
  currency: any;
  metadata: any;
  customer: any;
}) {
  const { apiKey, businessId } = paymentServerConfig.hoodpay;
  if (!apiKey || !businessId) {
    throw new Error('HoodPay credentials are not configured');
  }
  const payload = {
    amount: PricingService.convertPrice(
      input.amount,
      input.currency,
      CONVERSION_RATES
    ),
    currency: 'USD',
    metadata: input.metadata ?? {},
    customerEmail: input.customer?.email,
  };
  console.error('HoodPay payload:', payload);
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
    console.error('HoodPay API response status:', res.status);
    throw new Error(`Failed to create HoodPay session: ${await res.text()}`);
  }
  const data = await res.json();
  const session = data?.data ?? data;
  return { checkoutUrl: session.url, id: session.id };
}
