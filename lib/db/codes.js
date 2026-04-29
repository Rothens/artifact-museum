import { getDbSync } from "../../db/client.js";

function queryOne(sql, params = []) {
  const db = getDbSync();
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const row = stmt.step() ? stmt.getAsObject() : null;
  stmt.free();
  return row;
}

function queryAll(sql, params = []) {
  const db = getDbSync();
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

export function getCodeByKey(codeKey) {
  return queryOne("SELECT * FROM code_definitions WHERE code_key = ?", [codeKey]);
}

export function getCodeById(id) {
  return queryOne("SELECT * FROM code_definitions WHERE id = ?", [id]);
}

export function getAllCodes() {
  return queryAll("SELECT * FROM code_definitions ORDER BY name ASC");
}
