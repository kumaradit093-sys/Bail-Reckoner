// Temporary in-memory repository. Phase 3 can replace this module with database access.
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

export function listCases(search = "") {
  const query = search.trim().toLowerCase();
  return query
    ? cases.filter((item) => `${item.title} ${item.reference} ${item.jurisdiction}`.toLowerCase().includes(query))
    : cases;
}

export function getCase(id) {
  return cases.find((item) => item.id === id) || null;
}

export function createCase(caseData) {
  const item = { ...caseData, id: `BR-${Date.now().toString().slice(-6)}` };
  cases.unshift(item);
  return item;
}

export function updateCase(id, caseData) {
  const current = getCase(id);
  if (!current) return null;
  const item = { ...caseData, id: current.id, checklist: current.checklist };
  cases = cases.map((entry) => entry.id === current.id ? item : entry);
  return item;
}

export function updateChecklist(id, index, checked) {
  const item = getCase(id);
  if (!item) return null;
  item.checklist[index] = checked;
  return item;
}

export function deleteCase(id) {
  const current = getCase(id);
  if (!current) return null;
  cases = cases.filter((entry) => entry.id !== id);
  return current;
}
