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
  PaymentResult,
  PaymentStatus,
  PaymentError,
} from "./types";

/**
 * Check if Web Payment API is supported
 */
export function isPaymentRequestSupported(): boolean {
  return typeof window !== "undefined" && "PaymentRequest" in window;
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
        label: "Test",
        amount: { currency: "USD", value: "0.00" },
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
  const displayItems = checkoutData.items.map((item) => ({
    label: `${item.name} (x${item.quantity})`,
    amount: {
      currency: checkoutData.currency,
      value: item.total.toFixed(2),
    },
  }));

  // Add subtotal, tax, shipping as display items
  if (checkoutData.subtotal > 0) {
    displayItems.push({
      label: "Subtotal",
      amount: {
        currency: checkoutData.currency,
        value: checkoutData.subtotal.toFixed(2),
      },
    });
  }

  if (checkoutData.tax > 0) {
    displayItems.push({
      label: "Tax",
      amount: {
        currency: checkoutData.currency,
        value: checkoutData.tax.toFixed(2),
      },
    });
  }

  if (checkoutData.shipping > 0) {
    displayItems.push({
      label: "Shipping",
      amount: {
        currency: checkoutData.currency,
        value: checkoutData.shipping.toFixed(2),
      },
    });
  }

  return {
    total: {
      label: "Total",
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
  supportedNetworks: string[] = ["visa", "mastercard", "amex"]
): PaymentMethodData[] {
  return [
    {
      supportedMethods: "basic-card",
      data: {
        supportedNetworks,
        supportedTypes: ["credit", "debit"],
      },
    },
    // Add support for digital wallets
    {
      supportedMethods: "https://apple.com/apple-pay",
    },
    {
      supportedMethods: "https://google.com/pay",
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
    merchantName: string = "HoodPay Merchant",
    supportedNetworks: string[] = ["visa", "mastercard", "amex"]
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
        paymentId: "",
        status: PaymentStatus.FAILED,
        error: {
          code: "WEB_PAYMENT_NOT_SUPPORTED",
          message: "Web Payment API is not supported in this browser",
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
          paymentId: "",
          status: PaymentStatus.FAILED,
          error: {
            code: "NO_PAYMENT_METHOD",
            message: "No supported payment method available",
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
        processResult.success ? "success" : "fail"
      );

      return processResult;
    } catch (error: any) {
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
    } catch (error: any) {
      return {
        success: false,
        paymentId: "",
        status: PaymentStatus.FAILED,
        error: {
          code: "PROCESSING_ERROR",
          message: error.message || "Failed to process payment",
          retryable: true,
        },
      };
    }
  }

  /**
   * Handle payment errors
   */
  private handlePaymentError(error: any): PaymentResult {
    let errorCode = "UNKNOWN_ERROR";
    let errorMessage = "An unknown error occurred";
    let retryable = true;

    if (error.name === "AbortError") {
      errorCode = "USER_CANCELLED";
      errorMessage = "Payment was cancelled by user";
      retryable = false;
    } else if (error.name === "InvalidStateError") {
      errorCode = "INVALID_STATE";
      errorMessage = "Payment request is in an invalid state";
      retryable = false;
    } else if (error.name === "NotSupportedError") {
      errorCode = "NOT_SUPPORTED";
      errorMessage = "Payment method not supported";
      retryable = false;
    } else if (error.name === "SecurityError") {
      errorCode = "SECURITY_ERROR";
      errorMessage = "Security error during payment";
      retryable = false;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      success: false,
      paymentId: "",
      status: PaymentStatus.FAILED,
      error: {
        code: errorCode,
        message: errorMessage,
        details: error,
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
      console.error("Failed to abort payment:", error);
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
    merchantName = "HoodPay Merchant",
    supportedNetworks = ["visa", "mastercard", "amex"],
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
  if (await canMakePayment([{ supportedMethods: "basic-card" }])) {
    methods.push("basic-card");
  }

  // Check for Apple Pay
  if (
    await canMakePayment([{ supportedMethods: "https://apple.com/apple-pay" }])
  ) {
    methods.push("apple-pay");
  }

  // Check for Google Pay
  if (await canMakePayment([{ supportedMethods: "https://google.com/pay" }])) {
    methods.push("google-pay");
  }

  return methods;
}

// Export singleton instance
export const webPaymentService = new WebPaymentService();
