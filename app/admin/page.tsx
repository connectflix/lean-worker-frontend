"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminGuard } from "@/components/admin-guard";
import { AdminShell } from "@/components/admin-shell";
import {
  getAdminDashboardSummary,
  getAdminMe,
  getAdminOrchestrationRuns,
} from "@/lib/api";
import { clearAdminToken } from "@/lib/admin-auth";
import type {
  AdminDashboardSummary,
  AdminMe,
  AdminOrchestrationRunSummary,
} from "@/lib/types";

export default function AdminDashboardPage() {
  return (
    <AdminGuard>
      <AdminDashboardContent />
    </AdminGuard>
  );
}

function isCriticalRun(run: AdminOrchestrationRunSummary): boolean {
  const escalations = run.escalations ?? [];
  const haystack = escalations.join(" | ").toLowerCase();

  if (run.status === "failed") return true;
  if (haystack.includes("founder")) return true;
  if (haystack.includes("critical")) return true;
  if (haystack.includes("p1")) return true;

  return false;
}

function getRunSeverityLabel(run: AdminOrchestrationRunSummary): string {
  const escalations = run.escalations ?? [];
  const haystack = escalations.join(" | ").toLowerCase();

  if (haystack.includes("founder")) return "founder";
  if (run.status === "failed" || haystack.includes("critical")) return "critical";
  if (haystack.includes("p1")) return "p1";
  return "alert";
}

function getRunSeverityStyle(run: AdminOrchestrationRunSummary): React.CSSProperties {
  const label = getRunSeverityLabel(run);

  if (label === "founder") {
    return {
      color: "var(--danger)",
      background: "rgba(220,38,38,0.10)",
      border: "1px solid rgba(220,38,38,0.25)",
      borderRadius: 999,
      padding: "4px 10px",
      fontWeight: 700,
    };
  }

  if (label === "critical") {
    return {
      color: "#b45309",
      background: "rgba(245,158,11,0.12)",
      border: "1px solid rgba(245,158,11,0.25)",
      borderRadius: 999,
      padding: "4px 10px",
      fontWeight: 700,
    };
  }

  return {
    color: "#92400e",
    background: "rgba(251,191,36,0.12)",
    border: "1px solid rgba(251,191,36,0.25)",
    borderRadius: 999,
    padding: "4px 10px",
    fontWeight: 700,
  };
}

