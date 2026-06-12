-- ============================================================
-- Glamm Hair — Products & Categories (make the catalog dynamic)
-- Run once in Supabase → SQL Editor → New query → Run.
-- Safe to re-run.
-- ============================================================

-- ---------- CATEGORIES ----------
create table if not exists public.categories (
  id          serial primary key,
  name        text not null,
  slug        text unique not null,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

-- ---------- PRODUCTS ----------
create table if not exists public.products (
  id            integer primary key,            -- keep existing ids (1..22)
  slug          text unique not null,
  title         text not null,
  description   text,
  category      text not null,                  -- display name, matches categories.name
  price_min     numeric(10,2) not null default 0,
  price_max     numeric(10,2) not null default 0,
  image         text,
  sizes         jsonb not null default '[]'::jsonb,        -- ["10\"","12\"", ...]
  sizes_prices  jsonb not null default '{}'::jsonb,        -- {"10\"":108, ...}
  in_stock      boolean not null default true,
  badge         text,
  features      jsonb not null default '[]'::jsonb,
  benefits      jsonb not null default '[]'::jsonb,
  sort_order    integer not null default 0,     -- preserves catalog order
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists products_category_idx   on public.products (category);
create index if not exists products_sort_order_idx  on public.products (sort_order);

-- keep updated_at fresh (reuses the function from schema.sql if present)
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- ============================================================
-- Row Level Security
-- Catalog is PUBLIC, so anyone (anon key in the browser) can READ
-- products & categories. Writes happen only server-side via the
-- service_role key (which bypasses RLS).
-- ============================================================
alter table public.products   enable row level security;
alter table public.categories enable row level security;

drop policy if exists "public read products" on public.products;
create policy "public read products"
  on public.products for select
  using (true);

drop policy if exists "public read categories" on public.categories;
create policy "public read categories"
  on public.categories for select
  using (true);

-- Tell the API layer (PostgREST) to pick up the new tables immediately,
-- otherwise reads may fail with "table not found in schema cache".
notify pgrst, 'reload schema';
