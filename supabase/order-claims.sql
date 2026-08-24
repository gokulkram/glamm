-- ============================================================
-- Glamm Hair — Order claims (customer-reported damaged items)
-- Run once in Supabase → SQL Editor → New query → Run. Safe to re-run.
--
-- Photos live in the PRIVATE `claim-photos` storage bucket. This table
-- stores their storage paths, not URLs — the app signs a short-lived URL
-- at view time so claim photos are never publicly readable.
-- ============================================================

create table if not exists public.order_claims (
  id              uuid primary key default gen_random_uuid(),
  order_id        uuid not null references public.orders (id) on delete cascade,
  user_id         uuid references auth.users (id) on delete set null,
  kind            text not null default 'damaged',
  description     text not null,
  photo_paths     text[] not null default '{}',
  document_paths  text[] not null default '{}',
  status          text not null default 'submitted',
  admin_note      text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Re-run safe: adds the column for a table created before documents existed.
alter table public.order_claims add column if not exists document_paths text[] not null default '{}';

-- One open claim per order: the customer sees its status instead of a
-- second empty form, and support never works two rows for one problem.
create unique index if not exists order_claims_order_id_key on public.order_claims (order_id);
create index if not exists order_claims_status_idx on public.order_claims (status);
create index if not exists order_claims_created_at_idx on public.order_claims (created_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists order_claims_set_updated_at on public.order_claims;
create trigger order_claims_set_updated_at
  before update on public.order_claims
  for each row execute function public.set_updated_at();

-- ============================================================
-- Row Level Security. Our API routes use the service role and derive the
-- order from the session, so these policies are defence in depth rather
-- than the primary gate. Note the API authorises by email match (guest
-- orders are claimed by email), which is wider than auth.uid() = user_id.
-- ============================================================
alter table public.order_claims enable row level security;

drop policy if exists "own claims select" on public.order_claims;
create policy "own claims select" on public.order_claims
  for select using (auth.uid() = user_id);

drop policy if exists "own claims insert" on public.order_claims;
create policy "own claims insert" on public.order_claims
  for insert with check (auth.uid() = user_id);

notify pgrst, 'reload schema';

-- ============================================================
-- The `claim-photos` bucket was created with an images-only MIME allowlist.
-- Documents (PDF) need it widened, or every document upload fails at the
-- storage layer with a 415 regardless of what the app code allows.
-- Guarded so it's a no-op if the bucket has no restriction, or already has one.
-- ============================================================
update storage.buckets
set allowed_mime_types = allowed_mime_types || array['application/pdf']::text[]
where id = 'claim-photos'
  and allowed_mime_types is not null
  and not ('application/pdf' = any(allowed_mime_types));
