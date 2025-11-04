import 'server-only';

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { supabaseConfig } from '@/lib/supabase/config';
import { env } from '@/lib/config/env';
import { logger } from '@/lib/utils/logger';
import type { CheckoutData, PaymentRecord } from '@/types/payment';

type RpcOrderItem = {
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
};

export class OrderDbService {
  private client: SupabaseClient;

  constructor(supabaseUrl?: string, serviceKey?: string) {
    const url = supabaseUrl || supabaseConfig.url;
    const key = serviceKey || env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('Supabase credentials are required');
    this.client = createClient(url, key);
  }

  private buildOrderItems(checkout: CheckoutData | undefined): RpcOrderItem[] {
    const items = checkout?.items ?? [];
    return items.map((i) => ({
      product_id: String(i.id),
      quantity: Number(i.quantity ?? 1),
      unit_price: Number(
        i.unitPrice ?? (i.total && i.quantity ? i.total / i.quantity : 0)
      ),
      total_price: Number(i.total ?? 0),
    }));
  }

  async createOrderFromPayment(
    userId: string,
    payment: PaymentRecord
  ): Promise<{ id: string } | null> {
    const checkout = payment.checkout_data as CheckoutData | undefined;
    if (!checkout) {
      logger?.warn?.('Missing checkout_data on payment; cannot create order', {
        paymentId: payment.id,
        hp_payment_id: payment.hp_payment_id,
      });
      return null;
    }

    const orderItems = this.buildOrderItems(checkout);
    if (orderItems.length === 0) {
      logger?.warn?.('No items found in checkout_data; cannot create order', {
        paymentId: payment.id,
      });
      return null;
    }

    const shipping_address = checkout.customerInfo?.address
      ? {
          line1: checkout.customerInfo.address.line1,
          line2: checkout.customerInfo.address.line2 ?? null,
          city: checkout.customerInfo.address.city,
          state: checkout.customerInfo.address.state ?? null,
          postalCode: checkout.customerInfo.address.postalCode,
          country: checkout.customerInfo.address.country,
          name: checkout.customerInfo.name ?? null,
          email: checkout.customerInfo.email ?? null,
          phone: checkout.customerInfo.phone ?? null,
        }
      : null;

    const { data, error } = await this.client.rpc('create_new_order', {
      p_user_id: userId,
      p_total_amount: checkout.total ?? payment.amount,
      p_currency: checkout.currency ?? payment.currency,
      p_shipping_address: shipping_address,
      p_billing_address: shipping_address, // mirror shipping for now
      p_payment_method: payment.method ?? 'hoodpay',
      p_order_items: orderItems as unknown as Record<string, unknown>[],
    });

    if (error) {
      logger?.error?.('Failed to create order via RPC', error, {
        userId,
        paymentId: payment.id,
      });
      return null;
    }

    return (data as { id: string } | null) ?? null;
  }
}

export function createOrderDbService(
  supabaseUrl?: string,
  serviceKey?: string
): OrderDbService {
  return new OrderDbService(supabaseUrl, serviceKey);
}