function AdminDashboardContent() {
  const [admin, setAdmin] = useState<AdminMe | null>(null);
  const [summary, setSummary] = useState<AdminDashboardSummary | null>(null);
  const [alertRuns, setAlertRuns] = useState<AdminOrchestrationRunSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [me, dashboard, runs] = await Promise.all([
          getAdminMe(),
          getAdminDashboardSummary(),
          getAdminOrchestrationRuns(30),
        ]);

        setAdmin(me);
        setSummary(dashboard);
        setAlertRuns(runs.filter((run) => isCriticalRun(run)).slice(0, 6));
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

  const founderCount = useMemo(() => {
    return alertRuns.filter((run) =>
      (run.escalations ?? []).join(" | ").toLowerCase().includes("founder"),
    ).length;
  }, [alertRuns]);

  const criticalCount = useMemo(() => {
    return alertRuns.filter((run) => run.status === "failed" || isCriticalRun(run)).length;
  }, [alertRuns]);

  const topAlert = alertRuns[0] ?? null;

  return (
    <AdminShell
      activeHref="/admin"
      title="Admin Dashboard"
      subtitle="Overview of the platform, current alerts, and centralized agent reporting."
      adminEmail={admin?.email ?? null}
    >
      <div className="row space-between admin-dashboard-toolbar" style={{ flexWrap: "wrap", gap: 10 }}>
        <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
          <a className="button ghost" href="/admin/agent-reports">
            Agent Reports
          </a>
          <a className="button ghost" href="/admin/orchestration">
            Orchestration
          </a>
          <a className="button ghost" href="/admin/levers">
            Manage levers
          </a>
        </div>

        <button className="button ghost" onClick={handleAdminLogout}>
          Log out
        </button>
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
          {alertRuns.length > 0 ? (
            <div className="card admin-alert-hero stack">
              <div className="row space-between" style={{ gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
                <div className="stack" style={{ gap: 6 }}>
                  <div className="section-title" style={{ color: "var(--danger)" }}>
                    Founder / Critical alerts detected
                  </div>
                  <div className="muted">
                    {founderCount > 0
                      ? `${founderCount} founder escalation(s) and ${criticalCount} high-risk run(s) need attention.`
                      : `${criticalCount} high-risk orchestration run(s) need attention.`}
                  </div>
                  {topAlert ? (
                    <div className="muted">
                      Latest alert: <strong>#{topAlert.id}</strong> — {topAlert.scenario}
                    </div>
                  ) : null}
                </div>

                <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                  <button
                    className="button"
                    onClick={() => (window.location.href = "/admin/agent-reports?status=critical")}
                  >
                    Open agent reports
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          <div className="grid grid-3">
            <div className="card stack">
              <div className="section-title">Total levers</div>
              <div className="admin-metric-value">{summary.total_levers}</div>
            </div>

            <div className="card stack">
              <div className="section-title">Active levers</div>
              <div className="admin-metric-value">{summary.active_levers}</div>
            </div>

            <div className="card stack">
              <div className="section-title">Inactive levers</div>
              <div className="admin-metric-value">{summary.inactive_levers}</div>
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

          <div className="card stack">
            <div className="row space-between" style={{ gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <div className="section-title">Recent founder / critical runs</div>
              <button
                className="button ghost"
                onClick={() => (window.location.href = "/admin/agent-reports?status=critical")}
              >
                View in Agent Reports
              </button>
            </div>

            {alertRuns.length === 0 ? (
              <div className="muted">No founder or critical runs detected recently.</div>
            ) : (
              <div className="stack" style={{ gap: 10 }}>
                {alertRuns.map((run) => {
                  const escalations = run.escalations ?? [];

                  return (
                    <button
                      key={run.id}
                      type="button"
                      className="card-soft stack"
                      onClick={() =>
                        (window.location.href = `/admin/agent-reports?status=critical&run=${run.id}`)
                      }
                      style={{
                        gap: 8,
                        textAlign: "left",
                        cursor: "pointer",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <div className="row space-between" style={{ gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                          <span className="badge">#{run.id}</span>
                          <span className="badge">{run.scenario}</span>
                          <span
                            style={{
                              borderRadius: 999,
                              padding: "4px 10px",
                              color:
                                run.status === "failed"
                                  ? "var(--danger)"
                                  : run.status === "partial"
                                    ? "#b45309"
                                    : "var(--text)",
                              background: "rgba(15,23,42,0.06)",
                              fontWeight: 700,
                            }}
                          >
                            {run.status}
                          </span>
                          <span style={getRunSeverityStyle(run)}>
                            {getRunSeverityLabel(run)}
                          </span>
                        </div>

                        <div className="muted">
                          {new Date(run.created_at).toLocaleString()}
                        </div>
                      </div>

                      <div className="row space-between" style={{ gap: 12, flexWrap: "wrap" }}>
                        <div className="muted">
                          confidence {Number(run.confidence ?? 0).toFixed(2)}
                        </div>
                        <div className="muted">
                          {escalations.length > 0
                            ? `${escalations.length} escalation(s)`
                            : "No escalation"}
                        </div>
                      </div>

                      {escalations.length > 0 ? (
                        <div
                          className="muted"
                          style={{
                            color:
                              getRunSeverityLabel(run) === "founder"
                                ? "var(--danger)"
                                : "#92400e",
                          }}
                        >
                          {escalations[0]}
                        </div>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </AdminShell>
  );
}