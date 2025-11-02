'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { H3, Muted } from '@/components/ui/typography';
import { Copy, Check } from 'lucide-react';
import Image from 'next/image';

interface CryptoPaymentFormProps {
  onComplete: () => void;
}

const CRYPTOCURRENCIES = [
  {
    id: 'btc',
    name: 'Bitcoin',
    symbol: 'BTC',
    address: '1A1z7agoat2LWQLQ1qo843aUREag8peJn',
    rate: 1,
  },
  {
    id: 'eth',
    name: 'Ethereum',
    symbol: 'ETH',
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f42bE',
    rate: 0.025,
  },
  {
    id: 'usdc',
    name: 'USDC',
    symbol: 'USDC',
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f42bE',
    rate: 95200,
  },
];

export default function CryptoPaymentForm({
  onComplete,
}: CryptoPaymentFormProps) {
  const [selectedCrypto, setSelectedCrypto] = useState('btc');
  const [copied, setCopied] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  const crypto = CRYPTOCURRENCIES.find((c) => c.id === selectedCrypto)!;
  const amount = 2.8 * crypto.rate;

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    `${crypto.id}:${crypto.address}?amount=${amount}`
  )}`;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(crypto.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmPayment = () => {
    setPaymentConfirmed(true);
    setTimeout(() => onComplete(), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Cryptocurrency Selection */}
      <div className="bg-card p-6 border border-border rounded-lg">
        <H3 className="mb-4 text-lg">Select Payment Method</H3>
        <div className="gap-4 grid grid-cols-1 sm:grid-cols-3">
          {CRYPTOCURRENCIES.map((crypto) => (
            <button
              key={crypto.id}
              onClick={() => setSelectedCrypto(crypto.id)}
              className={`p-4 rounded-lg border-2 transition ${
                selectedCrypto === crypto.id
                  ? 'border-accent bg-accent/10'
                  : 'border-border hover:border-accent/50'
              }`}
            >
              <div className="font-semibold text-foreground">{crypto.name}</div>
              <div className="text-foreground/60 text-sm">{crypto.symbol}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Payment Details */}
      <div className="bg-card p-6 border border-border rounded-lg">
        <H3 className="mb-4 text-lg">Payment Details</H3>
        <div className="space-y-4">
          <div>
            <Label className="block mb-2">Amount to Send</Label>
            <div className="font-bold text-accent text-3xl">
              {amount.toFixed(crypto.id === 'usdc' ? 2 : 6)} {crypto.symbol}
            </div>
          </div>

          {/* QR Code */}
          <div className="flex justify-center bg-background p-6 rounded-lg">
            <Image
              src={qrCodeUrl || '/placeholder.svg'}
              alt="Payment QR Code"
              width={192}
              height={192}
              className="w-48 h-48"
            />
          </div>

          {/* Payment Address */}
          <div>
            <Label className="block mb-2">Send to Address</Label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={crypto.address}
                readOnly
                className="flex-1 font-mono"
              />
              <Button
                onClick={handleCopyAddress}
                variant="outline"
                className="bg-transparent hover:bg-accent/10 border-accent text-accent"
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-primary/10 p-4 border border-primary/20 rounded-lg">
            <Muted className="m-0 text-foreground/80">
              <strong>Important:</strong> Send exactly{' '}
              {amount.toFixed(crypto.id === 'usdc' ? 2 : 6)} {crypto.symbol} to
              the address above. Do not send more or less.
            </Muted>
          </div>
        </div>
      </div>

      {/* Confirmation */}
      <div className="bg-card p-6 border border-border rounded-lg">
        <H3 className="mb-4 text-lg">Confirm Payment</H3>
        <Muted className="m-0 mb-6">
          Once you send the payment, it may take a few minutes to confirm on the
          blockchain. We&rsquo;ll notify you when we receive it.
        </Muted>
        <Button
          onClick={handleConfirmPayment}
          disabled={paymentConfirmed}
          className="bg-primary hover:bg-primary/90 w-full font-semibold text-primary-foreground"
        >
          {paymentConfirmed
            ? 'Payment Confirmed!'
            : 'I&rsquo;ve Sent the Payment'}
        </Button>
      </div>
    </div>
  );
}
