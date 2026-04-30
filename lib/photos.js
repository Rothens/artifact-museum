/**
 * Central photo storage abstraction.
 *
 * PHOTO_STORAGE=db  (default) — photo bytes stay in the SQLite column as a
 *                               data URL. Simple, self-contained, but bloats
 *                               the DB file and slows persist() on large photos.
 *
 * PHOTO_STORAGE=fs            — photo bytes are written to data/photos/ on the
 *                               filesystem. The DB column stores a server-relative
 *                               URL (/api/photos/<itemId>) instead. A 400 px wide
 *                               WebP thumbnail is generated alongside the full image.
 *
 * All write paths (import, sync, admin upload) call savePhoto().
 * All delete paths call deletePhoto().
 * Everything else (rendering) just uses the value in photo_data_url as an <img src>.
 */

import { readFileSync, writeFileSync, rmSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PHOTO_DIR = join(__dirname, "..", "data", "photos");

export function photoStorageMode() {
  return process.env.PHOTO_STORAGE === "fs" ? "fs" : "db";
}

function ensurePhotoDir() {
  mkdirSync(PHOTO_DIR, { recursive: true });
}

/** Derive the file extension from a data URL mime type. */
function extFromDataUrl(dataUrl) {
  const mime = dataUrl.slice(5, dataUrl.indexOf(";"));
  const map = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/avif": ".avif",
  };
  return map[mime] ?? ".jpg";
}

/** Decode a data URL to a Buffer. */
function dataUrlToBuffer(dataUrl) {
  const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
  return Buffer.from(base64, "base64");
}

/** Read a stored photo file back as a data URL (used for export). */
export function readPhotoAsDataUrl(itemId) {
  // Try common extensions
  for (const ext of [".jpg", ".png", ".webp", ".gif", ".avif"]) {
    const p = join(PHOTO_DIR, `${itemId}${ext}`);
    if (existsSync(p)) {
      const buf = readFileSync(p);
      const mime = ext === ".jpg" ? "image/jpeg"
        : ext === ".png" ? "image/png"
        : ext === ".webp" ? "image/webp"
        : ext === ".gif" ? "image/gif"
        : "image/avif";
      return `data:${mime};base64,${buf.toString("base64")}`;
    }
  }
  return null;
}

/** Return the absolute path and content-type for a stored photo, or null. */
export function resolvePhotoFile(itemId) {
  const entries = [
    { ext: ".jpg", mime: "image/jpeg" },
    { ext: ".png", mime: "image/png" },
    { ext: ".webp", mime: "image/webp" },
    { ext: ".gif", mime: "image/gif" },
    { ext: ".avif", mime: "image/avif" },
  ];
  for (const { ext, mime } of entries) {
    const full = join(PHOTO_DIR, `${itemId}${ext}`);
    if (existsSync(full)) return { path: full, mime };
  }
  return null;
}

/** Return the absolute path for the thumbnail, or null if it doesn't exist. */
export function resolveThumbFile(itemId) {
  const p = join(PHOTO_DIR, `${itemId}_thumb.webp`);
  return existsSync(p) ? { path: p, mime: "image/webp" } : null;
}

/**
 * Save a photo (given as a data URL) for an item.
 *
 * In "db" mode: returns the data URL unchanged — caller stores it as-is.
 * In "fs" mode: writes full image + WebP thumbnail to disk, returns the
 *               server-relative URL "/api/photos/<itemId>" for DB storage.
 *
 * @param {string} itemId
 * @param {string} dataUrl  Must start with "data:image/..."
 * @returns {Promise<string>}  Value to store in photo_data_url column
 */
export async function savePhoto(itemId, dataUrl) {
  if (photoStorageMode() === "db") return dataUrl;

  ensurePhotoDir();

  const ext = extFromDataUrl(dataUrl);
  const buf = dataUrlToBuffer(dataUrl);
  const fullPath = join(PHOTO_DIR, `${itemId}${ext}`);
  const thumbPath = join(PHOTO_DIR, `${itemId}_thumb.webp`);

  // Write full-size image
  writeFileSync(fullPath, buf);

  // Generate thumbnail with sharp (already present as a Next.js dependency)
  try {
    const sharp = (await import("sharp")).default;
    await sharp(buf)
      .resize(400, null, { withoutEnlargement: true })
      .webp({ quality: 75 })
      .toFile(thumbPath);
  } catch {
    // Thumbnail generation is best-effort — don't fail the whole save
  }

  return `/api/photos/${itemId}`;
}

/**
 * Delete stored photo files for an item (fs mode only).
 * Safe to call in db mode — does nothing.
 */
export function deletePhoto(itemId) {
  if (photoStorageMode() === "db") return;

  for (const ext of [".jpg", ".png", ".webp", ".gif", ".avif"]) {
    const p = join(PHOTO_DIR, `${itemId}${ext}`);
    if (existsSync(p)) rmSync(p);
  }
  const thumb = join(PHOTO_DIR, `${itemId}_thumb.webp`);
  if (existsSync(thumb)) rmSync(thumb);
}
