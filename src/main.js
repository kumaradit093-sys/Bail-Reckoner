const initialCases = [
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

const checklistLabels = ["Confirm case reference and court details", "Collect available case documents", "Confirm custody dates and records", "Review next steps with a legal aid provider"];
let cases = structuredClone(initialCases);
let route = { page: "dashboard", id: null };
let query = "";
let toastTimer;
const app = document.querySelector("#app");
const esc = (value = "") => String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
const fmtDate = (value) => value ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${value}T00:00:00`)) : "Not recorded";
const daysInCustody = (value) => {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  const start = Date.UTC(year, month - 1, day);
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.max(0, Math.floor((today - start) / 86400000));
};
const relativeDuration = (days) => {
  if (days == null) return "Not recorded";
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  const remaining = days - years * 365 - months * 30;
  const parts = [];
  if (years) parts.push(`${years} ${years === 1 ? "year" : "years"}`);
  if (months || years) parts.push(`${months} ${months === 1 ? "month" : "months"}`);
  if (!years && !months) parts.push(`${remaining} ${remaining === 1 ? "day" : "days"}`);
  return parts.join(", ");
};
const getCase = (id) => cases.find((item) => item.id === id);
const routeTo = (page, id = null) => { route = { page, id }; query = ""; render(); window.scrollTo(0, 0); };

function layout(content, current = "Cases") {
  return `<div class="shell">
    <aside class="sidebar" aria-label="Main navigation">
      <a class="brand" href="#" data-action="dashboard"><span class="brand-mark" aria-hidden="true">B</span><span class="brand-name">bail reckoner<span class="brand-sub">case workspace</span></span></a>
      <div class="nav-label">Workspace</div>
      <a href="#" class="nav-item ${current === "Cases" ? "active" : ""}" data-action="dashboard"><span class="nav-icon" aria-hidden="true">▦</span><span class="nav-text">Cases</span></a>
      <a href="#" class="nav-item" data-action="dashboard"><span class="nav-icon" aria-hidden="true">⌕</span><span class="nav-text">Legal reference</span></a>
      <div class="sidebar-bottom">
        <div class="privacy-note"><strong>Demo workspace</strong>Sample records are stored only in this browser session. Avoid entering real personal or case information.</div>
        <div class="user-row"><div class="avatar" aria-hidden="true">LA</div><div class="user-meta"><div class="user-name">Legal Aid User</div><div class="user-role">Demo account</div></div></div>
      </div>
    </aside>
    <main class="main">
      <header class="topbar"><div class="crumb">Workspace <span aria-hidden="true">/</span> <strong>${esc(current)}</strong></div><div class="top-right"><span class="demo-pill">DEMO · SAMPLE DATA</span></div></header>
      ${content}
    </main><div class="toast" role="status" aria-live="polite"></div>
  </div>`;
}

function caseRow(item) {
  return `<div class="case-row">
    <div><a href="#" class="case-title" data-action="detail" data-id="${esc(item.id)}">${esc(item.title || "Untitled case")}</a><div class="case-ref">${esc(item.reference || item.id)}</div></div>
    <div><div class="cell-text">${esc(item.jurisdiction || "Not specified")}</div><div class="cell-muted">Jurisdiction</div></div>
    <div><div class="cell-text">${esc(fmtDate(item.custodyStartDate))}</div><div class="cell-muted">Custody start</div></div>
    <div><span class="status">${esc(item.status || "In progress")}</span></div>
    <div><button class="button button-quiet button-small" data-action="detail" data-id="${esc(item.id)}" aria-label="Open ${esc(item.title)}">View →</button></div>
  </div>`;
}

function dashboard() {
  const filtered = cases.filter((item) => `${item.title} ${item.reference} ${item.jurisdiction}`.toLowerCase().includes(query.toLowerCase()));
  const rows = filtered.length ? `<div class="case-list">${filtered.map(caseRow).join("")}</div>` : `<div class="empty-state"><div class="empty-icon" aria-hidden="true">⌕</div><h3>${cases.length ? "No matching cases" : "No cases yet"}</h3><p>${cases.length ? "Try a different search term." : "Add a case to start organizing the details."}</p>${cases.length ? "" : `<button class="button button-primary" data-action="create">＋ Add first case</button>`}</div>`;
  const totalCharges = cases.reduce((sum, item) => sum + item.charges.length, 0);
  return layout(`<div class="content">
    <div class="page-head"><div><div class="eyebrow">Your workspace</div><h1>Good evening</h1><p class="intro">A clear place to organize case information and preparation.</p></div><button class="button button-primary" data-action="create"><span aria-hidden="true">＋</span><span class="button-text-short">New case</span></button></div>
    <section class="stats" aria-label="Workspace summary">
      <article class="stat-card"><div class="stat-top"><span>Total cases</span><span class="stat-symbol" aria-hidden="true">▦</span></div><div class="stat-value">${cases.length}</div><div class="stat-foot">In this workspace</div></article>
      <article class="stat-card"><div class="stat-top"><span>Charges recorded</span><span class="stat-symbol" aria-hidden="true">≡</span></div><div class="stat-value">${totalCharges}</div><div class="stat-foot">Across all cases</div></article>
      <article class="stat-card"><div class="stat-top"><span>Need information</span><span class="stat-symbol" aria-hidden="true">⌁</span></div><div class="stat-value">${cases.filter((item) => item.status === "Information needed").length}</div><div class="stat-foot">Case details to follow up</div></article>
    </section>
    <section class="panel"><div class="panel-head"><div><h2>Recent cases</h2><div class="panel-sub">Your case records in one place</div></div><label class="searchbox"><span class="search-symbol" aria-hidden="true">⌕</span><span class="sr-only">Search cases</span><input type="search" placeholder="Search cases..." value="${esc(query)}" data-search /></label></div>${rows}</section>
    <div class="notice"><strong>Demo only.</strong> This workspace helps organize information. It does not provide legal advice or determine bail eligibility. Example records are fictional and reset when you refresh.</div>
  </div>`, "Cases");
}

function chargeInputs(charges) {
  const list = charges.length ? charges : [{ statute: "", section: "", description: "" }];
  return list.map((charge, index) => `<div class="charge-entry">
    <div class="field"><label for="statute-${index}">Statute / Act</label><input id="statute-${index}" name="chargeStatute" value="${esc(charge.statute)}" placeholder="e.g. Name of Act" /></div>
    <div class="field"><label for="section-${index}">Section</label><input id="section-${index}" name="chargeSection" value="${esc(charge.section)}" placeholder="e.g. 115(2)" /></div>
    <div class="field"><label for="description-${index}">Short description <span class="optional">(optional)</span></label><input id="description-${index}" name="chargeDescription" value="${esc(charge.description)}" placeholder="Brief offence description" /></div>
    <button type="button" class="charge-remove" data-action="remove-charge" aria-label="Remove charge ${index + 1}">×</button>
  </div>`).join("");
}

function caseForm(existing = null) {
  const editing = Boolean(existing);
  const title = editing ? "Edit case" : "Add a case";
  const charges = existing?.charges?.length ? existing.charges : [{ statute: "", section: "", description: "" }];
  return layout(`<div class="content"><div class="form-wrap">
    <div class="page-head"><div><div class="eyebrow">Case workspace</div><h1>${title}</h1><p class="intro">Enter the case information you have. You can update it later.</p></div></div>
    <form id="case-form" novalidate data-id="${esc(existing?.id || "")}">
      <section class="panel form-card"><h2>Case details</h2><p>Basic information to help identify and organize this record.</p>
        <div class="form-grid">
          <div class="field"><label for="case-title">Case title <span aria-hidden="true">*</span></label><input id="case-title" name="title" required maxlength="120" value="${esc(existing?.title || "")}" placeholder="e.g. State vs. Name" autocomplete="off" /><span class="field-error" data-error="title"></span></div>
          <div class="field"><label for="case-ref">Case reference <span class="optional">(optional)</span></label><input id="case-ref" name="reference" maxlength="80" value="${esc(existing?.reference || "")}" placeholder="e.g. CRL.MC. 1842 / 2025" /></div>
          <div class="field"><label for="jurisdiction">Court / jurisdiction <span class="optional">(optional)</span></label><input id="jurisdiction" name="jurisdiction" maxlength="120" value="${esc(existing?.jurisdiction || "")}" placeholder="e.g. District Court, Pune" /></div>
          <div class="field"><label for="case-status">Status</label><select id="case-status" name="status"><option ${existing?.status === "In progress" ? "selected" : ""}>In progress</option><option ${existing?.status === "Information needed" ? "selected" : ""}>Information needed</option><option ${existing?.status === "Ready for review" ? "selected" : ""}>Ready for review</option></select></div>
          <div class="field"><label for="custody-date">Custody start date <span class="optional">(if known)</span></label><input id="custody-date" name="custodyStartDate" type="date" max="${new Date().toISOString().slice(0,10)}" value="${esc(existing?.custodyStartDate || "")}" /><span class="field-error" data-error="custodyStartDate"></span></div>
          <div class="field full"><label for="case-notes">Notes <span class="optional">(optional)</span></label><textarea id="case-notes" name="notes" maxlength="1200" placeholder="Add brief context or follow-up notes">${esc(existing?.notes || "")}</textarea></div>
        </div>
      </section>
      <section class="panel form-card"><div class="charges-head"><div><h2>Charges</h2><p>Record the charges associated with this case.</p></div><button type="button" class="button button-quiet button-small" data-action="add-charge">＋ Add charge</button></div><div class="charge-list" id="charge-list">${chargeInputs(charges)}</div></section>
      <div class="form-actions"><span class="small-note">* Required field</span><div class="actions-right"><button type="button" class="button button-quiet" data-action="cancel-form">Cancel</button><button type="submit" class="button button-primary">${editing ? "Save changes" : "Create case"}</button></div></div>
    </form>
  </div></div>`, "Cases");
}

function detailPage(item) {
  if (!item) return dashboard();
  const elapsed = daysInCustody(item.custodyStartDate);
  const chargeContent = item.charges.length ? item.charges.map((charge, index) => `<div class="charge-detail"><div class="charge-index">${index + 1}</div><div><div class="charge-name">${esc(charge.description || "Charge")}</div><div class="charge-meta">${esc(charge.statute || "Act not specified")}${charge.section ? ` · Section ${esc(charge.section)}` : ""}</div></div></div>`).join("") : `<div class="small-note">No charges recorded.</div>`;
  return layout(`<div class="content">
    <div class="page-head"><div><div class="eyebrow"><a href="#" data-action="dashboard" style="text-decoration:none">Cases</a> / Case overview</div><h1>${esc(item.title || "Untitled case")}</h1><p class="intro">${esc(item.reference || item.id)} <span aria-hidden="true">·</span> ${esc(item.jurisdiction || "Jurisdiction not specified")}</p></div><div class="actions-right"><button class="button button-quiet" data-action="delete" data-id="${esc(item.id)}">Delete</button><button class="button button-primary" data-action="edit" data-id="${esc(item.id)}">Edit case</button></div></div>
    <div class="detail-grid"><div>
      <section class="panel detail-card"><h2>Case information</h2><div class="detail-fields"><div><div class="detail-label">Status</div><span class="status">${esc(item.status)}</span></div><div><div class="detail-label">Case reference</div><div class="detail-value">${esc(item.reference || "Not recorded")}</div></div><div><div class="detail-label">Court / jurisdiction</div><div class="detail-value">${esc(item.jurisdiction || "Not recorded")}</div></div><div><div class="detail-label">Custody start date</div><div class="detail-value">${esc(fmtDate(item.custodyStartDate))}</div></div><div class="full"><div class="detail-label">Notes</div><div class="detail-value notes">${esc(item.notes || "No notes added.")}</div></div></div></section>
      <section class="panel detail-card"><h2>Charges <span class="cell-muted">(${item.charges.length})</span></h2>${chargeContent}</section>
      <section class="panel detail-card"><h2>Custody timeline</h2><div class="timeline"><span class="timeline-dot" aria-hidden="true"></span><div><div class="timeline-title">Custody started</div><div class="timeline-date">${esc(fmtDate(item.custodyStartDate))}</div></div></div><div class="duration-box"><div class="duration-number">${esc(relativeDuration(elapsed))}</div><div class="duration-caption">Elapsed since the recorded custody start date${elapsed != null ? ` · ${elapsed} days` : ""}</div></div></section>
    </div><aside class="detail-side"><section class="panel detail-card"><h2>Preparation checklist</h2><div class="checklist">${checklistLabels.map((label, index) => `<label class="check-row"><input type="checkbox" data-check="${index}" ${item.checklist?.[index] ? "checked" : ""} /><span>${esc(label)}</span></label>`).join("")}</div><div class="check-help">These are general organization prompts, not a complete list of legal requirements. Review next steps with a qualified legal aid provider.</div></section><section class="panel detail-card"><h2>About this record</h2><div class="detail-label">Created for</div><div class="detail-value" style="margin-bottom:14px">Demo workspace</div><div class="detail-label">Data source</div><div class="detail-value">Fictional sample information</div><div class="check-help">Information entered here stays in this browser session and resets when the page is refreshed.</div></section></aside></div>
    <div class="notice"><strong>Informational only.</strong> This page organizes case information and calculates elapsed time from the recorded date. It does not assess legal eligibility or predict a bail outcome.</div>
  </div>`, "Cases");
}

function render() {
  const content = route.page === "form" ? caseForm(route.id ? getCase(route.id) : null) : route.page === "detail" ? detailPage(getCase(route.id)) : dashboard();
  app.innerHTML = content;
  if (route.page === "form") document.querySelector("#case-title")?.focus({ preventScroll: true });
}

function showToast(message) {
  const toast = document.querySelector(".toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
}

app.addEventListener("click", (event) => {
  const control = event.target.closest("[data-action]");
  if (!control) return;
  event.preventDefault();
  const { action, id } = control.dataset;
  if (action === "dashboard" || action === "cancel-form") routeTo("dashboard");
  if (action === "create") routeTo("form");
  if (action === "detail") routeTo("detail", id);
  if (action === "edit") routeTo("form", id);
  if (action === "add-charge") {
    const list = document.querySelector("#charge-list");
    const count = list.querySelectorAll(".charge-entry").length;
    list.insertAdjacentHTML("beforeend", chargeInputs([{ statute: "", section: "", description: "" }]).replaceAll("-0\"", `-${count}\"`));
    list.querySelectorAll(".charge-entry:last-child input")[0]?.focus();
  }
  if (action === "remove-charge") {
    const list = document.querySelector("#charge-list");
    if (list.querySelectorAll(".charge-entry").length > 1) control.closest(".charge-entry").remove();
    else showToast("Keep at least one charge row, or leave its fields blank.");
  }
  if (action === "delete") {
    const item = getCase(id);
    if (item && window.confirm(`Delete “${item.title}” from this demo session?`)) {
      cases = cases.filter((entry) => entry.id !== id);
      routeTo("dashboard");
      showToast("Case deleted from this session.");
    }
  }
});

