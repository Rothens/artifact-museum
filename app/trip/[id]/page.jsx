import { notFound } from "next/navigation";
import Link from "next/link";
import { initDb } from "../../../lib/initDb.js";
import { getTripById, getPublicItemsForTrip } from "../../../lib/db/trips.js";
import { filterPublicFields } from "../../../lib/visibility.js";
import { getLocale } from "../../../lib/locale.js";
import { getTranslations } from "../../../lib/i18n.js";
import TripMapLoader from "./TripMapLoader.jsx";

export const dynamic = "force-dynamic";

export default async function TripPage({ params }) {
  await initDb();
  const trip = getTripById((await params).id);

  if (!trip || !trip.is_public) notFound();

  const rawItems = getPublicItemsForTrip(trip.id);

  const locale = await getLocale();
  const t = getTranslations(locale);
  const dateLocale = locale === "hu" ? "hu-HU" : "en-GB";
  const dateOpts = { year: "numeric", month: "long", day: "numeric" };

  // Split on raw coords (show_location gate) before filtering strips them.
  // Build lean map items directly from raw so coords are always available.
  const mapItems = rawItems
    .filter((i) => i.show_location && i.location_lat)
    .map((i) => ({
      id: i.id,
      label: i.label,
      code_name: i.code_name,
      location_lat: i.location_lat,
      location_lng: i.location_lng,
      collected_at: i.collected_at,
      // Only include photo if the admin made it public
      photo_data_url: i.show_photo && i.photo_data_url ? i.photo_data_url : null,
    }));

  // For the list below the map, apply full visibility filtering
  const mapItemIds = new Set(mapItems.map((i) => i.id));
  const itemsWithoutCoords = rawItems
    .filter((i) => !mapItemIds.has(i.id))
    .map(filterPublicFields);

  return (
    <main className="container py-4" style={{ maxWidth: 780 }}>
      <div className="d-flex align-items-center mb-4 gap-3">
        <Link href="/browse" className="btn btn-sm btn-outline-secondary">
          <i className="bi bi-arrow-left"></i>
        </Link>
        <span className="badge bg-primary">
          <i className="bi bi-map me-1"></i>{t("nav.trips")}
        </span>
      </div>

      <h1 className="h3 fw-bold mb-1">{trip.name || t("trip.unnamed")}</h1>

      <p className="text-muted small mb-3">
        {t("trip.dates")}:{" "}
        {new Date(trip.date_start).toLocaleDateString(dateLocale, dateOpts)}
        {" – "}
        {new Date(trip.date_end).toLocaleDateString(dateLocale, dateOpts)}
      </p>

      {trip.description && (
        <p className="mb-4">{trip.description}</p>
      )}

      {mapItems.length > 0 && (
        <>
          <h2 className="h6 text-muted text-uppercase mb-3">
            <i className="bi bi-geo-alt me-1"></i>{t("trip.items_on_map")} ({mapItems.length})
          </h2>
          <TripMapLoader
            items={mapItems}
            labels={{
              play: t("trip.timeline.play"),
              pause: t("trip.timeline.pause"),
            }}
          />
        </>
      )}

      {itemsWithoutCoords.length > 0 && (
        <div className="mt-4">
          <h2 className="h6 text-muted text-uppercase mb-3">
            <i className="bi bi-collection me-1"></i>{t("trip.items_no_coords")} ({itemsWithoutCoords.length})
          </h2>
          <div className="list-group shadow-sm">
            {itemsWithoutCoords.map((item) => (
              <Link
                key={item.id}
                href={`/item/${item.id}`}
                className="list-group-item list-group-item-action d-flex align-items-center gap-3 py-2"
              >
                {item.photo_data_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.photo_data_url}
                    alt=""
                    style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 4, flexShrink: 0 }}
                  />
                ) : (
                  <div
                    className="bg-light d-flex align-items-center justify-content-center text-muted"
                    style={{ width: 48, height: 48, borderRadius: 4, flexShrink: 0 }}
                  >
                    <i className="bi bi-image"></i>
                  </div>
                )}
                <div>
                  <div className="fw-semibold small">{item.label || item.code_name}</div>
                  {item.collected_at && (
                    <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                      {new Date(item.collected_at).toLocaleDateString(dateLocale)}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
