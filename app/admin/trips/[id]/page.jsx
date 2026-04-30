import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { initDb } from "../../../../lib/initDb.js";
import { getTripById, getItemsForTrip, updateTrip, deleteTrip } from "../../../../lib/db/trips.js";
import { getLocale } from "../../../../lib/locale.js";
import { getTranslations } from "../../../../lib/i18n.js";

export const dynamic = "force-dynamic";

export default async function AdminTripEditPage({ params }) {
  await initDb();
  const trip = getTripById((await params).id);
  if (!trip) notFound();

  const items = getItemsForTrip(trip.id);
  const locale = await getLocale();
  const t = getTranslations(locale);
  const dateLocale = locale === "hu" ? "hu-HU" : "en-GB";

  async function handleUpdate(formData) {
    "use server";
    await initDb();
    updateTrip(trip.id, {
      name: formData.get("name") ?? "",
      description: formData.get("description") ?? "",
      date_start: formData.get("date_start"),
      date_end: formData.get("date_end"),
    });
    redirect("/admin/trips");
  }

  async function handleDelete() {
    "use server";
    await initDb();
    deleteTrip(trip.id);
    redirect("/admin/trips");
  }

  return (
    <div style={{ maxWidth: 860 }}>
      <div className="d-flex align-items-center mb-4 gap-3">
        <Link href="/admin/trips" className="btn btn-sm btn-outline-secondary">
          <i className="bi bi-arrow-left"></i>
        </Link>
        <h1 className="h4 mb-0">{trip.name || t("trip.unnamed")}</h1>
        {trip.is_public ? (
          <span className="badge bg-success">{t("admin.trips.public")}</span>
        ) : null}
      </div>

      <div className="row g-4">
        {/* Left: edit form */}
        <div className="col-12 col-md-6">
          <div className="card shadow-sm mb-3">
            <div className="card-body">
              <h6 className="card-title mb-3">{t("admin.trips.edit")}</h6>
              <form action={handleUpdate}>
                <div className="mb-3">
                  <label className="form-label">{t("admin.trips.name")}</label>
                  <input name="name" className="form-control" defaultValue={trip.name} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">{t("admin.trips.description")}</label>
                  <textarea name="description" className="form-control" rows={3} defaultValue={trip.description} />
                </div>
                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="form-label">{t("admin.trips.date_start")}</label>
                    <input name="date_start" type="date" className="form-control" defaultValue={trip.date_start} required />
                  </div>
                  <div className="col-6">
                    <label className="form-label">{t("admin.trips.date_end")}</label>
                    <input name="date_end" type="date" className="form-control" defaultValue={trip.date_end} required />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary">{t("admin.trips.save")}</button>
              </form>
            </div>
          </div>

          <div className="card border-danger shadow-sm">
            <div className="card-body">
              <p className="small text-muted mb-2">{t("admin.trips.delete.confirm")}</p>
              <form action={handleDelete}>
                <button type="submit" className="btn btn-outline-danger btn-sm">
                  <i className="bi bi-trash me-1"></i>{t("admin.trips.delete")}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right: items in this trip */}
        <div className="col-12 col-md-6">
          <div className="card shadow-sm">
            <div className="card-header small text-muted">
              {t("admin.trips.items")} ({items.length})
            </div>
            {items.length === 0 ? (
              <div className="card-body text-muted small">{t("admin.trips.empty")}</div>
            ) : (
              <div className="list-group list-group-flush" style={{ maxHeight: 480, overflowY: "auto" }}>
                {items.map((item) => (
                  <Link
                    key={item.id}
                    href={`/admin/item/${item.id}`}
                    className="list-group-item list-group-item-action d-flex justify-content-between align-items-center py-2"
                  >
                    <div>
                      <div className="small fw-semibold">{item.label || item.code_name}</div>
                      <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                        {item.collected_at
                          ? new Date(item.collected_at).toLocaleDateString(dateLocale)
                          : "—"}
                        {item.trip_id === trip.id && (
                          <span className="ms-2 badge bg-primary" style={{ fontSize: "0.65rem" }}>override</span>
                        )}
                        {item.location_lat ? (
                          <i className="bi bi-geo-alt ms-2 text-success"></i>
                        ) : (
                          <i className="bi bi-geo-alt-fill ms-2 text-muted opacity-25"></i>
                        )}
                      </div>
                    </div>
                    {item.is_public ? (
                      <i className="bi bi-eye text-success small"></i>
                    ) : (
                      <i className="bi bi-eye-slash text-muted small"></i>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
