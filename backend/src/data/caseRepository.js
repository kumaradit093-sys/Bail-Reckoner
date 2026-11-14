import { randomUUID } from "node:crypto";
import { query, transaction } from "../db/database.js";

const caseColumns = "id, title, reference, jurisdiction, status, custody_start_date, notes";

async function toCase(row) {
  if (!row) return null;
  const [chargeResult, checklistResult] = await Promise.all([
    query("SELECT statute, section, description FROM charges WHERE case_id = $1 ORDER BY position, id", [row.id]),
    query("SELECT checked FROM checklist_items WHERE case_id = $1 ORDER BY position", [row.id]),
  ]);
  return {
    id: row.id,
    title: row.title,
    reference: row.reference,
    jurisdiction: row.jurisdiction,
    status: row.status,
    custodyStartDate: row.custody_start_date,
    notes: row.notes,
    charges: chargeResult.rows.map(({ statute, section, description }) => ({ statute, section, description })),
    checklist: checklistResult.rows.map(({ checked }) => Boolean(checked)),
  };
}

async function insertCharges(runQuery, caseId, charges) {
  for (const [index, charge] of charges.entries()) {
    await runQuery("INSERT INTO charges (case_id, statute, section, description, position) VALUES ($1, $2, $3, $4, $5)", [caseId, charge.statute, charge.section, charge.description, index]);
  }
}

async function insertChecklist(runQuery, caseId, checklist) {
  for (const [index, checked] of checklist.entries()) {
    await runQuery("INSERT INTO checklist_items (case_id, position, checked) VALUES ($1, $2, $3)", [caseId, index, checked]);
  }
}

export async function listCases(search = "") {
  const queryText = search.trim();
  const escapedQuery = queryText.replace(/[\\%_]/g, "\\$&");
  const result = queryText
    ? await query(`SELECT ${caseColumns} FROM cases
        WHERE LOWER(title) LIKE LOWER($1) ESCAPE '\\' OR LOWER(reference) LIKE LOWER($1) ESCAPE '\\' OR LOWER(jurisdiction) LIKE LOWER($1) ESCAPE '\\'
        ORDER BY created_at DESC, id DESC`, [`%${escapedQuery}%`])
    : await query(`SELECT ${caseColumns} FROM cases ORDER BY created_at DESC, id DESC`);
  return Promise.all(result.rows.map(toCase));
}

export async function getCase(id) {
  const result = await query(`SELECT ${caseColumns} FROM cases WHERE id = $1`, [id]);
  return toCase(result.rows[0]);
}

export async function createCase(caseData) {
  const id = `BR-${randomUUID()}`;
  await transaction(async (runQuery) => {
    await runQuery(`INSERT INTO cases (id, title, reference, jurisdiction, status, custody_start_date, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7)`, [id, caseData.title, caseData.reference, caseData.jurisdiction, caseData.status, caseData.custodyStartDate, caseData.notes]);
    await insertCharges(runQuery, id, caseData.charges);
    await insertChecklist(runQuery, id, caseData.checklist);
  });
  return getCase(id);
}

export async function updateCase(id, caseData) {
  const updated = await transaction(async (runQuery) => {
    const result = await runQuery(`UPDATE cases
      SET title = $1, reference = $2, jurisdiction = $3, status = $4, custody_start_date = $5, notes = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7`, [caseData.title, caseData.reference, caseData.jurisdiction, caseData.status, caseData.custodyStartDate, caseData.notes, id]);
    if (!result.rowCount) return false;
    await runQuery("DELETE FROM charges WHERE case_id = $1", [id]);
    await insertCharges(runQuery, id, caseData.charges);
    return true;
  });
  return updated ? getCase(id) : null;
}

export async function updateChecklist(id, index, checked) {
  const result = await query("UPDATE checklist_items SET checked = $1 WHERE case_id = $2 AND position = $3", [checked, id, index]);
  return result.rowCount ? getCase(id) : null;
}

export async function deleteCase(id) {
  const item = await getCase(id);
  if (!item) return null;
  await query("DELETE FROM cases WHERE id = $1", [id]);
  return item;
}
