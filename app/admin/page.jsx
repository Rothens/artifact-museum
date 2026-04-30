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

  async function importData(payload, rawSizeBytes) {
    "use server";
    await initDb();
    return await upsertAll(payload, { rawSizeBytes });
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

      <h2 className="h5 mb-3 mt-5">Backup</h2>
      <a href="/api/export" download className="btn btn-outline-secondary">
        <i className="bi bi-download me-2"></i>Export database as JSON
      </a>
      <p className="text-muted small mt-2">
        Downloads all codes and items as a JSON file. Keep regular backups — this is the only way to recover data if the server is lost.
      </p>

      <div className="card mt-5 border-0 shadow-sm overflow-hidden">
        <div className="card-body d-flex align-items-center gap-4 py-4" style={{ background: 'linear-gradient(135deg, #ff5f5f11 0%, #ff914d22 100%)' }}>
          <div className="fs-1 flex-shrink-0" aria-hidden="true">☕</div>
          <div className="flex-grow-1">
            <h5 className="mb-1 fw-bold">Support this project</h5>
            <p className="text-muted small mb-0">
              Artifact Museum and Artifact Logger are free and open source. If they are useful to you, a coffee is always appreciated!
            </p>
          </div>
          <a
            href="https://ko-fi.com/Nipponkalandor"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm flex-shrink-0 fw-semibold"
            style={{ background: '#ff5f5f', color: '#fff', whiteSpace: 'nowrap' }}
          >
            Buy me a coffee
          </a>
        </div>
      </div>
    </div>
  );
}
