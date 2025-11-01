import type { CheckoutData } from '@/types/payment';

export interface OrderData {
  items: any[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
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

export function prepareCheckoutData(
  orderData: OrderData,
  currency: string,
  includeCustomerInfo: boolean
): CheckoutData {
  const checkoutData: CheckoutData = {
    items: orderData.items.map((item) => ({
      id: item.id || `item-${Math.random()}`,
      name: item.name || 'Product',
      description: item.description,
      quantity: item.quantity || 1,
      unitPrice: item.price || 0,
      total: (item.price || 0) * (item.quantity || 1),
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
