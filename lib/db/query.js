import { getDbSync } from "../../db/client.js";

export function queryOne(sql, params = []) {
  const db = getDbSync();
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const row = stmt.step() ? stmt.getAsObject() : null;
  stmt.free();
  return row;
}

export function queryAll(sql, params = []) {
  const db = getDbSync();
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}
