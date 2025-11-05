'use server';
import 'server-only';

import { headers } from 'next/headers';
import { z } from 'zod';

import { createHoodpayPaymentSession } from '@/lib/services/payment-strategies/hoodpay.strategy.server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';

const PayloadSchema = z.object({
  cartId: z.string().min(1).optional(),
  amount: z.number().positive(),
  currency: z.string().min(3),
  metadata: z
    .object({
      items: z
        .array(
          z.object({
            id: z.union([z.string(), z.number()]).optional(),
            name: z.string().optional(),
            description: z.string().optional(),
            quantity: z.union([z.number(), z.string()]).optional(),
            total: z.union([z.number(), z.string()]).optional(),
            unitPrice: z.union([z.number(), z.string()]).optional(),
          })
        )
        .optional(),
      totals: z
        .object({
          subtotal: z.union([z.number(), z.string()]).optional(),
          tax: z.union([z.number(), z.string()]).optional(),
          shipping: z.union([z.number(), z.string()]).optional(),
          total: z.union([z.number(), z.string()]).optional(),
        })
        .optional(),
      customerInfo: z
        .object({
          email: z.string().email().optional(),
          name: z.string().optional(),
          phone: z.string().optional(),
          address: z
            .object({
              line1: z.string().optional(),
              line2: z.string().optional(),
              city: z.string().optional(),
              state: z.string().optional(),
              postalCode: z.string().optional(),
              country: z.string().optional(),
            })
            .optional(),
        })
        .optional(),
    })
    .catchall(z.unknown())
    .optional(),
  customer: z
    .object({
      email: z.string().email().optional(),
    })
    .optional(),
});

type CreateHoodpaySessionPayload = z.infer<typeof PayloadSchema>;

export async function createHoodpaySessionAction(input: unknown) {
  const payload = PayloadSchema.parse(input) as CreateHoodpaySessionPayload;

  const requestHeaders = await headers();
  const ip = requestHeaders.get('x-forwarded-for') ?? undefined;
  const userAgent = requestHeaders.get('user-agent') ?? undefined;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  try {
    const session = await createHoodpayPaymentSession({
      payload,
      user,
      ip,
      userAgent,
    });

    return {
      checkoutUrl: session.checkoutUrl,
      id: session.id ?? null,
    };
  } catch (error) {
    logger.error('Failed to create Hoodpay payment session', error as Error, {
      cartId: payload.cartId,
    });
    throw error;
  }
}
