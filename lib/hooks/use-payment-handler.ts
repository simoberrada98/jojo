"use client";
import { useState } from 'react';
import { paymentClientConfig } from '../config/payment.config.client';
import { createHoodpaySessionAction } from '../../app/actions/create-hoodpay-session';

export function usePaymentHandler(options = {}) {
  const [processing, setProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('idle');
  const [error, setError] = useState(null);

  async function handlePayment(method, data, currency) {
    setError(null);
    try {
      setProcessing(true);
      setPaymentStatus('processing');
      if (method === 'hoodpay') {
        if (!paymentClientConfig.enableHoodpay) throw new Error('HoodPay is disabled');
        const session = await createHoodpaySessionAction({
          amount: data.totalMinor,
          currency,
          metadata: data.metadata,
          customer: data.customer,
        });
        window.location.href = session.checkoutUrl;
        return;
      }
      if (method === 'web-payment') {
        await new Promise((r) => setTimeout(r, 500));
        setPaymentStatus('success');
        options.onComplete?.();
        return;
      }
      throw new Error(`Unsupported payment method: ${method}`);
    } catch (err) {
      setPaymentStatus('failed');
      setError(err.message ?? 'Unknown payment error');
    } finally {
      setProcessing(false);
    }
  }

  return { processing, error, paymentStatus, handlePayment };
}
