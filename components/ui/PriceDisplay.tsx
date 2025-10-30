import React from 'react';

interface PriceDisplayProps {
  amount: number;
  currency?: string;
  className?: string;
  showUSD?: boolean;
}

export default function PriceDisplay({ 
  amount, 
  currency = 'USD', 
  className = '',
  showUSD = true 
}: PriceDisplayProps) {
  const formattedAmount = amount.toFixed(2);
  
  return (
    <span className={className}>
      {currency !== 'USD' && `${currency} `}
      {formattedAmount}
      {showUSD && currency !== 'USD' && ' USD'}
    </span>
  );
}
