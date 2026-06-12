-- ============================================================
-- Glamm Hair — Orders schema (item 8: order storage in DB)
-- Run this once in Supabase → SQL Editor → New query → Run.
-- Safe to re-run (uses IF NOT EXISTS / CREATE OR REPLACE).
-- ============================================================

-- ---------- ORDERS ----------
create table if not exists public.orders (
  id              uuid primary key default gen_random_uuid(),
  order_number    text unique not null,          -- human friendly, e.g. GLM-8F3K2A1B

  -- who / where
  user_id         uuid references auth.users (id) on delete set null, -- set when logged in (accounts come later)
  email           text not null,
  phone           text,
  first_name      text,
  last_name       text,
  address1        text,
  address2        text,
  city            text,
  state           text,
  zip             text,
  country         text default 'US',

  -- money (store as numeric, never float)
  subtotal        numeric(10,2) not null default 0,
  shipping        numeric(10,2) not null default 0,
  total           numeric(10,2) not null default 0,
  currency        text not null default 'USD',

  -- lifecycle
  status          text not null default 'pending',        -- pending | paid | processing | shipped | delivered | cancelled | refunded
  payment_status  text not null default 'pending',        -- pending | paid | failed
  payment_method  text,                                    -- e.g. valor_card | paypal | apple_pay | cashapp
  transaction_id  text,                                    -- gateway transaction id (Valor txnid/rrn)
  auth_code       text,

  -- fulfilment / tracking (item 9 & 13)
  tracking_number text,
  tracking_carrier text,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists orders_email_idx        on public.orders (lower(email));
create index if not exists orders_user_id_idx       on public.orders (user_id);
create index if not exists orders_order_number_idx  on public.orders (order_number);
create index if not exists orders_created_at_idx     on public.orders (created_at desc);

-- ---------- ORDER ITEMS ----------
create table if not exists public.order_items (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders (id) on delete cascade,
  product_id  integer,
  title       text not null,
  slug        text,
  size        text,
  image       text,
  quantity    integer not null default 1,
  unit_price  numeric(10,2) not null default 0,
  line_total  numeric(10,2) not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists order_items_order_id_idx on public.order_items (order_id);

-- ---------- updated_at trigger ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- ============================================================
-- Row Level Security
-- The server (service_role key) BYPASSES RLS, so all inserts /
-- admin reads from our API routes always work. These policies
-- only govern the public anon / logged-in browser client.
-- ============================================================
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

-- Logged-in customers can read their own orders (item 12: order history).
drop policy if exists "own orders read" on public.orders;
create policy "own orders read"
  on public.orders for select
  using (auth.uid() = user_id);

drop policy if exists "own order items read" on public.order_items;
create policy "own order items read"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.user_id = auth.uid()
    )
  );

-- No anon insert/update/delete: orders are only written server-side
-- via the service_role key. Guest order tracking is done through a
-- server route (lookup by order number + email), not direct anon reads.
