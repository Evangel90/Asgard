import * as StellarSdk from "@stellar/stellar-sdk";

const STELLAR_NETWORK = process.env.STELLAR_NETWORK ?? "TESTNET";

const server = new StellarSdk.Horizon.Server(
  STELLAR_NETWORK === "PUBLIC"
    ? "https://horizon.stellar.org"
    : "https://horizon-testnet.stellar.org"
);

const networkPassphrase =
  STELLAR_NETWORK === "PUBLIC"
    ? StellarSdk.Networks.PUBLIC
    : StellarSdk.Networks.TESTNET;

// ─────────────────────────────────────────────
// getAccountBalance
// Fetches all balances for a given Stellar public key.
// Returns an array of { assetCode, balance } objects.
// ─────────────────────────────────────────────
export async function getAccountBalances(publicKey: string) {
  const account = await server.loadAccount(publicKey);
  return account.balances.map((b) => ({
    assetCode: b.asset_type === "native" ? "XLM" : (b as any).asset_code,
    balance: b.balance,
  }));
}

// ─────────────────────────────────────────────
// buildPathPayment
// Creates a Stellar Path Payment Strict Send transaction.
// This is the core of the global payroll feature:
//   - The business sends USDC
//   - The Stellar DEX converts it
//   - The employee receives local fiat (via an Anchor)
//
// Parameters:
//   sourcePublicKey  — Business wallet (signs the tx off-chain via Freighter)
//   destinationId    — Anchor's receiving account (for SEP-31 remittance)
//   sendAssetCode    — Asset being sent, e.g. "USDC"
//   sendAssetIssuer  — The USDC issuer address on Stellar
//   sendAmount       — Amount of source asset to send (e.g. "100")
//   destAssetCode    — Destination asset code (e.g. "NGN" or the Anchor's token)
//   destAssetIssuer  — Destination asset issuer
//   destMinAmount    — Minimum destination amount to accept (slippage protection)
// ─────────────────────────────────────────────
export async function buildPathPaymentTransaction({
  sourcePublicKey,
  destinationId,
  sendAssetCode,
  sendAssetIssuer,
  sendAmount,
  destAssetCode,
  destAssetIssuer,
  destMinAmount,
}: {
  sourcePublicKey: string;
  destinationId: string;
  sendAssetCode: string;
  sendAssetIssuer: string;
  sendAmount: string;
  destAssetCode: string;
  destAssetIssuer: string;
  destMinAmount: string;
}) {
  const sourceAccount = await server.loadAccount(sourcePublicKey);

  const sendAsset =
    sendAssetCode === "XLM"
      ? StellarSdk.Asset.native()
      : new StellarSdk.Asset(sendAssetCode, sendAssetIssuer);

  const destAsset =
    destAssetCode === "XLM"
      ? StellarSdk.Asset.native()
      : new StellarSdk.Asset(destAssetCode, destAssetIssuer);

  const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase,
  })
    .addOperation(
      StellarSdk.Operation.pathPaymentStrictSend({
        sendAsset,
        sendAmount,
        destination: destinationId,
        destAsset,
        destMin: destMinAmount,
        path: [], // Stellar DEX will find the best path automatically
      })
    )
    .setTimeout(30)
    .build();

  // Return the unsigned XDR so Freighter (frontend) can sign it
  return transaction.toXDR();
}

// ─────────────────────────────────────────────
// submitSignedTransaction
// Takes a signed XDR string from the frontend (Freighter)
// and submits it to the Stellar network.
// ─────────────────────────────────────────────
export async function submitSignedTransaction(signedXdr: string) {
  const transaction = StellarSdk.TransactionBuilder.fromXDR(
    signedXdr,
    networkPassphrase
  );
  const result = await server.submitTransaction(transaction as StellarSdk.Transaction);
  return result;
}
