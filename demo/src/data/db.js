/**
 * In-browser data layer for the demo.
 * Loads sample.json and applies the same visibility + join logic as the real museum.
 *
 * All items in the sample are treated as public with all fields shown —
 * this is a demo, there is no admin to toggle visibility.
 */
import sampleData from './sample.json';

// Join item records with their code definitions and apply public-field filtering
function buildPublicItem(itemRecord, codeDefinition) {
  return {
    id: itemRecord.id,
    label: itemRecord.label || null,
    code_name: codeDefinition?.name || null,
    category: codeDefinition?.category || 'other',
    mode: codeDefinition?.mode || null,
    collected_at: itemRecord.collectedAt || null,
    // In the demo all fields are shown — mirror show_* = true behaviour
    notes: itemRecord.notes || null,
    photo_name: itemRecord.photo?.name || null,
    // No actual photos in the slim export — photo_data_url stays null
    photo_data_url: null,
    meta_price: itemRecord.metadata?.price || null,
    meta_currency: itemRecord.metadata?.currency || null,
    meta_source_shop: itemRecord.metadata?.sourceShop || null,
    meta_recipient: itemRecord.metadata?.recipient || null,
    meta_consumed: itemRecord.metadata?.consumed ?? null,
    meta_gifted: itemRecord.metadata?.gifted ?? null,
    location_lat: itemRecord.location?.lat ?? null,
    location_lng: itemRecord.location?.lng ?? null,
    location_accuracy: itemRecord.location?.accuracy ?? null,
    // Code fields for lookup
    code_type: codeDefinition?.codeType || null,
    code_value: codeDefinition?.codeValue || null,
    code_key: codeDefinition?.codeKey || null,
  };
}

const codeMap = Object.fromEntries(
  sampleData.codeDefinitions.map((c) => [c.id, c])
);

export const allItems = sampleData.itemRecords.map((item) =>
  buildPublicItem(item, codeMap[item.codeDefinitionId])
);

// Map codeKey → item id for the scan lookup
export const codeKeyIndex = Object.fromEntries(
  allItems.map((item) => [item.code_key, item.id])
);

export function getItemById(id) {
  return allItems.find((item) => item.id === id) ?? null;
}

export function lookupByCodeKey(codeKey) {
  const id = codeKeyIndex[codeKey];
  return id ?? null;
}
