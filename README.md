# SecureBank UI

React frontend for the SecureBank microservices application.

## Setup

```bash
npm install
npm start
```

Opens at http://localhost:3000

## Prerequisites
All backend services must be running:
- Discovery Server: http://localhost:8761
- Account Identity Service: http://localhost:8091
- Transaction Service: http://localhost:8092
- Audit Service: http://localhost:8093
- API Gateway: http://localhost:8090  ← UI talks to this

## Portals

| Portal | URL | Credentials |
|--------|-----|-------------|
| Customer | /login | Customer ID + password |
| Admin | /admin/login | ADMIN001 / Admin@1234 |
| Compliance | /compliance/login | Officer ID (from email) + password |

## Pages

### Customer
- `/` — Landing page
- `/register` — Open account (2-step: fill form → verify OTP)
- `/login` — Customer sign in
- `/dashboard` — Balance overview, quick actions, recent transactions
- `/accounts` — Manage accounts, add account, set PIN
- `/deposit` — Deposit funds
- `/withdraw` — Withdraw (with fee calculator)
- `/transfer` — Transfer to another account (with fee calculator)
- `/history` — Paginated transaction history
- `/audit` — Date-range audit with credit/debit summary
- `/profile` — View personal details and accounts

### Admin
- `/admin/login` — Admin sign in
- `/admin/dashboard` — System overview, pending approvals
- `/admin/officers` — Approve/reject/suspend compliance officers
- `/admin/users` — View all customers, lock/unlock, freeze/unfreeze
- `/admin/audit` — Search transactions by account or customer

### Compliance Officer
- `/compliance/register` — Apply as compliance officer
- `/compliance/login` — Officer sign in
- `/compliance/dashboard` — Overview
- `/compliance/users` — Manage users (lock/unlock, freeze/unfreeze)
- `/compliance/audit` — Search transactions by account or customer
