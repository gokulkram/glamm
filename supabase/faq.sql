-- ============================================================
-- Glamm Hair — FAQ page questions
-- Run once in Supabase → SQL Editor → New query → Run.
-- Safe to re-run.
--
-- The questions on /faq, managed from Admin → FAQ. Categories are fixed in
-- code (the tabs each have an icon), so `category` is constrained rather than
-- being its own table.
--
-- Until this file is run, /faq falls back to the 24 questions hardcoded in
-- lib/faq.ts, so the page is never empty.
--
-- Answers may contain {{freeThreshold}} and {{standardRate}}, which are
-- substituted at render time from the admin shipping settings. That replaces
-- the old approach of matching one answer by its exact question text, which
-- broke the moment the question was reworded.
-- ============================================================

create table if not exists public.faqs (
  id          serial primary key,
  question    text not null,
  answer      text not null,
  category    text not null default 'products'
                check (category in ('products', 'shipping', 'care', 'returns')),
  is_active   boolean not null default true,      -- unchecked = hidden from /faq
  sort_order  integer not null default 0,         -- display order (reorder_faqs)
  created_at  timestamptz not null default now()
);

create index if not exists faqs_sort_order_idx on public.faqs (sort_order);
create index if not exists faqs_active_idx     on public.faqs (is_active);
create index if not exists faqs_category_idx   on public.faqs (category);

