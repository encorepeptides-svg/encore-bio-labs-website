# Client portal launch checklist

Owner checklist for the Encore Bio Labs client portal. Complete the required
items before inviting real clients. Do not put passwords, API keys, private
client data, or support-message contents in this document.

## Implemented in the application

- Email/password registration, email verification, password reset, and sign-out.
- English and Spanish authentication, onboarding, client, and administrator UI.
- Required consent capture with append-only acceptance records.
- Server-authoritative account states: unverified, onboarding, pending review,
  active, suspended, and closed.
- Transactional administrator approval, correction request, and rejection.
- Progress entries, weekly check-ins, calculators, orders, assigned documents,
  notifications, profile settings, password changes, data-export requests, and
  account-deletion requests.
- Client and administrator support conversations.
- Row-level security, audit/security records, private assigned-document storage,
  short-lived document links, and common query indexes.
- Automated unit, localization, routing, migration-contract, lint, and production
  build checks.

## Required production configuration

- [ ] Apply every migration through
  `202607200002_client_portal_launch.sql` to the production Supabase project.
- [ ] Confirm the production app has the correct Supabase URL and anonymous key.
  The service-role key must never use a `VITE_` variable or reach the browser.
- [ ] Set the Supabase Auth Site URL to the production domain.
- [ ] Allow these production redirect paths in Supabase Auth:
  `/client-login`, `/client-reset-password`, `/es/client-login`, and
  `/es/client-reset-password`.
- [ ] Configure a production SMTP provider and send a verification and password
  reset test. Supabase's default mail service is not suitable for launch volume.
- [ ] Customize both auth emails in English and Spanish, including Encore support
  contact details and the production-domain link.
- [ ] Require MFA for administrator accounts and enable leaked-password
  protection, sensible rate limits, and bot protection where available.
- [ ] Enable database backups (and point-in-time recovery if the plan supports it),
  then record the restoration owner and test date.
- [ ] Confirm no advertising pixel or session-replay script runs on `/portal`,
  `/admin`, or localized equivalents.
- [ ] Configure uptime/error monitoring without recording form values, private
  messages, document URLs, access tokens, or health-adjacent client data.

## Acceptance test before invitations

Use a dedicated test-client address, not a real client's identity.

- [ ] Register in English, receive the verification email, and return to the site.
- [ ] Complete onboarding and every required consent, then submit the application.
- [ ] Confirm the administrator sees the pending application.
- [ ] Request corrections and verify that the client can edit and resubmit.
- [ ] Approve the application and verify that the account becomes active.
- [ ] Add one progress entry and one weekly check-in, then refresh and confirm both.
- [ ] Open a support request, reply as staff, reply as the client, then close it.
- [ ] Confirm an active client's orders are isolated from other client accounts.
- [ ] Assign a harmless test PDF and verify only the assigned client can open its
  short-lived link; revoke it and verify access is removed.
- [ ] Request a data export and account deletion, then verify both enter the staff
  operations queue.
- [ ] Repeat the client journey in Spanish and check layout at phone and desktop
  widths with keyboard-only navigation.
- [ ] Remove or clearly label all test records before inviting real clients.

## Operating decisions required this week

- [ ] Name the primary and backup owners for application review and support.
- [ ] Set response-time targets for applications, corrections, and support.
- [ ] Approve the final Terms, Privacy Notice, research-use acknowledgments, consent
  copy, retention schedule, deletion/export procedure, and incident response plan.
- [ ] Replace placeholder consent body hashes with hashes of the approved versions.
- [ ] Review Supabase, SMTP, monitoring, and storage vendors for data handling,
  retention, subprocessors, security terms, and incident notification.
- [ ] Document how orders and documents are entered and who may assign them.
- [ ] Change any administrator password previously shared in chat, enable MFA, and
  revoke older sessions before launch.

## Deliberately not enabled at launch

Progress-photo uploads remain disabled until the private bucket, explicit photo
consent, quarantine, file validation, malware scanning, staff-view authorization,
and access logging are implemented and tested together. This portal must not be
described as HIPAA compliant without a separate legal, contractual, and technical
assessment.
