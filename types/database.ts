import type { Tables } from './supabase.types';

export type Profile = Tables<'profiles'>;
export type Address = Tables<'addresses'>;
export type Product = Tables<'products'>;
export type WishlistItem = Tables<'wishlist'>;
export type CartItem = Tables<'cart'>;
export type Order = Tables<'orders'>;
export type OrderItem = Tables<'order_items'>;
export type PaymentMethod = Tables<'payment_methods'>;
