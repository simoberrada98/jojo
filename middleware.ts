import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';

// TODO: Wire into Cloudflare WAF ruleset if rogue crawlers become noisy.
const WATCHED_CRAWLERS = [
  /gptbot/i,
  /claudebot/i,
  /perplexitybot/i,
  /googlebot/i,
  /google-extended/i,
  /ccbot/i,
];

export function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') ?? '';

  if (WATCHED_CRAWLERS.some((pattern) => pattern.test(userAgent))) {
    logger.audit('crawler-visit', {
      userAgent,
      path: request.nextUrl.pathname,
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
