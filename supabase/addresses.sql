-- ============================================================
-- Glamm Hair — Saved addresses (address book per customer)
-- Run once in Supabase → SQL Editor → New query → Run. Safe to re-run.
-- ============================================================

create table if not exists public.addresses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  first_name  text,
  last_name   text,
  phone       text,
  address1    text not null,
  address2    text,
  city        text,
  state       text,
  zip         text,
  country     text not null default 'US',
  is_default  boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists addresses_user_id_idx on public.addresses (user_id);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists addresses_set_updated_at on public.addresses;
create trigger addresses_set_updated_at
  before update on public.addresses
  for each row execute function public.set_updated_at();

-- ============================================================
-- Row Level Security — a customer may only see/manage their own
-- addresses. (Our API also derives the user from the session.)
-- ============================================================
alter table public.addresses enable row level security;

drop policy if exists "own addresses select" on public.addresses;
create policy "own addresses select" on public.addresses
  for select using (auth.uid() = user_id);

drop policy if exists "own addresses insert" on public.addresses;
create policy "own addresses insert" on public.addresses
  for insert with check (auth.uid() = user_id);

drop policy if exists "own addresses update" on public.addresses;
create policy "own addresses update" on public.addresses
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own addresses delete" on public.addresses;
create policy "own addresses delete" on public.addresses
  for delete using (auth.uid() = user_id);

notify pgrst, 'reload schema';
