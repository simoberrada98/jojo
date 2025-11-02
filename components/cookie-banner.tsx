'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  acceptCookieConsent,
  rejectCookieConsent,
} from '@/app/actions/cookies';
import { Button } from '@/components/ui/button';
import type { CookieConsentStatus } from '@/lib/cookies/preferences';
import { logger } from '@/lib/utils/logger';

interface CookieBannerProps {
  initialStatus: CookieConsentStatus | null;
}

export function CookieBanner({ initialStatus }: CookieBannerProps) {
  const [status, setStatus] = useState<CookieConsentStatus | null>(
    initialStatus
  );
  const [isPending, startTransition] = useTransition();

  if (status === 'accepted' || status === 'rejected') {
    return null;
  }

  const persistPreference = (nextStatus: CookieConsentStatus) => {
    startTransition(async () => {
      setStatus(nextStatus);
      try {
        if (nextStatus === 'accepted') {
          await acceptCookieConsent();
        } else {
          await rejectCookieConsent();
        }
      } catch (error) {
        logger.error('Cookie consent update failed', error as Error);
        setStatus(null);
      }
    });
  };

  return (
    <div className="bottom-0 z-50 fixed inset-x-0 pb-4">
      <div className="mx-auto px-4 w-full max-w-3xl">
        <div className="bg-background/95 shadow-xl backdrop-blur p-6 border border-border rounded-2xl">
          <div className="space-y-2 text-foreground/80 text-sm">
            <p className="font-medium text-foreground">
              We respect your privacy
            </p>
            <p>
              We use essential cookies to make this site work and analytics
              cookies to understand how you use it. You can learn more in our{' '}
              <Link
                href="/privacy-policy"
                className="text-accent underline underline-offset-4"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
          <div className="flex flex-wrap justify-end items-center gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => persistPreference('rejected')}
              disabled={isPending}
              type="button"
            >
              Decline
            </Button>
            <Button
              onClick={() => persistPreference('accepted')}
              disabled={isPending}
              type="button"
            >
              Accept
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
