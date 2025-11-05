import 'server-only';
import type { User } from '@supabase/supabase-js';
import { resolveHoodpayConfig } from '@/lib/config/hoodpay.config';
import { createPayment } from '@/lib/hoodpay';
import { logger } from '@/lib/utils/logger';
import {
  PaymentMethod,
  PaymentStatus,
  type CheckoutData,
  type CheckoutItem,
  type PaymentRecordInsert,
} from '@/types/payment';
import type { Json } from '@/types/supabase.types';
import { toJson } from '@/lib/utils/json';
import {
  resolveService,
  Services,
} from '@/lib/services/service-registry.server';
import type { PaymentDatabaseService } from '@/lib/services/payment-db.service';
import type { OrderDatabaseService } from '@/lib/services/order-db.service';
import { OrderStatus } from '@/types/order';

type CreateSessionArgs = {
  payload: {
    cartId?: string;
    amount: number;
    currency: string;
    metadata?: Record<string, unknown>;
    customer?: { email?: string };
  };
  user: User | null;
  ip?: string;
  userAgent?: string;
};

export type HoodpaySessionResult = {
  checkoutUrl: string;
  id?: string;
};

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
  [key: string]: Json | undefined;
};

export async function createHoodpayPaymentSession({
  payload,
  user,
  ip,
  userAgent,
}: CreateSessionArgs): Promise<HoodpaySessionResult> {
  const hoodpayConfig = resolveHoodpayConfig();

  if (!hoodpayConfig) {
    logger.warn('Hoodpay is disabled via environment variable.', {
      cartId: payload.cartId,
    });
    throw new Error('Hoodpay payment method is currently disabled.');
  }

  const providerCurrency = 'USDC';

  if (payload.currency.toUpperCase() !== providerCurrency) {
    logger.warn(
      `Requested currency ${payload.currency} is not ${providerCurrency}. Proceeding with ${providerCurrency}.`,
      { cartId: payload.cartId, requestedCurrency: payload.currency }
    );
  }

  const totalsFromClient =
    (
      payload.metadata as {
        totals?: { subtotal?: number; tax?: number; shipping?: number };
      }
    )?.totals ?? {};
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
        Math.max(
          preliminaryTotal - sanitizedTax - sanitizedShipping,
          0
        ).toFixed(2)
      );

  const amountUSD = Number(
    Math.max(sanitizedSubtotal + sanitizedTax + sanitizedShipping, 0.5).toFixed(
      2
    )
  );

  if (amountUSD < 0.5) {
    throw new Error('Order total is below the minimum chargeable amount.');
  }

  const sanitizedTotals = {
    subtotal: sanitizedSubtotal,
    tax: sanitizedTax,
    shipping: sanitizedShipping,
  };

  const orderDb = resolveService<OrderDatabaseService>(Services.ORDER_DB);

  const newOrder = await orderDb.createOrder({
    user_id: user?.id ?? null,
    status: OrderStatus.PENDING,
    total_amount: amountUSD,
    currency: providerCurrency,
    metadata: toJson({
      cartId: payload.cartId,
      customerEmail: payload.customer?.email,
      customerIp: ip,
      customerUserAgent: userAgent,
      selectedCurrency: payload.currency,
      subtotal: String(sanitizedTotals.subtotal),
      tax: String(sanitizedTotals.tax),
      shipping: String(sanitizedTotals.shipping),
    }),
    shipping_address: null,
    billing_address: null,
    payment_method: null,
    completed_at: null,
  });

  if (!newOrder.success || !newOrder.data) {
    logger.error('Failed to create pending order', newOrder.error?.details, {
      cartId: payload.cartId,
    });
    throw new Error('Failed to create pending order');
  }

  const orderId = newOrder.data.id;

  const successUrlWithOrderId = new URL(hoodpayConfig.successUrl);
  successUrlWithOrderId.searchParams.set('order', orderId);

  const cancelUrlWithOrderId = new URL(hoodpayConfig.cancelUrl);
  cancelUrlWithOrderId.searchParams.set('order', orderId);

  const paymentPayload = {
    currency: providerCurrency,
    amount: amountUSD,
    name: `Order ${orderId}`,
    customerEmail: payload.customer?.email,
    customerIp: ip,
    customerUserAgent: userAgent,
    redirectUrl: successUrlWithOrderId.toString(),
    notifyUrl: hoodpayConfig.notifyUrl,
    cancelUrl: cancelUrlWithOrderId.toString(),
    metadata: {
      cart_id: payload.cartId,
      order_id: orderId,
      selected_currency: payload.currency,
      subtotal: String(sanitizedTotals.subtotal),
      tax: String(sanitizedTotals.tax),
      shipping: String(sanitizedTotals.shipping),
    },
  };

  logger.info('Sending payment to Hoodpay', { paymentPayload });

  const response = await createPayment(
    hoodpayConfig.businessId,
    paymentPayload
  );

  logger.info('Received response from Hoodpay', { response });

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

  const sessionId =
    typeof response?.id === 'number' || typeof response?.id === 'string'
      ? String(response.id)
      : undefined;

  if (!sessionId) {
    logger.warn('Hoodpay session returned no id', {
      cartId: payload.cartId,
    });
  }

  try {
    const db = resolveService<PaymentDatabaseService>(Services.PAYMENT_DB);

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
        const quantity =
          Number.isFinite(rawQuantity) && rawQuantity > 0 ? rawQuantity : 1;
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
          unitPrice: Number.isFinite(unitPriceCandidate)
            ? unitPriceCandidate
            : 0,
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

    const newPayment: PaymentRecordInsert = {
      hp_payment_id: sessionId,
      business_id: hoodpayConfig.businessId,
      session_id: sessionId ?? payload.cartId ?? '',
      amount: amountUSD,
      currency: providerCurrency,
      status: PaymentStatus.PENDING,
      method: PaymentMethod.HOODPAY,
      customer_email: payload.customer?.email,
      customer_ip: ip,
      metadata: toJson({
        ...(payload.metadata ?? {}),
        user_id: user?.id ?? null,
        selected_currency: payload.currency,
        totals: {
          ...sanitizedTotals,
          total: amountUSD,
        },
      }),
      checkout_data: toJson(checkout_data),
      hoodpay_response: toJson(response),
    };

    const result = await db.createPayment(newPayment);
    if (!result.success) {
      logger.error(
        'Failed to persist initial payment record',
        result.error?.details,
        {
          code: result.error?.code,
          message: result.error?.message,
          retryable: result.error?.retryable,
        }
      );
    }
  } catch (error) {
    logger.error('Failed to persist initial payment record', error as Error);
  }

  return {
    checkoutUrl,
    id: sessionId,
  };
}
