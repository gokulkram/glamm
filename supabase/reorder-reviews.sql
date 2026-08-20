-- ============================================================
-- Glamm Hair — hand-ordered reviews
-- Run once in Supabase → SQL Editor → New query → Run.
-- Safe to re-run.
--
-- Adds the `sort_order` column the admin Reviews list drags rows into, plus a
-- batched renumbering function (same shape as reorder-products.sql). Product
-- pages list approved reviews in this order, so a drag in the admin is live on
-- the storefront immediately.
--
-- The app falls back to the previous newest-first ordering while this file
-- hasn't been run, so reviews keep showing either way.
-- ============================================================

alter table public.reviews
  add column if not exists sort_order integer not null default 0;

create index if not exists reviews_sort_order_idx on public.reviews (sort_order);

-- One-time backfill: freeze today's newest-first order as the starting rank.
-- Guarded so re-running this file can never flatten an order the admin has
-- since curated — it only fires while every row is still at the 0 default.
do $$
begin
  if not exists (select 1 from public.reviews where sort_order <> 0) then
    update public.reviews r
       set sort_order = o.ord
      from (
        select id, row_number() over (order by created_at desc, id desc) as ord
          from public.reviews
      ) o
     where r.id = o.id;
  end if;
end $$;

-- Renumbers the whole table in one atomic statement. Without it the app writes
-- one UPDATE per moved row, which is slow for a long drag and lets two
-- overlapping reorders interleave.
create or replace function public.reorder_reviews(p_ids integer[])
returns void
language sql
security definer
set search_path = public
as $$
  update public.reviews r
     set sort_order = o.ord
    from unnest(p_ids) with ordinality as o(id, ord)
   where r.id = o.id
     and r.sort_order is distinct from o.ord;
$$;

-- Admin-only: all writes go through API routes using the service_role key.
revoke all on function public.reorder_reviews(integer[]) from public, anon, authenticated;
grant execute on function public.reorder_reviews(integer[]) to service_role;

notify pgrst, 'reload schema';
