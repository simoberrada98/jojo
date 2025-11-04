-- Ensure GTIN and product reviews lookups are indexed and world-readable for product pages

create index if not exists idx_products_gtin on public.products (gtin);
create index if not exists idx_product_reviews_product_id on public.product_reviews (product_id);

alter table public.product_reviews enable row level security;

create policy if not exists "Anon can read product_reviews"
  on public.product_reviews
  for select
  to anon
  using (true);
