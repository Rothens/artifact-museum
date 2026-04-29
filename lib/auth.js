import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "am_auth";
const SIGNED_VALUE = "authenticated";

function getSecret() {
  const secret = process.env.COOKIE_SECRET;
  if (!secret) throw new Error("COOKIE_SECRET env var is not set");
  return secret;
}

function sign(value) {
  const secret = getSecret();
  const hmac = createHmac("sha256", secret).update(value).digest("hex");
  return `${value}.${hmac}`;
}

function verify(signed) {
  if (!signed) return false;
  const [value, mac] = signed.split(".");
  if (!value || !mac) return false;
  const expected = createHmac("sha256", getSecret()).update(value).digest("hex");
  try {
    return (
      value === SIGNED_VALUE &&
      timingSafeEqual(Buffer.from(mac, "hex"), Buffer.from(expected, "hex"))
    );
  } catch {
    return false;
  }
}

export function verifyPassword(input) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  try {
    return timingSafeEqual(
      Buffer.from(input, "utf8"),
      Buffer.from(password, "utf8")
    );
  } catch {
    return false;
  }
}

export function isAuthenticated(cookieHeader) {
  if (!cookieHeader) return false;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`));
  if (!match) return false;
  return verify(decodeURIComponent(match[1]));
}

/** Returns only the signed token value — use with Next.js cookies API directly. */
export function makeSignedValue(value) {
  return sign(value);
}

/** @deprecated Use makeSignedValue("authenticated") with the cookies() API instead. */
export function makeAuthCookie() {
  const signed = sign(SIGNED_VALUE);
  const isProd = process.env.NODE_ENV === "production";
  return `${COOKIE_NAME}=${encodeURIComponent(signed)}; HttpOnly; SameSite=Strict; Path=/${isProd ? "; Secure" : ""}`;
}

export function makeClearCookie() {
  return `${COOKIE_NAME}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`;
}

// ── Visitor auth ──────────────────────────────────────────────────────────────

const VISITOR_COOKIE_NAME = "am_visitor";

/**
 * Returns the signed token to store in the visitor cookie.
 * The raw VISITOR_PASSWORD is never written to the cookie.
 */
export function makeVisitorToken() {
  return sign("visitor");
}

/** Verify a visitor cookie value (HMAC signed, constant-time). */
export function verifyVisitorToken(token) {
  if (!token) return false;
  const lastDot = token.lastIndexOf(".");
  if (lastDot === -1) return false;
  const value = token.slice(0, lastDot);
  const mac = token.slice(lastDot + 1);
  if (value !== "visitor") return false;
  const expected = createHmac("sha256", getSecret()).update(value).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(mac, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

export function verifyVisitorPassword(input) {
  const password = process.env.VISITOR_PASSWORD;
  if (!password) return false;
  try {
    return timingSafeEqual(Buffer.from(input, "utf8"), Buffer.from(password, "utf8"));
  } catch {
    return false;
  }
}
