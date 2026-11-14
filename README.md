# Bail Reckoner

A basic full-stack prototype for organizing undertrial case information. It uses fictional sample records and a local SQLite database. Do not enter real personal or case information.

## Run the app

Install dependencies once, then start both services in separate terminal windows from the repository root:

```sh
npm install
```

Terminal 1 — backend API:

```sh
npm run server
```

Terminal 2 — React frontend:

```sh
npm run dev
```

Open the local URL printed by Vite (usually <http://localhost:5173>). Vite forwards `/api` requests to the backend on port 3001. On its first start, the backend creates `database/bail-reckoner.sqlite`, applies SQL migrations, and inserts fictional demo records. Case edits persist after restarting the backend.

Node.js 22.13 or later is required for the built-in SQLite module. The module's stability status depends on the Node release; the detected Node 24.7 runtime classifies it as experimental, so this setup is for the local MVP rather than production legal data. Set `BAIL_RECKONER_DB` to use a different database file path.

## Test and build

```sh
npm test
npm run build
```

## Container deployment

```sh
docker compose up --build -d
```

The app is available at <http://localhost:3001>. See [deployment notes](docs/deployment.md) for storage and demo-only limits.

## Project structure

```text
frontend/                 React app and styles
  src/                    React screens and API client
backend/                  Express API
  src/routes/              HTTP endpoints and request validation
  src/data/                Case repository used by API routes
  src/db/                  SQLite connection and migration runner
database/                  SQLite file, migrations, and demo seed
docs/                      Project plan and requirements
```

## Current scope

The prototype includes a case dashboard, search, create/edit/detail flows, multiple charges, elapsed custody duration, and a basic editable preparation checklist. It does not provide legal advice, determine bail eligibility, or predict a bail outcome.
