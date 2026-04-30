import { redirect } from "next/navigation";
import { initDb } from "../../../lib/initDb.js";
import { createToken, listTokens, revokeToken } from "../../../lib/db/tokens.js";

export const dynamic = "force-dynamic";

export default async function AdminTokensPage({ searchParams }) {
  await initDb();
  const tokens = listTokens();
  const params = await searchParams;
  // newToken is set once after creation and shown inline — cleared on next load
  const newToken = params?.new ?? null;

  async function handleCreate(formData) {
    "use server";
    await initDb();
    const name = (formData.get("name") ?? "").trim();
    if (!name) return;
    const { rawToken } = createToken(name);
    redirect(`/admin/tokens?new=${encodeURIComponent(rawToken)}`);
  }

  async function handleRevoke(formData) {
    "use server";
    await initDb();
    const id = formData.get("id");
    if (id) revokeToken(id);
    redirect("/admin/tokens");
  }

  return (
    <div style={{ maxWidth: 700 }}>
      <h1 className="h3 mb-1">API Tokens</h1>
      <p className="text-muted mb-4">
        Tokens let the Artifact Logger app push data directly to this museum.
        Each token is shown only once — copy it before navigating away.
      </p>

      {/* One-time new token banner */}
      {newToken && (
        <div className="alert alert-success mb-4">
          <div className="fw-semibold mb-1">
            <i className="bi bi-check-circle me-2"></i>Token created — copy it now, it won&apos;t be shown again
          </div>
          <code
            className="d-block user-select-all bg-white border rounded px-3 py-2 mt-2"
            style={{ wordBreak: "break-all", fontSize: "0.85rem" }}
          >
            {newToken}
          </code>
        </div>
      )}

      {/* Existing tokens */}
      {tokens.length > 0 ? (
        <div className="card shadow-sm mb-4">
          <table className="table table-hover mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>Created</th>
                <th>Last used</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {tokens.map((tok) => (
                <tr key={tok.id}>
                  <td className="fw-semibold">{tok.name}</td>
                  <td className="text-muted small">{new Date(tok.created_at).toLocaleDateString()}</td>
                  <td className="text-muted small">{tok.last_used_at ? new Date(tok.last_used_at).toLocaleString() : "Never"}</td>
                  <td>
                    <form action={handleRevoke}>
                      <input type="hidden" name="id" value={tok.id} />
                      <button type="submit" className="btn btn-sm btn-outline-danger">
                        <i className="bi bi-trash me-1"></i>Revoke
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-muted mb-4">No tokens yet.</p>
      )}

      {/* Create new token */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h2 className="h6 mb-3">Create new token</h2>
          <form action={handleCreate} className="d-flex gap-2">
            <input
              name="name"
              className="form-control"
              placeholder='Label, e.g. "My Phone"'
              required
              maxLength={80}
            />
            <button type="submit" className="btn btn-primary text-nowrap">
              <i className="bi bi-plus-lg me-1"></i>Create
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
