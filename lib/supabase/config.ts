import { env } from "@/lib/env";

/**
 * Supabase configuration
 * Centralized configuration for Supabase clients
 */
export const supabaseConfig = {
  url: env.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
} as const;

/**
 * Validate Supabase configuration
 */
export function validateSupabaseConfig(): boolean {
  return !!(supabaseConfig.url && supabaseConfig.anonKey);
}
