import express from "express";
import { casesRouter } from "./routes/cases.js";

const app = express();
const port = Number(process.env.PORT) || 3001;

app.disable("x-powered-by");
app.use(express.json({ limit: "100kb" }));

app.get("/api/health", (_request, response) => response.json({ status: "ok" }));
app.use("/api/cases", casesRouter);

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

app.listen(port, () => {
  console.log(`Bail Reckoner API listening on http://localhost:${port}`);
});
