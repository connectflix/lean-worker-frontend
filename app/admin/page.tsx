"use client";

import { useEffect, useState } from "react";
import { AdminGuard } from "@/components/admin-guard";
import { getAdminDashboardSummary, getAdminMe } from "@/lib/api";
import { clearAdminToken } from "@/lib/admin-auth";
import type { AdminDashboardSummary, AdminMe } from "@/lib/types";

export default function AdminDashboardPage() {
  return (
    <AdminGuard>
      <AdminDashboardContent />
    </AdminGuard>
  );
}

function AdminDashboardContent() {
  const [admin, setAdmin] = useState<AdminMe | null>(null);
  const [summary, setSummary] = useState<AdminDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [me, dashboard] = await Promise.all([
          getAdminMe(),
          getAdminDashboardSummary(),
        ]);
        setAdmin(me);
        setSummary(dashboard);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load admin dashboard.");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  function handleAdminLogout() {
    clearAdminToken();
    window.location.href = "/admin/login";
  }

  return (
    <main className="page">
      <div className="container stack">
        <div className="card stack">
          <div className="row space-between" style={{ alignItems: "flex-start" }}>
            <div>
              <h1 className="title">Admin Dashboard</h1>
              <p className="subtitle">
                Overview of the lever catalog that powers recommendation matching.
              </p>
              {admin ? <div className="muted">Signed in as {admin.email}</div> : null}
            </div>

            <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
              <button className="button ghost" onClick={() => (window.location.href = "/admin/intelligence")}>
                Intelligence
              </button>
              <button className="button ghost" onClick={() => (window.location.href = "/admin/coverage")}>
                Coverage
              </button>
              <button className="button ghost" onClick={() => (window.location.href = "/admin/quality")}>
                Quality
              </button>
              <button className="button ghost" onClick={() => (window.location.href = "/admin/levers")}>
                Manage levers
              </button>
              <button className="button ghost" onClick={handleAdminLogout}>
                Log out
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="card">Loading admin dashboard...</div>
        ) : error ? (
          <div className="card" style={{ color: "var(--danger)" }}>
            {error}
          </div>
        ) : !summary ? (
          <div className="card">No admin data available.</div>
        ) : (
          <>
            <div className="grid grid-3">
              <div className="card stack">
                <div className="section-title">Total levers</div>
                <div style={{ fontSize: 32, fontWeight: 700 }}>{summary.total_levers}</div>
              </div>

              <div className="card stack">
                <div className="section-title">Active levers</div>
                <div style={{ fontSize: 32, fontWeight: 700 }}>{summary.active_levers}</div>
              </div>

              <div className="card stack">
                <div className="section-title">Inactive levers</div>
                <div style={{ fontSize: 32, fontWeight: 700 }}>{summary.inactive_levers}</div>
              </div>
            </div>

            <div className="grid grid-2">
              <div className="card stack">
                <div className="section-title">Category breakdown</div>

                {summary.category_breakdown.length === 0 ? (
                  <div className="muted">No lever categories yet.</div>
                ) : (
                  <div className="stack">
                    {summary.category_breakdown.map((item) => (
                      <div
                        key={item.category}
                        className="row space-between"
                        style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}
                      >
                        <span>{item.category}</span>
                        <span className="badge">{item.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="card stack">
                <div className="section-title">Recent levers</div>

                {summary.recent_levers.length === 0 ? (
                  <div className="muted">No levers yet.</div>
                ) : (
                  <div className="stack">
                    {summary.recent_levers.map((item) => (
                      <div
                        key={item.id}
                        className="stack"
                        style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}
                      >
                        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                          <span className="badge">#{item.id}</span>
                          <span className="badge">{item.category}</span>
                          <span className="badge">{item.is_active ? "active" : "inactive"}</span>
                        </div>
                        <strong>{item.name}</strong>
                        <div className="muted">
                          Created {new Date(item.created_at).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}