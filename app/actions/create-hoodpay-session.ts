// app/actions/create-hoodpay-session.ts
'use server'
import 'server-only'
import { createHoodpayPaymentSession } from '@/lib/services/payment-strategies/hoodpay.strategy.server'

export async function createHoodpaySessionAction(input: {
  amount: number
  currency: string
  metadata?: Record<string, string>
}) {
  return await createHoodpayPaymentSession(input)
}
