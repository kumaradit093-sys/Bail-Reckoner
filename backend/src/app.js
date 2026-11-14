import express from "express";
import { fileURLToPath } from "node:url";
import { casesRouter } from "./routes/cases.js";
import { query } from "./db/database.js";

const app = express();
const frontendBuild = fileURLToPath(new URL("../../frontend/dist/", import.meta.url));
const notFound = (request, _response, next) => {
  const error = new Error(`No endpoint for ${request.method} ${request.path}.`);
  error.status = 404;
  next(error);
};

app.disable("x-powered-by");
const allowedOrigins = new Set((process.env.CORS_ORIGIN || "").split(",").map((origin) => origin.trim()).filter(Boolean));
app.use((request, response, next) => {
  const origin = request.get("origin");
  if (origin && allowedOrigins.has(origin)) {
    response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Vary", "Origin");
    response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }
  if (request.method === "OPTIONS") return response.sendStatus(origin && allowedOrigins.has(origin) ? 204 : 403);
  next();
});
app.use(express.json({ limit: "100kb" }));

app.get("/api/health", async (_request, response) => {
  await query("SELECT 1");
  response.json({ status: "ok" });
});
app.use("/api/cases", casesRouter);

app.use("/api", notFound);

if (process.env.NODE_ENV === "production" && process.env.SERVE_FRONTEND !== "false") {
  app.use(express.static(frontendBuild));
  app.get("/{*path}", (_request, response, next) => {
    response.sendFile(fileURLToPath(new URL("../../frontend/dist/index.html", import.meta.url)), (error) => {
      if (error) next(error);
    });
  });
}

app.use(notFound);

app.use((error, _request, response, _next) => {
  const status = Number(error.status) >= 400 && Number(error.status) < 500 ? Number(error.status) : 500;
  if (status === 500) console.error(error);
  const message = status === 400 && error.type === "entity.parse.failed"
    ? "Request body must contain valid JSON."
    : error.message;
  response.status(status).json({ error: status === 500 ? "The server could not complete the request." : message });
});

export { app };
