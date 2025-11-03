'use client';
import { useState } from 'react';
import { paymentClientConfig } from '../config/payment.config.client';
import { createHoodpaySessionAction } from '../../app/actions/create-hoodpay-session';

interface UsePaymentHandlerOptions {
  onComplete?: () => void;
}

export function usePaymentHandler(options: UsePaymentHandlerOptions = {}) {
  const [processing, setProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('idle');
  const [error, setError] = useState<string | null>(null);

  async function handlePayment(method, data, currency) {
    setError(null);
    try {
      setProcessing(true);
      setPaymentStatus('processing');
      if (method === 'hoodpay') {
        if (!paymentClientConfig.enableHoodpay)
          throw new Error('HoodPay is disabled');
        const session = await createHoodpaySessionAction({
          amount: data.total,
          currency,
          // Include shipping + items summary for fulfillment
          metadata: {
            customerInfo: data.customerInfo,
            items: data.items?.map((i) => ({
              id: i.id,
              name: i.name,
              quantity: i.quantity,
              total: i.total,
            })),
            totals: {
              subtotal: data.subtotal,
              shipping: data.shipping,
              tax: data.tax,
              total: data.total,
            },
          },
          customer: data.customerInfo,
        });
        if (!session.checkoutUrl) {
          throw new Error('HoodPay session checkout URL is missing');
        }
        window.location.href = session.checkoutUrl;
        return;
      }
      throw new Error(`Unsupported payment method: ${method}`);
    } catch (err: unknown) {
      setPaymentStatus('failed');
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unknown payment error');
      }
    } finally {
      setProcessing(false);
    }
  }

  return { processing, error, paymentStatus, handlePayment };
}
