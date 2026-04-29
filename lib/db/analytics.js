import { getDbSync, persist } from "../../db/client.js";

function queryAll(sql, params = []) {
  const db = getDbSync();
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

function queryOne(sql, params = []) {
  const db = getDbSync();
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const row = stmt.step() ? stmt.getAsObject() : null;
  stmt.free();
  return row;
}

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
