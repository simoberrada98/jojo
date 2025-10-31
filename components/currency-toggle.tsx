"use client";

import { useCurrency, Currency } from "@/lib/contexts/currency-context";

const CURRENCIES: { value: Currency; label: string; icon: string }[] = [
  { value: "BTC", label: "BTC", icon: "₿" },
  { value: "ETH", label: "ETH", icon: "Ξ" },
  { value: "BNB", label: "BNB", icon: "⚡" },
  { value: "USDC", label: "USDC", icon: "$" },
];

export default function CurrencyToggle() {
  const { currency, setCurrency } = useCurrency();

  return (
    <div className="flex items-center gap-2">
      <span className="hidden sm:inline mr-2 text-foreground/60 text-xs">
        Currency:
      </span>
      <div className="flex gap-1 bg-card p-1 border border-border rounded-lg">
        {CURRENCIES.map((curr) => (
          <button
            key={curr.value}
            onClick={() => setCurrency(curr.value)}
            className={`px-3 py-1.5 text-xs font-mono font-semibold rounded transition-all duration-200 ${
              currency === curr.value
                ? "bg-accent text-accent-foreground shadow-sm"
                : "text-foreground/60 hover:text-foreground hover:bg-accent/10"
            }`}
          >
            <span className="hidden sm:inline">{curr.icon} </span>
            {curr.label}
          </button>
        ))}
      </div>
    </div>
  );
}
