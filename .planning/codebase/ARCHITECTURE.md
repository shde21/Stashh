<!-- refreshed: 2026-11-10 -->
# Architecture

**Analysis Date:** 2026-11-10

## System Overview

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                    Frontend SPA (React 19 + Vite :5173)                 │
├────────────────────┬────────────────────┬───────────────────────────────┤
│    Founders UI     │    Investors UI    │           Admins UI           │
│ `pages/Startup*`   │ `pages/Investor*`  │       `pages/Admin*`          │
├────────────────────┴────────────────────┴───────────────────────────────┤
│ Design System, AppShell & Auth Provider (`design-system/`, `auth/`)     │
│ Typed REST Client with CSRF handling (`frontend/src/lib/api.ts`)        │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ JSON over HTTP (CORS + Cookies + CSRF)
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                 Backend REST API (Spring Boot 4.1.2 :8080)              │
├─────────────────────────────────────────────────────────────────────────┤
│ Security & Filters: `CsrfFilter`, `WebConfig`, `AuthSessionService`     │
├─────────────────────────────────────────────────────────────────────────┤
│ REST Controllers:                                                       │
│ - `AuthController`, `MeController`, `RoleAccessController`             │
│ - `StartupController`, `AdminStartupController`, `InvestorStartup*`    │
│ - `StartupFundraising*`, `AdminFundraising*`, `InvestorFundraising*`    │
│ - `InvestorPortfolioController`, `AdminPortfolioController`             │
│ - `StartupMarketplaceController`, `InvestorMarketplaceController`       │
│ - `PlatformStatusController`                                            │
├─────────────────────────────────────────────────────────────────────────┤
│ Service Domain Layer:                                                   │
│ - `AuthService`, `StartupService`, `FundraisingService`,                │
│   `PortfolioService`, `MarketplaceService`, `PlatformStatusService`     │
├─────────────────────────────────────────────────────────────────────────┤
│ Persistence Layer (Spring JDBC / HikariCP):                             │
│ - `AuthUserRepository`, `StartupRepository`, `FundraisingRepository`,   │
│   `PortfolioRepository`, `MarketplaceRepository`                        │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ JDBC + Flyway Migrations (V1..V7)
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                  Relational Database (PostgreSQL 18 :5432)              │
│ Tables: `app_users`, `startup_profiles`, `startup_metrics`,             │
│         `startup_documents`, `company_capitalization`,                  │
│         `fundraising_pools`, `fundraising_commitments`,                 │
│         `valuation_snapshots`, `investor_watchlist`,                    │
│         `investor_interest_requests`, `platform_metadata`               │
└─────────────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| `AppShell` | Application layout, top navigation, role switcher/badge, theme toggle, session state presentation | `frontend/src/components/layout/AppShell.tsx` |
| `AuthProvider` / `useAuth` | Client-side session state, CSRF token retrieval, login/logout transitions | `frontend/src/auth/AuthProvider.tsx` |
| `RequireAuth` / `RequireRole` | Client-side routing guards for role protection (STARTUP, INVESTOR, ADMIN) | `frontend/src/auth/guards.tsx` |
| `apiRequest` | Fetch wrapper adding credentials, CSRF header, JSON handling, and typed error responses | `frontend/src/lib/api.ts` |
| `CsrfFilter` | Intercepts mutations (`POST`, `PUT`, `PATCH`, `DELETE`) on `/api/v1/` routes and validates token against session | `backend/src/main/java/com/startupinvestment/platform/auth/CsrfFilter.java` |
| `AuthSessionService` | Resolves `SessionUser` from servlet `HttpSession` and enforces role access boundaries | `backend/src/main/java/com/startupinvestment/platform/auth/AuthSessionService.java` |
| `AuthService` | Registration, credential verification, and BCrypt password encryption | `backend/src/main/java/com/startupinvestment/platform/auth/AuthService.java` |
| `StartupService` | Startup profile draft management, submissions, document attachments, capitalization tables, and admin review workflows | `backend/src/main/java/com/startupinvestment/platform/startup/StartupService.java` |
| `FundraisingService` | Round configuration, target checks, share pricing calculations, commitment allocations, cancellation logic, and round capacity | `backend/src/main/java/com/startupinvestment/platform/fundraising/FundraisingService.java` |
| `PortfolioService` | Aggregates investor positions, computes company-specific share holdings, calculates illustrative values based on valuation snapshots | `backend/src/main/java/com/startupinvestment/platform/portfolio/PortfolioService.java` |
| `MarketplaceService` | Watchlist toggle, private thesis notes, investor interest submissions, and founder inbox queries | `backend/src/main/java/com/startupinvestment/platform/marketplace/MarketplaceService.java` |

