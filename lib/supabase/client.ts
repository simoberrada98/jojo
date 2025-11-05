import { createBrowserClient } from '@supabase/ssr';
import { supabaseConfig } from './config';
import type { Database } from '@/types/supabase.types';

export function createClient() {
  return createBrowserClient<Database>(
    supabaseConfig.url,
    supabaseConfig.anonKey
  );
}
