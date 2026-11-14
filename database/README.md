# Database layer (Phase 3)

This folder is reserved for the database schema, migrations, and seed setup planned for Phase 3. Until then, the backend's `caseStore.js` module uses temporary in-memory data.

The intended boundary is for API routes to use a repository/data-access module. Phase 3 can replace the in-memory implementation behind that boundary with database operations while keeping the frontend API contract stable.
