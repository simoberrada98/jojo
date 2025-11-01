'use client'

import { useCurrency } from '@/lib/contexts/currency-context'

interface PriceDisplayProps {
  amountUSD: number
  /** Main price className (for the converted price in selected currency) */
  className?: string
  /** USD price className (for the USD fallback price) */
  usdClassName?: string
  /** If true, displays prices in a column. Otherwise, displays inline. */
  vertical?: boolean
}

/**
 * Displays a price in both the selected currency and USD.
 * Example: "0.0234 BTC ($1,500 USD)"
 */
export default function PriceDisplay({
  amountUSD,
  className = 'text-xl font-bold text-accent',
  usdClassName = 'text-xs text-foreground/60',
  vertical = false
}: PriceDisplayProps) {
  const { currency, formatPrice } = useCurrency()

  if (vertical) {
    return (
      <div>
        <div className={className}>
          {formatPrice(amountUSD)} {currency}
        </div>
        <div className={usdClassName}>${amountUSD.toLocaleString()} USD</div>
      </div>
    )
  }

  return (
    <span>
      <span className={className}>
        {formatPrice(amountUSD)} {currency}
      </span>{' '}
      <span className={usdClassName}>(${amountUSD.toLocaleString()} USD)</span>
    </span>
  )
}
