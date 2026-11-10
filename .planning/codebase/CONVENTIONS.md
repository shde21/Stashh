# Coding Conventions

**Analysis Date:** 2026-11-10

## Naming Patterns

**Files:**
- Java source files: `PascalCase.java` matching class or record name (`StartupService.java`, `CompanyCapitalization.java`, `CommitmentRequest.java`).
- React components & view pages: `PascalCase.tsx` (`InvestorPortfolioPage.tsx`, `AppShell.tsx`, `Button.tsx`).
- TypeScript utilities and API services: `kebab-case.api.ts` or `name.ts` (`auth.api.ts`, `fundraising.api.ts`, `validators.ts`, `api.ts`).
- TypeScript type definitions: `*.types.ts` (`auth.types.ts`, `startup.types.ts`).
- Stylesheets: `kebab-case.css` (`tokens.css`, `components.css`, `index.css`).
- Database migrations: `V<Version>__<snake_case_description>.sql` (`V7__create_shares_capitalization_architecture.sql`).

**Functions & Methods:**
- Java methods: `camelCase` describing the intent (`requireUser`, `createCommitment`, `getPortfolioSummary`, `verifyCsrfToken`).
- TypeScript / React functions: `camelCase` for utilities/hooks (`useAuth`, `useTheme`, `apiRequest`, `formatCurrency`, `validateEmail`) and `PascalCase` for React functional components (`InvestorDiscoverPage`, `StatusPill`).

**Variables & Constants:**
- Local variables and parameters: `camelCase` (`companyName`, `pricePerShare`, `poolId`).
- Constants / Static final: `UPPER_SNAKE_CASE` (`DEFAULT_MIN_COMMITMENT`, `HEADER_NAME`, `SESSION_USER_KEY`).
- CSS custom properties (tokens): `--kebab-case` (`--surface-raised`, `--accent`, `--border-strong`, `--radius-md`).

**Types & Records:**
- Java records: `PascalCase` (`ApiErrorResponse`, `PlatformStatus`, `SessionUser`, `CompanyCapitalizationRequest`).
- TypeScript interfaces & types: `PascalCase` (`PlatformStatus`, `StartupProfile`, `FundraisingPool`, `InvestorCommitment`).

## Code Style

**Java / Spring Boot:**
- Target version: Java 21 LTS with modern language features (records, pattern matching, text blocks).
- Formatting: 4-space indentation, standard Java brace style (same line `{`).
- Immutability: Use Java `record` for DTOs, request bodies, and value objects instead of Lombok or mutable POJOs with getters/setters.
- Spring Idioms: Constructor-based dependency injection exclusively (no field `@Autowired`).
- Annotations: Jakarta Validation annotations (`@Valid`, `@NotBlank`, `@NotNull`, `@Min`) on controller request parameters.

**TypeScript / React:**
- Target version: TypeScript 5.9+ with strict mode enabled.
- Formatting: 2-space indentation, single quotes, no semicolons (enforced by ESLint).
- Modern React: React 19 functional components with hooks (`useState`, `useEffect`, `useCallback`, `useContext`). Class components are not used.
- Linting: ESLint flat configuration (`eslint.config.js`) using `@typescript-eslint/recommended`, `eslint-plugin-react-hooks`, and `eslint-plugin-react-refresh`.
- No unused variables rule strictly enforced (`@typescript-eslint/no-unused-vars` with `argsIgnorePattern: '^_'`).

## Import Organization

**Java:**
- Order:
  1. Standard Java packages (`java.*`, `javax.*`, `jakarta.*`)
  2. Spring Framework and third-party libraries (`org.springframework.*`, `tools.jackson.*`)
  3. Internal project packages (`com.startupinvestment.platform.*`)
  4. Static imports (`org.junit.jupiter.api.Assertions.*`, `org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*`)

**TypeScript / React:**
- Order:
  1. External library imports (`react`, `react-router-dom`, `lucide-react`)
  2. Internal absolute/relative path imports (design system, components, auth hooks)
  3. API services and utilities (`../lib/api`, `./fundraising.api`)
  4. Type-only imports (`import type { ... }`)
  5. Stylesheets (`import './index.css'`)

## Error Handling

**Backend Error Pattern:**
- Throw domain exceptions (`AuthException`, `IllegalArgumentException`, `IllegalStateException`) with concise error messages and machine-readable error codes.
- Centralized exception translation via `@RestControllerAdvice` in `AuthExceptionHandler.java`:
  - `AuthException` maps to 401 Unauthorized or 403 Forbidden with `ApiErrorResponse`.
  - `MethodArgumentNotValidException` maps to 400 Bad Request with field-level validation errors map (`fieldErrors`).
  - Standard error format:
    ```json
    {
      "code": "FRACTIONAL_SHARES_NOT_ALLOWED",
      "message": "Commitment amount must purchase an exact whole number of shares at ₹50.0000 per share.",
      "fieldErrors": {}
    }
    ```

**Frontend Error Pattern:**
- `apiRequest` throws typed `ApiError` holding the HTTP status, machine error `code`, and `fieldErrors`.
- React pages catch `ApiError`, display contextual alert banners or toast notifications, and highlight specific invalid input fields.

## Logging

**Framework:**
- Backend: SLF4J with standard Spring Boot formatting via `LoggerFactory.getLogger(Class)`.
- Frontend: Minimal `console.error` only for unhandled exceptions; UI errors are presented to users via toast or banner components.

## Comments

**Guidelines:**
- Clean code principle: Code structure and naming should be self-documenting.
- Comments are reserved for architectural context, regulatory/simulation boundaries, or business formulas (e.g., share pricing calculations, capitalization mathematical balance checks).
- No commented-out legacy code.

## Function Design

**Size:**
- Small, single-responsibility functions. Complex business rules (like round share pricing or capitalization validation) are extracted into pure helper methods.

**Parameters:**
- Backend: Keep method signatures lean; group related inputs into Java records.
- Frontend: Use object destructuring for component props with explicit TypeScript interface definitions.

**Return Values:**
- Avoid returning null whenever possible; return empty collections (`List.of()`, `Collections.emptyList()`) or empty optionals.

## Module Design

**Exports:**
- Design system: Centralized barrel export in `frontend/src/design-system/index.ts` allowing clean named imports (`import { Button, Card, Input } from '../design-system'`).
- Services and utilities: Named exports for functions and types (`export function apiRequest...`, `export type PlatformStatus...`).

---

*Convention analysis: 2026-11-10*
