/**
 * HoodPay integration for Next.js and Supabase (TypeScript version).
 *
 * This module provides strongly typed functions for interacting with the HoodPay API
 * and storing the resulting data in Supabase. It also includes an example
 * API handler for Next.js that supports both retrieving existing payments
 * and creating new payments with dynamic product details (price, currency,
 * name, description, etc.). The available fields for creating a payment are
 * documented in the HoodPay Python SDK reference: currency, amount, name,
 * description, customer_email, customer_ip, customer_user_agent, redirect_url,
 * and notify_url【434714040128871†L64-L109】.
 *
 * Usage:
 *   import {
 *     supabase,
 *     getPayments,
 *     createPayment,
 *     savePaymentsToSupabase,
 *     paymentsApiHandler
 *   } from './hoodpayModule';
 *
 *   // Fetch existing payments with optional filters
 *   const response = await getPayments(
 *     process.env.HOODPAY_API_KEY!,
 *     process.env.HOODPAY_BUSINESS_ID!,
 *     { PageNumber: 1, PageSize: 10 }
 *   );
 *
 *   // Create a new payment dynamically
 *   const newPayment = await createPayment(
 *     process.env.HOODPAY_API_KEY!,
 *     process.env.HOODPAY_BUSINESS_ID!,
 *     {
 *       currency: 'USD',
 *       amount: 29.99,
 *       name: 'My Product',
 *       description: 'Purchase of My Product',
 *       customerEmail: 'customer@example.com'
 *     }
 *   );
 *
 *   // Store payments in Supabase
 *   await savePaymentsToSupabase(response.data);
 *
 * Environment variables required:
 * - HOODPAY_API_KEY: your HoodPay API key.
 * - HOODPAY_BUSINESS_ID: the business ID for your HoodPay account.
 * - NEXT_PUBLIC_SUPABASE_URL: your Supabase project URL.
 * - SUPABASE_SERVICE_ROLE_KEY: a Supabase service role key (or other key with insert rights).
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';
import { env } from '@/lib/config/env';
import { verifyHoodpaySignature } from '@/lib/services/payment/webhook';
import { logger } from '@/lib/utils/logger';

export { verifyHoodpaySignature as verifyWebhookSignature } from '@/lib/services/payment/webhook';

// Lazy-load Supabase client to avoid initialization errors
let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient => {
  if (!supabaseInstance) {
    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'Supabase credentials not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
      );
    }

    supabaseInstance = createClient(supabaseUrl, supabaseKey);
  }
  return supabaseInstance;
};

// For backward compatibility
export const supabase = new Proxy({} as SupabaseClient, {
  get: (target, prop) => {
    return getSupabaseClient()[prop as keyof SupabaseClient];
  },
});

// Base URL for HoodPay API
const HOODPAY_BASE_URL = 'https://api.hoodpay.io/v1';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

/**
 * Options for filtering the payments list returned by getPayments().
 * Corresponds to the query parameters described in the HoodPay API spec【606859361936998†L780-L807】.
 */
export interface GetPaymentsOptions {
  PageNumber?: number;
  PageSize?: number;
  fromTime?: string;
  toTime?: string;
  status?: string;
  paymentMethod?: string;
  fromAmount?: number;
  toAmount?: number;
  searchString?: string;
}

/**
 * Retrieve a list of payments for a specific business.
 *
 * @param token - HoodPay API key (bearer token).
 * @param businessId - The ID of the business to fetch payments for.
 * @param options - Optional query parameters for pagination and filtering.
 * @returns A promise resolving to the API response as an object.
 */
