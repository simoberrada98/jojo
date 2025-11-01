import { env } from '@/lib/config/env';
import { supabaseConfig } from './config';

/**
 * Server-only Supabase configuration
 * This should only be imported in server-side code (Server Components, Server Actions, Route Handlers)
 * DO NOT import this in Client Components
 */
export const supabaseServerConfig = {
  ...supabaseConfig,
  serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
} as const;
