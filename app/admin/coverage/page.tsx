"use client";

import { useEffect, useState } from "react";
import { AdminGuard } from "@/components/admin-guard";
import { getAdminCoverageSummary, getAdminMe } from "@/lib/api";
import { clearAdminToken } from "@/lib/admin-auth";
import type { AdminCoverageSummary, AdminMe } from "@/lib/types";

export default function AdminCoveragePage() {
  return (
    <AdminGuard>
      <AdminCoverageContent />
    </AdminGuard>
  );
}

function AdminCoverageContent() {
  const [admin, setAdmin] = useState<AdminMe | null>(null);
  const [summary, setSummary] = useState<AdminCoverageSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [me, coverage] = await Promise.all([
          getAdminMe(),
          getAdminCoverageSummary(),
        ]);
        setAdmin(me);
        setSummary(coverage);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load admin coverage.");
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

  function severityLabel(severity: string) {
    switch (severity) {
      case "critical":
        return "Critical gap";
      case "high":
        return "High gap";
      case "medium":
        return "Medium gap";
      default:
        return "Low gap";
    }
  }

  return (
    <main className="page">
      <div className="container stack">
        <div className="card stack">
          <div className="row space-between" style={{ alignItems: "flex-start" }}>
            <div>
              <h1 className="title">Admin Coverage Gaps</h1>
              <p className="subtitle">
                Identify frequent problems that are not sufficiently covered by active levers.
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
          <div className="card">Loading coverage analysis...</div>
        ) : error ? (
          <div className="card" style={{ color: "var(--danger)" }}>
            {error}
          </div>
        ) : !summary ? (
          <div className="card">No coverage data available.</div>
        ) : (
          <>
            <div className="grid grid-2">
              <div className="card stack">
                <div className="section-title">Distinct detected problems</div>
                <div style={{ fontSize: 32, fontWeight: 700 }}>
                  {summary.total_distinct_problems}
                </div>
              </div>

              <div className="card stack">
                <div className="section-title">Coverage gaps found</div>
                <div style={{ fontSize: 32, fontWeight: 700 }}>
                  {summary.coverage_gaps.length}
                </div>
              </div>
            </div>

            <div className="card stack">
              <div className="section-title">Problem coverage analysis</div>

              {summary.coverage_gaps.length === 0 ? (
                <div className="muted">No problem coverage data yet.</div>
              ) : (
                <div className="stack">
                  {summary.coverage_gaps.map((item) => (
                    <div
                      key={item.problem}
                      className="stack"
                      style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}
                    >
                      <div className="row space-between" style={{ alignItems: "flex-start", gap: 12 }}>
                        <div className="stack" style={{ gap: 8 }}>
                          <div className="section-title">{item.problem}</div>

                          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                            <span className="badge">{severityLabel(item.severity)}</span>
                            <span className="badge">detected {item.detection_count}x</span>
                            <span className="badge">active levers: {item.active_lever_count}</span>
                            <span className="badge">inactive levers: {item.inactive_lever_count}</span>
                          </div>

                          {item.matching_lever_names.length > 0 ? (
                            <div className="stack" style={{ gap: 6 }}>
                              <div className="muted">Matching levers</div>
                              <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                                {item.matching_lever_names.map((name) => (
                                  <span key={name} className="badge">
                                    {name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="muted">No lever currently targets this problem.</div>
                          )}
                        </div>

                        <div>
                          <button
                            className="button ghost"
                            onClick={() => (window.location.href = "/admin/levers")}
                          >
                            Update catalog
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}