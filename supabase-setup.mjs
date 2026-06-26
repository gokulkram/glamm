/**
 * supabase-setup.mjs
 * ─────────────────────────────────────────────────────────────
 * Creates all tables + seeds categories & products.
 *
 * Run:  node --env-file=.env.local supabase-setup.mjs
 * ─────────────────────────────────────────────────────────────
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
})

// ─── SCHEMA SQL ──────────────────────────────────────────────
// We run each block separately so errors are easy to trace.
const schemaSQLBlocks = [
  // ── shared updated_at function ──
  `create or replace function public.set_updated_at()
   returns trigger language plpgsql as $$
   begin new.updated_at = now(); return new; end $$;`,

  // ── categories ──
  `create table if not exists public.categories (
     id          serial primary key,
     name        text not null,
     slug        text unique not null,
     sort_order  integer not null default 0,
     created_at  timestamptz not null default now()
   );`,

  // ── products ──
  `create table if not exists public.products (
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
     published     boolean not null default true,
     badge         text,
     features      jsonb not null default '[]'::jsonb,
     benefits      jsonb not null default '[]'::jsonb,
     sort_order    integer not null default 0,
     created_at    timestamptz not null default now(),
     updated_at    timestamptz not null default now()
   );`,

  `create index if not exists products_category_idx  on public.products (category);`,
  `create index if not exists products_sort_order_idx on public.products (sort_order);`,

  `drop trigger if exists products_set_updated_at on public.products;
   create trigger products_set_updated_at
     before update on public.products
     for each row execute function public.set_updated_at();`,

  // ── orders ──
  `create table if not exists public.orders (
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
   );`,

  `create index if not exists orders_email_idx       on public.orders (lower(email));`,
  `create index if not exists orders_user_id_idx      on public.orders (user_id);`,
  `create index if not exists orders_order_number_idx on public.orders (order_number);`,
  `create index if not exists orders_created_at_idx   on public.orders (created_at desc);`,

  `drop trigger if exists orders_set_updated_at on public.orders;
   create trigger orders_set_updated_at
     before update on public.orders
     for each row execute function public.set_updated_at();`,

  // ── order_items ──
  `create table if not exists public.order_items (
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
   );`,

  `create index if not exists order_items_order_id_idx on public.order_items (order_id);`,

  // ── customers ──
  `create table if not exists public.customers (
     id          uuid primary key default gen_random_uuid(),
     email       text unique not null,
     first_name  text,
     last_name   text,
     phone       text,
     user_id     uuid references auth.users (id) on delete set null,
     created_at  timestamptz not null default now(),
     updated_at  timestamptz not null default now()
   );`,

  `create index if not exists customers_email_idx  on public.customers (lower(email));`,
  `create index if not exists customers_user_id_idx on public.customers (user_id);`,

  `drop trigger if exists customers_set_updated_at on public.customers;
   create trigger customers_set_updated_at
     before update on public.customers
     for each row execute function public.set_updated_at();`,

  // ── addresses ──
  `create table if not exists public.addresses (
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
   );`,

  `create index if not exists addresses_user_id_idx on public.addresses (user_id);`,

  `drop trigger if exists addresses_set_updated_at on public.addresses;
   create trigger addresses_set_updated_at
     before update on public.addresses
     for each row execute function public.set_updated_at();`,

  // ── admins ──
  `create table if not exists public.admins (
     id          uuid primary key default gen_random_uuid(),
     user_id     uuid unique references auth.users (id) on delete cascade,
     email       text unique not null,
     name        text,
     role        text not null default 'admin',
     created_at  timestamptz not null default now(),
     updated_at  timestamptz not null default now()
   );`,

  `create index if not exists admins_user_id_idx on public.admins (user_id);`,

  `drop trigger if exists admins_set_updated_at on public.admins;
   create trigger admins_set_updated_at
     before update on public.admins
     for each row execute function public.set_updated_at();`,

  // ── RLS ──
  `alter table public.products   enable row level security;
   alter table public.categories enable row level security;
   alter table public.orders      enable row level security;
   alter table public.order_items enable row level security;
   alter table public.customers   enable row level security;
   alter table public.addresses   enable row level security;
   alter table public.admins      enable row level security;`,

  `drop policy if exists "public read products"   on public.products;
   create policy "public read products"   on public.products   for select using (true);`,

  `drop policy if exists "public read categories" on public.categories;
   create policy "public read categories" on public.categories for select using (true);`,

  `drop policy if exists "own orders read"       on public.orders;
   create policy "own orders read"       on public.orders      for select using (auth.uid() = user_id);`,

  `drop policy if exists "own order items read"  on public.order_items;
   create policy "own order items read"  on public.order_items for select
     using (exists (select 1 from public.orders o where o.id = order_items.order_id and o.user_id = auth.uid()));`,

  `drop policy if exists "own customer read"     on public.customers;
   create policy "own customer read"     on public.customers   for select using (auth.uid() = user_id);`,

  `drop policy if exists "own addresses select"  on public.addresses;
   create policy "own addresses select"  on public.addresses   for select using (auth.uid() = user_id);`,

  `drop policy if exists "own addresses insert"  on public.addresses;
   create policy "own addresses insert"  on public.addresses   for insert with check (auth.uid() = user_id);`,

  `drop policy if exists "own addresses update"  on public.addresses;
   create policy "own addresses update"  on public.addresses   for update using (auth.uid() = user_id) with check (auth.uid() = user_id);`,

  `drop policy if exists "own addresses delete"  on public.addresses;
   create policy "own addresses delete"  on public.addresses   for delete using (auth.uid() = user_id);`,

  `drop policy if exists "own admin read"        on public.admins;
   create policy "own admin read"        on public.admins      for select using (auth.uid() = user_id);`,

  `notify pgrst, 'reload schema';`,
]

// ─── SEED DATA ───────────────────────────────────────────────

const categories = [
  { name: 'Wavy',     slug: 'wavy',     sort_order: 1 },
  { name: 'Straight', slug: 'straight', sort_order: 2 },
  { name: 'Curly',    slug: 'curly',    sort_order: 3 },
  { name: 'Closures', slug: 'closures', sort_order: 4 },
]

const products = [
  // ── CLOSURES ──
  {
    id: 1, slug: 'lace-frontal-13x4', title: 'Lace Frontal 13X4',
    description: 'Premium HD lace frontal for a natural hairline. 13x4 size provides ear-to-ear coverage with versatile parting options.',
    category: 'closures', price_min: 108, price_max: 178, in_stock: true, badge: 'Best Seller', sort_order: 1,
    sizes: ['10"','12"','14"','16"','18"','20"','22"','24"'],
    sizes_prices: {'10"':108,'12"':118,'14"':128,'16"':144,'18"':150,'20"':158,'22"':170,'24"':178},
    features: ['100% Virgin Human Hair','Can be dyed and styled','Natural shine and softness','Tangle-free with proper care'],
    benefits: ['Long-lasting with proper care (6-12 months)','Heat-friendly up to 350°F','Minimal shedding','True to length'],
  },
  {
    id: 2, slug: 'hd-4x4-closure', title: 'HD 4X4 closure',
    description: 'HD lace 4x4 closure for seamless blending. Perfect for creating natural-looking parts and protecting your natural hair.',
    category: 'closures', price_min: 70, price_max: 128, in_stock: true, badge: 'Best Seller', sort_order: 2,
    sizes: ['10"','12"','14"','16"','18"','20"','22"','24"'],
    sizes_prices: {'10"':70,'12"':76,'14"':85,'16"':90,'18"':96,'20"':110,'22"':118,'24"':128},
    features: ['100% Virgin Human Hair','Can be dyed and styled','Natural shine and softness','Tangle-free with proper care'],
    benefits: ['Long-lasting with proper care (6-12 months)','Heat-friendly up to 350°F','Minimal shedding','True to length'],
  },
  {
    id: 3, slug: 'hd-5x5-closure', title: 'HD 5X5 closure',
    description: 'Larger 5x5 HD lace closure offering more parting space and styling versatility. Undetectable and natural-looking.',
    category: 'closures', price_min: 78, price_max: 138, in_stock: true, badge: 'Best Seller', sort_order: 3,
    sizes: ['10"','12"','14"','16"','18"','20"','22"'],
    sizes_prices: {'10"':78,'12"':90,'14"':98,'16"':108,'18"':118,'20"':126,'22"':138},
    features: ['100% Virgin Human Hair','Can be dyed and styled','Natural shine and softness','Tangle-free with proper care'],
    benefits: ['Long-lasting with proper care (6-12 months)','Heat-friendly up to 350°F','Minimal shedding','True to length'],
  },
  {
    id: 4, slug: 'hd-2x6-closure', title: 'HD 2X6 closure',
    description: 'Slim 2x6 HD lace closure perfect for middle parts. Lightweight and natural with invisible knots.',
    category: 'closures', price_min: 70, price_max: 106, in_stock: true, badge: 'Best Seller', sort_order: 4,
    sizes: ['10"','12"','14"','16"','18"','20"'],
    sizes_prices: {'10"':70,'12"':78,'14"':84,'16"':92,'18"':98,'20"':106},
    features: ['100% Virgin Human Hair','Can be dyed and styled','Natural shine and softness','Tangle-free with proper care'],
    benefits: ['Long-lasting with proper care (6-12 months)','Heat-friendly up to 350°F','Minimal shedding','True to length'],
  },
  // ── CURLY ──
  {
    id: 5, slug: 'tight-curly', title: 'Tight Curly',
    description: 'Tight, bouncy curls with maximum volume. Perfect for achieving a bold, voluminous look with defined ringlets.',
    category: 'curly', price_min: 44, price_max: 145, in_stock: true, badge: null, sort_order: 5,
    sizes: ['10"','12"','14"','16"','18"','20"','22"','24"','26"','28"','30"','32"'],
    sizes_prices: {'10"':44,'12"':48,'14"':62,'16"':74,'18"':80,'20"':83,'22"':86,'24"':112,'26"':118,'28"':120,'30"':136,'32"':145},
    features: ['100% Virgin Human Hair','Can be dyed and styled','Natural shine and softness','Tangle-free with proper care'],
    benefits: ['Long-lasting with proper care (6-12 months)','Heat-friendly up to 350°F','Minimal shedding','True to length'],
  },
  {
    id: 6, slug: 'indian-curl', title: 'Indian Curl',
    description: 'Luxurious Indian curls with natural bounce and shine. Soft, silky texture that holds curls beautifully.',
    category: 'curly', price_min: 44, price_max: 145, in_stock: true, badge: 'Best Seller', sort_order: 6,
    sizes: ['10"','12"','14"','16"','18"','20"','22"','24"','26"','28"','30"','32"'],
    sizes_prices: {'10"':44,'12"':48,'14"':62,'16"':74,'18"':80,'20"':83,'22"':86,'24"':112,'26"':118,'28"':120,'30"':136,'32"':145},
    features: ['100% Virgin Human Hair','Can be dyed and styled','Natural shine and softness','Tangle-free with proper care'],
    benefits: ['Long-lasting with proper care (6-12 months)','Heat-friendly up to 350°F','Minimal shedding','True to length'],
  },
  {
    id: 7, slug: 'burmese-curl', title: 'Burmese Curl',
    description: 'Luxurious Burmese curl pattern with defined, bouncy curls. Holds curl pattern beautifully even after washing.',
    category: 'curly', price_min: 44, price_max: 145, in_stock: true, badge: null, sort_order: 7,
    sizes: ['10"','12"','14"','16"','18"','20"','22"','24"','26"','28"','30"','32"'],
    sizes_prices: {'10"':44,'12"':48,'14"':62,'16"':74,'18"':80,'20"':83,'22"':86,'24"':112,'26"':118,'28"':120,'30"':136,'32"':145},
    features: ['100% Virgin Human Hair','Can be dyed and styled','Natural shine and softness','Tangle-free with proper care'],
    benefits: ['Long-lasting with proper care (6-12 months)','Heat-friendly up to 350°F','Minimal shedding','True to length'],
  },
  {
    id: 8, slug: 'italian-curl', title: 'Italian Curl',
    description: 'Elegant Italian curl with loose, romantic curls. Perfect for a glamorous, red-carpet look.',
    category: 'curly', price_min: 44, price_max: 145, in_stock: true, badge: null, sort_order: 8,
    sizes: ['10"','12"','14"','16"','18"','20"','22"','24"','26"','28"','30"','32"'],
    sizes_prices: {'10"':44,'12"':48,'14"':62,'16"':74,'18"':80,'20"':83,'22"':86,'24"':112,'26"':118,'28"':120,'30"':136,'32"':145},
    features: ['100% Virgin Human Hair','Can be dyed and styled','Natural shine and softness','Tangle-free with proper care'],
    benefits: ['Long-lasting with proper care (6-12 months)','Heat-friendly up to 350°F','Minimal shedding','True to length'],
  },
  // ── WAVY ──
  {
    id: 9, slug: 'natural-wave', title: 'Natural Wave',
    description: 'Soft, natural waves for an effortless beachy look. Versatile texture that can be styled straight or curly.',
    category: 'wavy', price_min: 44, price_max: 145, in_stock: true, badge: 'Best Seller', sort_order: 9,
    sizes: ['10"','12"','14"','16"','18"','20"','22"','24"','26"','28"','30"','32"'],
    sizes_prices: {'10"':44,'12"':48,'14"':62,'16"':74,'18"':80,'20"':83,'22"':86,'24"':112,'26"':118,'28"':120,'30"':136,'32"':145},
    features: ['100% Virgin Human Hair','Can be dyed and styled','Natural shine and softness','Tangle-free with proper care'],
    benefits: ['Long-lasting with proper care (6-12 months)','Heat-friendly up to 350°F','Minimal shedding','True to length'],
  },
  {
    id: 10, slug: 'deep-wave', title: 'Deep Wave',
    description: 'Glamorous deep waves with defined S-pattern. Adds volume and movement for a sophisticated look.',
    category: 'wavy', price_min: 44, price_max: 145, in_stock: true, badge: 'Best Seller', sort_order: 10,
    sizes: ['10"','12"','14"','16"','18"','20"','22"','24"','26"','28"','30"','32"'],
    sizes_prices: {'10"':44,'12"':48,'14"':62,'16"':74,'18"':80,'20"':83,'22"':86,'24"':112,'26"':118,'28"':120,'30"':136,'32"':145},
    features: ['100% Virgin Human Hair','Can be dyed and styled','Natural shine and softness','Tangle-free with proper care'],
    benefits: ['Long-lasting with proper care (6-12 months)','Heat-friendly up to 350°F','Minimal shedding','True to length'],
  },
  {
    id: 11, slug: 'indian-wave', title: 'Indian Wave',
    description: 'Beautiful Indian wave texture with natural movement and shine. Versatile styling options from sleek to voluminous.',
    category: 'wavy', price_min: 44, price_max: 145, in_stock: true, badge: null, sort_order: 11,
    sizes: ['10"','12"','14"','16"','18"','20"','22"','24"','26"','28"','30"','32"'],
    sizes_prices: {'10"':44,'12"':48,'14"':62,'16"':74,'18"':80,'20"':83,'22"':86,'24"':112,'26"':118,'28"':120,'30"':136,'32"':145},
    features: ['100% Virgin Human Hair','Can be dyed and styled','Natural shine and softness','Tangle-free with proper care'],
    benefits: ['Long-lasting with proper care (6-12 months)','Heat-friendly up to 350°F','Minimal shedding','True to length'],
  },
  // ── STRAIGHT ──
  {
    id: 12, slug: 'kinky-straight', title: 'Kinky Straight',
    description: 'Natural kinky straight texture that blends seamlessly with relaxed or natural hair. Mimics blown-out natural hair.',
    category: 'straight', price_min: 44, price_max: 145, in_stock: true, badge: null, sort_order: 12,
    sizes: ['10"','12"','14"','16"','18"','20"','22"','24"','26"','28"','30"','32"'],
    sizes_prices: {'10"':44,'12"':48,'14"':62,'16"':74,'18"':80,'20"':83,'22"':86,'24"':112,'26"':118,'28"':120,'30"':136,'32"':145},
    features: ['100% Virgin Human Hair','Can be dyed and styled','Natural shine and softness','Tangle-free with proper care'],
    benefits: ['Long-lasting with proper care (6-12 months)','Heat-friendly up to 350°F','Minimal shedding','True to length'],
  },
  {
    id: 13, slug: 'straight', title: 'Straight',
    description: 'Sleek, silky straight hair for a classic, polished look. Can be curled or styled as desired.',
    category: 'straight', price_min: 44, price_max: 145, in_stock: true, badge: 'Best Seller', sort_order: 13,
    sizes: ['10"','12"','14"','16"','18"','20"','22"','24"','26"','28"','30"','32"'],
    sizes_prices: {'10"':44,'12"':48,'14"':62,'16"':74,'18"':80,'20"':83,'22"':86,'24"':112,'26"':118,'28"':120,'30"':136,'32"':145},
    features: ['100% Virgin Human Hair','Can be dyed and styled','Natural shine and softness','Tangle-free with proper care'],
    benefits: ['Long-lasting with proper care (6-12 months)','Heat-friendly up to 350°F','Minimal shedding','True to length'],
  },
]

// ─── RUNNER ──────────────────────────────────────────────────

async function runSQL(sql, label) {
  // Use the REST API's rpc endpoint to run raw SQL via pg_dump helper
  // Supabase exposes `pg_dump` only for pro — instead we use the
  // Management API via a direct fetch to the SQL endpoint.
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'apikey':        SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({ sql }),
  })
  if (!res.ok) {
    // Try the pg endpoint directly (Supabase Platform SQL endpoint)
    return false
  }
  return true
}

async function setup() {
  console.log('══════════════════════════════════════════════')
  console.log('  Glamm Hair — Supabase Setup Script')
  console.log('  Project: sysbekcoasfkeknpyafc')
  console.log('══════════════════════════════════════════════\n')

  // ── Step 1: Create tables via schema SQL ─────────────────
  console.log('📋 Step 1: Creating tables & RLS policies…\n')

  for (const sql of schemaSQLBlocks) {
    const preview = sql.trim().split('\n')[0].slice(0, 60)
    try {
      const { error } = await supabase.rpc('exec_sql', { sql }).single()
      if (error && !error.message.includes('already exists')) {
        // Some expected "already exists" errors are fine
        if (error.code !== '42P07' && error.code !== '42710') {
          console.warn(`  ⚠  ${preview}…\n     ${error.message}`)
        } else {
          console.log(`  ✓  (exists) ${preview}`)
        }
      } else {
        console.log(`  ✓  ${preview}`)
      }
    } catch (e) {
      console.warn(`  ⚠  ${preview}…\n     ${e.message}`)
    }
  }

  // ── Step 2: Seed categories ───────────────────────────────
  console.log('\n📂 Step 2: Seeding categories…\n')
  for (const cat of categories) {
    const { error } = await supabase
      .from('categories')
      .upsert(cat, { onConflict: 'slug' })
    if (error) {
      console.error(`  ✗  ${cat.name}: ${error.message}`)
    } else {
      console.log(`  ✓  ${cat.name}`)
    }
  }

  // ── Step 3: Seed products ─────────────────────────────────
  console.log('\n💇 Step 3: Seeding products…\n')
  for (const p of products) {
    const row = {
      id:           p.id,
      slug:         p.slug,
      title:        p.title,
      description:  p.description,
      category:     p.category,
      price_min:    p.price_min,
      price_max:    p.price_max,
      sizes:        p.sizes,
      sizes_prices: p.sizes_prices,
      in_stock:     p.in_stock,
      badge:        p.badge ?? null,
      features:     p.features,
      benefits:     p.benefits,
      sort_order:   p.sort_order,
    }
    const { error } = await supabase
      .from('products')
      .upsert(row, { onConflict: 'id' })
    if (error) {
      console.error(`  ✗  ${p.title}: ${error.message}`)
    } else {
      console.log(`  ✓  ${p.title}`)
    }
  }

  console.log('\n══════════════════════════════════════════════')
  console.log('  ✅  Setup complete!')
  console.log(`  📊  ${categories.length} categories  |  ${products.length} products`)
  console.log('══════════════════════════════════════════════\n')
  console.log('Next step → Run the SQL schema manually in the')
  console.log('Supabase SQL Editor if you see any table errors.')
  console.log('Copy from:  e:/xmapp/htdocs/glamm/supabase/\n')
}

setup().catch(err => {
  console.error('\n❌ Fatal error:', err.message)
  process.exit(1)
})
