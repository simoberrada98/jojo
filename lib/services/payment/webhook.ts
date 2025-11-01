import crypto from 'crypto'

/**
 * Verify HMAC SHA256 signature from HoodPay webhook payload.
 * Uses constant-time comparison to avoid timing attacks.
 */
export function verifyHoodpaySignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): boolean {
  if (!signature || !secret) {
    return false
  }

  try {
    const hmac = crypto.createHmac('sha256', secret)
    hmac.update(typeof payload === 'string' ? payload : payload.toString())
    const computed = hmac.digest('hex')
    const receivedBuffer = Buffer.from(signature, 'hex')
    const expectedBuffer = Buffer.from(computed, 'hex')

    return crypto.timingSafeEqual(receivedBuffer, expectedBuffer)
  } catch {
    return false
  }
}
