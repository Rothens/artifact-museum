import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { isAuthenticated } from "../../lib/auth.js";
import { initDb } from "../../lib/initDb.js";
import LogoutButton from "../../components/LogoutButton.jsx";
import LanguageSwitcher from "../../components/LanguageSwitcher.jsx";
import { getLocale } from "../../lib/locale.js";
import { getTranslations } from "../../lib/i18n.js";

export default async function AdminLayout({ children }) {
  await initDb();
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  if (!isAuthenticated(cookieHeader)) {
    redirect("/login");
  }

  const locale = await getLocale();
  const t = getTranslations(locale);

  return (
    <div>
      <nav className="navbar navbar-expand navbar-dark bg-dark px-3">
        <Link href="/admin" className="navbar-brand fw-bold">
          <i className="bi bi-shield-lock me-2"></i>{t("nav.admin")}
        </Link>
        <div className="navbar-nav ms-auto gap-2 align-items-center">
          <Link href="/admin/items" className="nav-link">{t("nav.items")}</Link>
          <Link href="/" className="nav-link" target="_blank" rel="noopener noreferrer">
            {t("nav.public")} <i className="bi bi-box-arrow-up-right small"></i>
          </Link>
          <LanguageSwitcher currentLocale={locale} />
          <LogoutButton />
        </div>
      </nav>
      <div className="container-fluid py-4">
        {children}
      </div>
    </div>
  );
}
