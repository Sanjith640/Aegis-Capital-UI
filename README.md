# AegisCapital — Transaction Management System UI

React frontend for the AegisCapital microservices banking application.

---

## Setup
```bash
npm install
npm start
```

Opens at http://localhost:3000

---

## Prerequisites

All backend services must be running before starting the UI:

| Service | Port | Description |
|---------|------|-------------|
| Discovery Server | 8761 | Eureka service registry |
| Account Identity Service | 8091 | Auth, accounts, compliance, admin |
| Transaction Service | 8092 | Deposit, withdraw, transfer |
| Audit Service | 8093 | Audit trail and reports |
| API Gateway | **8090** | ← UI talks only to this |

---

## Portals & Credentials

| Portal | URL | Credentials |
|--------|-----|-------------|
| Customer | `/login` | Customer ID (e.g. `CUS000000001`) + password |
| Admin | `/admin/login` | `ADMIN001` / `Admin@1234` |
| Compliance Officer | `/compliance/login` | Officer ID (received via email after approval) + password |

---

## Pages

### Customer Portal

| Page | Route | Description |
|------|-------|-------------|
| Landing | `/` | Home page with portal selector |
| Register | `/register` | Open account — 2 steps: fill form → verify OTP sent to email |
| Login | `/login` | Customer sign in |
| Dashboard | `/dashboard` | Total balance, account cards, quick actions |
| Accounts | `/accounts` | View accounts, add new account, set PIN to activate |
| Withdraw | `/withdraw` | Withdraw funds with live fee calculator (2.5% / 5%) |
| Transfer | `/transfer` | Transfer to any account with live fee calculator |
| Audit | `/audit` | Date-range transaction audit with credit/debit summary |
| Profile | `/profile` | View personal details and account information |

### Admin Portal

| Page | Route | Description |
|------|-------|-------------|
| Login | `/admin/login` | Admin sign in |
| Dashboard | `/admin/dashboard` | System overview, pending officer approvals |
| Officers | `/admin/officers` | Approve, reject, suspend, reactivate compliance officers |
| Users | `/admin/users` | View all customers, lock/unlock users, freeze/unfreeze accounts |
| Deposit | `/admin/deposit` | Deposit funds into any customer account |
| Audit Viewer | `/admin/audit` | Search transactions by account number or customer ID |

### Compliance Officer Portal

| Page | Route | Description |
|------|-------|-------------|
| Apply | `/compliance/register` | Submit application to become a compliance officer |
| Login | `/compliance/login` | Officer sign in (requires approved Officer ID) |
| Dashboard | `/compliance/dashboard` | Overview of users and account stats |
| Users | `/compliance/users` | Lock/unlock users, freeze/unfreeze accounts |
| Deposit | `/compliance/deposit` | Deposit funds into any customer account |
| Audit Viewer | `/compliance/audit` | Search transactions by account number or customer ID |

---

## Key Features

### Customer
- Two-step registration with email OTP verification
- Supports Savings (`SB...`) and Current (`CA...`) account types
- PIN activation required before any transactions
- Withdrawal and transfer fees calculated live before submission
- Transaction receipt shown immediately after success
- Full audit trail with date-range filter and credit/debit summary

### Admin
- Static credentials — no database entry required
- Approve or reject compliance officer applications with one click
- Approved officers receive their Officer ID automatically via email
- View, lock, unlock all customers
- Freeze or unfreeze individual accounts with a reason
- Deposit into any active account on behalf of a customer
- Full audit viewer — search by account number or customer ID

### Compliance Officer
- Self-registration with admin approval workflow
- Officer ID assigned and emailed upon approval
- Same account management powers as admin (freeze, lock, deposit)
- Audit viewer scoped to compliance role

---

## Business Rules

| Rule | Detail |
|------|--------|
| Fee — Withdrawal / Transfer < ₹10,000 | 2.5% of amount |
| Fee — Withdrawal / Transfer ≥ ₹10,000 | 5% of amount |
| Fee — Deposit | None |
| Daily transaction limit | 16 transactions per account per day |
| New recipient transfer cap | ₹1,00,000 maximum for accounts < 24 hours old |
| Accounts per customer | Maximum 2 savings + 2 current |
| Frozen account | Blocks all transactions including deposits |
| PENDING_PIN account | Blocks all transactions until PIN is set |

---

## Project Structure
