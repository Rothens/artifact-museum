import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { initDb } from "../../../../lib/initDb.js";
import { getItemById, updateItemVisibility, updateItemData } from "../../../../lib/db/items.js";
import { getCodeById } from "../../../../lib/db/codes.js";
import { getViewBreakdownForItem } from "../../../../lib/db/analytics.js";
import { getAllTrips, getTripForItem, setItemTripOverride } from "../../../../lib/db/trips.js";
import { getLocale } from "../../../../lib/locale.js";
import { getTranslations } from "../../../../lib/i18n.js";
import PhotoUpload from "../../../../components/PhotoUpload.jsx";

export const dynamic = "force-dynamic";

export default async function AdminItemEditPage({ params }) {
  await initDb();
  const item = getItemById((await params).id);
  if (!item) notFound();

  const code = getCodeById(item.code_definition_id);
  const viewBreakdown = getViewBreakdownForItem(item.id);
  const totalViews = viewBreakdown.reduce((s, r) => s + r.count, 0);
  const allTrips = getAllTrips();
  const resolvedTrip = getTripForItem(item.id);

  const locale = await getLocale();
  const t = getTranslations(locale);

  async function save(formData) {
    "use server";
    await initDb();

    // Visibility + text fields
    updateItemVisibility(item.id, {
      is_public: formData.get("is_public") === "on",
      show_photo: formData.get("show_photo") === "on",
      show_notes: formData.get("show_notes") === "on",
      show_price: formData.get("show_price") === "on",
      show_source_shop: formData.get("show_source_shop") === "on",
      show_recipient: formData.get("show_recipient") === "on",
      show_consumed: formData.get("show_consumed") === "on",
      show_gifted: formData.get("show_gifted") === "on",
      show_location: formData.get("show_location") === "on",
      admin_notes: formData.get("admin_notes") ?? "",
      label: formData.get("label") ?? "",
      notes: formData.get("notes") ?? "",
    });

    // Data fields
    const photoRaw = formData.get("photo_data_url");
    const dataUpdate = {};

    if (photoRaw === "__clear__") {
      dataUpdate.photo_data_url = null;
      dataUpdate.photo_name = null;
      dataUpdate.photo_width = null;
      dataUpdate.photo_height = null;
      dataUpdate.photo_size = null;
    } else if (photoRaw && photoRaw.startsWith("data:")) {
      dataUpdate.photo_data_url = photoRaw;
      dataUpdate.photo_name = formData.get("photo_name") || null;
      dataUpdate.photo_width = Number(formData.get("photo_width")) || null;
      dataUpdate.photo_height = Number(formData.get("photo_height")) || null;
      dataUpdate.photo_size = Number(formData.get("photo_size")) || null;
    }

    dataUpdate.meta_price = formData.get("meta_price") || null;
    dataUpdate.meta_currency = formData.get("meta_currency") || null;
    dataUpdate.meta_source_shop = formData.get("meta_source_shop") || null;
    dataUpdate.meta_recipient = formData.get("meta_recipient") || null;
    dataUpdate.meta_consumed = formData.get("meta_consumed") === "on";
    dataUpdate.meta_gifted = formData.get("meta_gifted") === "on";

    updateItemData(item.id, dataUpdate);

    const tripOverride = formData.get("trip_id") || null;
    setItemTripOverride(item.id, tripOverride);

    redirect("/admin/items");
  }

  const visibilityFields = [
    ["show_photo", t("admin.edit.show.photo")],
    ["show_notes", t("admin.edit.show.notes")],
    ["show_price", t("admin.edit.show.price")],
    ["show_source_shop", t("admin.edit.show.shop")],
    ["show_recipient", t("admin.edit.show.recipient")],
    ["show_consumed", t("admin.edit.show.consumed")],
    ["show_gifted", t("admin.edit.show.gifted")],
    ["show_location", t("admin.edit.show.location")],
  ];

  return (
    <div style={{ maxWidth: 780 }}>
      <div className="d-flex align-items-center mb-4 gap-3">
        <Link href="/admin/items" className="btn btn-sm btn-outline-secondary">
          <i className="bi bi-arrow-left"></i>
        </Link>
        <h1 className="h4 mb-0">{item.label || code?.name || t("admin.edit.title")}</h1>
      </div>

      <div className="row g-4">
        {/* Left column: preview + analytics + source data */}
        <div className="col-12 col-md-4">
          {item.photo_data_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.photo_data_url}
              alt="Item photo"
              className="img-fluid rounded shadow-sm mb-3"
            />
          ) : (
            <div
              className="rounded bg-light d-flex align-items-center justify-content-center text-muted mb-3"
              style={{ height: 200 }}
            >
              <i className="bi bi-image fs-1"></i>
            </div>
          )}

          <div className="card shadow-sm">
            <div className="card-body small">
              <div className="text-muted mb-1">{t("admin.edit.analytics")}</div>
              <div className="fw-bold fs-5">{totalViews} {t("admin.edit.views")}</div>
              {viewBreakdown.map((r) => (
                <div key={r.referrer} className="text-muted">
                  {r.count} {t("admin.edit.from")} {r.referrer}
                </div>
              ))}
            </div>
          </div>

          <div className="card shadow-sm mt-3">
            <div className="card-body small">
              <div className="text-muted mb-2">{t("admin.edit.source")}</div>
              {code && <div><span className="text-muted">{t("admin.edit.source.code")}:</span> {code.name || code.code_key}</div>}
              {code && <div><span className="text-muted">{t("admin.edit.source.category")}:</span> {code.category}</div>}
              {item.collected_at && <div><span className="text-muted">{t("admin.edit.source.collected")}:</span> {new Date(item.collected_at).toLocaleDateString()}</div>}
              {item.meta_price && <div><span className="text-muted">{t("admin.edit.source.price")}:</span> {item.meta_price} {item.meta_currency}</div>}
              {item.meta_source_shop && <div><span className="text-muted">{t("admin.edit.source.shop")}:</span> {item.meta_source_shop}</div>}
              {item.meta_recipient && <div><span className="text-muted">{t("admin.edit.source.recipient")}:</span> {item.meta_recipient}</div>}
              {item.location_lat && (
                <div>
                  <span className="text-muted">{t("admin.edit.source.location")}:</span>{" "}
                  <a
                    href={`https://www.google.com/maps?q=${item.location_lat},${item.location_lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="small"
                  >
                    {t("admin.edit.source.map")} <i className="bi bi-box-arrow-up-right"></i>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column: edit form */}
        <div className="col-12 col-md-8">
          <form action={save}>
            {/* Display text */}
            <div className="card shadow-sm mb-3">
              <div className="card-body">
                <h6 className="card-title mb-3">{t("admin.edit.display")}</h6>

                <div className="mb-3">
                  <label className="form-label">{t("admin.edit.label")}</label>
                  <input
                    name="label"
                    className="form-control"
                    defaultValue={item.label}
                    placeholder={code?.name || ""}
                  />
                </div>

                <div className="mb-0">
                  <label className="form-label">{t("admin.edit.notes.public")}</label>
                  <textarea
                    name="notes"
                    className="form-control"
                    rows={3}
                    defaultValue={item.notes}
                  />
                </div>
              </div>
            </div>

            {/* Edit item data */}
            <div className="card shadow-sm mb-3">
              <div className="card-body">
                <h6 className="card-title mb-3">{t("admin.edit.data")}</h6>

                <div className="mb-3">
                  <label className="form-label">{t("admin.edit.data.photo")}</label>
                  <PhotoUpload
                    currentDataUrl={item.photo_data_url}
                    currentPhotoName={item.photo_name}
                    labels={{ clear: t("admin.edit.data.photo.clear") }}
                  />
                  <div className="form-text">{t("admin.edit.data.photo.hint")}</div>
                </div>

                <div className="row g-2 mb-2">
                  <div className="col-8">
                    <label className="form-label">{t("admin.edit.data.price")}</label>
                    <input
                      name="meta_price"
                      className="form-control"
                      defaultValue={item.meta_price ?? ""}
                    />
                  </div>
                  <div className="col-4">
                    <label className="form-label">{t("admin.edit.data.currency")}</label>
                    <input
                      name="meta_currency"
                      className="form-control"
                      defaultValue={item.meta_currency ?? ""}
                      placeholder="HUF"
                    />
                  </div>
                </div>

                <div className="mb-2">
                  <label className="form-label">{t("admin.edit.data.shop")}</label>
                  <input
                    name="meta_source_shop"
                    className="form-control"
                    defaultValue={item.meta_source_shop ?? ""}
                  />
                </div>

                <div className="mb-2">
                  <label className="form-label">{t("admin.edit.data.recipient")}</label>
                  <input
                    name="meta_recipient"
                    className="form-control"
                    defaultValue={item.meta_recipient ?? ""}
                  />
                </div>

                <div className="d-flex gap-4">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="meta_consumed"
                      name="meta_consumed"
                      defaultChecked={!!item.meta_consumed}
                    />
                    <label className="form-check-label" htmlFor="meta_consumed">
                      {t("admin.edit.data.consumed")}
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="meta_gifted"
                      name="meta_gifted"
                      defaultChecked={!!item.meta_gifted}
                    />
                    <label className="form-check-label" htmlFor="meta_gifted">
                      {t("admin.edit.data.gifted")}
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Trip assignment */}
            <div className="card shadow-sm mb-3">
              <div className="card-body">
                <h6 className="card-title mb-3">{t("admin.edit.trip")}</h6>
                {resolvedTrip && (
                  <p className="small text-muted mb-2">
                    {t("admin.edit.trip.resolved")}{" "}
                    <Link href={`/admin/trips/${resolvedTrip.id}`} className="fw-semibold">
                      {resolvedTrip.name}
                    </Link>
                    {item.trip_id
                      ? null
                      : <span className="ms-1 text-muted">({t("admin.edit.trip.auto")})</span>}
                  </p>
                )}
                <select name="trip_id" className="form-select form-select-sm" defaultValue={item.trip_id ?? ""}>
                  <option value="">{resolvedTrip && !item.trip_id ? t("admin.edit.trip.auto") : t("admin.edit.trip.none")}</option>
                  {allTrips.map((trip) => (
                    <option key={trip.id} value={trip.id}>
                      {trip.name || t("trip.unnamed")} ({trip.date_start} – {trip.date_end})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Visibility */}
            <div className="card shadow-sm mb-3">
              <div className="card-body">
                <h6 className="card-title mb-3">{t("admin.edit.visibility")}</h6>

                <div className="form-check form-switch mb-2">
                  <input className="form-check-input" type="checkbox" role="switch" id="is_public" name="is_public" defaultChecked={!!item.is_public} />
                  <label className="form-check-label fw-semibold" htmlFor="is_public">{t("admin.edit.visibility.public")}</label>
                </div>

                <hr />

                <p className="small text-muted mb-2">{t("admin.edit.visibility.show")}</p>

                {visibilityFields.map(([name, label]) => (
                  <div className="form-check mb-1" key={name}>
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={name}
                      name={name}
                      defaultChecked={!!item[name]}
                    />
                    <label className="form-check-label" htmlFor={name}>{label}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* Admin notes */}
            <div className="card shadow-sm mb-3">
              <div className="card-body">
                <h6 className="card-title mb-2">{t("admin.edit.admin_notes")}</h6>
                <textarea
                  name="admin_notes"
                  className="form-control"
                  rows={2}
                  placeholder={t("admin.edit.admin_notes.placeholder")}
                  defaultValue={item.admin_notes}
                />
              </div>
            </div>

            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-primary">{t("admin.edit.save")}</button>
              <Link href="/admin/items" className="btn btn-outline-secondary">{t("admin.edit.cancel")}</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
