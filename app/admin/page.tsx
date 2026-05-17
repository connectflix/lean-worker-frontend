"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { AdminGuard } from "@/components/admin-guard";
import { AdminShell } from "@/components/admin-shell";
import {
  getAdminDashboardSummary,
  getAdminMe,
  getAdminOrchestrationRuns,
} from "@/lib/api";
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

function getRunSeverityStyle(run: AdminOrchestrationRunSummary): CSSProperties {
  const label = getRunSeverityLabel(run);

  const base: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 999,
    padding: "5px 10px",
    fontSize: 12,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  };

  if (label === "founder") {
    return {
      ...base,
      color: "#b91c1c",
      background: "rgba(239,68,68,0.12)",
      border: "1px solid rgba(239,68,68,0.25)",
    };
  }

  if (label === "critical") {
    return {
      ...base,
      color: "#b45309",
      background: "rgba(245,158,11,0.14)",
      border: "1px solid rgba(245,158,11,0.28)",
    };
  }

  if (label === "p1") {
    return {
      ...base,
      color: "#92400e",
      background: "rgba(251,191,36,0.14)",
      border: "1px solid rgba(251,191,36,0.28)",
    };
  }

  return {
    ...base,
    color: "#475569",
    background: "rgba(100,116,139,0.12)",
    border: "1px solid rgba(100,116,139,0.2)",
  };
}

function getRunStatusStyle(status: string): CSSProperties {
  const normalized = status.toLowerCase();

  const base: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 999,
    padding: "5px 10px",
    fontSize: 12,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  };

  if (normalized === "completed" || normalized === "success") {
    return {
      ...base,
      color: "#15803d",
      background: "rgba(34,197,94,0.12)",
      border: "1px solid rgba(34,197,94,0.24)",
    };
  }

  if (normalized === "partial") {
    return {
      ...base,
      color: "#b45309",
      background: "rgba(245,158,11,0.14)",
      border: "1px solid rgba(245,158,11,0.28)",
    };
  }

  if (normalized === "failed") {
    return {
      ...base,
      color: "#b91c1c",
      background: "rgba(239,68,68,0.12)",
      border: "1px solid rgba(239,68,68,0.25)",
    };
  }

  return {
    ...base,
    color: "#475569",
    background: "rgba(100,116,139,0.12)",
    border: "1px solid rgba(100,116,139,0.2)",
  };
}

