'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { H3, Muted } from '@/components/ui/typography';
import {
  CreditCard,
  Wallet,
  Loader2,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import {
  createPaymentOrchestrator,
  PaymentMethod,
  PaymentStatus,
  type CheckoutData,
} from '@/lib/payment';
import { usePaymentHandler } from '@/lib/hooks/use-payment-handler';
import { prepareCheckoutData, type OrderData } from '@/lib/utils/checkout';

import { PaymentStatusMessage } from '@/components/ui/payment-status-message';
import { useCurrency } from '@/lib/contexts/currency-context';
import { APP_CONFIG } from '@/lib/config/app.config';

interface HoodPayCheckoutFormProps {
  orderData: OrderData;
  onComplete: () => void;
}

type PaymentMethodOption = 'hoodpay' | 'web-payment';

export default function HoodPayCheckoutForm({
  orderData,
  onComplete,
}: HoodPayCheckoutFormProps) {
  const { currency } = useCurrency();
  const { processing, error, paymentStatus, handlePayment } = usePaymentHandler(
    { onComplete }
  );
  const hoodPayEnabled = APP_CONFIG.features.enableHoodPay;
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodOption>(
    hoodPayEnabled ? 'hoodpay' : 'web-payment'
  );

  const handlePaymentClick = () => {
    const includeCustomerInfo = selectedMethod === 'hoodpay';
    const checkoutData = prepareCheckoutData(
      orderData,
      currency,
      includeCustomerInfo
    );
    handlePayment(selectedMethod, checkoutData, currency);
  };

  const [webPaymentSupported, setWebPaymentSupported] = useState(false);

  useEffect(() => {
    // Check if Web Payment API is available
    if (typeof window !== 'undefined' && 'PaymentRequest' in window) {
      setWebPaymentSupported(true);
    }
  }, []);

  const paymentMethods = useMemo(
    () =>
      [
        {
          id: 'hoodpay' as const,
          name: 'Crypto Payment',
          description: 'Pay with crypto',
          icon: Wallet,
          available: hoodPayEnabled,
        },
        {
          id: 'web-payment' as const,
          name: 'Card / Digital Wallet',
          description: 'Apple Pay, Google Pay, or Card',
          icon: CreditCard,
          available: webPaymentSupported,
        },
      ] satisfies Array<{
        id: PaymentMethodOption;
        name: string;
        description: string;
        icon: typeof Wallet | typeof CreditCard;
        available: boolean;
      }>,
    [hoodPayEnabled, webPaymentSupported]
  );

  const activeMethod = useMemo(
    () => paymentMethods.find((method) => method.id === selectedMethod),
    [paymentMethods, selectedMethod]
  );

  const hasAvailableMethod = paymentMethods.some((method) => method.available);

  useEffect(() => {
    const firstAvailable = paymentMethods.find((method) => method.available);
    if (
      firstAvailable &&
      !paymentMethods.some(
        (method) => method.id === selectedMethod && method.available
      )
    ) {
      setSelectedMethod(firstAvailable.id);
    }
  }, [paymentMethods, selectedMethod]);

  return (
    <div className="space-y-6">
      {/* Payment Method Selection */}
      <div className="bg-card p-6 border border-border rounded-lg">
        <H3 className="mb-4 text-lg">Select Payment Method</H3>
        <div className="gap-4 grid grid-cols-1">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            return (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                disabled={!method.available || processing}
                className={`p-4 rounded-lg border-2 transition text-left ${
                  selectedMethod === method.id
                    ? 'border-accent bg-accent/10'
                    : 'border-border hover:border-accent/50'
                } ${!method.available ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <Icon className="mt-1 w-6 h-6 text-accent" />
                  <div className="flex-1">
                    <div className="font-semibold text-foreground">
                      {method.name}
                    </div>
                    <div className="text-foreground/60 text-sm">
                      {method.description}
                    </div>
                  </div>
                  {selectedMethod === method.id && (
                    <CheckCircle className="w-5 h-5 text-accent" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
        {!hoodPayEnabled && (
          <Muted className="mt-3 text-xs text-foreground/60">
            Crypto payments are currently unavailable. Choose another method or
            contact support to enable HoodPay.
          </Muted>
        )}
        {!hasAvailableMethod && (
          <Muted className="mt-3 text-xs text-destructive">
            No payment methods are currently available. Please reach out to
            support for assistance.
          </Muted>
        )}
      </div>

      {/* Payment Summary */}
      <div className="bg-card p-6 border border-border rounded-lg">
        <H3 className="mb-4 text-lg">Payment Summary</H3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-foreground/70">Subtotal</span>
            <span className="text-foreground">
              ${orderData.subtotal.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-foreground/70">Shipping</span>
            <span className="text-foreground">
              ${orderData.shipping.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-foreground/70">Tax</span>
            <span className="text-foreground">${orderData.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between pt-3 border-border border-t">
            <span className="font-semibold text-foreground">Total</span>
            <span className="font-bold text-accent text-xl">
              ${orderData.total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {(paymentStatus !== 'idle' || error) && (
        <PaymentStatusMessage
          status={
            error
              ? 'error'
              : paymentStatus === 'failed'
                ? 'error'
                : paymentStatus === 'processing'
                  ? 'processing'
                  : paymentStatus === 'success'
                    ? 'success'
                    : 'error' // Fallback for 'idle' if it somehow gets here, though it shouldn't be rendered
          }
          error={error}
        />
      )}

      {/* Payment Button */}
      <Button
        onClick={handlePaymentClick}
        disabled={
          processing || paymentStatus === 'success' || !activeMethod?.available
        }
        className="bg-primary hover:bg-primary/90 py-6 w-full font-semibold text-primary-foreground text-lg"
      >
        {processing ? (
          <>
            <Loader2 className="mr-2 w-5 h-5 animate-spin" />
            Processing...
          </>
        ) : paymentStatus === 'success' ? (
          <>
            <CheckCircle className="mr-2 w-5 h-5" />
            Payment Complete
          </>
        ) : (
          `Pay $${orderData.total.toFixed(2)}`
        )}
      </Button>

      {/* Security Notice */}
      <div className="bg-primary/10 p-4 border border-primary/20 rounded-lg">
        <Muted className="m-0 text-foreground/80 text-xs text-center">
          🔒 Secure payment processing powered by HoodPay. Your payment
          information is encrypted and secure.
        </Muted>
      </div>
    </div>
  );
}
