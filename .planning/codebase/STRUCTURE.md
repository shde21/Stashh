# Codebase Structure

**Analysis Date:** 2026-11-10

## Directory Layout

```text
startup-investment-platform/
├── backend/                                   # Spring Boot backend application
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/startupinvestment/platform/
│   │   │   │   ├── StartupInvestmentApplication.java  # Main application entry point
│   │   │   │   ├── auth/                      # Authentication, session, user repository, CSRF
│   │   │   │   ├── config/                    # Spring MVC & CORS configuration
│   │   │   │   ├── fundraising/               # Round creation, commitments, shares allocation
│   │   │   │   ├── marketplace/               # Watchlists, thesis notes, interest requests
│   │   │   │   ├── platform/                  # Health & platform metadata status
│   │   │   │   ├── portfolio/                 # Investor portfolio, equity positions, valuation snapshots
│   │   │   │   └── startup/                   # Profiles, metrics, docs, review actions, capitalization
│   │   │   └── resources/
│   │   │       ├── application.yml            # Main Spring configuration
│   │   │       └── db/migration/              # Flyway SQL migrations (V1..V7)
│   │   └── test/
│   │       ├── java/com/startupinvestment/platform/  # JUnit 5 & MockMvc integration tests
│   │       └── resources/
│   │           └── application-test.yml       # Test profile with H2 in-memory DB configuration
│   └── pom.xml                                # Maven build definition
├── frontend/                                  # React 19 + TypeScript + Vite frontend
│   ├── src/
│   │   ├── auth/                              # Auth context, hooks, guards, API client
│   │   ├── components/                        # Shared UI components (AppShell, AuthLayout, States)
│   │   ├── design-system/                     # Reusable design tokens, buttons, cards, forms, modal, tabs
│   │   ├── fundraising/                       # Fundraising API client and types
│   │   ├── lib/                               # Base apiRequest client, validators
│   │   ├── marketplace/                       # Marketplace & interest API clients and types
│   │   ├── pages/                             # Route view pages (Admin, Investor, Startup, Auth)
│   │   ├── portfolio/                         # Portfolio API client and types
│   │   ├── startup/                           # Startup profile API client and types
│   │   ├── test/                              # Vitest setup file
│   │   ├── App.tsx                            # Root router and route declarations
│   │   ├── App.test.tsx                       # App level test
│   │   ├── main.tsx                           # React DOM mount entry
│   │   └── index.css                          # Global styles, fonts, layout resets
│   ├── eslint.config.js                       # ESLint flat configuration
│   ├── package.json                           # Frontend dependencies & npm scripts
│   ├── tsconfig.json                          # TypeScript configuration
│   └── vite.config.ts                         # Vite configuration and test setup
├── docs/                                      # API specifications and verification reports
│   ├── api.md                                 # REST API specification and examples
│   └── final-stage-verification.md            # Final stage audit and test results
├── docker-compose.yml                         # Local PostgreSQL 18 container setup
├── start.ps1                                  # Windows PowerShell automated orchestrator
├── start.bat                                  # Command Prompt startup launcher
├── db-shell.bat                               # Interactive PostgreSQL psql console launcher
├── .env.example                               # Example environment variables template
├── package.json                               # Root workspace convenience scripts
└── .planning/                                 # GSD project plans and codebase documentation
    └── codebase/                              # Structured codebase analysis maps
```

## Directory Purposes

**`backend/src/main/java/com/startupinvestment/platform/`:**
- Purpose: Complete Java backend business logic, domain boundaries, REST controllers, and database access.
- Key modules:
  - `auth/`: User entity, session management, CSRF filter, role authorization, demo admin seeder.
  - `startup/`: Startup company profile, documents, metrics, capitalization tables, review status.
  - `fundraising/`: Round setup, commitment processing, capacity checks, and status management.
  - `portfolio/`: Investor position aggregation, valuation snapshots, and unrealized gains calculations.
  - `marketplace/`: Investor watchlists, thesis notes, and founder interest inquiry inbox.
  - `platform/`: Foundation health and metadata verification endpoint.

**`backend/src/main/resources/db/migration/`:**
- Purpose: Versioned Flyway SQL migration scripts executing deterministically at boot.
- Key files:
  - `V1__create_platform_metadata.sql`: Singleton metadata table.
  - `V2__create_auth_users.sql`: User credentials and roles.
  - `V3__create_startup_workflows.sql`: Startup profiles, metrics, documents, review actions.
  - `V4__create_fundraising_workflows.sql`: Fundraising pools and commitments.
  - `V5__create_valuation_snapshots.sql`: Admin valuation snapshots.
  - `V6__create_marketplace_interactions.sql`: Watchlists and interest requests.
  - `V7__create_shares_capitalization_architecture.sql`: Company capitalization and equity shares.

**`frontend/src/pages/`:**
- Purpose: Top-level view components bound to React Router routes.
- Key pages:
  - `LoginPage.tsx`, `RegisterPage.tsx`: Authentication views.
  - `DashboardPage.tsx`, `DashboardRedirectPage.tsx`: Role-based hub.
  - `StartupProfilePage.tsx`, `StartupFundraisingPage.tsx`, `StartupInterestsPage.tsx`: Founder views.
  - `InvestorDiscoverPage.tsx`, `InvestorWatchlistPage.tsx`, `InvestorPortfolioPage.tsx`: Investor views.
  - `AdminReviewsPage.tsx`, `AdminFundraisingPage.tsx`, `AdminValuationsPage.tsx`: Admin management views.