-- Seed the questions the page shipped with, in their current order. Guarded on
-- the table being empty, so re-running can never resurrect questions the admin
-- has since deleted or rewritten.
insert into public.faqs (question, answer, category, sort_order)
select * from (values
  ('What type of hair do you use for your extensions?', 'We use 100% virgin human hair sourced ethically from trusted suppliers. Our hair has never been chemically processed, dyed, or treated, ensuring the highest quality and most natural look. Each bundle is carefully inspected to meet our rigorous standards.', 'products', 1),
  ('How long do the extensions last?', 'With proper care, our extensions can last 6-12 months or even longer. The lifespan depends on how well you maintain them, how often you wear them, and your styling habits. We provide detailed care instructions with every purchase to help you maximize their longevity.', 'products', 2),
  ('Can I dye or color the extensions?', 'Yes! Since our extensions are made from 100% virgin human hair, you can dye, bleach, or color them just like your natural hair. However, we recommend having this done by a professional stylist to ensure the best results and to avoid damage.', 'products', 3),
  ('What''s the difference between the different curl patterns?', 'Each curl pattern offers a unique look: Body Wave has loose, flowing S-shaped waves; Deep Wave features more defined, glamorous waves; Indian Curl has tight, bouncy ringlets; Italian Curly offers medium curls with a silky finish; and Burmese Curl provides beautiful defined curls with volume.', 'products', 4),
  ('How do I choose the right length?', 'Consider your desired final look and your natural hair length. For reference: 12-14" reaches shoulder length, 16-18" reaches mid-back, 20-22" reaches lower back, and 24"+ reaches waist length. We recommend ordering 2-3 bundles for a full, natural look.', 'products', 5),
  ('Are the extensions suitable for all hair types?', 'Yes! Our extensions work beautifully with all hair types and textures. We offer various textures (straight, wavy, curly) to match your natural hair or create your desired look. Our customer service team can help you choose the best match for your hair.', 'products', 6),
  ('What are closures and frontals used for?', 'Closures (4x4, 2x6) and frontals (13x4) are lace pieces that create a natural-looking scalp and hairline. They''re installed at the crown or front of your head to complete your sew-in or wig, allowing for versatile parting and a seamless, undetectable finish.', 'products', 7),
  ('How many bundles do I need?', 'For lengths 10-18", we recommend 2-3 bundles. For 20-24", use 3-4 bundles. For 26"+ or very full looks, consider 4-5 bundles. Add a closure or frontal for complete coverage. Your stylist can provide personalized recommendations based on your desired style.', 'products', 8),
  ('How long does shipping take?', 'Standard shipping takes 3-5 business days within the US. Express shipping (1-2 business days) is available at checkout. International shipping times vary by location (7-14 business days). You''ll receive a tracking number once your order ships.', 'shipping', 9),
  ('Do you offer free shipping?', 'Yes! We offer free standard shipping on all orders over ${{freeThreshold}} within the United States. For orders under ${{freeThreshold}}, standard shipping is ${{standardRate}}. Express shipping is available for an additional fee.', 'shipping', 10),
  ('Can I track my order?', 'Absolutely! Once your order ships, you''ll receive an email with a tracking number. You can use this to track your package in real-time. You can also log into your account on our website to view your order status and tracking information.', 'shipping', 11),
  ('Do you ship internationally?', 'Yes, we ship to most countries worldwide! International shipping costs and delivery times vary by location. Customs fees and import duties may apply and are the responsibility of the customer. Contact us for specific shipping information for your country.', 'shipping', 12),
  ('What if my package is lost or damaged?', 'If your package is lost in transit or arrives damaged, please contact us immediately at support@glammhair.com with your order number and photos (if damaged). We''ll work with the carrier to resolve the issue and ensure you receive your extensions.', 'shipping', 13),
  ('Can I change my shipping address after ordering?', 'If your order hasn''t shipped yet, we can update your address. Please contact us as soon as possible at support@glammhair.com with your order number and new address. Once shipped, we cannot modify the delivery address.', 'shipping', 14),
  ('How do I wash my extensions?', 'Wash your extensions every 10-15 wears or when product buildup occurs. Use sulfate-free shampoo and conditioner, wash in lukewarm water in a downward motion, and avoid rubbing or twisting. Gently squeeze out excess water and air dry on a towel or wig stand.', 'care', 15),
  ('Can I use heat styling tools?', 'Yes! Our virgin human hair can be heat styled just like your natural hair. Always use a heat protectant spray and keep temperatures below 350°F (180°C) to prevent damage. Lower heat settings are better for longevity.', 'care', 16),
  ('How should I store my extensions?', 'Store extensions in a cool, dry place away from direct sunlight. For clip-ins, hang them or lay flat in their original packaging. For bundles, store in a silk or satin bag. Ensure they''re completely dry before storing to prevent mildew.', 'care', 17),
  ('What products should I use?', 'Use sulfate-free, alcohol-free products designed for color-treated or natural hair. Avoid heavy oils and silicones that cause buildup. We recommend leave-in conditioners, heat protectants, and light serums for shine. Avoid products with harsh chemicals.', 'care', 18),
  ('How do I prevent tangling?', 'Brush extensions daily with a wide-tooth comb or loop brush, starting from the ends and working up. Sleep with hair in a loose braid or ponytail on a silk pillowcase. Avoid excessive product buildup and wash regularly to maintain smoothness.', 'care', 19),
  ('Can I swim with my extensions?', 'While possible, we recommend avoiding chlorine and salt water as they can dry out and damage the hair. If you must swim, wet the hair first with clean water, apply leave-in conditioner, and braid it. Wash thoroughly with clarifying shampoo afterward.', 'care', 20),
  ('What is your return policy?', 'We offer a 30-day satisfaction guarantee. If you''re not completely satisfied, you can return unopened, unused bundles in their original packaging for a full refund. Hair must be in resalable condition with all tags attached.', 'returns', 21),
  ('How do I initiate a return?', 'Contact our customer service team at support@glammhair.com with your order number and reason for return. We''ll provide a return authorization number and instructions. Once we receive and inspect the return, we''ll process your refund within 5-7 business days.', 'returns', 22),
  ('Are there any items that cannot be returned?', 'For hygiene reasons, we cannot accept returns on opened bundles, closures, or frontals. Custom-colored or specially ordered items are also non-returnable. All sale and clearance items are final sale.', 'returns', 23),
  ('Do you offer exchanges?', 'Yes! If you need a different length, texture, or quantity, we''re happy to exchange unopened items within 30 days. Contact us to arrange an exchange. You''ll receive a prepaid return label, and we''ll ship your new items once we receive the return.', 'returns', 24)
) as seed(question, answer, category, sort_order)
where not exists (select 1 from public.faqs);

-- Renumbers the whole table in one atomic statement (see reorder-products.sql
-- for why). The app falls back to per-row updates if this is missing.
create or replace function public.reorder_faqs(p_ids integer[])
returns void
language sql
security definer
set search_path = public
as $$
  update public.faqs f
     set sort_order = o.ord
    from unnest(p_ids) with ordinality as o(id, ord)
   where f.id = o.id
     and f.sort_order is distinct from o.ord;
$$;

-- FAQs are public read-only content; every write goes through an admin API
-- route using the service_role key (which bypasses RLS).
alter table public.faqs enable row level security;

drop policy if exists "public read active faqs" on public.faqs;
create policy "public read active faqs"
  on public.faqs for select
  using (is_active);

revoke all on function public.reorder_faqs(integer[]) from public, anon, authenticated;
grant execute on function public.reorder_faqs(integer[]) to service_role;

notify pgrst, 'reload schema';
