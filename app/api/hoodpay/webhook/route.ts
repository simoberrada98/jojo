/**
 * HoodPay Webhook Receiver
 * Handles webhook events from HoodPay with signature verification
 */

import { NextRequest, NextResponse } from "next/server";
import { createPaymentService } from "@/lib/payment/supabaseService";
import crypto from "crypto";

const WEBHOOK_SECRET =
  process.env.HOODPAY_WEBHOOK_SECRET ||
  "whsec_Ez1ErDOvHXNEoSSty8QeNV1xefM1Osly";

/**
 * Verify webhook signature
 */
function verifySignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(payload);
    const computed = hmac.digest("hex");

    // Constant-time comparison
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(computed)
    );
  } catch {
    return false;
  }
}

/**
 * POST /api/hoodpay/webhook
 * Receives webhook events from HoodPay
 */
export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get("x-hoodpay-signature") || "";

    // Verify signature
    if (!verifySignature(rawBody, signature, WEBHOOK_SECRET)) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Parse webhook payload
    const payload = JSON.parse(rawBody);
    const { event, data } = payload;

    console.log("Webhook received:", {
      event,
      paymentId: data?.id,
      status: data?.status,
      timestamp: new Date().toISOString(),
    });

    // Initialize Supabase service
    const dbService = createPaymentService();

    // Store webhook event in database
    await dbService.createWebhookEvent({
      event_type: event,
      payment_id: data?.id || null,
      business_id: data?.businessId || null,
      payload: data,
      signature,
      verified: true,
      processed: false,
      retry_count: 0,
    });

    // Process webhook based on event type
    switch (event) {
      case "PAYMENT_CREATED":
        await handlePaymentCreated(data, dbService);
        break;
      case "PAYMENT_METHOD_SELECTED":
        await handlePaymentMethodSelected(data, dbService);
        break;
      case "PAYMENT_COMPLETED":
        await handlePaymentCompleted(data, dbService);
        break;
      case "PAYMENT_CANCELLED":
        await handlePaymentCancelled(data, dbService);
        break;
      case "PAYMENT_EXPIRED":
        await handlePaymentExpired(data, dbService);
        break;
      default:
        console.warn("Unknown webhook event:", event);
    }

    // Acknowledge receipt
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Handle PAYMENT_CREATED event
 */
async function handlePaymentCreated(data: any, dbService: any) {
  console.log("Payment created:", data.id);

  // Update or create payment record
  await dbService.upsertPaymentByHoodPayId(data.id, {
    business_id: data.businessId,
    session_id: data.id,
    amount: data.amount,
    currency: data.currency,
    status: "pending",
    customer_email: data.customerEmail,
    metadata: data,
    hoodpay_response: data,
  });
}

/**
 * Handle PAYMENT_METHOD_SELECTED event
 */
async function handlePaymentMethodSelected(data: any, dbService: any) {
  console.log("Payment method selected:", data.id, data.method);

  // Update payment with selected method
  const payment = await dbService.getPaymentByHoodPayId(data.id);
  if (payment.success) {
    await dbService.updatePayment(payment.data.id, {
      method: data.method?.toLowerCase(),
      metadata: {
        ...payment.data.metadata,
        methodSelected: data.method,
        methodSelectedAt: new Date().toISOString(),
      },
    });
  }
}

/**
 * Handle PAYMENT_COMPLETED event
 */
async function handlePaymentCompleted(data: any, dbService: any) {
  console.log("Payment completed:", data.id);

  // Update payment status to completed
  const payment = await dbService.getPaymentByHoodPayId(data.id);
  if (payment.success) {
    await dbService.updatePaymentStatus(payment.data.id, "completed");

    // TODO: Send confirmation email, update order status, etc.
    console.log("Payment completed successfully:", {
      paymentId: payment.data.id,
      amount: data.amount,
      currency: data.currency,
    });
  }
}

/**
 * Handle PAYMENT_CANCELLED event
 */
async function handlePaymentCancelled(data: any, dbService: any) {
  console.log("Payment cancelled:", data.id);

  const payment = await dbService.getPaymentByHoodPayId(data.id);
  if (payment.success) {
    await dbService.updatePaymentStatus(payment.data.id, "cancelled");
  }
}

/**
 * Handle PAYMENT_EXPIRED event
 */
async function handlePaymentExpired(data: any, dbService: any) {
  console.log("Payment expired:", data.id);

  const payment = await dbService.getPaymentByHoodPayId(data.id);
  if (payment.success) {
    await dbService.updatePaymentStatus(payment.data.id, "expired");
  }
}

/**
 * GET /api/hoodpay/webhook
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "HoodPay webhook endpoint is active",
    events: [
      "PAYMENT_CREATED",
      "PAYMENT_METHOD_SELECTED",
      "PAYMENT_COMPLETED",
      "PAYMENT_CANCELLED",
      "PAYMENT_EXPIRED",
    ],
  });
}
