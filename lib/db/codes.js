import { queryOne, queryAll } from "./query.js";

export function getCodeByKey(codeKey) {
  return queryOne("SELECT * FROM code_definitions WHERE code_key = ?", [codeKey]);
}

export function getCodeById(id) {
  return queryOne("SELECT * FROM code_definitions WHERE id = ?", [id]);
}

export function getAllCodes() {
  return queryAll("SELECT * FROM code_definitions ORDER BY name ASC");
}
