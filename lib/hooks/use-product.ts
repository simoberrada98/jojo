import useSWR from 'swr';
import { useMemo } from 'react';
import type { DisplayProduct } from '@/types/product';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useProduct(id: string | null) {
  const isNumericId = id ? /^\d+$/.test(id) : false;
  const queryParam = isNumericId ? `id=${id}` : `handle=${id}`;
  const { data, error, isLoading } = useSWR<DisplayProduct>(
    id ? `/api/products?${queryParam}` : null,
    fetcher
  );

  // Lightweight runtime normalization to keep UI resilient
  const product = useMemo<DisplayProduct | undefined>(() => {
    if (!data) return data;
    const specs = Array.isArray(data.specs)
      ? data.specs
      : ([] as DisplayProduct['specs']);
    const features = Array.isArray(data.features)
      ? data.features
      : ([] as DisplayProduct['features']);
    return {
      ...data,
      specs,
      features,
    };
  }, [data]);

  return {
    product,
    error,
    isLoading,
  };
}
