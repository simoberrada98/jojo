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

  const providerCurrency = 'USD';
  const totalsFromClient =
    (payload.metadata as { totals?: { subtotal?: number; tax?: number; shipping?: number } })
      ?.totals ?? {};
  const rawSubtotal = Number(totalsFromClient.subtotal);
  const rawTax = Number(totalsFromClient.tax);
  const rawShipping = Number(totalsFromClient.shipping);

  const sanitizedTax = Number.isFinite(rawTax) ? Number(rawTax.toFixed(2)) : 0;
  const sanitizedShipping = Number.isFinite(rawShipping)
    ? Number(rawShipping.toFixed(2))
    : 0;

  const preliminaryTotal = Number.isFinite(payload.amount)
    ? Number(payload.amount)
    : 0;
  const sanitizedSubtotal = Number.isFinite(rawSubtotal)
    ? Number(rawSubtotal.toFixed(2))
    : Number(
        Math.max(preliminaryTotal - sanitizedTax - sanitizedShipping, 0).toFixed(2)
      );

  const amountUSD = Number(
    Math.max(sanitizedSubtotal + sanitizedTax + sanitizedShipping, 0.5).toFixed(2)
  );

  if (amountUSD < 0.5) {
    throw new Error('Order total is below the minimum chargeable amount.');
  }

  const sanitizedTotals = {
    subtotal: sanitizedSubtotal,
    tax: sanitizedTax,
    shipping: sanitizedShipping,
  };

  const session = await createHoodpayPaymentSession({
    amount: amountUSD,
    currency: providerCurrency,
    baseUrl: baseUrl!,
    successUrl: hoodpayConfig.successUrl!,
    cancelUrl: hoodpayConfig.cancelUrl ?? `${baseUrl}/checkout`,
    notifyUrl: `${baseUrl}/api/hoodpay/webhook`,
    cartId: payload.cartId,
    metadata: {
      cart_id: payload.cartId,
      selected_currency: payload.currency,
      subtotal: sanitizedTotals.subtotal,
      tax: sanitizedTotals.tax,
      shipping: sanitizedTotals.shipping,
    },
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
    const rawCustomerInfo =
      md.customerInfo ??
      (payload.customer ? { email: payload.customer.email } : undefined);

    const normalizedCustomerInfo =
      rawCustomerInfo &&
      (rawCustomerInfo.email ||
        rawCustomerInfo.name ||
        rawCustomerInfo.phone ||
        rawCustomerInfo.address)
        ? (() => {
            const addr = rawCustomerInfo.address;
            let address:
              | {
                  line1: string;
                  line2?: string;
                  city: string;
                  state?: string;
                  postalCode: string;
                  country: string;
                }
              | undefined;
            if (
              addr &&
              addr.line1 &&
              addr.city &&
              addr.postalCode &&
              addr.country
            ) {
              address = {
                line1: addr.line1,
                line2: addr.line2 ?? undefined,
                city: addr.city,
                state: addr.state ?? undefined,
                postalCode: addr.postalCode,
                country: addr.country,
              };
            }
            return {
              email: rawCustomerInfo.email,
              name: rawCustomerInfo.name,
              phone: rawCustomerInfo.phone,
              ...(address ? { address } : {}),
            };
          })()
        : undefined;

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
      subtotal: sanitizedTotals.subtotal,
      tax: sanitizedTotals.tax,
      shipping: sanitizedTotals.shipping,
      total: amountUSD,
      currency: providerCurrency,
      customerInfo: normalizedCustomerInfo,
    };

    const newPayment: Omit<PaymentRecord, 'id' | 'created_at' | 'updated_at'> =
      {
        hp_payment_id: session.id ?? undefined,
        business_id:
          hoodpayConfig.storeId ?? hoodpayConfig.businessId ?? 'unknown',
        session_id: session.id ?? payload.cartId ?? '',
        amount: amountUSD,
        currency: providerCurrency,
        status: PaymentStatus.PENDING,
        method: PaymentMethod.HOODPAY,
        customer_email: payload.customer?.email,
        customer_ip: ip,
        metadata: {
          ...(payload.metadata ?? {}),
          user_id: user?.id,
          selected_currency: payload.currency,
          totals: sanitizedTotals,
        },
        checkout_data,
        hoodpay_response: session.providerResponse,
      };

    const result = await db.createPayment(newPayment);
    if (!result.success) {
      logger.error(
        'Failed to persist initial payment record',
        result.error.details, // Log the actual Supabase error
        {
          code: result.error.code,
          message: result.error.message,
          retryable: result.error.retryable,
        }
      );
    }
  } catch (error) {
    logger.error('Failed to persist initial payment record', error as Error);
  }

  return {
    checkoutUrl: session.checkoutUrl,
    id: session.id ?? null,
  };
}
