import { mkdirSync, readdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const defaultDatabasePath = fileURLToPath(new URL("../../../database/bail-reckoner.sqlite", import.meta.url));
const databasePath = resolve(process.env.BAIL_RECKONER_DB || defaultDatabasePath);
const migrationDirectory = fileURLToPath(new URL("../../../database/migrations/", import.meta.url));

mkdirSync(dirname(databasePath), { recursive: true });

export const database = new DatabaseSync(databasePath);
database.exec("PRAGMA foreign_keys = ON;");
database.exec("PRAGMA journal_mode = WAL;");
database.exec(`
  CREATE TABLE IF NOT EXISTS schema_migrations (
    name TEXT PRIMARY KEY,
    applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

const appliedMigrations = new Set(database.prepare("SELECT name FROM schema_migrations").all().map((row) => row.name));
const migrationFiles = readdirSync(migrationDirectory).filter((name) => name.endsWith(".sql")).sort();

for (const name of migrationFiles) {
  if (appliedMigrations.has(name)) continue;
  const sql = readFileSync(resolve(migrationDirectory, name), "utf8");
  database.exec("BEGIN;");
  try {
    database.exec(sql);
    database.prepare("INSERT INTO schema_migrations (name) VALUES (?)").run(name);
    database.exec("COMMIT;");
    console.log(`Applied database migration ${name}`);
  } catch (error) {
    database.exec("ROLLBACK;");
    throw error;
  }
}

console.log(`Using SQLite database at ${databasePath}`);
