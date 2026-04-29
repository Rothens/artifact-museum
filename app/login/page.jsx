import { redirect } from "next/navigation";
import { verifyPassword, makeAuthCookie } from "../../lib/auth.js";
import { cookies } from "next/headers";

export default async function LoginPage({ searchParams }) {
  const next = (await searchParams).next || "/admin";
  const error = (await searchParams).error;

  async function login(formData) {
    "use server";
    const password = formData.get("password");
    if (verifyPassword(password)) {
      const cookieStore = await cookies();
      cookieStore.set({
        name: "am_auth",
        value: makeAuthCookie().split("=")[1].split(";")[0],
        httpOnly: true,
        sameSite: "strict",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      });
      redirect(next);
    } else {
      redirect(`/login?next=${encodeURIComponent(next)}&error=1`);
    }
  }

  return (
    <main className="container py-5" style={{ maxWidth: 380 }}>
      <div className="card shadow-sm">
        <div className="card-body p-4">
          <h1 className="h4 mb-4 text-center">Admin Login</h1>

          {error && (
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
