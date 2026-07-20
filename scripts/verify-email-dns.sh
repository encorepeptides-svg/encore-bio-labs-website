#!/usr/bin/env bash
# Read-only DNS check for the portal email domain. Confirms the SPF and DKIM
# records a mail provider (e.g. Resend) asked you to add have actually
# propagated, before you rely on them. Changes nothing.
#
# Usage:
#   scripts/verify-email-dns.sh encorebiolabs.com
#   scripts/verify-email-dns.sh encorebiolabs.com resend._domainkey  # custom DKIM selector
set -u

DOMAIN="${1:-encorebiolabs.com}"
DKIM_SELECTOR="${2:-resend._domainkey}"

echo "== Email DNS check for ${DOMAIN} =="
echo

echo "-- SPF (TXT on ${DOMAIN}) --"
spf=$(dig +short TXT "${DOMAIN}" | tr -d '"' | grep -i "v=spf1")
if [ -n "${spf}" ]; then
  echo "  found: ${spf}"
  echo "${spf}" | grep -qi "resend\|include:" && echo "  ok: contains an include mechanism" || echo "  warn: no include: mechanism — confirm it authorizes your provider"
else
  echo "  MISSING: no v=spf1 TXT record found"
fi
echo

echo "-- DKIM (TXT on ${DKIM_SELECTOR}.${DOMAIN}) --"
dkim=$(dig +short TXT "${DKIM_SELECTOR}.${DOMAIN}" | tr -d '"')
if [ -n "${dkim}" ]; then
  echo "  found: ${dkim:0:80}..."
  echo "${dkim}" | grep -qi "p=" && echo "  ok: has a public key (p=)" || echo "  warn: no p= key material"
else
  echo "  MISSING: no DKIM record at ${DKIM_SELECTOR}.${DOMAIN}"
  echo "  note: providers use different selectors — pass yours as arg 2 if not '${DKIM_SELECTOR}'"
fi
echo

echo "-- DMARC (TXT on _dmarc.${DOMAIN}) — optional but recommended --"
dmarc=$(dig +short TXT "_dmarc.${DOMAIN}" | tr -d '"' | grep -i "v=DMARC1")
[ -n "${dmarc}" ] && echo "  found: ${dmarc}" || echo "  not set (optional): consider v=DMARC1; p=none to start"
echo

echo "-- MX on ${DOMAIN} --"
dig +short MX "${DOMAIN}" | sed 's/^/  /' || echo "  none"
echo
echo "Done. MISSING/warn lines above are what to fix in your DNS host before testing send."
