'use client';

import { useState } from 'react';
import {
  createPaymentOrchestrator,
  PaymentMethod,
  type CheckoutData,
} from '@/lib/payment';

type PaymentHandlerOptions = {
  onComplete: () => void;
};

export function usePaymentHandler({ onComplete }: PaymentHandlerOptions) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<
    'idle' | 'processing' | 'success' | 'failed'
  >('idle');

  const handlePayment = async (
    method: 'hoodpay' | 'web-payment',
    checkoutData: CheckoutData,
    currency: string
  ) => {
    setProcessing(true);
    setError(null);
    setPaymentStatus('processing');

    try {
      const orchestrator = createPaymentOrchestrator({
        hooks: {
          onCompleted: async () => {
            setPaymentStatus('success');
            setTimeout(() => onComplete(), 2000);
          },
          onFailed: async (event) => {
            setPaymentStatus('failed');
            setError((event.data as any)?.error?.message || 'Payment failed');
          },
        },
      });

      await orchestrator.initializePayment(
        checkoutData.total,
        currency,
        checkoutData,
        {
          customerEmail: checkoutData.customerInfo?.email,
          description: `Order for ${checkoutData.items.length} item(s)`,
        }
      );

      const paymentMethod =
        method === 'hoodpay'
          ? PaymentMethod.HOODPAY
          : PaymentMethod.WEB_PAYMENT_API;

      const result = await orchestrator.processPayment(paymentMethod, {
        redirectUrl: `${window.location.origin}/checkout/success`,
        notifyUrl: `${window.location.origin}/api/hoodpay/webhook`,
      });

      if (result.success) {
        if (method === 'hoodpay' && result.metadata?.paymentUrl) {
          window.location.href = result.metadata.paymentUrl as string;
        } else {
          setPaymentStatus('success');
          setTimeout(() => onComplete(), 2000);
        }
      } else {
        throw new Error(result.error?.message || 'Payment failed');
      }
    } catch (err: any) {
      console.error(`${method} payment error:`, err);
      setError(err.message || 'Payment failed. Please try again.');
      setPaymentStatus('failed');
    } finally {
      setProcessing(false);
    }
  };

  return {
    processing,
    error,
    paymentStatus,
    handlePayment,
  };
}
