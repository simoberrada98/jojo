import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { P, H3 } from '@/components/ui/typography';
import type { CartItem as CartRow, Product } from '@/types/database';
import { Minus, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import type { ChangeEvent } from 'react';

type CartEntry = CartRow & { product: Product | null };

interface CartItemProps {
  item: CartEntry;
  onQuantityChange: (cartItemId: string, quantity: number) => void | Promise<void>;
  onRemove: (cartItemId: string) => void | Promise<void>;
  formatAmount: (value: number) => string;
}

export function CartItem({
  item,
  onQuantityChange,
  onRemove,
  formatAmount,
}: CartItemProps) {
  const productImage =
    item.product?.featured_image_url ??
    item.product?.images?.[0] ??
    null;
  const unitPrice = item.product?.base_price ?? 0;

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = parseInt(event.target.value, 10);
    onQuantityChange(item.id, Number.isNaN(nextValue) ? 1 : nextValue);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex gap-4">
          {productImage && (
            <Image
              src={productImage}
              alt={item.product?.name || 'Product image'}
              width={96}
              height={96}
              className="rounded-lg object-cover"
            />
          )}
          <div className="flex-1">
            <H3 className="mb-1 font-semibold text-lg">
              {item.product?.name ?? 'Unnamed product'}
            </H3>
            <P className="mb-2 text-muted-foreground">
              {formatAmount(unitPrice)}
            </P>
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="outline"
                onClick={() => onQuantityChange(item.id, item.quantity - 1)}
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Input
                type="number"
                value={item.quantity}
                onChange={handleInputChange}
                className="w-20 text-center"
                min="1"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="text-right">
            <P className="mb-2 font-bold text-xl">
              {formatAmount(unitPrice * item.quantity)}
            </P>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemove(item.id)}
              aria-label="Remove item"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
