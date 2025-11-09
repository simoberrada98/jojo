import { logger } from '@/lib/utils/logger';

export const ALLOWED_TRACKING_PARAMS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'campaign_id',
  'ref',
  'gclid',
  'fbclid',
  'msclkid',
  'source',
]);

export type NormalizationResult = {
  slug: string | null;
  canonicalPath: string | null;
  preservedParams: URLSearchParams;
  hasExtraSegments: boolean;
  isCanonical: boolean;
  invalidSegments: string[];
  reasons: string[];
};

/**
 * Sanitize a candidate slug string: trim, normalize unicode, remove spaces, lowercase.
 */
export function sanitizeSlug(candidate: string): string {
  const normalized = candidate
    .normalize('NFKC')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();
  return normalized;
}

/**
 * Extract allowed tracking parameters from a URLSearchParams.
 */
export function extractTrackingParams(qp: URLSearchParams): URLSearchParams {
  const out = new URLSearchParams();
  for (const [key, value] of qp.entries()) {
    if (ALLOWED_TRACKING_PARAMS.has(key) || key.startsWith('utm_')) {
      out.set(key, value);
    }
  }
  return out;
}

/**
 * Normalize product path segments and query params.
 *
 * - Accepts any number of path segments after /products.
 * - First segment is treated as slug; others are considered invalid and cause canonicalization.
 * - Returns canonical path and preserved tracking query params.
 */
export function normalizeProductUrl(
  pathSegments: string[],
  qp: URLSearchParams
): NormalizationResult {
  const reasons: string[] = [];
  const invalidSegments: string[] = [];
  let hasExtraSegments = false;

  if (pathSegments.length === 0) {
    return {
      slug: null,
      canonicalPath: null,
      preservedParams: extractTrackingParams(qp),
      hasExtraSegments: false,
      isCanonical: true,
      invalidSegments,
      reasons,
    };
  }

  const [rawSlug, ...rest] = pathSegments;
  const slug = sanitizeSlug(decodeURIComponent(rawSlug || ''));

  // Detect and note invalid segments
  if (rest.length > 0) {
    hasExtraSegments = true;
    invalidSegments.push(...rest);
    reasons.push('extra_segments');
  }

  if (!rawSlug || rawSlug !== slug) {
    reasons.push('slug_sanitized');
  }

  const preservedParams = extractTrackingParams(qp);
  const canonicalPath = `/products/${encodeURIComponent(slug)}`;
  const isCanonical = !hasExtraSegments && rawSlug === slug;

  return {
    slug,
    canonicalPath,
    preservedParams,
    hasExtraSegments,
    isCanonical,
    invalidSegments,
    reasons,
  };
}

/**
 * Utility to build a URL string with preserved params.
 */
export function buildCanonicalUrl(
  base: string,
  canonicalPath: string,
  params: URLSearchParams
): string {
  const url = new URL(base);
  url.pathname = canonicalPath;
  // Clear and set only preserved params
  url.search = '';
  for (const [k, v] of params.entries()) {
    url.searchParams.set(k, v);
  }
  return url.toString();
}

/**
 * Log helpers for URL handling.
 */
export function logInvalidUrlPattern(details: {
  path: string;
  invalidSegments: string[];
  reasons: string[];
}) {
  try {
    logger?.warn?.('URL normalization: invalid pattern', details);
  } catch {}
}

export function logCampaignParams(details: Record<string, unknown>) {
  try {
    logger?.info?.('URL normalization: campaign params', details);
  } catch {}
}

export function logRedirect(details: {
  from: string;
  to: string;
  status: 301 | 302;
  reasons: string[];
}) {
  try {
    logger?.info?.('URL normalization: redirect', details);
  } catch {}
}
