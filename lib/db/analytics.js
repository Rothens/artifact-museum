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

/** Total views per day for the last N days (default 30). */
export function getViewsPerDay(days = 30) {
  return queryAll(
    `SELECT date(viewed_at) AS day, COUNT(*) AS count
     FROM page_views
     WHERE viewed_at >= date('now', ?)
     GROUP BY day
     ORDER BY day ASC`,
    [`-${days} days`]
  );
}

/** Top N items by total view count. */
export function getTopItems(limit = 10) {
  return queryAll(
    `SELECT ir.id, ir.label, cd.name AS code_name, COUNT(pv.id) AS view_count
     FROM page_views pv
     JOIN item_records ir ON ir.id = pv.item_id
     JOIN code_definitions cd ON cd.id = ir.code_definition_id
     GROUP BY ir.id
     ORDER BY view_count DESC
     LIMIT ?`,
    [limit]
  );
}

/** Views split by referrer (all time). */
export function getTotalViewsByReferrer() {
  return queryAll(
    "SELECT referrer, COUNT(*) AS count FROM page_views GROUP BY referrer ORDER BY count DESC"
  );
}

/** Grand total view count. */
export function getTotalViewCount() {
  const row = queryOne("SELECT COUNT(*) AS count FROM page_views");
  return row?.count ?? 0;
}
