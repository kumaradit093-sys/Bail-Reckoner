CREATE TABLE cases (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  reference TEXT NOT NULL DEFAULT '',
  jurisdiction TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL CHECK (status IN ('In progress', 'Information needed', 'Ready for review')),
  custody_start_date TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE charges (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  case_id TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  statute TEXT NOT NULL DEFAULT '',
  section TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  position INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX charges_case_id_idx ON charges(case_id);

CREATE TABLE checklist_items (
  case_id TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  position INTEGER NOT NULL CHECK (position BETWEEN 0 AND 3),
  checked BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (case_id, position)
);
