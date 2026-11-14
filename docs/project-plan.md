# Bail Reckoner — Basic Full-Stack App Plan

## 1. Project overview

Bail Reckoner is a basic web application to help a user record an undertrial case, its charges, and custody dates, then view an organized case summary and a simple preparation checklist. The initial version is an educational/demo MVP, not a production legal decision system.

The project brief in the supplied image is the source of the product idea. It mentions legal eligibility rules, multiple statutes, judicial discretion, and court workflows. Those are not assumed to be verified legal rules. This MVP will not decide whether someone should receive bail, predict a judge's decision, or claim comprehensive coverage of Indian law. Any legal information included must be clearly identified as sample/reference content and verified before being presented as authoritative.

## 2. MVP scope

### Include

- A clean, responsive frontend with a home/dashboard view and case create, list, detail, and edit screens.
- Basic case fields: case title/reference, court or jurisdiction (free text), person/case notes, case status, charges, and custody start date.
- Multiple charges per case, entered as statute, section, and short description.
- A backend API to create, read, update, and delete cases, with validation and clear error responses.
- A database to persist cases and their charges.
- A custody-duration display based on the recorded start date, with the date used shown clearly.
- A basic case summary and user-editable bail preparation checklist.
- A simple local/demo setup and a documented deployment path.

### Leave out of the first version

- Automated bail eligibility determinations or legal advice.
- Comprehensive or automatically updated statute/penalty database.
- Risk scoring for flight, witness influence, or likelihood of bail.
- Identity-document storage, payments, messaging, e-filing, or court-system integration.
- Production handling of sensitive real case data until privacy, security, legal, and operational requirements are reviewed.

## 3. Basic quality requirements

- Keep navigation and forms understandable for a first-time user.
- Validate required fields and dates in both frontend and backend.
- Show helpful loading, success, empty, and error states.
- Make the app usable on mobile and by keyboard; use labels and accessible contrast.
- Keep secrets out of source control and use environment configuration.
- Keep the frontend, API, and data access responsibilities clearly separated.
- Use sample data for development and demonstrations.

## 4. Four-phase implementation plan

### Phase 1 — Frontend

1. Review the repository and choose a frontend framework and styling approach that fit its existing setup; if none exists, establish a small, maintainable web app structure.
2. Create the shared page layout, navigation, responsive styling, and reusable form, button, and feedback components.
3. Build a dashboard with a welcome/overview area, a case list, empty state, and an obvious “Add case” action.
4. Build a case form for the basic case fields, custody start date, notes, and one or more charges.
5. Build case detail and edit views showing case information, charges, custody duration, and checklist.
6. Add client-side required-field/date validation and clear loading, success, and error states. Use temporary in-memory/mock data until the API is ready.
7. Check the layouts at desktop and mobile widths and ensure forms can be completed using a keyboard.

**Phase 1 outcome:** All main screens and flows are navigable using mock data, with no backend dependency.

### Phase 2 — Backend and frontend integration

1. Choose and configure a backend framework consistent with the repository; define a clear API base path and local development command.
2. Implement case API endpoints for list, detail, create, update, and delete.
3. Define request and response shapes for cases and their charges; validate input on the server and return useful status codes and messages.
4. Add custody-duration calculation as a simple date-based utility and return/display the source date and result. Do not turn this calculation into a legal eligibility conclusion.
5. Add centralized error handling, basic request logging, and configuration through environment variables.
6. Connect the frontend screens to the API, replacing mock data. Support refresh/loading, empty, success, and error states.
7. Ensure forms submit to the API and the dashboard/detail views refresh from persisted API responses.

**Phase 2 outcome:** The frontend can perform the main case workflow through a working API. During development, the API may temporarily use in-memory data until Phase 3.

### Phase 3 — Database and integration

1. Select a database suitable for a small app and the expected hosting environment; document how to run it locally.
2. Define a minimal schema with `Case` and `Charge` records. A case has many charges; charges belong to one case.
3. Add migrations/schema setup and a small synthetic seed dataset for local development.
4. Implement backend data-access functions and replace temporary in-memory storage with database reads/writes.
5. Add constraints and validation for required fields, date formats, and case-to-charge relationships.
6. Verify create, list, detail, update, and delete behavior against the database, including cases with multiple charges and cases with no charges.
7. Document database configuration and provide a safe reset/seed procedure for development data.

**Phase 3 outcome:** Case records persist in the database and the existing API/frontend workflow works with stored data.

### Phase 4 — Testing and deployment

1. Add focused tests for form validation, API validation/error handling, custody-duration calculation, and database-backed case/charge operations.
2. Run the full app locally from documented setup instructions and verify the primary flow: create a case, add multiple charges, view it, edit it, and delete it.
3. Check mobile layout, keyboard navigation, required labels, and user-visible error/empty states.
4. Fix discovered issues and remove development-only sample credentials or unsafe configuration.
5. Prepare deployment configuration for the selected hosting platform, including environment variables and database connection settings.
6. Deploy the frontend, backend, and database using the chosen platform's supported setup; configure HTTPS and avoid committing secrets.
7. Add a short README section covering local setup, migrations/seeding, test commands, deployment steps, and current MVP limitations.

**Phase 4 outcome:** A tested, documented basic app is deployable, with limitations visible to users and maintainers.

## 5. Initial data model

### Case

- `id`
- `title` or `caseReference`
- `jurisdiction` (free text)
- `status`
- `custodyStartDate` (optional until known)
- `notes` (optional)
- `createdAt`, `updatedAt`

### Charge

- `id`
- `caseId`
- `statute` (free text)
- `section` (free text)
- `description` (optional)

### Checklist item

For the MVP, checklist items may be stored as a simple list associated with a case, or kept in the frontend if persistence is not required for the first demo. Checklist text should be framed as preparation prompts, not a complete statement of legal procedure.

## 6. Suggested basic architecture

- **Frontend:** Responsive React single-page app built with Vite, with separate components for dashboard, case form, and case detail.
- **Backend:** Small REST API responsible for validation, case/charge operations, date calculation, and errors.
- **Database:** Relational database with a one-to-many relationship from cases to charges.
- **Integration:** Frontend communicates with the backend over JSON HTTP endpoints; backend accesses the database through a small data-access layer.

For the Phase 2 integration milestone, the API uses temporary in-memory storage. Phase 3 replaces that storage with the database; restarting the API currently resets records.

This repository uses React with Vite for the frontend and Express for the API. The relational database choice is deferred to Phase 3. Keep the implementation easy to run locally and avoid adding services the MVP does not need.

## 7. MVP acceptance criteria

- A user can view the dashboard and create, open, edit, and delete a case.
- A case can include zero or more charges, including multiple charges.
- Invalid or missing required inputs receive understandable validation feedback.
- Case data remains available after refreshing/restarting the app when connected to the database.
- Custody duration is calculated from the recorded start date and displayed as elapsed time only.
- The preparation checklist is editable or clearly presented as a simple prompt list.
- The interface has usable desktop and mobile layouts and can be navigated by keyboard.
- The app does not label its output as legal advice, an eligibility decision, or a prediction of a bail outcome.
- Setup, testing, database initialization, and deployment steps are documented.
