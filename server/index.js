import express from "express";

const app = express();
const port = Number(process.env.PORT) || 3001;
const allowedStatuses = new Set(["In progress", "Information needed", "Ready for review"]);
const checklistLength = 4;

app.disable("x-powered-by");
app.use(express.json({ limit: "100kb" }));

let cases = [
  {
    id: "BR-24018", title: "State vs. Arjun Mehta", reference: "CRL.MC. 1842 / 2024", jurisdiction: "District Court, Pune", status: "In progress", custodyStartDate: "2025-02-12", notes: "Case details entered for demonstration purposes.",
    charges: [{ statute: "Bharatiya Nyaya Sanhita", section: "115(2)", description: "Voluntarily causing hurt" }, { statute: "Bharatiya Nyaya Sanhita", section: "351(2)", description: "Criminal intimidation" }], checklist: [false, true, false, false],
  },
  {
    id: "BR-24012", title: "State vs. Priya Nair", reference: "C.C. 762 / 2025", jurisdiction: "JMFC Court, Kochi", status: "Information needed", custodyStartDate: "2025-08-04", notes: "Confirm next hearing date with the legal aid provider.",
    charges: [{ statute: "Information Technology Act", section: "66C", description: "Identity theft" }], checklist: [true, false, false, false],
  },
  {
    id: "BR-23986", title: "State vs. Rohan Das", reference: "G.R. 319 / 2025", jurisdiction: "Sessions Court, Kolkata", status: "In progress", custodyStartDate: "2025-05-21", notes: "Sample record. Verify all case facts before relying on them.",
    charges: [{ statute: "Bharatiya Nyaya Sanhita", section: "303(2)", description: "Theft" }], checklist: [false, false, false, false],
  },
];

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function optionalText(value, field, maxLength) {
  if (value == null) return "";
  if (typeof value !== "string") throw new HttpError(400, `${field} must be text.`);
  const result = value.trim();
  if (result.length > maxLength) throw new HttpError(400, `${field} must be ${maxLength} characters or fewer.`);
  return result;
}

function validDate(value) {
  if (value == null || value === "") return "";
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new HttpError(400, "Custody start date must use YYYY-MM-DD format.");
  }
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    throw new HttpError(400, "Custody start date is not a valid date.");
  }
  const today = new Date().toISOString().slice(0, 10);
  if (value > today) throw new HttpError(400, "Custody start date cannot be in the future.");
  return value;
}

function normalizeCase(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new HttpError(400, "Request body must be a JSON object.");
  const title = optionalText(body.title, "Case title", 120);
  if (!title) throw new HttpError(400, "Case title is required.");
  const status = body.status == null || body.status === "" ? "In progress" : body.status;
  if (typeof status !== "string" || !allowedStatuses.has(status)) throw new HttpError(400, "Choose a valid case status.");
  if (body.charges != null && !Array.isArray(body.charges)) throw new HttpError(400, "Charges must be a list.");
  const rawCharges = body.charges || [];
  if (rawCharges.length > 50) throw new HttpError(400, "A case can have at most 50 charges.");
  const charges = rawCharges.map((charge, index) => {
    if (!charge || typeof charge !== "object" || Array.isArray(charge)) throw new HttpError(400, `Charge ${index + 1} must be an object.`);
    return {
      statute: optionalText(charge.statute, `Charge ${index + 1} statute`, 120),
      section: optionalText(charge.section, `Charge ${index + 1} section`, 80),
      description: optionalText(charge.description, `Charge ${index + 1} description`, 240),
    };
  }).filter((charge) => charge.statute || charge.section || charge.description);
  if (body.checklist != null && (!Array.isArray(body.checklist) || body.checklist.length !== checklistLength || body.checklist.some((value) => typeof value !== "boolean"))) {
    throw new HttpError(400, "Checklist must contain four true/false values.");
  }
  const checklist = body.checklist || Array.from({ length: checklistLength }, () => false);
  return {
    title,
    reference: optionalText(body.reference, "Case reference", 80),
    jurisdiction: optionalText(body.jurisdiction, "Court / jurisdiction", 120),
    status,
    custodyStartDate: validDate(body.custodyStartDate),
    notes: optionalText(body.notes, "Notes", 1200),
    charges,
    checklist,
  };
}

function findCase(id) {
  const item = cases.find((entry) => entry.id === id);
  if (!item) throw new HttpError(404, "Case not found.");
  return item;
}

app.get("/api/health", (_request, response) => response.json({ status: "ok" }));

app.get("/api/cases", (request, response) => {
  const search = String(request.query.search || "").trim().toLowerCase();
  const result = search
    ? cases.filter((item) => `${item.title} ${item.reference} ${item.jurisdiction}`.toLowerCase().includes(search))
    : cases;
  response.json(result);
});

app.get("/api/cases/:id", (request, response) => {
  response.json(findCase(request.params.id));
});

app.post("/api/cases", (request, response) => {
  const item = {
    ...normalizeCase(request.body),
    id: `BR-${Date.now().toString().slice(-6)}`,
  };
  cases.unshift(item);
  response.status(201).json(item);
});

app.put("/api/cases/:id", (request, response) => {
  const current = findCase(request.params.id);
  const item = { ...normalizeCase(request.body), id: current.id, checklist: current.checklist };
  cases = cases.map((entry) => entry.id === current.id ? item : entry);
  response.json(item);
});

app.patch("/api/cases/:id/checklist", (request, response) => {
  const item = findCase(request.params.id);
  const { index, checked } = request.body || {};
  if (!Number.isInteger(index) || index < 0 || index >= checklistLength || typeof checked !== "boolean") {
    throw new HttpError(400, "Provide a valid checklist index and checked value.");
  }
  item.checklist[index] = checked;
  response.json(item);
});

app.delete("/api/cases/:id", (request, response) => {
  const item = findCase(request.params.id);
  cases = cases.filter((entry) => entry.id !== item.id);
  response.status(204).end();
});

app.use((request, _response, next) => next(new HttpError(404, `No endpoint for ${request.method} ${request.path}.`)));

app.use((error, _request, response, _next) => {
  const status = error instanceof HttpError ? error.status : Number(error.status) >= 400 && Number(error.status) < 500 ? Number(error.status) : 500;
  if (status === 500) console.error(error);
  const message = status === 400 && error.type === "entity.parse.failed" ? "Request body must contain valid JSON." : error.message;
  response.status(status).json({ error: status === 500 ? "The server could not complete the request." : message });
});

app.listen(port, () => {
  console.log(`Bail Reckoner API listening on http://localhost:${port}`);
});
