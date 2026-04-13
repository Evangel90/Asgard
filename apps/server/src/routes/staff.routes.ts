import { Router, type Request, type Response } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

// GET /api/staff?businessId=xxx  — list all staff for a business
router.get("/", async (req: Request, res: Response) => {
  const { businessId } = req.query;
  if (!businessId) {
    res.status(400).json({ error: "businessId query param is required" });
    return;
  }
  const staff = await prisma.staff.findMany({
    where: { businessId: businessId as string },
    orderBy: { createdAt: "asc" },
  });
  res.json(staff);
});

// POST /api/staff — create a new staff member
router.post("/", async (req: Request, res: Response) => {
  const { businessId, fullName, email, receiveCurrency, monthlySalaryUsd, bankAccountNumber, bankName } = req.body;

  if (!businessId || !fullName || !email || !monthlySalaryUsd) {
    res.status(400).json({ error: "businessId, fullName, email, and monthlySalaryUsd are required" });
    return;
  }

  const staff = await prisma.staff.create({
    data: { businessId, fullName, email, receiveCurrency, monthlySalaryUsd, bankAccountNumber, bankName },
  });
  res.status(201).json(staff);
});

// DELETE /api/staff/:id — remove a staff member
router.delete("/:id", async (req: Request, res: Response) => {
  await prisma.staff.delete({ where: { id: req.params.id as string } });
  res.status(204).send();
});

export default router;