export async function getPayments(
  token: string,
  businessId: string | number,
  options: GetPaymentsOptions = {}
): Promise<unknown> {
  const url = new URL(`${HOODPAY_BASE_URL}/businesses/${businessId}/payments`);
  // Append query parameters if provided
  Object.entries(options).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value));
    }
  });
  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HoodPay API error ${response.status}: ${errorText}`);
  }
  const data = await response.json();
  return data as unknown;
}

/**
 * Request body for creating a new payment. Fields mirror the HoodPay SDK parameters【434714040128871†L64-L109】.
 */
export interface PaymentCreationRequest {
  currency: string;
  amount: number;
  name?: string;
  description?: string;
  customerEmail?: string;
  customerIp?: string;
  customerUserAgent?: string;
  redirectUrl?: string;
  notifyUrl?: string;
}

export interface HoodPayPaymentResponse {
  id?: string | number;
  paymentUrl?: string;
  payment_url?: string;
  status?: string;
  [key: string]: unknown;
}

export type HoodPayGenericResponse = Record<string, unknown>;

/**
 * A single webhook subscription entry returned by the HoodPay API.
 *
 * Because the official OpenAPI schema for webhooks isn’t publicly exposed, the
 * exact shape of the response is inferred from HoodPay’s help center. A webhook
 * consists of an identifier, the callback URL and a list of events that will
 * trigger the callback【847052457855123†L39-L55】. Additional fields such as the
 * shared secret and timestamps may also be present but are returned verbatim
 * to the caller and typed as unknown to avoid mis‐typing.
 */
export interface Webhook {
  /** Unique identifier for this webhook. */
  id: number | string;
  /** Fully qualified URL that will receive event notifications. */
  url: string;
  /** Array of events this webhook is subscribed to (e.g., payment:completed). */
  events: string[];
  /** Whether the webhook is currently active. */
  active?: boolean;
  /** Any additional properties returned by the API are captured here. */
  [key: string]: unknown;
}

/**
 * Allowed webhook event names. The HoodPay help center lists the five events
 * currently supported: payment:completed, payment:cancelled, payment:expired,
 * payment:method_selected and payment:created【847052457855123†L45-L55】. If
 * HoodPay introduces additional events, they can be included by extending this
 * string literal union.
 */
export type WebhookEvent =
  | 'payment:completed'
  | 'payment:cancelled'
  | 'payment:expired'
  | 'payment:method_selected'
  | 'payment:created'
  | (string & {});

/**
 * Request body for creating a new webhook subscription. The `url` specifies
 * where HoodPay should send notifications. The `events` array determines
 * which payment events trigger a callback. Both fields are required according
 * to the help center guidance that you must add a webhook URL and select
 * endpoints (events) to receive notifications【847052457855123†L39-L55】. An
 * optional `description` may be supplied to help identify the webhook in your
 * dashboard.
 */
export interface CreateWebhookRequest {
  url: string;
  events: WebhookEvent[];
  description?: string;
  /**
   * Whether the webhook should be enabled upon creation. Defaults to true. If
   * omitted, the API will enable the subscription by default.
   */
  active?: boolean;
}

/**
 * Retrieve the webhook settings for a specific business. This method wraps a
 * GET call to the `/v1/dash/businesses/{businessId}/settings/developer/webhooks`
 * endpoint as documented in HoodPay’s API reference【752700401990172†L70-L75】.
 *
 * @param token - HoodPay API key (bearer token).
 * @param businessId - The business ID whose webhooks you wish to list.
 * @returns An array of webhook objects.
 */
export async function getWebhooks(
  token: string,
  businessId: string | number
): Promise<Webhook[]> {
  const url = `${HOODPAY_BASE_URL}/dash/businesses/${businessId}/settings/developer/webhooks`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HoodPay API error ${response.status}: ${errorText}`);
  }
  const data = (await response.json()) as unknown;
  // The API returns an object containing a list of webhooks under a property such as
  // "webhooks" or it may return the array itself. We normalise to an array.
  if (Array.isArray(data)) {
    return data as Webhook[];
  }
  if (isRecord(data)) {
    const { webhooks } = data as { webhooks?: unknown };
    if (Array.isArray(webhooks)) {
      return webhooks as Webhook[];
    }
  }
  return [];
}

/**
 * Create a new webhook subscription for a business. This method posts to
 * `/v1/dash/businesses/{businessId}/settings/developer/webhooks` as described
 * in the API reference【50538665313300†L70-L76】. You must provide a callback
 * `url` and at least one event in the `events` array【847052457855123†L39-L55】.
 *
 * @param token - HoodPay API key.
 * @param businessId - The business identifier.
 * @param webhook - The webhook details (URL, events, description, etc.).
 * @returns The created webhook entry returned by HoodPay.
 */