## Pattern Overview

**Overall:** Decoupled Single Page Application (SPA) consuming a Layered RESTful Backend API with Direct Relational Persistence (no heavy ORM).

**Key Characteristics:**
- **Explicit Role Separation:** Three distinct business personas (`STARTUP`, `INVESTOR`, `ADMIN`), with strict server-enforced role access checks on every protected endpoint.
- **Direct Spring JDBC Repositories:** Plain SQL queries through `JdbcTemplate` mapped to immutable Java `record` classes instead of Hibernate/JPA entities. This prevents lazy loading exceptions, session detachment bugs, and unexpected query cascades.
- **Session-Bound CSRF & Cookie Security:** State-changing API operations require both an active authenticated session and a valid `X-CSRF-Token` header.
- **Simulated Financial Model with Share Capitalization:** Tracks startup capitalization (authorized, issued, outstanding shares) and calculates round share pricing (`round_valuation_basis`, `price_per_share`), strictly rejecting fractional share allocations.

## Layers

**Frontend Client Layer:**
- Purpose: Delivers modern, responsive, role-tailored user interfaces with instant feedback.
- Location: `frontend/src/`
- Contains: React components, pages, design system tokens, validation utilities, and API client modules.
- Depends on: Backend HTTP REST endpoints.
- Used by: End users in modern desktop and mobile browsers.

**API / Controller Layer:**
- Purpose: Exposes HTTP REST endpoints, validates request payloads with Jakarta annotations (`@Valid`), manages session cookies, and handles HTTP status codes.
- Location: `backend/src/main/java/com/startupinvestment/platform/*/*Controller.java`
- Contains: Spring `@RestController` classes mapped under `/api/v1/...`.
- Depends on: Domain Service layer and `AuthSessionService`.
- Used by: Frontend HTTP client calls.

**Domain / Service Layer:**
- Purpose: Enforces business logic, domain invariants (e.g. non-fractional share purchases, round capacity constraints, profile review transitions, capitalization integrity), and authorization checks.
- Location: `backend/src/main/java/com/startupinvestment/platform/*/*Service.java`
- Contains: Spring `@Service` classes annotated with `@Transactional`.
- Depends on: JDBC Repositories and `AuthUserRepository`.
- Used by: Controller classes.

**Persistence / Data Layer:**
- Purpose: Executes relational SQL queries and updates against PostgreSQL using Spring `JdbcTemplate`.
- Location: `backend/src/main/java/com/startupinvestment/platform/*/*Repository.java`
- Contains: Spring `@Repository` classes with parameterized SQL statements.
- Depends on: PostgreSQL datasource / HikariCP.
- Used by: Domain Services.

## Data Flow

### Primary Request Path (e.g., Investor Makes Commitment)

1. **Frontend Initiation:** User enters commitment amount in `InvestorDiscoverPage.tsx` or round detail modal and submits.
2. **API Client Dispatch:** `createCommitment(poolId, amount)` in `frontend/src/fundraising/fundraising.api.ts` invokes `apiRequest()` (`frontend/src/lib/api.ts`).
3. **HTTP Transport:** Browser transmits `POST /api/v1/investor/fundraising/pools/{poolId}/commit` with cookies and `X-CSRF-Token` header.
4. **CSRF Validation:** `CsrfFilter.java` verifies token against servlet session.
5. **Controller Routing:** `InvestorFundraisingController.java:commit()` checks `authSessionService.requireUser(session, UserRole.INVESTOR)`.
6. **Service Execution:** `FundraisingService.java:createCommitment()` checks:
   - Pool status is `OPEN`.
   - Associated startup profile is `APPROVED` and `PUBLIC`.
   - Commitment amount meets minimum and maximum limits.
   - Amount is an exact multiple of the round's `price_per_share` (rejecting fractional shares).
   - Remaining available pool capacity is not exceeded.
7. **Database Transaction:** `FundraisingRepository.java` inserts record into `fundraising_commitments` and increments `shares_allocated` in `fundraising_pools`.
8. **Response Return:** Controller returns serialized `InvestorCommitment` record with HTTP 201 Created.
9. **UI Refresh:** React state updates, toast notification confirms commitment, and round capacity bar updates.

### Secondary Flow: Startup Onboarding & Admin Review

1. Startup registers and updates company profile details, metrics, and capitalization in `StartupProfilePage.tsx`.
2. Startup submits profile for review (`POST /api/v1/startup/profile/submit`). Profile status becomes `SUBMITTED`.
3. Admin navigates to `AdminReviewsPage.tsx`, reviews submission details, and chooses `APPROVE`, `CHANGES_REQUESTED`, or `REJECT` via `AdminStartupController.java`.
4. If approved, admin toggles public visibility (`POST /api/v1/admin/startups/{id}/visibility`), enabling the startup to configure and open fundraising rounds.

