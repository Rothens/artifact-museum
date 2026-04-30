import Link from "next/link";
import { redirect } from "next/navigation";
import { initDb } from "../../../lib/initDb.js";
import { getAllTrips, createTrip } from "../../../lib/db/trips.js";
import { getLocale } from "../../../lib/locale.js";
import { getTranslations } from "../../../lib/i18n.js";

export const dynamic = "force-dynamic";

export default async function AdminTripsPage() {
  await initDb();
  const trips = getAllTrips();
  const locale = await getLocale();
  const t = getTranslations(locale);

  async function handleCreate(formData) {
    "use server";
    await initDb();
    createTrip({
      name: formData.get("name") ?? "",
      description: formData.get("description") ?? "",
      date_start: formData.get("date_start"),
      date_end: formData.get("date_end"),
    });
    redirect("/admin/trips");
  }

  const dateLocale = locale === "hu" ? "hu-HU" : "en-GB";

  return (
    <div style={{ maxWidth: 860 }}>
      <div className="d-flex align-items-center mb-4 gap-3">
        <Link href="/admin" className="btn btn-sm btn-outline-secondary">
          <i className="bi bi-arrow-left"></i>
        </Link>
        <h1 className="h4 mb-0">{t("admin.trips.title")}</h1>
      </div>

      {trips.length === 0 ? (
        <p className="text-muted">{t("admin.trips.empty")}</p>
      ) : (
        <div className="card shadow-sm mb-4">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>{t("admin.trips.name")}</th>
                  <th>{t("admin.trips.date_start")}</th>
                  <th>{t("admin.trips.date_end")}</th>
                  <th className="text-center">{t("admin.trips.items")}</th>
                  <th className="text-center">{t("admin.trips.public")}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {trips.map((trip) => (
                  <tr key={trip.id}>
                    <td className="fw-semibold">{trip.name || <span className="text-muted fst-italic">{t("trip.unnamed")}</span>}</td>
                    <td className="text-muted small">{new Date(trip.date_start).toLocaleDateString(dateLocale)}</td>
                    <td className="text-muted small">{new Date(trip.date_end).toLocaleDateString(dateLocale)}</td>
                    <td className="text-center">{trip.item_count}</td>
                    <td className="text-center">
                      {trip.is_public ? (
                        <i className="bi bi-check-circle-fill text-success"></i>
                      ) : (
                        <i className="bi bi-dash text-muted"></i>
                      )}
                    </td>
                    <td className="text-end">
                      <Link href={`/admin/trips/${trip.id}`} className="btn btn-sm btn-outline-secondary">
                        {t("admin.trips.edit")}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="card-title mb-3">{t("admin.trips.new")}</h5>
          <form action={handleCreate}>
            <div className="mb-3">
              <label className="form-label">{t("admin.trips.name")}</label>
              <input name="name" className="form-control" required />
            </div>
            <div className="mb-3">
              <label className="form-label">{t("admin.trips.description")}</label>
              <textarea name="description" className="form-control" rows={2} />
            </div>
            <div className="row g-3 mb-3">
              <div className="col-6">
                <label className="form-label">{t("admin.trips.date_start")}</label>
                <input name="date_start" type="date" className="form-control" required />
              </div>
              <div className="col-6">
                <label className="form-label">{t("admin.trips.date_end")}</label>
                <input name="date_end" type="date" className="form-control" required />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">
              <i className="bi bi-plus-lg me-1"></i>{t("admin.trips.new")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
