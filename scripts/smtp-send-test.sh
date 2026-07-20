#!/usr/bin/env bash
# Sends one real test email through your SMTP provider to prove the credentials
# and connection work end-to-end — the same path Supabase Auth will use.
#
# Secrets come from environment variables so nothing is pasted into a chat or
# committed. Set them in your own shell, then run this:
#
#   export SMTP_HOST=smtp.resend.com
#   export SMTP_PORT=465
#   export SMTP_USER=resend
#   export SMTP_PASS=<your-provider-api-key>     # not stored anywhere
#   export SMTP_FROM=no-reply@encorebiolabs.com
#   export SMTP_TO=you@personal-address.com
#   scripts/smtp-send-test.sh
set -euo pipefail

: "${SMTP_HOST:?set SMTP_HOST (e.g. smtp.resend.com)}"
: "${SMTP_PORT:=465}"
: "${SMTP_USER:?set SMTP_USER (e.g. resend)}"
: "${SMTP_PASS:?set SMTP_PASS (your provider API key — not logged)}"
: "${SMTP_FROM:?set SMTP_FROM (e.g. no-reply@encorebiolabs.com)}"
: "${SMTP_TO:?set SMTP_TO (an inbox you control)}"

msg="$(mktemp)"
trap 'rm -f "$msg"' EXIT
cat > "$msg" <<EOF
From: Encore Bio Labs <${SMTP_FROM}>
To: <${SMTP_TO}>
Subject: Encore SMTP test — $(date -u +%Y-%m-%dT%H:%M:%SZ)
Content-Type: text/plain; charset=utf-8

This is a live SMTP delivery test for the Encore Bio Labs client portal.
If you received it in your inbox (not spam), custom SMTP is wired correctly.

Next: open this message's raw source and confirm SPF=pass and DKIM=pass.
EOF

echo "Sending via ${SMTP_HOST}:${SMTP_PORT} as ${SMTP_FROM} -> ${SMTP_TO} ..."
curl --silent --show-error --ssl-reqd \
  --url "smtps://${SMTP_HOST}:${SMTP_PORT}" \
  --user "${SMTP_USER}:${SMTP_PASS}" \
  --mail-from "${SMTP_FROM}" \
  --mail-rcpt "${SMTP_TO}" \
  --upload-file "$msg"

echo
echo "Accepted by the SMTP server. Now check ${SMTP_TO}:"
echo "  1. It should be in the inbox, not spam."
echo "  2. Open raw/original source and confirm SPF: pass and DKIM: pass."
echo "  3. If it went to spam or auth failed, re-check DNS with scripts/verify-email-dns.sh."
