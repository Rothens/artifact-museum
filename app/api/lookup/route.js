import { initDb } from "../../../lib/initDb.js";
import { getCodeByKey } from "../../../lib/db/codes.js";
import { getPublicItemByCodeId } from "../../../lib/db/items.js";

export async function GET(request) {
  await initDb();
  const { searchParams } = new URL(request.url);
  const codeKey = searchParams.get("codeKey");

  if (!codeKey) {
    return Response.json({ error: "codeKey parameter is required" }, { status: 400 });
  }

  const code = getCodeByKey(codeKey);
  if (!code) {
    return Response.json({ error: "Code not found" }, { status: 404 });
  }

  const item = getPublicItemByCodeId(code.id);
  if (!item) {
    return Response.json({ error: "No public item for this code" }, { status: 404 });
  }

  return Response.json({ itemId: item.id });
}
