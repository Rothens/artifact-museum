import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isAuthenticated } from "../../../lib/auth.js";
import { initDb } from "../../../lib/initDb.js";
import { getAllCodes } from "../../../lib/db/codes.js";
import { getAllItemRecords } from "../../../lib/db/items.js";

export const dynamic = "force-dynamic";

export async function GET() {
  // Auth check — same pattern as admin layout
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join("; ");
  if (!isAuthenticated(cookieHeader)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await initDb();
  const codeDefinitions = getAllCodes().map((c) => ({
    id: c.id,
    codeType: c.code_type,
    codeValue: c.code_value,
    codeKey: c.code_key,
    mode: c.mode,
    name: c.name,
    category: c.category,
    notes: c.notes,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
  }));

  const itemRecords = getAllItemRecords().map((item) => ({
    id: item.id,
    codeDefinitionId: item.code_definition_id,
    label: item.label,
    notes: item.notes,
    collectedAt: item.collected_at,
    updatedAt: item.updated_at,
    location: item.location_lat != null ? {
      lat: item.location_lat,
      lng: item.location_lng,
      accuracy: item.location_accuracy,
    } : null,
    photo: item.photo_data_url ? {
      dataUrl: item.photo_data_url,
      name: item.photo_name,
      width: item.photo_width,
      height: item.photo_height,
      size: item.photo_size,
    } : null,
    metadata: {
      price: item.meta_price,
      currency: item.meta_currency,
      sourceShop: item.meta_source_shop,
      recipient: item.meta_recipient,
      consumed: !!item.meta_consumed,
      gifted: !!item.meta_gifted,
    },
  }));

  const payload = {
    appVersion: 1,
    exportedAt: new Date().toISOString(),
    source: "artifact-museum",
    codeDefinitions,
    itemRecords,
  };

  const filename = `artifact-museum-export-${new Date().toISOString().slice(0, 10)}.json`;

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
