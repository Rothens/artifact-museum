import { randomBytes } from "crypto";
import { getDbSync, persist } from "../../db/client.js";
import { queryOne, queryAll } from "./query.js";

function newId() {
  return randomBytes(16).toString("hex");
}

// The JOIN condition for resolving trip membership:
// explicit trip_id override wins; otherwise match by collected_at date range.
// Among date-range matches, earliest date_start wins (enforced by ORDER BY + LIMIT 1).
const TRIP_JOIN = `
  ir.trip_id = t.id
  OR (
    ir.trip_id IS NULL
    AND ir.collected_at IS NOT NULL
    AND ir.collected_at >= t.date_start
    AND ir.collected_at <= t.date_end
  )
`;

export function getAllTrips() {
  return queryAll(`
    SELECT t.*,
           COUNT(ir.id)   AS item_count,
           MAX(ir.is_public) AS is_public
    FROM trips t
    LEFT JOIN item_records ir ON (${TRIP_JOIN})
    GROUP BY t.id
    ORDER BY t.date_start DESC
  `);
}

export function getTripById(id) {
  return queryOne(`
    SELECT t.*,
           COUNT(ir.id)   AS item_count,
           MAX(ir.is_public) AS is_public
    FROM trips t
    LEFT JOIN item_records ir ON (${TRIP_JOIN})
    WHERE t.id = ?
    GROUP BY t.id
  `, [id]);
}

export function getItemsForTrip(tripId) {
  return queryAll(`
    SELECT ir.*, cd.name AS code_name, cd.category, cd.mode
    FROM item_records ir
    JOIN code_definitions cd ON cd.id = ir.code_definition_id
    JOIN trips t ON t.id = ?
    WHERE (${TRIP_JOIN})
    ORDER BY ir.collected_at ASC
  `, [tripId]);
}

export function getPublicItemsForTrip(tripId) {
  return queryAll(`
    SELECT ir.*, cd.name AS code_name, cd.category, cd.mode
    FROM item_records ir
    JOIN code_definitions cd ON cd.id = ir.code_definition_id
    JOIN trips t ON t.id = ?
    WHERE ir.is_public = 1
      AND (${TRIP_JOIN})
    ORDER BY ir.collected_at ASC
  `, [tripId]);
}

export function getTripForItem(itemId) {
  // Override wins; among date-range matches, earliest date_start wins.
  return queryOne(`
    SELECT t.*
    FROM item_records ir
    JOIN trips t ON (${TRIP_JOIN})
    WHERE ir.id = ?
    ORDER BY
      CASE WHEN ir.trip_id IS NOT NULL THEN 0 ELSE 1 END ASC,
      t.date_start ASC
    LIMIT 1
  `, [itemId]);
}

export function createTrip({ name, description, date_start, date_end }) {
  const id = newId();
  getDbSync().run(
    `INSERT INTO trips (id, name, description, date_start, date_end, created_at)
     VALUES (?, ?, ?, ?, ?, datetime('now'))`,
    [id, name ?? "", description ?? "", date_start, date_end]
  );
  persist();
  return id;
}

export function updateTrip(id, { name, description, date_start, date_end }) {
  getDbSync().run(
    `UPDATE trips SET name = ?, description = ?, date_start = ?, date_end = ? WHERE id = ?`,
    [name ?? "", description ?? "", date_start, date_end, id]
  );
  persist();
}

export function deleteTrip(id) {
  const db = getDbSync();
  db.run("UPDATE item_records SET trip_id = NULL WHERE trip_id = ?", [id]);
  db.run("DELETE FROM trips WHERE id = ?", [id]);
  persist();
}

export function setItemTripOverride(itemId, tripId) {
  getDbSync().run(
    "UPDATE item_records SET trip_id = ? WHERE id = ?",
    [tripId ?? null, itemId]
  );
  persist();
}
