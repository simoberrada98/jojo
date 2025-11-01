"use server";
import { paymentServerConfig } from '@/lib/config/payment.config.server';
import 'server-only';


export async function createHoodpaySessionAction(input: { amount: any; currency: any; metadata: any; customer: any; }) {
  const { apiKey, businessId } = paymentServerConfig.hoodpay;
  if (!apiKey || !businessId) {
    throw new Error('HoodPay credentials are not configured');
  }
  const payload = {
    amount: input.amount,
    currency: input.currency,
    businessId,
    metadata: input.metadata ?? {},
    customer: input.customer ?? {},
  };
  const res = await fetch('https://api.hoodpay.io/v1/dash/payments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Failed to create HoodPay session: ${await res.text()}`);
  const data = await res.json();
  const session = data?.data ?? data;
  return { checkoutUrl: session.checkoutUrl, id: session.id };
}
