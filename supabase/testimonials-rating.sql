-- ============================================================
-- Glamm Hair — star rating on testimonials
-- Run once in Supabase → SQL Editor → New query → Run.
-- Safe to re-run.
--
-- Adds the per-testimonial `rating` the admin picks with the star selector.
-- The homepage carousel draws that many stars on the card, and the badge above
-- it ("4.9/5 from N verified reviews") is the average and count of the ratings
-- on the visible testimonials — nothing about it is typed in any more.
--
-- Existing rows become 5 stars, which is what the carousel drew before.
-- The app falls back to 5 stars for every card while this file hasn't been
-- run, so the homepage looks unchanged in the meantime.
-- ============================================================

alter table public.testimonials
  add column if not exists rating integer not null default 5;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'testimonials_rating_check'
  ) then
    alter table public.testimonials
      add constraint testimonials_rating_check check (rating between 1 and 5);
  end if;
end $$;

notify pgrst, 'reload schema';
