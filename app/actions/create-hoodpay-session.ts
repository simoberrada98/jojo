'use server';
import 'server-only';
import { headers } from 'next/headers';
import { z } from 'zod';
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
  type CheckoutData,
  type CheckoutItem,
} from '@/types/payment';
import { createHoodpayPaymentSession } from '@/lib/services/payment-strategies/hoodpay.strategy.server';
import { createClient } from '@/lib/supabase/server';

const PayloadSchema = z.object({
  cartId: z.string().min(1).optional(),
  amount: z.number().positive(),
  currency: z.string().min(3),
  metadata: z
    .object({
      items: z
        .array(
          z.object({
            id: z.union([z.string(), z.number()]).optional(),
            name: z.string().optional(),
            description: z.string().optional(),
            quantity: z.union([z.number(), z.string()]).optional(),
            total: z.union([z.number(), z.string()]).optional(),
            unitPrice: z.union([z.number(), z.string()]).optional(),
          })
        )
        .optional(),
      totals: z
        .object({
          subtotal: z.union([z.number(), z.string()]).optional(),
          tax: z.union([z.number(), z.string()]).optional(),
          shipping: z.union([z.number(), z.string()]).optional(),
          total: z.union([z.number(), z.string()]).optional(),
        })
        .optional(),
      customerInfo: z
        .object({
          email: z.string().email().optional(),
          name: z.string().optional(),
          phone: z.string().optional(),
          address: z
            .object({
              line1: z.string().optional(),
              line2: z.string().optional(),
              city: z.string().optional(),
              state: z.string().optional(),
              postalCode: z.string().optional(),
              country: z.string().optional(),
            })
            .optional(),
        })
        .optional(),
    })
    .catchall(z.unknown())
    .optional(),
  customer: z
    .object({
      email: z.string().email().optional(),
    })
    .optional(),
});

type NormalizedMetadata = {
  items?: Array<
    Partial<CheckoutItem> & {
      quantity?: number | string;
      total?: number | string;
      unitPrice?: number | string;
    }
  >;
  totals?: {
    subtotal?: number;
    tax?: number;
    shipping?: number;
    total?: number;
  };
  customerInfo?: {
    email?: string;
    name?: string;
    phone?: string;
    address?: {
      line1?: string;
      line2?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
    };
  };
  [key: string]: unknown;
};

export async function createHoodpaySessionAction(input: unknown) {
  const payload = PayloadSchema.parse(input);

  const hoodpayConfig = paymentServerConfig.hoodpay;
  let derivedBaseUrl: string | undefined;
  try {
    if (hoodpayConfig.successUrl) {
      derivedBaseUrl = new URL(hoodpayConfig.successUrl).origin;
    } else if (hoodpayConfig.cancelUrl) {
      derivedBaseUrl = new URL(hoodpayConfig.cancelUrl).origin;
    }
  } catch {
    derivedBaseUrl = undefined;
  }
  const baseUrl =
    derivedBaseUrl ??
    hoodpayConfig.baseUrl ??
    env.BASE_URL ??
    APP_CONFIG.baseUrl;

  const requiredConfig: Record<string, string | undefined> = {
    HOODPAY_API_KEY: hoodpayConfig.apiKey,
    HOODPAY_STORE_ID: hoodpayConfig.storeId ?? hoodpayConfig.businessId,
    CHECKOUT_SUCCESS_URL: hoodpayConfig.successUrl,
    CHECKOUT_CANCEL_URL: hoodpayConfig.cancelUrl,
    BASE_URL: baseUrl,
  };

  const missing = Object.entries(requiredConfig)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    logger.error('Hoodpay configuration missing', undefined, { missing });
    throw new Error('Payment configuration is incomplete.');
  }

  const requestHeaders = await headers();
  const ip = requestHeaders.get('x-forwarded-for') ?? undefined;
  const userAgent = requestHeaders.get('user-agent') ?? undefined;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const session = await createHoodpayPaymentSession({
    amount: payload.amount,
    currency: payload.currency,
    baseUrl: baseUrl!,
    successUrl: hoodpayConfig.successUrl!,
    cancelUrl: hoodpayConfig.cancelUrl!,
    cartId: payload.cartId,
    metadata: payload.metadata,
    customer: {
      email: payload.customer?.email,
      ip,
      userAgent,
    },
  });

  if (!session.checkoutUrl) {
    logger.error('Hoodpay session missing checkout URL', undefined, {
      payload: payload.cartId,
    });
    throw new Error('Crypto API did not return a checkout URL');
  }

  if (!session.id) {
    logger.warn('Hoodpay session returned no id', {
      cartId: payload.cartId,
    });
  }

  // Persist initial payment record for reconciliation and shipping
  try {
    const db = createPaymentDbService(
      supabaseConfig.url,
      env.SUPABASE_SERVICE_ROLE_KEY
    );

    const md = (payload.metadata ?? {}) as NormalizedMetadata;
    const items = Array.isArray(md.items) ? md.items : [];
    const totals = md.totals ?? {};
    const customerInfo =
      md.customerInfo ??
      (payload.customer ? { email: payload.customer.email } : undefined);

    const checkout_data: CheckoutData = {
      items: items.map((item, index) => {
        const rawQuantity = Number(item.quantity ?? 1);
        const quantity = Number.isFinite(rawQuantity) && rawQuantity > 0 ? rawQuantity : 1;
        const totalValue = Number(item.total ?? item.unitPrice ?? 0);
        const unitPriceCandidate =
          item.unitPrice !== undefined
            ? Number(item.unitPrice)
            : quantity > 0
              ? totalValue / quantity
              : totalValue;

        return {
          id: String(item.id ?? `item-${index}`),
          name: String(item.name ?? 'Product'),
          description: item.description ?? undefined,
          quantity,
          unitPrice: Number.isFinite(unitPriceCandidate) ? unitPriceCandidate : 0,
          total: Number.isFinite(totalValue) ? totalValue : 0,
        };
      }),
      subtotal: Number(totals.subtotal ?? 0),
      tax: Number(totals.tax ?? 0),
      shipping: Number(totals.shipping ?? 0),
      total: Number(totals.total ?? payload.amount),
      currency: payload.currency,
      customerInfo,
    };

    const newPayment: Omit<PaymentRecord, 'id' | 'created_at' | 'updated_at'> =
      {
        hp_payment_id: session.id ?? null,
        business_id:
          hoodpayConfig.storeId ?? hoodpayConfig.businessId ?? 'unknown',
        session_id: session.id ?? payload.cartId ?? '',
        amount: payload.amount,
        currency: payload.currency,
        status: PaymentStatus.PENDING,
        method: PaymentMethod.HOODPAY,
        customer_email: payload.customer?.email,
        customer_ip: ip,
        metadata: {
          ...(payload.metadata ?? {}),
          user_id: user?.id,
        },
        checkout_data,
      };

    const result = await db.createPayment(newPayment);
    if (!result.success) {
      logger.error(
        'Failed to persist initial payment record',
        undefined,
        result.error
      );
    }
  } catch (error) {
    logger.error('Failed to persist initial payment record', error as Error);
  }

  return session;
}
