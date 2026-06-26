# Glamm Hair — Build Status Report

**Prepared for:** Client (USA)
**Prepared by:** Stallioni
**Date:** June 26, 2026
**Re:** Progress against *"Glamm Hair — ECommerce Build on Supabase"* scope (June 6, 2026)

---

## 1. Summary

The store is live in development on the agreed stack — **Next.js 14 storefront + Supabase backend (database, accounts, image storage) + card payments**. The catalog, custom admin, orders, customer accounts, discounts, reviews, shipping, and emails are all built and working on Supabase.

A few larger scope items remain — most importantly the **full product variant matrix** (still size-only today), **server-saved cart**, **per-variant inventory**, **US sales tax**, and **Google login** — several of which are waiting on inputs listed in §9 of the scope (e.g. the attribute list and tax states).

At-a-glance:

| Status | Count of major areas |
|---|---|
| ✅ Delivered | 13 |
| 🟡 Partial / different approach | 4 |
| ⛔ Not yet built (remaining scope) | 6 |

---

## 2. ✅ Delivered

| # | Feature | Scope ref | Notes |
|---|---------|-----------|-------|
| 1 | **Product catalog & categories in Supabase** | §3, §4 | Replaces the old hardcoded product file; the original 22 products migrated into the database. |
| 2 | **Custom admin dashboard (single login)** | §7 | One unified back office — no third-party CMS. Sections: Products, Categories, Orders, Customers, Discounts, Reviews, Blog, Settings. |
| 3 | **Product images via Supabase Storage** | §3 | Uploaded from the admin, served from Supabase's CDN. |
| 4 | **Orders & order status lifecycle** | §3, §7 | Every order stored with items, totals, shipping, payment reference. Status flow pending → paid → processing → shipped → delivered, with tracking numbers. |
| 5 | **Customer accounts (Supabase Auth)** | §3 | Register, login, password reset, account dashboard, order history, and saved addresses. |
| 6 | **Card payments** | §3 | Valor integration (hosted fields) plus Stripe card payments; card data never touches our database (PCI scope minimal). |
| 7 | **Discounts / coupon codes** | §3 | Codes with percentage **or** fixed amount, minimum spend, start/expiry dates, total usage cap, and once-per-customer. Applied at checkout, recorded on the order, shown on the receipt and confirmation email. |
| 8 | **Reviews & ratings with moderation** | §3 | Customer reviews with an admin approve/pending workflow. |
| 9 | **Server-side pricing** | §5 | Order totals are always recomputed on the server from database prices — the browser is never trusted for prices or discounts. |
| 10 | **Shipping rates** | §8 (Ph.2) | Admin-editable flat rate with free-shipping-over-threshold. |
| 11 | **Order & shipping emails** | §8 (Ph.2) | Order confirmation and shipping notification emails (with the discount line on receipts). |
| 12 | **Row-Level Security** | §5 | Enabled on customer/admin data; catalog is public-read, writes go through secure server APIs only. |
| 13 | **Admin niceties** | §7 | Publish/unpublish products (hide without deleting), drag-free catalog ordering (position field + up/down arrows), and an admin-managed Blog (beyond original scope). |

---

## 3. 🟡 Partial / different approach

| Feature | Scope ref | Status |
|---|---|---|
| **Email provider** | §1 | Working via Gmail SMTP rather than Resend/SendGrid. Functionally complete; can be switched to Resend/SendGrid if preferred for deliverability/branding. |
| **Apple Pay / Google Pay** | §9 | Available through Stripe's wallet support (enabled), pending live keys. Not offered through Valor. |
| **Newsletter signup** | §8 (Ph.4) | The signup section is on the storefront, but it is **not yet wired** to a mailing list / storage. Needs a provider choice to finish. |
| **SEO & analytics** | §8 (Ph.4) | Page titles/metadata are in place; a web analytics tag (e.g. Google Analytics) is **not yet integrated**. |

---

## 4. ⛔ Not yet built (remaining scope)

| Feature | Scope ref | What's there today vs. scope |
|---|---|---|
| **Product variant matrix** | §4 | **The key upgrade in the scope.** Products are currently **size-only** (length + price). The full matrix — length × color × texture × density × lace/cap, each combination with its own **SKU, price, and stock** — is not yet built. This needs the **attribute list** from §9 to model. |
| **Per-variant inventory / stock counts** | §4, §7 | Today there is a simple **In stock / Out of stock** toggle per product. Live per-variant stock quantities with transaction-safe decrement on each sale are not yet built (depends on the variant model above). |
| **Server-saved cart** | §3 | The cart currently lives in the browser. A Supabase-backed cart that follows the customer across devices/login is not yet built. |
| **US sales tax (TaxJar / Avalara)** | §1, §3 | No tax calculation yet (orders track subtotal, shipping, discount, total). Needs your **nexus states** and **provider choice** (§9). |
| **Google / social login** | §2 | Currently email/password only. Google sign-in is not yet enabled. |
| **Accessibility (ADA/WCAG) pass** | §5 | A formal accessibility review/pass has not yet been carried out. |

---

## 5. What we need from you to finish (from scope §9)

1. **Attribute list** — full set of colors, textures, lengths, densities, and lace/cap types. *(This unblocks the variant matrix and per-variant inventory — the largest remaining item.)*
2. **Inventory** — do you want to track real stock counts? Single or multiple locations?
3. **Tax** — which US states do you have nexus in, and TaxJar or Avalara?
4. **Payments** — confirm Valor as primary; do you want Apple Pay / Google Pay enabled (via Stripe)?
5. **Newsletter** — which mailing-list provider should the signup connect to?
6. **Content** — product photos per variant, descriptions, and policy text.
7. **Launch target date.**

---

## 6. Notes

- The store currently runs in development at **http://localhost:3007** (port 3000 on this machine is used by another local app). Production will be on Vercel + Supabase as per scope §6.
- Items in §2 above have been verified directly in the codebase and database as of this report's date.

*Prepared by Stallioni — for client review.*
