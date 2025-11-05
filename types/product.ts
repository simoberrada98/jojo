import type { Tables } from './supabase.types';

export type Product = Tables<'products'>;
export type ProductVariant = Tables<'product_variants'>;
export type ProductOption = Tables<'product_options'>;
export type ProductOptionValue = Tables<'product_option_values'>;
export type Collection = Tables<'collections'>;
export type ProductCollection = Tables<'product_collections'>;
export type ProductReview = Tables<'product_reviews'>;

export type ProductWithRelations = Product & {
  variants?: ProductVariant[];
  options?: Array<ProductOption & { values?: ProductOptionValue[] }>;
  collections?: Collection[];
  reviews?: ProductReview[];
};

export type ProductWithExtras = ProductWithRelations & {
  display_price?: number;
  total_stock?: number;
  average_rating?: number;
  review_count?: number;
};

function normalizeStringArray(candidate: unknown): string[] {
  if (Array.isArray(candidate)) {
    return candidate
      .map((entry) =>
        typeof entry === 'string' ? entry.trim() : String(entry)
      )
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
          .map((entry) =>
            typeof entry === 'string' ? entry.trim() : String(entry)
          )
          .filter((entry) => entry.length > 0);
      }
    } catch {
      // ignore JSON parse errors and fall back to delimiter split
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
  rating = 0,
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
    compareAtPrice:
      dbProduct.compare_at_price !== null &&
      dbProduct.compare_at_price !== undefined
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
      (dbProduct.stock_quantity ?? 0) > 0 ||
      (dbProduct.allow_backorder ?? false),
    rating,
    reviewCount,
    specs: [
      dbProduct.hash_rate && `Hash Rate: ${dbProduct.hash_rate}`,
      dbProduct.power_consumption && `Power: ${dbProduct.power_consumption}`,
      dbProduct.algorithm && `Algorithm: ${dbProduct.algorithm}`,
      dbProduct.efficiency && `Efficiency: ${dbProduct.efficiency}`,
      typeof dbProduct.weight === 'number' && `Weight: ${dbProduct.weight} lbs`,
      dbProduct.dimensions_length !== null &&
        dbProduct.dimensions_width !== null &&
        dbProduct.dimensions_height !== null &&
        `Dimensions: ${dbProduct.dimensions_length} x ${dbProduct.dimensions_width} x ${dbProduct.dimensions_height} in`,
    ].filter(Boolean) as string[],
    features: uniqueFeatures,
    brand: dbProduct.brand,
    tags,
    isFeatured: dbProduct.is_featured ?? false,
    seo: {
      title: dbProduct.meta_title,
      description: dbProduct.meta_description,
      keywords: metaKeywords,
    },
    inventory: {
      trackInventory: dbProduct.track_inventory ?? false,
      quantity: dbProduct.stock_quantity ?? 0,
      lowStockThreshold: dbProduct.low_stock_threshold ?? 0,
      allowBackorder: dbProduct.allow_backorder ?? false,
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
