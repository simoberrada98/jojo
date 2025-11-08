-- SerpAPI Amazon Reviews Integration
-- 1) Cache raw SerpAPI responses
-- 2) Extend product_reviews for external source tracking

-- Create cache table for SerpAPI Amazon data
create table if not exists public.serpapi_amazon_data (
  id uuid primary key default extensions.uuid_generate_v4(),
  gtin varchar not null,
  raw_response jsonb not null,
  last_fetched_at timestamptz default now(),
  constraint unique_gtin unique (gtin)
) tablespace pg_default;

create index if not exists idx_serpapi_amazon_data_gtin on public.serpapi_amazon_data (gtin);
create index if not exists idx_serpapi_amazon_data_last_fetched on public.serpapi_amazon_data (last_fetched_at desc);

-- Extend product_reviews to track external source and unique IDs
alter table public.product_reviews
  add column if not exists source text,
  add column if not exists external_id text;

-- Ensure uniqueness per product/external review id to avoid duplicates
do $$
begin
  if not exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and indexname = 'uniq_product_external_review'
  ) then
    -- Use a unique index (faster than constraint for upserts in some cases)
    execute 'create unique index uniq_product_external_review on public.product_reviews (product_id, external_id)';
  end if;
end $$;

-- Helpful count index for sorting
create index if not exists idx_product_reviews_helpful_count on public.product_reviews (helpful_count desc);
-- Created_at index may already exist, ensure it's present
create index if not exists idx_product_reviews_created_at on public.product_reviews (created_at desc);

