# Build, test, and deployment notes

## Local quality checks

From the repository root:

```sh
npm ci
npm test
npm run build
```

The tests cover case API CRUD and validation, database persistence, custody duration, and form validation. The production build is written to `frontend/dist/`.

## Run the production container

Docker Compose builds one image containing the React build and Express API, then mounts a named volume for SQLite data:

```sh
docker compose up --build -d
```

Open <http://localhost:3001>. Check service health at <http://localhost:3001/api/health>. Stop the service with `docker compose down`; the named database volume remains. To remove that volume and its data, use `docker compose down --volumes` only when you intend to permanently delete the demo records.

Compose reads `PORT` from the root `.env` file (default `3001`) for the published and container port. It deliberately overrides `BAIL_RECKONER_DB` to `/data/bail-reckoner.sqlite` so the named volume remains the database location. `API_PROXY_TARGET` is only used by the local Vite development server.

For a Docker-compatible hosting platform, deploy this image and attach persistent storage at `/data`. The service listens on port `3001`; configure the platform's HTTPS endpoint in front of it. Do not run multiple app replicas against a shared SQLite file.

## Scope and deployment limits

This deployment is for a local or private demonstration. It has no user authentication, case-level access control, production backup/restore workflow, or security review. Do not publish it for public use or enter real case or personal data. A production deployment needs an identified hosting owner, access-control design, privacy/security review, supported database operations, and legal-content review first.
