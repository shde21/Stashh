# Stage 3 Verification

**Verification date:** October 24, 2026

## Result

Stage 3 is implemented and verified across the backend workflow and frontend application build.

## Delivered workflow

- A startup can create or update one private company profile.
- Profile fields include company identity, description, website, pitch link, location, team size, founded year, and sector.
- Required metrics are selected by company stage: pre-revenue, early revenue, or growth.
- Startups can add and remove validated HTTP/HTTPS document links.
- A complete profile can be submitted for admin review.
- Admins can request changes, approve, or reject a submitted profile.
- Review actions and notes are stored.
- Only approved profiles can be made public.
- Investors see only approved, public startup profiles.

## Automated checks

### Backend

Command, run from `backend/`:

```powershell
mvn -B -Dmaven.compiler.release=17 verify
```

Result: **PASS**

- 11 tests run
- 0 failures
- 0 errors
- 0 skipped
- Flyway validated and applied migrations 1, 2, and 3 in the test database.
- `StartupWorkflowControllerTest` covers profile save, submission, admin approval, public visibility, and investor discovery.
- Spring Boot JAR was packaged under `backend/target/`.

The local verification container has Java 17, so `maven.compiler.release=17` was supplied for the check. The repository remains configured for Java 21 bytecode in `backend/pom.xml` for the documented Windows environment.

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

## Remaining Stage 3 boundary

Documents are link-based in this stage. Binary upload storage, fundraising pools, investor commitments, portfolios, and equity share allocations remain deferred to later stages.
