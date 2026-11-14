import { mkdirSync, readdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const sqliteMigrations = fileURLToPath(new URL("../../../database/migrations/", import.meta.url));
const postgresMigrations = fileURLToPath(new URL("../../../database/postgres-migrations/", import.meta.url));
const usePostgres = Boolean(process.env.DATABASE_URL);

let sqlite;
let pool;

if (usePostgres) {
  const { Pool } = await import("pg");
  pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5, idleTimeoutMillis: 30_000 });
  pool.on("error", (error) => console.error("Unexpected idle PostgreSQL client error", error));
} else {
  const defaultDatabasePath = fileURLToPath(new URL("../../../database/bail-reckoner.sqlite", import.meta.url));
  const databasePath = resolve(process.env.BAIL_RECKONER_DB || defaultDatabasePath);
  mkdirSync(dirname(databasePath), { recursive: true });
  sqlite = new DatabaseSync(databasePath);
  sqlite.exec("PRAGMA foreign_keys = ON;");
  sqlite.exec("PRAGMA journal_mode = WAL;");
}

export const database = sqlite;
export const databaseType = usePostgres ? "postgres" : "sqlite";

function sqliteSql(sql) {
  return sql.replace(/\$(\d+)/g, "?$1");
}

export async function query(sql, params = [], client = null) {
  if (usePostgres) {
    const result = await (client || pool).query(sql, params);
    return { rows: result.rows, rowCount: result.rowCount };
  }
  const statement = sqlite.prepare(sqliteSql(sql));
  if (/^\s*(SELECT|WITH|PRAGMA)\b/i.test(sql)) {
    const rows = statement.all(...params);
    return { rows, rowCount: rows.length };
  }
  const result = statement.run(...params);
  return { rows: [], rowCount: result.changes };
}

export async function transaction(work) {
  if (usePostgres) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const result = await work((sql, params = []) => query(sql, params, client));
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
  sqlite.exec("BEGIN IMMEDIATE");
  try {
    const result = await work(query);
    sqlite.exec("COMMIT");
    return result;
  } catch (error) {
    sqlite.exec("ROLLBACK");
    throw error;
  }
}

async function migratePostgres() {
  await pool.query(`CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
  const { rows } = await pool.query("SELECT name FROM schema_migrations");
  const applied = new Set(rows.map(({ name }) => name));
  for (const name of readdirSync(postgresMigrations).filter((file) => file.endsWith(".sql")).sort()) {
    if (applied.has(name)) continue;
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(readFileSync(resolve(postgresMigrations, name), "utf8"));
      await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [name]);
      await client.query("COMMIT");
      console.log(`Applied PostgreSQL migration ${name}`);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}

async function migrateSqlite() {
  sqlite.exec(`CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);`);
  const applied = new Set(sqlite.prepare("SELECT name FROM schema_migrations").all().map(({ name }) => name));
  for (const name of readdirSync(sqliteMigrations).filter((file) => file.endsWith(".sql")).sort()) {
    if (applied.has(name)) continue;
    sqlite.exec("BEGIN");
    try {
      sqlite.exec(readFileSync(resolve(sqliteMigrations, name), "utf8"));
      sqlite.prepare("INSERT INTO schema_migrations (name) VALUES (?)").run(name);
      sqlite.exec("COMMIT");
      console.log(`Applied SQLite migration ${name}`);
    } catch (error) {
      sqlite.exec("ROLLBACK");
      throw error;
    }
  }
}

if (usePostgres) {
  await migratePostgres();
  console.log("Connected to PostgreSQL database");
} else {
  await migrateSqlite();
  console.log("Using local SQLite database");
}

export async function closeDatabase() {
  if (pool) await pool.end();
  if (sqlite?.isOpen) sqlite.close();
}
