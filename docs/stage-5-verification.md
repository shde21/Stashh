# Stage 5 Verification

**Verification date:** October 24, 2026

## Result

Stage 5 is implemented and verified across valuation snapshots, QUANTS allocation, and portfolio analytics.

## Delivered workflow

- Admins can record valuation snapshots for approved, public startup profiles.
- Snapshot dates cannot be in the future.
- Investors receive deterministic QUANTS from commitment amounts at `1 QUANT = ₹1,000`.
- Investor portfolio totals include active commitments only while retaining cancelled positions in history.
- The portfolio shows each position's commitment, QUANTS, latest valuation, current illustrative value, and illustrative gain.
- Portfolio values remain explicitly unvalued until a matching valuation snapshot exists.
- Latest valuation snapshots are used for calculations without rewriting original commitments.

## Automated checks

### Backend

Command, run from `backend/`:

```powershell
mvn -B -Dmaven.compiler.release=17 verify
```

Result: **PASS**

- 13 tests run
- 0 failures
- 0 errors
- 0 skipped
- Flyway validated and applied migrations 1 through 5.
- `PortfolioWorkflowControllerTest` covers commitment readback, QUANTS allocation, valuation snapshot creation, latest-snapshot portfolio valuation, and admin history access.

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
- Existing Vitest suite: 4 files and 10 tests passed
- Vite production build: passed

## Stage 5 boundary

QUANTS, valuations, and gains are illustrative product calculations. The platform does not execute payments, custody, securities settlement, investment advice, or real-money transfers.
