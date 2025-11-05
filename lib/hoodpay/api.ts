
import 'server-only';

import { resolveHoodpayConfig } from '@/lib/config/hoodpay.config';
import {
  GetPaymentsOptions,
  PaymentCreationRequest,
  HoodPayPaymentResponse,
  CreateWebhookRequest,
  Webhook,
  HoodPayGenericResponse,
} from './types';

const HOODPAY_BASE_URL = 'https://api.hoodpay.io/v1';

async function fetchHoodpay<TResponse = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<TResponse> {
  const hoodpayConfig = resolveHoodpayConfig();
  if (!hoodpayConfig) {
    throw new Error('Hoodpay is not configured.');
  }
  const { apiKey } = hoodpayConfig;
  const url = `${HOODPAY_BASE_URL}${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HoodPay API error ${response.status}: ${errorText}`);
  }

  return (await response.json()) as TResponse;
}

export async function getPayments(
  businessId: string | number,
  options: GetPaymentsOptions = {}
): Promise<unknown> {
  const path = `/businesses/${businessId}/payments`;
  const searchParams = new URLSearchParams();
  Object.entries(options).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  const queryString = searchParams.toString();
  return fetchHoodpay(
    queryString ? `${path}?${queryString}` : path
  );
}

export async function createPayment(
  businessId: string | number,
  payment: PaymentCreationRequest
): Promise<HoodPayPaymentResponse> {
  return fetchHoodpay<HoodPayPaymentResponse>(
    `/businesses/${businessId}/payments`,
    {
      method: 'POST',
      body: JSON.stringify(payment),
    }
  );
}

export async function getWebhooks(
  businessId: string | number
): Promise<Webhook[]> {
  const data = await fetchHoodpay<
    Webhook[] | { webhooks?: unknown }
  >(`/dash/businesses/${businessId}/settings/developer/webhooks`);

  if (Array.isArray(data)) {
    return data;
  }

  if (data && typeof data === 'object') {
    const webhooks = (data as { webhooks?: unknown }).webhooks;
    if (Array.isArray(webhooks)) {
      return webhooks as Webhook[];
    }
  }

  return [];
}

export async function createWebhook(
  businessId: string | number,
  webhook: CreateWebhookRequest
): Promise<Webhook> {
  return fetchHoodpay<Webhook>(
    `/dash/businesses/${businessId}/settings/developer/webhooks`,
    {
      method: 'POST',
      body: JSON.stringify(webhook),
    }
  );
}

export async function resetWebhookSecret(
  businessId: string | number
): Promise<HoodPayGenericResponse> {
  return fetchHoodpay<HoodPayGenericResponse>(
    `/dash/businesses/${businessId}/settings/developer/webhooks/reset-secret`,
    {
      method: 'POST',
    }
  );
}

export async function deleteWebhook(
  businessId: string | number,
  webhookId: string | number
): Promise<HoodPayGenericResponse> {
  return fetchHoodpay<HoodPayGenericResponse>(
    `/dash/businesses/${businessId}/settings/developer/webhooks/${webhookId}`,
    {
      method: 'DELETE',
    }
  );
}
