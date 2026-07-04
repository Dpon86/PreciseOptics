# PreciseOptics - Master TODO (Canonical)

Last updated: May 10, 2026
Status: Active source of truth for all remaining work

This file is now the canonical TODO list for the repository.
Consolidated from:
- docs/planning/TODO_CHECKLIST.md
- docs/planning/UPDATED_TODO_PRIORITY.md
- frontend/to do

## 1) Critical Production Readiness

- [ ] Provision production PostgreSQL or MySQL instance
- [ ] Execute SQLite to production DB cutover rehearsal in staging
  - [x] Rehearsal automation script added (`Backend/scripts/rehearse_sqlite_to_postgres.sh`)
  - [ ] Run rehearsal on staging and capture duration + validation output
- [ ] Execute production cutover with rollback window
- [ ] Configure production Sentry project, DSN, and alert routing
- [ ] Run first encrypted backup on production
- [ ] Run first restore drill in staging and record results against:
  - [ ] RTO <= 4 hours
  - [ ] RPO <= 24 hours
- [ ] Verify cron backup schedule on production host
- [ ] Confirm production env values are complete and secure:
  - [ ] DEBUG=False
  - [ ] Strong SECRET_KEY
  - [ ] Correct ALLOWED_HOSTS
  - [ ] HTTPS frontend URL and CORS origins

## 2) Remaining Product Features

### Protocol workflow enhancements
- [ ] Build loading dose workflow UI
- [ ] Add auto-suggest next step for assigned patient protocols
- [ ] Add protocol medication schedule display (when and what to use)

### Community scans and referral enrichment
- [ ] Add scan_type to referral documents
- [ ] Build community scans page and filters
- [ ] Link community scans to patient and eye test records
- [ ] Add report view for community scans

### High street optician integration
- [ ] Add source type for high street opticians
- [ ] Add two-way communication workflow
- [ ] Add outbound status updates to referrers

### Batch tracking follow-through
- [ ] Add batch recall alert workflow
- [ ] Add batch usage statistics tracking

## 3) Testing and Quality Gaps

- [ ] Backend API integration tests across critical workflows
- [ ] Performance testing and report endpoint benchmarks
- [ ] Security testing (OWASP, auth bypass, CSRF, injection)
- [ ] Cross-browser test run completion (Chromium, Firefox, WebKit)
- [ ] Mobile responsiveness test run completion
- [ ] Accessibility testing integration and baseline report

## 4) Documentation and Enablement

- [ ] Review and add code comments and docstrings
- [ ] Generate and validate user manual screenshots end-to-end
- [ ] Complete module user guides
- [ ] Complete admin setup guide and operator runbook validation
- [ ] Complete deployment training and handover checklist

## 5) Recently Completed (Reference)

- [x] Production DB hardening in settings (SQLite blocked in production)
- [x] DB connection reuse and health checks configured
- [x] Backup and restore scripts added
- [x] DR section with RTO and RPO added to deployment runbook
- [x] Sentry integration wiring added (env-driven)
- [x] Alerts API and docs completed
- [x] E2E coverage expansion completed across core modules

## 6) Working Rule

When any TODO status changes, update this file only.
