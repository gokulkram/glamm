-- ============================================================
-- Glamm Hair — Product reviews (admin-moderated)
-- Run once in Supabase → SQL Editor → New query → Run. Safe to re-run.
-- ============================================================

create table if not exists public.reviews (
  id           serial primary key,
  product_id   integer not null,
  user_id      uuid,
  author_name  text not null,
  rating       integer not null check (rating between 1 and 5),
  title        text,
  body         text,
  status       text not null default 'pending',   -- pending | approved | rejected
  sort_order   integer not null default 0,         -- admin display order (reorder-reviews.sql)
  created_at   timestamptz not null default now()
);

create index if not exists reviews_product_idx on public.reviews (product_id);
create index if not exists reviews_status_idx  on public.reviews (status);
create index if not exists reviews_sort_order_idx on public.reviews (sort_order);

-- Only approved reviews are public; submissions & moderation go through the
-- service_role key (which bypasses RLS) in the API routes.
alter table public.reviews enable row level security;
drop policy if exists "public read approved reviews" on public.reviews;
create policy "public read approved reviews"
  on public.reviews for select
  using (status = 'approved');

notify pgrst, 'reload schema';
