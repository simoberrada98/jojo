export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
};

export type Address = {
  id: string;
  user_id: string;
  label: string;
  full_name: string;
  phone: string | null;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock_quantity: number;
  category: string;
  hash_rate: string | null;
  power_consumption: string | null;
  image_url: string | null;
  model_3d_url: string | null;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type WishlistItem = {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
};

export type CartItem = {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  product?: Product;
};

export type Order = {
  id: string;
  user_id: string | null;
  order_number: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  payment_status: "pending" | "completed" | "failed" | "refunded";
  payment_method: string | null;
  payment_transaction_id: string | null;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  crypto_currency: string | null;
  crypto_amount: number | null;
  shipping_address_id: string | null;
  billing_address_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
  shipping_address?: Address;
  billing_address?: Address;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_price: number;
  quantity: number;
  subtotal: number;
  created_at: string;
};

export type PaymentMethod = {
  id: string;
  user_id: string;
  type: "crypto_wallet" | "card";
  label: string;
  crypto_address: string | null;
  crypto_currency: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
};
