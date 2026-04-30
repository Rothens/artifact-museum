import Link from "next/link";
import { initDb } from "../../../lib/initDb.js";
import { getAllItemsWithStats, getAllCategories } from "../../../lib/db/items.js";
import { getLocale } from "../../../lib/locale.js";
import { getTranslations } from "../../../lib/i18n.js";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

export default async function AdminItemsPage({ searchParams }) {
  await initDb();
  const allItems = getAllItemsWithStats();
  const categories = getAllCategories();
  const locale = await getLocale();
  const t = getTranslations(locale);

  const params = await searchParams;
  const search = (params?.q ?? "").toLowerCase().trim();
  const categoryFilter = params?.cat ?? "";
  const visibilityFilter = params?.vis ?? ""; // "public" | "hidden" | ""

  // Apply filters in JS (all items already loaded)
  const filtered = allItems.filter((item) => {
    if (search) {
      const name = (item.label || item.code_name || "").toLowerCase();
      if (!name.includes(search)) return false;
    }
    if (categoryFilter && item.category !== categoryFilter) return false;
    if (visibilityFilter === "public" && !item.is_public) return false;
    if (visibilityFilter === "hidden" && item.is_public) return false;
    return true;
  });

  const page = Math.max(1, parseInt(params?.page ?? "1", 10) || 1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const items = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Build a URL preserving filters but changing page
  function pageUrl(p) {
    const qs = new URLSearchParams();
    if (search) qs.set("q", params.q);
    if (categoryFilter) qs.set("cat", categoryFilter);
    if (visibilityFilter) qs.set("vis", visibilityFilter);
    qs.set("page", String(p));
    return `?${qs.toString()}`;
  }

  const hasActiveFilter = search || categoryFilter || visibilityFilter;

  return (
    <div>
      <div className="d-flex align-items-center mb-4 gap-3">
        <h1 className="h3 mb-0">{t("admin.items.title")}</h1>
        <span className="badge bg-secondary">
          {hasActiveFilter ? `${filtered.length} / ${allItems.length}` : allItems.length}
        </span>
      </div>

      {/* Filter bar */}
      <form method="GET" className="row g-2 mb-4 align-items-end">
        <div className="col-12 col-sm-5">
          <input
            type="search"
            name="q"
            className="form-control"
            placeholder={t("admin.items.search.placeholder")}
            defaultValue={params?.q ?? ""}
          />
        </div>
        <div className="col-6 col-sm-3">
          <select name="cat" className="form-select" defaultValue={categoryFilter}>
            <option value="">{t("admin.items.filter.all")}</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="col-6 col-sm-3">
          <select name="vis" className="form-select" defaultValue={visibilityFilter}>
            <option value="">{t("admin.items.filter.visibility")}</option>
            <option value="public">{t("admin.items.filter.public")}</option>
            <option value="hidden">{t("admin.items.filter.hidden")}</option>
          </select>
        </div>
        <div className="col-12 col-sm-1 d-flex gap-2">
          <button type="submit" className="btn btn-primary flex-grow-1">
            <i className="bi bi-search"></i>
          </button>
          {hasActiveFilter && (
            <Link href="/admin/items" className="btn btn-outline-secondary">
              <i className="bi bi-x-lg"></i>
            </Link>
          )}
        </div>
      </form>

      {items.length === 0 ? (
        <div className="text-center text-muted py-5">
          {hasActiveFilter ? (
            <p>{t("admin.items.empty.filtered")}</p>
          ) : (
            <p>No items imported yet. <Link href="/admin">Upload an export</Link> to get started.</p>
          )}
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
                    {item.photo_data_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.photo_data_url}
                        alt=""
                        className="rounded"
                        style={{ width: 40, height: 40, objectFit: "cover" }}
                        loading="lazy"
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

      {totalPages > 1 && (
        <nav className="mt-4 d-flex justify-content-center">
          <ul className="pagination">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <Link className="page-link" href={pageUrl(currentPage - 1)}>&laquo;</Link>
            </li>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <li key={p} className={`page-item ${p === currentPage ? "active" : ""}`}>
                <Link className="page-link" href={pageUrl(p)}>{p}</Link>
              </li>
            ))}
            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
              <Link className="page-link" href={pageUrl(currentPage + 1)}>&raquo;</Link>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}
