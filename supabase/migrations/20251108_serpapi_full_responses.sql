-- SERPAPI Full Responses Audit Table
-- Stores complete JSON payloads and request/response metadata for auditing and reprocessing.

create table if not exists public.serpapi_responses (
  id uuid primary key default extensions.uuid_generate_v4(),
  provider text not null default 'serpapi',
  engine text not null, -- e.g., 'amazon', 'google'
  query text not null, -- raw query used
  gtin varchar null, -- optional GTIN association
  request_url text not null,
  status_code integer not null,
  response_headers jsonb null,
  raw_response jsonb null, -- full JSON response
  response_size_bytes integer null,
  fetch_duration_ms integer null,
  collected_at timestamptz not null default now(),
  error_message text null,
  request_id text null -- optional external request id for idempotency
) tablespace pg_default;

create index if not exists idx_serpapi_responses_collected on public.serpapi_responses (collected_at desc);
create index if not exists idx_serpapi_responses_query on public.serpapi_responses (query);
create index if not exists idx_serpapi_responses_engine on public.serpapi_responses (engine);
create index if not exists idx_serpapi_responses_gtin on public.serpapi_responses (gtin);

-- Optional uniqueness to prevent duplicate inserts of same request
do $$
begin
  if not exists (
    select 1 from pg_indexes where schemaname = 'public' and indexname = 'uniq_serpapi_request'
  ) then
    execute 'create unique index uniq_serpapi_request on public.serpapi_responses (provider, engine, query, request_url, collected_at)';
  end if;
end $$;

