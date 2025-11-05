
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
  cancelUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface HoodPayPaymentResponse {
  id?: string | number;
  paymentUrl?: string;
  payment_url?: string;
  status?: string;
  [key: string]: unknown;
}

export type HoodPayGenericResponse = Record<string, unknown>;

export interface Webhook {
  id: number | string;
  url: string;
  events: string[];
  active?: boolean;
  [key: string]: unknown;
}

export type WebhookEvent =
  | 'payment:completed'
  | 'payment:cancelled'
  | 'payment:expired'
  | 'payment:method_selected'
  | 'payment:created'
  | (string & {});

export interface CreateWebhookRequest {
  url: string;
  events: WebhookEvent[];
  description?: string;
  active?: boolean;
}
