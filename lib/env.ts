import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Server-side environment variables
   * Never exposed to the client
   */
  server: {
    // Supabase
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    
    // HoodPay
    HOODPAY_API_KEY: z.string().optional(),
    HOODPAY_BUSINESS_ID: z.string().optional(),
    HOODPAY_WEBHOOK_SECRET: z.string().optional(),
    
    // Node Environment
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  },

  /**
   * Client-side environment variables
   * Exposed to the browser, must be prefixed with NEXT_PUBLIC_
   */
  client: {
    // Supabase
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
    
    // App Configuration
    NEXT_PUBLIC_BASE_URL: z.string().url().default("https://jhuangnyc.com"),
    NEXT_PUBLIC_APP_NAME: z.string().default("Jhuangnyc"),
    
    // Feature Flags
    NEXT_PUBLIC_ENABLE_HOODPAY: z.string().transform(val => val === "true").default("false"),
    NEXT_PUBLIC_ENABLE_WEB_PAYMENT_API: z.string().transform(val => val === "true").default("false"),
    // Verification
    NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION: z.string().optional(),
  },

  /**
   * Runtime environment variables mapping
   * You can't destruct `process.env` as a regular object in Next.js edge runtime,
   * so we need to destruct manually.
   */
  runtimeEnv: {
    // Server
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    HOODPAY_API_KEY: process.env.HOODPAY_API_KEY,
    HOODPAY_BUSINESS_ID: process.env.HOODPAY_BUSINESS_ID,
    HOODPAY_WEBHOOK_SECRET: process.env.HOODPAY_WEBHOOK_SECRET,
    NODE_ENV: process.env.NODE_ENV,
    
    // Client
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_ENABLE_HOODPAY: process.env.NEXT_PUBLIC_ENABLE_HOODPAY,
    NEXT_PUBLIC_ENABLE_WEB_PAYMENT_API: process.env.NEXT_PUBLIC_ENABLE_WEB_PAYMENT_API,
    NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },

  /**
   * Skip validation in build for Docker builds etc.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,

  /**
   * Makes it so that empty strings are treated as undefined.
   * `SOME_VAR: z.string()` and `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
