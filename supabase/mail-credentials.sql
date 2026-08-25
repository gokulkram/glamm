-- ============================================================
-- Glamm Hair — Mail (SMTP) credentials for order/shipping emails
-- Run once in Supabase → SQL Editor → New query → Run. Safe to re-run.
--
-- Same pattern as payment-credentials.sql: NO read policy at all. RLS
-- default-denies every request; only the service_role key (which bypasses
-- RLS entirely, via lib/supabase/admin.ts) can read or write it. There is no
-- anon or authenticated access to this table, ever.
-- ============================================================

create table if not exists public.mail_credentials (
  provider    text primary key check (provider in ('smtp')),
  value       jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

alter table public.mail_credentials enable row level security;

notify pgrst, 'reload schema';
