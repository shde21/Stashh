# Technology Stack

**Analysis Date:** 2026-11-10

## Languages

**Primary:**
- Java 21 - Backend API, domain models, business logic, authorization, and persistence (`backend/src/main/java`)
- TypeScript 5.9.3 - Frontend user interface, routing, design system, and API clients (`frontend/src`)

**Secondary:**
- SQL (PostgreSQL dialect) - Versioned database migrations and relational schema definitions (`backend/src/main/resources/db/migration/`)
- CSS3 / Design Tokens - Custom theme and component token system (`frontend/src/design-system/tokens.css`, `frontend/src/design-system/components.css`, `frontend/src/index.css`)
- PowerShell & Batch - Developer orchestration and local automation scripts (`start.ps1`, `start.bat`, `db-shell.bat`)
- JSON - Configuration, project metadata, and REST API communication (`package.json`, `frontend/package.json`, `tsconfig.json`)

## Runtime

**Environment:**
- Backend: OpenJDK 21 / JVM
- Frontend: Node.js 24.x, npm 11.x
- Database: Docker Engine / Docker Compose running PostgreSQL 18 Alpine (`postgres:18-alpine`)

**Package Manager:**
- Backend: Apache Maven 3.6.3+ (`backend/pom.xml`)
- Frontend: npm 11.x (`frontend/package.json`)
- Root: npm 11.x (`package.json`)
- Lockfiles: Present (`package-lock.json` in root and `frontend/package-lock.json`)

## Frameworks

**Core:**
- Spring Boot 4.1.2 - Backend REST web service framework (`backend/pom.xml`):
  - `spring-boot-starter-web` (Spring MVC, Tomcat embedded container)
  - `spring-boot-starter-jdbc` (Spring JDBC, HikariCP connection pool)
  - `spring-boot-starter-validation` (Jakarta Validation / Hibernate Validator)
  - `spring-boot-starter-actuator` (Health checks and operational metrics)
  - `spring-security-crypto` (BCrypt password encoding)
- React 19.3.1 - Frontend reactive UI library (`frontend/package.json`)
- React DOM 19.3.1 - DOM renderer for React
- React Router DOM 7.18.4 - Client-side SPA routing and navigation

**Testing:**
- Backend:
  - JUnit 5 (Jupiter 5.x) - Unit and integration test runner
  - Spring Boot Test (`spring-boot-starter-webmvc-test`) - MockMvc MVC slice testing
  - H2 Database Engine (`com.h2database:h2:scope test`) - In-memory database for automated integration tests
- Frontend:
  - Vitest 5.0.5 - Fast ESM-native test runner
  - `@testing-library/react` 16.3.3 - React component testing utilities
  - `@testing-library/jest-dom` 7.0.1 - DOM matchers for assertion library
  - `@testing-library/user-event` 14.6.8 - Browser event simulation
  - `jsdom` 30.1.3 - Headless browser DOM environment

**Build/Dev:**
- Backend:
  - Apache Maven Compiler Plugin (Java 21 target bytecode)
  - Spring Boot Maven Plugin (`spring-boot-maven-plugin`) for packaging and `mvn spring-boot:run`
- Frontend:
  - Vite 8.3.5 - High-performance dev server with HMR and Rollup-based production builder
  - `@vitejs/plugin-react` 6.1.2 - Fast Refresh support for React
  - TypeScript Compiler `tsc -b` - Static type checking
  - ESLint 10.13.0 - Linter with `@eslint/js`, `typescript-eslint` 8.72.0, `eslint-plugin-react-hooks` 7.1.1, `eslint-plugin-react-refresh` 0.5.7
- UI Utility Libraries:
  - `lucide-react` 1.61.0 - Icon library
  - `@fontsource-variable/inter` 5.3.0 - Inter variable font package

## Key Dependencies

**Critical:**
- `org.flywaydb:flyway-database-postgresql` & `spring-boot-starter-flyway` - Database migration lifecycle management on application startup (`backend/src/main/resources/db/migration/`)
- `org.postgresql:postgresql` - Official PostgreSQL JDBC driver for production and local container connectivity
- `tools.jackson.databind:tools.jackson` - JSON serialization and deserialization engine for Spring Boot 4 REST endpoints and CSRF responses
- `org.springframework.security:spring-security-crypto` - `BCryptPasswordEncoder` for hashing user credentials

**Infrastructure:**
- HikariCP - High-performance JDBC connection pooling (`spring.datasource.hikari` in `backend/src/main/resources/application.yml`)
- Docker Compose - Container orchestration for local PostgreSQL instance (`docker-compose.yml`)

## Configuration

**Environment:**
- Root environment: `.env` (copied from `.env.example`), ingested by Docker Compose for container variables:
  - `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`
- Backend environment: Process environment variables read in `backend/src/main/resources/application.yml`:
  - `DB_URL` (default: `jdbc:postgresql://localhost:5432/startup_investment`)
  - `DB_USERNAME` (default: `startup_app`)
  - `DB_PASSWORD` (default: `change-me-local-only`)
  - `SERVER_PORT` (default: `8080`)
  - `FRONTEND_ORIGIN` (default: `http://localhost:5173`)
  - `SESSION_COOKIE_SECURE` (default: `false`)
  - `SESSION_COOKIE_SAME_SITE` (default: `lax`)
  - `DEMO_ADMIN_ENABLED`, `DEMO_ADMIN_EMAIL`, `DEMO_ADMIN_PASSWORD` (optional demo seeder)
- Frontend environment:
  - `frontend/.env.example` -> `frontend/.env.local`:
  - `VITE_API_BASE_URL` (default: `http://localhost:8080`)

**Build:**
- Root: `package.json` with scripts calling `start.ps1`, `mvn`, and `npm`
- Backend: `backend/pom.xml`
- Frontend: `frontend/vite.config.ts`, `frontend/tsconfig.json`, `frontend/tsconfig.app.json`, `frontend/tsconfig.node.json`, `frontend/eslint.config.js`

## Platform Requirements

**Development:**
- Windows 10/11 (or macOS / Linux with Bash equivalents)
- OpenJDK 21 or newer
- Node.js 24.x and npm 11.x
- Apache Maven 3.6.3 or newer
- Docker Desktop with Docker Compose v2+

**Production:**
- Standard containerized or standalone JVM 21 environment connecting to managed PostgreSQL 18 instance.
- Static hosting (Nginx, S3/CloudFront, Vercel, Netlify) for Vite-built frontend artifacts (`frontend/dist/`).

---

*Stack analysis: 2026-11-10*
