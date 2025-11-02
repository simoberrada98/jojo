import useSWR from 'swr';
import type { DisplayProduct } from '@/types/product';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useProductsByCategory(category: string | null, limit: number = 4) {
  const { data, error, isLoading } = useSWR<{ results: DisplayProduct[] }>( 
    category ? `/api/products?category=${category}&limit=${limit}` : null,
    fetcher
  );

  return {
    products: data?.results,
    error,
    isLoading,
  };
}
