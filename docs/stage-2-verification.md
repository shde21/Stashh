# Stage 2 Verification

**Verification date:** October 23, 2026

## Result

Stage 2 verification completed successfully after repairing two version-compatibility/setup issues:

- Spring Boot 4 test imports and test dependencies were updated.
- PostgreSQL 18 Compose storage was moved to the supported `/var/lib/postgresql` mount.

## Automated checks

### Backend

Command, run from `backend/`:

```powershell
mvn -B clean verify
```

Result: **PASS**

- 10 tests run
- 0 failures
- 0 errors
- 0 skipped
- `AuthControllerTest`: 7 tests
- `PlatformStatusControllerTest`: 2 tests
- `PlatformStatusServiceTest`: 1 test
- Packaged Spring Boot JAR created under `backend/target/`

The authentication tests cover registration, login, session-backed `/me`, logout invalidation, duplicate normalized emails, invalid credentials, CSRF rejection, and startup/investor/admin role boundaries.

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
- Vitest: 4 files and 10 tests passed
- Vite production build: passed

### Compose/PostgreSQL

Commands:

```powershell
docker compose config --quiet
```

Result: **PASS**

- Compose configuration is valid.
- `startup-investment-postgres` is running and healthy.
- PostgreSQL 18 is accepting connections on `localhost:5432`.
- Flyway applied and validated migrations 1 and 2 against PostgreSQL.
- No Docker volumes were deleted during the mount correction.

## Live API smoke verification

The existing backend on `http://localhost:8080` was exercised against the running PostgreSQL container. A second current-workspace backend was also started on `http://localhost:8081` with the local demo-admin seeder enabled to verify the ADMIN boundary.

Verified responses:

| Check | Result |
| --- | --- |
| `GET /actuator/health` | `200`, status `UP` |
| `GET /api/v1/platform` | `200`, database `connected`, migration version `1` |
| `GET /api/v1/auth/csrf` | `200`, session-scoped token returned |
| STARTUP registration | `201`, password omitted from response |
| STARTUP `/api/v1/me` | `200` |
| STARTUP access boundary | `200` |
| STARTUP to INVESTOR/ADMIN boundaries | `403` |
| Duplicate normalized email | `409`, `EMAIL_IN_USE` |
| Logout | `204` |
| `/api/v1/me` after logout | `401`, `UNAUTHENTICATED` |
| Login with the registered STARTUP account | `200` |
| Invalid CSRF token | `403`, `CSRF_INVALID` |
| INVESTOR registration and access | `201` then `200` |
| INVESTOR to STARTUP/ADMIN boundaries | `403` |
| Demo ADMIN login | `200`, role `ADMIN` |
| ADMIN access boundary | `200` |
| ADMIN to STARTUP/INVESTOR boundaries | `403` |
| CORS preflight from `http://localhost:5173` | `200`, credentials allowed |

## Frontend dev-server smoke

The Vite dev server was started at `http://127.0.0.1:5173` and returned the application HTML with HTTP 200. The browser-session contract is covered by the frontend login and registration tests; the live API smoke above verifies the corresponding backend session and CSRF behavior.

## Fixes made during verification

- `backend/pom.xml`: use the Spring Boot 4 Web MVC test starter and Flyway starter.
- `backend/src/test/java/...`: use the Spring Boot 4 `AutoConfigureMockMvc` package.
- `backend/src/main/resources/application.yml`: use the Boot 4/Jackson 3 date configuration.
- `backend/src/main/resources/db/migration/V1__create_platform_metadata.sql`: use portable `TIMESTAMP WITH TIME ZONE` syntax.
- `backend/src/main/resources/db/migration/V2__create_auth_users.sql`: use portable `TIMESTAMP WITH TIME ZONE` syntax.
- `backend/src/main/java/.../PlatformStatusService.java`: explicitly inject the production constructor.
- `docker-compose.yml`: mount the PostgreSQL 18 data volume at `/var/lib/postgresql`.
- `frontend/src/pages/RegisterPage.test.tsx`: cover registration validation, role selection, API submission, and API validation errors.
- `docs/postman/stage-2-authentication.postman_collection.json`: correct the collection metadata to Stage 2.

## Warnings and remaining gaps

- Maven printed `401` metadata warnings for inaccessible Flyway private-repository mirrors; all required artifacts resolved and the build passed.
- Tests printed the expected Flyway/H2 version warning and Mockito dynamic-agent warnings on JDK 26. Neither caused a failure.
- Live verification used local test accounts in the local PostgreSQL database. They are not production credentials.
- No browser automation was required; frontend behavior is covered by the existing Vitest tests plus the Vite HTTP smoke check.
