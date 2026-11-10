# Testing Patterns

**Analysis Date:** 2026-11-10

## Test Framework

**Backend:**
- Runner: JUnit 5 (Jupiter) with Spring Boot Test runner (`@SpringBootTest`)
- Assertion Library: JUnit 5 Assertions (`assertEquals`, `assertTrue`, `assertNotNull`, `assertNotEquals`)
- Mocking & Slices: Spring MVC test support (`@AutoConfigureMockMvc`, `MockMvc`, `MockMvcRequestBuilders`)
- In-Memory Database: H2 in-memory engine configured under `test` profile (`backend/src/test/resources/application-test.yml`)

**Frontend:**
- Runner: Vitest 5.0.5 (`vitest`)
- DOM Environment: `jsdom` 30.1.3 configured in `frontend/vite.config.ts`
- Assertion Library: Vitest `expect` augmented with `@testing-library/jest-dom/vitest` matchers (`toBeInTheDocument`, `toBeDisabled`, etc.)
- User Interaction: `@testing-library/user-event` 14.6.8 and `@testing-library/react` 16.3.3

**Run Commands:**

Backend (from `backend/` or root):
```bash
# Backend verification
mvn -f backend/pom.xml -B -Dmaven.compiler.release=17 verify
# Or run single test class
mvn -f backend/pom.xml test -Dtest=EquitySharesArchitectureTest
```

Frontend (from `frontend/` or root):
```bash
# Run all frontend tests once
npm --prefix frontend test -- --run

# Watch mode during development
npm --prefix frontend test

# Code quality and typecheck
npm --prefix frontend run lint
npm --prefix frontend run typecheck
```

## Test File Organization

**Location:**
- Backend: Placed in parallel package hierarchy under `backend/src/test/java/com/startupinvestment/platform/`
- Frontend: Co-located next to the component or page under test (e.g. `frontend/src/pages/LoginPage.test.tsx`, `frontend/src/design-system/components.test.tsx`, `frontend/src/App.test.tsx`)

**Naming:**
- Backend: `*Test.java` (e.g., `EquitySharesArchitectureTest.java`, `FundraisingWorkflowControllerTest.java`)
- Frontend: `*.test.tsx` for React components or `*.test.ts` for pure utilities (e.g., `formatters.test.ts`, `validators.test.ts`)

## Test Structure

**Backend Integration Suite Pattern:**
```java
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class FundraisingWorkflowControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AuthUserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    @DisplayName("Verify end-to-end fundraising round creation and investor commitment")
    void testFundraisingFlow() throws Exception {
        // 1. Arrange: Create session, seed startup, publish profile
        MockHttpSession startupSession = register("founder@example.com", "password-123", "STARTUP");
        MockHttpSession adminSession = login(adminEmail, "admin-password");

        // 2. Act: Open round and post commitment with CSRF token
        mockMvc.perform(post("/api/v1/investor/fundraising/pools/1/commit")
                .session(investorSession)
                .header(CsrfService.HEADER_NAME, csrfToken(investorSession))
                .contentType("application/json")
                .content("{\"amount\": 10000}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.sharesAllocated").value(1000));
    }
}
```

**Frontend Component Suite Pattern:**
```typescript
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import FoundationPage from './pages/FoundationPage'

afterEach(() => {
  cleanup()
})

describe('FoundationPage', () => {
  it('renders the landing page hero and calls to action', () => {
    render(
      <MemoryRouter>
        <FoundationPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })
})
```

## Mocking

**Framework:**
- Backend: MockMvc mocks the servlet container, while repository and service layers execute against the real in-memory H2 database.
- Frontend: `vi.fn()` from Vitest for event callbacks and mocking `window.fetch` or API client functions where needed.

**What to Mock:**
- HTTP responses in isolated frontend component tests.
- External timers or animation frames if required.

**What NOT to Mock:**
- Business logic calculations (share allocations, dilution formulas, validator regexes).
- In-memory database persistence in backend integration tests.

## Fixtures and Factories

**Backend Helpers:**
- Helper registration and login methods inside test classes (`register()`, `login()`, `createAndPublishStartup()`, `csrfToken()`) create realistic session state.
- Unique UUID-based test emails (`"alpha-" + UUID.randomUUID() + "@example.com"`) prevent collision across parallel tests.

**Frontend Setup:**
- `frontend/src/test/setup.ts` initializes `@testing-library/jest-dom` extensions globally.

## Coverage

**Requirements:**
- High coverage on core financial and security mechanisms:
  - CSRF protection and role permission enforcement.
  - Startup review state machine (`DRAFT` -> `SUBMITTED` -> `APPROVED` / `REJECTED`).
  - Company share capitalization balance equations (`authorized >= issued + reserved`).
  - Round share pricing and rejection of fractional share purchases (`amount % pricePerShare == 0`).
  - Portfolio valuation snapshots and unrealized gain math.

## Test Types

**Integration Tests (Backend):**
- Exercise full HTTP request -> Filter -> Controller -> Service -> SQL -> H2 path.
- Validate status codes, response JSON bodies, and database state.

**Component & Unit Tests (Frontend):**
- Validate user inputs, form submissions, accessibility roles, button states, and error banner rendering.

**Architecture Tests:**
- Specific multi-requirement regression suites such as `EquitySharesArchitectureTest.java` verifying 10 distinct architectural properties (Requirements A through J).

---

*Testing analysis: 2026-11-10*
