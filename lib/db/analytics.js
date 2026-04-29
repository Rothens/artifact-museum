import { getDbSync, persist } from "../../db/client.js";
import { queryOne, queryAll } from "./query.js";

export function recordView(itemId, referrer) {
  getDbSync().run(
    "INSERT INTO page_views (item_id, referrer, viewed_at) VALUES (?, ?, datetime('now'))",
    [itemId, referrer || "direct"]
  );
  persist();
}

export function getViewCountForItem(itemId) {
  const row = queryOne("SELECT COUNT(*) as count FROM page_views WHERE item_id = ?", [itemId]);
  return row?.count ?? 0;
}

export function getViewBreakdownForItem(itemId) {
  return queryAll(
    "SELECT referrer, COUNT(*) as count FROM page_views WHERE item_id = ? GROUP BY referrer",
    [itemId]
  );
}
