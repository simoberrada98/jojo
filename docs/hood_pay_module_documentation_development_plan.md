# HoodPay Module — Documentation & Development Plan

> Module files: `hoodpayModule.ts` (TypeScript), optional `hoodpayModule.js` (legacy JS)

---

## 1) What this module does

A small, framework-friendly SDK to integrate **HoodPay** with **Next.js** and **Supabase**.

**Capabilities**

- Fetch payments with filters (pagination, time range, status, etc.).
- Create payments with **dynamic product details** (price, currency, description, etc.).
- Store payment objects in Supabase.
- Manage webhooks (list/create/delete/reset secret) for your business.
- Drop‑in Next.js API route handlers for payments and webhooks.

**References**

- Payments list endpoint: `GET /v1/businesses/{businessId}/payments`.
- Webhooks endpoints:
  - `GET /v1/dash/businesses/{businessId}/settings/developer/webhooks`
  - `POST /v1/dash/businesses/{businessId}/settings/developer/webhooks`
  - `DELETE /v1/dash/businesses/{businessId}/settings/developer/webhooks/{webhookId}`
  - `POST /v1/dash/businesses/{businessId}/settings/developer/webhooks/reset-secret`
- Common payment events: `payment:completed`, `payment:cancelled`, `payment:expired`, `payment:method_selected`, `payment:created`.

> All calls require `Authorization: Bearer <API_KEY>` and JSON bodies.

---

## 2) Prerequisites

- Node 18+
- Next.js 13+ (App or Pages Router)
- Supabase project & service role key (or RW key)

**Install**

```bash
npm i @supabase/supabase-js
```

_(Types come with `@supabase/supabase-js`. In your app repo you’ll already have Next.js types.)_

---

## 3) Environment variables

Add to `.env.local` (Next.js) or your secret store:

```ini
# HoodPay
HOODPAY_API_KEY=*****
HOODPAY_BUSINESS_ID=28981

# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

**Security tips**

- Never commit API keys to git.
- Rotate HoodPay keys and webhook secret regularly.
- Restrict who can call your server routes (don’t expose these endpoints to the public without auth).

---

## 4) API surface (exports)

### `getPayments(token, businessId, options)` → `Promise<any>`

Fetches payments for the business.

**Options** (all optional):
`PageNumber`, `PageSize`, `fromTime`, `toTime`, `status`, `paymentMethod`, `fromAmount`, `toAmount`, `searchString`.

---

### `createPayment(token, businessId, payment)` → `Promise<any>`

Creates a new payment. **Dynamic product fields** supported:

- `currency` (string)
- `amount` (number)
- `name`, `description`
- `customerEmail`, `customerIp`, `customerUserAgent`
- `redirectUrl`, `notifyUrl`

---

### `savePaymentsToSupabase(payments, table?)` → inserted rows

Bulk‑inserts any array to a Supabase table (default table: `hoodpay_payments`).

---

### `paymentsApiHandler(req, res)` (Next.js API)

- `GET` → returns `getPayments(...)` with query params passthrough.
- `POST` → creates a payment with request body as `PaymentCreationRequest`.

---

### Webhooks

#### `getWebhooks(token, businessId)`

Returns webhook config for the business.

#### `createWebhook(token, businessId, { url, events, description? })`

Registers a webhook URL for selected events.

#### `deleteWebhook(token, businessId, webhookId)`

Deletes a specific webhook by id.

#### `resetWebhookSecret(token, businessId)`

Resets the shared secret used to sign webhook payloads.

#### `webhooksApiHandler(req, res)` (suggested)

- `GET` → list webhooks
- `POST` → create webhook
- `DELETE` → delete webhook by `id`
- `POST /reset-secret` → reset secret

> Signature verification helper is recommended (see §7).

---

## 5) Type definitions (selected)

```ts
export interface GetPaymentsOptions {
  PageNumber?: number
  PageSize?: number
  fromTime?: string
  toTime?: string
  status?: string
  paymentMethod?: string
  fromAmount?: number
  toAmount?: number
  searchString?: string
}

export interface PaymentCreationRequest {
  currency: string
  amount: number
  name?: string
  description?: string
  customerEmail?: string
  customerIp?: string
  customerUserAgent?: string
  redirectUrl?: string
  notifyUrl?: string
}

export type WebhookEvent =
  | 'payment:completed'
  | 'payment:cancelled'
  | 'payment:expired'
  | 'payment:method_selected'
  | 'payment:created'

