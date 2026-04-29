/**
 * Strip fields from an item record that the admin has not made public.
 * Returns a plain object safe to pass to a guest-facing page.
 */
export function filterPublicFields(item) {
  if (!item) return null;

  const result = {
    id: item.id,
    label: item.label,
    collected_at: item.collected_at,
    code_name: item.code_name,
    category: item.category,
    mode: item.mode,
  };

  if (item.show_photo && item.photo_data_url) {
    result.photo_data_url = item.photo_data_url;
    result.photo_width = item.photo_width;
    result.photo_height = item.photo_height;
  }

  if (item.show_notes && item.notes) {
    result.notes = item.notes;
  }

  if (item.show_price && item.meta_price) {
    result.meta_price = item.meta_price;
    result.meta_currency = item.meta_currency;
  }

  if (item.show_source_shop && item.meta_source_shop) {
    result.meta_source_shop = item.meta_source_shop;
  }

  if (item.show_recipient && item.meta_recipient) {
    result.meta_recipient = item.meta_recipient;
  }

  if (item.show_consumed) {
    result.meta_consumed = !!item.meta_consumed;
  }

  if (item.show_gifted) {
    result.meta_gifted = !!item.meta_gifted;
  }

  if (item.show_location && item.location_lat) {
    result.location_lat = item.location_lat;
    result.location_lng = item.location_lng;
    result.location_accuracy = item.location_accuracy;
  }

  return result;
}
