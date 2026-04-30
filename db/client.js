import { readFileSync, writeFileSync, renameSync, existsSync, mkdirSync } from "fs";
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

  applyColumnMigrations(_db);

  return _db;
}

/**
 * Run ALTER TABLE migrations that can't be expressed as CREATE IF NOT EXISTS.
 * Each entry is guarded by a row in the _migrations table so it only runs once.
 */
function applyColumnMigrations(db) {
  const pending = [
    { name: "001_photo_name", sql: "ALTER TABLE item_records ADD COLUMN photo_name TEXT" },
    { name: "002_rate_limits", sql: null }, // table created via main migration, no ALTER needed
  ];

  for (const { name, sql } of pending) {
    if (!sql) continue;
    const stmt = db.prepare("SELECT name FROM _migrations WHERE name = ?");
    stmt.bind([name]);
    const already = stmt.step();
    stmt.free();
    if (already) continue;

    try {
      db.run(sql);
    } catch {
      // Column may already exist on a freshly created DB — ignore duplicate column errors
    }
    db.run("INSERT OR IGNORE INTO _migrations (name) VALUES (?)", [name]);
  }
}

const PERSIST_RETRIES = 3;

/**
 * Persist in-memory database to disk atomically.
 * Writes to a temp file first, then renames over the target — so a crash
 * mid-write never leaves a corrupt or truncated database file.
 * Retries up to PERSIST_RETRIES times on transient I/O errors.
 */
export function persist() {
  if (!_db) return;
  const data = _db.export();
  const tmp = DB_PATH + ".tmp";
  let lastErr;
  for (let i = 0; i < PERSIST_RETRIES; i++) {
    try {
      writeFileSync(tmp, Buffer.from(data));
      renameSync(tmp, DB_PATH);
      return;
    } catch (err) {
      lastErr = err;
    }
  }
  throw new Error(`persist() failed after ${PERSIST_RETRIES} attempts: ${lastErr?.message}`);
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