**`frontend/src/design-system/`:**
- Purpose: Reusable UI component library and styling tokens ensuring consistent theme and interaction standards.
- Key files:
  - `tokens.css`: Color palettes (Forest Green / Neon Orange theme), radii, typography, spacing variables.
  - `components.css`: CSS classes for buttons, cards, inputs, pills, tables, modals.
  - `Button.tsx`, `Card.tsx`, `Input.tsx`, `Select.tsx`, `Modal.tsx`, `Table.tsx`, `Tabs.tsx`, `Stat.tsx`, `StatusPill.tsx`, `ProgressBar.tsx`, `Toast.tsx`, `ThemeToggle.tsx`.

## Key File Locations

**Entry Points:**
- Backend: `backend/src/main/java/com/startupinvestment/platform/StartupInvestmentApplication.java`
- Frontend: `frontend/src/main.tsx` and `frontend/src/App.tsx`
- Automation: `start.ps1` and `start.bat`

**Configuration:**
- Backend configuration: `backend/src/main/resources/application.yml`
- Frontend build configuration: `frontend/vite.config.ts`
- Environment defaults: `.env.example`
- Docker services: `docker-compose.yml`

**Core Logic:**
- Authentication & Sessions: `backend/src/main/java/com/startupinvestment/platform/auth/AuthSessionService.java`
- Share Allocations & Commitments: `backend/src/main/java/com/startupinvestment/platform/fundraising/FundraisingService.java`
- Portfolio & Valuations: `backend/src/main/java/com/startupinvestment/platform/portfolio/PortfolioService.java`
- HTTP Request Engine: `frontend/src/lib/api.ts`

**Testing:**
- Backend tests: `backend/src/test/java/com/startupinvestment/platform/`
- Frontend tests: `frontend/src/App.test.tsx`, `frontend/src/pages/*.test.tsx`, `frontend/src/design-system/*.test.tsx`

## Naming Conventions

**Files:**
- Java classes/interfaces/records: `PascalCase.java` (e.g., `StartupService.java`, `CompanyCapitalization.java`)
- React components and pages: `PascalCase.tsx` (e.g., `InvestorPortfolioPage.tsx`, `Button.tsx`)
- Frontend API clients: `kebab-case.api.ts` or `domain.api.ts` (e.g., `auth.api.ts`, `fundraising.api.ts`)
- TypeScript types/interfaces: `domain.types.ts` (e.g., `auth.types.ts`, `startup.types.ts`)
- Flyway migrations: `V<N>__<description>.sql` (e.g., `V7__create_shares_capitalization_architecture.sql`)
- CSS stylesheets: `kebab-case.css` (e.g., `tokens.css`, `components.css`)

**Directories:**
- Backend packages: lowercase single words (`auth`, `config`, `fundraising`, `marketplace`, `platform`, `portfolio`, `startup`)
- Frontend modules: kebab-case or single words (`design-system`, `components`, `pages`, `lib`, `auth`)

## Where to Add New Code

**Adding a New Backend Feature / Endpoint:**
- Define domain model/DTO records in `backend/src/main/java/com/startupinvestment/platform/<feature>/`.
- Create or update repository in `backend/src/main/java/com/startupinvestment/platform/<feature>/<Feature>Repository.java`.
- Create or update service in `backend/src/main/java/com/startupinvestment/platform/<feature>/<Feature>Service.java`.
- Create or update controller in `backend/src/main/java/com/startupinvestment/platform/<feature>/<Feature>Controller.java`.
- If schema changes are needed, append new migration file `backend/src/main/resources/db/migration/V<N+1>__<name>.sql`.
- Add integration test in `backend/src/test/java/com/startupinvestment/platform/<feature>/`.

**Adding a New Frontend Page or Workflow:**
- Define TypeScript types in `frontend/src/<domain>/<domain>.types.ts`.
- Add API functions in `frontend/src/<domain>/<domain>.api.ts` using `apiRequest()`.
- Create page component in `frontend/src/pages/<FeaturePage>.tsx`.
- Register route in `frontend/src/App.tsx`, applying `RequireAuth` and `RequireRole` guards if restricted.
- Add page unit/integration tests in `frontend/src/pages/<FeaturePage>.test.tsx`.

**Adding Shared UI Components:**
- Implement in `frontend/src/design-system/<ComponentName>.tsx`.
- Export from `frontend/src/design-system/index.ts`.
- Define associated classes in `frontend/src/design-system/components.css`.

## Special Directories

**`.planning/`:**
- Purpose: GSD workflow planning artifacts, roadmap state, and codebase analysis maps.
- Generated: Maintained by GSD tools.
- Committed: Yes.

**`backend/target/` and `frontend/dist/`:**
- Purpose: Build artifacts, compiled classes, and bundled static assets.
- Generated: Yes (Maven and Vite).
- Committed: No (ignored via `.gitignore`).

---

*Structure analysis: 2026-11-10*
