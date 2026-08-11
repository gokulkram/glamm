-- ============================================================
-- Glamm Hair — batched catalog renumbering
-- Run once in Supabase → SQL Editor → New query → Run.
-- Safe to re-run.
--
-- Drag-to-reorder can move a product across dozens of positions, and every
-- product in between has to be renumbered. Doing that as one UPDATE per row
-- means dozens of sequential PostgREST round-trips inside a single serverless
-- request. This function renumbers the whole catalog in one statement, which
-- is also atomic — two overlapping reorders can no longer interleave and
-- corrupt the numbering.
--
-- The app falls back to per-row updates if this function is missing, so the
-- site keeps working before this file is run.
-- ============================================================

create or replace function public.reorder_products(p_ids integer[])
returns void
language sql
security definer
set search_path = public
as $$
  update public.products p
     set sort_order = o.ord
    from unnest(p_ids) with ordinality as o(id, ord)
   where p.id = o.id
     and p.sort_order is distinct from o.ord;
$$;

-- Admin-only: all writes go through API routes using the service_role key.
revoke all on function public.reorder_products(integer[]) from public, anon, authenticated;
grant execute on function public.reorder_products(integer[]) to service_role;
