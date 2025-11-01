'use client';
import { env } from './env';

export const paymentClientConfig = {
  enableHoodpay: env.NEXT_PUBLIC_ENABLE_HOODPAY,
  baseUrl: env.NEXT_PUBLIC_BASE_URL,
  appName: env.NEXT_PUBLIC_APP_NAME,
} as const;
