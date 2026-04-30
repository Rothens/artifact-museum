import { createHash, randomBytes, timingSafeEqual } from "crypto";
import { getDbSync, persist } from "../../db/client.js";
import { queryAll, queryOne } from "./query.js";

function hashToken(raw) {
  return createHash("sha256").update(raw).digest("hex");
}

/** Generate a cryptographically random token string (32 bytes = 64 hex chars). */
export function generateRawToken() {
  return randomBytes(32).toString("hex");
}

/**
 * Create a new API token. Returns { id, name, rawToken } — rawToken is shown
 * once and never stored; only its hash is persisted.
 */
export function createToken(name) {
  const raw = generateRawToken();
  const id = randomBytes(16).toString("hex");
  const hash = hashToken(raw);
  const db = getDbSync();
  db.run(
    "INSERT INTO api_tokens (id, name, token_hash, created_at) VALUES (?, ?, ?, datetime('now'))",
    [id, name, hash]
  );
  persist();
  return { id, name, rawToken: raw };
}

/** List all tokens (without hashes). */
export function listTokens() {
  return queryAll("SELECT id, name, created_at, last_used_at FROM api_tokens ORDER BY created_at DESC");
}

/** Revoke (delete) a token by id. */
export function revokeToken(id) {
  getDbSync().run("DELETE FROM api_tokens WHERE id = ?", [id]);
  persist();
}

/**
 * Verify a raw Bearer token. Returns true and updates last_used_at, or false.
 * Timing-safe: always hashes and compares, never short-circuits on mismatch.
 */
export function verifyToken(raw) {
  if (!raw || typeof raw !== "string") return false;
  const incoming = hashToken(raw);
  // Load all hashes — in practice there will be very few tokens
  const rows = queryAll("SELECT id, token_hash FROM api_tokens");
  for (const row of rows) {
    try {
      const match = timingSafeEqual(
        Buffer.from(incoming, "hex"),
        Buffer.from(row.token_hash, "hex")
      );
      if (match) {
        getDbSync().run(
          "UPDATE api_tokens SET last_used_at = datetime('now') WHERE id = ?",
          [row.id]
        );
        persist();
        return true;
      }
    } catch {
      // length mismatch or invalid hex — not a match
    }
  }
  return false;
}

/**
 * Extract the raw token from an Authorization header value.
 * Accepts "Bearer <token>" (case-insensitive prefix).
 * Returns the token string or null.
 */
export function extractBearerToken(authHeader) {
  if (!authHeader) return null;
  const match = authHeader.match(/^Bearer\s+(\S+)$/i);
  return match ? match[1] : null;
}
