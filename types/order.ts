import type { Json } from './supabase.types';

export enum OrderStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  REFUNDED = 'REFUNDED',
}

export interface OrderItemRecord {
  id?: string;
  order_id?: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at?: string;
  updated_at?: string;
}

export interface OrderRecord {
  id: string;
  user_id: string | null;
  status: OrderStatus;
  total_amount: number;
  currency: string;
  shipping_address: Json | null;
  billing_address: Json | null;
  payment_method: string | null;
  metadata: Json | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  order_items?: OrderItemRecord[];
}

export type OrderRecordInsert = Omit<OrderRecord, 'id' | 'created_at' | 'updated_at'> & {
  created_at?: string;
  updated_at?: string;
};

export type OrderRecordUpdate = Partial<Omit<OrderRecord, 'id' | 'created_at'> & {
  updated_at?: string;
}>;
