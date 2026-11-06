# Startup Investment Platform

Startup Investment Platform is a local-first simulated investment platform for founders, investors, and administrators. Founders can create and submit company profiles, administrators can review and publish approved companies, and investors can discover fundraising opportunities, record simulated commitments, track portfolio values, and interact with startups.

## What the platform provides

- Startup registration, profiles, metrics, pitch links, and supporting documents
- Admin review, feedback, approval, rejection, and public-visibility controls
- Fundraising rounds with targets, commitment limits, valuation caps, and closing dates
- Investor discovery with search and stage or sector filters
- Simulated commitments with capacity checks and cancellation history
- Company-specific equity share allocations and round capacity tracking
- Admin valuation snapshots and investor portfolio analytics
- Investor watchlists with private thesis notes
- Investor interest requests and a startup-side interest inbox
- Session authentication, role-based access, CSRF protection, and health checks

## Main user roles

| Role | Capabilities |
| --- | --- |
| **Startup** | Create and submit a profile, attach pitch or document links, configure a fundraising round, open or close the round, and read investor interest requests. |
| **Investor** | Discover approved public startups and open rounds, filter opportunities, make or cancel simulated commitments, view portfolio analytics, save watchlists, add thesis notes, and send interest requests. |
| **Admin** | Review startup submissions, request changes, approve or reject profiles, control public visibility and fundraising access, and record valuation snapshots. |

## Technology stack

- **Frontend:** React 19, TypeScript, Vite, and React Router
- **Backend:** Java 21, Spring Boot 4.1.2, Spring MVC, JDBC, validation, and Actuator
- **Database:** PostgreSQL 18, run locally with Docker Compose
- **Migrations:** Flyway versioned SQL migrations
- **Authentication:** Server-side sessions with HttpOnly cookies and CSRF tokens
- **Testing:** Spring Boot test support, H2 for backend tests, Vitest, Testing Library, TypeScript, and ESLint

## Architecture

```text
React/Vite browser (:5173)
          |
          | JSON REST over HTTP
          v
Spring Boot API (:8080)
          |
          | JDBC + Flyway
          v
PostgreSQL (:5432)
```

The frontend calls the backend API. The backend enforces authentication and role boundaries, persists application data through JDBC, and applies database migrations with Flyway. PostgreSQL is the only service started by Docker Compose.

## Project structure

```text
backend/             Spring Boot API, business logic, tests, and migrations
frontend/            React/Vite application, pages, API clients, and tests
docs/                API contract and verification notes
docker-compose.yml   Local PostgreSQL service
start.ps1            PowerShell script to start database, backend, and frontend
start.bat            Command Prompt startup script
package.json         Root convenience scripts
```

## Requirements

The documented local setup targets Windows and requires:

- Node.js 24.x and npm 11.x
- JDK 21 or newer
- Apache Maven 3.6.3 or newer
- Docker Desktop with Docker Compose

The backend is configured for Java 21 bytecode. Docker Compose supplies PostgreSQL 18 for local development.

## Quick start on Windows

Clone the repository and open PowerShell at its root:

```powershell
git clone https://github.com/shde21/startup-investment-platform.git
Set-Location startup-investment-platform
```

If `.env` does not exist, copy the local database defaults and start PostgreSQL:

```powershell
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
docker compose up -d postgres
```

Open a second PowerShell window at the repository root and start the backend:

```powershell
Set-Location .\backend
mvn spring-boot:run
```

Open a third PowerShell window at the repository root, install frontend dependencies, and start Vite:

