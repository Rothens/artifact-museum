import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getLocale } from "../../lib/locale.js";
import { getTranslations } from "../../lib/i18n.js";

export const dynamic = "force-dynamic";

export default async function VisitorLoginPage({ searchParams }) {
  const next = (await searchParams).next || "/";
  const error = (await searchParams).error;
  const locale = await getLocale();
  const t = getTranslations(locale);

  async function enter(formData) {
    "use server";
    const password = formData.get("password") ?? "";
    const expected = process.env.VISITOR_PASSWORD ?? "";
    if (password === expected) {
      const cookieStore = await cookies();
      cookieStore.set({
        name: "am_visitor",
        value: expected,
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
      redirect(next);
    } else {
      redirect(`/visitor-login?next=${encodeURIComponent(next)}&error=1`);
    }
  }

  return (
    <main className="container py-5" style={{ maxWidth: 380 }}>
      <div className="card shadow-sm">
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <i className="bi bi-museum fs-1 text-muted d-block mb-2"></i>
            <h1 className="h4 mb-0">{t("home.title")}</h1>
          </div>

          {error && (
            <div className="alert alert-danger py-2 small">{t("visitor.wrongPassword")}</div>
          )}

          <form action={enter}>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">{t("visitor.password")}</label>
              <input
                id="password"
                name="password"
                type="password"
                className="form-control"
                autoFocus
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100">{t("visitor.enter")}</button>
          </form>
        </div>
      </div>
    </main>
  );
}
