import { NextResponse } from "next/server";

const ADMIN_COOKIE = "am_auth";
const VISITOR_COOKIE = "am_visitor";
const SIGNED_VALUE = "authenticated";

// Minimal HMAC verify that runs in the Edge Runtime (no Node crypto module)
async function verifyEdge(signed, secret, expectedValue = SIGNED_VALUE) {
  if (!signed) return false;
  const lastDot = signed.lastIndexOf(".");
  if (lastDot === -1) return false;
  const value = signed.slice(0, lastDot);
  const mac = signed.slice(lastDot + 1);
  if (value !== expectedValue) return false;

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  const macBytes = hexToBytes(mac);
  if (!macBytes) return false;
  return crypto.subtle.verify("HMAC", key, macBytes, enc.encode(value));
}

function hexToBytes(hex) {
  if (hex.length % 2 !== 0) return null;
  const arr = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    arr[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return arr;
}

function getCookie(cookieHeader, name) {
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const cookieHeader = request.headers.get("cookie") || "";
  const secret = process.env.COOKIE_SECRET || "";

  // ------------------------------------------------------------------
  // 1. Admin gate — protects /admin/**
  // ------------------------------------------------------------------
  if (pathname.startsWith("/admin")) {
    const adminCookie = getCookie(cookieHeader, ADMIN_COOKIE);
    const valid = adminCookie ? await verifyEdge(adminCookie, secret) : false;
    if (!valid) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // ------------------------------------------------------------------
  // 2. Visitor gate — only active when VISITOR_PASSWORD env var is set
  // ------------------------------------------------------------------
  const visitorPassword = process.env.VISITOR_PASSWORD || "";
  if (visitorPassword) {
    const isExempt =
      pathname === "/visitor-login" ||
      pathname.startsWith("/api/") ||
      pathname.startsWith("/_next/") ||
      pathname.startsWith("/login");

    if (!isExempt) {
      const visitorCookie = getCookie(cookieHeader, VISITOR_COOKIE);
      // Cookie holds an HMAC-signed token ("visitor.<hex>"), never the raw password.
      const granted = visitorCookie ? await verifyEdge(visitorCookie, secret, "visitor") : false;
      if (!granted) {
        const loginUrl = new URL("/visitor-login", request.url);
        loginUrl.searchParams.set("next", pathname);
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
