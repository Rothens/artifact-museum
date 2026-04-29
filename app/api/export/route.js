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
  const codeDefinitions = getAllCodes();
  const itemRecords = getAllItemRecords();

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
