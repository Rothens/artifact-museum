import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

// sql.js must be loaded via require() — its CJS initializer sets module.exports
// in a way that breaks when bundled through webpack's ESM transformer.
const require = createRequire(import.meta.url);
const initSqlJs = require("sql.js");

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH || join(process.cwd(), "data", "museum.db");

mkdirSync(dirname(DB_PATH), { recursive: true });

let _db = null;
let _SQL = null;

async function init() {
  if (_db) return _db;

  _SQL = await initSqlJs();

  if (existsSync(DB_PATH)) {
    const fileBuffer = readFileSync(DB_PATH);
    _db = new _SQL.Database(fileBuffer);
  } else {
    _db = new _SQL.Database();
  }

  const migration = readFileSync(
    join(__dirname, "..", "migrations", "001_initial.sql"),
    "utf8"
  );
  _db.run(migration);
  _db.run("PRAGMA foreign_keys = ON");

  return _db;
}

/** Persist in-memory database to disk. Call after every write. */
export function persist() {
  if (!_db) return;
  const data = _db.export();
  writeFileSync(DB_PATH, Buffer.from(data));
}

/**
 * Get the synchronous db handle. Must call await getDb() at least once first.
 * In Next.js Server Components/Actions, use getDb() directly (it returns a promise).
 */
export async function getDb() {
  return init();
}

/**
 * Synchronous getter — only safe after the first await getDb() call has resolved.
 * Used internally by lib helpers that are called from already-awaited contexts.
 */
export function getDbSync() {
  if (!_db) throw new Error("Database not initialized. Call await getDb() first.");
  return _db;
}
