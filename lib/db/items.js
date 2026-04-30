import { getDbSync, persist } from "../../db/client.js";
import { queryOne, queryAll } from "./query.js";
import { savePhoto, deletePhoto } from "../photos.js";

export function getItemById(id) {
  return queryOne("SELECT * FROM item_records WHERE id = ?", [id]);
}

export function getAllItemRecords() {
  return queryAll("SELECT * FROM item_records ORDER BY collected_at DESC");
}

export function getItemsByCodeId(codeDefinitionId) {
  return queryAll(
    "SELECT * FROM item_records WHERE code_definition_id = ? ORDER BY collected_at DESC",
    [codeDefinitionId]
  );
}

export function getPublicItemByCodeId(codeDefinitionId) {
  return queryOne(
    "SELECT * FROM item_records WHERE code_definition_id = ? AND is_public = 1 ORDER BY collected_at DESC LIMIT 1",
    [codeDefinitionId]
  );
}

export function getAllPublicItems() {
  return queryAll(`
    SELECT ir.*, cd.name AS code_name, cd.category, cd.mode
    FROM item_records ir
    JOIN code_definitions cd ON cd.id = ir.code_definition_id
    WHERE ir.is_public = 1
    ORDER BY ir.collected_at DESC
  `);
}

export function getAllItemsWithStats() {
  return queryAll(`
    SELECT ir.*, cd.name AS code_name, cd.category, cd.mode,
           COUNT(pv.id) AS view_count
    FROM item_records ir
    JOIN code_definitions cd ON cd.id = ir.code_definition_id
    LEFT JOIN page_views pv ON pv.item_id = ir.id
    GROUP BY ir.id
    ORDER BY cd.name ASC, ir.collected_at DESC
  `);
}

/**
 * Returns all distinct categories that have at least one item, sorted alphabetically.
 */
export function getAllCategories() {
  return queryAll(
    "SELECT DISTINCT category FROM code_definitions ORDER BY category ASC"
  ).map((r) => r.category);
}

export function updateItemVisibility(id, flags) {
  const db = getDbSync();
  const {
    is_public,
    show_photo,
    show_notes,
    show_price,
    show_source_shop,
    show_recipient,
    show_consumed,
    show_gifted,
    show_location,
    admin_notes,
    label,
    notes,
  } = flags;

  db.run(
    `UPDATE item_records SET
      is_public = ?,
      show_photo = ?,
      show_notes = ?,
      show_price = ?,
      show_source_shop = ?,
      show_recipient = ?,
      show_consumed = ?,
      show_gifted = ?,
      show_location = ?,
      admin_notes = ?,
      label = ?,
      notes = ?
    WHERE id = ?`,
    [
      is_public ? 1 : 0,
      show_photo ? 1 : 0,
      show_notes ? 1 : 0,
      show_price ? 1 : 0,
      show_source_shop ? 1 : 0,
      show_recipient ? 1 : 0,
      show_consumed ? 1 : 0,
      show_gifted ? 1 : 0,
      show_location ? 1 : 0,
      admin_notes ?? "",
      label ?? "",
      notes ?? "",
      id,
    ]
  );
  persist();
}

// Explicit allowlist — prevents any user-controlled key from reaching the SQL string.
const ITEM_DATA_COLUMNS = new Set([
  "photo_data_url", "photo_name", "photo_width", "photo_height", "photo_size",
  "meta_price", "meta_currency", "meta_source_shop", "meta_recipient",
  "meta_consumed", "meta_gifted",
]);

/**
 * Update the raw data fields of an item (photo, price, shop, etc.).
 * Pass null for photo_data_url to clear the photo.
 * Only keys present in ITEM_DATA_COLUMNS are accepted; others are silently ignored.
 */
export async function updateItemData(id, data) {
  const db = getDbSync();
  const sets = [];
  const params = [];

  if ("photo_data_url" in data) {
    let photoUrl = data.photo_data_url;

    if (photoUrl === null) {
      // Clearing the photo — remove files from disk if present
      deletePhoto(id);
    } else if (typeof photoUrl === "string" && photoUrl.startsWith("data:")) {
      // New photo data URL — persist to storage (db or fs)
      photoUrl = await savePhoto(id, photoUrl);
    }

    // Photo columns are always updated together
    sets.push("photo_data_url = ?");
    params.push(photoUrl);
    for (const col of ["photo_name", "photo_width", "photo_height", "photo_size"]) {
      sets.push(`${col} = ?`);
      params.push(data[col] ?? null);
    }
  }

  for (const col of ["meta_price", "meta_currency", "meta_source_shop", "meta_recipient"]) {
    if (col in data) {
      sets.push(`${col} = ?`);
      params.push(data[col] ?? null);
    }
  }

  for (const col of ["meta_consumed", "meta_gifted"]) {
    if (col in data) {
      sets.push(`${col} = ?`);
      params.push(data[col] ? 1 : 0);
    }
  }

  // Guard: reject any key that isn't in the allowlist (should never happen, but be explicit)
  for (const key of Object.keys(data)) {
    if (!ITEM_DATA_COLUMNS.has(key)) {
      throw new Error(`updateItemData: rejected unknown column "${key}"`);
    }
  }

  if (sets.length === 0) return;
  params.push(id);
  db.run(`UPDATE item_records SET ${sets.join(", ")} WHERE id = ?`, params);
  persist();
}
