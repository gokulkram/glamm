# Glamm Hair

Next.js 14 (App Router) storefront and custom admin panel, backed by Supabase
for the database, auth, and image storage.

## Local development

```bash
npm install
npm run dev -- -p 3010
```

Port **3010**, not the Next default — port 3000 is taken by XAMPP's Apache on
the current dev machine.

Whatever port you use has to be in the Supabase **Redirect URLs** allowlist
(Authentication → URL Configuration) as `http://localhost:<port>/**`, or
password-reset links break locally. Add `http://localhost:3010/**`.
`docs/Supabase-Password-Reset-Email-Checklist.md` still names 3007 — it is
out of date on the port only; the rest of that checklist stands.

## Environment

Copy the values into `.env.local` (never commit it). The app reads:

| Variable | Needed for |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | every Supabase call |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | storefront + customer auth |
| `SUPABASE_SERVICE_ROLE_KEY` | admin API routes — bypasses RLS, server only |
| `ADMIN_EMAILS` | comma-separated allowlist for the admin panel |
| `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` | Stripe checkout |
| `VALOR_APP_ID`, `VALOR_APP_KEY`, `VALOR_EPI`, `VALOR_DEMO_MODE` | Valor card payments |
| `CLOVER_MERCHANT_ID`, `CLOVER_PRIVATE_TOKEN`, `CLOVER_MODE`, `NEXT_PUBLIC_CLOVER_MERCHANT_ID`, `NEXT_PUBLIC_CLOVER_PUBLIC_TOKEN` | Clover card payments |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | order and shipping emails |
| `ORDER_NOTIFY_EMAILS` | who gets notified of new orders |

`ADMIN_EMAILS` is **default-deny**: with it unset, nobody can reach `/admin`.

## Database setup

There is no migration runner. Every schema change is a file in `supabase/`
that you paste into **Supabase Dashboard → SQL Editor → New query → Run**.
All of them are idempotent — safe to re-run, and guarded so a re-run cannot
overwrite data you have since edited.

Run in this order on a fresh project:

| # | File | What it adds |
|---|---|---|
| 1 | `schema.sql` | orders and order items |
| 2 | `products.sql` | categories and products |
| 3 | `customers.sql` | customer records |
| 4 | `admins.sql` | admin profiles |
| 5 | `addresses.sql` | per-customer address book |
| 6 | `settings.sql` | `app_settings` key/value table (shipping rates, page copy) |
| 7 | `reviews.sql` | product reviews with moderation |
| 8 | `coupons.sql` | discount codes and redemptions |
| 9 | `blog.sql` | blog posts |
| 10 | `reorder-products.sql` | batched catalog renumbering function |
| 11 | **`testimonials.sql`** | homepage testimonials table, seed, reorder function |
| 12 | **`testimonials-rating.sql`** | per-testimonial star `rating` column |
| 13 | **`reorder-reviews.sql`** | `sort_order` on reviews + reorder function |
| 14 | `valor.sql` | optional: makes payment dedupe race-safe |

`full-setup.sql` is an older all-in-one bundle covering only steps 1–5 (orders,
products, customers, admins, addresses). It predates everything after that, so
it is not a substitute for the list above.

### Testimonials

The homepage "What Our Customers Say" carousel is managed from
**Admin → Testimonials**: add, edit, hide, and drag to reorder the quotes, set
each one's star rating, and edit the eyebrow/heading copy above the carousel.

Three files back it, in order:

1. **`testimonials.sql`** — creates `public.testimonials` (headline, quote,
   avatar initial, rating, `is_active`, `sort_order`), seeds the ten quotes the
   homepage originally shipped with, and adds `reorder_testimonials()` for
   batched renumbering. RLS is on: public read is limited to active rows, and
   every write goes through an admin API route on the service-role key.
2. **`testimonials-rating.sql`** — adds the `rating` column (1–5, default 5)
   that the star picker sets. On a **fresh** project this is a no-op: step 1
   already creates the column. It exists for projects set up before ratings
   were added, where it backfills every existing row to 5 stars — which is what
   the carousel drew before. Run it either way; it is safe.
3. **`reorder-reviews.sql`** — unrelated to testimonials, but shipped in the
   same change: adds `sort_order` to `reviews` so the admin Reviews list can be
   dragged into order, and backfills today's newest-first order as the starting
   rank. Required even on a fresh project — `reviews.sql` creates the column
   but not the `reorder_reviews()` function.

The seed in step 1 is guarded on the table being empty, so re-running it can
never resurrect testimonials you have since deleted or rewritten.

**The rating badge is derived, not typed.** The "4.9/5 from 10 verified
reviews" line above the carousel is the average and count of the stars on the
*visible* testimonials. Hiding a card moves the badge with it. The admin page
shows you the exact string it will produce.

#### If you skip a file

Each one fails soft, which is convenient but makes a half-finished setup hard
to spot — the site looks fine either way:

| Not run | What you get |
|---|---|
| `testimonials.sql` | homepage falls back to the ten quotes hardcoded in `lib/testimonials.ts`; Admin → Testimonials cannot save, and its reorder route returns **501** naming the file |
| `testimonials-rating.sql` | every card renders 5 stars and the badge reads a flat `5.0/5`, whatever you pick in the admin |
| `reorder-reviews.sql` | reviews keep their old newest-first order; the admin reorder route returns **501** naming the missing file |

So a carousel of ten five-star quotes is *not* evidence the SQL ran. To confirm
it did: set one testimonial to 4 stars, save, reload, and check the badge drops
below 5.0 — then set it back, since the badge is live on the storefront. That
exercises the read and write path for the one column the fallback hides.

## Project layout

```
app/                 routes — storefront, (panel) admin, api/
  admin/(panel)/     admin UI, one folder per section
  api/admin/         admin-only endpoints (service-role key)
components/          shared UI
lib/                 data access and business logic
  admin/             reposition.ts holds the ordering maths every list shares
supabase/            SQL files — run by hand, see above
docs/                client-facing feature summaries
```

Reorder behaviour is shared in two layers. `lib/admin/reposition.ts` holds the
position maths for every ordered table (products, reviews, testimonials);
`lib/admin/reorderRoute.ts` builds the whole POST handler on top of it, and is
what the reviews and testimonials routes are — products predate it and keep
their own route over the same helpers.

A reorder request places a row in one of three ways:

| Body | Sent by |
|---|---|
| `{ id, direction: 'up' \| 'down' }` | the ▲/▼ buttons |
| `{ id, targetId, placement: 'before' \| 'after' }` | drag and drop |
| `{ id, position }` (1-based) | the "move to #" input |

Positions are always resolved server-side against the live table, so a stale
admin list still produces the move the user aimed for.
