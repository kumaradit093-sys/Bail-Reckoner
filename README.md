# Bail Reckoner

A basic frontend prototype for organizing undertrial case information. It currently uses fictional sample records and in-memory browser state; changes reset when the page is refreshed. Do not enter real personal or case information.

## Run the frontend

From the repository root, start any static HTTP server. For example:

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000>. The frontend has no backend or database yet.

## Current scope

The prototype includes a case dashboard, search, create/edit/detail flows, multiple charges, elapsed custody duration, and a basic editable preparation checklist. It does not provide legal advice, determine bail eligibility, or predict a bail outcome.
