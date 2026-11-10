<!-- GSD:project-start source:PROJECT.md -->
## Project

**Stashh Startup Investment Platform**

Stashh is a comprehensive startup investment and fundraising marketplace connecting Founders, Investors, and Platform Administrators. It provides end-to-end deal discovery, startup capitalization and equity modeling, fundraising round management, commitment allocation, and investor portfolio tracking.

**Core Value:** Provide a reliable, mathematically rigorous startup investment platform that bridges founders and investors with transparent deal flows, strict capitalization integrity, and role-governed workflows.

### Constraints

- **Tech Stack**: Must preserve Java 21, Spring Boot 4, PostgreSQL, React 19, and Vite.
- **Design System**: Must adhere to existing custom CSS tokens and components in `frontend/src/design-system/`.
- **Financial Math**: Strict maintenance of database check constraints on company capitalization and integer share allocations.
- **Infrastructure**: Use Spring Session JDBC over PostgreSQL to avoid mandatory external dependencies such as Redis.
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- Java 21 - Backend API, domain models, business logic, authorization, and persistence (`backend/src/main/java`)
- TypeScript 5.9.3 - Frontend user interface, routing, design system, and API clients (`frontend/src`)
- SQL (PostgreSQL dialect) - Versioned database migrations and relational schema definitions (`backend/src/main/resources/db/migration/`)
- CSS3 / Design Tokens - Custom theme and component token system (`frontend/src/design-system/tokens.css`, `frontend/src/design-system/components.css`, `frontend/src/index.css`)
- PowerShell & Batch - Developer orchestration and local automation scripts (`start.ps1`, `start.bat`, `db-shell.bat`)
- JSON - Configuration, project metadata, and REST API communication (`package.json`, `frontend/package.json`, `tsconfig.json`)
## Runtime
- Backend: OpenJDK 21 / JVM
- Frontend: Node.js 24.x, npm 11.x
- Database: Docker Engine / Docker Compose running PostgreSQL 18 Alpine (`postgres:18-alpine`)
- Backend: Apache Maven 3.6.3+ (`backend/pom.xml`)
- Frontend: npm 11.x (`frontend/package.json`)
- Root: npm 11.x (`package.json`)
- Lockfiles: Present (`package-lock.json` in root and `frontend/package-lock.json`)
## Frameworks
- Spring Boot 4.1.2 - Backend REST web service framework (`backend/pom.xml`):
- React 19.3.1 - Frontend reactive UI library (`frontend/package.json`)
- React DOM 19.3.1 - DOM renderer for React
- React Router DOM 7.18.4 - Client-side SPA routing and navigation
- Backend:
- Frontend:
- Backend:
- Frontend:
- UI Utility Libraries:
## Key Dependencies
- `org.flywaydb:flyway-database-postgresql` & `spring-boot-starter-flyway` - Database migration lifecycle management on application startup (`backend/src/main/resources/db/migration/`)
- `org.postgresql:postgresql` - Official PostgreSQL JDBC driver for production and local container connectivity
- `tools.jackson.databind:tools.jackson` - JSON serialization and deserialization engine for Spring Boot 4 REST endpoints and CSRF responses
- `org.springframework.security:spring-security-crypto` - `BCryptPasswordEncoder` for hashing user credentials
- HikariCP - High-performance JDBC connection pooling (`spring.datasource.hikari` in `backend/src/main/resources/application.yml`)
- Docker Compose - Container orchestration for local PostgreSQL instance (`docker-compose.yml`)
## Configuration
- Root environment: `.env` (copied from `.env.example`), ingested by Docker Compose for container variables:
- Backend environment: Process environment variables read in `backend/src/main/resources/application.yml`:
- Frontend environment:
- Root: `package.json` with scripts calling `start.ps1`, `mvn`, and `npm`
- Backend: `backend/pom.xml`
- Frontend: `frontend/vite.config.ts`, `frontend/tsconfig.json`, `frontend/tsconfig.app.json`, `frontend/tsconfig.node.json`, `frontend/eslint.config.js`
## Platform Requirements
- Windows 10/11 (or macOS / Linux with Bash equivalents)
- OpenJDK 21 or newer
- Node.js 24.x and npm 11.x
- Apache Maven 3.6.3 or newer
- Docker Desktop with Docker Compose v2+
- Standard containerized or standalone JVM 21 environment connecting to managed PostgreSQL 18 instance.
- Static hosting (Nginx, S3/CloudFront, Vercel, Netlify) for Vite-built frontend artifacts (`frontend/dist/`).
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Naming Patterns
- Java source files: `PascalCase.java` matching class or record name (`StartupService.java`, `CompanyCapitalization.java`, `CommitmentRequest.java`).
- React components & view pages: `PascalCase.tsx` (`InvestorPortfolioPage.tsx`, `AppShell.tsx`, `Button.tsx`).
- TypeScript utilities and API services: `kebab-case.api.ts` or `name.ts` (`auth.api.ts`, `fundraising.api.ts`, `validators.ts`, `api.ts`).
- TypeScript type definitions: `*.types.ts` (`auth.types.ts`, `startup.types.ts`).
- Stylesheets: `kebab-case.css` (`tokens.css`, `components.css`, `index.css`).
- Database migrations: `V<Version>__<snake_case_description>.sql` (`V7__create_shares_capitalization_architecture.sql`).
- Java methods: `camelCase` describing the intent (`requireUser`, `createCommitment`, `getPortfolioSummary`, `verifyCsrfToken`).
- TypeScript / React functions: `camelCase` for utilities/hooks (`useAuth`, `useTheme`, `apiRequest`, `formatCurrency`, `validateEmail`) and `PascalCase` for React functional components (`InvestorDiscoverPage`, `StatusPill`).
- Local variables and parameters: `camelCase` (`companyName`, `pricePerShare`, `poolId`).
- Constants / Static final: `UPPER_SNAKE_CASE` (`DEFAULT_MIN_COMMITMENT`, `HEADER_NAME`, `SESSION_USER_KEY`).
- CSS custom properties (tokens): `--kebab-case` (`--surface-raised`, `--accent`, `--border-strong`, `--radius-md`).
- Java records: `PascalCase` (`ApiErrorResponse`, `PlatformStatus`, `SessionUser`, `CompanyCapitalizationRequest`).
- TypeScript interfaces & types: `PascalCase` (`PlatformStatus`, `StartupProfile`, `FundraisingPool`, `InvestorCommitment`).
## Code Style
- Target version: Java 21 LTS with modern language features (records, pattern matching, text blocks).
- Formatting: 4-space indentation, standard Java brace style (same line `{`).
- Immutability: Use Java `record` for DTOs, request bodies, and value objects instead of Lombok or mutable POJOs with getters/setters.
- Spring Idioms: Constructor-based dependency injection exclusively (no field `@Autowired`).
- Annotations: Jakarta Validation annotations (`@Valid`, `@NotBlank`, `@NotNull`, `@Min`) on controller request parameters.
- Target version: TypeScript 5.9+ with strict mode enabled.
- Formatting: 2-space indentation, single quotes, no semicolons (enforced by ESLint).
- Modern React: React 19 functional components with hooks (`useState`, `useEffect`, `useCallback`, `useContext`). Class components are not used.
- Linting: ESLint flat configuration (`eslint.config.js`) using `@typescript-eslint/recommended`, `eslint-plugin-react-hooks`, and `eslint-plugin-react-refresh`.
- No unused variables rule strictly enforced (`@typescript-eslint/no-unused-vars` with `argsIgnorePattern: '^_'`).
## Import Organization
- Order:
- Order:
## Error Handling
- Throw domain exceptions (`AuthException`, `IllegalArgumentException`, `IllegalStateException`) with concise error messages and machine-readable error codes.
- Centralized exception translation via `@RestControllerAdvice` in `AuthExceptionHandler.java`:
- `apiRequest` throws typed `ApiError` holding the HTTP status, machine error `code`, and `fieldErrors`.
- React pages catch `ApiError`, display contextual alert banners or toast notifications, and highlight specific invalid input fields.
## Logging
- Backend: SLF4J with standard Spring Boot formatting via `LoggerFactory.getLogger(Class)`.
- Frontend: Minimal `console.error` only for unhandled exceptions; UI errors are presented to users via toast or banner components.
## Comments
- Clean code principle: Code structure and naming should be self-documenting.
- Comments are reserved for architectural context, regulatory/simulation boundaries, or business formulas (e.g., share pricing calculations, capitalization mathematical balance checks).
- No commented-out legacy code.
## Function Design
- Small, single-responsibility functions. Complex business rules (like round share pricing or capitalization validation) are extracted into pure helper methods.
- Backend: Keep method signatures lean; group related inputs into Java records.
- Frontend: Use object destructuring for component props with explicit TypeScript interface definitions.
- Avoid returning null whenever possible; return empty collections (`List.of()`, `Collections.emptyList()`) or empty optionals.
## Module Design
- Design system: Centralized barrel export in `frontend/src/design-system/index.ts` allowing clean named imports (`import { Button, Card, Input } from '../design-system'`).
- Services and utilities: Named exports for functions and types (`export function apiRequest...`, `export type PlatformStatus...`).
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## System Overview
```text
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
- **Explicit Role Separation:** Three distinct business personas (`STARTUP`, `INVESTOR`, `ADMIN`), with strict server-enforced role access checks on every protected endpoint.
- **Direct Spring JDBC Repositories:** Plain SQL queries through `JdbcTemplate` mapped to immutable Java `record` classes instead of Hibernate/JPA entities. This prevents lazy loading exceptions, session detachment bugs, and unexpected query cascades.
- **Session-Bound CSRF & Cookie Security:** State-changing API operations require both an active authenticated session and a valid `X-CSRF-Token` header.
- **Simulated Financial Model with Share Capitalization:** Tracks startup capitalization (authorized, issued, outstanding shares) and calculates round share pricing (`round_valuation_basis`, `price_per_share`), strictly rejecting fractional share allocations.
## Layers
- Purpose: Delivers modern, responsive, role-tailored user interfaces with instant feedback.
- Location: `frontend/src/`
- Contains: React components, pages, design system tokens, validation utilities, and API client modules.
- Depends on: Backend HTTP REST endpoints.
- Used by: End users in modern desktop and mobile browsers.
- Purpose: Exposes HTTP REST endpoints, validates request payloads with Jakarta annotations (`@Valid`), manages session cookies, and handles HTTP status codes.
- Location: `backend/src/main/java/com/startupinvestment/platform/*/*Controller.java`
- Contains: Spring `@RestController` classes mapped under `/api/v1/...`.
- Depends on: Domain Service layer and `AuthSessionService`.
- Used by: Frontend HTTP client calls.
- Purpose: Enforces business logic, domain invariants (e.g. non-fractional share purchases, round capacity constraints, profile review transitions, capitalization integrity), and authorization checks.
- Location: `backend/src/main/java/com/startupinvestment/platform/*/*Service.java`
- Contains: Spring `@Service` classes annotated with `@Transactional`.
- Depends on: JDBC Repositories and `AuthUserRepository`.
- Used by: Controller classes.
- Purpose: Executes relational SQL queries and updates against PostgreSQL using Spring `JdbcTemplate`.
- Location: `backend/src/main/java/com/startupinvestment/platform/*/*Repository.java`
- Contains: Spring `@Repository` classes with parameterized SQL statements.
- Depends on: PostgreSQL datasource / HikariCP.
- Used by: Domain Services.
## Data Flow
### Primary Request Path (e.g., Investor Makes Commitment)
### Secondary Flow: Startup Onboarding & Admin Review
- Frontend: React Context (`AuthProvider`, `ThemeContext`) for session and theme state. Component-level `useState` and `useEffect` for page-specific data fetching and mutation handling.
- Backend: Stateful servlet sessions (`HttpSession`) stored in memory, with relational state persisted in PostgreSQL.
## Key Abstractions
- Purpose: Represents the authenticated actor stored within the servlet session.
- Example: `backend/src/main/java/com/startupinvestment/platform/auth/SessionUser.java`
- Pattern: Immutable Value Object containing `id`, `email`, and `UserRole`.
- Purpose: Models authorized, issued, outstanding, treasury, and reserved shares with par value.
- Example: `backend/src/main/java/com/startupinvestment/platform/startup/CompanyCapitalization.java`
- Pattern: Domain Entity with strict mathematical database constraints (`authorized >= issued + reserved`, `issued = outstanding + treasury`).
- Purpose: Combines commitment history, share counts, original purchase price, latest valuation snapshot, and current calculated position value.
- Example: `backend/src/main/java/com/startupinvestment/platform/portfolio/PortfolioPosition.java`
- Pattern: Read-Model Aggregation / DTO.
## Entry Points
- Location: `backend/src/main/java/com/startupinvestment/platform/StartupInvestmentApplication.java`
- Triggers: `mvn spring-boot:run` or executing the packaged jar file.
- Responsibilities: Initializes Spring Boot context, runs Flyway migrations, configures Tomcat container on port 8080, and runs `DemoAdminSeeder`.
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
### Anti-Pattern 2: Client-Driven Financial Calculations
## Error Handling
- `AuthExceptionHandler` (`backend/src/main/java/com/startupinvestment/platform/auth/AuthExceptionHandler.java`) catches `AuthException`, `MethodArgumentNotValidException`, and general exceptions, returning structured `ApiErrorResponse(code, message, fieldErrors)`.
- Frontend `apiRequest` catches non-2xx responses and converts them into typed `ApiError` instances consumed by form state handlers.
## Cross-Cutting Concerns
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
