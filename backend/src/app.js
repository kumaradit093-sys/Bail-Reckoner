import express from "express";
import { fileURLToPath } from "node:url";
import { casesRouter } from "./routes/cases.js";

const app = express();
const frontendBuild = fileURLToPath(new URL("../../frontend/dist/", import.meta.url));

app.disable("x-powered-by");
app.use(express.json({ limit: "100kb" }));

app.get("/api/health", (_request, response) => response.json({ status: "ok" }));
app.use("/api/cases", casesRouter);

app.use("/api", (request, _response, next) => {
  const error = new Error(`No endpoint for ${request.method} ${request.path}.`);
  error.status = 404;
  next(error);
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(frontendBuild));
  app.get("/{*path}", (_request, response, next) => {
    response.sendFile(fileURLToPath(new URL("../../frontend/dist/index.html", import.meta.url)), (error) => {
      if (error) next(error);
    });
  });
}

app.use((request, _response, next) => {
  const error = new Error(`No endpoint for ${request.method} ${request.path}.`);
  error.status = 404;
  next(error);
});

app.use((error, _request, response, _next) => {
  const status = Number(error.status) >= 400 && Number(error.status) < 500 ? Number(error.status) : 500;
  if (status === 500) console.error(error);
  const message = status === 400 && error.type === "entity.parse.failed"
    ? "Request body must contain valid JSON."
    : error.message;
  response.status(status).json({ error: status === 500 ? "The server could not complete the request." : message });
});

export { app };