app.addEventListener("input", (event) => {
  if (event.target.matches("[data-search]")) {
    query = event.target.value;
    const position = event.target.selectionStart;
    render();
    const input = document.querySelector("[data-search]");
    input?.focus();
    input?.setSelectionRange(position, position);
  }
});

app.addEventListener("change", (event) => {
  const checkbox = event.target.closest("[data-check]");
  if (!checkbox) return;
  const item = getCase(route.id);
  if (item) item.checklist[Number(checkbox.dataset.check)] = checkbox.checked;
});

app.addEventListener("submit", (event) => {
  if (event.target.id !== "case-form") return;
  event.preventDefault();
  const form = event.target;
  const data = new FormData(form);
  const title = String(data.get("title") || "").trim();
  const custodyStartDate = String(data.get("custodyStartDate") || "");
  document.querySelector('[data-error="title"]').textContent = title ? "" : "Enter a case title.";
  const dateError = document.querySelector('[data-error="custodyStartDate"]');
  const today = new Date().toISOString().slice(0, 10);
  dateError.textContent = custodyStartDate && custodyStartDate > today ? "Date cannot be in the future." : "";
  document.querySelector("#case-title").closest(".field").classList.toggle("has-error", !title);
  document.querySelector("#custody-date").closest(".field").classList.toggle("has-error", Boolean(dateError.textContent));
  if (!title || dateError.textContent) {
    document.querySelector(!title ? "#case-title" : "#custody-date").focus();
    return;
  }
  const charges = [...form.querySelectorAll(".charge-entry")].map((entry) => {
    const inputs = entry.querySelectorAll("input");
    return { statute: inputs[0].value.trim(), section: inputs[1].value.trim(), description: inputs[2].value.trim() };
  }).filter((charge) => charge.statute || charge.section || charge.description);
  const values = { title, reference: String(data.get("reference") || "").trim(), jurisdiction: String(data.get("jurisdiction") || "").trim(), status: String(data.get("status") || "In progress"), custodyStartDate, notes: String(data.get("notes") || "").trim(), charges };
  const id = form.dataset.id;
  if (id) {
    const old = getCase(id);
    Object.assign(old, values);
    routeTo("detail", id);
    showToast("Case changes saved for this session.");
  } else {
    const newCase = { ...values, id: `BR-${Date.now().toString().slice(-6)}`, checklist: checklistLabels.map(() => false) };
    cases.unshift(newCase);
    routeTo("detail", newCase.id);
    showToast("Case added to this session.");
  }
});

render();
