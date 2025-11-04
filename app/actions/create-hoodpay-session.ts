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
import { createClient } from '@/lib/supabase/server';
import type { CheckoutData, CheckoutItem } from '@/types/payment';

interface Metadata {
  items?: CheckoutItem[];
  totals?: {
    subtotal?: number;
    tax?: number;
    shipping?: number;
    total?: number;
  };
  customerInfo?: {
    email?: string;
  };
  [key: string]: unknown; // Add index signature
}

type HoodpaySessionInput = {
  amount: number;
  currency: string;
  metadata?: Metadata;
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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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

    // Normalize checkout_data from provided metadata
    const md: Metadata = input.metadata || {};
    const items = Array.isArray(md.items) ? md.items : [];
    const totals = md.totals || {};
    const customerInfo =
      md.customerInfo ??
      (input.customer ? { email: input.customer.email } : undefined);

    const checkout_data: CheckoutData = {
      items: items.map((it, idx) => ({
        id: String(it.id ?? `item-${idx}`),
        name: String(it.name ?? 'Product'),
        description: it.description ?? undefined,
        quantity: Number(it.quantity ?? 1),
        unitPrice:
          typeof it.total === 'number' && Number(it.quantity || 1) > 0
            ? Number(it.total) / Number(it.quantity || 1)
            : 0,
        total: Number(it.total ?? 0),
      })),
      subtotal: Number(totals.subtotal ?? 0),
      tax: Number(totals.tax ?? 0),
      shipping: Number(totals.shipping ?? 0),
      total: Number(totals.total ?? input.amount ?? 0),
      currency: 'USD',
      customerInfo,
    };

    const newPayment: Omit<PaymentRecord, 'id' | 'created_at' | 'updated_at'> =
      {
        hp_payment_id: session.id,
        business_id: businessId,
        session_id: session.id,
        amount: input.amount,
        currency: 'USD',
        status: PaymentStatus.PENDING,
        method: PaymentMethod.HOODPAY,
        customer_email: input.customer?.email,
        customer_ip: ip,
        metadata: {
          ...input.metadata,
          user_id: user?.id,
        },
        checkout_data,
      };
    await db.createPayment(newPayment);
  } catch (e) {
    // Do not block checkout on DB failures; log for later review
    logger.error('Failed to persist initial payment record', e as Error);
  }

  return session;
}
