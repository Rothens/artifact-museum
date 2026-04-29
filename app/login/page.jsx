import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { verifyPassword, makeSignedValue } from "../../lib/auth.js";
import { cookies } from "next/headers";
import { checkRateLimit, recordFailedAttempt, clearAttempts } from "../../lib/rateLimit.js";

export default async function LoginPage({ searchParams }) {
  const next = (await searchParams).next || "/admin";
  const error = (await searchParams).error;
  const locked = (await searchParams).locked;

  async function login(formData) {
    "use server";
    const headerStore = await headers();
    const ip =
      headerStore.get("x-forwarded-for")?.split(",")[0].trim() ||
      headerStore.get("x-real-ip") ||
      "unknown";

    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) {
      redirect(`/login?next=${encodeURIComponent(next)}&locked=1`);
    }

    const password = formData.get("password");
    if (verifyPassword(password)) {
      clearAttempts(ip);
      const cookieStore = await cookies();
      cookieStore.set({
        name: "am_auth",
        value: makeSignedValue("authenticated"),
        httpOnly: true,
        sameSite: "strict",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      });
      redirect(next);
    } else {
      recordFailedAttempt(ip);
      redirect(`/login?next=${encodeURIComponent(next)}&error=1`);
    }
  }

  return (
    <main className="container py-5" style={{ maxWidth: 380 }}>
      <div className="card shadow-sm">
        <div className="card-body p-4">
          <h1 className="h4 mb-4 text-center">Admin Login</h1>

          {locked && (
            <div className="alert alert-danger py-2 small">
              Too many failed attempts. Try again in 15 minutes.
            </div>
          )}

          {error && !locked && (
            <div className="alert alert-danger py-2 small">Incorrect password.</div>
          )}

          <form action={login}>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                className="form-control"
                autoFocus
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100">Sign in</button>
          </form>
        </div>
      </div>
    </main>
  );
}
