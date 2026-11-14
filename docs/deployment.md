# Build and deployment notes

## Local quality checks

From the repository root:

```sh
npm ci
npm test
npm run build
```

The tests cover case API CRUD and validation, database persistence, custody duration, and form validation. The production build is written to `frontend/dist/`.

## Deploy as Cloudflare Pages + Render + Neon

This repository supports local SQLite for development and PostgreSQL when `DATABASE_URL` is configured. The PostgreSQL migrations run automatically when the backend starts. The first migration creates the schema and fictional demo records.

### Neon

Create a Neon project/database, then copy the full connection string from the Neon **Connect** dialog. Use the pooled connection string for a hosted web service when available. Keep the password private.

### Render backend

Create a **Web Service** from this repository with the Node runtime:

- Build command: `npm ci`
- Start command: `npm start`
- Health check path: `/api/health`

Set these Render environment variables:

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | Full Neon PostgreSQL connection string, including credentials and SSL query options |
| `CORS_ORIGIN` | Exact Cloudflare Pages origin, e.g. `https://bail-reckoner.pages.dev` |
| `SERVE_FRONTEND` | `false` |

Render supplies `PORT` automatically. The server binds to `0.0.0.0`. Do not set `BAIL_RECKONER_DB` on Render; that variable is only for local SQLite/Docker use.

### Cloudflare Pages frontend

For the Pages build settings, use repository root as the root directory, `npm run build` as the build command, and `frontend/dist` as the build output directory. `None` is an acceptable framework preset.

Set this Pages environment variable for both Production and Preview as appropriate:

| Variable | Value |
| --- | --- |
| `VITE_API_BASE_URL` | Public Render service URL, e.g. `https://your-service.onrender.com` |

The API URL is included in the frontend at build time. Redeploy Pages after changing it. Keep the Render origin in sync with `CORS_ORIGIN`.

### Local development

Leave `DATABASE_URL` unset to use the local SQLite database. Copy `.env.example` to `.env`, then run:

```sh
npm ci
npm run server
```

In a second terminal, run `npm run dev` and open the Vite URL, normally <http://localhost:5173>. Vite proxies `/api` to the local backend. To develop against Neon, set `DATABASE_URL` in `.env`; the backend will run the PostgreSQL migrations on startup.

## Run the production container

Docker Compose builds one image containing the React build and Express API, then mounts a named volume for SQLite data:

```sh
docker compose up --build -d
```

Open <http://localhost:3001>. Check service health at <http://localhost:3001/api/health>. Stop the service with `docker compose down`; the named database volume remains. To remove that volume and its data, use `docker compose down --volumes` only when you intend to permanently delete the demo records.

Compose reads `PORT` from the root `.env` file (default `3001`) for the published and container port. It deliberately overrides `BAIL_RECKONER_DB` to `/data/bail-reckoner.sqlite` so the named volume remains the database location. `API_PROXY_TARGET` is only used by the local Vite development server.

For a Docker-compatible hosting platform, deploy this image and attach persistent storage at `/data`. The service listens on the configured `PORT` (default `3001`); configure the platform's HTTPS endpoint in front of it. Do not run multiple app replicas against a shared SQLite file.

## Scope and deployment limits

This is a basic demonstration app. It has no user authentication or case-level access control. Do not enter real case or personal data. Review privacy, security, access control, backup/restore, and legal content before using it with real cases.
