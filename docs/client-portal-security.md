# Encore Bio Labs client portal security model

## Threat model

Primary threats include account takeover, credential stuffing, cross-account data access, role escalation, insecure direct-object references, public document/photo exposure, malicious uploads, session/token leakage, unauthorized staff access, consent-history alteration, and sensitive data entering logs, analytics, URLs, or email.

## Data classification

- Public: catalog and public research content.
- Internal: operational status, non-sensitive audit metadata, staff assignments.
- Confidential: client contact information, onboarding, orders, support threads, consent records.
- Restricted: progress measurements/photos, security events, signed agreements, private documents, administrative notes.

## Role and authorization model

Roles are `client`, `support`, `admin`, and `super_admin`. Roles are stored in `user_roles`, never accepted from browser input, and evaluated by security-definer helper functions plus RLS. Client policies require `auth.uid()` ownership. Staff access is narrowly scoped. Only super admins may change privileged roles; this must execute through a privileged Edge Function with a reason and audit event.

## Authentication model

Supabase Auth manages passwords, verification, recovery, refresh tokens, and session expiration. The application uses `getUser()` for server-verified identity checks and `onAuthStateChange` for UI state. No application table stores passwords or tokens. Generic errors are shown to clients. Staff MFA is required before production administrative access.

## Storage model

`portal-documents` is a private, PDF-only bucket. Active assignments authorize authenticated, short-lived signed URLs through storage RLS. `progress-photos` must remain disabled until its private bucket, explicit consent, type/size validation, randomized paths, quarantine status, malware scanning, staff-view authorization, and access logging are implemented together.

## Logging policy

Audit events record actor, event, resource type/id, success, IP/user-agent only where legally and operationally appropriate, and redacted metadata. Never log passwords, tokens, private message bodies, progress-photo contents, or unnecessary health-adjacent data.

## Photo and document access

Clients control staff visibility for progress photos. Every staff photo view is audited. Support has no default photo access. Documents require explicit assignment, active visibility, and authenticated signed URLs. View and download actions are audited.

## Incident response and backups

Define owners for account compromise, privilege escalation, data exposure, malicious uploads, and vendor incidents. Preserve audit evidence, revoke sessions/URLs, rotate affected secrets, notify stakeholders under applicable law, and document lessons learned. Enable managed database backups and regularly test recovery; private object storage needs a documented retention/recovery plan.

## Vendor review requirements

Review Supabase, email delivery, malware scanning, monitoring, analytics, and any support tooling for data handling, retention, subprocessors, regional controls, breach terms, and deletion/export support. Do not enable advertising pixels or session replay on portal routes.

## Remaining production work

- Apply and review all migrations in production after a staging rehearsal.
- Configure redirect allowlists, a production SMTP provider, transactional email templates, rate limits, bot protection, and staff MFA enforcement.
- Add a privileged workflow for role changes and fulfillment/document operations rather than exposing those writes to the browser.
- Policy-test private assigned-document storage against two-client and revoked-assignment cases.
- Add full integration tests against staging, dependency/secret scanning, CSP and secure headers.
- Complete accessibility, legal/privacy, retention, backup, vendor, and incident-response reviews.
- Implement progress-photo quarantine and scanning before enabling uploads.
- This portal is not by itself a claim of HIPAA compliance or complete production security.
