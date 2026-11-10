# Requirements: Stashh Startup Investment Platform

**Defined:** 2026-11-10  
**Core Value:** Provide a reliable, mathematically rigorous startup investment platform that bridges founders and investors with transparent deal flows, strict capitalization integrity, and role-governed workflows.

## v1 Requirements

Requirements for production readiness release. Each maps to roadmap phases.

### Session Persistence & Reliability (SESS)

- [ ] **SESS-01**: User sessions are persisted in PostgreSQL via Spring Session JDBC so active logins survive server restarts
- [ ] **SESS-02**: Session table cleanup and expiration are managed automatically by Spring Session background tasks
- [ ] **SESS-03**: Production cookie policy enforces HttpOnly, SameSite=Lax, and conditional HTTPS Secure flags

### Security & Error Hardening (SEC)

- [ ] **SEC-01**: Frontend API client automatically handles CSRF token expiration (403) and refreshes token without dropping user action
- [ ] **SEC-02**: Standardized global error response payload structure returned by backend for all 4xx/5xx exceptions
- [ ] **SEC-03**: Production environment configuration template with strict CORS domain binding and secure secrets loading

### Notification System (NOTIF)

- [ ] **NOTIF-01**: Database schema and backend API for user notifications (types: round status change, review feedback, interest submitted)
- [ ] **NOTIF-02**: In-app notification center bell icon and dropdown menu in AppShell showing unread count
- [ ] **NOTIF-03**: User can mark notifications as read individually or all at once
- [ ] **NOTIF-04**: System automatically triggers notifications on key workflow events (admin approval, commitment placed, round closed)

### Administrative Audit Trail (AUDIT)

- [ ] **AUDIT-01**: Relational audit log schema recording timestamp, actor ID, action type, entity type, entity ID, and metadata diff
- [ ] **AUDIT-02**: Automated audit event recording on startup review transitions, valuation snapshot updates, and round status modifications
- [ ] **AUDIT-03**: Admin UI audit log viewer page with date, user, and action type filters

### Managed Document Storage (DOCS)

- [ ] **DOCS-01**: Backend multipart file upload endpoint for pitch decks and cap tables with file size and MIME-type validation
- [ ] **DOCS-02**: Managed local storage provider with clean abstraction for future cloud object storage (S3/MinIO)
- [ ] **DOCS-03**: Frontend upload component in Startup Profile editor with upload progress and file removal capability
- [ ] **DOCS-04**: Secure document retrieval endpoint preventing unauthorized download of private cap tables and financials

### Frontend Integration & Verification (TEST)

- [ ] **TEST-01**: Vitest integration tests for Admin Reviews page verifying review actions and status transitions
- [ ] **TEST-02**: Vitest integration tests for Startup Fundraising round management and capacity enforcement
- [ ] **TEST-03**: Vitest integration tests for Investor Portfolio calculations and simulated gain/loss rendering

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Payments & Banking

- **PAY-01**: Integration with third-party payment gateway / escrow provider (Stripe, Plaid)
- **PAY-02**: Automated ACH transfer verification for verified accredited investors

### Advanced Investor Dealflow

- **DEAL-01**: In-line collaborative term sheet annotation between founder and lead investor
- **DEAL-02**: Real-time direct founder-investor chat thread per deal room

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real-money payment gateway integration | High regulatory overhead (escrow/broker-dealer compliance); simulated financial commitments suffice |
| Microservices migration | Unnecessary operational complexity; existing modular monolith with Spring Boot is stable |
| Full UI redesign | Existing dark-mode design token system in `frontend/src/design-system/` is complete and functional |
| Redis session cluster | PostgreSQL via Spring Session JDBC provides single-datastore reliability without extra Redis infrastructure |

## Traceability

Which phases cover which requirements. Populated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| SESS-01 | Phase 1 | Pending |
| SESS-02 | Phase 1 | Pending |
| SESS-03 | Phase 1 | Pending |
| SEC-01 | Phase 1 | Pending |
| SEC-02 | Phase 1 | Pending |
| SEC-03 | Phase 1 | Pending |
| NOTIF-01 | Phase 2 | Pending |
| NOTIF-02 | Phase 2 | Pending |
| NOTIF-03 | Phase 2 | Pending |
| NOTIF-04 | Phase 2 | Pending |
| AUDIT-01 | Phase 3 | Pending |
| AUDIT-02 | Phase 3 | Pending |
| AUDIT-03 | Phase 3 | Pending |
| DOCS-01 | Phase 4 | Pending |
| DOCS-02 | Phase 4 | Pending |
| DOCS-03 | Phase 4 | Pending |
| DOCS-04 | Phase 4 | Pending |
| TEST-01 | Phase 5 | Pending |
| TEST-02 | Phase 5 | Pending |
| TEST-03 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 20 total
- Mapped to phases: 20
- Unmapped: 0 ✓

---
*Requirements defined: 2026-11-10*
*Last updated: 2026-11-10 after initial definition*
