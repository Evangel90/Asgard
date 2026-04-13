<div align="center">

<h1>🌈 Asgard</h1>

<p><strong>An open-source business operating system for global payroll, smart invoicing, and tokenized inventory — powered by the Stellar network.</strong></p>

<p>
  <a href="https://github.com/your-username/asgard/blob/master/LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-blueviolet.svg"/></a>
  <a href="https://stellar.org"><img alt="Powered by Stellar" src="https://img.shields.io/badge/Powered%20by-Stellar-6366f1.svg"/></a>
  <img alt="Runtime: Bun" src="https://img.shields.io/badge/Runtime-Bun-f9f1e1.svg"/>
  <img alt="Stack: React + Vite" src="https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61dafb.svg"/>
  <img alt="DB: PostgreSQL" src="https://img.shields.io/badge/Database-PostgreSQL-336791.svg"/>
  <img alt="ORM: Prisma" src="https://img.shields.io/badge/ORM-Prisma-0c344b.svg"/>
  <img alt="Containerized" src="https://img.shields.io/badge/Containerized-Docker-2496ed.svg"/>
</p>

</div>

---

Asgard is a **"business-in-a-box"** platform designed for global startups and crypto-native companies. It abstracts the complexity of the Stellar blockchain into a professional, self-hosted dashboard that lets businesses:

- 💸 **Run global payroll** in USDC with automatic fiat conversion via Stellar Path Payments and SEP-31 Anchor protocols.
- 📄 **Issue smart invoices** with optional milestone-based Soroban escrow contracts.
- 📦 **Track inventory** as tokenized assets issued directly on the Stellar Ledger.

No third-party payroll processor, no forex broker, no lock-in. Just a Stellar wallet, Docker, and this repo.

---

## Table of Contents

