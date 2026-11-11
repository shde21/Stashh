# Stashh — Startup Investment & Equity Fundraising Platform

<div align="center">

  <h3>A modern, mathematically rigorous platform connecting founders, syndicates, and investors.</h3>

  <p align="center">
    <img src="https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java 21" />
    <img src="https://img.shields.io/badge/Spring_Boot-4.1.2-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" alt="Spring Boot" />
    <img src="https://img.shields.io/badge/React-19.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
    <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/PostgreSQL-18-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Vite-6.x-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
    <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License" />
  </p>

</div>

---

## 💡 Overview

**Stashh** is an end-to-end simulated equity investment and fundraising marketplace designed to streamline early-stage capital formation. It provides founders with structured capitalization management and fundraising workflows, while offering investors transparent deal discovery, commitment allocation, and portfolio tracking.

Built with strict mathematical integrity, Stashh ensures accurate share pricing calculations, capitalization constraints, and role-governed access boundaries across the entire investment lifecycle.

---

## ✨ Key Value Pillars

### 🚀 For Founders
- **Profile & Traction Showcase:** Build comprehensive venture profiles featuring verified metrics, pitch materials, and supporting documentation.
- **Round Configuration:** Structure custom fundraising rounds with minimum/maximum commitment tiers, valuation caps, and closing horizons.
- **Capitalization Table Integrity:** Manage authorized, issued, outstanding, and treasury share reserves with database-enforced invariants.
- **Deal Flow & Inquiries:** Review incoming investor expressions of interest directly from a private founder dashboard.

### 💼 For Investors
- **Curated Deal Discovery:** Filter and evaluate vetted, public startups across stages, sectors, and active fundraising rounds.
- **Precision Commitments:** Execute simulated equity allocations with automated share price calculations and round capacity validation.
- **Portfolio Analytics:** Track aggregate deployed capital, active holdings, and illustrative gains derived from official platform valuation snapshots.
- **Watchlists & Private Notes:** Maintain personalized target lists and capture private investment theses for ongoing opportunities.

### 🛡️ For Platform Governance (Admins)
- **Vetting & Compliance Queues:** Review founder applications, provide structured feedback, and approve or reject submissions.
- **Visibility Gates:** Control whether startups are publicly discoverable or restricted to invitation-only review.
- **Valuation Governance:** Record official company valuation snapshots that recalculate portfolio metrics across all active shareholders.

---

## 🔄 How It Works (Dealflow Lifecycle)

```text
  [Founder]                     [Platform Admin]                    [Investor]
     │                                │                                 │
     ├── 1. Submit Profile ──────────>│                                 │
     │      & Cap Table               ├── 2. Review & Approve ─────────>│
     ├── 3. Open Funding Round        │      Public Listing             │
     │      (Set Share Price)         │                                 ├── 4. Discover Startups
     │                                │                                 │      & Submit Commitment
     │<── 5. Allocation Confirmed ────┼─────────────────────────────────┤
     │                                ├── 6. Record Valuation ─────────>│
     │                                │      Snapshot                   └── 7. Real-Time Portfolio
     │                                │                                        Gain / Loss Analytics
```

1. **Onboarding & Underwriting:** Founders submit company disclosures, business models, pitch decks, and capitalization structures. Platform administrators audit the information prior to public approval.
2. **Round Launch:** Founders establish round targets, share pricing, and participation minimums.
3. **Commitment & Allocation:** Investors discover verified opportunities and allocate capital. Allocations enforce strict non-fractional share purchases and capacity limits.
4. **Mark-to-Market Valuation:** Platform administrators log milestone valuation snapshots, updating investor portfolios and calculating unrealized performance metrics in real time.

---

## 🏗️ Architecture & Technology Stack

Stashh employs a decoupled, production-ready client-server architecture built on modern industry standards:

