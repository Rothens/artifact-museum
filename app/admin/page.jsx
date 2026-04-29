import { initDb } from "../../lib/initDb.js";
import { getAllItemsWithStats } from "../../lib/db/items.js";
import { upsertAll } from "../../lib/import.js";
import UploadForm from "../../components/UploadForm.jsx";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  await initDb();
  const items = getAllItemsWithStats();
  const publicCount = items.filter((i) => i.is_public).length;
  const totalViews = items.reduce((sum, i) => sum + (i.view_count || 0), 0);

  async function importData(payload) {
    "use server";
    await initDb();
    return upsertAll(payload);
  }

  return (
    <div style={{ maxWidth: 800 }}>
      <h1 className="h3 mb-4">Dashboard</h1>

      <div className="row g-3 mb-5">
        {[
          { value: items.length, label: "Total items", color: "text-primary" },
          { value: publicCount, label: "Public", color: "text-success" },
          { value: totalViews, label: "Total views", color: "text-info" },
          { value: items.length - publicCount, label: "Hidden", color: "text-warning" },
        ].map(({ value, label, color }) => (
          <div key={label} className="col-6 col-md-3">
            <div className="card text-center shadow-sm">
              <div className="card-body">
                <div className={`fs-2 fw-bold ${color}`}>{value}</div>
                <div className="small text-muted">{label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h2 className="h5 mb-3">Import from Artifact Logger</h2>
      <UploadForm onImport={importData} />

      <p className="text-muted small mt-2">
        Upload the JSON export from the offline PWA. Re-importing is safe — existing visibility settings will not be overwritten.
      </p>
    </div>
  );
}