1. [Architecture Overview](#-architecture-overview)
2. [Project Structure](#-project-structure)
3. [Tech Stack](#-tech-stack)
4. [Data Model](#-data-model)
5. [API Reference](#-api-reference)
6. [Stellar Integration](#-stellar-integration)
7. [Getting Started (One-Command Setup)](#-getting-started-one-command-setup)
8. [Environment Variables](#-environment-variables)
9. [Development Workflow](#-development-workflow)
10. [Roadmap](#-roadmap-stellar-drips-wave)
11. [How to Contribute](#-how-to-contribute)

---

## 🏛 Architecture Overview

Asgard is **fully containerized**. Docker Compose orchestrates the entire stack, ensuring a consistent development environment for all contributors — no local installation of Bun or PostgreSQL required.

```
┌─────────────────────────────────────────────────────────────┐
│                      Docker Compose                         │
│                                                             │
│  ┌──────────────┐     ┌──────────────┐    ┌─────────────┐  │
│  │   Frontend   │────▶│   Backend    │───▶│  PostgreSQL │  │
│  │  React/Vite  │     │ Express/Bun  │    │  (asgard_db)│  │
│  │  :5173       │     │  :3000       │    │  :5432      │  │
│  └──────────────┘     └──────┬───────┘    └─────────────┘  │
│                              │                              │
│                              ▼                              │
│                    ┌──────────────────┐                     │
│                    │  Stellar Network │                     │
│                    │  (Horizon API)   │                     │
│                    └──────────────────┘                     │
└─────────────────────────────────────────────────────────────┘
```

| Layer | Technology | Port |
|---|---|---|
| **Frontend** | React 19 + Vite 8 + Tailwind CSS v4 | `5173` |
| **Backend** | Express 5 + Bun + TypeScript | `3000` |
| **Database** | PostgreSQL 15 (Docker volume) | `5432` |
| **DB Admin** | Prisma Studio | `5555` |

**Key design decisions:**
- The backend builds **unsigned Stellar XDR transactions** and returns them to the frontend. The user's **Freighter wallet** signs them client-side — the server never handles private keys.
- Prisma stores an on-chain `txHash` for every payroll entry and invoice payment, providing an immutable audit trail.
- Service-to-service communication inside Docker uses Docker's internal DNS (e.g., the backend reaches the database at `db:5432`, never `localhost`).

---

## 📁 Project Structure

```
asgard/
├── docker-compose.yml          # Orchestrates all services
├── package.json                # Root workspace config
├── tsconfig.json               # Root TypeScript config
│
└── apps/
    ├── client/                 # React + Vite frontend
    │   ├── src/
    │   │   ├── components/     # UI components (Shadcn UI + custom)
    │   │   ├── lib/            # Utility helpers (clsx, Freighter API)
    │   │   ├── App.tsx         # Root app component and routing
    │   │   └── main.tsx        # React entry point
    │   ├── index.html          # Vite HTML shell
    │   ├── vite.config.ts
    │   ├── components.json     # Shadcn UI config
    │   └── .env.example        # Required client env vars
    │
    └── server/                 # Express + Bun backend
        ├── index.ts            # Server entry point; registers all routes
        ├── prisma.config.ts    # Prisma client configuration
        ├── prisma/
        │   └── schema.prisma   # Full database schema (5 models)
        ├── src/
        │   ├── lib/
        │   │   └── prisma.ts   # Singleton Prisma client
        │   ├── routes/
        │   │   ├── staff.routes.ts    # Staff CRUD endpoints
        │   │   ├── payroll.routes.ts  # Stellar payroll + treasury endpoints
        │   │   └── invoice.routes.ts  # Invoice lifecycle endpoints
        │   └── services/
        │       └── stellar.service.ts # Stellar SDK: balances, Path Payments, XDR submission
        └── .env.example        # Required server env vars
```

---

## 🛠 Tech Stack

### Frontend (`apps/client`)

| Package | Version | Purpose |
|---|---|---|
| `react` | `^19.2.4` | UI framework |
| `vite` | `^8.0.4` | Build tool & dev server |
| `tailwindcss` | `^4.2.2` | Utility-first CSS (v4) |
| `shadcn` | `^4.2.0` | Accessible component library |
| `@base-ui/react` | `^1.4.0` | Headless UI primitives |
| `@stellar/freighter-api` | `^6.0.1` | Stellar wallet connection (browser extension) |
| `lucide-react` | `^1.8.0` | Icon set |
| `@fontsource-variable/geist` | `^5.2.8` | Geist variable font |
| `clsx` + `tailwind-merge` | latest | Conditional className utilities |

### Backend (`apps/server`)

| Package | Version | Purpose |
|---|---|---|
| `express` | `^5.2.1` | HTTP server framework |
| `@stellar/stellar-sdk` | `^15.0.1` | Stellar Horizon & Soroban SDK |
| `@prisma/client` | `^7.7.0` | Type-safe database ORM |
| `dotenv` | `^17.4.2` | Environment variable loading |
| `cors` | `^2.8.6` | Cross-origin request handling |
| `typescript` | `~6.0.2` | Static typing |

### Infrastructure

| Tool | Purpose |
|---|---|
| **Docker & Docker Compose** | Full stack containerization |
| **Bun** | JavaScript runtime (inside containers) |
| **PostgreSQL 15** | Relational database |
| **Prisma** | Schema management & migrations |

---

## 🗄 Data Model

The Prisma schema (`apps/server/prisma/schema.prisma`) defines **5 core models**:

### `Business`
The top-level entity. Each business owner registers once and manages all staff, invoices, payroll runs, and inventory items under their account.

| Field | Type | Notes |
|---|---|---|
| `id` | `String` (cuid) | Primary key |
| `name` | `String` | Business display name |
| `email` | `String` (unique) | Owner email |
| `stellarPublicKey` | `String?` (unique) | Treasury wallet public key |

### `Staff`
Employees or contractors. Stores their preferred receive currency and banking details for the SEP-31 remittance flow.

| Field | Type | Notes |
|---|---|---|
| `receiveCurrency` | `String` | ISO 4217 code — e.g. `NGN`, `BRL`, `USD` |
| `monthlySalaryUsd` | `Decimal(18,6)` | Gross salary denominated in USD |
| `bankAccountNumber` | `String?` | For Anchor off-ramp payouts |
| `status` | `StaffStatus` | `ACTIVE` / `INACTIVE` / `SUSPENDED` |

### `PayrollRun`
A single payroll cycle triggered by the business owner. Aggregates status and total amount disbursed.

```
RunStatus: PENDING → PROCESSING → COMPLETED | FAILED
```

### `PayrollEntry`
One row per staff member per payroll run. Stores the **Stellar `txHash`** as the on-chain proof of payment.

| Field | Type | Notes |
|---|---|---|
| `amountUsd` | `Decimal(18,6)` | Amount sent from the business |
| `amountLocal` | `Decimal(18,6)?` | Amount received after FX conversion |
| `txHash` | `String?` (unique) | Stellar Horizon transaction ID |

### `Invoice`
A programmable payment request. Can optionally be locked to a **Soroban smart contract** for milestone-based escrow.

| Field | Type | Notes |
|---|---|---|
| `amountUsd` | `Decimal(18,6)` | Invoice amount |
| `currency` | `String` | Default: `USDC` |
| `sorobanContractId` | `String?` | ID of escrow contract (if applicable) |
| `txHash` | `String?` | Stellar tx hash on settlement |
| `status` | `InvoiceStatus` | `DRAFT` → `SENT` → `PAID` \| `OVERDUE` \| `CANCELLED` |

### `InventoryItem`
A physical stock item tokenized as an issued asset on the Stellar Ledger.

| Field | Type | Notes |
|---|---|---|
| `assetCode` | `String?` | Stellar asset code (e.g. `WIDG`) |
| `assetIssuer` | `String?` | Stellar issuer account for this asset |
| `unitCostUsd` | `Decimal(18,6)` | Cost basis per unit |

---

## 🔌 API Reference

Base URL: `http://localhost:3000`

### Health

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Returns `{ status: "ok", network: "TESTNET" }` |

### Staff — `/api/staff`

| Method | Endpoint | Body / Params | Description |
|---|---|---|---|
| `GET` | `/api/staff?businessId=` | `businessId` (query) | List all staff for a business |
| `POST` | `/api/staff` | `{ businessId, fullName, email, monthlySalaryUsd, receiveCurrency?, bankAccountNumber?, bankName? }` | Create a staff member |
| `DELETE` | `/api/staff/:id` | — | Remove a staff member |

### Payroll — `/api/payroll`

| Method | Endpoint | Body / Params | Description |
|---|---|---|---|
| `GET` | `/api/payroll/balances?publicKey=` | `publicKey` (query) | Fetch all asset balances for a Stellar account (treasury view) |
| `POST` | `/api/payroll/build-transaction` | See below | Build an unsigned Path Payment XDR for Freighter to sign |
| `POST` | `/api/payroll/submit` | `{ signedXdr, payrollEntryId }` | Submit signed XDR to Stellar and record `txHash` |

**`build-transaction` body:**
```json
{
  "sourcePublicKey": "G...",
  "destinationId": "G...",
  "sendAssetCode": "USDC",
  "sendAssetIssuer": "GA5...",
  "sendAmount": "100",
  "destAssetCode": "NGN",
  "destAssetIssuer": "G...",
  "destMinAmount": "150000"
}
```

### Invoices — `/api/invoices`

| Method | Endpoint | Body / Params | Description |
|---|---|---|---|
| `GET` | `/api/invoices?businessId=` | `businessId` (query) | List invoices ordered newest-first |
| `POST` | `/api/invoices` | `{ businessId, title, clientName, clientEmail, amountUsd, description?, dueDate? }` | Create a new invoice |
| `PATCH` | `/api/invoices/:id` | `{ status?, txHash?, sorobanContractId? }` | Update invoice status / link on-chain data |

---

## 🌌 Stellar Integration

The Stellar service (`apps/server/src/services/stellar.service.ts`) uses the `@stellar/stellar-sdk` v15 to implement three core primitives that power all blockchain interactions.

### 1. Treasury Balance Fetch — `getAccountBalances(publicKey)`
Connects to the Stellar Horizon server and loads all asset balances for a given account. Returns:
```ts
Array<{ assetCode: string; balance: string }>
```
Native XLM is labeled `"XLM"`. Issued assets (e.g. USDC) return their asset code directly.

### 2. Path Payment Builder — `buildPathPaymentTransaction({...})`
Constructs a **Path Payment Strict Send** operation. This is the engine of the global payroll feature:
1. The business sends USDC from their treasury.
2. The Stellar DEX automatically finds the best conversion path.
3. The employee's designated Anchor account receives the local currency (NGN, BRL, etc.).

The server returns an **unsigned XDR string**. The private key never touches the server — the frontend Freighter extension signs it and sends it back via `/api/payroll/submit`.

### 3. Signed Transaction Submission — `submitSignedTransaction(signedXdr)`
Accepts a signed XDR from Freighter, reconstructs the transaction object, and submits it to Horizon. Returns the full Horizon submission result, including the `hash` used as the audit-trail `txHash` in the database.

> **Network:** The Asgard server auto-selects between `horizon-testnet.stellar.org` and `horizon.stellar.org` based on the `STELLAR_NETWORK` environment variable.

---

## 🚦 Getting Started (One-Command Setup)

> **Prerequisite:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) — that's it.

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/asgard.git
cd asgard
```

### 2. Configure Environment Variables

Copy the example env files for both apps:

```bash
# Server
cp apps/server/.env.example apps/server/.env

# Client
cp apps/client/.env.example apps/client/.env
```

The defaults work out-of-the-box for local Docker development. See [Environment Variables](#-environment-variables) for details.

### 3. Launch the Full Stack

```bash
docker compose up --build
```

This single command:
- Builds the Bun Docker images for both the frontend and backend.
- Installs all npm/bun dependencies inside the containers.
- Starts the PostgreSQL 15 database with a persistent volume.
- Starts the Express API on port `3000`.
- Starts the Vite dev server on port `5173`.

| Service | URL |
|---|---|
| **Frontend** | http://localhost:5173 |
| **Backend** | http://localhost:3000 |
| **Health Check** | http://localhost:3000/health |

### 4. Initialize the Database *(First-time only)*

While the containers are running, open a **new terminal** and apply the Prisma migration:

```bash
docker compose exec server bunx prisma migrate dev --name init
```

This generates the full schema (Business, Staff, PayrollRun, PayrollEntry, Invoice, InventoryItem) in the running PostgreSQL container.

---

## ⚙️ Environment Variables

### Server (`apps/server/.env`)

```env
# PostgreSQL connection string — matches the Docker Compose service
DATABASE_URL="postgresql://admin:password123@localhost:5432/asgard_db?schema=public"

# Port for the Express HTTP server
PORT=3000

# Stellar network: TESTNET (default) or PUBLIC (mainnet)
STELLAR_NETWORK="TESTNET"

# Optional: Soroban RPC + server-side signing key (for automated flows)
# SOROBAN_RPC_URL="https://soroban-testnet.stellar.org:443"
# SERVER_SECRET_KEY="S..."
```

### Client (`apps/client/.env`)

```env
# URL of the Asgard backend (exposed from Docker)
VITE_API_URL="http://localhost:3000"

# Stellar network — should match the server config
VITE_STELLAR_NETWORK="TESTNET"

# Optional: Soroban smart contract ID for invoice escrow
# VITE_INVOICE_CONTRACT_ID="C..."
```

> ⚠️ **Never commit `.env` files.** Both are listed in their respective `.gitignore` files.

---

## 🛠 Development Workflow

All development commands are run via `docker compose exec` — no local Bun or Node installation needed.

### Adding a dependency to the frontend

```bash
docker compose exec client bun add <package-name>
```

### Adding a dependency to the backend

```bash
docker compose exec server bun add <package-name>
```

### Running a Prisma migration after editing the schema

```bash
docker compose exec server bunx prisma migrate dev --name <migration-name>
```

### Regenerating the Prisma client (after schema changes)

```bash
docker compose exec server bunx prisma generate
```

### Opening Prisma Studio (visual database editor)

```bash
docker compose exec server bunx prisma studio
```

Then visit **http://localhost:5555** to browse and edit database records directly.

### Viewing server logs in real time

```bash
docker compose logs -f server
```

### Stopping all services

```bash
docker compose down
```

To also destroy the database volume (full reset):

```bash
docker compose down -v
```

---

## 🗺 Roadmap (Stellar Drips Wave)

### Phase 1: Foundation 🏗️
- [ ] Implement multi-wallet connection (Freighter / WalletConnect).
- [ ] Build **Treasury View** to fetch real-time Stellar account balances via `/api/payroll/balances`.
- [ ] Set up **Business Profile** metadata storage in PostgreSQL.

### Phase 2: Global Remittances 💸
- [ ] Integrate **SEP-31 Anchor protocols** for local currency payouts (NGN, BRL, KES, etc.).
- [ ] Build **Path Payments** logic for automatic USDC-to-fiat conversion (foundation already in `stellar.service.ts`).
- [ ] Create a **bulk-upload CSV processor** for monthly payroll batches.

### Phase 3: Smart Business Logic 🧠
- [ ] *(Contributor Task)* **Soroban Invoicing contracts** with milestone-based escrow — link contract ID to the `Invoice.sorobanContractId` field.
- [ ] *(Contributor Task)* **Tokenized Inventory** assets — issue Stellar assets and bind them to `InventoryItem.assetCode`.
- [ ] **Automated tax withholding** and fee calculation module.

---

## 🤝 How to Contribute

Asgard is an open-source ecosystem project. We prioritize **modularity** so you can contribute to the part of the stack you know best.

### ⚛️ Frontend (React / Bun)
- Build out the `StaffDirectory` and `PayrollExecution` UI components.
- Improve the UX for transaction signing via the **Freighter** browser extension.
- Add data-fetching hooks to the backend's REST API.

### 🟢 Backend (Express / Bun)
- Implement new **Stellar Anchor integrations** for specific global regions (SEP-31).
- Optimize the transaction builder logic in `stellar.service.ts` for multi-sig business accounts.
- Add error handling, request validation middleware, and end-to-end tests.

### 🦀 Smart Contracts (Rust / Soroban)
- Build the core **Invoicing escrow contracts** and **Inventory tokenization contracts** on Soroban.
- Write robust unit tests for Rust contracts (compiled to WASM).
- Help design the contract interface that Asgard's backend will call.

### Getting Started as a Contributor

1. Fork the repository.
2. Follow the [Getting Started](#-getting-started-one-command-setup) guide — the full dev environment runs in Docker.
3. Check the **`good-first-issue`** tag in the [Issues](https://github.com/your-username/asgard/issues) tab.
4. Open a pull request against `master` — all CI checks must pass.

---

## 📄 License

Asgard is released under the [MIT License](./LICENSE).

---

<div align="center">
  <sub>Built on the <a href="https://stellar.org">Stellar Network</a> · Powered by <a href="https://bun.sh">Bun</a> · Deployed with Docker</sub>
</div>
