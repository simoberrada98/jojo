import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface OrderSummaryCopy {
  title: string;
  subtotalLabel: string;
  shippingLabel: string;
  totalLabel: string;
  checkoutCta: string;
}

interface OrderSummaryProps {
  subtotal: number;
  total: number;
  shippingAmount?: number;
  copy: OrderSummaryCopy;
  formatAmount: (value: number) => string;
  onCheckout?: () => void;
}

export function OrderSummary({
  subtotal,
  total,
  shippingAmount = 0,
  copy,
  formatAmount,
  onCheckout,
}: OrderSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between">
          <span>{copy.subtotalLabel}</span>
          <span>{formatAmount(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>{copy.shippingLabel}</span>
          <span>{formatAmount(shippingAmount)}</span>
        </div>
        <div className="mt-2 pt-2 border-t">
          <div className="flex justify-between font-bold text-lg">
            <span>{copy.totalLabel}</span>
            <span>{formatAmount(total)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" size="lg" onClick={onCheckout}>
          {copy.checkoutCta}
        </Button>
      </CardFooter>
    </Card>
  );
}
