# External Integrations

**Analysis Date:** 2026-11-10

## APIs & External Services

**Third-Party Payment / Banking:**
- None. This is a local-first simulated investment marketplace. Financial transactions, pledges, and valuations are computed and maintained via database records without connecting to real payment rails or bank ACH/wire APIs.

**External Pitch Decks & Documents:**
- Startups link external supporting documentation (pitch decks, business plans, financials) via validated HTTP and HTTPS URLs (`backend/src/main/java/com/startupinvestment/platform/startup/StartupDocument.java`).
- No binary blob storage service (e.g. AWS S3, Cloudinary, GCP Cloud Storage) is attached. Document metadata and external URLs are stored directly in the `startup_documents` database table.

## Data Storage

**Databases:**
- **PostgreSQL 18** (Docker image `postgres:18-alpine`):
  - Primary production and local relational data store.
  - Connection: `DB_URL` (default: `jdbc:postgresql://localhost:5432/startup_investment`)
  - User: `DB_USERNAME` (default: `startup_app`)
  - Password: `DB_PASSWORD` (default: `change-me-local-only`)
  - Connection Pool: HikariCP via Spring Boot Starter JDBC (`maximum-pool-size: 10`, `minimum-idle: 2`).
  - Migration Tool: Flyway versioned SQL migrations (`V1` through `V7`) located at `backend/src/main/resources/db/migration/`.
  - Persistence Layer: Spring `JdbcTemplate` without heavy ORM / Hibernate mappings.
- **H2 In-Memory Database**:
  - Used strictly in automated integration test execution (`backend/src/test/resources/application-test.yml`).
  - Allows tests to execute rapidly without requiring a running Docker or PostgreSQL daemon.

**File Storage:**
- Local filesystem only for project code and compiled assets.
- No dynamic file upload endpoint or external file bucket is configured.

**Caching:**
- In-memory session tracking via standard servlet container `HttpSession`.
- No distributed caching servers (e.g. Redis, Memcached).

## Authentication & Identity

**Auth Provider:**
- Custom server-side session authentication with password hashing:
  - User Table: `app_users` table in PostgreSQL.
  - Password Hashing: BCrypt algorithm via Spring Security Crypto (`BCryptPasswordEncoder`, 12 rounds in `backend/src/main/java/com/startupinvestment/platform/auth/PasswordConfig.java`).
  - Session Store: Server-side servlet session (`HttpSession`) with cookie-based session tracking (`SESSION` cookie, configured with `HttpOnly`, `SameSite: Lax`, and configurable `Secure` flag via `SESSION_COOKIE_SECURE`).
  - Session Lifecycle: Managed by `AuthSessionService.java` (`backend/src/main/java/com/startupinvestment/platform/auth/AuthSessionService.java`).
  - CSRF Defense: Custom session-bound CSRF token validation implemented via `CsrfService.java` and `CsrfFilter.java`. Every mutation (`POST`, `PUT`, `PATCH`, `DELETE`) on `/api/v1/` routes requires the `X-CSRF-Token` header.
  - Demo Admin Seeding: Optional startup bootstrap handled by `DemoAdminSeeder.java` if `DEMO_ADMIN_ENABLED=true`.

## Monitoring & Observability

**Health & Operational Metrics:**
- **Spring Boot Actuator**:
  - Health Endpoint: `GET /actuator/health` exposing database connectivity status (`components.db.status`).
  - Info Endpoint: `GET /actuator/info` exposing application name and active milestone stage.
  - Custom Platform Status: `GET /api/v1/platform` exposing database connection verification, checked timestamp, and latest applied Flyway schema version.

**Logs:**
- Standard output (stdout/console) via SLF4J / Logback embedded in Spring Boot.
- Log level configurable through Spring application configuration.

## CI/CD & Deployment

**Local Development Orchestration:**
- `start.ps1` - PowerShell orchestrator that starts Docker PostgreSQL, checks health, runs Maven backend, and launches Vite frontend.
- `start.bat` - Command Prompt wrapper for automated multi-process local launch.
- `db-shell.bat` - Interactive `psql` container shell launcher.

**CI Pipeline:**
- No remote CI pipeline configuration files (such as `.github/workflows` or `.gitlab-ci.yml`) are present in the repository. Local verification commands are documented in `README.md` and `docs/final-stage-verification.md`.

## Environment Configuration

**Required env vars (Backend / Docker):**
- `POSTGRES_DB`: Name of the PostgreSQL database (default: `startup_investment`)
- `POSTGRES_USER`: Database user (default: `startup_app`)
- `POSTGRES_PASSWORD`: Database password (default: `change-me-local-only`)
- `DB_URL`: JDBC connection URL
- `DB_USERNAME`: Database username for backend
- `DB_PASSWORD`: Database password for backend
- `FRONTEND_ORIGIN`: Allowed CORS origin for the React frontend (default: `http://localhost:5173`)
- `SESSION_COOKIE_SECURE`: Boolean flag to enforce HTTPS cookies in production environments (default: `false` for local dev)

**Required env vars (Frontend):**
- `VITE_API_BASE_URL`: Base URL for the Spring Boot backend REST API (default: `http://localhost:8080`)

**Secrets location:**
- Root `.env` (gitignored, initialized from `.env.example`).
- Shell environment / process environment variables.

## Webhooks & Callbacks

**Incoming:**
- None. No third-party external webhook consumers are required.

**Outgoing:**
- None. All platform state transitions, round openings, commitments, and status updates are synchronous REST interactions.

---

*Integration audit: 2026-11-10*