function formatDateTime(value?: string | null): string {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AdminMetricCard({
  label,
  value,
  helper,
  tone = "default",
}: {
  label: string;
  value: string | number;
  helper?: string;
  tone?: "default" | "success" | "warning" | "danger" | "primary";
}) {
  const toneStyle: CSSProperties =
    tone === "success"
      ? {
          border: "1px solid rgba(34,197,94,0.24)",
          background: "rgba(34,197,94,0.08)",
        }
      : tone === "warning"
        ? {
            border: "1px solid rgba(245,158,11,0.28)",
            background: "rgba(245,158,11,0.08)",
          }
        : tone === "danger"
          ? {
              border: "1px solid rgba(239,68,68,0.24)",
              background: "rgba(239,68,68,0.08)",
            }
          : tone === "primary"
            ? {
                border: "1px solid rgba(59,130,246,0.22)",
                background: "rgba(59,130,246,0.07)",
              }
            : {};

  return (
    <div className="card-soft stack admin-kpi-card" style={{ gap: 6, ...toneStyle }}>
      <div className="muted">{label}</div>

      <div className="admin-metric-value" style={{ fontSize: 30 }}>
        {value}
      </div>

      {helper ? (
        <div className="muted" style={{ fontSize: 12 }}>
          {helper}
        </div>
      ) : null}
    </div>
  );
}

function AdminDashboardContent() {
  const [admin, setAdmin] = useState<AdminMe | null>(null);
  const [summary, setSummary] = useState<AdminDashboardSummary | null>(null);
  const [alertRuns, setAlertRuns] = useState<AdminOrchestrationRunSummary[]>([]);
  const [recentRuns, setRecentRuns] = useState<AdminOrchestrationRunSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadDashboard() {
    setLoading(true);
    setError(null);

    try {
      const [me, dashboard, runs] = await Promise.all([
        getAdminMe(),
        getAdminDashboardSummary(),
        getAdminOrchestrationRuns(30),
      ]);

      setAdmin(me);
      setSummary(dashboard);
      setRecentRuns(runs.slice(0, 8));
      setAlertRuns(runs.filter((run) => isCriticalRun(run)).slice(0, 6));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admin dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  const founderCount = useMemo(() => {
    return alertRuns.filter((run) =>
      (run.escalations ?? []).join(" | ").toLowerCase().includes("founder"),
    ).length;
  }, [alertRuns]);

  const failedRunCount = useMemo(() => {
    return recentRuns.filter((run) => run.status === "failed").length;
  }, [recentRuns]);

  const criticalCount = useMemo(() => {
    return alertRuns.filter((run) => run.status === "failed" || isCriticalRun(run)).length;
  }, [alertRuns]);

  const topAlert = alertRuns[0] ?? null;

  return (
    <AdminShell
      activeHref="/admin"
      title="Admin Dashboard"
      subtitle="Platform control center for operations, levers, orchestration alerts, and agent reporting."
      adminEmail={admin?.email ?? null}
      adminRole={admin?.role ?? "admin"}
      adminOrganizationName={admin?.organization_name ?? null}
    >
      {loading ? (
        <div className="card">Loading admin dashboard...</div>
      ) : error ? (
        <div className="card" style={{ color: "var(--danger)" }}>
          {error}
        </div>
      ) : !summary ? (
        <div className="card">No admin data available.</div>
      ) : (
        <div className="stack" style={{ gap: 18 }}>
          <div
            className="card stack"
            style={{
              gap: 18,
              overflow: "hidden",
              border: alertRuns.length > 0
                ? "1px solid rgba(239,68,68,0.18)"
                : "1px solid rgba(59,130,246,0.16)",
              background:
                alertRuns.length > 0
                  ? "linear-gradient(135deg, rgba(239,68,68,0.08), rgba(255,255,255,0.94) 44%, rgba(59,130,246,0.06))"
                  : "linear-gradient(135deg, rgba(59,130,246,0.09), rgba(255,255,255,0.94) 45%, rgba(34,197,94,0.06))",
            }}
          >
            <div
              className="row space-between"
              style={{ gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}
            >
              <div className="stack" style={{ gap: 8, maxWidth: 820 }}>
                <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                  <span className="badge primary">Control center</span>

                  {alertRuns.length > 0 ? (
                    <span className="badge warning">
                      {criticalCount} alert{criticalCount > 1 ? "s" : ""}
                    </span>
                  ) : (
                    <span className="badge success">No critical alert</span>
                  )}
                </div>

                <div
                  style={{
                    fontSize: 30,
                    lineHeight: 1.08,
                    fontWeight: 900,
                    letterSpacing: "-0.055em",
                  }}
                >
                  LeanWorker backoffice cockpit
                </div>

                <div className="muted" style={{ maxWidth: 780, lineHeight: 1.65 }}>
                  Monitor platform readiness, catalog coverage, recent lever activity and
                  orchestration risks from one place. Use this page as the first operational
                  checkpoint before drilling into reports, workers, organizations or levers.
                </div>
              </div>

              <div className="row" style={{ gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                <Link className="button ghost" href="/admin/agent-reports">
                  Agent reports
                </Link>

                <Link className="button ghost" href="/admin/orchestration">
                  Orchestration
                </Link>

                <Link className="button ghost" href="/admin/levers">
                  Manage levers
                </Link>

                <button
                  className="button"
                  type="button"
                  onClick={() => void loadDashboard()}
                  disabled={loading}
                >
                  Refresh dashboard
                </button>
              </div>
            </div>

            {alertRuns.length > 0 ? (
              <div
                className="card-soft"
                style={{
                  border: "1px solid rgba(239,68,68,0.22)",
                  background: "rgba(239,68,68,0.08)",
                }}
              >
                <div
                  className="row space-between"
                  style={{ gap: 12, flexWrap: "wrap", alignItems: "center" }}
                >
                  <div className="stack" style={{ gap: 4 }}>
                    <div className="section-title" style={{ fontSize: 16, color: "#b91c1c" }}>
                      Founder / critical alerts detected
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

                  <Link className="button" href="/admin/agent-reports?status=critical">
                    Open critical reports
                  </Link>
                </div>
              </div>
            ) : null}
          </div>

          <div className="admin-kpi-scroll">
            <div className="admin-kpi-row admin-kpi-row--6">
              <AdminMetricCard
                label="Total levers"
                value={summary.total_levers}
                helper="Catalog size"
                tone="primary"
              />

              <AdminMetricCard
                label="Active levers"
                value={summary.active_levers}
                helper="Available to recommendations"
                tone="success"
              />

              <AdminMetricCard
                label="Inactive levers"
                value={summary.inactive_levers}
                helper="Disabled or under review"
                tone={summary.inactive_levers > 0 ? "warning" : "default"}
              />

              <AdminMetricCard
                label="Recent runs"
                value={recentRuns.length}
                helper="Last orchestration checks"
              />

              <AdminMetricCard
                label="Failed runs"
                value={failedRunCount}
                helper="In latest loaded runs"
                tone={failedRunCount > 0 ? "danger" : "success"}
              />

              <AdminMetricCard
                label="Critical alerts"
                value={criticalCount}
                helper="Founder / P1 / failed"
                tone={criticalCount > 0 ? "danger" : "success"}
              />
            </div>
          </div>

          <div className="grid grid-2">
            <div className="card stack" style={{ gap: 14 }}>
              <div
                className="row space-between"
                style={{ gap: 12, flexWrap: "wrap", alignItems: "center" }}
              >
                <div className="stack" style={{ gap: 4 }}>
                  <div className="section-title">Lever category breakdown</div>
                  <div className="muted">Distribution of configured levers by category.</div>
                </div>

                <Link className="button ghost" href="/admin/levers">
                  Manage catalog
                </Link>
              </div>

              {summary.category_breakdown.length === 0 ? (
                <div className="card-soft muted">No lever categories yet.</div>
              ) : (
                <div className="stack" style={{ gap: 10 }}>
                  {summary.category_breakdown.map((item) => {
                    const percentage =
                      summary.total_levers > 0
                        ? Math.round((item.count / summary.total_levers) * 100)
                        : 0;

                    return (
                      <div key={item.category} className="card-soft stack" style={{ gap: 8 }}>
                        <div
                          className="row space-between"
                          style={{ gap: 12, flexWrap: "wrap", alignItems: "center" }}
                        >
                          <div style={{ fontWeight: 800 }}>{item.category}</div>
                          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                            <span className="badge">{item.count}</span>
                            <span className="badge">{percentage}%</span>
                          </div>
                        </div>

                        <div
                          style={{
                            width: "100%",
                            height: 9,
                            borderRadius: 999,
                            background: "rgba(15,23,42,0.07)",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${Math.min(100, Math.max(0, percentage))}%`,
                              height: "100%",
                              borderRadius: 999,
                              background: "var(--primary)",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="card stack" style={{ gap: 14 }}>
              <div
                className="row space-between"
                style={{ gap: 12, flexWrap: "wrap", alignItems: "center" }}
              >
                <div className="stack" style={{ gap: 4 }}>
                  <div className="section-title">Recent levers</div>
                  <div className="muted">Latest catalog items created in the platform.</div>
                </div>

                <Link className="button ghost" href="/admin/levers">
                  Open levers
                </Link>
              </div>

              {summary.recent_levers.length === 0 ? (
                <div className="card-soft muted">No levers yet.</div>
              ) : (
                <div
                  className="stack"
                  style={{
                    gap: 10,
                    maxHeight: 460,
                    overflowY: "auto",
                    paddingRight: 6,
                  }}
                >
                  {summary.recent_levers.map((item) => (
                    <div key={item.id} className="card-soft stack" style={{ gap: 8 }}>
                      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                        <span className="badge">#{item.id}</span>
                        <span className="badge">{item.category}</span>
                        <span className={item.is_active ? "badge success" : "badge warning"}>
                          {item.is_active ? "active" : "inactive"}
                        </span>
                      </div>

                      <div style={{ fontWeight: 850, letterSpacing: "-0.02em" }}>
                        {item.name}
                      </div>

                      <div className="muted">Created {formatDateTime(item.created_at)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-2">
            <div className="card stack" style={{ gap: 14 }}>
              <div
                className="row space-between"
                style={{ gap: 12, flexWrap: "wrap", alignItems: "center" }}
              >
                <div className="stack" style={{ gap: 4 }}>
                  <div className="section-title">Recent founder / critical runs</div>
                  <div className="muted">Runs requiring attention from operations or leadership.</div>
                </div>

                <Link className="button ghost" href="/admin/agent-reports?status=critical">
                  View reports
                </Link>
              </div>

              {alertRuns.length === 0 ? (
                <div className="card-soft muted">
                  No founder or critical runs detected recently.
                </div>
              ) : (
                <div
                  className="stack"
                  style={{
                    gap: 10,
                    maxHeight: 520,
                    overflowY: "auto",
                    paddingRight: 6,
                  }}
                >
                  {alertRuns.map((run) => {
                    const escalations = run.escalations ?? [];

                    return (
                      <Link
                        key={run.id}
                        href={`/admin/agent-reports?status=critical&run=${run.id}`}
                        className="card-soft stack"
                        style={{
                          gap: 8,
                          textDecoration: "none",
                          color: "inherit",
                          border: "1px solid var(--border)",
                        }}
                      >
                        <div
                          className="row space-between"
                          style={{ gap: 12, flexWrap: "wrap", alignItems: "center" }}
                        >
                          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                            <span className="badge">#{run.id}</span>
                            <span className="badge">{run.scenario}</span>
                            <span style={getRunStatusStyle(run.status)}>{run.status}</span>
                            <span style={getRunSeverityStyle(run)}>
                              {getRunSeverityLabel(run)}
                            </span>
                          </div>

                          <div className="muted">{formatDateTime(run.created_at)}</div>
                        </div>

                        <div
                          className="row space-between"
                          style={{ gap: 12, flexWrap: "wrap" }}
                        >
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
                                  ? "#b91c1c"
                                  : "#92400e",
                              lineHeight: 1.5,
                            }}
                          >
                            {escalations[0]}
                          </div>
                        ) : null}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="card stack" style={{ gap: 14 }}>
              <div
                className="row space-between"
                style={{ gap: 12, flexWrap: "wrap", alignItems: "center" }}
              >
                <div className="stack" style={{ gap: 4 }}>
                  <div className="section-title">Recent orchestration runs</div>
                  <div className="muted">Latest execution signals from agent orchestration.</div>
                </div>

                <Link className="button ghost" href="/admin/orchestration">
                  Open orchestration
                </Link>
              </div>

              {recentRuns.length === 0 ? (
                <div className="card-soft muted">No orchestration run found.</div>
              ) : (
                <div
                  className="stack"
                  style={{
                    gap: 10,
                    maxHeight: 520,
                    overflowY: "auto",
                    paddingRight: 6,
                  }}
                >
                  {recentRuns.map((run) => (
                    <Link
                      key={run.id}
                      href={`/admin/orchestration?run=${run.id}`}
                      className="card-soft stack"
                      style={{
                        gap: 8,
                        textDecoration: "none",
                        color: "inherit",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <div
                        className="row space-between"
                        style={{ gap: 12, flexWrap: "wrap", alignItems: "center" }}
                      >
                        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                          <span className="badge">#{run.id}</span>
                          <span className="badge">{run.scenario}</span>
                          <span style={getRunStatusStyle(run.status)}>{run.status}</span>
                        </div>

                        <div className="muted">{formatDateTime(run.created_at)}</div>
                      </div>

                      <div
                        className="row space-between"
                        style={{ gap: 12, flexWrap: "wrap" }}
                      >
                        <div className="muted">
                          confidence {Number(run.confidence ?? 0).toFixed(2)}
                        </div>

                        <div className="muted">
                          {(run.escalations ?? []).length > 0
                            ? `${(run.escalations ?? []).length} escalation(s)`
                            : "No escalation"}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}