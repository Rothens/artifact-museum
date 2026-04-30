import Link from "next/link";
import { initDb } from "../../../lib/initDb.js";
import {
  getTotalViewCount,
  getViewsPerDay,
  getTopItems,
  getTotalViewsByReferrer,
} from "../../../lib/db/analytics.js";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  await initDb();

  const totalViews = getTotalViewCount();
  const viewsPerDay = getViewsPerDay(30);
  const topItems = getTopItems(10);
  const byReferrer = getTotalViewsByReferrer();

  // Build a simple bar chart using inline styles (no JS library needed)
  const maxDayCount = Math.max(...viewsPerDay.map((r) => r.count), 1);
  const maxItemCount = Math.max(...topItems.map((r) => r.view_count), 1);

  return (
    <div style={{ maxWidth: 860 }}>
      <div className="d-flex align-items-center mb-4 gap-3">
        <h1 className="h3 mb-0">Analytics</h1>
        <span className="badge bg-secondary">{totalViews} total views</span>
      </div>

      {/* Referrer breakdown */}
      <div className="row g-3 mb-5">
        {byReferrer.map(({ referrer, count }) => (
          <div key={referrer} className="col-6 col-md-3">
            <div className="card text-center shadow-sm">
              <div className="card-body py-3">
                <div className="fs-3 fw-bold text-primary">{count}</div>
                <div className="small text-muted text-capitalize">{referrer}</div>
              </div>
            </div>
          </div>
        ))}
        {byReferrer.length === 0 && (
          <div className="col-12 text-muted">No views recorded yet.</div>
        )}
      </div>

      {/* Views per day — last 30 days */}
      <h2 className="h5 mb-3">Views per day <small className="text-muted fw-normal">(last 30 days)</small></h2>
      {viewsPerDay.length === 0 ? (
        <p className="text-muted">No views in the last 30 days.</p>
      ) : (
        <div className="card shadow-sm mb-5 p-3">
          <div
            className="d-flex align-items-end gap-1"
            style={{ height: 120, overflowX: "auto" }}
            title="Views per day"
          >
            {viewsPerDay.map(({ day, count }) => (
              <div
                key={day}
                className="flex-shrink-0 d-flex flex-column align-items-center"
                style={{ minWidth: 20 }}
                title={`${day}: ${count} views`}
              >
                <div
                  className="bg-primary rounded-top w-100"
                  style={{
                    height: `${Math.round((count / maxDayCount) * 100)}px`,
                    minHeight: 2,
                    opacity: 0.8,
                  }}
                />
                <div
                  className="text-muted mt-1"
                  style={{ fontSize: 9, writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                >
                  {day.slice(5)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top items */}
      <h2 className="h5 mb-3">Top items by views</h2>
      {topItems.length === 0 ? (
        <p className="text-muted">No views recorded yet.</p>
      ) : (
        <div className="card shadow-sm mb-4">
          <ul className="list-group list-group-flush">
            {topItems.map(({ id, label, code_name, view_count }) => (
              <li key={id} className="list-group-item d-flex align-items-center gap-3 py-2">
                <div className="flex-grow-1">
                  <div className="fw-semibold">{label || code_name || <em className="text-muted">Unnamed</em>}</div>
                  <div
                    className="bg-primary rounded mt-1"
                    style={{
                      height: 4,
                      width: `${Math.round((view_count / maxItemCount) * 100)}%`,
                      minWidth: 4,
                      opacity: 0.7,
                    }}
                  />
                </div>
                <div className="text-muted small fw-semibold" style={{ minWidth: 40, textAlign: "right" }}>
                  {view_count}
                </div>
                <Link href={`/admin/item/${id}`} className="btn btn-sm btn-outline-secondary">
                  Edit
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
