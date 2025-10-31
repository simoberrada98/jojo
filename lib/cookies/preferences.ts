import "server-only"
import { cookies } from "next/headers"

export const COOKIE_CONSENT_NAME = "mh_cookie_consent"
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 180 // 6 months

export type CookieConsentStatus = "accepted" | "rejected"

export async function getCookieConsentStatus(): Promise<CookieConsentStatus | null> {
  const store = await cookies()
  const value = store.get(COOKIE_CONSENT_NAME)?.value

  if (value === "accepted" || value === "rejected") {
    return value
  }

  return null
}

export async function setCookieConsentStatus(status: CookieConsentStatus) {
  const store = await cookies()

  store.set(COOKIE_CONSENT_NAME, status, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: COOKIE_MAX_AGE_SECONDS,
    path: "/",
  })
}

