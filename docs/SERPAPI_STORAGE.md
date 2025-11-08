# SERPAPI Storage and Data Retention

This document outlines the enhanced storage strategy for SERPAPI responses, including schema changes, persistence flow, and migration instructions.

## Overview

- Full SERPAPI responses are stored in an audit table `serpapi_responses` with complete request/response metadata.
- A compatibility cache table `serpapi_amazon_data` continues to be updated for existing consumers.
- The service normalizes reviews for immediate use while preserving the raw payload for audits.

## Database Schema Changes

### New Table: `public.serpapi_responses`

- Columns:
  - `id uuid primary key` – unique identifier
  - `provider text` – default `'serpapi'`
  - `engine text` – e.g., `'amazon'`, `'google'`
  - `query text` – raw query string used
  - `gtin varchar` – optional GTIN association
  - `request_url text` – full request URL
  - `status_code integer` – HTTP status
  - `response_headers jsonb` – captured headers
  - `raw_response jsonb` – complete JSON body
  - `response_size_bytes integer` – approximate payload size
  - `fetch_duration_ms integer` – request duration
  - `collected_at timestamptz` – timestamp of collection
  - `error_message text` – populated when non-OK or exception occurs
  - `request_id text` – optional idempotency key

- Indexes: collected_at, query, engine, gtin
- Unique index: `(provider, engine, query, request_url, collected_at)` to limit duplicates

### Existing Table: `public.serpapi_amazon_data`

- Continues to store `{ gtin, raw_response, last_fetched_at }` for compatibility.

## Persistence Flow

1. SERPAPI service (`lib/services/serpapi.service.ts`) issues request.
2. On success:
   - Store full response + metadata in `serpapi_responses` via `SerpStorageService`.
   - Upsert compatibility cache in `serpapi_amazon_data` with `last_fetched_at`.
3. On failure:
   - Store error metadata (no raw body) in `serpapi_responses`.

## Service Layer

- `SerpApiService.getGoogleProductReviews(query)`:
  - Normalizes review fields for runtime use.
  - Captures headers, status, duration, and raw JSON.
  - Computes `response_size_bytes` and stores via `SerpStorageService`.
  - Updates cache (`serpapi_amazon_data`).

- `SerpStorageService.storeResponse(record)`:
  - Inserts audit record into `serpapi_responses` with defensive logging.

## Migration Instructions

1. Apply new migration:
   - `supabase/migrations/20251108_serpapi_full_responses.sql`
2. Ensure env variables are set:
   - `SERPAPI_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Deploy updated code and run tests.

## Testing

- Unit tests: `tests/serpapi.service.test.ts`
  - Verifies full response storage and cache upsert.
  - Exercises error handling path with metadata persistence.

## Notes

- Large payloads: Stored as JSONB; size recorded in `response_size_bytes`.
- Backward compatibility: Existing consumers of `serpapi_amazon_data` remain unaffected; TTL logic still applies.

