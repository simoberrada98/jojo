import type { Json } from '@/types/supabase.types';

export const toJson = (value: unknown): Json => {
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value as Json;
  }

  try {
    return JSON.parse(JSON.stringify(value ?? null)) as Json;
  } catch {
    return String(value ?? '') as Json;
  }
};
