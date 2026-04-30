import { NextResponse } from "next/server";
import { initDb } from "../../../../lib/initDb.js";
import { extractBearerToken, verifyToken } from "../../../../lib/db/tokens.js";

export const dynamic = "force-dynamic";

export async function GET(request) {
  await initDb();

  const raw = extractBearerToken(request.headers.get("authorization"));
  if (!raw || !verifyToken(raw)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
