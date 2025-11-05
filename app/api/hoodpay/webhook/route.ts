/**
 * Crypto Webhook Receiver
 * Handles webhook events from Crypto with signature verification
 */

import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import {
  PaymentStatus,
  PaymentMethod,
  type HoodPayWebhookData,
  type HoodPayWebhookPayload,
  type WebhookEvent,
  type WebhookEventUpdate,
  type PaymentRecord,
  type CheckoutData,
} from '@/types/payment';
import { env } from '@/lib/config/env';
import {
  createPaymentDbService,
  type PaymentDatabaseService,
  type PaymentOrderPayload,
} from '@/lib/services/payment-db.service';
import { verifyHoodpaySignature } from '@/lib/services/payment/webhook';
import { supabaseConfig } from '@/lib/supabase/config';
import { logger } from '@/lib/utils/logger';
import type { Json } from '@/types/supabase.types';
import { toJson } from '@/lib/utils/json';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const EVENT_MAP = {
  PAYMENT_CREATED: 'payment:created',
  PAYMENT_METHOD_SELECTED: 'payment:method_selected',
  PAYMENT_COMPLETED: 'payment:completed',
  PAYMENT_CANCELLED: 'payment:cancelled',
  PAYMENT_EXPIRED: 'payment:expired',
} as const;

type NormalizedEvent =
  (typeof EVENT_MAP)[keyof typeof EVENT_MAP] | string;

interface WebhookContext extends Record<string, unknown> {
  requestId: string;
  eventId?: string;
}

/**
 * POST /api/hoodpay/webhook
 * Receives webhook events from Crypto
 */
