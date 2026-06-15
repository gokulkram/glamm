-- ============================================================
-- Glamm Hair — Admins table (admin profiles)
-- Run once in Supabase → SQL Editor → New query → Run. Safe to re-run.
-- ============================================================

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

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists admins_set_updated_at on public.admins;
create trigger admins_set_updated_at
  before update on public.admins
  for each row execute function public.set_updated_at();

-- ============================================================
-- Row Level Security — admin rows are private. The server
-- (service_role) manages them; an admin may read their own row.
-- Authorization to the panel is still enforced by ADMIN_EMAILS.
-- ============================================================
alter table public.admins enable row level security;

drop policy if exists "own admin read" on public.admins;
create policy "own admin read" on public.admins
  for select using (auth.uid() = user_id);

notify pgrst, 'reload schema';
