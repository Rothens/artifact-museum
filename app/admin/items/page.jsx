import Link from "next/link";
import { initDb } from "../../../lib/initDb.js";
import { getAllItemsWithStats } from "../../../lib/db/items.js";
import { getLocale } from "../../../lib/locale.js";
import { getTranslations } from "../../../lib/i18n.js";

export const dynamic = "force-dynamic";

export default async function AdminItemsPage() {
  await initDb();
  const items = getAllItemsWithStats();
  const locale = await getLocale();
  const t = getTranslations(locale);

  return (
    <div>
      <div className="d-flex align-items-center mb-4 gap-3">
        <h1 className="h3 mb-0">{t("admin.items.title")}</h1>
        <span className="badge bg-secondary">{items.length}</span>
      </div>

      {items.length === 0 ? (
        <div className="text-center text-muted py-5">
          <p>No items imported yet. <Link href="/admin">Upload an export</Link> to get started.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th style={{ width: 48 }}></th>
                <th>{t("admin.items.name")}</th>
                <th>{t("admin.items.category")}</th>
                <th>{t("admin.items.public")}</th>
                <th className="text-end">{t("admin.items.views")}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    {item.show_photo && item.photo_data_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.photo_data_url}
                        alt=""
                        className="rounded"
                        style={{ width: 40, height: 40, objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        className="rounded bg-light d-flex align-items-center justify-content-center text-muted"
                        style={{ width: 40, height: 40 }}
                      >
                        <i className="bi bi-image"></i>
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="fw-semibold">{item.label || item.code_name || <em className="text-muted">{t("admin.items.unnamed")}</em>}</div>
                    {item.collected_at && (
                      <div className="text-muted small">{new Date(item.collected_at).toLocaleDateString()}</div>
                    )}
                  </td>
                  <td>
                    <span className="badge bg-light text-secondary border text-capitalize">{item.category}</span>
                  </td>
                  <td>
                    {item.is_public ? (
                      <span className="badge bg-success">{t("admin.items.yes")}</span>
                    ) : (
                      <span className="badge bg-secondary">{t("admin.items.no")}</span>
                    )}
                  </td>
                  <td className="text-end">
                    <span className="text-muted">{item.view_count ?? 0}</span>
                  </td>
                  <td>
                    <Link href={`/admin/item/${item.id}`} className="btn btn-sm btn-outline-primary">
                      {t("admin.items.edit")}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
