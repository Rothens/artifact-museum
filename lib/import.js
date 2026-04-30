import { getDbSync, persist } from "../db/client.js";

const MAX_IMPORT_BYTES = 50 * 1024 * 1024; // 50 MB

/**
 * Validate the structure of an artifact-logger export payload.
 * Throws a descriptive Error if anything is wrong.
 */
function validatePayload(payload) {
  if (!payload || typeof payload !== "object") throw new Error("Payload must be an object");
  if (payload.appVersion !== 1) throw new Error("Invalid export: expected appVersion 1");
  if (!Array.isArray(payload.codeDefinitions)) throw new Error("Invalid export: codeDefinitions must be an array");
  if (!Array.isArray(payload.itemRecords)) throw new Error("Invalid export: itemRecords must be an array");

  for (const [i, code] of payload.codeDefinitions.entries()) {
    if (!code.id || typeof code.id !== "string") throw new Error(`codeDefinitions[${i}]: missing id`);
    if (!code.codeType || typeof code.codeType !== "string") throw new Error(`codeDefinitions[${i}]: missing codeType`);
    if (!code.codeValue || typeof code.codeValue !== "string") throw new Error(`codeDefinitions[${i}]: missing codeValue`);
    if (!code.codeKey || typeof code.codeKey !== "string") throw new Error(`codeDefinitions[${i}]: missing codeKey`);
    if (!["unique_object", "repeatable_product"].includes(code.mode)) throw new Error(`codeDefinitions[${i}]: invalid mode "${code.mode}"`);
  }

  for (const [i, item] of payload.itemRecords.entries()) {
    if (!item.id || typeof item.id !== "string") throw new Error(`itemRecords[${i}]: missing id`);
    if (!item.codeDefinitionId || typeof item.codeDefinitionId !== "string") throw new Error(`itemRecords[${i}]: missing codeDefinitionId`);
  }
}

/**
 * Parse and upsert an artifact-logger export payload into the museum database.
 * Visibility flags on existing items are preserved on re-import.
 */
export function upsertAll(payload, { rawSizeBytes } = {}) {
  if (rawSizeBytes !== undefined && rawSizeBytes > MAX_IMPORT_BYTES) {
    throw new Error(`Import file too large (max ${MAX_IMPORT_BYTES / 1024 / 1024} MB)`);
  }

  validatePayload(payload);

  const { codeDefinitions = [], itemRecords = [] } = payload;
  const db = getDbSync();

  let codesNew = 0;
  let codesUpdated = 0;
  let itemsNew = 0;
  let itemsUpdated = 0;

  db.run("BEGIN TRANSACTION");

  try {
    for (const code of codeDefinitions) {
      const existsStmt = db.prepare("SELECT id FROM code_definitions WHERE id = ?");
      existsStmt.bind([code.id]);
      const codeExists = existsStmt.step();
      existsStmt.free();

      db.run(
        `INSERT INTO code_definitions
          (id, code_type, code_value, code_key, mode, name, category, notes, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           code_type  = excluded.code_type,
           code_value = excluded.code_value,
           code_key   = excluded.code_key,
           mode       = excluded.mode,
           name       = excluded.name,
           category   = excluded.category,
           notes      = excluded.notes,
           updated_at = excluded.updated_at`,
        [
          code.id,
          code.codeType,
          code.codeValue,
          code.codeKey,
          code.mode,
          code.name ?? "",
          code.category ?? "other",
          code.notes ?? "",
          code.createdAt,
          code.updatedAt,
        ]
      );
      if (codeExists) codesUpdated++; else codesNew++;
    }

    for (const item of itemRecords) {
      const photo = item.photo ?? {};
      const meta = item.metadata ?? {};
      const loc = item.location ?? {};

      // Check if item already exists (to preserve visibility flags)
      const stmt = db.prepare("SELECT id FROM item_records WHERE id = ?");
      stmt.bind([item.id]);
      const exists = stmt.step();
      stmt.free();

      if (exists) {
        itemsUpdated++;
        db.run(
          `UPDATE item_records SET
            code_definition_id = ?,
            label              = ?,
            notes              = ?,
            collected_at       = ?,
            updated_at         = ?,
            location_lat       = ?,
            location_lng       = ?,
            location_accuracy  = ?,
            photo_data_url     = ?,
            photo_name         = ?,
            photo_width        = ?,
            photo_height       = ?,
            photo_size         = ?,
            meta_price         = ?,
            meta_currency      = ?,
            meta_source_shop   = ?,
            meta_recipient     = ?,
            meta_consumed      = ?,
            meta_gifted        = ?
          WHERE id = ?`,
          [
            item.codeDefinitionId,
            item.label ?? "",
            item.notes ?? "",
            item.collectedAt || null,
            item.updatedAt,
            loc.lat ?? null,
            loc.lng ?? null,
            loc.accuracy ?? null,
            photo.dataUrl ?? null,
            photo.name ?? null,
            photo.width ?? null,
            photo.height ?? null,
            photo.compressedSize ?? photo.size ?? null,
            meta.price || null,
            meta.currency ?? null,
            meta.sourceShop || null,
            meta.recipient || null,
            meta.consumed ? 1 : 0,
            meta.gifted ? 1 : 0,
            item.id,
          ]
        );
      } else {
        itemsNew++;
        db.run(
          `INSERT INTO item_records (
            id, code_definition_id, label, notes, collected_at, updated_at,
            location_lat, location_lng, location_accuracy,
            photo_data_url, photo_name, photo_width, photo_height, photo_size,
            meta_price, meta_currency, meta_source_shop, meta_recipient,
            meta_consumed, meta_gifted
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            item.id,
            item.codeDefinitionId,
            item.label ?? "",
            item.notes ?? "",
            item.collectedAt || null,
            item.updatedAt,
            loc.lat ?? null,
            loc.lng ?? null,
            loc.accuracy ?? null,
            photo.dataUrl ?? null,
            photo.name ?? null,
            photo.width ?? null,
            photo.height ?? null,
            photo.compressedSize ?? photo.size ?? null,
            meta.price || null,
            meta.currency ?? null,
            meta.sourceShop || null,
            meta.recipient || null,
            meta.consumed ? 1 : 0,
            meta.gifted ? 1 : 0,
          ]
        );
      }
    }

    db.run("COMMIT");
    persist();
  } catch (err) {
    db.run("ROLLBACK");
    throw err;
  }

  return {
    codes: codesNew + codesUpdated,
    codesNew,
    codesUpdated,
    items: itemsNew + itemsUpdated,
    itemsNew,
    itemsUpdated,
  };
}
