# AgroGlobal — SuperApp B2B Agro

A full-featured B2B SuperApp for agribusiness intelligence, built with React, TypeScript, Vite, and Tailwind CSS v4.

## Architecture

The application is organized around **6 main modules**, reflecting the information architecture designed for agro-commercial operations:

| Module | Description |
|---|---|
| **Dashboard de Mercado** | Real-time prices by region, macro indicators (FX, CBOT, B3), weather alerts |
| **Gestão de Risco** | AI hedge recommender, margin simulator, stress-test scenarios (VaR), risk radar |
| **Mesa Digital de Negociação** | Order book, RFQ/auctions, digital contracts with audit trail |
| **Financeiro e Crédito** | Credit/barter offers, digital CPR issuance & tokenization, parametric insurance |
| **Logística Inteligente** | Freight quotes, route optimization, dynamic netback calculator |
| **ESG e Rastreabilidade** | Environmental score, carbon credit marketplace, CAR/IBAMA compliance tracker |

## Tech Stack

- **React 19** + **TypeScript**
- **Vite 8** (build tool)
- **Tailwind CSS v4** (with `@tailwindcss/vite` plugin)
- **Recharts** (data visualization — line, bar, radar charts)
- **Lucide React** (icons)

## Getting Started

### Frontend only (uses mock data, no backend needed)

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Full stack (frontend + backend + database)

```bash
# 1. Install all dependencies (root + server)
npm run setup

# 2. Start PostgreSQL and Redis via Docker
docker compose up postgres redis -d

# 3. Configure backend environment
cp server/.env.example server/.env
# Edit server/.env — set JWT_SECRET and optionally STRIPE_SECRET_KEY

# 4. Create database tables
npm run db:push

# 5. Start everything (frontend on :5173, API on :3001)
npm run dev:all
```

### Available scripts from the root

| Command | Description |
|---|---|
| `npm run dev` | Frontend dev server (port 5173) |
| `npm run server:dev` | Backend dev server (port 3001) |
| `npm run dev:all` | Both in parallel |
| `npm run db:push` | Push Drizzle schema to PostgreSQL |
| `npm run db:migrate` | Run migrations |
| `npm run db:studio` | Open Drizzle Studio (DB GUI) |
| `npm run build` | Build frontend for production |
| `npm run server:build` | Build backend for production |
| `npm run setup` | Install all dependencies (root + server) |

## Build

```bash
npm run build
npm run preview
```

## Design Principles

- **Dark B2B theme** — professional, high-contrast dark UI optimized for decision-making
- **Information hierarchy** — critical data (prices, alerts, recommendations) always above the fold
- **Progressive disclosure** — complexity is hidden behind tabs; users see actionable summaries first
- **Interactive simulations** — sliders and calculators let users explore scenarios before committing
