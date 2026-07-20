# Portal email launch runbook (Supabase custom SMTP + auth emails)

Canonical steps to make the client-portal verification and password-reset emails
reliable, bilingual, and proven. Human-only steps are marked **[operator]**;
verifiable steps are marked **[agent]** and are handled by the
`portal-email-launch` agent (`.claude/agents/portal-email-launch.md`).

Do not put API keys, SMTP passwords, or any secret in this file or in chat.

## 1. Email provider + DNS  **[operator]**

Recommended: **Resend** (simple, generous free tier for auth email).

1. Sign up at resend.com → **Domains → Add Domain** → `encorebiolabs.com`.
2. Add the 3–4 DNS records Resend shows (DKIM TXT + SPF/return-path) at your DNS
   host (registrar, or Vercel/Cloudflare if nameservers moved there). Copy record
   names exactly.
3. Wait for **Verified** (minutes–1 hour). This is the SPF/DKIM step that keeps
   mail out of spam.
4. **API Keys → Create API Key** (send access is enough). This value is your SMTP
   password. Keep it out of chat and out of git.

SMTP values: host `smtp.resend.com`, port `465`, username `resend`,
password = the API key.

**[agent]** After the records are added: `scripts/verify-email-dns.sh encorebiolabs.com`
(pass your DKIM selector as arg 2 if it isn't `resend._domainkey`).

## 2. Supabase custom SMTP  **[operator]**

Dashboard → project → **Authentication → Emails → SMTP Settings**
(fallback location: **Project Settings → Authentication**).

1. Enable **Custom SMTP**.
2. Sender email `no-reply@encorebiolabs.com`, sender name `Encore Bio Labs`.
3. Host `smtp.resend.com`, port `465`, username `resend`, password = API key. Save.
4. **Authentication → Rate Limits**: raise the email rate limit (~30–50/hour;
   Supabase caps it very low until custom SMTP is enabled).

**[agent]** Prove it: operator sets `SMTP_HOST/PORT/USER/PASS/FROM/TO` env vars,
then runs `scripts/smtp-send-test.sh` (sends one real message via curl; no secret
touches the agent).

## 3. URL configuration  **[operator]**

Dashboard → **Authentication → URL Configuration**.

1. **Site URL** = the canonical production domain, exactly
   (`https://encorebiolabs.com` or the `www` form — pick one and be consistent).
2. **Redirect URLs** — add all eight (four paths × EN/ES). Use `www` in all if
   that's your canonical host:
   - `https://encorebiolabs.com/client-login`
   - `https://encorebiolabs.com/client-reset-password`
   - `https://encorebiolabs.com/es/client-login`
   - `https://encorebiolabs.com/es/client-reset-password`
   - `https://encorebiolabs.com/client-register`
   - `https://encorebiolabs.com/client-forgot-password`
   - `https://encorebiolabs.com/es/client-register`
   - `https://encorebiolabs.com/es/client-forgot-password`

A "redirect not allowed" error later means a URL here doesn't match exactly.

**[agent]** Confirms these paths exist in `src/App.tsx` so the allowlist is right.

## 4. Email templates  **[operator]**

Dashboard → **Authentication → Emails → Templates**.

| Template | Paste from | Subject |
|---|---|---|
| Confirm sign up | `docs/email-templates/confirm-signup.html` | `Verify your email \| Verifica tu correo — Encore Bio Labs` |
| Reset password | `docs/email-templates/reset-password.html` | `Reset your password \| Restablece tu contraseña — Encore Bio Labs` |

Both stack English then Spanish in one email (Supabase has one template per
action), styled navy/teal with a contact link and RUO footer. Leave magic-link,
invite, and email-change templates at defaults — the portal doesn't use them yet.

**[agent]** Validates both files contain `{{ .ConfirmationURL }}`, both language
blocks, the contact link, and the RUO footer.

## 5. Live test  **[operator]** (agent co-drives the non-secret parts)

1. Register on production at `/client-register` with an address you control
   (keep this account — it seeds the acceptance journey).
2. Verification email should arrive within ~1 min: branded, bilingual, **inbox
   not spam**, and its button lands on `/client-login`.
3. Gmail → open message → ⋮ → **Show original** → confirm `SPF: PASS` and
   `DKIM: PASS`. Failure = a DNS record from step 1 is wrong or not propagated.
4. `/client-forgot-password` → request reset → complete the password change from
   the email link.
5. Repeat the reset check from the Spanish side: `/es/client-forgot-password`
   must land on `/es/client-reset-password`.

## Done criteria

- A real verification email observed in an inbox with SPF and DKIM passing.
- A password reset completed from a real email link, EN and ES.
- All eight redirect URLs allowlisted; Site URL matches production exactly.
- Both templates in place with correct subjects.

This runbook does not cover the other launch-blockers (admin password rotation +
MFA, consent hashes, full acceptance journey) — see
`docs/client-portal-launch-checklist.md`.
