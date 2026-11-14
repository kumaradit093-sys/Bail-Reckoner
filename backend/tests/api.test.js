import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

const testDirectory = mkdtempSync(join(tmpdir(), "bail-reckoner-test-"));
const testDatabasePath = join(testDirectory, "test.sqlite");
process.env.BAIL_RECKONER_DB = testDatabasePath;

const [{ app }, { database }, { DatabaseSync }] = await Promise.all([
  import("../src/app.js"),
  import("../src/db/database.js"),
  import("node:sqlite"),
]);

test("case API validates input and persists case, charge, and checklist changes", async () => {
  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  try {
    const health = await fetch(`${baseUrl}/api/health`);
    assert.equal(health.status, 200);
    assert.deepEqual(await health.json(), { status: "ok" });

    const seeded = await fetch(`${baseUrl}/api/cases`);
    assert.equal(seeded.status, 200);
    const initialCases = await seeded.json();
    assert.equal(initialCases.length, 3);
    assert.equal(initialCases[0].title, "State vs. Arjun Mehta");
    assert.equal(initialCases[0].charges.length, 2);

    const missingTitle = await fetch(`${baseUrl}/api/cases`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "  " }),
    });
    assert.equal(missingTitle.status, 400);
    assert.match((await missingTitle.json()).error, /title is required/i);

    const invalidDate = await fetch(`${baseUrl}/api/cases`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "Future date", custodyStartDate: "2999-01-01" }),
    });
    assert.equal(invalidDate.status, 400);

    const createdResponse = await fetch(`${baseUrl}/api/cases`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: "API integration case",
        reference: "TEST-001",
        jurisdiction: "Demo court",
        status: "In progress",
        custodyStartDate: "2025-03-04",
        notes: "Synthetic test record",
        charges: [
          { statute: "Example Act", section: "12", description: "First sample charge" },
          { statute: "Other Act", section: "7", description: "Second sample charge" },
        ],
      }),
    });
    assert.equal(createdResponse.status, 201);
    const created = await createdResponse.json();
    assert.ok(created.id.startsWith("BR-"));
    assert.equal(created.charges.length, 2);
    assert.deepEqual(created.checklist, [false, false, false, false]);

    const checklistResponse = await fetch(`${baseUrl}/api/cases/${created.id}/checklist`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ index: 1, checked: true }),
    });
    assert.equal(checklistResponse.status, 200);
    assert.deepEqual((await checklistResponse.json()).checklist, [false, true, false, false]);

    const updateResponse = await fetch(`${baseUrl}/api/cases/${created.id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: "Updated API integration case",
        reference: "TEST-001",
        jurisdiction: "Demo court",
        status: "Ready for review",
        custodyStartDate: "2025-03-04",
        notes: "Updated synthetic record",
        charges: [{ statute: "Example Act", section: "13", description: "Updated charge" }],
      }),
    });
    assert.equal(updateResponse.status, 200);
    const updated = await updateResponse.json();
    assert.equal(updated.title, "Updated API integration case");
    assert.equal(updated.charges.length, 1);
    assert.deepEqual(updated.checklist, [false, true, false, false]);

    const observer = new DatabaseSync(testDatabasePath);
    const stored = observer.prepare("SELECT title FROM cases WHERE id = ?").get(created.id);
    assert.equal(stored.title, "Updated API integration case");
    observer.close();

    const detail = await fetch(`${baseUrl}/api/cases/${created.id}`);
    assert.equal(detail.status, 200);
    assert.equal((await detail.json()).title, "Updated API integration case");

    const deletion = await fetch(`${baseUrl}/api/cases/${created.id}`, { method: "DELETE" });
    assert.equal(deletion.status, 204);
    const missing = await fetch(`${baseUrl}/api/cases/${created.id}`);
    assert.equal(missing.status, 404);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    database.close();
    rmSync(testDirectory, { recursive: true, force: true });
  }
});