export async function createWebhook(
  token: string,
  businessId: string | number,
  webhook: CreateWebhookRequest
): Promise<Webhook> {
  const url = `${HOODPAY_BASE_URL}/dash/businesses/${businessId}/settings/developer/webhooks`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: webhook.url,
      events: webhook.events,
      description: webhook.description,
      active: webhook.active ?? true,
    }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HoodPay API error ${response.status}: ${errorText}`);
  }
  return (await response.json()) as Webhook;
}

/**
 * Reset the webhook secret for a business. Calling this endpoint generates a
 * new shared secret for verifying webhook signatures. It wraps a POST to
 * `/v1/dash/businesses/{businessId}/settings/developer/webhooks/reset-secret`
 *【555047532104098†L70-L75】.
 *
 * @param token - HoodPay API key.
 * @param businessId - The business ID.
 * @returns An object containing the new secret and any metadata.
 */
export async function resetWebhookSecret(
  token: string,
  businessId: string | number
): Promise<HoodPayGenericResponse> {
  const url = `${HOODPAY_BASE_URL}/dash/businesses/${businessId}/settings/developer/webhooks/reset-secret`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HoodPay API error ${response.status}: ${errorText}`);
  }
  const data = await response.json();
  return data as HoodPayGenericResponse;
}

/**
 * Delete an existing webhook subscription. This sends a DELETE request to
 * `/v1/dash/businesses/{businessId}/settings/developer/webhooks/{webhookId}`
 * which removes the subscription【281890270235484†L70-L75】.
 *
 * @param token - HoodPay API key.
 * @param businessId - The business ID.
 * @param webhookId - The ID of the webhook to delete.
 * @returns The response from the HoodPay API.
 */
export async function deleteWebhook(
  token: string,
  businessId: string | number,
  webhookId: string | number
): Promise<HoodPayGenericResponse> {
  const url = `${HOODPAY_BASE_URL}/dash/businesses/${businessId}/settings/developer/webhooks/${webhookId}`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HoodPay API error ${response.status}: ${errorText}`);
  }
  const data = await response.json();
  return data as HoodPayGenericResponse;
}

/**
 * Example Next.js API handler for managing webhooks. This handler supports
 * the following verbs:
 *
 * - GET: List all webhooks for the business【752700401990172†L70-L75】.
 * - POST: Create a new webhook. The request body must conform to
 *   CreateWebhookRequest with `url` and `events` specified【847052457855123†L39-L55】.
 * - DELETE: Delete a webhook. The `webhookId` should be provided via
 *   `req.query.webhookId` or `req.body.webhookId`【281890270235484†L70-L75】.
 * - PUT (or POST to `/reset-secret`): Reset the webhook secret. To avoid
 *   accidental resets via the API handler, this action requires the query
 *   parameter `action=reset-secret`.
 *
 * @param req - The Next.js API request object.
 * @param res - The Next.js API response object.
 */
export async function webhooksApiHandler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const token = env.HOODPAY_API_KEY;
  const businessId = env.HOODPAY_BUSINESS_ID;
  if (!token || !businessId) {
    res.status(500).json({
      error:
        'Missing HOODPAY_API_KEY or HOODPAY_BUSINESS_ID environment variable',
    });
    return;
  }
  try {
    if (req.method === 'GET') {
      const webhooks = await getWebhooks(token, businessId);
      res.status(200).json(webhooks);
      return;
    }
    if (req.method === 'POST' && req.query.action === 'reset-secret') {
      const result = await resetWebhookSecret(token, businessId);
      res.status(200).json(result);
      return;
    }
    if (req.method === 'POST') {
      const body = req.body as CreateWebhookRequest;
      const created = await createWebhook(token, businessId, body);
      res.status(200).json(created);
      return;
    }
    if (req.method === 'DELETE') {
      const { webhookId } = req.query;
      const resolvedWebhookId = Array.isArray(webhookId)
        ? webhookId[0]
        : webhookId;
      if (!resolvedWebhookId) {
        res.status(400).json({
          error: 'webhookId query parameter is required for deletion',
        });
        return;
      }
      const deleted = await deleteWebhook(token, businessId, resolvedWebhookId);
      res.status(200).json(deleted);
      return;
    }
    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to process webhook API';
    res.status(500).json({ error: message });
  }
}

/**
 * Create a new payment for a business. This allows dynamic product details, such as
 * price (amount), currency, and descriptive fields, to be specified at runtime.
 * The available fields correspond to the parameters documented in the HoodPay SDK
 * for `create_payment`【434714040128871†L64-L109】.
 *
 * @param token - HoodPay API key (bearer token).
 * @param businessId - The ID of the business.
 * @param payment - The payment details (currency, amount, etc.).
 * @returns A promise resolving to the created payment response from HoodPay.
 */
export async function createPayment(
  token: string,
  businessId: string | number,
  payment: PaymentCreationRequest
): Promise<HoodPayPaymentResponse> {
  if (!token) {
    throw new Error(
      'HoodPay API key (token) is missing. Ensure HOODPAY_API_KEY is configured and accessible.'
    );
  }
  if (!businessId) {
    throw new Error(
      'HoodPay Business ID is missing. Ensure HOODPAY_BUSINESS_ID is configured and accessible.'
    );
  }
  const url = `${HOODPAY_BASE_URL}/businesses/${businessId}/payments`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      currency: payment.currency,
      amount: payment.amount,
      name: payment.name,
      description: payment.description,
      customer_email: payment.customerEmail,
      customer_ip: payment.customerIp,
      customer_user_agent: payment.customerUserAgent,
      redirect_url: payment.redirectUrl,
      notify_url: payment.notifyUrl,
    }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HoodPay API error ${response.status}: ${errorText}`);
  }
  const data = await response.json();
  return data as HoodPayPaymentResponse;
}

