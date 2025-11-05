/**
 * Web Payment Request API integration
 * Provides native payment UI on supported browsers
 */

import {
  WebPaymentRequest,
  PaymentMethodData,
  PaymentDetailsInit,
  PaymentOptions,
  CheckoutData,
  CheckoutItem,
  PaymentResult,
  PaymentStatus,
  PaymentError,
} from '@/types/payment';
import { logger } from '@/lib/utils/logger';
import type { Json } from '@/types/supabase.types';
import { env } from '@/lib/config/env';

const errorToJson = (error: unknown): Json => {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack ?? null,
    } as Json;
  }

  try {
    return JSON.parse(JSON.stringify(error ?? null)) as Json;
  } catch {
    return String(error ?? '') as Json;
  }
};

/**
 * Check if Web Payment API is supported
 */
export function isPaymentRequestSupported(): boolean {
  if (!env.NEXT_PUBLIC_ENABLE_WEB_PAYMENT_API) {
    return false;
  }
  return typeof window !== 'undefined' && 'PaymentRequest' in window;
}

/**
 * Check if specific payment method is supported
 */
export async function canMakePayment(
  methodData: PaymentMethodData[]
): Promise<boolean> {
  if (!isPaymentRequestSupported()) {
    return false;
  }

  try {
    const details: PaymentDetailsInit = {
      total: {
        label: 'Test',
        amount: { currency: 'USD', value: '0.00' },
      },
    };

    const request = new PaymentRequest(methodData, details);
    const result = await request.canMakePayment();
    return result;
  } catch {
    return false;
  }
}

/**
 * Convert checkout data to Web Payment API format
 */
export function convertCheckoutToPaymentDetails(
  checkoutData: CheckoutData
): PaymentDetailsInit {
  const displayItems = checkoutData.items.map((item: CheckoutItem) => ({
    label: `${item.name} (x${item.quantity})`,
    amount: {
      currency: checkoutData.currency,
      value: item.total.toFixed(2),
    },
  }));

  // Add subtotal, tax, shipping as display items
  if (checkoutData.subtotal > 0) {
    displayItems.push({
      label: 'Subtotal',
      amount: {
        currency: checkoutData.currency,
        value: checkoutData.subtotal.toFixed(2),
      },
    });
  }

  if (checkoutData.tax > 0) {
    displayItems.push({
      label: 'Tax',
      amount: {
        currency: checkoutData.currency,
        value: checkoutData.tax.toFixed(2),
      },
    });
  }

  if (checkoutData.shipping > 0) {
    displayItems.push({
      label: 'Shipping',
      amount: {
        currency: checkoutData.currency,
        value: checkoutData.shipping.toFixed(2),
      },
    });
  }

  return {
    total: {
      label: 'Total',
      amount: {
        currency: checkoutData.currency,
        value: checkoutData.total.toFixed(2),
      },
    },
    displayItems,
  };
}

/**
 * Create payment method data for supported methods
 */
export function createPaymentMethodData(
  supportedNetworks: string[] = ['visa', 'mastercard', 'amex']
): PaymentMethodData[] {
  return [
    {
      supportedMethods: 'basic-card',
      data: {
        supportedNetworks,
        supportedTypes: ['credit', 'debit'],
      },
    },
    // Add support for digital wallets
    {
      supportedMethods: 'https://apple.com/apple-pay',
    },
    {
      supportedMethods: 'https://google.com/pay',
    },
  ];
}

/**
 * WebPaymentService - Handles Web Payment Request API integration
 */
export class WebPaymentService {
  private merchantName: string;
  private supportedNetworks: string[];

  constructor(
    merchantName: string = 'Merchant',
    supportedNetworks: string[] = ['visa', 'mastercard', 'amex']
  ) {
    this.merchantName = merchantName;
    this.supportedNetworks = supportedNetworks;
  }

  /**
   * Check if service is available
   */
  isAvailable(): boolean {
    return isPaymentRequestSupported();
  }

  /**
   * Process payment using Web Payment API
   */
  async processPayment(
    checkoutData: CheckoutData,
    options?: PaymentOptions
  ): Promise<PaymentResult> {
    if (!this.isAvailable()) {
      return {
        success: false,
        paymentId: '',
        status: PaymentStatus.FAILED,
        error: {
          code: 'WEB_PAYMENT_NOT_SUPPORTED',
          message: 'Web Payment API is not supported in this browser',
          retryable: false,
        },
      };
    }

    try {
      const methodData = createPaymentMethodData(this.supportedNetworks);
      const details = convertCheckoutToPaymentDetails(checkoutData);

      // Check if payment can be made
      const canPay = await canMakePayment(methodData);
      if (!canPay) {
        return {
          success: false,
          paymentId: '',
          status: PaymentStatus.FAILED,
          error: {
            code: 'NO_PAYMENT_METHOD',
            message: 'No supported payment method available',
            retryable: false,
          },
        };
      }

      // Create payment request
      const paymentRequest = new PaymentRequest(
        methodData,
        details,
        options || {
          requestPayerName: true,
          requestPayerEmail: true,
          requestPayerPhone: false,
        }
      );

      // Show payment UI
      const paymentResponse = await paymentRequest.show();

      // Process the payment (this would integrate with your backend)
      const processResult = await this.processPaymentResponse(
        paymentResponse,
        checkoutData
      );

      // Complete the payment
      await paymentResponse.complete(
        processResult.success ? 'success' : 'fail'
      );

      return processResult;
    } catch (error: unknown) {
      return this.handlePaymentError(error);
    }
  }

