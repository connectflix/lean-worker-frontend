"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { AdminGuard } from "@/components/admin-guard";
import { AdminShell } from "@/components/admin-shell";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingState,
  AdminMetricCard,
  AdminPage,
  AdminPageHeader,
  AdminSection,
  AdminStatusBadge,
} from "@/components/admin-ui";
import {
  getAdminDashboardSummary,
  getAdminMe,
  getAdminOrchestrationRuns,
} from "@/lib/api";
import { getAdminDashboardCopy } from "@/lib/i18n/admin-dashboard";
import { useAdminUiLanguage } from "@/lib/use-admin-ui-language";
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

function formatDateTime(
  value: string | null | undefined,
  locale: string,
): string {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(locale, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AdminDashboardContent() {
  const { uiLanguage } = useAdminUiLanguage();
  const copy = getAdminDashboardCopy(uiLanguage);

  function getLocalizedRunStatus(status: string): string {
    const normalized = status.toLowerCase();

    if (normalized === "completed") return copy.status.completed;
    if (normalized === "success") return copy.status.success;
    if (normalized === "partial") return copy.status.partial;
    if (normalized === "failed") return copy.status.failed;

    return copy.status.unknown;
  }

  function getLocalizedRunSeverity(
    run: AdminOrchestrationRunSummary,
  ): string {
    const severity = getRunSeverityLabel(run);

    if (severity === "founder") return copy.severity.founder;
    if (severity === "critical") return copy.severity.critical;
    if (severity === "p1") return copy.severity.p1;

    return copy.severity.alert;
  }

  function getEscalationLabel(count: number): string {
    return count === 1
      ? copy.runMeta.escalationSingular
      : copy.runMeta.escalationPlural;
  }

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
      setError(
        err instanceof Error ? err.message : copy.states.fallbackError,
      );
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
        <AdminLoadingState
          title={copy.states.loadingTitle}
          description={copy.states.loadingDescription}
        />
      ) : error ? (
        <AdminErrorState
          title={copy.states.errorTitle}
          description={error}
        />
      ) : !summary ? (
        <AdminEmptyState
          title={copy.states.emptyTitle}
          description={copy.states.emptyDescription}
        />
      ) : (
        <AdminPage>
          <AdminPageHeader
            eyebrow={copy.page.eyebrow}
            title={copy.page.title}
            description={copy.page.description}
            actions={
              <button
                className="button"
                type="button"
                onClick={() => void loadDashboard()}
                disabled={loading}
              >
                {copy.page.refresh}
              </button>
            }
          />

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
                  <span className="badge primary">
                    {copy.cockpit.controlCenter}
                  </span>

                  {alertRuns.length > 0 ? (
                    <span className="badge warning">
                      {criticalCount}{" "}
                      {criticalCount === 1
                        ? copy.cockpit.alertSingular
                        : copy.cockpit.alertPlural}
                    </span>
                  ) : (
                    <span className="badge success">
                      {copy.cockpit.noCriticalAlert}
                    </span>
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
                  {copy.cockpit.title}
                </div>

                <div className="muted" style={{ maxWidth: 780, lineHeight: 1.65 }}>
                  {copy.cockpit.description}
                </div>
              </div>

              <div className="row" style={{ gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                <Link className="button ghost" href="/admin/agent-reports">
                  {copy.cockpit.agentReports}
                </Link>

                <Link className="button ghost" href="/admin/orchestration">
                  {copy.cockpit.orchestration}
                </Link>

                <Link className="button ghost" href="/admin/levers">
                  {copy.cockpit.manageLevers}
                </Link>

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
                      {copy.cockpit.criticalTitle}
                    </div>

                    <div className="muted">
                      {founderCount > 0
                        ? copy.cockpit.founderAndHighRisk(
                            founderCount,
                            criticalCount,
                          )
                        : copy.cockpit.highRiskOnly(criticalCount)}
                    </div>

                    {topAlert ? (
                      <div className="muted">
                        {copy.cockpit.latestAlert}:{" "}
                        <strong>#{topAlert.id}</strong> — {topAlert.scenario}
                      </div>
                    ) : null}
                  </div>

                  <Link className="button" href="/admin/agent-reports?status=critical">
                    {copy.cockpit.openCriticalReports}
                  </Link>
                </div>
              </div>
            ) : null}
          </div>

          <div className="admin-kpi-scroll">
            <div className="admin-kpi-row admin-kpi-row--6">
              <AdminMetricCard
                label={copy.metrics.totalLevers}
                value={summary.total_levers}
                helper={copy.metrics.totalLeversHelper}
                tone="primary"
              />

              <AdminMetricCard
                label={copy.metrics.activeLevers}
                value={summary.active_levers}
                helper={copy.metrics.activeLeversHelper}
                tone="success"
              />

              <AdminMetricCard
                label={copy.metrics.inactiveLevers}
                value={summary.inactive_levers}
                helper={copy.metrics.inactiveLeversHelper}
                tone={summary.inactive_levers > 0 ? "warning" : "default"}
              />

              <AdminMetricCard
                label={copy.metrics.recentRuns}
                value={recentRuns.length}
                helper={copy.metrics.recentRunsHelper}
              />

              <AdminMetricCard
                label={copy.metrics.failedRuns}
                value={failedRunCount}
                helper={copy.metrics.failedRunsHelper}
                tone={failedRunCount > 0 ? "danger" : "success"}
              />

              <AdminMetricCard
                label={copy.metrics.criticalAlerts}
                value={criticalCount}
                helper={copy.metrics.criticalAlertsHelper}
                tone={criticalCount > 0 ? "danger" : "success"}
              />
            </div>
          </div>

          <div className="grid grid-2">
            <AdminSection
              title={copy.sections.categories.title}
              description={copy.sections.categories.description}
              actions={
                <Link className="button ghost" href="/admin/levers">
                  {copy.sections.categories.action}
                </Link>
              }
            >

              {summary.category_breakdown.length === 0 ? (
                <div className="card-soft muted">
                  {copy.sections.categories.empty}
                </div>
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
            </AdminSection>

            <AdminSection
              title={copy.sections.recentLevers.title}
              description={copy.sections.recentLevers.description}
              actions={
                <Link className="button ghost" href="/admin/levers">
                  {copy.sections.recentLevers.action}
                </Link>
              }
            >

              {summary.recent_levers.length === 0 ? (
                <div className="card-soft muted">
                  {copy.sections.recentLevers.empty}
                </div>
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
                        <AdminStatusBadge
                          tone={item.is_active ? "success" : "warning"}
                        >
                          {item.is_active
                            ? copy.status.active
                            : copy.status.inactive}
                        </AdminStatusBadge>
                      </div>

                      <div style={{ fontWeight: 850, letterSpacing: "-0.02em" }}>
                        {item.name}
                      </div>

                      <div className="muted">
                        {copy.runMeta.created}{" "}
                        {formatDateTime(item.created_at, copy.locale)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </AdminSection>
          </div>

          <div className="grid grid-2">
            <AdminSection
              title={copy.sections.criticalRuns.title}
              description={copy.sections.criticalRuns.description}
              actions={
                <Link
                  className="button ghost"
                  href="/admin/agent-reports?status=critical"
                >
                  {copy.sections.criticalRuns.action}
                </Link>
              }
            >

              {alertRuns.length === 0 ? (
                <div className="card-soft muted">
                  {copy.sections.criticalRuns.empty}
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
                            <span style={getRunStatusStyle(run.status)}>
                              {getLocalizedRunStatus(run.status)}
                            </span>
                            <span style={getRunSeverityStyle(run)}>
                              {getLocalizedRunSeverity(run)}
                            </span>
                          </div>

                          <div className="muted">
                            {formatDateTime(run.created_at, copy.locale)}
                          </div>
                        </div>

                        <div
                          className="row space-between"
                          style={{ gap: 12, flexWrap: "wrap" }}
                        >
                          <div className="muted">
                            {copy.runMeta.confidence}{" "}
                            {Number(run.confidence ?? 0).toFixed(2)}
                          </div>

                          <div className="muted">
                            {escalations.length > 0
                              ? `${escalations.length} ${getEscalationLabel(
                                  escalations.length,
                                )}`
                              : copy.runMeta.noEscalation}
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
            </AdminSection>

            <AdminSection
              title={copy.sections.orchestration.title}
              description={copy.sections.orchestration.description}
              actions={
                <Link className="button ghost" href="/admin/orchestration">
                  {copy.sections.orchestration.action}
                </Link>
              }
            >

              {recentRuns.length === 0 ? (
                <div className="card-soft muted">
                  {copy.sections.orchestration.empty}
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
                          <span style={getRunStatusStyle(run.status)}>
                            {getLocalizedRunStatus(run.status)}
                          </span>
                        </div>

                        <div className="muted">
                          {formatDateTime(run.created_at, copy.locale)}
                        </div>
                      </div>

                      <div
                        className="row space-between"
                        style={{ gap: 12, flexWrap: "wrap" }}
                      >
                        <div className="muted">
                          {copy.runMeta.confidence}{" "}
                          {Number(run.confidence ?? 0).toFixed(2)}
                        </div>

                        <div className="muted">
                          {(run.escalations ?? []).length > 0
                            ? `${(run.escalations ?? []).length} ${getEscalationLabel(
                                (run.escalations ?? []).length,
                              )}`
                            : copy.runMeta.noEscalation}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </AdminSection>
          </div>
        </AdminPage>
      )}
    </AdminShell>
  );
}