/**
 * Crypto Webhook Receiver
 * Handles webhook events from Crypto with signature verification
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  PaymentStatus,
  PaymentMethod,
  type HoodPayWebhookData,
  type HoodPayWebhookPayload,
  type WebhookEvent,
  type WebhookEventUpdate,
} from '@/types/payment';
import { env } from '@/lib/config/env';
import { createPaymentDbService } from '@/lib/services/payment-db.service';
import type { PaymentDatabaseService } from '@/lib/services/payment-db.service';
import { verifyHoodpaySignature } from '@/lib/services/payment/webhook';
import { supabaseConfig } from '@/lib/supabase/config';
import { logger } from '@/lib/utils/logger';
import { createOrderDbService } from '@/lib/services/order-db.service';
import type { Json } from '@/types/supabase.types';
import { toJson } from '@/lib/utils/json';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/hoodpay/webhook
 * Receives webhook events from Crypto
 */
export async function POST(request: NextRequest) {
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

    // Normalize event name to a single convention
    const EVENT_MAP: Record<string, string> = {
      PAYMENT_CREATED: 'payment:created',
      PAYMENT_METHOD_SELECTED: 'payment:method_selected',
      PAYMENT_COMPLETED: 'payment:completed',
      PAYMENT_CANCELLED: 'payment:cancelled',
      PAYMENT_EXPIRED: 'payment:expired',
    } as const;
    const normalizedEvent = EVENT_MAP[event] || event;

    // Process webhook based on event type
    try {
      switch (normalizedEvent) {
        case 'payment:created':
          await handlePaymentCreated(data, dbService);
          break;
        case 'payment:method_selected':
          await handlePaymentMethodSelected(data, dbService);
          break;
        case 'payment:completed':
          await handlePaymentCompleted(data, dbService);
          break;
        case 'payment:cancelled':
          await handlePaymentCancelled(data, dbService);
          break;
        case 'payment:expired':
          await handlePaymentExpired(data, dbService);
          break;
        default:
          logger.warn('Unhandled Crypto webhook event', {
            event: normalizedEvent,
          });
      }

      // Mark event as processed
      const evtId = createdEvent.success && createdEvent.data?.id;
      if (evtId) {
        await dbService.updateWebhookEvent(evtId, {
          processed: true,
          processed_at: new Date().toISOString(),
        });
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
      }
      throw handlerError;
    }

    // Acknowledge receipt
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: unknown) {
    logger.error('Webhook processing error', error);
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
  dbService: PaymentDatabaseService
) {
  logger.info('Payment created', { id: data.id });

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
  dbService: PaymentDatabaseService
) {
  logger.info('Payment method selected', {
    id: data.id,
    method: data.method,
  });

  // Update payment with selected method
  const payment = await dbService.getPaymentByHoodPayId(data.id);
  if (!payment.success || !payment.data) {
    logger.warn('Payment record not found for method update', {
      id: data.id,
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

/**
 * Handle PAYMENT_COMPLETED event
 */
async function handlePaymentCompleted(
  data: HoodPayWebhookData,
  dbService: PaymentDatabaseService
) {
  logger.info('Payment completed', { id: data.id });

  // Update payment status to completed
  const payment = await dbService.getPaymentByHoodPayId(data.id);
  if (!payment.success || !payment.data) {
    logger.warn('Payment record not found for completion', { id: data.id });
    return;
  }

  const record = payment.data;

  await dbService.updatePaymentStatus(record.id, PaymentStatus.COMPLETED);

  // Create order for authenticated users with stored checkout data
  try {
    const metadata = metadataToRecord(record.metadata) as PaymentMetadata;
    const userId = metadata?.user_id;
    const existingOrderId = (metadata?.order_id ?? undefined) as
      | string
      | undefined;
    if (existingOrderId) {
      logger.info('Order already created for payment; skipping duplicate', {
        paymentId: record.id,
        orderId: existingOrderId,
      });
      return;
    }
    if (!userId) {
      logger.info('Skipping order creation (no user_id in metadata)', {
        paymentId: record.id,
      });
      return;
    }

    const orderDb = createOrderDbService(
      supabaseConfig.url,
      env.SUPABASE_SERVICE_ROLE_KEY
    );
    const order = await orderDb.createOrderFromPayment(userId, record);
    if (order?.id) {
      await dbService.updatePayment(record.id, {
        metadata: toJson({
          ...metadataToRecord(record.metadata),
          order_id: order.id,
        }),
      });
      logger.info('Order created from payment', {
        paymentId: record.id,
        orderId: order.id,
      });
    } else {
      logger.warn('Order creation returned no id');
    }
  } catch (e) {
    logger.error('Failed to create order from payment', e as Error, {
      paymentId: record.id,
    });
  }

  // TODO: Send confirmation email, update order status, etc.
  logger.info('Payment completed successfully', {
    paymentId: record.id,
    amount: data.amount,
    currency: data.currency,
  });
}

/**
 * Handle PAYMENT_CANCELLED event
 */
async function handlePaymentCancelled(
  data: HoodPayWebhookData,
  dbService: PaymentDatabaseService
) {
  logger.info('Payment cancelled', { id: data.id });

  const payment = await dbService.getPaymentByHoodPayId(data.id);
  if (!payment.success || !payment.data) {
    logger.warn('Payment record not found for cancellation', {
      id: data.id,
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
  dbService: PaymentDatabaseService
) {
  logger.info('Payment expired', { id: data.id });

  const payment = await dbService.getPaymentByHoodPayId(data.id);
  if (!payment.success || !payment.data) {
    logger.warn('Payment record not found for expiration', { id: data.id });
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
