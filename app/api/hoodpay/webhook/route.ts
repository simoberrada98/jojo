import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';

import {
  PaymentStatus,
  PaymentMethod,
  type HoodPayWebhookPayload,
  type PaymentRecord,
  type CheckoutData,
} from '@/types/payment';
import { verifyHoodpaySignature } from '@/lib/services/payment/webhook';
import { logger } from '@/lib/utils/logger';
import type { Json } from '@/types/supabase.types';
import { toJson } from '@/lib/utils/json';
import { resolveHoodpayConfig } from '@/lib/config/hoodpay.config';
import {
  resolveService,
  Services,
} from '@/lib/services/service-registry.server';
import type {
  PaymentDatabaseService,
  PaymentOrderPayload,
} from '@/lib/services/payment-db.service';
import type { NotificationService } from '@/lib/services/notification.service';
import type { OrderDatabaseService } from '@/lib/services/order-db.service';
import { OrderStatus } from '@/types/order';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const EVENT_HANDLERS = {
  'payment:created': handlePaymentCreated,
  'payment:method_selected': handlePaymentMethodSelected,
  'payment:completed': handlePaymentCompleted,
  'payment:cancelled': handlePaymentStatusUpdate(PaymentStatus.CANCELLED),
  'payment:expired': handlePaymentStatusUpdate(PaymentStatus.EXPIRED),
} as const;

type WebhookHandler = (
  data: HoodPayWebhookPayload['data'],
  db: PaymentDatabaseService,
  orderDb: OrderDatabaseService,
  ctx: WebhookContext
) => Promise<void>;

type EventKey = keyof typeof EVENT_HANDLERS;

function normalizeEventName(event: string): EventKey | undefined {
  const normalized = event
    .trim()
    .toLowerCase()
    .replace(/[\s_.]+/g, ':')
    .replace(/:{2,}/g, ':');

  return (normalized as EventKey) in EVENT_HANDLERS
    ? (normalized as EventKey)
    : undefined;
}

interface WebhookContext extends Record<string, unknown> {
  requestId: string;
  eventId?: string;
}

