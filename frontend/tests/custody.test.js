import assert from "node:assert/strict";
import { test } from "node:test";
import { daysInCustody, relativeDuration } from "../src/custody.js";
import { validateCaseValues } from "../src/validation.js";

test("custody duration is calculated from calendar dates", () => {
  assert.equal(daysInCustody("2026-01-08", new Date(2026, 0, 10, 12)), 2);
  assert.equal(daysInCustody("2026-01-11", new Date(2026, 0, 10, 12)), 0);
  assert.equal(daysInCustody("", new Date(2026, 0, 10)), null);
});

test("custody duration is presented in simple units", () => {
  assert.equal(relativeDuration(null), "Not recorded");
  assert.equal(relativeDuration(0), "0 days");
  assert.equal(relativeDuration(400), "1 year, 1 month");
});

test("case form validation requires a title and rejects future custody dates", () => {
  assert.deepEqual(validateCaseValues({ title: "   ", custodyStartDate: "" }, "2026-11-15"), {
    title: "Enter a case title.",
  });
  assert.deepEqual(validateCaseValues({ title: "A case", custodyStartDate: "2026-11-16" }, "2026-11-15"), {
    custodyStartDate: "Date cannot be in the future.",
  });
  assert.deepEqual(validateCaseValues({ title: "A case", custodyStartDate: "2026-11-15" }, "2026-11-15"), {});
});