  /**
   * Process payment response from Web Payment API
   */
  private async processPaymentResponse(
    response: PaymentResponse,
    checkoutData: CheckoutData
  ): Promise<PaymentResult> {
    try {
      // Extract payment details
      const { details, methodName, payerEmail, payerName, payerPhone } =
        response;

      // In production, send this to your backend for processing
      // For now, we'll simulate a successful payment
      const paymentId = `web_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Simulate backend processing
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return {
        success: true,
        paymentId,
        status: PaymentStatus.COMPLETED,
        metadata: {
          methodName,
          payerEmail: payerEmail || undefined,
          payerName: payerName || undefined,
          payerPhone: payerPhone || undefined,
          amount: checkoutData.total,
          currency: checkoutData.currency,
        },
      };
    } catch (error: unknown) {
      return {
        success: false,
        paymentId: '',
        status: PaymentStatus.FAILED,
        error: {
          code: 'PROCESSING_ERROR',
          message:
            error instanceof Error
              ? error.message
              : 'Failed to process payment',
          retryable: true,
        },
      };
    }
  }

  /**
   * Handle payment errors
   */
  private handlePaymentError(error: unknown): PaymentResult {
    let errorCode = 'UNKNOWN_ERROR';
    let errorMessage = 'An unknown error occurred';
    let retryable = true;

    if (error instanceof DOMException) {
      if (error.name === 'AbortError') {
        errorCode = 'USER_CANCELLED';
        errorMessage = 'Payment was cancelled by user';
        retryable = false;
      } else if (error.name === 'InvalidStateError') {
        errorCode = 'INVALID_STATE';
        errorMessage = 'Payment request is in an invalid state';
        retryable = false;
      } else if (error.name === 'NotSupportedError') {
        errorCode = 'NOT_SUPPORTED';
        errorMessage = 'Payment method not supported';
        retryable = false;
      } else if (error.name === 'SecurityError') {
        errorCode = 'SECURITY_ERROR';
        errorMessage = 'Security error during payment';
        retryable = false;
      } else if (error.message) {
        errorMessage = error.message;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return {
      success: false,
      paymentId: '',
      status: PaymentStatus.FAILED,
      error: {
        code: errorCode,
        message: errorMessage,
        details: errorToJson(error),
        retryable,
      },
    };
  }

  /**
   * Abort ongoing payment request
   */
  async abortPayment(request: PaymentRequest): Promise<void> {
    try {
      await request.abort();
    } catch (error) {
      logger.error('Failed to abort payment', error as Error);
    }
  }
}

/**
 * Create a Web Payment Request
 */
export function createWebPaymentRequest(
  checkoutData: CheckoutData,
  config: {
    merchantName?: string;
    supportedNetworks?: string[];
    requestPayerEmail?: boolean;
    requestPayerName?: boolean;
    requestPayerPhone?: boolean;
  } = {}
): WebPaymentRequest {
  const {
    merchantName = 'Merchant',
    supportedNetworks = ['visa', 'mastercard', 'amex'],
    requestPayerEmail = true,
    requestPayerName = true,
    requestPayerPhone = false,
  } = config;

  return {
    methodData: createPaymentMethodData(supportedNetworks),
    details: convertCheckoutToPaymentDetails(checkoutData),
    options: {
      requestPayerEmail,
      requestPayerName,
      requestPayerPhone,
    },
  };
}

/**
 * Quick check if user has a saved payment method
 */
export async function hasSavedPaymentMethod(): Promise<boolean> {
  if (!isPaymentRequestSupported()) {
    return false;
  }

  try {
    const methodData = createPaymentMethodData();
    return await canMakePayment(methodData);
  } catch {
    return false;
  }
}

/**
 * Get available payment methods
 */
export async function getAvailablePaymentMethods(): Promise<string[]> {
  if (!isPaymentRequestSupported()) {
    return [];
  }

  const methods: string[] = [];

  // Check for basic card
  if (await canMakePayment([{ supportedMethods: 'basic-card' }])) {
    methods.push('basic-card');
  }

  // Check for Apple Pay
  if (
    await canMakePayment([{ supportedMethods: 'https://apple.com/apple-pay' }])
  ) {
    methods.push('apple-pay');
  }

  // Check for Google Pay
  if (await canMakePayment([{ supportedMethods: 'https://google.com/pay' }])) {
    methods.push('google-pay');
  }

  return methods;
}

// Export singleton instance
export const webPaymentService = new WebPaymentService();
