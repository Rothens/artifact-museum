import { NextResponse } from "next/server";
import { initDb } from "../../../../../lib/initDb.js";
import { extractBearerToken, verifyToken } from "../../../../../lib/db/tokens.js";
import { getItemById, updateItemData } from "../../../../../lib/db/items.js";

export const dynamic = "force-dynamic";

export async function POST(request, { params }) {
  await initDb();

  const raw = extractBearerToken(request.headers.get("authorization"));
  if (!raw || !verifyToken(raw)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { itemId } = await params;
  const item = getItemById(itemId);
  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  // Non-destructive: skip if a photo is already set
  if (item.photo_data_url) {
    return NextResponse.json({ ok: true, skipped: true, reason: "photo_already_set" });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { dataUrl, name, width, height, size } = body;

  if (!dataUrl || typeof dataUrl !== "string" || !dataUrl.startsWith("data:image/")) {
    return NextResponse.json({ error: "dataUrl must be a valid image data URL" }, { status: 422 });
  }

  // Rough size guard: 8 MB base64 ≈ 6 MB image
  if (dataUrl.length > 8 * 1024 * 1024) {
    return NextResponse.json({ error: "Photo too large (max ~6 MB)" }, { status: 413 });
  }

  updateItemData(itemId, {
    photo_data_url: dataUrl,
    photo_name: name ?? null,
    photo_width: width ?? null,
    photo_height: height ?? null,
    photo_size: size ?? null,
  });

  return NextResponse.json({ ok: true, skipped: false });
}
