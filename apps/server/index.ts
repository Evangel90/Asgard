import "dotenv/config";
import express from "express";
import cors from "cors";

import staffRoutes from "./src/routes/staff.routes.js";
import payrollRoutes from "./src/routes/payroll.routes.js";
import invoiceRoutes from "./src/routes/invoice.routes.js";
import { prisma } from "./src/lib/prisma.js";

const app = express();
const PORT = process.env.PORT ?? 3000;

// ── Middleware ─────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ─────────────────────────────────────
app.use("/api/staff", staffRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/invoices", invoiceRoutes);

// ── Health check ────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", network: process.env.STELLAR_NETWORK ?? "TESTNET" });
});

// ── Graceful shutdown ───────────────────────────
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🚀 Asgard server running on http://localhost:${PORT}`);
  console.log(`🌌 Stellar network: ${process.env.STELLAR_NETWORK ?? "TESTNET"}`);
});