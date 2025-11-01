export type Product = {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  category: string;
  brand: string | null;
  tags: string[] | null;

  // Pricing
  base_price: number;
  compare_at_price: number | null;
  cost_price: number | null;

  // Mining-specific attributes
  hash_rate: string | null;
  power_consumption: string | null;
  algorithm: string | null;
  efficiency: string | null;

  // Physical attributes
  weight: number | null;
  dimensions_length: number | null;
  dimensions_width: number | null;
  dimensions_height: number | null;

  // Media
  featured_image_url: string | null;
  images: string[] | null;
  video_url: string | null;
  model_3d_url: string | null;

  // Inventory
  track_inventory: boolean;
  stock_quantity: number;
  low_stock_threshold: number;
  allow_backorder: boolean;

  // SEO
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string[] | null;

  // Status
  is_featured: boolean;
  is_active: boolean;
  is_archived: boolean;
  published_at: string | null;

  // Timestamps
  created_at: string;
  updated_at: string;

  // Relations
  variants?: ProductVariant[];
  options?: ProductOption[];
  collections?: Collection[];
  reviews?: ProductReview[];
};

export type ProductVariant = {
  id: string;
  product_id: string;
  sku: string;
  name: string;
  price: number | null;
  compare_at_price: number | null;
  cost_price: number | null;
  options: Record<string, string> | null;
  weight: number | null;
  dimensions_length: number | null;
  dimensions_width: number | null;
  dimensions_height: number | null;
  image_url: string | null;
  images: string[] | null;
  stock_quantity: number;
  low_stock_threshold: number;
  allow_backorder: boolean;
  is_active: boolean;
  position: number;
  created_at: string;
  updated_at: string;
};

export type ProductOption = {
  id: string;
  product_id: string;
  name: string;
  display_name: string;
  type: 'select' | 'radio' | 'swatch' | 'button';
  position: number;
  required: boolean;
  created_at: string;
  values?: ProductOptionValue[];
};

export type ProductOptionValue = {
  id: string;
  option_id: string;
  value: string;
  display_value: string | null;
  color_hex: string | null;
  image_url: string | null;
  position: number;
  is_available: boolean;
  created_at: string;
};

export type Collection = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_featured: boolean;
  position: number;
  created_at: string;
  updated_at: string;
};

export type ProductCollection = {
  id: string;
  product_id: string;
  collection_id: string;
  position: number;
  created_at: string;
  collection?: Collection;
};

export type ProductReview = {
  id: string;
  product_id: string;
  user_id: string | null;
  rating: number;
  title: string | null;
  comment: string | null;
  is_verified_purchase: boolean;
  is_approved: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
  user?: {
    full_name: string | null;
    avatar_url: string | null;
  };
};

export type ProductWithExtras = Product & {
  display_price?: number;
  total_stock?: number;
  average_rating?: number;
  review_count?: number;
};

export interface DisplayProduct {
  id: string | number;
  name: string;
  handle: string;
  category: string;
  description: string;
  shortDescription?: string;
  priceUSD: number;
  compareAtPrice?: number;
  hashrate: string;
  power: string;
  algorithm?: string;
  efficiency?: string;
  image: string;
  images: string[];
  model3dUrl?: string;
  stock: number;
  inStock: boolean;
  rating: number;
  reviews: number;
  specs: string[];
  features: string[];
  brand?: string;
  tags: string[];
  isFeatured?: boolean;
}

export function transformToDisplayProduct(
  dbProduct: Product,
  rating = 4.5,
  reviewCount = 0
): DisplayProduct {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    handle: dbProduct.slug,
    category: dbProduct.category,
    description: dbProduct.description || '',
    shortDescription: dbProduct.short_description || '',
    priceUSD: Number(dbProduct.base_price),
    compareAtPrice: dbProduct.compare_at_price
      ? Number(dbProduct.compare_at_price)
      : undefined,
    hashrate: dbProduct.hash_rate || '',
    power: dbProduct.power_consumption || '',
    algorithm: dbProduct.algorithm || '',
    efficiency: dbProduct.efficiency || '',
    image: dbProduct.featured_image_url || '',
    images: dbProduct.images || [],
    model3dUrl: dbProduct.model_3d_url || undefined,
    stock: dbProduct.stock_quantity || 0,
    inStock: (dbProduct.stock_quantity || 0) > 0,
    rating,
    reviews: reviewCount,
    specs: [
      dbProduct.hash_rate && `Hash Rate: ${dbProduct.hash_rate}`,
      dbProduct.power_consumption && `Power: ${dbProduct.power_consumption}`,
      dbProduct.algorithm && `Algorithm: ${dbProduct.algorithm}`,
      dbProduct.efficiency && `Efficiency: ${dbProduct.efficiency}`,
    ].filter(Boolean) as string[],
    features: [],
    brand: dbProduct.brand || '',
    tags: dbProduct.tags || [],
    isFeatured: dbProduct.is_featured || false,
  };
}
