export type Product = {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  category: string;
  brand: string | null | undefined;
  tags: string[] | null;

  // Pricing
  base_price: number;
  compare_at_price: number | null;
  cost_price: number | null;

  // Mining-specific attributes
  hash_rate: string | null;
  power_consumption: string | null;
  algorithm: string | null | undefined;
  efficiency: string | null | undefined;

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

function normalizeStringArray(candidate: unknown): string[] {
  if (Array.isArray(candidate)) {
    return candidate
      .map((entry) => (typeof entry === 'string' ? entry.trim() : String(entry)))
      .filter((entry) => entry.length > 0);
  }

  if (typeof candidate === 'string') {
    const trimmed = candidate.trim();
    if (!trimmed) {
      return [];
    }

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed
          .map((entry) => (typeof entry === 'string' ? entry.trim() : String(entry)))
          .filter((entry) => entry.length > 0);
      }
    } catch {
      // Fall back to comma/pipe separated values
    }

    return trimmed
      .split(/[,|]/)
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0);
  }

  return [];
}

export interface DisplayProduct extends Product {
  handle: string;
  shortDescription?: string;
  priceUSD: number;
  compareAtPrice?: number;
  costPrice?: number | null;
  hashrate: string;
  power: string;


  image: string;
  images: string[];
  videoUrl?: string | null;
  model3dUrl?: string | null;
  stock: number;
  inStock: boolean;
  rating: number;
  reviewCount: number;
  specs: string[];
  features: string[];
  seo: {
    title?: string | null;
    description?: string | null;
    keywords: string[];
  };
  inventory: {
    trackInventory: boolean;
    quantity: number;
    lowStockThreshold: number;
    allowBackorder: boolean;
    status: 'in_stock' | 'low_stock' | 'backorder' | 'out_of_stock';
  };
  dimensions: {
    length: number | null;
    width: number | null;
    height: number | null;
    weight: number | null;
  };

  tags: string[];
  isFeatured?: boolean;
}

export function transformToDisplayProduct(
  dbProduct: Product,
  rating = 4.5,
  reviewCount = 0
): DisplayProduct {
  const images = normalizeStringArray(dbProduct.images as unknown);
  const tags = normalizeStringArray(dbProduct.tags as unknown);
  const metaKeywords = normalizeStringArray(dbProduct.meta_keywords as unknown);
  const featureMatches =
    dbProduct.description?.match(/<li>(.*?)<\/li>/gis)?.map((item) =>
      item
        .replace(/<\/?li>/gi, '')
        .replace(/<[^>]+>/g, '')
        .replace(/\s+/g, ' ')
        .trim()
    ) ?? [];
  const uniqueFeatures = Array.from(
    new Set(featureMatches.filter(Boolean))
  ) as string[];

  const inventoryStatus = (() => {
    if (!dbProduct.track_inventory) {
      return 'in_stock';
    }

    if ((dbProduct.stock_quantity ?? 0) <= 0) {
      return dbProduct.allow_backorder ? 'backorder' : 'out_of_stock';
    }

    if (
      (dbProduct.low_stock_threshold ?? 0) > 0 &&
      (dbProduct.stock_quantity ?? 0) <= (dbProduct.low_stock_threshold ?? 0)
    ) {
      return 'low_stock';
    }

    return 'in_stock';
  })();

  return {
    ...dbProduct,
    name: dbProduct.name,
    handle: dbProduct.slug,
    category: dbProduct.category,
    description: dbProduct.description || '',
    shortDescription: dbProduct.short_description || undefined,
    priceUSD: Number(dbProduct.base_price),
    compareAtPrice: dbProduct.compare_at_price
      ? Number(dbProduct.compare_at_price)
      : undefined,
    costPrice:
      dbProduct.cost_price !== null && dbProduct.cost_price !== undefined
        ? Number(dbProduct.cost_price)
        : null,
    hashrate: dbProduct.hash_rate || '',
    power: dbProduct.power_consumption || '',
    algorithm: dbProduct.algorithm || '',
    efficiency: dbProduct.efficiency || '',
    image: dbProduct.featured_image_url || '',
    images,
    videoUrl: dbProduct.video_url,
    model3dUrl: dbProduct.model_3d_url,
    stock: dbProduct.stock_quantity ?? 0,
    inStock:
      (dbProduct.stock_quantity ?? 0) > 0 || dbProduct.allow_backorder === true,
    rating,
    reviewCount: reviewCount,
    specs: [
      dbProduct.hash_rate && `Hash Rate: ${dbProduct.hash_rate}`,
      dbProduct.power_consumption && `Power: ${dbProduct.power_consumption}`,
      dbProduct.algorithm && `Algorithm: ${dbProduct.algorithm}`,
      dbProduct.efficiency && `Efficiency: ${dbProduct.efficiency}`,
      typeof dbProduct.weight === 'number' &&
        `Weight: ${dbProduct.weight} lbs`,
      dbProduct.dimensions_length !== null &&
        dbProduct.dimensions_width !== null &&
        dbProduct.dimensions_height !== null &&
        `Dimensions: ${dbProduct.dimensions_length} x ${dbProduct.dimensions_width} x ${dbProduct.dimensions_height} in`,
    ].filter(Boolean) as string[],
    features: uniqueFeatures,
    brand: dbProduct.brand,
    tags,
    isFeatured: dbProduct.is_featured || false,
    seo: {
      title: dbProduct.meta_title,
      description: dbProduct.meta_description,
      keywords: metaKeywords,
    },
    inventory: {
      trackInventory: dbProduct.track_inventory,
      quantity: dbProduct.stock_quantity ?? 0,
      lowStockThreshold: dbProduct.low_stock_threshold ?? 0,
      allowBackorder: dbProduct.allow_backorder,
      status: inventoryStatus,
    },
    dimensions: {
      length: dbProduct.dimensions_length,
      width: dbProduct.dimensions_width,
      height: dbProduct.dimensions_height,
      weight: dbProduct.weight,
    },
  };
}
