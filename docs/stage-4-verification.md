# Stage 4 Verification

**Verification date:** October 24, 2026

## Result

Stage 4 is implemented and verified across the fundraising API workflow and frontend production build.

## Delivered workflow

- Approved, public startups can configure a simulated fundraising pool.
- Pool terms include a target, minimum and optional maximum commitment, optional valuation cap, and close date.
- Startups can open and close their own pool after the profile gate is satisfied.
- Admins can inspect all pools and open or close round access.
- Investors can filter open rounds by search text, sector, and startup stage.
- Investors can make one active simulated commitment per pool.
- The API rejects commitments below the minimum, above the maximum, or above remaining capacity.
- Investors can cancel an active commitment while retaining its history.
- Startup and admin views show target, committed amount, remaining capacity, and active commitment count.

## Automated checks

### Backend

Command, run from `backend/`:

```powershell
mvn -B -Dmaven.compiler.release=17 test
```

Result: **PASS**

- 12 tests run
- 0 failures
- 0 errors
- 0 skipped
- Flyway validated and applied migrations 1 through 4 in the test database.
- `FundraisingWorkflowControllerTest` covers profile approval/public visibility, pool configuration, opening, filtered investor discovery, commitment creation, portfolio readback, and admin closure.

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
- Existing Vitest suite: passed
- Vite production build: passed

## Stage 4 boundary

Commitments are explicitly simulated records. No payment, custody, securities settlement, valuation snapshot, equity share allocation, or real-money transfer is implemented in this stage.
