"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"

interface CryptoPaymentFormProps {
  orderData: any
  onComplete: () => void
}

const CRYPTOCURRENCIES = [
  { id: "btc", name: "Bitcoin", symbol: "BTC", address: "1A1z7agoat2LWQLQ1qo843aUREag8peJn", rate: 1 },
  { id: "eth", name: "Ethereum", symbol: "ETH", address: "0x742d35Cc6634C0532925a3b844Bc9e7595f42bE", rate: 0.025 },
  { id: "usdc", name: "USDC", symbol: "USDC", address: "0x742d35Cc6634C0532925a3b844Bc9e7595f42bE", rate: 95200 },
]

export default function CryptoPaymentForm({ orderData, onComplete }: CryptoPaymentFormProps) {
  const [selectedCrypto, setSelectedCrypto] = useState("btc")
  const [copied, setCopied] = useState(false)
  const [paymentConfirmed, setPaymentConfirmed] = useState(false)

  const crypto = CRYPTOCURRENCIES.find((c) => c.id === selectedCrypto)!
  const amount = 2.8 * crypto.rate

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    `${crypto.id}:${crypto.address}?amount=${amount}`,
  )}`

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(crypto.address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleConfirmPayment = () => {
    setPaymentConfirmed(true)
    setTimeout(() => onComplete(), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Cryptocurrency Selection */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">Select Payment Method</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {CRYPTOCURRENCIES.map((crypto) => (
            <button
              key={crypto.id}
              onClick={() => setSelectedCrypto(crypto.id)}
              className={`p-4 rounded-lg border-2 transition ${
                selectedCrypto === crypto.id ? "border-accent bg-accent/10" : "border-border hover:border-accent/50"
              }`}
            >
              <div className="font-semibold text-foreground">{crypto.name}</div>
              <div className="text-sm text-foreground/60">{crypto.symbol}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Payment Details */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">Payment Details</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-foreground/70 block mb-2">Amount to Send</label>
            <div className="text-3xl font-bold text-accent">
              {amount.toFixed(crypto.id === "usdc" ? 2 : 6)} {crypto.symbol}
            </div>
          </div>

          {/* QR Code */}
          <div className="flex justify-center p-6 bg-background rounded-lg">
            <img src={qrCodeUrl || "/placeholder.svg"} alt="Payment QR Code" className="w-48 h-48" />
          </div>

          {/* Payment Address */}
          <div>
            <label className="text-sm text-foreground/70 block mb-2">Send to Address</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={crypto.address}
                readOnly
                className="flex-1 px-4 py-3 rounded-lg bg-background border border-border text-foreground font-mono text-sm"
              />
              <Button
                onClick={handleCopyAddress}
                variant="outline"
                className="border-accent text-accent hover:bg-accent/10 bg-transparent"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <p className="text-sm text-foreground/80">
              <strong>Important:</strong> Send exactly {amount.toFixed(crypto.id === "usdc" ? 2 : 6)} {crypto.symbol} to
              the address above. Do not send more or less.
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">Confirm Payment</h3>
        <p className="text-foreground/70 mb-6">
          Once you send the payment, it may take a few minutes to confirm on the blockchain. We'll notify you when we
          receive it.
        </p>
        <Button
          onClick={handleConfirmPayment}
          disabled={paymentConfirmed}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
        >
          {paymentConfirmed ? "Payment Confirmed!" : "I've Sent the Payment"}
        </Button>
      </div>
    </div>
  )
}
