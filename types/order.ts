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
  user_id: string;
  status: string; // The DB stores this as string, not enum
  total_amount: number;
  currency: string;
  shipping_address: Json | null;
  billing_address: Json | null;
  payment_method: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItemRecord[]; // Not a DB column, only for query results
}

export type OrderRecordInsert = Omit<OrderRecord, 'id' | 'created_at' | 'updated_at' | 'order_items'> & {
  created_at?: string;
  updated_at?: string;
  order_items?: OrderItemRecord[]; // Optional for convenience, but not inserted directly
};

export type OrderRecordUpdate = Partial<Omit<OrderRecord, 'id' | 'created_at' | 'order_items'> & {
  updated_at?: string;
}>;
