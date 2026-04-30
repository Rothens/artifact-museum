import Link from "next/link";
import { initDb } from "../../lib/initDb.js";
import { getAllPublicItems } from "../../lib/db/items.js";
import { getAllTrips } from "../../lib/db/trips.js";
import { getLocale } from "../../lib/locale.js";
import { getTranslations } from "../../lib/i18n.js";

const CATEGORY_ICONS = {
  sand: "bi-beach",
  snack: "bi-cookie",
  drink: "bi-cup-straw",
  souvenir: "bi-gift",
  gift: "bi-gift-fill",
  ticket: "bi-ticket-perforated",
  storage: "bi-box",
  other: "bi-tag",
};

export const dynamic = "force-dynamic";

export default async function BrowsePage() {
  await initDb();
  const items = getAllPublicItems();
  const publicTrips = getAllTrips().filter((tr) => tr.is_public);
  const locale = await getLocale();
  const t = getTranslations(locale);

  if (items.length === 0) {
    return (
      <main className="container py-5 text-center">
        <i className="bi bi-collection fs-1 text-muted mb-3 d-block"></i>
        <h2>{t("browse.empty.title")}</h2>
        <p className="text-muted">{t("browse.empty.desc")}</p>
        <Link href="/" className="btn btn-outline-secondary">{t("browse.back")}</Link>
      </main>
    );
  }

  return (
    <main className="container py-4">
      <div className="d-flex align-items-center mb-4 gap-3">
        <Link href="/" className="btn btn-sm btn-outline-secondary">
          <i className="bi bi-arrow-left"></i>
        </Link>
        <h1 className="h4 mb-0">{t("browse.title")} <span className="badge bg-secondary fw-normal">{items.length}</span></h1>
      </div>

      {publicTrips.length > 0 && (
        <div className="mb-4">
          <h2 className="h6 text-muted text-uppercase mb-3">
            <i className="bi bi-map me-1"></i>{t("nav.trips")}
          </h2>
          <div className="d-flex flex-wrap gap-2">
            {publicTrips.map((trip) => (
              <Link
                key={trip.id}
                href={`/trip/${trip.id}`}
                className="btn btn-outline-primary btn-sm"
              >
                <i className="bi bi-map me-1"></i>
                {trip.name || t("trip.unnamed")}
                <span className="ms-2 badge bg-primary">{trip.item_count}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="row g-3">
        {items.map((item) => {
          const icon = CATEGORY_ICONS[item.category] ?? "bi-tag";
          const name = item.label || item.code_name || t("browse.unnamed");
          return (
            <div key={item.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
              <Link href={`/item/${item.id}`} className="card text-decoration-none h-100 shadow-sm hover-card">
                {item.show_photo && item.photo_data_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.photo_data_url}
                    alt={name}
                    className="card-img-top"
                    style={{ height: 160, objectFit: "cover" }}
                    loading="lazy"
                  />
                ) : (
                  <div
                    className="card-img-top d-flex align-items-center justify-content-center bg-light text-muted"
                    style={{ height: 160 }}
                  >
                    <i className={`bi ${icon} fs-1`}></i>
                  </div>
                )}
                <div className="card-body">
                  <p className="card-title mb-1 fw-semibold">{name}</p>
                  <span className="badge bg-light text-secondary text-capitalize border">{item.category}</span>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </main>
  );
}
