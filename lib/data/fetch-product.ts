import { createClient } from '@/lib/supabase/server';
import { transformToDisplayProduct, type Product, type DisplayProduct } from '@/types/product';
import { logger } from '@/lib/utils/logger';

/**
 * Fetch product ratings from reviews
 */
async function getProductRatings(productIds: string[]) {
  if (productIds.length === 0) {
    return new Map<string, { avg: number; count: number }>();
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('product_reviews')
    .select('product_id, rating')
    .in('product_id', productIds)
    .eq('is_approved', true);

  const map = new Map<string, { sum: number; count: number }>();
  
  if (!error && data) {
    for (const row of data as Array<{ product_id: string; rating: number }>) {
      const pid = row.product_id;
      const entry = map.get(pid) || { sum: 0, count: 0 };
      entry.sum += Number(row.rating || 0);
      entry.count += 1;
      map.set(pid, entry);
    }
  }

  const result = new Map<string, { avg: number; count: number }>();
  for (const [pid, { sum, count }] of map.entries()) {
    result.set(pid, { avg: count > 0 ? sum / count : 0, count });
  }

  return result;
}

/**
 * Fetch a single product by handle/slug for server-side rendering
 */
export async function fetchProductByHandle(
  handle: string
): Promise<DisplayProduct | null> {
  try {
    const supabase = await createClient();

    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', handle)
      .eq('is_active', true)
      .eq('is_archived', false)
      .single();

    if (error || !product) {
      logger.warn(`Product not found: ${handle}`, error);
      return null;
    }

    const ratings = await getProductRatings([(product as Product).id as string]);
    const pid = (product as Product).id as string;
    const meta = ratings.get(pid) || { avg: 0, count: 0 };

    return transformToDisplayProduct(product as Product, meta.avg, meta.count);
  } catch (error) {
    logger.error('Failed to fetch product by handle', error, { handle });
    return null;
  }
}

/**
 * Fetch a single product by ID for server-side rendering
 */
export async function fetchProductById(
  id: string
): Promise<DisplayProduct | null> {
  try {
    const supabase = await createClient();

    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .eq('is_archived', false)
      .single();

    if (error || !product) {
      logger.warn(`Product not found: ${id}`, error);
      return null;
    }

    const ratings = await getProductRatings([(product as Product).id as string]);
    const pid = (product as Product).id as string;
    const meta = ratings.get(pid) || { avg: 0, count: 0 };

    return transformToDisplayProduct(product as Product, meta.avg, meta.count);
  } catch (error) {
    logger.error('Failed to fetch product by ID', error, { id });
    return null;
  }
}

/**
 * Fetch multiple products for lists/collections
 */
export async function fetchProducts(options: {
  category?: string;
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<{
  products: DisplayProduct[];
  total: number;
}> {
  try {
    const supabase = await createClient();
    const { category, limit = 20, offset = 0, search } = options;

    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .eq('is_archived', false);

    if (category) {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,description.ilike.%${search}%,category.ilike.%${search}%`
      );
    }

    query = query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    const { data: products, error, count } = await query;

    if (error) {
      throw error;
    }

    const productIds = (products || []).map((p: Product) => p.id as string);
    const ratings = await getProductRatings(productIds);

    const results = (products || []).map((p) => {
      const meta = ratings.get((p as Product).id as string) || { avg: 0, count: 0 };
      return transformToDisplayProduct(p as Product, meta.avg, meta.count);
    });

    return {
      products: results,
      total: count || 0,
    };
  } catch (error) {
    logger.error('Failed to fetch products', error, options);
    return {
      products: [],
      total: 0,
    };
  }
}
