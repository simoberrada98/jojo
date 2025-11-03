'use server';
import 'server-only';
import { headers } from 'next/headers';
import { APP_CONFIG } from '@/lib/config/app.config';
import { logger } from '@/lib/utils/logger';
import { env } from '@/lib/config/env';
import { paymentServerConfig } from '@/lib/config/payment.config.server';
import { supabaseConfig } from '@/lib/supabase/config';
import { createPaymentDbService } from '@/lib/services/payment-db.service';
import {
  PaymentMethod,
  PaymentStatus,
  type PaymentRecord,
} from '@/types/payment';
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

  // Persist initial payment record for reconciliation and shipping
  try {
    const db = createPaymentDbService(
      supabaseConfig.url,
      env.SUPABASE_SERVICE_ROLE_KEY
    );
    const businessId = paymentServerConfig.hoodpay.businessId || '';
    const newPayment: Omit<PaymentRecord, 'id' | 'created_at' | 'updated_at'> =
      {
        hoodpay_payment_id: session.id,
        business_id: businessId,
        session_id: session.id,
        amount: input.amount,
        currency: 'USD',
        status: PaymentStatus.PENDING,
        method: PaymentMethod.HOODPAY,
        customer_email: input.customer?.email,
        customer_ip: ip,
        metadata: input.metadata,
      };
    await db.createPayment(newPayment);
  } catch (e) {
    // Do not block checkout on DB failures; log for later review
    logger.error('Failed to persist initial payment record', e as Error);
  }

  return session;
}