```powershell
Set-Location .\frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

For automated Windows startup, run `.\start.ps1` from the repository root in PowerShell, or run `start.bat` from Command Prompt. These scripts start PostgreSQL, the backend, and the frontend.

## Environment configuration

The root `.env` file is read by Docker Compose. Spring Boot reads backend settings from the process environment, and Vite reads `VITE_` settings from `frontend/.env*` files or the shell environment. The local defaults already match the provided Docker Compose setup.

### Database and backend variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `POSTGRES_DB` | `startup_investment` | PostgreSQL database created by Docker Compose |
| `POSTGRES_USER` | `startup_app` | PostgreSQL user created by Docker Compose |
| `POSTGRES_PASSWORD` | `change-me-local-only` | Local PostgreSQL password |
| `DB_URL` | `jdbc:postgresql://localhost:5432/startup_investment` | Backend JDBC connection string |
| `DB_USERNAME` | `startup_app` | Backend database username |
| `DB_PASSWORD` | `change-me-local-only` | Backend database password |
| `SERVER_PORT` | `8080` | Backend HTTP port |
| `FRONTEND_ORIGIN` | `http://localhost:5173` | Allowed frontend origin |
| `SESSION_COOKIE_SECURE` | `false` | Whether the session cookie requires HTTPS |
| `SESSION_COOKIE_SAME_SITE` | `lax` | Session cookie SameSite policy |

### Frontend variable

Copy `frontend/.env.example` to `frontend/.env.local` only when the API is not running on its default URL:

```text
VITE_API_BASE_URL=http://localhost:8080
```

### Optional demo administrator

Public registration creates only Startup and Investor accounts. To seed a local administrator, set these process variables before starting the backend from the repository root:

```powershell
$env:DEMO_ADMIN_ENABLED = "true"
$env:DEMO_ADMIN_EMAIL = "admin@ventureline.local"
$env:DEMO_ADMIN_PASSWORD = "choose-a-local-password-12"
Set-Location .\backend
mvn spring-boot:run
```

Use a local password and never commit credentials.

## Application workflow

1. **Register and sign in:** A user registers as a Startup or Investor. The browser uses an HttpOnly session cookie and CSRF token for state-changing requests.
2. **Submit a startup profile:** A Startup saves company information, metrics, pitch links, and optional supporting documents, then submits the profile for review.
3. **Review and publish:** An Admin requests changes, approves or rejects the profile, and controls whether an approved profile is public.
4. **Configure fundraising:** An approved public Startup saves round terms and opens the round for commitments.
5. **Discover and commit:** An Investor filters approved public startups or open rounds, saves watchlists, adds private thesis notes, sends interest requests, and records simulated commitments.
6. **View portfolio and valuations:** Admin valuation snapshots allow eligible investor positions to show illustrative current values, share pricing, and gains based on company capitalization and locked acquisition prices.
7. **Manage marketplace conversations:** Investors can review or withdraw pending interest requests, while Startups can read incoming requests.

## API documentation

See [`docs/api.md`](docs/api.md) for the REST endpoints, request examples, authentication behavior, role boundaries, and error responses.

## Verification and tests

Run the backend verification from `backend/`:

```powershell
mvn -B -Dmaven.compiler.release=17 verify
```

Run the frontend checks from `frontend/`:

```powershell
npm install
npm run lint
npm run typecheck
npm test -- --run
npm run build
```

With the backend and database running, check the service endpoints:

```powershell
Invoke-WebRequest http://localhost:8080/actuator/health
Invoke-WebRequest http://localhost:8080/api/v1/platform
```

The documented final verification is available in [`docs/final-stage-verification.md`](docs/final-stage-verification.md).

## Limitations

- This is a simulated investment platform; it does not process real money, hold assets, settle securities, provide investment advice, or create legally binding commitments.
- Startup documents are represented by validated HTTP or HTTPS links; binary file uploads are not implemented.
- The repository provides a local development setup, not production deployment, backup, or observability automation.

## Final project status

The complete platform is implemented and verified across startup onboarding, admin review, fundraising, investor commitments, portfolio analytics, valuation snapshots, and marketplace interactions. See [`docs/final-stage-verification.md`](docs/final-stage-verification.md) for the recorded verification details.