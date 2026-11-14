# Database

The backend uses local SQLite by default (`BAIL_RECKONER_DB` controls its file path). If `DATABASE_URL` is set, it uses PostgreSQL and is suitable for a hosted database such as Neon. Never commit a real connection string.

Both database modes apply migrations on backend startup. SQLite migrations are in `migrations/`; PostgreSQL migrations are in `postgres-migrations/`. The initial migrations create the schema and add fictional demo records. PostgreSQL's `schema_migrations` table prevents already applied migrations from running again.

SQLite database files are ignored by Git. PostgreSQL schema and data persist in the configured database service.
