import { initDb } from "../../../lib/initDb.js";
import { getItemById } from "../../../lib/db/items.js";
import { recordView } from "../../../lib/db/analytics.js";

export async function POST(request) {
  await initDb();
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(null, { status: 400 });
  }

  const { itemId, referrer } = body ?? {};
  if (!itemId) {
    return new Response(null, { status: 400 });
  }

  const item = getItemById(itemId);
  if (!item || !item.is_public) {
    return new Response(null, { status: 404 });
  }

  const safeReferrer = ["scan", "browse", "direct"].includes(referrer)
    ? referrer
    : "direct";

  recordView(itemId, safeReferrer);
  return new Response(null, { status: 204 });
}
