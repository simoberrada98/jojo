import type { CheckoutData } from '@/types/payment';
import type { CartItem } from '@/types/cart';

export interface OrderData {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  orderId: string;
  shippingData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export type OrderReviewData = Omit<OrderData, 'shippingData'>;

export function prepareCheckoutData(
  orderData: OrderData,
  currency: string,
  includeCustomerInfo: boolean
): CheckoutData {
  const checkoutData: CheckoutData = {
    items: orderData.items.map((item, index) => ({
      id: item.id ?? `item-${index}`,
      name: item.name ?? 'Product',
      description: item.description ?? undefined,
      quantity: item.quantity ?? 1,
      unitPrice: item.priceUSD ?? 0,
      total: (item.priceUSD ?? 0) * (item.quantity ?? 1),
    })),
    subtotal: orderData.subtotal,
    tax: orderData.tax,
    shipping: orderData.shipping,
    total: orderData.total,
    currency: currency,
  };

  if (includeCustomerInfo) {
    checkoutData.customerInfo = {
      email: orderData.shippingData.email,
      name: `${orderData.shippingData.firstName} ${orderData.shippingData.lastName}`,
      phone: orderData.shippingData.phone,
      address: {
        line1: orderData.shippingData.address,
        city: orderData.shippingData.city,
        state: orderData.shippingData.state,
        postalCode: orderData.shippingData.zipCode,
        country: orderData.shippingData.country,
      },
    };
  }

  return checkoutData;
}
