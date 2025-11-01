'use server'

import { setCookieConsentStatus } from '@/lib/cookies/preferences'

export async function acceptCookieConsent() {
  await setCookieConsentStatus('accepted')
}

export async function rejectCookieConsent() {
  await setCookieConsentStatus('rejected')
}