/**
 * Insert an array of payments into a Supabase table.
 *
 * @param payments - The array of payment objects to insert.
 * @param table - The target table name (default: 'hoodpay_payments').
 * @returns A promise resolving to the inserted records on success.
 */
export async function savePaymentsToSupabase<T>(
  payments: T[],
  table = 'hoodpay_payments'
): Promise<T[]> {
  if (!Array.isArray(payments)) {
    throw new TypeError('payments must be an array');
  }
  const client = getSupabaseClient();
  const { data, error } = await client.from(table).insert(payments);
  if (error) {
    throw error;
  }
  if (!data) {
    return [];
  }
  return data;
}

/**
 * Example Next.js API handler. This handler demonstrates how to retrieve payments
 * (via GET) and create payments dynamically (via POST) using the above functions.
 *
 * - GET requests return a list of payments for the authenticated business.
 *   Query parameters may be passed in via req.query to filter results【606859361936998†L780-L807】.
 * - POST requests expect a JSON body conforming to PaymentCreationRequest and
 *   create a new payment with those details【434714040128871†L64-L109】.
 *
 * @param req - The Next.js API request object.
 * @param res - The Next.js API response object.
 */
export async function paymentsApiHandler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const token = env.HOODPAY_API_KEY;
  const businessId = env.HOODPAY_BUSINESS_ID;
  if (!token || !businessId) {
    res.status(500).json({
      error:
        'Missing HOODPAY_API_KEY or HOODPAY_BUSINESS_ID environment variable',
    });
    return;
  }
  try {
    if (req.method === 'POST') {
      const paymentRequest: PaymentCreationRequest = req.body;
      const createdPayment = await createPayment(
        token,
        businessId,
        paymentRequest
      );
      res.status(200).json(createdPayment);
      return;
    }
    // Default to GET: return payments list
    const payments = await getPayments(
      token,
      businessId,
      req.query as Partial<GetPaymentsOptions>
    );
    res.status(200).json(payments);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to process payment API';
    res.status(500).json({ error: message });
  }
}

/**
 * Webhook receiver handler for HoodPay events
 * @param req - Next.js API request
 * @param res - Next.js API response
 */
export async function webhookReceiverHandler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const webhookSecret = env.HOODPAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    res.status(500).json({ error: 'HOODPAY_WEBHOOK_SECRET not configured' });
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Get raw body for signature verification
    const signature = req.headers['x-hoodpay-signature'] as string;

    if (!signature) {
      res.status(401).json({ error: 'Missing signature' });
      return;
    }

    // In production, you'd get the raw body from middleware
    const rawBody = JSON.stringify(req.body);

    // Verify signature
    const isValid = verifyHoodpaySignature(rawBody, signature, webhookSecret);

    if (!isValid) {
      res.status(401).json({ error: 'Invalid signature' });
      return;
    }

    // Process webhook payload
    const payload = req.body;

    // Log webhook receipt (in production, save to database)
    logger.info('Webhook received', {
      event: payload.event,
      paymentId: payload.paymentId,
      status: payload.status,
    });

    // Acknowledge receipt immediately
    res.status(200).json({ received: true });

    // Process webhook asynchronously (implement your business logic)
    // Example: Update payment status in database, send notifications, etc.
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Webhook processing failed';
    logger.error(
      'Webhook processing error',
      error instanceof Error ? error : new Error(String(message))
    );
    res.status(500).json({ error: message });
  }
}
