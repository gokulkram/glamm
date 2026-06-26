# Fix: Password-Reset Email (Supabase) — Step-by-Step Checklist

**Site:** https://glamm.vercel.app
**Supabase project:** `sysbekcoasfkeknpyafc`
**Date:** June 26, 2026

## What's wrong (diagnosed)

The forgot-password page works in code, but two Supabase **project settings** break it in production:

1. **Reset link points to `http://localhost:3000`** instead of the live site — because the Supabase **Site URL** is still localhost and the Vercel domain isn't in the **Redirect URLs** allowlist. Even when the email arrives, the link is broken for real users.
2. **Email delivery is unreliable** — the reset email is sent by **Supabase Auth's own mailer** (not the Gmail SMTP used for order emails). With no **custom SMTP** configured, Supabase's built-in email is rate-limited (~2–4/hour, "development only") and often doesn't reach inboxes.

> These are dashboard settings — they cannot be fixed from the app code. Project owner access to the Supabase dashboard is required.

---

## Part A — Point reset links at the live site

**Supabase Dashboard → Authentication → URL Configuration**

- [ ] Set **Site URL** to:
  ```
  https://glamm.vercel.app
  ```
- [ ] Under **Redirect URLs**, click **Add URL** and add:
  ```
  https://glamm.vercel.app/**
  ```
- [ ] (Optional, for local development) also add:
  ```
  http://localhost:3007/**
  ```
  *(Local dev now runs on port 3007, not 3000.)*
- [ ] Click **Save**.

✅ **Result:** reset links will now redirect to `https://glamm.vercel.app/account/reset-password`.

---

## Part B — Make emails actually deliver (custom SMTP)

**Supabase Dashboard → Authentication → Emails → SMTP Settings** (toggle **Enable Custom SMTP**)

Reuse the same Gmail credentials already used for the store's order emails (or switch to Resend/SendGrid — see note below).

**Gmail SMTP option (matches current order-email setup):**

- [ ] **Enable Custom SMTP**: ON
- [ ] **Sender email**: the Gmail address you send order emails from (e.g. `orders@yourdomain` / your Gmail)
- [ ] **Sender name**: `Glamm Hair`
- [ ] **Host**: `smtp.gmail.com`
- [ ] **Port**: `465` (SSL) — or `587` (TLS)
- [ ] **Username**: the full Gmail address
- [ ] **Password**: the Gmail **App Password** (the 16-char app password, not the normal login password)
- [ ] Click **Save**.

> The app password is the same kind your order-confirmation emails already use — check the SMTP environment variables in the project's email config / Vercel env vars.

**Recommended alternative (per scope §1):** Resend or SendGrid give better deliverability and higher limits than Gmail for transactional mail. If you go this route, create an account, verify your sending domain, and paste their SMTP host/port/username/API-key into the same SMTP form.

---

## Part C — Confirm the email template is on

**Supabase Dashboard → Authentication → Emails → Templates**

- [ ] Open the **Reset Password** template.
- [ ] Confirm it is **enabled** and the body contains the confirmation link variable (default: `{{ .ConfirmationURL }}`).
- [ ] (Optional) Brand the subject/body, e.g. subject `Reset your Glamm Hair password`.

---

## Part D — Verify end-to-end

- [ ] Go to **https://glamm.vercel.app/account/forgot-password**.
- [ ] Enter the email of a **real, registered** account (a customer that exists in the system).
- [ ] Submit — the page should show "Check your email".
- [ ] Open the inbox (check **Spam** too on the first try):
  - [ ] The email arrived.
  - [ ] The reset link host is **glamm.vercel.app** (not localhost).
- [ ] Click the link → it opens **https://glamm.vercel.app/account/reset-password** and lets you set a new password.
- [ ] Log in with the new password.

If the email doesn't arrive after Part B, recheck the SMTP username/password (App Password) and the sender address, and confirm Custom SMTP is toggled **ON**.

---

## Notes

- **Two separate email systems:** order/shipping confirmations use the app's Gmail SMTP (via Nodemailer); **auth emails** (password reset, signup) use **Supabase's** mailer configured above. Fixing one does not fix the other.
- **Rate limits:** without custom SMTP, Supabase caps auth emails to a few per hour — fine for a quick test, not for production.
- **No code change needed:** the storefront already sends the correct request with the right redirect; these are project-configuration fixes only.
