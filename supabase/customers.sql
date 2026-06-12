-- ============================================================
-- Glamm Hair — Customers table
-- Run once in Supabase → SQL Editor → New query → Run. Safe to re-run.
-- ============================================================

create table if not exists public.customers (
  id          uuid primary key default gen_random_uuid(),
  email       text unique not null,
  first_name  text,
  last_name   text,
  phone       text,
  -- links to a login account once the customer registers (accounts come later)
  user_id     uuid references auth.users (id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists customers_email_idx   on public.customers (lower(email));
create index if not exists customers_user_id_idx  on public.customers (user_id);

-- keep updated_at fresh (reuses the shared function if it already exists)
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists customers_set_updated_at on public.customers;
create trigger customers_set_updated_at
  before update on public.customers
  for each row execute function public.set_updated_at();

-- ============================================================
-- Row Level Security
-- Customer rows are private. The server (service_role) writes them
-- when an order is placed and reads them for the admin panel.
-- A logged-in customer may read their own row.
-- ============================================================
alter table public.customers enable row level security;

drop policy if exists "own customer read" on public.customers;
create policy "own customer read"
  on public.customers for select
  using (auth.uid() = user_id);

notify pgrst, 'reload schema';
