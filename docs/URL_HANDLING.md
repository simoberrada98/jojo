# URL Handling for Product Detail Pages

This document explains how product URLs are normalized, how tracking parameters are handled, and how redirects are issued to preserve SEO and support marketing campaigns.

## Overview

- Canonical product URL: `/products/<slug>`
- Legacy path `/product/<id>` is redirected to `/products/<slug>`
- Tracking parameters are preserved for campaigns (e.g., `utm_source`, `campaign_id`)
- Malformed path segments are removed via redirect to maintain clean URLs
- Removed or inactive products return HTTP `410 Gone`

## For Marketing Teams

- Use tracking parameters in the query string only:
  - Allowed keys include: `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `campaign_id`, `ref`, `gclid`, `fbclid`, `msclkid`, `source`.
  - Any key starting with `utm_` is preserved.
- Example valid tracking URL:
  - `/products/acme-widget?utm_source=newsletter&utm_campaign=spring&campaign_id=42`
- Avoid adding additional path segments after the slug (e.g., `/products/acme-widget/random-string`). These will be removed by a redirect to the canonical URL.

## For Support Teams

- Symptoms of malformed URLs:
  - Extra path segments like `/products/<slug>/random/extra` → redirected to `/products/<slug>`.
  - Slugs with uppercase or spaces → sanitized and redirected to lowercase-dashed form.
  - Unknown query parameters → dropped during redirect; allowed tracking params are preserved.
- Status codes:
  - `301` when the path is canonicalized (e.g., removing extra segments or sanitizing slug).
  - `302` when only query parameters are cleaned (e.g., removing unsupported keys).
  - `410` for removed or inactive products.
- Logging:
  - Invalid URL patterns and campaign parameters are logged.
  - Redirect events record the source URL, target URL, status code, and reasons.

## For Engineering Teams

### Implementation

- Middleware (`middleware.ts`):
  - Matches `/products/:path*` and `/product/:path*`.
  - Normalizes paths via `normalizeProductUrl()`.
  - Preserves allowed tracking params; drops others.
  - Queries Supabase (`products` table) by `slug` to return `410` for removed/inactive products.
  - Issues `301` for structural canonicalization and `302` for query-only cleanup.

- Utilities (`lib/url/product-url.ts`):
  - `sanitizeSlug(candidate)` trims, normalizes, and lowercases slugs.
  - `extractTrackingParams(searchParams)` filters to allowed tracking keys.
  - `normalizeProductUrl(segments, searchParams)` returns canonical path and reasons.
  - Logging helpers emit structured logs for invalid patterns, campaigns, and redirects.

### Tests

- Vitest suite: `tests/url-handling.test.ts` covers:
  - Tracking parameter preservation and dropping invalid keys.
  - Extra path segments and canonicalization.
  - Special character normalization and mixed case.
  - Long query and path strings.

### Notes

- If canonical metadata requires refinement, ensure `generateMetadata` uses the normalized slug and base URL, and consider adding a `link[rel="canonical"]` in the product page.
- The middleware performs a lightweight Supabase check; if unavailable, it falls through without blocking access.