export async function POST(request: NextRequest) {
  const requestId = randomUUID();
  let context: WebhookContext = { requestId };

  try {
    const webhookSecret = env.HOODPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Get raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get('x-hoodpay-signature') || '';

    // Verify signature
    if (!verifyHoodpaySignature(rawBody, signature, webhookSecret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Parse webhook payload
    const payload = JSON.parse(rawBody) as HoodPayWebhookPayload;
    const { event, data } = payload;

    // Initialize Supabase service
    const dbService = createPaymentDbService(
      supabaseConfig.url,
      env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Store webhook event in database (unprocessed)
    const createdEvent = await dbService.createWebhookEvent({
      event_type: event,
      payment_id: data?.id || '',
      business_id: data?.businessId || '',
      payload: toJson(data),
      signature,
      verified: true,
      processed: false,
      retry_count: 0,
    });

    context = {
      requestId,
      eventId: createdEvent.success ? createdEvent.data?.id : undefined,
    };

    // Normalize event name to a single convention
    const normalizedEvent = normalizeEvent(event);

    // Process webhook based on event type
    try {
      switch (normalizedEvent) {
        case 'payment:created':
          await handlePaymentCreated(data, dbService, context);
          break;
        case 'payment:method_selected':
          await handlePaymentMethodSelected(data, dbService, context);
          break;
        case 'payment:completed':
          await handlePaymentCompleted(data, dbService, context);
          break;
        case 'payment:cancelled':
          await handlePaymentCancelled(data, dbService, context);
          break;
        case 'payment:expired':
          await handlePaymentExpired(data, dbService, context);
          break;
        default:
          logger.warn('Unhandled Crypto webhook event', {
            event: normalizedEvent,
            requestId,
          });
      }

      // Mark event as processed
      const evtId = createdEvent.success && createdEvent.data?.id;
      if (evtId) {
        await dbService.updateWebhookEvent(evtId, {
          processed: true,
          processed_at: new Date().toISOString(),
        });
        logger.info(
          'Webhook event processed',
          toJson({
            requestId,
            eventId: evtId,
            event: normalizedEvent,
          })
        );
      }
    } catch (handlerError: unknown) {
      const evtId = createdEvent.success && createdEvent.data?.id;
      if (evtId) {
        const updates: WebhookEventUpdate = {
          processed: false,
          processed_at: new Date().toISOString(),
          processing_error:
            handlerError instanceof Error
              ? handlerError.message
              : 'Unknown handler error',
        };
        await dbService.updateWebhookEvent(evtId, updates);
        logger.warn(
          'Webhook handler failed',
          toJson({
            requestId,
            eventId: evtId,
            event: normalizedEvent,
            error:
              handlerError instanceof Error
                ? handlerError.message
                : 'unknown',
          })
        );
      }
      throw handlerError;
    }

    // Acknowledge receipt
    logger.info(
      'Webhook processed successfully',
      toJson({
        requestId,
        event: normalizedEvent,
        paymentId: data?.id,
      })
    );
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: unknown) {
    logger.error('Webhook processing error', error, context);
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Webhook processing failed', details: message },
      { status: 500 }
    );
  }
}

/**
 * Handle PAYMENT_CREATED event
 */
async function handlePaymentCreated(
  data: HoodPayWebhookData,
  dbService: PaymentDatabaseService,
  context: WebhookContext
) {
  logger.info('Payment created', {
    requestId: context.requestId,
    hoodpayId: data.id,
  });

  const sessionId =
    typeof data.id === 'string' && data.id.length > 0
      ? data.id
      : `hp-${Date.now()}`;
  const businessId =
    typeof data.businessId === 'string' && data.businessId.length > 0
      ? data.businessId
      : 'unknown';
  const amount =
    typeof data.amount === 'number' && Number.isFinite(data.amount)
      ? data.amount
      : 0;
  const currency =
    typeof data.currency === 'string' && data.currency.length > 0
      ? data.currency
      : 'USD';

  // Update or create payment record
  await dbService.upsertPaymentByHoodPayId(sessionId, {
    business_id: businessId,
    session_id: sessionId,
    amount,
    currency,
    status: PaymentStatus.PENDING,
    customer_email: data.customerEmail ?? null,
    metadata: toJson(data),
    hoodpay_response: toJson(data),
  });
}

/**
 * Handle PAYMENT_METHOD_SELECTED event
 */
async function handlePaymentMethodSelected(
  data: HoodPayWebhookData,
  dbService: PaymentDatabaseService,
  context: WebhookContext
) {
  logger.info('Payment method selected', {
    requestId: context.requestId,
    hoodpayId: data.id,
    method: data.method,
  });

  // Update payment with selected method
  const payment = await dbService.getPaymentByHoodPayId(data.id);
  if (!payment.success || !payment.data) {
    logger.warn('Payment record not found for method update', {
      requestId: context.requestId,
      hoodpayId: data.id,
    });
    return;
  }

  const record = payment.data;

  await dbService.updatePayment(record.id, {
    // Keep source as Hoodpay; store specific coin/method in metadata
    method: PaymentMethod.HOODPAY,
    metadata: toJson({
      ...metadataToRecord(record.metadata),
      methodSelected: data.method ?? null,
      methodSelectedAt: new Date().toISOString(),
    }),
  });
}

interface PaymentMetadata {
  user_id?: string;
  order_id?: string;
  methodSelected?: string;
  methodSelectedAt?: string;
}

function metadataToRecord(
  metadata: Json | null | undefined
): Record<string, Json> {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return {};
  }
  return metadata as Record<string, Json>;
}

function normalizeEvent(event: string): NormalizedEvent {
  return EVENT_MAP[event as keyof typeof EVENT_MAP] ?? event;
}

function isCheckoutData(value: unknown): value is CheckoutData {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  const candidate = value as Partial<CheckoutData>;
  return (
    Array.isArray(candidate.items) &&
    typeof candidate.currency === 'string' &&
    typeof candidate.total === 'number'
  );
}

function buildOrderPayload(
  payment: PaymentRecord
): PaymentOrderPayload | undefined {
  const checkout = isCheckoutData(payment.checkout_data)
    ? (payment.checkout_data as CheckoutData)
    : undefined;

  if (!checkout) {
    return undefined;
  }

  const items =
    checkout.items
      ?.map((item) => {
        const quantity =
          typeof item.quantity === 'number' && item.quantity > 0
            ? item.quantity
            : 1;
        const total =
          typeof item.total === 'number' && Number.isFinite(item.total)
            ? item.total
            : 0;
        const unitPrice =
          typeof item.unitPrice === 'number' && Number.isFinite(item.unitPrice)
            ? item.unitPrice
            : quantity > 0
              ? total / quantity
              : 0;

        return {
          product_id: String(item.id),
          quantity,
          unit_price: unitPrice,
          total_price: total,
        };
      })
      .filter((item) => Boolean(item.product_id)) ?? [];

  if (items.length === 0) {
    return undefined;
  }

  const address = checkout.customerInfo?.address
    ? {
        line1: checkout.customerInfo.address.line1,
        line2: checkout.customerInfo.address.line2 ?? null,
        city: checkout.customerInfo.address.city,
        state: checkout.customerInfo.address.state ?? null,
        postalCode: checkout.customerInfo.address.postalCode,
        country: checkout.customerInfo.address.country,
        name: checkout.customerInfo.name ?? null,
        email: checkout.customerInfo.email ?? null,
        phone: checkout.customerInfo.phone ?? null,
      }
    : null;

  return {
    total_amount:
      typeof checkout.total === 'number' ? checkout.total : payment.amount,
    currency:
      typeof checkout.currency === 'string'
        ? checkout.currency
        : payment.currency,
    shipping_address: address,
    billing_address: address,
    payment_method: payment.method ?? PaymentMethod.HOODPAY,
    order_items: items,
  };
}

/**
 * Handle PAYMENT_COMPLETED event
 */
async function handlePaymentCompleted(
  data: HoodPayWebhookData,
  dbService: PaymentDatabaseService,
  context: WebhookContext
) {
  logger.info('Payment completed', {
    requestId: context.requestId,
    hoodpayId: data.id,
  });

  const payment = await dbService.getPaymentByHoodPayId(data.id);
  if (!payment.success || !payment.data) {
    logger.warn('Payment record not found for completion', {
      requestId: context.requestId,
      hoodpayId: data.id,
    });
    return;
  }

  const record = payment.data;
  const metadata = metadataToRecord(record.metadata) as PaymentMetadata;
  const userId =
    typeof metadata?.user_id === 'string' && metadata.user_id.length > 0
      ? metadata.user_id
      : undefined;

  const orderPayload = buildOrderPayload(record);
  const shouldAttemptOrder =
    Boolean(userId) &&
    Boolean(orderPayload?.order_items && orderPayload.order_items.length > 0);

  if (!userId) {
    logger.info('Completing payment without order (no user_id in metadata)', {
      requestId: context.requestId,
      paymentId: record.id,
    });
  } else if (!shouldAttemptOrder) {
    logger.warn('Payment completion missing order payload; skipping order', {
      requestId: context.requestId,
      paymentId: record.id,
    });
  }

  const result = await dbService.completePaymentWithOrder({
    paymentId: record.id,
    userId,
    orderPayload: orderPayload ?? undefined,
  });

  if (!result.success || !result.data) {
    throw new Error(
      result.error?.message ?? 'Failed to finalize payment transaction'
    );
  }

  const { payment_id, order_id, already_processed } = result.data;

  if (already_processed) {
    logger.info('Payment completion already processed', {
      requestId: context.requestId,
      paymentId: payment_id,
      orderId: order_id,
    });
    return;
  }

  logger.info('Payment completed successfully', {
    requestId: context.requestId,
    paymentId: payment_id,
    orderId: order_id,
    amount: data.amount,
    currency: data.currency,
  });
}

/**
 * Handle PAYMENT_CANCELLED event
 */
async function handlePaymentCancelled(
  data: HoodPayWebhookData,
  dbService: PaymentDatabaseService,
  context: WebhookContext
) {
  logger.info('Payment cancelled', {
    requestId: context.requestId,
    hoodpayId: data.id,
  });

  const payment = await dbService.getPaymentByHoodPayId(data.id);
  if (!payment.success || !payment.data) {
    logger.warn('Payment record not found for cancellation', {
      requestId: context.requestId,
      hoodpayId: data.id,
    });
    return;
  }

  const record = payment.data;
  await dbService.updatePaymentStatus(record.id, PaymentStatus.CANCELLED);
}

/**
 * Handle PAYMENT_EXPIRED event
 */
async function handlePaymentExpired(
  data: HoodPayWebhookData,
  dbService: PaymentDatabaseService,
  context: WebhookContext
) {
  logger.info('Payment expired', {
    requestId: context.requestId,
    hoodpayId: data.id,
  });

  const payment = await dbService.getPaymentByHoodPayId(data.id);
  if (!payment.success || !payment.data) {
    logger.warn('Payment record not found for expiration', {
      requestId: context.requestId,
      hoodpayId: data.id,
    });
    return;
  }

  const record = payment.data;
  await dbService.updatePaymentStatus(record.id, PaymentStatus.EXPIRED);
}

/**
 * GET /api/hoodpay/webhook
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Crypto webhook endpoint is active',
    events: [
      'PAYMENT_CREATED',
      'PAYMENT_METHOD_SELECTED',
      'PAYMENT_COMPLETED',
      'PAYMENT_CANCELLED',
      'PAYMENT_EXPIRED',
    ],
  });
}
