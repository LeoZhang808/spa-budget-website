# Expense/Budgeting SPA

A personal finance single-page application for tracking income, expenses, and monthly budgets with a visual dashboard.

## Tech Stack

- **Frontend**: React 19 + Vite + TypeScript, Recharts for charts
- **Backend**: Node.js + Express 5 + TypeScript, Prisma ORM
- **Database**: MySQL 8.0
- **Auth**: JWT with httpOnly cookies
- **Infrastructure**: Docker Compose for local dev

## Project Structure

```
spa-budget-website/
  frontend/          # React SPA
  backend/           # Express API
  docker-compose.yml # Local dev orchestration
  .env.example       # Environment variable template
```

## Quick Start with Docker Compose

```bash
# Clone and navigate to the project
cd spa-budget-website

# Start all services (MySQL, backend, frontend)
docker-compose up --build
```

Services will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000/api/v1
- **Database**: localhost:3306

## Quick Start without Docker

### Prerequisites

- Node.js 20+
- MySQL 8.0 running locally

### 1. Database Setup

Create a MySQL database named `budget_app` and a user with access.

### 2. Backend

```bash
cd backend
npm install
cp .env .env  # Edit DATABASE_URL to point to your local MySQL
npx prisma migrate dev
npm run dev
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

See `.env.example` at the repo root for all required variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Backend port | `4000` |
| `DATABASE_URL` | MySQL connection string | — |
| `JWT_SECRET` | Secret for JWT signing | — |
| `REFRESH_TOKEN_SECRET` | Secret for refresh tokens | — |
| `CORS_ORIGIN` | Allowed frontend origin | `http://localhost:5173` |
| `VITE_API_BASE_URL` | Frontend API base URL | `http://localhost:4000/api/v1` |

## API Endpoints

All endpoints are prefixed with `/api/v1`.

### Auth
- `POST /auth/register` — Register new user
- `POST /auth/login` — Log in
- `POST /auth/logout` — Log out (auth required)
- `GET /auth/me` — Get current user (auth required)
- `PATCH /auth/me` — Update profile (auth required)

### Categories (auth required)
- `GET /categories` — List categories
- `POST /categories` — Create category
- `PATCH /categories/:id` — Update category
- `DELETE /categories/:id` — Delete category

### Transactions (auth required)
- `GET /transactions` — List transactions (with filter, search, pagination, sort)
- `POST /transactions` — Create transaction
- `GET /transactions/:id` — Get transaction
- `PATCH /transactions/:id` — Update transaction
- `DELETE /transactions/:id` — Delete transaction

### Budgets (auth required)
- `GET /budgets` — List budgets (optional `?month=YYYY-MM`)
- `POST /budgets` — Create budget
- `PATCH /budgets/:id` — Update budget
- `DELETE /budgets/:id` — Delete budget

### Dashboard (auth required)
- `GET /dashboard/summary?month=YYYY-MM` — Monthly summary
- `GET /dashboard/analytics?from=YYYY-MM&to=YYYY-MM` — Spending trends and category breakdown

### Health
- `GET /health` — Health check
- `GET /health/ready` — Readiness check (includes DB ping)

## Features

1. **User Authentication** — Register, login, logout with JWT cookies
2. **Expense & Income Tracking** — Full CRUD for transactions
3. **Category Management** — Default and custom categories per user
4. **Monthly Budgets** — Set budgets per category per month
5. **Dashboard** — Summary cards, per-category spending vs budget, trend charts, pie charts
6. **Filtering & Search** — Filter transactions by date, category, type; search by note; pagination and sorting

## Verification Flow

1. Open http://localhost:5173
2. Register a new account
3. Log in and reach the dashboard
4. Create a category and set a budget for the current month
5. Add an expense transaction in that category
6. Confirm the dashboard shows correct spent vs budget values
