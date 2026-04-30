import { NextResponse } from "next/server";
import { initDb } from "../../../../lib/initDb.js";
import { extractBearerToken, verifyToken } from "../../../../lib/db/tokens.js";
import { corsHeaders, handlePreflight } from "../../../../lib/cors.js";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return handlePreflight() ?? new Response(null, { status: 204 });
}

export async function GET(request) {
  await initDb();

  const raw = extractBearerToken(request.headers.get("authorization"));
  if (!raw || !verifyToken(raw)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 }, { headers: corsHeaders() });
  }

  return NextResponse.json({ ok: true }, { headers: corsHeaders() });
}
