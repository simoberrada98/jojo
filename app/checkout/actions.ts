'use server';

import { env } from '@/lib/config/env';
import { createPayment } from '@/lib/hoodpayModule';
import {
  PaymentStatus,
  type CheckoutData,
  type PaymentResult,
} from '@/types/payment';

type HoodPayPaymentInput = {
  checkoutData: CheckoutData;
  currency: string;
  redirectUrl: string;
  notifyUrl: string;
  description?: string;
  customerEmail?: string;
};

function buildFailureResult(
  code: string,
  message: string,
  retryable = false
): PaymentResult {
  return {
    success: false,
    paymentId: '',
    status: PaymentStatus.FAILED,
    error: {
      code,
      message,
      retryable,
    },
  };
}

export async function initiateHoodPayPayment(
  input: HoodPayPaymentInput
): Promise<PaymentResult> {
  if (!env.NEXT_PUBLIC_ENABLE_HOODPAY) {
    return buildFailureResult(
      'HOODPAY_DISABLED',
      'HoodPay payments are currently disabled',
      false
    );
  }

  const apiKey = env.HOODPAY_API_KEY;
  const businessId = env.HOODPAY_BUSINESS_ID;

  if (!apiKey || !businessId) {
    return buildFailureResult(
      'HOODPAY_NOT_CONFIGURED',
      'HoodPay credentials are missing',
      false
    );
  }

  const {
    checkoutData,
    currency,
    redirectUrl,
    notifyUrl,
    description,
    customerEmail,
  } = input;

  try {
    const response = await createPayment(apiKey, businessId, {
      currency,
      amount: checkoutData.total,
      name: checkoutData.items[0]?.name ?? 'Order',
      description:
        description ?? `Order for ${checkoutData.items.length} item(s)`,
      customerEmail: customerEmail ?? checkoutData.customerInfo?.email,
      redirectUrl,
      notifyUrl,
    });

    const paymentUrl =
      response?.paymentUrl ?? response?.payment_url ?? response?.payment_url;

    return {
      success: true,
      paymentId: String(response?.id ?? ''),
      transactionId: String(response?.id ?? ''),
      status: PaymentStatus.PROCESSING,
      metadata: {
        ...response,
        paymentUrl,
      },
    };
  } catch (error: any) {
    const message =
      error?.message ?? 'HoodPay payment failed. Please try again later.';
    return buildFailureResult('HOODPAY_ERROR', message, true);
  }
}
