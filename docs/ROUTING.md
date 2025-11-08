# Routing and Redirects Overview

This document outlines current routing behaviors, redirects, and the fix applied to resolve unintended redirects to the homepage.

## Affected Routes and Prior Behavior

- `app/not-found.tsx`: Previously redirected all `notFound()` cases to `/`, causing:
  - Product pages with missing/invalid params to jump to home.
  - Any route that intentionally uses `notFound()` to incorrectly redirect instead of rendering a 404.

- `app/product/[id]/page.tsx`: Validates `id` and:
  - Calls `notFound()` if `id` is empty.
  - Redirects valid IDs to canonical product slugs at `/products/:slugOrId`.

- `proxy.ts` (edge middleware-like proxy):
  - Redirects `/shop` → `/collections/all`.
  - Redirects unauthenticated `'/dashboard'` requests → `/auth/login`.
  - Leaves normal product pages and other routes untouched.

- `next.config.ts`:
  - Redirects `/shop` → `/collections/all` (permanent).
  - Rewrites `/collections/all` → `/collections`.

## Root Cause

The custom `not-found` page was implemented as:

```ts
import { redirect } from 'next/navigation';

export default function NotFound() {
  redirect('/');
}
```

This caused every `notFound()` invocation to redirect users to the homepage, breaking user expectations and harming product page access.

## Fix Implemented

`app/not-found.tsx` now renders a proper 404 UI with a “Go back home” link, without automatic redirection:

```tsx
export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center px-6 py-12">
      <section className="max-w-xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Page Not Found</h1>
        <p className="mt-3 text-muted-foreground">
          The page you’re looking for doesn’t exist or may have moved.
        </p>
        <div className="mt-6">
          <a href="/" className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Go back home
          </a>
        </div>
      </section>
    </main>
  );
}
```

This preserves intended redirects (e.g., `/shop`, dashboard auth) and restores correct 404 handling.

## Tests Added

- `tests/not-found.test.tsx`: Verifies the 404 UI renders and includes a home link.
- `tests/product-id-page.test.ts`: Mocks `next/navigation` and asserts:
  - Valid IDs redirect to `/products/:id`.
  - Empty IDs trigger `notFound()`.
- `tests/proxy.test.ts`: Mocks Supabase SSR client and asserts:
  - `/shop` redirects to `/collections/all`.
  - Unauthenticated `/dashboard` redirects to `/auth/login`.
  - Product pages do not redirect.

## Expected Behaviors (Post-Fix)

- Product pages remain accessible; missing params show a proper 404.
- `/shop` continues to redirect to `/collections/all` (via both proxy and Next.js config).
- Unauthenticated dashboard access redirects to `/auth/login`.
- No unintended redirects to `/` occur due to `notFound()`.

## Operational Notes

- Dev server: `npm run dev`.
- Tests: `pnpm test` or `npm run test` after installing dev dependencies.

