-- ============================================================
-- Glamm Hair — Payment gateway credentials (Stripe/Clover keys & tokens)
-- Run once in Supabase → SQL Editor → New query → Run. Safe to re-run.
--
-- Unlike app_settings, this table has NO read policy at all. RLS default-
-- denies every request; only the service_role key (which bypasses RLS
-- entirely, via lib/supabase/admin.ts) can read or write it. There is no
-- anon or authenticated access to this table, ever.
-- ============================================================

create table if not exists public.payment_credentials (
  gateway     text primary key check (gateway in ('stripe', 'clover')),
  value       jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

alter table public.payment_credentials enable row level security;

notify pgrst, 'reload schema';
