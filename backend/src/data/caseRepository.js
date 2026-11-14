import { randomUUID } from "node:crypto";
import { database } from "../db/database.js";

const caseColumns = `id, title, reference, jurisdiction, status, custody_start_date, notes`;

function toCase(row) {
  if (!row) return null;
  const charges = database.prepare(`
    SELECT statute, section, description
    FROM charges
    WHERE case_id = ?
    ORDER BY position, id
  `).all(row.id).map((charge) => ({
    statute: charge.statute,
    section: charge.section,
    description: charge.description,
  }));
  const checklist = database.prepare(`
    SELECT checked
    FROM checklist_items
    WHERE case_id = ?
    ORDER BY position
  `).all(row.id).map((item) => Boolean(item.checked));
  return {
    id: row.id,
    title: row.title,
    reference: row.reference,
    jurisdiction: row.jurisdiction,
    status: row.status,
    custodyStartDate: row.custody_start_date,
    notes: row.notes,
    charges,
    checklist,
  };
}

function inTransaction(work) {
  database.exec("BEGIN;");
  try {
    const result = work();
    database.exec("COMMIT;");
    return result;
  } catch (error) {
    database.exec("ROLLBACK;");
    throw error;
  }
}

function insertCharges(caseId, charges) {
  const insert = database.prepare(`
    INSERT INTO charges (case_id, statute, section, description, position)
    VALUES (?, ?, ?, ?, ?)
  `);
  charges.forEach((charge, index) => insert.run(caseId, charge.statute, charge.section, charge.description, index));
}

function insertChecklist(caseId, checklist) {
  const insert = database.prepare(`
    INSERT INTO checklist_items (case_id, position, checked)
    VALUES (?, ?, ?)
  `);
  checklist.forEach((checked, index) => insert.run(caseId, index, checked ? 1 : 0));
}

export function listCases(search = "") {
  const query = search.trim();
  const rows = query
    ? database.prepare(`
        SELECT ${caseColumns} FROM cases
        WHERE title LIKE ? OR reference LIKE ? OR jurisdiction LIKE ?
        ORDER BY created_at DESC, id DESC
      `).all(`%${query}%`, `%${query}%`, `%${query}%`)
    : database.prepare(`SELECT ${caseColumns} FROM cases ORDER BY created_at DESC, id DESC`).all();
  return rows.map(toCase);
}

export function getCase(id) {
  return toCase(database.prepare(`SELECT ${caseColumns} FROM cases WHERE id = ?`).get(id));
}

export function createCase(caseData) {
  const id = `BR-${randomUUID()}`;
  inTransaction(() => {
    database.prepare(`
      INSERT INTO cases (id, title, reference, jurisdiction, status, custody_start_date, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, caseData.title, caseData.reference, caseData.jurisdiction, caseData.status, caseData.custodyStartDate, caseData.notes);
    insertCharges(id, caseData.charges);
    insertChecklist(id, caseData.checklist);
  });
  return getCase(id);
}

export function updateCase(id, caseData) {
  const result = inTransaction(() => {
    const update = database.prepare(`
      UPDATE cases
      SET title = ?, reference = ?, jurisdiction = ?, status = ?, custody_start_date = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(caseData.title, caseData.reference, caseData.jurisdiction, caseData.status, caseData.custodyStartDate, caseData.notes, id);
    if (update.changes === 0) return false;
    database.prepare("DELETE FROM charges WHERE case_id = ?").run(id);
    insertCharges(id, caseData.charges);
    return true;
  });
  return result ? getCase(id) : null;
}

export function updateChecklist(id, index, checked) {
  const result = database.prepare(`
    UPDATE checklist_items SET checked = ? WHERE case_id = ? AND position = ?
  `).run(checked ? 1 : 0, id, index);
  return result.changes ? getCase(id) : null;
}

export function deleteCase(id) {
  const item = getCase(id);
  if (!item) return null;
  database.prepare("DELETE FROM cases WHERE id = ?").run(id);
  return item;
}
