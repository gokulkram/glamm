-- ================================================================
-- Glamm Hair — FULL SETUP for new project (sysbekcoasfkeknpyafc)
-- Paste this entire file into:
--   Supabase Dashboard → SQL Editor → New Query → Run
-- Safe to re-run (uses IF NOT EXISTS / CREATE OR REPLACE).
-- ================================================================

-- ── Shared updated_at trigger function ─────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ── CATEGORIES ─────────────────────────────────────────────────
create table if not exists public.categories (
  id          serial primary key,
  name        text not null,
  slug        text unique not null,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

-- ── PRODUCTS ───────────────────────────────────────────────────
create table if not exists public.products (
  id            integer primary key,
  slug          text unique not null,
  title         text not null,
  description   text,
  category      text not null,
  price_min     numeric(10,2) not null default 0,
  price_max     numeric(10,2) not null default 0,
  image         text,
  sizes         jsonb not null default '[]'::jsonb,
  sizes_prices  jsonb not null default '{}'::jsonb,
  in_stock      boolean not null default true,
  badge         text,
  features      jsonb not null default '[]'::jsonb,
  benefits      jsonb not null default '[]'::jsonb,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists products_category_idx   on public.products (category);
create index if not exists products_sort_order_idx  on public.products (sort_order);

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- ── ORDERS ─────────────────────────────────────────────────────
create table if not exists public.orders (
  id               uuid primary key default gen_random_uuid(),
  order_number     text unique not null,
  user_id          uuid references auth.users (id) on delete set null,
  email            text not null,
  phone            text,
  first_name       text,
  last_name        text,
  address1         text,
  address2         text,
  city             text,
  state            text,
  zip              text,
  country          text default 'US',
  subtotal         numeric(10,2) not null default 0,
  shipping         numeric(10,2) not null default 0,
  total            numeric(10,2) not null default 0,
  currency         text not null default 'USD',
  status           text not null default 'pending',
  payment_status   text not null default 'pending',
  payment_method   text,
  transaction_id   text,
  auth_code        text,
  tracking_number  text,
  tracking_carrier text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists orders_email_idx       on public.orders (lower(email));
create index if not exists orders_user_id_idx      on public.orders (user_id);
create index if not exists orders_order_number_idx on public.orders (order_number);
create index if not exists orders_created_at_idx   on public.orders (created_at desc);

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- ── ORDER ITEMS ────────────────────────────────────────────────
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

-- ── CUSTOMERS ──────────────────────────────────────────────────
create table if not exists public.customers (
  id          uuid primary key default gen_random_uuid(),
  email       text unique not null,
  first_name  text,
  last_name   text,
  phone       text,
  user_id     uuid references auth.users (id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists customers_email_idx  on public.customers (lower(email));
create index if not exists customers_user_id_idx on public.customers (user_id);

drop trigger if exists customers_set_updated_at on public.customers;
create trigger customers_set_updated_at
  before update on public.customers
  for each row execute function public.set_updated_at();

-- ── ADDRESSES ──────────────────────────────────────────────────
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

drop trigger if exists addresses_set_updated_at on public.addresses;
create trigger addresses_set_updated_at
  before update on public.addresses
  for each row execute function public.set_updated_at();

-- ── ADMINS ─────────────────────────────────────────────────────
create table if not exists public.admins (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid unique references auth.users (id) on delete cascade,
  email       text unique not null,
  name        text,
  role        text not null default 'admin',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists admins_user_id_idx on public.admins (user_id);

drop trigger if exists admins_set_updated_at on public.admins;
create trigger admins_set_updated_at
  before update on public.admins
  for each row execute function public.set_updated_at();

-- ── ROW LEVEL SECURITY ─────────────────────────────────────────
alter table public.products    enable row level security;
alter table public.categories  enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;
alter table public.customers   enable row level security;
alter table public.addresses   enable row level security;
alter table public.admins      enable row level security;

-- Products & categories: anyone (anon) can read
drop policy if exists "public read products"   on public.products;
create policy "public read products"   on public.products   for select using (true);

drop policy if exists "public read categories" on public.categories;
create policy "public read categories" on public.categories for select using (true);

-- Orders: logged-in customer reads their own
drop policy if exists "own orders read" on public.orders;
create policy "own orders read" on public.orders for select using (auth.uid() = user_id);

drop policy if exists "own order items read" on public.order_items;
create policy "own order items read" on public.order_items for select
  using (exists (select 1 from public.orders o where o.id = order_items.order_id and o.user_id = auth.uid()));

-- Customers: own row only
drop policy if exists "own customer read" on public.customers;
create policy "own customer read" on public.customers for select using (auth.uid() = user_id);

-- Addresses: CRUD own rows only
drop policy if exists "own addresses select" on public.addresses;
create policy "own addresses select" on public.addresses for select using (auth.uid() = user_id);

drop policy if exists "own addresses insert" on public.addresses;
create policy "own addresses insert" on public.addresses for insert with check (auth.uid() = user_id);

drop policy if exists "own addresses update" on public.addresses;
create policy "own addresses update" on public.addresses for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own addresses delete" on public.addresses;
create policy "own addresses delete" on public.addresses for delete using (auth.uid() = user_id);

-- Admins: own row only
drop policy if exists "own admin read" on public.admins;
create policy "own admin read" on public.admins for select using (auth.uid() = user_id);

-- ── SEED: CATEGORIES ───────────────────────────────────────────
insert into public.categories (name, slug, sort_order) values
  ('Wavy',     'wavy',     1),
  ('Straight', 'straight', 2),
  ('Curly',    'curly',    3),
  ('Closures', 'closures', 4)
on conflict (slug) do nothing;

-- ── SEED: PRODUCTS ─────────────────────────────────────────────
insert into public.products
  (id, slug, title, description, category, price_min, price_max, sizes, sizes_prices, in_stock, badge, features, benefits, sort_order)
values

-- ── CLOSURES ──
(1, 'lace-frontal-13x4', 'Lace Frontal 13X4',
 'Premium HD lace frontal for a natural hairline. 13x4 size provides ear-to-ear coverage with versatile parting options.',
 'closures', 108, 178,
 '["10\"","12\"","14\"","16\"","18\"","20\"","22\"","24\""]',
 '{"10\"":108,"12\"":118,"14\"":128,"16\"":144,"18\"":150,"20\"":158,"22\"":170,"24\"":178}',
 true, 'Best Seller',
 '["100% Virgin Human Hair","Can be dyed and styled","Natural shine and softness","Tangle-free with proper care"]',
 '["Long-lasting with proper care (6-12 months)","Heat-friendly up to 350°F","Minimal shedding","True to length"]',
 1),

(2, 'hd-4x4-closure', 'HD 4X4 closure',
 'HD lace 4x4 closure for seamless blending. Perfect for creating natural-looking parts and protecting your natural hair.',
 'closures', 70, 128,
 '["10\"","12\"","14\"","16\"","18\"","20\"","22\"","24\""]',
 '{"10\"":70,"12\"":76,"14\"":85,"16\"":90,"18\"":96,"20\"":110,"22\"":118,"24\"":128}',
 true, 'Best Seller',
 '["100% Virgin Human Hair","Can be dyed and styled","Natural shine and softness","Tangle-free with proper care"]',
 '["Long-lasting with proper care (6-12 months)","Heat-friendly up to 350°F","Minimal shedding","True to length"]',
 2),

(3, 'hd-5x5-closure', 'HD 5X5 closure',
 'Larger 5x5 HD lace closure offering more parting space and styling versatility. Undetectable and natural-looking.',
 'closures', 78, 138,
 '["10\"","12\"","14\"","16\"","18\"","20\"","22\""]',
 '{"10\"":78,"12\"":90,"14\"":98,"16\"":108,"18\"":118,"20\"":126,"22\"":138}',
 true, 'Best Seller',
 '["100% Virgin Human Hair","Can be dyed and styled","Natural shine and softness","Tangle-free with proper care"]',
 '["Long-lasting with proper care (6-12 months)","Heat-friendly up to 350°F","Minimal shedding","True to length"]',
 3),

(4, 'hd-2x6-closure', 'HD 2X6 closure',
 'Slim 2x6 HD lace closure perfect for middle parts. Lightweight and natural with invisible knots.',
 'closures', 70, 106,
 '["10\"","12\"","14\"","16\"","18\"","20\""]',
 '{"10\"":70,"12\"":78,"14\"":84,"16\"":92,"18\"":98,"20\"":106}',
 true, 'Best Seller',
 '["100% Virgin Human Hair","Can be dyed and styled","Natural shine and softness","Tangle-free with proper care"]',
 '["Long-lasting with proper care (6-12 months)","Heat-friendly up to 350°F","Minimal shedding","True to length"]',
 4),

-- ── CURLY ──
(5, 'tight-curly', 'Tight Curly',
 'Tight, bouncy curls with maximum volume. Perfect for achieving a bold, voluminous look with defined ringlets.',
 'curly', 44, 145,
 '["10\"","12\"","14\"","16\"","18\"","20\"","22\"","24\"","26\"","28\"","30\"","32\""]',
 '{"10\"":44,"12\"":48,"14\"":62,"16\"":74,"18\"":80,"20\"":83,"22\"":86,"24\"":112,"26\"":118,"28\"":120,"30\"":136,"32\"":145}',
 true, null,
 '["100% Virgin Human Hair","Can be dyed and styled","Natural shine and softness","Tangle-free with proper care"]',
 '["Long-lasting with proper care (6-12 months)","Heat-friendly up to 350°F","Minimal shedding","True to length"]',
 5),

(6, 'indian-curl', 'Indian Curl',
 'Luxurious Indian curls with natural bounce and shine. Soft, silky texture that holds curls beautifully.',
 'curly', 44, 145,
 '["10\"","12\"","14\"","16\"","18\"","20\"","22\"","24\"","26\"","28\"","30\"","32\""]',
 '{"10\"":44,"12\"":48,"14\"":62,"16\"":74,"18\"":80,"20\"":83,"22\"":86,"24\"":112,"26\"":118,"28\"":120,"30\"":136,"32\"":145}',
 true, 'Best Seller',
 '["100% Virgin Human Hair","Can be dyed and styled","Natural shine and softness","Tangle-free with proper care"]',
 '["Long-lasting with proper care (6-12 months)","Heat-friendly up to 350°F","Minimal shedding","True to length"]',
 6),

(7, 'burmese-curl', 'Burmese Curl',
 'Luxurious Burmese curl pattern with defined, bouncy curls. Holds curl pattern beautifully even after washing.',
 'curly', 44, 145,
 '["10\"","12\"","14\"","16\"","18\"","20\"","22\"","24\"","26\"","28\"","30\"","32\""]',
 '{"10\"":44,"12\"":48,"14\"":62,"16\"":74,"18\"":80,"20\"":83,"22\"":86,"24\"":112,"26\"":118,"28\"":120,"30\"":136,"32\"":145}',
 true, null,
 '["100% Virgin Human Hair","Can be dyed and styled","Natural shine and softness","Tangle-free with proper care"]',
 '["Long-lasting with proper care (6-12 months)","Heat-friendly up to 350°F","Minimal shedding","True to length"]',
 7),

(8, 'italian-curl', 'Italian Curl',
 'Elegant Italian curl with loose, romantic curls. Perfect for a glamorous, red-carpet look.',
 'curly', 44, 145,
 '["10\"","12\"","14\"","16\"","18\"","20\"","22\"","24\"","26\"","28\"","30\"","32\""]',
 '{"10\"":44,"12\"":48,"14\"":62,"16\"":74,"18\"":80,"20\"":83,"22\"":86,"24\"":112,"26\"":118,"28\"":120,"30\"":136,"32\"":145}',
 true, null,
 '["100% Virgin Human Hair","Can be dyed and styled","Natural shine and softness","Tangle-free with proper care"]',
 '["Long-lasting with proper care (6-12 months)","Heat-friendly up to 350°F","Minimal shedding","True to length"]',
 8),

-- ── WAVY ──
(9, 'natural-wave', 'Natural Wave',
 'Soft, natural waves for an effortless beachy look. Versatile texture that can be styled straight or curly.',
 'wavy', 44, 145,
 '["10\"","12\"","14\"","16\"","18\"","20\"","22\"","24\"","26\"","28\"","30\"","32\""]',
 '{"10\"":44,"12\"":48,"14\"":62,"16\"":74,"18\"":80,"20\"":83,"22\"":86,"24\"":112,"26\"":118,"28\"":120,"30\"":136,"32\"":145}',
 true, 'Best Seller',
 '["100% Virgin Human Hair","Can be dyed and styled","Natural shine and softness","Tangle-free with proper care"]',
 '["Long-lasting with proper care (6-12 months)","Heat-friendly up to 350°F","Minimal shedding","True to length"]',
 9),

(10, 'deep-wave', 'Deep Wave',
 'Glamorous deep waves with defined S-pattern. Adds volume and movement for a sophisticated look.',
 'wavy', 44, 145,
 '["10\"","12\"","14\"","16\"","18\"","20\"","22\"","24\"","26\"","28\"","30\"","32\""]',
 '{"10\"":44,"12\"":48,"14\"":62,"16\"":74,"18\"":80,"20\"":83,"22\"":86,"24\"":112,"26\"":118,"28\"":120,"30\"":136,"32\"":145}',
 true, 'Best Seller',
 '["100% Virgin Human Hair","Can be dyed and styled","Natural shine and softness","Tangle-free with proper care"]',
 '["Long-lasting with proper care (6-12 months)","Heat-friendly up to 350°F","Minimal shedding","True to length"]',
 10),

(11, 'indian-wave', 'Indian Wave',
 'Beautiful Indian wave texture with natural movement and shine. Versatile styling options from sleek to voluminous.',
 'wavy', 44, 145,
 '["10\"","12\"","14\"","16\"","18\"","20\"","22\"","24\"","26\"","28\"","30\"","32\""]',
 '{"10\"":44,"12\"":48,"14\"":62,"16\"":74,"18\"":80,"20\"":83,"22\"":86,"24\"":112,"26\"":118,"28\"":120,"30\"":136,"32\"":145}',
 true, null,
 '["100% Virgin Human Hair","Can be dyed and styled","Natural shine and softness","Tangle-free with proper care"]',
 '["Long-lasting with proper care (6-12 months)","Heat-friendly up to 350°F","Minimal shedding","True to length"]',
 11),

-- ── STRAIGHT ──
(12, 'kinky-straight', 'Kinky Straight',
 'Natural kinky straight texture that blends seamlessly with relaxed or natural hair. Mimics blown-out natural hair.',
 'straight', 44, 145,
 '["10\"","12\"","14\"","16\"","18\"","20\"","22\"","24\"","26\"","28\"","30\"","32\""]',
 '{"10\"":44,"12\"":48,"14\"":62,"16\"":74,"18\"":80,"20\"":83,"22\"":86,"24\"":112,"26\"":118,"28\"":120,"30\"":136,"32\"":145}',
 true, null,
 '["100% Virgin Human Hair","Can be dyed and styled","Natural shine and softness","Tangle-free with proper care"]',
 '["Long-lasting with proper care (6-12 months)","Heat-friendly up to 350°F","Minimal shedding","True to length"]',
 12),

(13, 'straight', 'Straight',
 'Sleek, silky straight hair for a classic, polished look. Can be curled or styled as desired.',
 'straight', 44, 145,
 '["10\"","12\"","14\"","16\"","18\"","20\"","22\"","24\"","26\"","28\"","30\"","32\""]',
 '{"10\"":44,"12\"":48,"14\"":62,"16\"":74,"18\"":80,"20\"":83,"22\"":86,"24\"":112,"26\"":118,"28\"":120,"30\"":136,"32\"":145}',
 true, 'Best Seller',
 '["100% Virgin Human Hair","Can be dyed and styled","Natural shine and softness","Tangle-free with proper care"]',
 '["Long-lasting with proper care (6-12 months)","Heat-friendly up to 350°F","Minimal shedding","True to length"]',
 13)

on conflict (id) do update set
  slug         = excluded.slug,
  title        = excluded.title,
  description  = excluded.description,
  category     = excluded.category,
  price_min    = excluded.price_min,
  price_max    = excluded.price_max,
  sizes        = excluded.sizes,
  sizes_prices = excluded.sizes_prices,
  in_stock     = excluded.in_stock,
  badge        = excluded.badge,
  features     = excluded.features,
  benefits     = excluded.benefits,
  sort_order   = excluded.sort_order,
  updated_at   = now();

-- Reload the PostgREST schema cache
notify pgrst, 'reload schema';

-- ── Done ────────────────────────────────────────────────────────
-- You should now have:
--   Tables:  categories, products, orders, order_items, customers, addresses, admins
--   Data:    4 categories, 13 products
-- ================================================================