```text
┌────────────────────────────────────────────────────────┐
│               Frontend (SPA) — React 19                │
│  TypeScript • Vite • React Router • Custom Design Sys  │
└───────────────────────────┬────────────────────────────┘
                            │ REST / JSON (Session + CSRF)
                            ▼
┌────────────────────────────────────────────────────────┐
│            Backend Service — Spring Boot 4             │
│   Java 21 • Spring MVC • Spring Security Crypto • JDBC │
└───────────────────────────┬────────────────────────────┘
                            │ Parameterized SQL + Connection Pool
                            ▼
┌────────────────────────────────────────────────────────┐
│              Database — PostgreSQL 18                  │
│       Flyway Schema Migrations • Relational Constraints │
└────────────────────────────────────────────────────────┘
```

### Stack Breakdown

| Layer | Technologies | Key Responsibilities |
| --- | --- | --- |
| **Frontend** | React 19, TypeScript 5.9, Vite | Responsive UI, client-side routing, financial data formatting, design tokens |
| **Backend** | Java 21, Spring Boot 4.1.2 | REST endpoints, authorization, financial math validation, business logic |
| **Persistence** | PostgreSQL 18, Spring JDBC | Relational data integrity, capitalization check constraints, session state |
| **Database Migrations** | Flyway | Version-controlled, idempotent relational schema migrations |
| **Security & Auth** | Spring Security Crypto, BCrypt | HttpOnly session tokens, CSRF protection, role-based boundary enforcement |
| **Containerization** | Docker, Docker Compose | Isolated local development environment and reproducible databases |

---

## ⚡ Quickstart

### Prerequisites
- **Node.js** (v20+ or v24.x) & **npm** (v10+ or v11.x)
- **Java Development Kit (JDK 21+)**
- **Apache Maven (3.8+)**
- **Docker Desktop** (with Docker Compose)

### 1. Clone the Repository
```bash
git clone https://github.com/shde21/startup-investment-platform.git
cd startup-investment-platform
```

### 2. Configure Environment Variables
Copy the sample environment file to create your local `.env`:
```bash
# On Linux / macOS
cp .env.example .env

# On Windows (PowerShell)
Copy-Item .env.example .env
```
> Configure your local environment variables in `.env` as needed. Standard development values are provided by default in `.env.example`.

### 3. Launch Local Database
```bash
docker compose up -d postgres
```

### 4. Run the Backend API
```bash
cd backend
mvn spring-boot:run
```
The API server starts at `http://localhost:8080`.

### 5. Start the Frontend Client
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔮 Future Enhancements & Roadmap

- [ ] **Automated SAFE & Convertible Note Generation:** Templated, dynamic legal document creation (Y Combinator SAFE standard) with integrated e-signature workflows.
- [ ] **Cap Table Waterfall & Scenario Modeling:** Interactive modeling simulating pre/post-money rounds, option pool expansions, liquidation preferences, and dilution impact.
- [ ] **Secondary Market Liquidity Simulation:** Peer-to-peer share transfer requests and secondary liquidity windows for private position exits.
- [ ] **AI-Powered Deal Intelligence:** Machine-learning-assisted pitch deck analysis, automated risk classification, and thesis-driven investor recommendation engine.
- [ ] **Sandbox Banking Rails:** Simulated ACH/wire escrow transfers and ledger event hooks via Plaid / Stripe mock APIs.
- [ ] **Syndicate & SPV Management:** Lead investor pooling and SPV (Special Purpose Vehicle) co-investment structuring.

---

## 🔒 Security, Privacy & Simulation Disclaimer

- **Simulated Environment:** Stashh is a simulated investment and financial modeling platform developed for research, education, and software demonstration purposes. It does not process real fiat currency, hold legal custody of assets, execute securities transactions, or provide investment advisory services.
- **Privacy & Confidentiality:** This public repository contains **no proprietary credentials, real investor PII, production secret keys, or live financial contracts**. All sample configurations utilize sanitized development placeholders.
- **Responsible Disclosure:** If you identify any security vulnerability, please submit a responsible disclosure report via GitHub Security Advisories rather than opening a public issue.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.
