-- ============================================================
-- Glamm Hair — Discounts / Coupon codes
-- Run once in Supabase → SQL Editor → New query → Run. Safe to re-run.
-- ============================================================

-- ---------- COUPONS ----------
create table if not exists public.coupons (
  id                  uuid primary key default gen_random_uuid(),
  code                text unique not null,                 -- stored UPPERCASE, e.g. WELCOME10
  type                text not null check (type in ('percent','fixed')),
  value               numeric(10,2) not null check (value > 0),  -- 10 = 10% (percent) or $10 (fixed)
  active              boolean not null default true,
  min_subtotal        numeric(10,2) not null default 0,      -- minimum cart subtotal to qualify
  starts_at           timestamptz,                           -- null = active immediately
  expires_at          timestamptz,                           -- null = never expires
  max_redemptions     integer,                               -- null = unlimited total uses
  per_customer_limit  integer not null default 1,            -- "once per customer" = 1
  times_redeemed      integer not null default 0,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists coupons_active_idx on public.coupons (active);

-- ---------- REDEMPTIONS (one row per customer use, enforces once-per-customer) ----------
create table if not exists public.coupon_redemptions (
  id          uuid primary key default gen_random_uuid(),
  coupon_id   uuid not null references public.coupons (id) on delete cascade,
  code        text not null,
  email       text not null,
  user_id     uuid,
  order_id    uuid references public.orders (id) on delete set null,
  created_at  timestamptz not null default now()
);

-- A given coupon can be redeemed once per email address.
create unique index if not exists coupon_redemptions_once_per_email
  on public.coupon_redemptions (coupon_id, lower(email));

-- ---------- ORDERS: record the discount that was applied ----------
alter table public.orders add column if not exists discount    numeric(10,2) not null default 0;
alter table public.orders add column if not exists coupon_code text;

-- keep updated_at fresh on coupons (reuses set_updated_at from schema.sql)
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists coupons_set_updated_at on public.coupons;
create trigger coupons_set_updated_at
  before update on public.coupons
  for each row execute function public.set_updated_at();

-- ============================================================
-- Row Level Security
-- Coupons & redemptions are NOT publicly readable (codes must not be
-- enumerable). All access is server-side via the service_role key, which
-- bypasses RLS. Enabling RLS with no policy = deny to the anon/public key.
-- ============================================================
alter table public.coupons            enable row level security;
alter table public.coupon_redemptions enable row level security;

notify pgrst, 'reload schema';
