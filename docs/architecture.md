# 🏛 Architecture

Asgard is **fully containerized**. Docker Compose orchestrates the entire stack, ensuring a consistent development environment for all contributors — no local installation of Bun or PostgreSQL required.

### High Level Diagram

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

### Components Breakdown

| Layer | Technology | Port |
|---|---|---|
| **Frontend** | React 19 + Vite 8 + Tailwind CSS v4 | `5173` |
| **Backend** | Express 5 + Bun + TypeScript | `3000` |
| **Database** | PostgreSQL 15 (Docker volume) | `5432` |
| **DB Admin** | Prisma Studio | `5555` |

### Key Design Decisions
*   **Security First:** The backend builds **unsigned Stellar XDR transactions** and returns them to the frontend. The user's **Freighter wallet** signs them client-side — the server never handles private keys.
*   **Auditability:** Prisma stores an on-chain `txHash` for every payroll entry and invoice payment, providing an immutable audit trail.
*   **Networking:** Service-to-service communication inside Docker uses Docker's internal DNS (e.g., the backend reaches the database at `db:5432`).
