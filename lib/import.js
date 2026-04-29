import { getDbSync, persist } from "../db/client.js";

/**
 * Parse and upsert an artifact-logger export payload into the museum database.
 * Visibility flags on existing items are preserved on re-import.
 */
export function upsertAll(payload) {
  if (!payload || payload.appVersion !== 1) {
    throw new Error("Invalid export format: expected appVersion 1");
  }

  const { codeDefinitions = [], itemRecords = [] } = payload;
  const db = getDbSync();

  let codesImported = 0;
  let itemsImported = 0;

  db.run("BEGIN TRANSACTION");

  try {
    for (const code of codeDefinitions) {
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
      codesImported++;
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
        db.run(
          `INSERT INTO item_records (
            id, code_definition_id, label, notes, collected_at, updated_at,
            location_lat, location_lng, location_accuracy,
            photo_data_url, photo_width, photo_height, photo_size,
            meta_price, meta_currency, meta_source_shop, meta_recipient,
            meta_consumed, meta_gifted
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      itemsImported++;
    }

    db.run("COMMIT");
    persist();
  } catch (err) {
    db.run("ROLLBACK");
    throw err;
  }

  return { codes: codesImported, items: itemsImported };
}
