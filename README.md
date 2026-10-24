# Startup Investment Platform

Stage 3 adds the first connected product workflow on top of the Stage 2 authentication and role-aware application layout:

- React + TypeScript + Vite frontend
- Java + Spring Boot REST backend
- PostgreSQL with versioned Flyway migrations
- Actuator health checks and a database-backed platform status endpoint
- Session-based authentication with Startup, Investor, and Admin roles
- CSRF protection for state-changing API requests
- Role-protected dashboard shells and responsive navigation
- Startup profiles with stage-aware metrics and linked pitch/documents
- Startup submission and admin review workflows with review notes
- Approval-gated public visibility and investor discovery
- Backend and frontend tests
- Windows-first local setup documentation

Fundraising, QUANTS, portfolios, and simulated marketplace features are intentionally deferred to later stages.

## Architecture

```text
Browser (React/Vite :5173)
        |
        | JSON REST
        v
Spring Boot API (:8080)
        |
        | JDBC + Flyway
        v
PostgreSQL (:5432)
```

The application is split into independently runnable modules:

```text
backend/       Maven Spring Boot service and migrations
frontend/      Vite React TypeScript application
docs/          API and architecture notes
docker-compose.yml  Local PostgreSQL only
```

## Prerequisites

Install or make available on Windows:

- Node.js 24.x and npm 11.x
- JDK 21 or newer (the current workspace has JDK 26)
- Apache Maven 3.6.3 or newer
- Docker Desktop with Compose, if you want to run PostgreSQL locally

Spring Boot 4.1.2 is configured in `backend/pom.xml`. The code targets Java 21 bytecode so it remains usable on supported newer JDKs.

## Quick start on Windows

From PowerShell at the repository root:

```powershell
# Optional: Docker Compose reads these local defaults from .env.
Copy-Item .env.example .env
docker compose up -d postgres
```

Start the backend in a second terminal:

```powershell
Set-Location backend
mvn spring-boot:run
```

Start the frontend in a third terminal:

```powershell
Set-Location frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

The foundation page calls the backend; it does not use hardcoded platform status data. The backend calls PostgreSQL and Flyway applies the migration before serving the status endpoint.

## Environment variables

Docker Compose reads the root `.env` file. Spring Boot reads backend variables from the process environment, and Vite reads variables beginning with `VITE_` from `frontend/.env*` files or the shell environment; neither automatically parses the root `.env` file. The committed defaults in `application.yml` and `api.ts` match the local Compose and frontend ports, so the first run works without extra environment configuration. Copy `frontend/.env.example` to `frontend/.env.local` when you need a different API URL.

Important variables:

| Variable | Default | Purpose |
| --- | --- | --- |
| `DB_URL` | `jdbc:postgresql://localhost:5432/startup_investment` | JDBC connection string |
| `DB_USERNAME` | `startup_app` | Database username |
| `DB_PASSWORD` | `change-me-local-only` | Local database password |
| `SERVER_PORT` | `8080` | Backend port |
| `FRONTEND_ORIGIN` | `http://localhost:5173` | Development CORS origin |
| `VITE_API_BASE_URL` | `http://localhost:8080` | Frontend API base URL |
| `DEMO_ADMIN_ENABLED` | `false` | Enables a local-only seeded admin account |
| `DEMO_ADMIN_EMAIL` | `admin@ventureline.local` | Demo admin email when enabled |
| `DEMO_ADMIN_PASSWORD` | empty | Required 12+ character demo admin password |
| `SESSION_COOKIE_SECURE` | `false` | Set `true` when serving through HTTPS |
| `SESSION_COOKIE_SAME_SITE` | `lax` | Session cookie SameSite policy; use `none` with HTTPS for genuinely cross-site deployments |

Do not commit real credentials. The example password is only for local development.

## Checks

Run backend checks from `backend/`:

```powershell
mvn clean verify
```

Run frontend checks from `frontend/`:

```powershell
npm install
npm run lint
npm run typecheck
npm test -- --run
npm run build
```

Run the database-backed service checks manually:

```powershell
Invoke-WebRequest http://localhost:8080/actuator/health
Invoke-WebRequest http://localhost:8080/api/v1/platform
```

Expected results include HTTP 200 responses, `"status":"UP"` from Actuator, and `"database":"connected"` from the platform endpoint.

## Stage 2 authentication flow

The browser uses an HttpOnly server session cookie. It does not store passwords or bearer tokens in local storage.

1. The frontend requests a CSRF token from `GET /api/v1/auth/csrf`.
2. Registration or login sends the token in `X-CSRF-Token`.
3. The backend creates the session and returns the authenticated role.
4. Protected routes call `GET /api/v1/me` and role-specific API boundaries remain enforced by the backend.

Public registration supports `STARTUP` and `INVESTOR`. `ADMIN` accounts are never created through the public form. For local admin review, enable the demo seeder with process environment variables before starting Spring Boot:

```powershell
$env:DEMO_ADMIN_ENABLED = "true"
$env:DEMO_ADMIN_EMAIL = "admin@ventureline.local"
$env:DEMO_ADMIN_PASSWORD = "use-a-local-password-123"
mvn spring-boot:run
```

The seeder is idempotent and does not overwrite an existing admin password.

## API documentation

See [`docs/api.md`](docs/api.md) for the Stage 3 REST contract, authentication flow, role boundaries, and error behavior.

## Current limitations

- Maven and Docker Desktop must be installed and available on `PATH`; this repository does not silently install them.
- Fundraising, QUANTS, portfolios, and marketplace domain tables are introduced with their later stages.
- Binary file storage and uploads are not part of Stage 3; documents are represented by validated HTTP/HTTPS links.
- PostgreSQL backups, observability, and deployment automation are not part of Stage 3.

## Stage 3 result

Stage 3 is implemented. Stage 4 can add fundraising pools, commitments, and investor discovery filters on top of approved startup profiles.
