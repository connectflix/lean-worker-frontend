"use client";

import { useEffect, useState } from "react";
import { AdminGuard } from "@/components/admin-guard";
import { getAdminIntelligenceSummary, getAdminMe } from "@/lib/api";
import { clearAdminToken } from "@/lib/admin-auth";
import type { AdminIntelligenceSummary, AdminMe } from "@/lib/types";

export default function AdminIntelligencePage() {
  return (
    <AdminGuard>
      <AdminIntelligenceContent />
    </AdminGuard>
  );
}

function AdminIntelligenceContent() {
  const [admin, setAdmin] = useState<AdminMe | null>(null);
  const [summary, setSummary] = useState<AdminIntelligenceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [me, intelligence] = await Promise.all([
          getAdminMe(),
          getAdminIntelligenceSummary(),
        ]);
        setAdmin(me);
        setSummary(intelligence);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load admin intelligence.");
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
              <h1 className="title">Admin Intelligence</h1>
              <p className="subtitle">
                Levers insights
              </p>
              {admin ? <div className="muted">Signed in as {admin.email}</div> : null}
            </div>

            <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
              <button className="button ghost" onClick={() => (window.location.href = "/admin")}>
                Dashboard
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
          <div className="card">Loading admin intelligence...</div>
        ) : error ? (
          <div className="card" style={{ color: "var(--danger)" }}>
            {error}
          </div>
        ) : !summary ? (
          <div className="card">No intelligence data available.</div>
        ) : (
          <>
            <div className="grid grid-3">
              <div className="card stack">
                <div className="section-title">Problem detections</div>
                <div style={{ fontSize: 32, fontWeight: 700 }}>
                  {summary.total_problem_detections}
                </div>
              </div>

              <div className="card stack">
                <div className="section-title">Most used levers</div>
                <div style={{ fontSize: 32, fontWeight: 700 }}>
                  {summary.most_used_levers.length}
                </div>
              </div>

              <div className="card stack">
                <div className="section-title">Unused levers</div>
                <div style={{ fontSize: 32, fontWeight: 700 }}>
                  {summary.unused_levers.length}
                </div>
              </div>
            </div>

            <div className="grid grid-2">
              <div className="card stack">
                <div className="section-title">Top primary problems</div>

                {summary.top_primary_problems.length === 0 ? (
                  <div className="muted">No primary problems recorded yet.</div>
                ) : (
                  <div className="stack">
                    {summary.top_primary_problems.map((item) => (
                      <div
                        key={item.problem}
                        className="row space-between"
                        style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}
                      >
                        <span>{item.problem}</span>
                        <span className="badge">{item.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="card stack">
                <div className="section-title">Top secondary problems</div>

                {summary.top_secondary_problems.length === 0 ? (
                  <div className="muted">No secondary problems recorded yet.</div>
                ) : (
                  <div className="stack">
                    {summary.top_secondary_problems.map((item) => (
                      <div
                        key={item.problem}
                        className="row space-between"
                        style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}
                      >
                        <span>{item.problem}</span>
                        <span className="badge">{item.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-2">
              <div className="card stack">
                <div className="section-title">Most used levers</div>

                {summary.most_used_levers.length === 0 ? (
                  <div className="muted">No lever usage yet.</div>
                ) : (
                  <div className="stack">
                    {summary.most_used_levers.map((item) => (
                      <div
                        key={item.lever_id}
                        className="stack"
                        style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}
                      >
                        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                          <span className="badge">#{item.lever_id}</span>
                          <span className="badge">{item.category}</span>
                          <span className="badge">{item.is_active ? "active" : "inactive"}</span>
                          <span className="badge">used {item.usage_count}x</span>
                        </div>
                        <strong>{item.name}</strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="card stack">
                <div className="section-title">Unused levers</div>

                {summary.unused_levers.length === 0 ? (
                  <div className="muted">Every lever has been used at least once.</div>
                ) : (
                  <div className="stack">
                    {summary.unused_levers.map((item) => (
                      <div
                        key={item.lever_id}
                        className="stack"
                        style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}
                      >
                        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                          <span className="badge">#{item.lever_id}</span>
                          <span className="badge">{item.category}</span>
                          <span className="badge">{item.is_active ? "active" : "inactive"}</span>
                        </div>
                        <strong>{item.name}</strong>
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