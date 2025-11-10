'use client';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCurrency, Currency } from '@/lib/contexts/currency-context';
import { DollarSignIcon } from 'lucide-react';
const CURRENCIES: { value: Currency; label: string; icon: string }[] = [
  { value: 'BTC', label: 'BTC', icon: '₿' },
  { value: 'ETH', label: 'ETH', icon: 'Ξ' },
  { value: 'BNB', label: 'BNB', icon: '⚡' },
  { value: 'USDC', label: 'USDC', icon: '$' },
];

export default function CurrencyToggle() {
  const { currency, setCurrency } = useCurrency();

  return (
    <div className="flex items-center">
      <Select
        onValueChange={(value: Currency) => setCurrency(value)}
        value={currency}
      >
        <SelectTrigger className="w-[110px] h-9 bg-card/70 border border-border/80 text-foreground/80 focus:ring-2 focus:ring-accent/50">
          <SelectValue placeholder="Currency" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel className="text-sm">
              <DollarSignIcon size={16} className="inline" /> Currencies
            </SelectLabel>
            {CURRENCIES.map((curr) => (
              <SelectItem key={curr.value} value={curr.value} className="text-xs!">
                <span className="mr-1">{curr.icon}</span>
                {curr.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
