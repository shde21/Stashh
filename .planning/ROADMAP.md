# Roadmap: Stashh Startup Investment Platform

## Overview

This roadmap elevates Stashh from an advanced functional prototype to a hardened, production-ready startup investment platform. The milestone delivers PostgreSQL-backed session persistence via Spring Session JDBC, resilient frontend CSRF refresh handling, in-app notification center for deal events, administrative audit trail with UI viewer, secure multipart file uploads for pitch decks and cap tables, and comprehensive frontend integration test coverage across all major user flows.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Session Persistence & Client Hardening** - Back user sessions in PostgreSQL via Spring Session JDBC, add automated CSRF token refresh, and enforce production cookie policies.
- [ ] **Phase 2: In-App Notification Center** - Provide in-app alert delivery and dropdown UI for startup status updates, fundraising round triggers, and investor interest requests.
- [ ] **Phase 3: Administrative Audit Logging** - Implement an immutable relational audit log and admin viewer for profile reviews, status changes, and valuation updates.
- [ ] **Phase 4: Managed Document Storage** - Replace external links with secure multipart document uploads, local storage provider abstraction, and role-authorized file downloads.
- [ ] **Phase 5: Page-Level Integration & Verification** - Expand Vitest test suites to cover complex page workflows in Admin Reviews, Fundraising Rounds, and Portfolio Holdings.

## Phase Details

### Phase 1: Session Persistence & Client Hardening
**Goal**: Persist user sessions in PostgreSQL via Spring Session JDBC and harden API client with automatic CSRF token refresh and standardized error handling.
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: SESS-01, SESS-02, SESS-03, SEC-01, SEC-02, SEC-03
**Success Criteria** (what must be TRUE):
  1. Active user login sessions survive backend application restarts without forcing user re-authentication.
  2. Spring Session schema tables (`SPRING_SESSION`, `SPRING_SESSION_ATTRIBUTES`) exist and are managed with automated expiration cleanup.
  3. Frontend API client interceptor intercepts 403 CSRF expirations, silently refreshes the token, and retries the failed request.
  4. Backend returns consistent standardized JSON error payloads with timestamps and validation field mappings for all 4xx/5xx responses.
**Plans**: 2 plans

Plans:
- [ ] 01-01: Integrate Spring Session JDBC into backend with database migrations, session repository configuration, and production cookie policies.
- [ ] 01-02: Implement frontend CSRF refresh interceptor in API client and standardize backend GlobalExceptionHandler.

### Phase 2: In-App Notification Center
**Goal**: Build an in-app notification pipeline and interactive header menu alerting founders and investors to deal events.
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: NOTIF-01, NOTIF-02, NOTIF-03, NOTIF-04
**Success Criteria** (what must be TRUE):
  1. Navigation bar AppShell displays a notification bell icon with an unread badge counter.
  2. Clicking the bell opens a dropdown menu displaying recent notifications with timestamps and read states.
  3. Founders receive notifications when an investor submits an expression of interest or an admin approves their profile.
  4. Investors receive notifications when a watched startup opens a fundraising round or reaches funding target.
  5. Users can mark individual notifications or all notifications as read.
**Plans**: 2 plans

Plans:
- [ ] 02-01: Database migration for notifications table, backend notification entity/repository, and event publisher hooks.
- [ ] 02-02: Notification REST endpoints, frontend notification bell component, dropdown menu, and mark-as-read state handlers.

### Phase 3: Administrative Audit Logging
**Goal**: Record and display an immutable audit log for compliance, tracking all administrative reviews and valuation snapshot changes.
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: AUDIT-01, AUDIT-02, AUDIT-03
**Success Criteria** (what must be TRUE):
  1. Relational audit table records timestamp, actor ID, action type, entity type, target entity ID, and change metadata.
  2. All startup review decisions (APPROVE, REJECT, REQUEST_CHANGES) and valuation snapshot updates automatically emit audit records.
  3. Admins can view an audit log page at `/admin/audit-log` with searchable actor, action, and date filters.
**Plans**: 2 plans

Plans:
- [ ] 03-01: Audit log relational schema, backend audit service, and integration into startup review and valuation workflows.
- [ ] 03-02: Admin audit log REST endpoint and frontend audit log viewer page with filter controls.

### Phase 4: Managed Document Storage
**Goal**: Provide secure multipart file uploads and downloads for startup pitch decks and cap tables, replacing external URLs.
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: DOCS-01, DOCS-02, DOCS-03, DOCS-04
**Success Criteria** (what must be TRUE):
  1. Startup founders can upload PDF pitch decks and spreadsheet cap tables directly from the profile edit screen.
  2. Backend validates file sizes (up to 25MB) and accepted MIME types (PDF, XLSX, CSV), rejecting disallowed formats.
  3. Stored files are retrieved via authenticated and authorized endpoints preventing unauthorized access to proprietary startup data.
**Plans**: 2 plans

Plans:
- [ ] 04-01: Storage service abstraction, local filesystem storage implementation, upload/download endpoints, and security checks.
- [ ] 04-02: Frontend document upload component with progress display, preview, and download triggers in Startup Profile page.

### Phase 5: Page-Level Integration & Verification
**Goal**: Establish comprehensive frontend Vitest integration test suites for complex admin, fundraising, and portfolio pages.
**Mode:** mvp
**Depends on**: Phase 2, Phase 3, Phase 4
**Requirements**: TEST-01, TEST-02, TEST-03
**Success Criteria** (what must be TRUE):
  1. Vitest suite tests Admin Reviews page, verifying table rendering, review decision submissions, and optimistic state updates.
  2. Vitest suite tests Startup Fundraising page, verifying round setup validations, share pricing calculation displays, and target checks.
  3. Vitest suite tests Investor Portfolio page, verifying holdings aggregation calculations and gain/loss scenario renderings.
**Plans**: 2 plans

Plans:
- [ ] 05-01: Admin Reviews and Startup Fundraising page-level integration tests with mocked API endpoints.
- [ ] 05-02: Investor Portfolio page integration tests and full regression test execution verification across backend and frontend.

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Session Persistence & Client Hardening | 0/2 | Not started | - |
| 2. In-App Notification Center | 0/2 | Not started | - |
| 3. Administrative Audit Logging | 0/2 | Not started | - |
| 4. Managed Document Storage | 0/2 | Not started | - |
| 5. Page-Level Integration & Verification | 0/2 | Not started | - |
