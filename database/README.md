# Database layer

The app uses a local SQLite database at `bail-reckoner.sqlite` by default. That generated database file is ignored by Git. SQL migrations are applied on backend startup and recorded in `schema_migrations`.

The `migrations/` directory contains the schema and fictional initial demo records. The backend repository module is the data-access boundary used by API routes; the frontend API contract remains unchanged.

The backend uses Node's built-in `node:sqlite` API and requires Node.js 22.13 or later. In the repository's detected Node 24.7 runtime, this API is marked experimental; use it for the local MVP and avoid production legal data.
