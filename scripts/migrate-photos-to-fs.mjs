/**
 * One-time migration: extract photo data URLs from SQLite → data/photos/
 *
 * Run ONCE after setting PHOTO_STORAGE=fs in .env.local:
 *   node scripts/migrate-photos-to-fs.mjs
 *
 * Safe to re-run — already-migrated rows (photo_data_url starts with /api/photos/)
 * are skipped automatically.
 *
 * The script reads .env.local for DB_PATH if set, otherwise uses ./data/museum.db.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// Load .env.local manually (no dotenv dependency needed)
function loadEnv() {
  const envPath = join(ROOT, ".env.local");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnv();

const DB_PATH = process.env.DB_PATH ?? join(ROOT, "data", "museum.db");
const PHOTO_DIR = join(ROOT, "data", "photos");

if (!existsSync(DB_PATH)) {
  console.error(`Database not found at ${DB_PATH}`);
  process.exit(1);
}

mkdirSync(PHOTO_DIR, { recursive: true });

const require = createRequire(import.meta.url);
const initSqlJs = require(join(ROOT, "node_modules", "sql.js"));
const SQL = await initSqlJs();
const db = new SQL.Database(readFileSync(DB_PATH));

// Fetch all items that still have a data URL photo
const stmt = db.prepare(
  "SELECT id, photo_data_url FROM item_records WHERE photo_data_url IS NOT NULL AND photo_data_url != ''"
);

const items = [];
while (stmt.step()) {
  const row = stmt.getAsObject();
  items.push(row);
}
stmt.free();

if (items.length === 0) {
  console.log("No photos found in database.");
  process.exit(0);
}

console.log(`Found ${items.length} items with photos.`);

let migrated = 0;
let skipped = 0;
let errors = 0;

// Lazy-load sharp
let sharp;
try {
  sharp = (await import("sharp")).default;
} catch {
  console.warn("Warning: sharp not available — thumbnails will not be generated.");
}

for (const item of items) {
  const { id, photo_data_url } = item;

  if (photo_data_url.startsWith("/api/photos/")) {
    skipped++;
    continue;
  }

  if (!photo_data_url.startsWith("data:image/")) {
    console.warn(`  [SKIP] ${id}: unexpected photo_data_url format`);
    skipped++;
    continue;
  }

  try {
    // Decode mime type and extension
    const mime = photo_data_url.slice(5, photo_data_url.indexOf(";"));
    const extMap = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
      "image/gif": ".gif",
      "image/avif": ".avif",
    };
    const ext = extMap[mime] ?? ".jpg";

    const base64 = photo_data_url.slice(photo_data_url.indexOf(",") + 1);
    const buf = Buffer.from(base64, "base64");

    // Write full-size image
    const fullPath = join(PHOTO_DIR, `${id}${ext}`);
    writeFileSync(fullPath, buf);

    // Generate thumbnail
    if (sharp) {
      const thumbPath = join(PHOTO_DIR, `${id}_thumb.webp`);
      await sharp(buf)
        .resize(400, null, { withoutEnlargement: true })
        .webp({ quality: 75 })
        .toFile(thumbPath);
    }

    // Update DB row to store the server-relative URL
    db.run(
      "UPDATE item_records SET photo_data_url = ? WHERE id = ?",
      [`/api/photos/${id}`, id]
    );

    migrated++;
    process.stdout.write(`  [OK]   ${id}${ext} (${(buf.length / 1024).toFixed(0)} KB)\n`);
  } catch (err) {
    errors++;
    console.error(`  [ERR]  ${id}: ${err.message}`);
  }
}

// Persist updated DB
if (migrated > 0) {
  const data = db.export();
  const tmp = DB_PATH + ".tmp";
  writeFileSync(tmp, Buffer.from(data));
  // Atomic rename
  const { renameSync } = await import("fs");
  renameSync(tmp, DB_PATH);
  console.log(`\nDatabase saved.`);
}

db.close();

console.log(`\nDone. Migrated: ${migrated}  Skipped: ${skipped}  Errors: ${errors}`);
if (errors > 0) process.exit(1);
