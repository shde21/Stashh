# Codebase Concerns

**Analysis Date:** 2026-11-10

## Tech Debt

**In-Memory Servlet Session State:**
- Issue: Authentication relies on server-side `HttpSession` held in Tomcat memory.
- Files: `backend/src/main/java/com/startupinvestment/platform/auth/AuthSessionService.java`
- Impact: Server restarts or application restarts invalidate all active user sessions, forcing users to re-login. Horizontal scaling across multiple server instances requires sticky sessions or adding Spring Session JDBC/Redis.
- Fix approach: Integrate `spring-session-jdbc` to back `HttpSession` directly with PostgreSQL tables or introduce Redis for distributed session persistence.

**Document Uploads Stored as External URLs:**
- Issue: Startup profile documents (pitch decks, cap tables) accept only external HTTP/HTTPS links rather than managed file uploads.
- Files: `backend/src/main/java/com/startupinvestment/platform/startup/StartupDocument.java`, `frontend/src/pages/StartupProfilePage.tsx`
- Impact: Users must host documents elsewhere (Google Drive, DocSend, Dropbox), which can result in broken links or unverified external contents.
- Fix approach: Implement multipart file upload endpoints using local filesystem storage or S3-compatible object storage (e.g. MinIO or AWS S3) with MIME-type and antivirus validation.

## Known Bugs

- None identified. All 14 backend integration tests pass cleanly and frontend Vitest suites execute with zero failures.

## Security Considerations

**CORS & Cookie Configuration in Local Dev Mode:**
- Risk: In development, `SESSION_COOKIE_SECURE` is default `false` to permit HTTP testing on `localhost:8080`.
- Files: `backend/src/main/resources/application.yml`
- Current mitigation: Enforces `HttpOnly: true` and `SameSite: Lax`, and permits HTTPS enforcement via `SESSION_COOKIE_SECURE=true` in production configurations.
- Recommendations: Ensure deployment environment overrides `SESSION_COOKIE_SECURE=true` and restricts `FRONTEND_ORIGIN` to production domain.

**CSRF Token Handling in SPA Navigation:**
- Risk: If CSRF token is not refreshed when session expires, subsequent POST requests will fail with 403 `CSRF_INVALID`.
- Files: `backend/src/main/java/com/startupinvestment/platform/auth/CsrfFilter.java`, `frontend/src/lib/api.ts`
- Current mitigation: Frontend `AuthProvider` fetches token on initial mount and after authentication.
- Recommendations: Add an automated token refresh interceptor in `frontend/src/lib/api.ts` upon encountering a 403 CSRF expiration.

## Performance Bottlenecks

**Portfolio Calculation Dynamic Aggregation:**
- Problem: `PortfolioService.getPortfolioSummary()` recalculates position values and gains in memory by aggregating all active commitments, company capitalization, and latest valuation snapshots.
- Files: `backend/src/main/java/com/startupinvestment/platform/portfolio/PortfolioService.java`
- Cause: As the number of commitments and valuation snapshots grows into thousands, dynamic aggregation queries could experience latency.
- Improvement path: Create an indexed materialization or cached summary table for investor portfolio statistics updated upon new commitments or new valuation snapshot releases.

## Fragile Areas

**Share Capitalization Mathematical Invariants:**
- Files: `backend/src/main/resources/db/migration/V7__create_shares_capitalization_architecture.sql`, `backend/src/main/java/com/startupinvestment/platform/startup/CompanyCapitalization.java`
- Why fragile: The relational schema enforces strict mathematical checks (`authorized_shares >= issued_shares + reserved_shares`, `issued_shares = outstanding_shares + treasury_shares`). Any code modifying share pools or issuing new equity must satisfy all constraints simultaneously, or database transactions will abort.
- Safe modification: Always validate share balance constraints in `StartupService` before issuing database updates.
- Test coverage: Thoroughly tested in `EquitySharesArchitectureTest.java`.

## Scaling Limits

**Single-Node Database and Tomcat Container:**
- Current capacity: Suitable for concurrent local development and small-scale testing (~50-100 requests/sec).
- Limit: Bound by HikariCP connection pool limit (`maximum-pool-size: 10`) and single Tomcat JVM memory.
- Scaling path: Increase connection pool size, introduce connection pooling proxies (PgBouncer), and move session management to Redis or Postgres.

## Dependencies at Risk

**Spring Boot 4 / Jackson 3 Milestone Packages:**
- Risk: `backend/pom.xml` references Spring Boot 4.1.2 with `tools.jackson` packages (`tools.jackson.databind.ObjectMapper`).
- Impact: Spring Boot 4 is an advanced major version where APIs and dependencies may shift as the ecosystem stabilizes.
- Migration plan: Keep dependency versions synchronized and monitor Spring Boot release notes for breaking changes.

## Missing Critical Features

**Audit Log of State Transitions:**
- Problem: While `startup_review_actions` tracks administrative reviews, general administrative actions (valuation snapshot edits, user suspension) do not have a dedicated audit trail.
- Blocks: Comprehensive compliance and administrative accountability.

**Investor Notifications:**
- Problem: When a startup updates profile status, opens a round, or when an admin publishes a valuation snapshot, interested investors do not receive in-app or email notifications.
- Blocks: Timely investor participation in newly opened rounds.

## Test Coverage Gaps

**Frontend Page-Level Integration Tests:**
- What's not tested: `AdminReviewsPage.tsx`, `AdminFundraisingPage.tsx`, `StartupFundraisingPage.tsx`, and `InvestorPortfolioPage.tsx` currently lack full Vitest rendering integration tests (unit tests exist for components, validators, formatters, and auth pages).
- Files: `frontend/src/pages/AdminReviewsPage.tsx`, `frontend/src/pages/InvestorPortfolioPage.tsx`
- Risk: Regressions in complex table renderings or modal submission logic might only be caught during manual browser testing.
- Priority: Medium

---

*Concerns audit: 2026-11-10*
