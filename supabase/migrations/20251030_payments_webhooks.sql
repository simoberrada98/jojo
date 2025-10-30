-- Supabase migration for payments, webhook_events, and payment_attempts
-- Run with: supabase db push (ensure scripts include this file if using CLI migrations)

-- Payments table
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  hp_payment_id text unique,
  business_id text not null,
  session_id text not null,
  amount numeric not null,
  currency text not null,
  status text not null,
  method text,
  customer_email text,
  customer_ip text,
  metadata jsonb,
  checkout_data jsonb,
  hoodpay_response jsonb,
  web_payment_response jsonb,
  error_log jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  expires_at timestamptz
);

create index if not exists payments_business_id_idx on public.payments (business_id);
create index if not exists payments_status_idx on public.payments (status);
create index if not exists payments_created_at_idx on public.payments (created_at desc);

-- Webhook events table
create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  payment_id text,
  business_id text,
  payload jsonb not null,
  signature text,
  verified boolean not null default false,
  processed boolean not null default false,
  processing_error text,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  retry_count integer not null default 0
);

create index if not exists webhook_events_event_type_idx on public.webhook_events (event_type);
create index if not exists webhook_events_received_at_idx on public.webhook_events (received_at desc);

-- Payment attempts table
create table if not exists public.payment_attempts (
  id uuid primary key default gen_random_uuid(),
  payment_id text not null,
  attempt_number integer not null,
  method text not null,
  status text not null,
  error jsonb,
  request_data jsonb,
  response_data jsonb,
  created_at timestamptz not null default now()
);

create index if not exists payment_attempts_payment_id_idx on public.payment_attempts (payment_id);