export async function POST(request: NextRequest) {
  const requestId = randomUUID();
  const context: WebhookContext = { requestId };

  try {
    const hoodpayConfig = resolveHoodpayConfig();
    if (!hoodpayConfig) {
      logger.warn('Hoodpay webhook received but Hoodpay is disabled.', { requestId });
      return NextResponse.json(
        { error: 'Hoodpay service is currently disabled' },
        { status: 503 }
      );
    }

    const { webhookSecret } = hoodpayConfig;
    if (!webhookSecret) {
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    const rawBody = await request.text();
    const signature = request.headers.get('x-hoodpay-signature') || '';

    if (!verifyHoodpaySignature(rawBody, signature, webhookSecret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody) as HoodPayWebhookPayload;
    const { event, data } = payload;

    const dbService = resolveService<PaymentDatabaseService>(
      Services.PAYMENT_DB
    );
    const orderDbService = resolveService<OrderDatabaseService>(
      Services.ORDER_DB
    );

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

    context.eventId = createdEvent.success ? createdEvent.data?.id : undefined;

    const handlerKey = normalizeEventName(event);
    const handler = handlerKey ? EVENT_HANDLERS[handlerKey] : undefined;

    if (handler) {
      await processWebhookEvent(handler, data, dbService, orderDbService, context);
    } else {
      logger.warn('Unhandled webhook event', { event, requestId });
    }

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

async function processWebhookEvent(
  handler: WebhookHandler,
  data: HoodPayWebhookPayload['data'],
  db: PaymentDatabaseService,
  orderDb: OrderDatabaseService,
  ctx: WebhookContext
) {
  const eventId = ctx.eventId;
  try {
    await handler(data, db, orderDb, ctx);
    if (eventId) {
      await db.updateWebhookEvent(eventId, {
        processed: true,
        processed_at: new Date().toISOString(),
      });
      logger.info('Webhook event processed successfully', { ...ctx });
    }
  } catch (error) {
    if (eventId) {
      await db.updateWebhookEvent(eventId, {
        processed: false,
        processing_error:
          error instanceof Error ? error.message : 'Unknown error',
      });
    }
    logger.error('Error processing webhook event', error, ctx);
    throw error; // Re-throw to be caught by the main handler
  }
}

async function handlePaymentCreated(
  data: HoodPayWebhookPayload['data'],
  db: PaymentDatabaseService,
  orderDb: OrderDatabaseService,
  ctx: WebhookContext
) {
  logger.info('Payment created', { ...ctx, hoodpayId: data.id });
  await db.upsertPaymentByHoodPayId(data.id, {
    business_id: data.businessId ?? 'unknown',
    session_id: data.id,
    amount: data.amount ?? 0,
    currency: data.currency ?? 'USD',
    status: PaymentStatus.PENDING,
    customer_email: data.customerEmail,
    metadata: toJson(data),
    hoodpay_response: toJson(data),
  });
}

async function handlePaymentMethodSelected(
  data: HoodPayWebhookPayload['data'],
  db: PaymentDatabaseService,
  orderDb: OrderDatabaseService,
  ctx: WebhookContext
) {
  logger.info('Payment method selected', {
    ...ctx,
    hoodpayId: data.id,
    method: data.method,
  });
  const payment = await getPaymentRecord(data.id, db, ctx);
  if (!payment) return;

  await db.updatePayment(payment.id, {
    method: PaymentMethod.HOODPAY,
    metadata: toJson({
      ...metadataToRecord(payment.metadata),
      methodSelected: data.method,
      methodSelectedAt: new Date().toISOString(),
    }),
  });
}

async function handlePaymentCompleted(
  data: HoodPayWebhookPayload['data'],
  db: PaymentDatabaseService,
  orderDb: OrderDatabaseService,
  ctx: WebhookContext
) {
  logger.info('Payment completed', { ...ctx, hoodpayId: data.id });
  const payment = await getPaymentRecord(data.id, db, ctx);
  if (!payment) return;

  const metadata = metadataToRecord(payment.metadata) as {
    user_id?: string;
    order_id?: string;
  };
  const userId = metadata.user_id;
  const orderId = metadata.order_id;

  if (!orderId) {
    logger.error('Order ID not found in payment metadata', { ...ctx, hoodpayId: data.id });
    throw new Error('Order ID not found in payment metadata');
  }

  // Update the order status to COMPLETED
  const orderUpdateResult = await orderDb.updateOrderStatus(orderId, OrderStatus.COMPLETED);
  if (!orderUpdateResult.success) {
    logger.error('Failed to update order status to COMPLETED', orderUpdateResult.error, { ...ctx, orderId });
    throw new Error(orderUpdateResult.error?.message ?? 'Failed to update order status');
  }

  // Update the payment record to reflect completion and link to the order
  // Instead of updating order_id directly, update the metadata to include order_id
  const paymentUpdateResult = await db.updatePayment(payment.id, {
    status: PaymentStatus.COMPLETED,
    metadata: toJson({ ...metadata, order_id: orderId }), // Update metadata
  });
  if (!paymentUpdateResult.success) {
    logger.error('Failed to update payment record with order ID', paymentUpdateResult.error, { ...ctx, paymentId: payment.id, orderId });
    throw new Error(paymentUpdateResult.error?.message ?? 'Failed to update payment record');
  }

  logger.info('Payment and order completed successfully', { ...ctx, hoodpayId: data.id, orderId });

  const notificationService = resolveService<NotificationService>(
    Services.NOTIFICATION
  );
  const customerEmail: string | undefined =
    typeof payment.customer_email === 'string'
      ? payment.customer_email
      : undefined;
  await notificationService.sendPaymentSuccessNotification({
    paymentId: payment.id,
    orderId: orderId,
    amount: payment.amount,
    currency: payment.currency,
    customerEmail,
  });
}

function mapPaymentStatusToOrderStatus(paymentStatus: PaymentStatus): OrderStatus {
  switch (paymentStatus) {
    case PaymentStatus.PENDING:
      return OrderStatus.PENDING;
    case PaymentStatus.PROCESSING:
      return OrderStatus.PROCESSING;
    case PaymentStatus.COMPLETED:
      return OrderStatus.COMPLETED;
    case PaymentStatus.CANCELLED:
      return OrderStatus.CANCELLED;
    case PaymentStatus.EXPIRED:
      return OrderStatus.EXPIRED;
    case PaymentStatus.REFUNDED:
      return OrderStatus.REFUNDED;
    case PaymentStatus.FAILED:
      return OrderStatus.CANCELLED; // No direct equivalent, map to cancelled
    default:
      return OrderStatus.PENDING; // Default or throw error for unhandled statuses
  }
}

function handlePaymentStatusUpdate(status: PaymentStatus): WebhookHandler {
  return async (data, db, orderDb, ctx) => {
    logger.info(`Updating payment status to ${status}`, {
      ...ctx,
      hoodpayId: data.id,
    });
    const payment = await getPaymentRecord(data.id, db, ctx);
    if (payment) {
      await db.updatePaymentStatus(payment.id, status);

      const metadata = metadataToRecord(payment.metadata) as { order_id?: string };
      const orderId = metadata.order_id;

      if (orderId) {
        const orderStatus = mapPaymentStatusToOrderStatus(status); // Convert status
        const orderUpdateResult = await orderDb.updateOrderStatus(orderId, orderStatus);
        if (!orderUpdateResult.success) {
          logger.error('Failed to update order status from webhook', orderUpdateResult.error, { ...ctx, orderId, status });
        }
      } else {
        logger.warn('Order ID not found in payment metadata for status update', { ...ctx, hoodpayId: data.id, status });
      }
    }
  };
}

async function getPaymentRecord(
  hoodpayId: string,
  db: PaymentDatabaseService,
  ctx: WebhookContext
): Promise<PaymentRecord | null> {
  const { success, data } = await db.getPaymentByHoodPayId(hoodpayId);
  if (!success || !data) {
    logger.warn('Payment record not found', { ...ctx, hoodpayId });
    return null;
  }
  return data;
}

function metadataToRecord(metadata: Json | null): Record<string, Json> {
  return (
    metadata && typeof metadata === 'object' && !Array.isArray(metadata)
      ? metadata
      : {}
  ) as Record<string, Json>;
}

function isCheckoutData(value: unknown): value is CheckoutData {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  const record = value as Record<string, unknown>;
  return (
    'items' in record &&
    'subtotal' in record &&
    'tax' in record &&
    'shipping' in record &&
    'total' in record &&
    'currency' in record
  );
}

function buildOrderPayload(
  payment: PaymentRecord
): PaymentOrderPayload | undefined {
  if (!isCheckoutData(payment.checkout_data)) {
    return undefined;
  }
  const checkout = payment.checkout_data;
  if (!checkout?.items?.length) return undefined;

  const items = checkout.items.map((item) => ({
    product_id: String(item.id),
    quantity: item.quantity > 0 ? item.quantity : 1,
    unit_price: item.unitPrice ?? 0,
    total_price: item.total ?? 0,
  }));

  const address = checkout.customerInfo?.address
    ? {
        ...checkout.customerInfo.address,
        name: checkout.customerInfo.name,
        email: checkout.customerInfo.email,
        phone: checkout.customerInfo.phone,
      }
    : null;

  return {
    total_amount: checkout.total ?? payment.amount,
    currency: checkout.currency ?? payment.currency,
    shipping_address: address,
    billing_address: address,
    payment_method: payment.method ?? PaymentMethod.HOODPAY,
    order_items: items,
  };
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Crypto webhook endpoint is active',
  });
}
