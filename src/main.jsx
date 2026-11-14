import { useState } from "react";
import { createRoot } from "react-dom/client";

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

const checklistLabels = [
  "Confirm case reference and court details",
  "Collect available case documents",
  "Confirm custody dates and records",
  "Review next steps with a legal aid provider",
];

const fmtDate = (value) => value
  ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${value}T00:00:00`))
  : "Not recorded";

function daysInCustody(value) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  const start = Date.UTC(year, month - 1, day);
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.max(0, Math.floor((today - start) / 86400000));
}

function relativeDuration(days) {
  if (days == null) return "Not recorded";
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  const remaining = days - years * 365 - months * 30;
  const parts = [];
  if (years) parts.push(`${years} ${years === 1 ? "year" : "years"}`);
  if (months || years) parts.push(`${months} ${months === 1 ? "month" : "months"}`);
  if (!years && !months) parts.push(`${remaining} ${remaining === 1 ? "day" : "days"}`);
  return parts.join(", ");
}

function Shell({ children, current = "Cases", onDashboard }) {
  return <div className="shell">
    <aside className="sidebar" aria-label="Main navigation">
      <a className="brand" href="#" onClick={(event) => { event.preventDefault(); onDashboard?.(); }}>
        <span className="brand-mark" aria-hidden="true">B</span>
        <span className="brand-name">bail reckoner<span className="brand-sub">case workspace</span></span>
      </a>
      <div className="nav-label">Workspace</div>
      <a href="#" className={`nav-item ${current === "Cases" ? "active" : ""}`} onClick={(event) => { event.preventDefault(); onDashboard?.(); }}><span className="nav-icon" aria-hidden="true">▦</span><span className="nav-text">Cases</span></a>
      <a href="#" className="nav-item" onClick={(event) => event.preventDefault()}><span className="nav-icon" aria-hidden="true">⌕</span><span className="nav-text">Legal reference</span></a>
      <div className="sidebar-bottom">
        <div className="privacy-note"><strong>Demo workspace</strong>Sample records are stored only in this browser session. Avoid entering real personal or case information.</div>
        <div className="user-row"><div className="avatar" aria-hidden="true">LA</div><div className="user-meta"><div className="user-name">Legal Aid User</div><div className="user-role">Demo account</div></div></div>
      </div>
    </aside>
    <main className="main">
      <header className="topbar"><div className="crumb">Workspace <span aria-hidden="true">/</span> <strong>{current}</strong></div><div className="top-right"><span className="demo-pill">DEMO · SAMPLE DATA</span></div></header>
      {children}
    </main>
  </div>;
}

function Notice({ children }) {
  return <div className="notice">{children}</div>;
}

function Dashboard({ cases, query, onQuery, onCreate, onDetail, onDashboard }) {
  const filtered = cases.filter((item) => `${item.title} ${item.reference} ${item.jurisdiction}`.toLowerCase().includes(query.toLowerCase()));
  const totalCharges = cases.reduce((sum, item) => sum + item.charges.length, 0);
  return <Shell onDashboard={onDashboard}><div className="content">
    <div className="page-head"><div><div className="eyebrow">Your workspace</div><h1>Good evening</h1><p className="intro">A clear place to organize case information and preparation.</p></div><button className="button button-primary" onClick={onCreate}><span aria-hidden="true">＋</span><span className="button-text-short">New case</span></button></div>
    <section className="stats" aria-label="Workspace summary">
      <article className="stat-card"><div className="stat-top"><span>Total cases</span><span className="stat-symbol" aria-hidden="true">▦</span></div><div className="stat-value">{cases.length}</div><div className="stat-foot">In this workspace</div></article>
      <article className="stat-card"><div className="stat-top"><span>Charges recorded</span><span className="stat-symbol" aria-hidden="true">≡</span></div><div className="stat-value">{totalCharges}</div><div className="stat-foot">Across all cases</div></article>
      <article className="stat-card"><div className="stat-top"><span>Need information</span><span className="stat-symbol" aria-hidden="true">⌁</span></div><div className="stat-value">{cases.filter((item) => item.status === "Information needed").length}</div><div className="stat-foot">Case details to follow up</div></article>
    </section>
    <section className="panel"><div className="panel-head"><div><h2>Recent cases</h2><div className="panel-sub">Your case records in one place</div></div><label className="searchbox"><span className="search-symbol" aria-hidden="true">⌕</span><span className="sr-only">Search cases</span><input type="search" placeholder="Search cases..." value={query} onChange={(event) => onQuery(event.target.value)} /></label></div>
      {filtered.length ? <div className="case-list">{filtered.map((item) => <div className="case-row" key={item.id}>
        <div><button className="case-title as-link" onClick={() => onDetail(item.id)}>{item.title || "Untitled case"}</button><div className="case-ref">{item.reference || item.id}</div></div>
        <div><div className="cell-text">{item.jurisdiction || "Not specified"}</div><div className="cell-muted">Jurisdiction</div></div>
        <div><div className="cell-text">{fmtDate(item.custodyStartDate)}</div><div className="cell-muted">Custody start</div></div>
        <div><span className="status">{item.status || "In progress"}</span></div>
        <div><button className="button button-quiet button-small" onClick={() => onDetail(item.id)} aria-label={`Open ${item.title}`}>View →</button></div>
      </div>)}</div> : <div className="empty-state"><div className="empty-icon" aria-hidden="true">⌕</div><h3>{cases.length ? "No matching cases" : "No cases yet"}</h3><p>{cases.length ? "Try a different search term." : "Add a case to start organizing the details."}</p>{!cases.length && <button className="button button-primary" onClick={onCreate}>＋ Add first case</button>}</div>}
    </section>
    <Notice><strong>Demo only.</strong> This workspace helps organize information. It does not provide legal advice or determine bail eligibility. Example records are fictional and reset when you refresh.</Notice>
  </div></Shell>;
}

function ChargeFields({ charges, onChange }) {
  const update = (index, key, value) => onChange(charges.map((charge, i) => i === index ? { ...charge, [key]: value } : charge));
  const add = () => onChange([...charges, { statute: "", section: "", description: "" }]);
  const remove = (index) => onChange(charges.length > 1 ? charges.filter((_, i) => i !== index) : charges.map(() => ({ statute: "", section: "", description: "" })));
  return <section className="panel form-card"><div className="charges-head"><div><h2>Charges</h2><p>Record the charges associated with this case.</p></div><button type="button" className="button button-quiet button-small" onClick={add}>＋ Add charge</button></div><div className="charge-list">
    {charges.map((charge, index) => <div className="charge-entry" key={index}>
      <div className="field"><label htmlFor={`statute-${index}`}>Statute / Act</label><input id={`statute-${index}`} value={charge.statute} onChange={(event) => update(index, "statute", event.target.value)} placeholder="e.g. Name of Act" /></div>
      <div className="field"><label htmlFor={`section-${index}`}>Section</label><input id={`section-${index}`} value={charge.section} onChange={(event) => update(index, "section", event.target.value)} placeholder="e.g. 115(2)" /></div>
      <div className="field"><label htmlFor={`description-${index}`}>Short description <span className="optional">(optional)</span></label><input id={`description-${index}`} value={charge.description} onChange={(event) => update(index, "description", event.target.value)} placeholder="Brief offence description" /></div>
      <button type="button" className="charge-remove" onClick={() => remove(index)} aria-label={`Remove charge ${index + 1}`}>×</button>
    </div>)}
  </div></section>;
}

function CaseForm({ existing, onSave, onCancel, onDashboard }) {
  const [charges, setCharges] = useState(existing?.charges?.length ? existing.charges : [{ statute: "", section: "", description: "" }]);
  const [errors, setErrors] = useState({});
  const today = new Date().toISOString().slice(0, 10);
  function submit(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const values = {
      title: String(data.get("title") || "").trim(),
      reference: String(data.get("reference") || "").trim(),
      jurisdiction: String(data.get("jurisdiction") || "").trim(),
      status: String(data.get("status") || "In progress"),
      custodyStartDate: String(data.get("custodyStartDate") || ""),
      notes: String(data.get("notes") || "").trim(),
      charges: charges.filter((charge) => charge.statute.trim() || charge.section.trim() || charge.description.trim()).map((charge) => ({ statute: charge.statute.trim(), section: charge.section.trim(), description: charge.description.trim() })),
    };
    const nextErrors = {};
    if (!values.title) nextErrors.title = "Enter a case title.";
    if (values.custodyStartDate && values.custodyStartDate > today) nextErrors.custodyStartDate = "Date cannot be in the future.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      document.querySelector(nextErrors.title ? "#case-title" : "#custody-date")?.focus();
      return;
    }
    onSave(values);
  }
  return <Shell onDashboard={onDashboard}><div className="content"><div className="form-wrap">
    <div className="page-head"><div><div className="eyebrow">Case workspace</div><h1>{existing ? "Edit case" : "Add a case"}</h1><p className="intro">Enter the case information you have. You can update it later.</p></div></div>
    <form onSubmit={submit} noValidate>
      <section className="panel form-card"><h2>Case details</h2><p>Basic information to help identify and organize this record.</p><div className="form-grid">
        <div className={`field ${errors.title ? "has-error" : ""}`}><label htmlFor="case-title">Case title <span aria-hidden="true">*</span></label><input id="case-title" name="title" required maxLength="120" defaultValue={existing?.title || ""} placeholder="e.g. State vs. Name" autoComplete="off" aria-invalid={Boolean(errors.title)} aria-describedby="title-error" /><span className="field-error" id="title-error">{errors.title}</span></div>
        <div className="field"><label htmlFor="case-ref">Case reference <span className="optional">(optional)</span></label><input id="case-ref" name="reference" maxLength="80" defaultValue={existing?.reference || ""} placeholder="e.g. CRL.MC. 1842 / 2025" /></div>
        <div className="field"><label htmlFor="jurisdiction">Court / jurisdiction <span className="optional">(optional)</span></label><input id="jurisdiction" name="jurisdiction" maxLength="120" defaultValue={existing?.jurisdiction || ""} placeholder="e.g. District Court, Pune" /></div>
        <div className="field"><label htmlFor="case-status">Status</label><select id="case-status" name="status" defaultValue={existing?.status || "In progress"}><option>In progress</option><option>Information needed</option><option>Ready for review</option></select></div>
        <div className={`field ${errors.custodyStartDate ? "has-error" : ""}`}><label htmlFor="custody-date">Custody start date <span className="optional">(if known)</span></label><input id="custody-date" name="custodyStartDate" type="date" max={today} defaultValue={existing?.custodyStartDate || ""} aria-invalid={Boolean(errors.custodyStartDate)} aria-describedby="custody-error" /><span className="field-error" id="custody-error">{errors.custodyStartDate}</span></div>
        <div className="field full"><label htmlFor="case-notes">Notes <span className="optional">(optional)</span></label><textarea id="case-notes" name="notes" maxLength="1200" defaultValue={existing?.notes || ""} placeholder="Add brief context or follow-up notes" /></div>
      </div></section>
      <ChargeFields charges={charges} onChange={setCharges} />
      <div className="form-actions"><span className="small-note">* Required field</span><div className="actions-right"><button type="button" className="button button-quiet" onClick={onCancel}>Cancel</button><button type="submit" className="button button-primary">{existing ? "Save changes" : "Create case"}</button></div></div>
    </form>
  </div></div></Shell>;
}

function DetailPage({ item, onBack, onEdit, onDelete, onChecklist, onDashboard }) {
  if (!item) return null;
  const elapsed = daysInCustody(item.custodyStartDate);
  return <Shell onDashboard={onDashboard}><div className="content">
    <div className="page-head"><div><div className="eyebrow"><button className="eyebrow-link" onClick={onBack}>Cases</button> / Case overview</div><h1>{item.title || "Untitled case"}</h1><p className="intro">{item.reference || item.id} <span aria-hidden="true">·</span> {item.jurisdiction || "Jurisdiction not specified"}</p></div><div className="actions-right"><button className="button button-quiet" onClick={onDelete}>Delete</button><button className="button button-primary" onClick={onEdit}>Edit case</button></div></div>
    <div className="detail-grid"><div>
      <section className="panel detail-card"><h2>Case information</h2><div className="detail-fields"><div><div className="detail-label">Status</div><span className="status">{item.status}</span></div><div><div className="detail-label">Case reference</div><div className="detail-value">{item.reference || "Not recorded"}</div></div><div><div className="detail-label">Court / jurisdiction</div><div className="detail-value">{item.jurisdiction || "Not recorded"}</div></div><div><div className="detail-label">Custody start date</div><div className="detail-value">{fmtDate(item.custodyStartDate)}</div></div><div className="full"><div className="detail-label">Notes</div><div className="detail-value notes">{item.notes || "No notes added."}</div></div></div></section>
      <section className="panel detail-card"><h2>Charges <span className="cell-muted">({item.charges.length})</span></h2>{item.charges.length ? item.charges.map((charge, index) => <div className="charge-detail" key={`${charge.section}-${index}`}><div className="charge-index">{index + 1}</div><div><div className="charge-name">{charge.description || "Charge"}</div><div className="charge-meta">{charge.statute || "Act not specified"}{charge.section ? ` · Section ${charge.section}` : ""}</div></div></div>) : <div className="small-note">No charges recorded.</div>}</section>
      <section className="panel detail-card"><h2>Custody timeline</h2><div className="timeline"><span className="timeline-dot" aria-hidden="true"></span><div><div className="timeline-title">Custody started</div><div className="timeline-date">{fmtDate(item.custodyStartDate)}</div></div></div><div className="duration-box"><div className="duration-number">{relativeDuration(elapsed)}</div><div className="duration-caption">Elapsed since the recorded custody start date{elapsed != null ? ` · ${elapsed} days` : ""}</div></div></section>
    </div><aside className="detail-side"><section className="panel detail-card"><h2>Preparation checklist</h2><div className="checklist">{checklistLabels.map((label, index) => <label className="check-row" key={label}><input type="checkbox" checked={Boolean(item.checklist?.[index])} onChange={(event) => onChecklist(index, event.target.checked)} /><span>{label}</span></label>)}</div><div className="check-help">These are general organization prompts, not a complete list of legal requirements. Review next steps with a qualified legal aid provider.</div></section><section className="panel detail-card"><h2>About this record</h2><div className="detail-label">Created for</div><div className="detail-value detail-gap">Demo workspace</div><div className="detail-label">Data source</div><div className="detail-value">Fictional sample information</div><div className="check-help">Information entered here stays in this browser session and resets when the page is refreshed.</div></section></aside></div>
    <Notice><strong>Informational only.</strong> This page organizes case information and calculates elapsed time from the recorded date. It does not assess legal eligibility or predict a bail outcome.</Notice>
  </div></Shell>;
}

function App() {
  const [cases, setCases] = useState(initialCases);
  const [page, setPage] = useState("dashboard");
  const [selectedId, setSelectedId] = useState(null);
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState("");
  const selected = cases.find((item) => item.id === selectedId) || null;
  const go = (nextPage, id = null) => { setPage(nextPage); setSelectedId(id); setQuery(""); window.scrollTo(0, 0); };
  const notify = (message) => { setToast(message); window.setTimeout(() => setToast(""), 2400); };
  const save = (values) => {
    if (selectedId) {
      setCases((current) => current.map((item) => item.id === selectedId ? { ...item, ...values } : item));
      go("detail", selectedId);
      notify("Case changes saved for this session.");
    } else {
      const item = { ...values, id: `BR-${Date.now().toString().slice(-6)}`, checklist: checklistLabels.map(() => false) };
      setCases((current) => [item, ...current]);
      go("detail", item.id);
      notify("Case added to this session.");
    }
  };
  const deleteCase = () => {
    if (!selected || !window.confirm(`Delete “${selected.title}” from this demo session?`)) return;
    setCases((current) => current.filter((item) => item.id !== selected.id));
    go("dashboard");
    notify("Case deleted from this session.");
  };
  const updateChecklist = (index, checked) => setCases((current) => current.map((item) => item.id === selectedId ? { ...item, checklist: item.checklist.map((value, i) => i === index ? checked : value) } : item));

  let view;
  if (page === "form") view = <CaseForm key={selectedId || "new"} existing={selected} onSave={save} onCancel={() => go(selected ? "detail" : "dashboard", selected?.id || null)} onDashboard={() => go("dashboard")} />;
  else if (page === "detail") view = selected ? <DetailPage item={selected} onBack={() => go("dashboard")} onEdit={() => go("form", selected.id)} onDelete={deleteCase} onChecklist={updateChecklist} onDashboard={() => go("dashboard")} /> : <Dashboard cases={cases} query={query} onQuery={setQuery} onCreate={() => go("form")} onDetail={(id) => go("detail", id)} onDashboard={() => go("dashboard")} />;
  else view = <Dashboard cases={cases} query={query} onQuery={setQuery} onCreate={() => go("form")} onDetail={(id) => go("detail", id)} onDashboard={() => go("dashboard")} />;

  return <>{view}<div className={`toast ${toast ? "show" : ""}`} role="status" aria-live="polite">{toast}</div></>;
}

createRoot(document.getElementById("app")).render(<App />);
