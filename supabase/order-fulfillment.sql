-- ============================================================
-- Glamm Hair — Order fulfilment (package details, tracking link,
-- shipping-label/package-photo files)
-- Run once in Supabase → SQL Editor → New query → Run. Safe to re-run.
--
-- Package details and files are admin-only fulfilment records — never
-- shown to the customer. Files live in the PRIVATE `shipping-files`
-- storage bucket; this only stores their storage paths, not URLs — the
-- app signs a short-lived URL at view time.
--
-- Before running this, create a PRIVATE bucket named `shipping-files` in
-- Supabase → Storage (the same manual step `claim-photos` was set up
-- with). This file only widens its MIME allowlist, it does not create it.
-- ============================================================

alter table public.orders add column if not exists tracking_url text;
alter table public.orders add column if not exists package_details text;
alter table public.orders add column if not exists shipping_files text[] not null default '{}';

notify pgrst, 'reload schema';

-- No-op (0 rows) until the `shipping-files` bucket exists.
update storage.buckets
set allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif','application/pdf']::text[]
where id = 'shipping-files';
