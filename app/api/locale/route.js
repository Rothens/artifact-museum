import { NextResponse } from "next/server";
import { SUPPORTED_LOCALES, LOCALE_COOKIE, DEFAULT_LOCALE } from "../../../lib/i18n.js";

export async function POST(request) {
  const { locale } = await request.json();
  const safe = SUPPORTED_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;
  const res = NextResponse.json({ locale: safe });
  res.cookies.set(LOCALE_COOKIE, safe, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return res;
}
