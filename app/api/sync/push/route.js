import { NextResponse } from "next/server";
import { initDb } from "../../../../lib/initDb.js";
import { extractBearerToken, verifyToken } from "../../../../lib/db/tokens.js";
import { upsertAll } from "../../../../lib/import.js";

export const dynamic = "force-dynamic";

// Allow up to 10 MB for the JSON body (no photos, but many items can add up)
export const maxDuration = 30;

export async function POST(request) {
  await initDb();

  const raw = extractBearerToken(request.headers.get("authorization"));
  if (!raw || !verifyToken(raw)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const contentLength = Number(request.headers.get("content-length") || 0);

  try {
    const result = upsertAll(payload, { rawSizeBytes: contentLength });
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 422 });
  }
}
