# Stage 6 Verification

**Verification date:** October 24, 2026

## Result

Stage 6 is implemented and verified across marketplace interactions, investor watchlists with private thesis notes, two-sided interest requests, and the startup interest inbox.

## Delivered workflow

- Marketplace interactions are strictly restricted to approved, public startup profiles.
- Investors can bookmark approved public startups to their personal watchlist with a private investment thesis note.
- Investors can view their watchlist, update thesis notes inline with CSRF validation, and remove companies from their watchlist.
- Investors can send lightweight introduction/interest requests to startups with an optional message.
- Re-submitting an interest request updates the existing request idempotently rather than duplicating database records.
- Investors can view their sent introductions across all startups and check their current status (`PENDING` or `WITHDRAWN`).
- Investors can withdraw pending introductions, transitioning their status to `WITHDRAWN`.
- Startups have a dedicated interest inbox (`/app/startup/interests`) displaying incoming investor introductions, investor email, message, status, and timestamps.
- Unapproved or private startups reject watchlist saves and interest requests with HTTP 400 `PROFILE_NOT_PUBLIC`.
- Length constraints (notes <= 1,000 characters, messages <= 2,000 characters) are enforced by the service layer.

## Automated checks

### Backend

Command, run from `backend/`:

```powershell
mvn -B -Dmaven.compiler.release=17 verify
```

Result: **PASS**

- 15 tests run
- 0 failures
- 0 errors
- 0 skipped
- Flyway validated and applied migrations 1 through 6 in the test database.
- `MarketplaceWorkflowControllerTest` covers profile approval/public gating, watchlist save/read/update/removal, thesis note storage, interest submission, investor sent-interests retrieval, interest withdrawal, startup inbox readback, and unapproved startup rejection.

### Frontend

Commands, run from `frontend/`:

```powershell
npm run lint
npm run typecheck
npm test -- --run
npm run build
```

Result: **PASS**

- ESLint: passed
- TypeScript: passed
- Vitest suite: 5 files and 13 tests passed
- `InvestorWatchlistPage.test.tsx`: 3 tests covering watchlist rendering, thesis note updating with CSRF tokens, and introduction withdrawal with CSRF tokens.
- Vite production build: passed

## Stage 6 boundary

Marketplace watchlists and interest requests represent lightweight introductions and internal thesis tracking. The platform does not process real-money transfers, custody assets, settle securities, or execute binding investment contracts.
