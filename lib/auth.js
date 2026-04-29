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

export function makeAuthCookie() {
  const signed = sign(SIGNED_VALUE);
  const isProd = process.env.NODE_ENV === "production";
  return `${COOKIE_NAME}=${encodeURIComponent(signed)}; HttpOnly; SameSite=Strict; Path=/${isProd ? "; Secure" : ""}`;
}

export function makeClearCookie() {
  return `${COOKIE_NAME}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`;
}