**State Management:**
- Frontend: React Context (`AuthProvider`, `ThemeContext`) for session and theme state. Component-level `useState` and `useEffect` for page-specific data fetching and mutation handling.
- Backend: Stateful servlet sessions (`HttpSession`) stored in memory, with relational state persisted in PostgreSQL.

## Key Abstractions

**`SessionUser`:**
- Purpose: Represents the authenticated actor stored within the servlet session.
- Example: `backend/src/main/java/com/startupinvestment/platform/auth/SessionUser.java`
- Pattern: Immutable Value Object containing `id`, `email`, and `UserRole`.

**`CompanyCapitalization`:**
- Purpose: Models authorized, issued, outstanding, treasury, and reserved shares with par value.
- Example: `backend/src/main/java/com/startupinvestment/platform/startup/CompanyCapitalization.java`
- Pattern: Domain Entity with strict mathematical database constraints (`authorized >= issued + reserved`, `issued = outstanding + treasury`).

**`PortfolioPosition`:**
- Purpose: Combines commitment history, share counts, original purchase price, latest valuation snapshot, and current calculated position value.
- Example: `backend/src/main/java/com/startupinvestment/platform/portfolio/PortfolioPosition.java`
- Pattern: Read-Model Aggregation / DTO.

## Entry Points

**Backend Service:**
- Location: `backend/src/main/java/com/startupinvestment/platform/StartupInvestmentApplication.java`
- Triggers: `mvn spring-boot:run` or executing the packaged jar file.
- Responsibilities: Initializes Spring Boot context, runs Flyway migrations, configures Tomcat container on port 8080, and runs `DemoAdminSeeder`.

**Frontend Application:**
- Location: `frontend/src/main.tsx` and `frontend/src/App.tsx`
- Triggers: Browser loading `http://localhost:5173`.
- Responsibilities: Mounts React DOM root, initializes theme from local storage, wraps application with `ThemeProvider`, `ToastProvider`, `AuthProvider`, and `BrowserRouter`.

## Architectural Constraints

- **Threading:** Spring MVC uses Tomcat worker thread pool per HTTP request; database operations run synchronously on the calling thread using HikariCP pooled connections.
- **Global State:** No shared static mutable state; application components are Spring-managed singletons relying on transaction-scoped database queries.
- **Session Affinity:** In-memory `HttpSession` requires sticky sessions if deployed behind a multi-node load balancer, or adding Spring Session JDBC/Redis.
- **Simulated Mechanics:** Does not process real fiat currency or issue SEC/FINRA compliant securities; all equity allocations and round completions are simulated.

## Anti-Patterns

### Anti-Pattern 1: Heavy ORM Cascades
**What happens:** Using JPA `@OneToMany` or `@ManyToMany` with automatic cascade operations.
**Why it's wrong:** Leads to unintended N+1 queries, performance bottlenecks, and unexpected schema mutations.
**Do this instead:** Use explicit SQL queries via Spring `JdbcTemplate` in dedicated repositories (e.g. `StartupRepository.java`, `FundraisingRepository.java`).

### Anti-Pattern 2: Client-Driven Financial Calculations
**What happens:** Calculating share counts or prices on the client and sending calculated totals to the server.
**Why it's wrong:** Vulnerable to tampering, rounding discrepancies, and fractional share bugs.
**Do this instead:** Client sends intended commitment amount; backend recalculates exact whole shares using company round pricing, validating `amount % price_per_share == 0`.

## Error Handling

**Strategy:** Uniform JSON error responses accompanied by standard HTTP status codes (400, 401, 403, 404, 409, 500).

**Patterns:**
- `AuthExceptionHandler` (`backend/src/main/java/com/startupinvestment/platform/auth/AuthExceptionHandler.java`) catches `AuthException`, `MethodArgumentNotValidException`, and general exceptions, returning structured `ApiErrorResponse(code, message, fieldErrors)`.
- Frontend `apiRequest` catches non-2xx responses and converts them into typed `ApiError` instances consumed by form state handlers.

## Cross-Cutting Concerns

**Logging:** SLF4J logger instantiated via `LoggerFactory.getLogger(...)` within services and controllers.
**Validation:** Jakarta Bean Validation annotations (`@NotNull`, `@NotBlank`, `@Min`, `@Email`) on incoming request records; domain validations in service methods.
**Authentication & Authorization:** Role inspection via `AuthSessionService.requireUser(session, UserRole...)`.

---

*Architecture analysis: 2026-11-10*
