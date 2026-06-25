-- ============================================================
-- Glamm Hair — App settings (admin-editable config, e.g. shipping)
-- Run once in Supabase → SQL Editor → New query → Run. Safe to re-run.
-- ============================================================

create table if not exists public.app_settings (
  key         text primary key,
  value       jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

-- Seed shipping defaults (only if not already set).
insert into public.app_settings (key, value)
values ('shipping', '{"freeThreshold":100,"standardRate":8.99}'::jsonb)
on conflict (key) do nothing;

-- Public read (the storefront needs the rates); writes go through the
-- service_role key (which bypasses RLS) from admin API routes only.
alter table public.app_settings enable row level security;
drop policy if exists "public read app_settings" on public.app_settings;
create policy "public read app_settings" on public.app_settings for select using (true);

notify pgrst, 'reload schema';
