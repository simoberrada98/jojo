import useSWR from 'swr';
import type { DisplayProduct } from '@/types/product';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useProduct(id: string | null) {
  const isNumericId = id ? /^\d+$/.test(id) : false;
  const queryParam = isNumericId ? `id=${id}` : `handle=${id}`;
  const { data, error, isLoading } = useSWR<DisplayProduct>(
    id ? `/api/products?${queryParam}` : null,
    fetcher
  );

  return {
    product: data,
    error,
    isLoading,
  };
}
