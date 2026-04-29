import Link from "next/link";
import { getLocale } from "../lib/locale.js";
import { getTranslations } from "../lib/i18n.js";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const locale = await getLocale();
  const t = getTranslations(locale);

  return (
    <main className="container py-5">
      <div className="text-center mb-5">
        <h1 className="display-5 fw-bold mb-2">{t("home.title")}</h1>
        <p className="text-muted">{t("home.subtitle")}</p>
      </div>

      <div className="row g-3 justify-content-center">
        <div className="col-12 col-sm-6 col-md-4">
          <Link href="/scan" className="card card-body text-center text-decoration-none h-100 p-4 shadow-sm hover-card">
            <i className="bi bi-qr-code-scan fs-1 mb-3 text-primary"></i>
            <h5 className="mb-1">{t("home.scan")}</h5>
            <p className="text-muted small mb-0">{t("home.scan.desc")}</p>
          </Link>
        </div>

        <div className="col-12 col-sm-6 col-md-4">
          <Link href="/browse" className="card card-body text-center text-decoration-none h-100 p-4 shadow-sm hover-card">
            <i className="bi bi-grid fs-1 mb-3 text-primary"></i>
            <h5 className="mb-1">{t("home.browse")}</h5>
            <p className="text-muted small mb-0">{t("home.browse.desc")}</p>
          </Link>
        </div>
      </div>
    </main>
  );
}
