# Bail Reckoner

A basic full-stack prototype for organizing undertrial case information. It uses fictional sample records, local SQLite for development, and PostgreSQL (including Neon) when `DATABASE_URL` is configured. Do not enter real personal or case information.

## Run locally

Install dependencies. On a fresh checkout, copy `.env.example` to `.env`. Leave `DATABASE_URL` unset for SQLite, or set it to a PostgreSQL connection string to use Neon. Never commit a real database URL.

```sh
npm ci
npm run server
```

In a second terminal, run `npm run dev` and open the local URL printed by Vite (usually <http://localhost:5173>). Vite forwards `/api` requests to the backend on port 3001. On first start, the backend applies the configured database migrations and inserts fictional demo records. Case edits persist after restarting the backend.

Node.js 22.13 or later is required. `BAIL_RECKONER_DB` controls the local SQLite file path; setting `DATABASE_URL` selects PostgreSQL. The Vite proxy uses `PORT` by default; `API_PROXY_TARGET` is an optional override. Docker Compose uses SQLite at `/data/bail-reckoner.sqlite` inside its persistent volume.

## Build and deploy

```sh
npm test
npm run build
```

For Cloudflare Pages + Render + Neon environment variables and build settings, see [deployment notes](docs/deployment.md). Docker Compose is also available for a local demo:

```sh
docker compose up --build -d
```

## Project structure

```text
frontend/                 React app and styles
  src/                    React screens and API client
backend/                  Express API
  src/routes/             HTTP endpoints and request validation
  src/data/               Case repository used by API routes
  src/db/                 SQLite/PostgreSQL connection and migrations
database/                 SQLite and PostgreSQL migrations, demo seed
shared/                   Shared date and checklist definitions
docs/                     Project plan and deployment guide
```

## Current scope

The prototype includes a case dashboard, search, create/edit/detail flows, multiple charges, elapsed custody duration, and a basic editable preparation checklist. It does not provide legal advice, determine bail eligibility, or predict a bail outcome.
