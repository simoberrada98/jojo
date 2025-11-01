import { env } from '@/lib/config/env';

/**
 * Supabase configuration
 * Centralized configuration for Supabase clients
 */
export const supabaseConfig = {
  url: env.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
} as const;

/**
 * Validate Supabase configuration
 */
export function validateSupabaseConfig(): boolean {
  return !!(supabaseConfig.url && supabaseConfig.anonKey);
}
