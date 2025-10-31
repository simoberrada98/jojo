"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { acceptCookieConsent, rejectCookieConsent } from "@/app/actions/cookies"
import { Button } from "@/components/ui/button"
import type { CookieConsentStatus } from "@/lib/cookies/preferences"

interface CookieBannerProps {
  initialStatus: CookieConsentStatus | null
}

export function CookieBanner({ initialStatus }: CookieBannerProps) {
  const [status, setStatus] = useState<CookieConsentStatus | null>(initialStatus)
  const [isPending, startTransition] = useTransition()

  if (status === "accepted" || status === "rejected") {
    return null
  }

  const persistPreference = (nextStatus: CookieConsentStatus) => {
    startTransition(async () => {
      setStatus(nextStatus)
      try {
        if (nextStatus === "accepted") {
          await acceptCookieConsent()
        } else {
          await rejectCookieConsent()
        }
      } catch (error) {
        console.error("Cookie consent update failed", error)
        setStatus(null)
      }
    })
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 pb-4">
      <div className="mx-auto w-full max-w-3xl px-4">
        <div className="rounded-2xl border border-border bg-background/95 p-6 shadow-xl backdrop-blur">
          <div className="space-y-2 text-sm text-foreground/80">
            <p className="font-medium text-foreground">We respect your privacy</p>
            <p>
              We use essential cookies to make this site work and analytics cookies to understand how you use it.
              You can learn more in our{" "}
              <Link href="/privacy" className="text-accent underline underline-offset-4">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => persistPreference("rejected")}
              disabled={isPending}
              type="button"
            >
              Decline
            </Button>
            <Button onClick={() => persistPreference("accepted")} disabled={isPending} type="button">
              Accept
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

