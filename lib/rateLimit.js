/**
 * SQLite-backed rate limiter for server actions.
 * Tracks failed login attempts per key (e.g. IP address).
 * Survives server restarts; safe for single-instance deployments.
 */
import { getDbSync, persist } from "../db/client.js";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export function checkRateLimit(key) {
  const now = Date.now();
  const db = getDbSync();
  const stmt = db.prepare("SELECT count, reset_at FROM rate_limits WHERE key = ?");
  stmt.bind([key]);
  const row = stmt.step() ? stmt.getAsObject() : null;
  stmt.free();

  if (!row || now > row.reset_at) {
    return { allowed: true };
  }

  if (row.count >= MAX_ATTEMPTS) {
    const retryAfterSec = Math.ceil((row.reset_at - now) / 1000);
    return { allowed: false, retryAfterSec };
  }

  return { allowed: true };
}

export function recordFailedAttempt(key) {
  const now = Date.now();
  const resetAt = now + WINDOW_MS;
  const db = getDbSync();

  // Upsert: insert or increment. If the window has expired, reset the count.
  db.run(
    `INSERT INTO rate_limits (key, count, reset_at) VALUES (?, 1, ?)
     ON CONFLICT(key) DO UPDATE SET
       count    = CASE WHEN reset_at <= ? THEN 1 ELSE count + 1 END,
       reset_at = CASE WHEN reset_at <= ? THEN ? ELSE reset_at END`,
    [key, resetAt, now, now, resetAt]
  );
  persist();
}

export function clearAttempts(key) {
  getDbSync().run("DELETE FROM rate_limits WHERE key = ?", [key]);
  persist();
}
