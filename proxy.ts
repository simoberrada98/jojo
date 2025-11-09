import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { logger } from '@/lib/utils/logger';
import {
  normalizeProductUrl,
  buildCanonicalUrl,
  logInvalidUrlPattern,
  logCampaignParams,
  logRedirect,
} from '@/lib/url/product-url';

const WATCHED_CRAWLERS = [
  /gptbot/i,
  /claudebot/i,
  /perplexitybot/i,
  /googlebot/i,
  /google-extended/i,
  /ccbot/i,
];

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const pathname = request.nextUrl.pathname;
  const currentUrl = request.nextUrl.clone();

  // Log crawler visits
  const userAgent = request.headers.get('user-agent') ?? '';
  if (WATCHED_CRAWLERS.some((pattern) => pattern.test(userAgent))) {
    logger.audit('crawler-visit', {
      userAgent,
      path: pathname,
    });
  }

  // Redirect /shop to /collections/all
  if (pathname === '/shop' || pathname === '/shop/') {
    const url = request.nextUrl.clone();
    url.pathname = '/collections/all';
    return NextResponse.redirect(url);
  }

  // Legacy product path: /product/:id -> normalize to /products/:slug
  if (pathname.startsWith('/product/')) {
    const legacySegments = pathname.replace(/^\/product\//, '').split('/').filter(Boolean);
    const targetSegments = legacySegments.length > 0 ? [legacySegments[0]] : [];
    const norm = normalizeProductUrl(targetSegments, currentUrl.searchParams);
    if (norm.slug && norm.canonicalPath) {
      const redirectTo = buildCanonicalUrl(currentUrl.origin, norm.canonicalPath, norm.preservedParams);
      logRedirect({ from: currentUrl.toString(), to: redirectTo, status: 301, reasons: ['legacy_product_path'] });
      const res = NextResponse.redirect(redirectTo, 301);
      res.headers.set('X-Redirect-Reason', 'legacy_product_path');
      return res;
    }
  }

  // Product path normalization: /products/:slug[...extra]
  if (pathname.startsWith('/products')) {
    const segments = pathname.replace(/^\/products\/?/, '').split('/').filter(Boolean);
    const norm = normalizeProductUrl(segments, currentUrl.searchParams);

    // Log campaign params for marketing insights
    if (norm.preservedParams.size > 0) {
      const campaign = Object.fromEntries(norm.preservedParams.entries());
      logCampaignParams({ path: pathname, ...campaign });
    }

    // Log invalid patterns
    if (norm.invalidSegments.length > 0 || norm.reasons.includes('slug_sanitized')) {
      logInvalidUrlPattern({ path: pathname, invalidSegments: norm.invalidSegments, reasons: norm.reasons });
    }

    // Lightweight product status check to return 410 for removed/inactive
    if (norm.slug) {
      try {
        const supabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
          {
            cookies: {
              getAll() {
                return request.cookies.getAll();
              },
              setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                supabaseResponse = NextResponse.next({ request });
                cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
              },
            },
          }
        );
        const { data: productRow, error } = await supabase
          .from('products')
          .select('id, is_active, is_archived')
          .eq('slug', norm.slug)
          .limit(1)
          .maybeSingle();

        const removed = Boolean(error) || !productRow || !productRow.is_active || productRow.is_archived;
        if (removed) {
          return new Response('Gone', { status: 410 });
        }
      } catch {
        // If the check fails, continue without blocking
      }
    }

    // Build canonical URL and redirect if needed
    const canonicalUrl = buildCanonicalUrl(currentUrl.origin, norm.canonicalPath ?? pathname, norm.preservedParams);
    const willChangePath = norm.canonicalPath !== pathname;
    const willChangeQuery = canonicalUrl !== currentUrl.toString();

    if (willChangePath || willChangeQuery) {
      const status: 301 | 302 = willChangePath ? 301 : 302;
      logRedirect({ from: currentUrl.toString(), to: canonicalUrl, status, reasons: norm.reasons });
      const res = NextResponse.redirect(canonicalUrl, status);
      res.headers.set('X-Redirect-Reason', willChangePath ? 'canonicalize_path' : 'canonicalize_query');
      return res;
    }
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refreshing the auth token
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect dashboard routes
  if (!user && pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Static assets (svg, png, jpg, jpeg, gif, webp)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
