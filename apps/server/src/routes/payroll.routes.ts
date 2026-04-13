import { Router, type Request, type Response } from "express";
import { prisma } from "../lib/prisma.js";
import { buildPathPaymentTransaction, submitSignedTransaction, getAccountBalances } from "../services/stellar.service.js";

const router = Router();

// GET /api/payroll/balances?publicKey=G...
// Returns all asset balances for a Stellar account (the business treasury)
router.get("/balances", async (req: Request, res: Response) => {
  const { publicKey } = req.query;
  if (!publicKey) {
    res.status(400).json({ error: "publicKey query param is required" });
    return;
  }
  try {
    const balances = await getAccountBalances(publicKey as string);
    res.json(balances);
  } catch (err) {
    res.status(404).json({ error: "Stellar account not found" });
  }
});

// POST /api/payroll/build-transaction
// Given a payroll entry, builds an unsigned Stellar Path Payment XDR.
// The frontend (Freighter) will sign and return it via /submit.
router.post("/build-transaction", async (req: Request, res: Response) => {
  const {
    sourcePublicKey,
    destinationId,
    sendAssetCode,
    sendAssetIssuer,
    sendAmount,
    destAssetCode,
    destAssetIssuer,
    destMinAmount,
  } = req.body;

  if (!sourcePublicKey || !destinationId || !sendAmount) {
    res.status(400).json({ error: "sourcePublicKey, destinationId, and sendAmount are required" });
    return;
  }

  try {
    const xdr = await buildPathPaymentTransaction({
      sourcePublicKey,
      destinationId,
      sendAssetCode: sendAssetCode ?? "USDC",
      sendAssetIssuer,
      sendAmount,
      destAssetCode: destAssetCode ?? "XLM",
      destAssetIssuer,
      destMinAmount: destMinAmount ?? "1",
    });
    res.json({ xdr });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

// POST /api/payroll/submit
// Submits a signed XDR transaction to Stellar and records the txHash in the DB.
router.post("/submit", async (req: Request, res: Response) => {
  const { signedXdr, payrollEntryId } = req.body;

  if (!signedXdr || !payrollEntryId) {
    res.status(400).json({ error: "signedXdr and payrollEntryId are required" });
    return;
  }

  try {
    const result = await submitSignedTransaction(signedXdr);
    const txHash = result.hash;

    // Record the on-chain proof in the database
    const entry = await prisma.payrollEntry.update({
      where: { id: payrollEntryId },
      data: { txHash, status: "COMPLETED" },
    });

    res.json({ txHash, entry });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

export default router;
