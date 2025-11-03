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
} from '@/types/payment';
import { env } from '@/lib/config/env';
import { createPaymentDbService } from '@/lib/services/payment-db.service';
import type { PaymentDatabaseService } from '@/lib/services/payment-db.service';
import { verifyHoodpaySignature } from '@/lib/services/payment/webhook';
import { supabaseConfig } from '@/lib/supabase/config';
import { logger } from '@/lib/utils/logger';

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

    // Store webhook event in database
    await dbService.createWebhookEvent({
      event_type: event,
      payment_id: data?.id || '',
      business_id: data?.businessId || '',
      payload: data,
      signature,
      verified: true,
      processed: false,
      retry_count: 0,
    });

    // Process webhook based on event type
    switch (event) {
      case 'PAYMENT_CREATED':
        await handlePaymentCreated(data, dbService);
        break;
      case 'PAYMENT_METHOD_SELECTED':
        await handlePaymentMethodSelected(data, dbService);
        break;
      case 'PAYMENT_COMPLETED':
        await handlePaymentCompleted(data, dbService);
        break;
      case 'PAYMENT_CANCELLED':
        await handlePaymentCancelled(data, dbService);
        break;
      case 'PAYMENT_EXPIRED':
        await handlePaymentExpired(data, dbService);
        break;
      default:
        logger.warn('Unhandled Crypto webhook event', { event });
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

  // Update or create payment record
  await dbService.upsertPaymentByHoodPayId(data.id, {
    business_id: data.businessId,
    session_id: data.id,
    amount: data.amount,
    currency: data.currency,
    status: PaymentStatus.PENDING,
    customer_email: data.customerEmail,
    metadata: data,
    hoodpay_response: data,
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
    method: data.method?.toLowerCase() as PaymentMethod,
    metadata: {
      ...(record.metadata ?? {}),
      methodSelected: data.method,
      methodSelectedAt: new Date().toISOString(),
    },
  });
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
