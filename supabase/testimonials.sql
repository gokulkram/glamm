-- ============================================================
-- Glamm Hair — homepage testimonials ("What Our Customers Say")
-- Run once in Supabase → SQL Editor → New query → Run.
-- Safe to re-run.
--
-- These are the marketing quotes in the homepage carousel, managed from
-- Admin → Testimonials. They are deliberately separate from public.reviews:
-- a testimonial has no product and no rating (the card always shows five
-- stars and "Verified Buyer"), and its `headline` is a sentence, not a name.
--
-- Until this file is run the homepage falls back to the ten seeded quotes
-- hardcoded in lib/testimonials.ts, so the carousel is never empty.
-- ============================================================

create table if not exists public.testimonials (
  id          serial primary key,
  headline    text not null,                      -- bold line on the card
  quote       text not null,                      -- the quoted body
  initial     text not null default '',           -- letter in the avatar circle
  rating      integer not null default 5 check (rating between 1 and 5),
  is_active   boolean not null default true,      -- unchecked = hidden from the homepage
  sort_order  integer not null default 0,         -- display order (reorder_testimonials)
  created_at  timestamptz not null default now()
);

create index if not exists testimonials_sort_order_idx on public.testimonials (sort_order);
create index if not exists testimonials_active_idx     on public.testimonials (is_active);

-- Seed the ten quotes the homepage shipped with, in their current order.
-- Guarded on the table being empty, so re-running this file can never
-- resurrect testimonials the admin has since deleted or rewritten.
insert into public.testimonials (headline, quote, initial, sort_order)
select * from (values
  ('Best hair I''ve ever bought!',                     'Soft, full, and zero shedding. I''m obsessed.',    'B',  1),
  ('My man thought it was my real hair.',              'And honestly… I didn''t correct him.',             'M',  2),
  ('Installed it twice and it still looks new.',       'Quality is crazy good.',                           'I',  3),
  ('I got compliments before I even sat down.',        'This hair is THAT girl.',                          'C',  4),
  ('Shipping was fast and the hair is gorgeous.',      '10/10 experience.',                                'S',  5),
  ('I''m a stylist and I recommend this brand now.',   'Clients love it every time.',                      'R',  6),
  ('The curls stayed popping all week.',               'No frizz, no drama.',                              'T',  7),
  ('I was scared to try a new brand… now I''m loyal.', 'Glamm Hair won me over.',                          'L',  8),
  ('Feels like butter, looks like luxury.',            'I''m not buying hair anywhere else.',              'F',  9),
  ('I don''t usually leave reviews but WOW.',          'This hair gave what it needed to give.',           'W', 10)
) as seed(headline, quote, initial, sort_order)
where not exists (select 1 from public.testimonials);

-- Renumbers the whole table in one atomic statement (see reorder-products.sql
-- for why). The app falls back to per-row updates if this is missing.
create or replace function public.reorder_testimonials(p_ids integer[])
returns void
language sql
security definer
set search_path = public
as $$
  update public.testimonials t
     set sort_order = o.ord
    from unnest(p_ids) with ordinality as o(id, ord)
   where t.id = o.id
     and t.sort_order is distinct from o.ord;
$$;

-- Testimonials are public read-only content; every write goes through an admin
-- API route using the service_role key (which bypasses RLS).
alter table public.testimonials enable row level security;

drop policy if exists "public read active testimonials" on public.testimonials;
create policy "public read active testimonials"
  on public.testimonials for select
  using (is_active);

revoke all on function public.reorder_testimonials(integer[]) from public, anon, authenticated;
grant execute on function public.reorder_testimonials(integer[]) to service_role;

notify pgrst, 'reload schema';
