"use client";

import { useEffect, useState } from "react";
import { AdminGuard } from "@/components/admin-guard";
import { getAdminMe, getAdminQualitySummary } from "@/lib/api";
import { clearAdminToken } from "@/lib/admin-auth";
import type { AdminLeverQualitySummary, AdminMe } from "@/lib/types";

export default function AdminQualityPage() {
  return (
    <AdminGuard>
      <AdminQualityContent />
    </AdminGuard>
  );
}

function AdminQualityContent() {
  const [admin, setAdmin] = useState<AdminMe | null>(null);
  const [summary, setSummary] = useState<AdminLeverQualitySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [me, quality] = await Promise.all([
          getAdminMe(),
          getAdminQualitySummary(),
        ]);
        setAdmin(me);
        setSummary(quality);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load admin quality.");
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
              <h1 className="title">Admin Lever Quality</h1>
              <p className="subtitle">
                Rank levers by usefulness, usage, targeting richness, and readiness for recommendation matching.
              </p>
              {admin ? <div className="muted">Signed in as {admin.email}</div> : null}
            </div>

            <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
              <button className="button ghost" onClick={() => (window.location.href = "/admin")}>
                Dashboard
              </button>
              <button className="button ghost" onClick={() => (window.location.href = "/admin/intelligence")}>
                Intelligence
              </button>
              <button className="button ghost" onClick={() => (window.location.href = "/admin/coverage")}>
                Coverage
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
          <div className="card">Loading quality analysis...</div>
        ) : error ? (
          <div className="card" style={{ color: "var(--danger)" }}>
            {error}
          </div>
        ) : !summary ? (
          <div className="card">No quality data available.</div>
        ) : (
          <>
            <div className="card stack">
              <div className="section-title">Total levers evaluated</div>
              <div style={{ fontSize: 32, fontWeight: 700 }}>{summary.total_levers}</div>
            </div>

            <div className="grid grid-2">
              <div className="card stack">
                <div className="section-title">Top quality levers</div>

                {summary.top_quality_levers.length === 0 ? (
                  <div className="muted">No levers available.</div>
                ) : (
                  <div className="stack">
                    {summary.top_quality_levers.map((item) => (
                      <div
                        key={item.lever_id}
                        className="stack"
                        style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}
                      >
                        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                          <span className="badge">#{item.lever_id}</span>
                          <span className="badge">{item.category}</span>
                          <span className="badge">{item.quality_label}</span>
                          <span className="badge">score: {item.quality_score}</span>
                          <span className="badge">used {item.usage_count}x</span>
                        </div>

                        <strong>{item.name}</strong>

                        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                          <span className="badge">problems: {item.target_problem_count}</span>
                          <span className="badge">tags: {item.tag_count}</span>
                          <span className="badge">{item.is_active ? "active" : "inactive"}</span>
                        </div>

                        <div className="muted">{item.reasons.join(" · ")}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="card stack">
                <div className="section-title">Lowest quality levers</div>

                {summary.lowest_quality_levers.length === 0 ? (
                  <div className="muted">No levers available.</div>
                ) : (
                  <div className="stack">
                    {summary.lowest_quality_levers.map((item) => (
                      <div
                        key={item.lever_id}
                        className="stack"
                        style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}
                      >
                        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                          <span className="badge">#{item.lever_id}</span>
                          <span className="badge">{item.category}</span>
                          <span className="badge">{item.quality_label}</span>
                          <span className="badge">score: {item.quality_score}</span>
                          <span className="badge">used {item.usage_count}x</span>
                        </div>

                        <strong>{item.name}</strong>

                        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                          <span className="badge">problems: {item.target_problem_count}</span>
                          <span className="badge">tags: {item.tag_count}</span>
                          <span className="badge">{item.is_active ? "active" : "inactive"}</span>
                        </div>

                        <div className="muted">{item.reasons.join(" · ")}</div>
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