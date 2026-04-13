# 🌌 Stellar Integration

Asgard uses three core Stellar primitives to power business operations.

### 1. Treasury Balance Fetch
Uses the Horizon API to load all asset balances for a specific public key. Native XLM is converted to a standard format alongside issued assets like USDC.

### 2. Path Payment Builder
The engine of our global payroll.
1. The business starts with USDC.
2. The Stellar DEX finds the best conversion path.
3. The destination (often an Anchor) receives the local fiat-backed token (e.g. NGN, BRL).

**Flow:**
`Server Creates XDR` -> `Client signs via Freighter` -> `Server submits to Horizon`.

### 3. Smart Contracts (Soroban)
Optional milestone-based escrow. When an invoice is created, a Soroban contract can be deployed to hold funds until specific conditions are met, ensuring trust between businesses and contractors.

### 4. Tokenized Inventory
Inventory items are issued as Stellar assets. This allows for real-time tracking of stock on a distributed ledger, providing transparency and immutability.
