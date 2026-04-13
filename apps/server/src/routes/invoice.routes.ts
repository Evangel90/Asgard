import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

// GET /api/invoices?businessId=xxx
router.get("/", async (req: Request, res: Response) => {
  const { businessId } = req.query;
  if (!businessId) { res.status(400).json({ error: "businessId is required" }); return; }
  const invoices = await prisma.invoice.findMany({
    where: { businessId: businessId as string },
    orderBy: { createdAt: "desc" },
  });
  res.json(invoices);
});

// POST /api/invoices — create a new invoice
router.post("/", async (req: Request, res: Response) => {
  const { businessId, title, description, clientName, clientEmail, amountUsd, dueDate } = req.body;
  if (!businessId || !title || !clientName || !clientEmail || !amountUsd) {
    res.status(400).json({ error: "businessId, title, clientName, clientEmail, and amountUsd are required" }); return;
  }
  const invoice = await prisma.invoice.create({
    data: { businessId, title, description, clientName, clientEmail, amountUsd, dueDate: dueDate ? new Date(dueDate) : undefined },
  });
  res.status(201).json(invoice);
});

// PATCH /api/invoices/:id — update invoice status
router.patch("/:id", async (req: Request, res: Response) => {
  const { status, txHash, sorobanContractId } = req.body;
  const invoice = await prisma.invoice.update({
    where: { id: req.params.id },
    data: { status, txHash, sorobanContractId },
  });
  res.json(invoice);
});

export default router;