export interface CreateWebhookRequest {
  url: string
  events: WebhookEvent[]
  description?: string
}
export interface Webhook {
  id: string
  url: string
  events: WebhookEvent[]
  enabled: boolean
  createdAt?: string
}
```

---

## 6) Example: Next.js API routes

**`pages/api/payments.ts`**

```ts
export { paymentsApiHandler as default } from '@/lib/hoodpayModule'
```

**`pages/api/webhooks/index.ts`** (list/create)

```ts
import { NextApiRequest, NextApiResponse } from 'next'
import { getWebhooks, createWebhook } from '@/lib/hoodpayModule'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = process.env.HOODPAY_API_KEY!
  const businessId = process.env.HOODPAY_BUSINESS_ID!
  if (req.method === 'GET')
    return res.json(await getWebhooks(token, businessId))
  if (req.method === 'POST')
    return res.json(await createWebhook(token, businessId, req.body))
  res.status(405).end()
}
```

**`pages/api/webhooks/[id].ts`** (delete)

```ts
import { NextApiRequest, NextApiResponse } from 'next'
import { deleteWebhook } from '@/lib/hoodpayModule'
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = process.env.HOODPAY_API_KEY!
  const businessId = process.env.HOODPAY_BUSINESS_ID!
  const { id } = req.query as { id: string }
  if (req.method === 'DELETE')
    return res.json(await deleteWebhook(token, businessId, id))
  res.status(405).end()
}
```

**`pages/api/webhooks/reset-secret.ts`**

```ts
import { resetWebhookSecret } from '@/lib/hoodpayModule'
export default async function handler(req, res) {
  const token = process.env.HOODPAY_API_KEY!
  const businessId = process.env.HOODPAY_BUSINESS_ID!
  if (req.method !== 'POST') return res.status(405).end()
  const out = await resetWebhookSecret(token, businessId)
  res.json(out)
}
```

---

## 7) Webhook receiver & signature verification (recommended)

HoodPay will send events to your webhook URL with a **shared secret**. Implement verification to reject spoofed requests.

**Suggested approach**

1. Store the current `WEBHOOK_SECRET` securely.
2. Expect an HMAC signature header (e.g., `x-hoodpay-signature`).
3. Compute `HMAC_SHA256(secret, rawBody)` and compare using constant‑time equality.
4. On success → parse JSON and dispatch by `event.type`.

> The module can expose a `verifyWebhookSignature(rawBody, signature, secret)` helper in a follow‑up iteration.

---

## 8) Suggested Supabase schema

```sql
create table if not exists hoodpay_payments (
  id bigint generated by default as identity primary key,
  hp_payment_id text unique,
  business_id text,
  status text,
  method text,
  currency text,
  amount numeric,
  data jsonb,
  created_at timestamptz default now()
);
create index on hoodpay_payments (business_id);
create index on hoodpay_payments (status);
```

---

## 9) Error handling & resilience

- **HTTP failures**: Module throws on non‑2xx; catch in your handlers and map to `4xx/5xx`.
- **Rate limits**: Back off and retry with jitter; honor `Retry-After` if present.
- **Idempotency**: For payment creation, pass an `idempotencyKey` header (future enhancement) to prevent duplicates.
- **Pagination**: Use `PageNumber`/`PageSize`; loop until a page returns fewer items than requested.
- **Timeouts**: Use `AbortController` with per‑request timeouts in production.
- **Logging**: Log request id, endpoint, status, and latency (redact PII and secrets).

---

## 10) Local testing

- Create a test API key with a short TTL.
- Use a tunnel (ngrok/Cloudflare Tunnel) to expose `localhost` URLs for webhooks.
- Seed Supabase with a dedicated **dev** schema or project.
- Build fixtures for payment objects and webhook payloads.

---

## 11) Deployment notes

- Put server routes behind auth (e.g., a dashboard admin token or session).
- Store secrets in platform KMS/secret manager.
- Rotate webhook secret after incidents; propagate to your config immediately.
- Observability: add logs, metrics, and alerts for non‑2xx rates and webhook failures.

---

## 12) Development Plan

**Milestone 1 — Foundation (done)**

- Fetch payments with filters.
- Create payments with dynamic product details.
- Supabase insert helper.
- Basic Next.js route handler for payments.

**Milestone 2 — Webhooks (done/initial)**

- List/create/delete/reset‑secret webhook endpoints.
- Example Next.js webhook admin routes.

**Milestone 3 — Verification & Reliability**

- Signature verification helper (`verifyWebhookSignature`).
- Automatic retry policy + exponential backoff helpers.
- Idempotency key support for `createPayment`.
- Request timeout + abort support.

**Milestone 4 — Data model & Sync**

- Map HoodPay payment schema to typed TS interfaces.
- Upsert strategy in Supabase (avoid duplicates by `hp_payment_id`).
- Full pagination sync job (CRON/API route).

**Milestone 5 — DX & Docs**

- JSDoc for all functions + generated API docs.
- Example app page (Next.js) to browse payments and webhook logs.
- Add E2E examples with Playwright (mocked HoodPay + local receiver).

**Milestone 6 — Security & Compliance**

- Rotate API keys and secrets tooling.
- Audit trail for webhook secret resets.
- PII redaction utilities.

**Acceptance criteria (for each milestone)**

- Unit tests ≥ 90% statements for new code.
- Type‑safe public API (no `any` in exported types).
- Lint/format clean (ESLint + Prettier).
- CI builds green on Node 18/20.

---

## 13) Quickstart checklist

- [ ] Set env variables (HoodPay + Supabase)
- [ ] Mount API routes for `/api/payments` and `/api/webhooks/*`
- [ ] Create a webhook with your public URL and events
- [ ] Implement receiver + signature verification
- [ ] Test a payment, confirm events stored in Supabase

---

## 14) Future ideas

- Typed SDK responses generated from the OpenAPI schema.
- CLI to create/list webhooks and rotate secrets.
- Webhook replay endpoint & dead‑letter queue.
- Background job to reconcile payments nightly.

---

**Questions / changes you want?** Ping here what shape you want for the webhook signature header and I’ll add a `verifyWebhookSignature()` helper + docs right away.
