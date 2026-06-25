-- ============================================================
-- Glamm Hair — Blog posts (admin-managed blog)
-- Run once in Supabase → SQL Editor → New query → Run.
-- Safe to re-run (idempotent).
-- ============================================================

create table if not exists public.blog_posts (
  id          serial primary key,
  slug        text unique not null,
  title       text not null,
  excerpt     text,
  content     text,                 -- markdown-lite: "## heading", "- bullet", blank-line paragraphs
  author      text,
  category    text,
  image       text,
  read_time   text,
  published   boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists blog_posts_published_idx on public.blog_posts (published);
create index if not exists blog_posts_sort_order_idx on public.blog_posts (sort_order);

-- keep updated_at fresh (reuses the shared function if present)
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists blog_posts_set_updated_at on public.blog_posts;
create trigger blog_posts_set_updated_at
  before update on public.blog_posts
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- Row Level Security: blog is PUBLIC to read; writes happen
-- server-side via the service_role key (which bypasses RLS).
-- ------------------------------------------------------------
alter table public.blog_posts enable row level security;

drop policy if exists "public read blog_posts" on public.blog_posts;
create policy "public read blog_posts"
  on public.blog_posts for select
  using (published = true);

-- ------------------------------------------------------------
-- Seed the three existing posts (only if not already present)
-- ------------------------------------------------------------
insert into public.blog_posts (slug, title, excerpt, author, category, image, read_time, sort_order, created_at, content)
values
(
  '10-tips-for-maintaining-your-hair-extensions',
  '10 Tips for Maintaining Your Hair Extensions',
  'Learn the best practices to keep your extensions looking fresh and beautiful for months.',
  'Sarah Johnson', 'Care Tips', '/lucy-photos/_F8A0427-Edit.jpg', '6 min read', 1, '2024-03-15',
  $md$Premium hair extensions are an investment, and with the right care they can stay soft, full and natural-looking for months. The good news is that a great routine comes down to a handful of simple habits. Here are ten of our favourites.

## Daily & weekly habits

- Brush gently from the ends up to the roots with a loop or soft-bristle brush to avoid tugging at the wefts.
- Always tie your hair back loosely before bed and consider a silk or satin pillowcase to reduce friction.
- Wash only when needed — every 7 to 10 wears is plenty for most people, since extensions do not receive natural scalp oils.
- Use sulphate-free shampoo and a hydrating conditioner, keeping conditioner on the mid-lengths and ends rather than the bonds.

## Heat, products & storage

Virgin human hair can be heat-styled, but always apply a heat protectant first and keep your tools on a medium setting. Avoid leave-in products that contain alcohol, which can dry the hair out over time.

- Let extensions air-dry where possible, and never sleep on wet hair.
- Store clip-ins flat or hanging in a breathable bag — never crumpled in a drawer.
- Keep extensions away from chlorine and salt water, or rinse immediately and condition afterwards.
- Book a professional move-up or re-fit on schedule so the weight stays evenly distributed.

Follow these and your Glamm extensions will keep that just-installed look far longer. When it is finally time for a refresh, browse our latest collection for a perfectly matched set.$md$
),
(
  'how-to-choose-the-right-hair-extension-type',
  'How to Choose the Right Hair Extension Type',
  'A comprehensive guide to selecting the perfect extensions for your hair type and lifestyle.',
  'Emily Davis', 'Guides', '/lucy-photos/_F8A0433-Edit.jpg', '7 min read', 2, '2024-03-10',
  $md$With so many extension types available, choosing the right one can feel overwhelming. The best choice depends on your natural hair, how much time you want to spend styling, and the look you are going for.

## Match the texture first

Start by matching the texture of the extensions to your own hair — wavy, straight or curly — so everything blends seamlessly. 100% virgin human hair gives you the most natural movement and can be coloured and heat-styled like your own.

## Pick a method that fits your routine

- Clip-ins: perfect for occasional volume and length with zero commitment — in and out in minutes.
- Tape-ins: lightweight and discreet, ideal for everyday wear and fine hair.
- Closures & frontals: create a natural-looking hairline and parting for protective installs.
- Bulk hair: the most versatile option for braiding, custom wigs and specialist techniques.

## Consider length, density and lifestyle

Longer lengths need a little more density to look full at the ends, and an active lifestyle may favour lower-maintenance methods. If you are unsure, our team can recommend a set based on a few photos of your hair.

Take your time with this step — the right match makes the difference between extensions that read as obviously added and a finish nobody can tell apart from your own hair.$md$
),
(
  'summer-hair-care-protecting-your-extensions',
  'Summer Hair Care: Protecting Your Extensions',
  'Essential tips for keeping your extensions healthy during the hot summer months.',
  'Jessica Lee', 'Seasonal', '/lucy-photos/_F8A0475-Edit.jpg', '5 min read', 3, '2024-03-05',
  $md$Sun, salt water, chlorine and heat all add up over a summer. A few extra precautions will keep your extensions hydrated and vibrant from June through September.

## Before the beach or pool

- Dampen your hair with clean water and add a leave-in conditioner before swimming — saturated hair absorbs less chlorine and salt.
- Tie hair into a loose braid to reduce tangling in the water and wind.
- Wear a hat for shade; UV exposure can lift colour and dry the hair over time.

## After sun & water

Always rinse thoroughly as soon as you are out of the pool or sea, then follow with a hydrating conditioner or mask. Pat dry with a microfibre towel rather than rubbing, and let the hair air-dry whenever you can.

- Use a weekly deep-conditioning treatment to replace lost moisture.
- Minimise additional heat styling on days you have had a lot of sun.
- Refresh second-day hair with a light mist of water and a little leave-in rather than re-washing.

With a little planning your extensions will sail through the warm months looking glossy and healthy — ready for every holiday photo.$md$
)
on conflict (slug) do nothing;

-- Refresh PostgREST schema cache so the new table is queryable immediately.
notify pgrst, 'reload schema';
