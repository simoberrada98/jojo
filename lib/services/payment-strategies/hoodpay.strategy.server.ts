
import 'server-only'
import { paymentServerConfig } from '@/lib/config/payment.config.server'

export async function createHoodpayPaymentSession(input: {
  amount: number
  currency: string
  metadata?: Record<string, string>
}) {
  const { apiKey, businessId } = paymentServerConfig.hoodpay
  // … call HoodPay REST using apiKey/businessId
  // return session info for client redirect
}
