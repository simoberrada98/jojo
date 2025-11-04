import crypto from 'crypto';

/**
 * Verify HMAC SHA256 signature from HoodPay webhook payload.
 *
 * Implementation notes:
 * - Supports common header formats: raw hex/base64 or with a `sha256=` prefix.
 * - Computes both hex and base64 digests and compares using timingSafeEqual.
 * - Does NOT assume timestamped schemas; if HoodPay adds timestamps later,
 *   this function remains backward compatible.
 */
export function verifyHoodpaySignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): boolean {
  if (!signature || !secret) return false;

  try {
    const body = typeof payload === 'string' ? payload : payload.toString();

    // Normalize signature (strip optional algo prefix like "sha256=")
    const sig = signature.trim().toLowerCase().startsWith('sha256=')
      ? signature.trim().slice('sha256='.length)
      : signature.trim();

    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(body);
    const expectedHex = hmac.digest('hex');

    // Also compute base64 for robustness against different transports
    const hmac2 = crypto.createHmac('sha256', secret);
    hmac2.update(body);
    const expectedB64 = hmac2.digest('base64');

    // Try constant-time compare against hex first
    const safeEq = (a: string, b: string, encoding: BufferEncoding) => {
      try {
        const ab = Buffer.from(a, encoding);
        const bb = Buffer.from(b, encoding);
        if (ab.length !== bb.length) return false;
        return crypto.timingSafeEqual(ab, bb);
      } catch {
        return false;
      }
    };

    return (
      safeEq(sig, expectedHex, 'hex') ||
      safeEq(sig, expectedB64, 'utf8') // header may already be raw b64 text
    );
  } catch {
    return false;
  }
}
