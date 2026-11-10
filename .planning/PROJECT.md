# Stashh Startup Investment Platform

## What This Is

Stashh is a comprehensive startup investment and fundraising marketplace connecting Founders, Investors, and Platform Administrators. It provides end-to-end deal discovery, startup capitalization and equity modeling, fundraising round management, commitment allocation, and investor portfolio tracking.

## Core Value

Provide a reliable, mathematically rigorous startup investment platform that bridges founders and investors with transparent deal flows, strict capitalization integrity, and role-governed workflows.

## Requirements

### Validated

- ✓ Multi-role authentication (FOUNDER/STARTUP, INVESTOR, ADMIN) with session-bound CSRF protection — existing
- ✓ Startup profile creation, drafting, and multi-stage administrative review lifecycle — existing
- ✓ Capitalization table architecture enforcing mathematical share invariants (authorized, issued, outstanding, reserved, treasury) — existing
- ✓ Fundraising round setup, share price calculations, minimum ticket thresholds, and target tracking — existing
- ✓ Investor commitment workflow with round capacity checks and discrete non-fractional share allocation — existing
- ✓ Investor portfolio summary aggregating holdings, ownership percentages, and valuation snapshot gain/loss simulation — existing
- ✓ Marketplace deal discovery with sector filtering, investor watchlist, private thesis notes, and interest expressions — existing
- ✓ Custom dark-mode design system with CSS tokens, responsive AppShell, and role-scoped navigation — existing
- ✓ Automated testing foundation with JUnit 5/H2 backend tests and Vitest frontend tests — existing

### Active

- [ ] Production-ready session persistence via Spring Session JDBC backed by PostgreSQL
- [ ] In-app notification center for founders and investors (round activations, status reviews, investor interest)
- [ ] Comprehensive administrative audit trail tracking critical state transitions and valuation updates
- [ ] Managed multipart document upload service for pitch decks and cap tables (replacing external URLs)
- [ ] Frontend page-level integration tests for Admin Reviews, Fundraising, and Portfolio views
- [ ] Production security hardening (CSRF refresh interceptor, secure cookie flags, and standardized error responses)

### Out of Scope

- Real-money payment gateway integration (e.g., Stripe/Plaid) — simulated financial commitments and equity ledgers are sufficient for this stage
- Stack migration or frontend rewrite — preserve existing React 19, TypeScript, Spring Boot 4, and custom design system
- Distributed microservices architecture — single modular monolith structure is intentionally maintained

## Context

- **Backend:** Spring Boot 4.1.2 on Java 21 using lightweight Spring JDBC (`JdbcTemplate`) mapped to immutable records and Flyway migrations.
- **Frontend:** React 19.3.1 with TypeScript 5.9.3, Vite 8, and custom CSS design token system (no Tailwind/Bootstrap).
- **Database:** PostgreSQL 18 Alpine run via Docker Compose.
- **Current State:** Core CRUD workflows and financial math are established, but platform operates with in-memory sessions, URL-only document references, and unnotified state transitions.

## Constraints

- **Tech Stack**: Must preserve Java 21, Spring Boot 4, PostgreSQL, React 19, and Vite.
- **Design System**: Must adhere to existing custom CSS tokens and components in `frontend/src/design-system/`.
- **Financial Math**: Strict maintenance of database check constraints on company capitalization and integer share allocations.
- **Infrastructure**: Use Spring Session JDBC over PostgreSQL to avoid mandatory external dependencies such as Redis.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Spring Session JDBC | Persist user sessions across restarts without requiring Redis infrastructure | — Pending |
| In-app notification center | Keep founders and investors updated on round changes and expressions of interest | — Pending |
| Relational Audit Log | Guarantee accountability and regulatory compliance for administrative actions | — Pending |
| Managed File Storage | Support direct pitch deck and cap table file uploads with mime-type validation | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-11-10 after initialization*
