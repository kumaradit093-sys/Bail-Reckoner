# Bail Reckoner

A basic full-stack prototype for organizing undertrial case information. It uses fictional sample records and in-memory server state; changes reset when the backend restarts. Do not enter real personal or case information.

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

Open the local URL printed by Vite (usually <http://localhost:5173>). Vite forwards `/api` requests to the backend on port 3001. The API stores records in memory until Phase 3 adds a database.

## Current scope

The prototype includes a case dashboard, search, create/edit/detail flows, multiple charges, elapsed custody duration, and a basic editable preparation checklist. It does not provide legal advice, determine bail eligibility, or predict a bail outcome.
