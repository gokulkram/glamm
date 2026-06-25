-- ============================================================
-- Glamm Hair — Payments: idempotent order finalisation
-- OPTIONAL hardening. Orders already dedupe on transaction_id in code, so
-- card checkout works without this. This unique index makes the dedupe
-- race-safe (return page + webhook finalising the same payment concurrently).
-- Run once in Supabase → SQL Editor → New query → Run. Safe to re-run.
-- ============================================================

create unique index if not exists orders_transaction_id_key
  on public.orders (transaction_id)
  where transaction_id is not null;

notify pgrst, 'reload schema';
