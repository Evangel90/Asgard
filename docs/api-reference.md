# 🔌 API Reference

Base URL: `http://localhost:3000` 

### Staff Management
*   `GET /api/staff?businessId=...` - List all staff members.
*   `POST /api/staff` - Add a new staff member.
*   `DELETE /api/staff/:id` - Remove a staff member.

### Payroll Operations
*   `GET /api/payroll/balances?publicKey=...` - Fetch Stellar account balances.
*   `POST /api/payroll/build-transaction` - Create an unsigned Path Payment XDR.
*   `POST /api/payroll/submit` - Submit a signed XDR to the network.

### Invoices
*   `GET /api/invoices?businessId=...` - Fetch all invoices.
*   `POST /api/invoices` - Create a new invoice request.
*   `PATCH /api/invoices/:id` - Update status or link tx hashes.

### Health Check
*   `GET /health` - Returns the server status and network info.
