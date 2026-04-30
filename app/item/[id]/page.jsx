import { notFound } from "next/navigation";
import Link from "next/link";
import { initDb } from "../../../lib/initDb.js";
import { getItemById } from "../../../lib/db/items.js";
import { getTripForItem } from "../../../lib/db/trips.js";
import { filterPublicFields } from "../../../lib/visibility.js";
import ViewTracker from "../../../components/ViewTracker.jsx";
import { getLocale } from "../../../lib/locale.js";
import { getTranslations } from "../../../lib/i18n.js";

export const dynamic = "force-dynamic";

export default async function ItemPage({ params }) {
  await initDb();
  const raw = getItemById((await params).id);
  if (!raw || !raw.is_public) notFound();

  const item = filterPublicFields(raw);
  const trip = getTripForItem(raw.id);
  const locale = await getLocale();
  const t = getTranslations(locale);

  return (
    <main className="container py-4" style={{ maxWidth: 680 }}>
      <ViewTracker itemId={item.id} referrer="browse" />

      <div className="d-flex align-items-center mb-4 gap-3">
        <Link href="/browse" className="btn btn-sm btn-outline-secondary">
          <i className="bi bi-arrow-left"></i>
        </Link>
        <span className="badge bg-secondary text-capitalize">{item.category}</span>
      </div>

      {trip && trip.is_public ? (
        <Link
          href={`/trip/${trip.id}`}
          className="badge bg-primary text-decoration-none d-inline-flex align-items-center gap-1 mb-3"
        >
          <i className="bi bi-map"></i>
          {t("item.trip")} {trip.name}
        </Link>
      ) : null}

      {item.photo_data_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.photo_data_url}
          alt={item.label || item.code_name || t("item.unnamed")}
          className="rounded mb-4 w-100"
          style={{ maxHeight: 420, objectFit: "cover" }}
        />
      )}

      <h1 className="h3 fw-bold mb-1">{item.label || item.code_name || t("item.unnamed")}</h1>

      {item.collected_at && (
        <p className="text-muted small mb-3">
          {t("item.collected")}{" "}
          {new Date(item.collected_at).toLocaleDateString(locale === "hu" ? "hu-HU" : "en-GB", {
            year: "numeric", month: "long", day: "numeric",
          })}
        </p>
      )}

      {item.notes && (
        <p className="mb-4">{item.notes}</p>
      )}

      {(item.meta_price || item.meta_source_shop || item.meta_recipient ||
        item.meta_consumed !== undefined || item.meta_gifted !== undefined) && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h6 className="card-title text-muted mb-3">{t("item.details")}</h6>
            <dl className="row mb-0 small">
              {item.meta_price && (
                <>
                  <dt className="col-5">{t("item.price")}</dt>
                  <dd className="col-7">{item.meta_price} {item.meta_currency}</dd>
                </>
              )}
              {item.meta_source_shop && (
                <>
                  <dt className="col-5">{t("item.shop")}</dt>
                  <dd className="col-7">{item.meta_source_shop}</dd>
                </>
              )}
              {item.meta_recipient && (
                <>
                  <dt className="col-5">{t("item.recipient")}</dt>
                  <dd className="col-7">{item.meta_recipient}</dd>
                </>
              )}
              {item.meta_consumed !== undefined && (
                <>
                  <dt className="col-5">{t("item.consumed")}</dt>
                  <dd className="col-7">{item.meta_consumed ? t("item.yes") : t("item.no")}</dd>
                </>
              )}
              {item.meta_gifted !== undefined && (
                <>
                  <dt className="col-5">{t("item.gifted")}</dt>
                  <dd className="col-7">{item.meta_gifted ? t("item.yes") : t("item.no")}</dd>
                </>
              )}
            </dl>
          </div>
        </div>
      )}

      {item.location_lat && (
        <a
          href={`https://www.google.com/maps?q=${item.location_lat},${item.location_lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline-secondary btn-sm"
        >
          <i className="bi bi-geo-alt me-1"></i>{t("item.map")}
        </a>
      )}
    </main>
  );
}
