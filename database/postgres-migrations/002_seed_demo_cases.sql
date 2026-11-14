INSERT INTO cases (id, title, reference, jurisdiction, status, custody_start_date, notes, created_at) VALUES
  ('BR-24018', 'State vs. Arjun Mehta', 'CRL.MC. 1842 / 2024', 'District Court, Pune', 'In progress', '2025-02-12', 'Case details entered for demonstration purposes.', '2025-01-03 10:00:00+00'),
  ('BR-24012', 'State vs. Priya Nair', 'C.C. 762 / 2025', 'JMFC Court, Kochi', 'Information needed', '2025-08-04', 'Confirm next hearing date with the legal aid provider.', '2025-01-02 10:00:00+00'),
  ('BR-23986', 'State vs. Rohan Das', 'G.R. 319 / 2025', 'Sessions Court, Kolkata', 'In progress', '2025-05-21', 'Sample record. Verify all case facts before relying on them.', '2025-01-01 10:00:00+00');

INSERT INTO charges (case_id, statute, section, description, position) VALUES
  ('BR-24018', 'Bharatiya Nyaya Sanhita', '115(2)', 'Voluntarily causing hurt', 0),
  ('BR-24018', 'Bharatiya Nyaya Sanhita', '351(2)', 'Criminal intimidation', 1),
  ('BR-24012', 'Information Technology Act', '66C', 'Identity theft', 0),
  ('BR-23986', 'Bharatiya Nyaya Sanhita', '303(2)', 'Theft', 0);

INSERT INTO checklist_items (case_id, position, checked) VALUES
  ('BR-24018', 0, FALSE), ('BR-24018', 1, TRUE), ('BR-24018', 2, FALSE), ('BR-24018', 3, FALSE),
  ('BR-24012', 0, TRUE), ('BR-24012', 1, FALSE), ('BR-24012', 2, FALSE), ('BR-24012', 3, FALSE),
  ('BR-23986', 0, FALSE), ('BR-23986', 1, FALSE), ('BR-23986', 2, FALSE), ('BR-23986', 3, FALSE);
