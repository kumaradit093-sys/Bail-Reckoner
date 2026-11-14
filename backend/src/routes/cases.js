import { Router } from "express";
import { createCase, deleteCase, getCase, listCases, updateCase, updateChecklist } from "../data/caseRepository.js";
import { todayInIndia } from "../../../shared/date.js";
import { checklistLength } from "../../../shared/checklist.js";

const router = Router();
const allowedStatuses = new Set(["In progress", "Information needed", "Ready for review"]);

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
  const today = todayInIndia();
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

async function requireCase(id) {
  const item = await getCase(id);
  if (!item) throw new HttpError(404, "Case not found.");
  return item;
}

router.get("/", async (request, response) => {
  response.json(await listCases(String(request.query.search || "")));
});

router.get("/:id", async (request, response) => {
  response.json(await requireCase(request.params.id));
});

router.post("/", async (request, response) => {
  response.status(201).json(await createCase(normalizeCase(request.body)));
});

router.put("/:id", async (request, response) => {
  await requireCase(request.params.id);
  response.json(await updateCase(request.params.id, normalizeCase(request.body)));
});

router.patch("/:id/checklist", async (request, response) => {
  await requireCase(request.params.id);
  const { index, checked } = request.body || {};
  if (!Number.isInteger(index) || index < 0 || index >= checklistLength || typeof checked !== "boolean") {
    throw new HttpError(400, "Provide a valid checklist index and checked value.");
  }
  response.json(await updateChecklist(request.params.id, index, checked));
});

router.delete("/:id", async (request, response) => {
  await requireCase(request.params.id);
  await deleteCase(request.params.id);
  response.status(204).end();
});

export { router as casesRouter };
