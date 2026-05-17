"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AdminGuard } from "@/components/admin-guard";
import { AdminShell } from "@/components/admin-shell";
import {
  getAdminMe,
  getAdminOrchestrationRunDetail,
  getAdminOrchestrationRuns,
} from "@/lib/api";
import type {
  AdminMe,
  AdminOrchestrationRunDetail,
  AdminOrchestrationRunSummary,
} from "@/lib/types";

type AgentFilterMode =
  | "all"
  | "support_triage"
  | "support_resolution"
  | "tech_ops_monitoring"
  | "business_ops_monitoring"
  | "customer_experience_monitoring"
  | "chief_of_staff"
  | "daily_briefing"
  | "growth_enrollment";

type StatusFilterMode = "all" | "success" | "partial" | "failed" | "critical";

type AgentSummaryCard = {
  agent: Exclude<AgentFilterMode, "all">;
  totalRuns: number;
  failedRuns: number;
  partialRuns: number;
  criticalRuns: number;
  latestRunAt: string | null;
};

const AGENT_OPTIONS: Exclude<AgentFilterMode, "all">[] = [
  "support_triage",
  "support_resolution",
  "tech_ops_monitoring",
  "business_ops_monitoring",
  "customer_experience_monitoring",
  "chief_of_staff",
  "daily_briefing",
  "growth_enrollment",
];

function prettyJson(value: unknown): string {
  return JSON.stringify(value ?? {}, null, 2);
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

function formatRunStatus(status: string): string {
  if (status === "failed") return "failed";
  if (status === "partial") return "partial";
  return "success";
}

function getStatusColor(status: string): string {
  if (status === "failed") return "var(--danger)";
  if (status === "partial") return "var(--warning, #b45309)";
  return "var(--success, #15803d)";
}

function getStatusBackground(status: string): string {
  if (status === "failed") return "rgba(220,38,38,0.10)";
  if (status === "partial") return "rgba(245,158,11,0.12)";
  return "rgba(21,128,61,0.10)";
}

function normalizeAgentLabel(agent: string): string {
  return agent
    .replaceAll("_", " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeScenarioLabel(value: string): string {
  return value
    .replaceAll("_", " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function runIncludesAgent(run: AdminOrchestrationRunSummary, agent: AgentFilterMode): boolean {
  if (agent === "all") return true;

  const agents = run.executed_agents ?? [];
  return agents.includes(agent);
}

function StatusPill({ status }: { status: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        borderRadius: 999,
        padding: "5px 10px",
        fontSize: 12,
        fontWeight: 850,
        color: getStatusColor(status),
        background: getStatusBackground(status),
        border: `1px solid ${getStatusColor(status)}22`,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
      }}
    >
      {formatRunStatus(status)}
    </span>
  );
}

function CriticalPill({ critical }: { critical: boolean }) {
  if (!critical) {
    return null;
  }

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        borderRadius: 999,
        padding: "5px 10px",
        fontSize: 12,
        fontWeight: 900,
        color: "var(--danger)",
        background: "rgba(220,38,38,0.10)",
        border: "1px solid rgba(220,38,38,0.22)",
        textTransform: "uppercase",
        letterSpacing: "0.04em",
      }}
    >
      Critical
    </span>
  );
}

function MetricCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number | string;
  tone?: "default" | "danger" | "warning" | "success";
}) {
  const color =
    tone === "danger"
      ? "var(--danger)"
      : tone === "warning"
        ? "var(--warning, #b45309)"
        : tone === "success"
          ? "var(--success, #15803d)"
          : "inherit";

  return (
    <div className="card-soft stack" style={{ gap: 6 }}>
      <div className="muted">{label}</div>
      <div className="admin-metric-value" style={{ fontSize: 28, color }}>
        {value}
      </div>
    </div>
  );
}

export default function AdminAgentReportsPage() {
  return (
    <AdminGuard>
      <Suspense
        fallback={
          <main className="page">
            <div className="container">
              <div className="card">Loading agent reports...</div>
            </div>
          </main>
        }
      >
        <AdminAgentReportsContent />
      </Suspense>
    </AdminGuard>
  );
}

function AdminAgentReportsContent() {
  const searchParams = useSearchParams();
  const preopenedRunRef = useRef<HTMLButtonElement | null>(null);

  const [admin, setAdmin] = useState<AdminMe | null>(null);
  const [runs, setRuns] = useState<AdminOrchestrationRunSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedRunId, setSelectedRunId] = useState<number | null>(null);
  const [selectedRunDetail, setSelectedRunDetail] =
    useState<AdminOrchestrationRunDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const [agentFilter, setAgentFilter] = useState<AgentFilterMode>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilterMode>("all");
  const [scenarioFilter, setScenarioFilter] = useState<string>("all");

  const preopenedRunId = useMemo(() => {
    const raw = searchParams.get("run");

    if (!raw) return null;

    const parsed = Number(raw);

    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [searchParams]);

  async function loadRuns(options?: { silent?: boolean }) {
    if (options?.silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      const [me, runData] = await Promise.all([getAdminMe(), getAdminOrchestrationRuns(100)]);

      setAdmin(me);
      setRuns(runData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load agent reports.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    const rawStatus = searchParams.get("status");

    if (
      rawStatus === "all" ||
      rawStatus === "success" ||
      rawStatus === "partial" ||
      rawStatus === "failed" ||
      rawStatus === "critical"
    ) {
      setStatusFilter(rawStatus);
    }
  }, [searchParams]);

  useEffect(() => {
    void loadRuns();
  }, []);

  async function loadRunDetail(runId: number) {
    setDetailLoading(true);
    setDetailError(null);

    try {
      const detail = await getAdminOrchestrationRunDetail(runId);
      setSelectedRunDetail(detail);
    } catch (err) {
      setDetailError(err instanceof Error ? err.message : "Unable to load run detail.");
      setSelectedRunDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }

  useEffect(() => {
    if (!preopenedRunId) return;

    setSelectedRunId(preopenedRunId);
    void loadRunDetail(preopenedRunId);
  }, [preopenedRunId]);

  const scenarioOptions = useMemo(() => {
    return Array.from(new Set(runs.map((run) => run.scenario))).sort();
  }, [runs]);

  const filteredRuns = useMemo(() => {
    return runs.filter((run) => {
      if (!runIncludesAgent(run, agentFilter)) return false;

      if (statusFilter === "failed" && run.status !== "failed") return false;
      if (statusFilter === "partial" && run.status !== "partial") return false;
      if (statusFilter === "success" && run.status !== "success") return false;
      if (statusFilter === "critical" && !isCriticalRun(run)) return false;

      if (scenarioFilter !== "all" && run.scenario !== scenarioFilter) return false;

      return true;
    });
  }, [runs, agentFilter, statusFilter, scenarioFilter]);

  useEffect(() => {
    if (!preopenedRunId) return;
    if (!filteredRuns.some((run) => run.id === preopenedRunId)) return;

    const timer = window.setTimeout(() => {
      preopenedRunRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 150);

    return () => window.clearTimeout(timer);
  }, [filteredRuns, preopenedRunId]);

  const agentCounts = useMemo(() => {
    const values: Record<string, number> = {};

    runs.forEach((run) => {
      (run.executed_agents ?? []).forEach((agent) => {
        values[agent] = (values[agent] ?? 0) + 1;
      });
    });

    return values;
  }, [runs]);

  const agentSummaries = useMemo<AgentSummaryCard[]>(() => {
    return AGENT_OPTIONS.map((agent) => {
      const agentRuns = runs.filter((run) => runIncludesAgent(run, agent));

      const latestRunAt =
        agentRuns.length > 0
          ? [...agentRuns].sort(
              (left, right) =>
                new Date(right.created_at).getTime() - new Date(left.created_at).getTime(),
            )[0]?.created_at ?? null
          : null;

      return {
        agent,
        totalRuns: agentRuns.length,
        failedRuns: agentRuns.filter((run) => run.status === "failed").length,
        partialRuns: agentRuns.filter((run) => run.status === "partial").length,
        criticalRuns: agentRuns.filter((run) => isCriticalRun(run)).length,
        latestRunAt,
      };
    }).filter((item) => item.totalRuns > 0);
  }, [runs]);

  const visibleAgentSummaries = useMemo(() => {
    if (agentFilter === "all") return agentSummaries;

    return agentSummaries.filter((item) => item.agent === agentFilter);
  }, [agentSummaries, agentFilter]);

  const totalCriticalRuns = useMemo(() => {
    return runs.filter((run) => isCriticalRun(run)).length;
  }, [runs]);

  const totalFailedRuns = useMemo(() => {
    return runs.filter((run) => run.status === "failed").length;
  }, [runs]);

  const totalPartialRuns = useMemo(() => {
    return runs.filter((run) => run.status === "partial").length;
  }, [runs]);

  const totalSuccessRuns = useMemo(() => {
    return runs.filter((run) => run.status === "success").length;
  }, [runs]);

  const selectedAgentLabel =
    agentFilter === "all" ? "All agents" : normalizeAgentLabel(agentFilter);

  return (
    <AdminShell
      activeHref="/admin/agent-reports"
      title="Agent Reports"
      subtitle="Centralized view of agent outputs, statuses, and execution traces."
      adminEmail={admin?.email ?? null}
    >
      {loading ? (
        <div className="card">Loading agent reports...</div>
      ) : error ? (
        <div className="card" style={{ color: "var(--danger)" }}>
          {error}
        </div>
      ) : (
        <div className="stack" style={{ gap: 18 }}>
          <div
            className="card stack"
            style={{
              gap: 16,
              border: "1px solid rgba(124,58,237,0.18)",
              background:
                "linear-gradient(135deg, rgba(15,23,42,0.98), rgba(30,41,59,0.96))",
              color: "white",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                right: -110,
                top: -130,
                width: 300,
                height: 300,
                borderRadius: 999,
                background: "rgba(124,58,237,0.22)",
                filter: "blur(5px)",
              }}
            />

            <div
              style={{
                position: "absolute",
                left: "45%",
                bottom: -140,
                width: 320,
                height: 320,
                borderRadius: 999,
                background: "rgba(59,130,246,0.16)",
                filter: "blur(6px)",
              }}
            />

            <div
              className="row space-between"
              style={{
                gap: 12,
                flexWrap: "wrap",
                alignItems: "flex-start",
                position: "relative",
              }}
            >
              <div className="stack" style={{ gap: 10, maxWidth: 920 }}>
                <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                  <span
                    style={{
                      borderRadius: 999,
                      padding: "8px 12px",
                      background: "rgba(255,255,255,0.12)",
                      fontSize: 12,
                      fontWeight: 900,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Agent reporting
                  </span>

                  <span
                    style={{
                      borderRadius: 999,
                      padding: "8px 12px",
                      background:
                        totalCriticalRuns > 0
                          ? "rgba(220,38,38,0.24)"
                          : "rgba(21,128,61,0.24)",
                      fontSize: 12,
                      fontWeight: 900,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {totalCriticalRuns > 0
                      ? `${totalCriticalRuns} critical`
                      : "No critical alert"}
                  </span>
                </div>

                <div
                  style={{
                    fontSize: 34,
                    lineHeight: 1.08,
                    fontWeight: 950,
                    letterSpacing: "-0.05em",
                  }}
                >
                  Inspect agent activity, execution traces and operational risk.
                </div>

                <div
                  style={{
                    maxWidth: 940,
                    lineHeight: 1.7,
                    color: "rgba(255,255,255,0.74)",
                  }}
                >
                  This view consolidates agent outputs across orchestration runs, so platform
                  operations can quickly understand what happened, which agent contributed, and
                  where founder-level attention is needed.
                </div>
              </div>

              <div className="row" style={{ gap: 8, flexWrap: "wrap", position: "relative" }}>
                <Link className="button ghost" href="/admin/orchestration">
                  Open orchestration
                </Link>

                <button
                  className="button ghost"
                  type="button"
                  onClick={() => void loadRuns({ silent: true })}
                  disabled={refreshing}
                >
                  {refreshing ? "Refreshing..." : "Refresh"}
                </button>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
                gap: 10,
                position: "relative",
              }}
            >
              {[
                { label: "Total runs", value: runs.length },
                { label: "Success", value: totalSuccessRuns },
                { label: "Partial", value: totalPartialRuns },
                { label: "Failed", value: totalFailedRuns },
                { label: "Critical", value: totalCriticalRuns },
              ].map((metric) => (
                <div
                  key={metric.label}
                  style={{
                    borderRadius: 16,
                    padding: 12,
                    background: "rgba(255,255,255,0.10)",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                >
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.62)" }}>
                    {metric.label}
                  </div>

                  <div style={{ marginTop: 4, fontSize: 24, fontWeight: 950 }}>
                    {metric.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(170px, 1fr))",
              gap: 14,
            }}
          >
            <MetricCard label="Total runs" value={runs.length} />
            <MetricCard label="Success" value={totalSuccessRuns} tone="success" />
            <MetricCard label="Partial" value={totalPartialRuns} tone="warning" />
            <MetricCard label="Critical / founder" value={totalCriticalRuns} tone="danger" />
          </div>

          <div className="card stack" style={{ gap: 16 }}>
            <div
              className="row space-between"
              style={{ gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}
            >
              <div className="stack" style={{ gap: 4 }}>
                <div className="section-title">Agent summary</div>
                <div className="muted">
                  Quick synthesis of each agent’s recent activity, execution volume, and risk
                  level.
                </div>
              </div>

              {agentFilter !== "all" ? (
                <button
                  className="button ghost"
                  type="button"
                  onClick={() => setAgentFilter("all")}
                >
                  Clear agent filter
                </button>
              ) : null}
            </div>

            {visibleAgentSummaries.length === 0 ? (
              <div className="card-soft muted">
                No agent summary available for the current selection.
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
                  gap: 12,
                }}
              >
                {visibleAgentSummaries.map((item) => {
                  const isActive = agentFilter === item.agent;

                  return (
                    <button
                      key={item.agent}
                      type="button"
                      className="card-soft stack"
                      onClick={() => setAgentFilter(item.agent)}
                      style={{
                        gap: 10,
                        textAlign: "left",
                        cursor: "pointer",
                        border: isActive ? "1px solid var(--primary)" : "1px solid var(--border)",
                        background: isActive
                          ? "linear-gradient(180deg, rgba(239,246,255,0.95), rgba(255,255,255,0.98))"
                          : undefined,
                      }}
                    >
                      <div
                        className="row space-between"
                        style={{ gap: 8, flexWrap: "wrap", alignItems: "center" }}
                      >
                        <div className="section-title" style={{ fontSize: 15 }}>
                          {normalizeAgentLabel(item.agent)}
                        </div>

                        <span className="badge">{item.totalRuns}</span>
                      </div>

                      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                        <span className="badge">failed {item.failedRuns}</span>
                        <span className="badge">partial {item.partialRuns}</span>
                        <span
                          className="badge"
                          style={
                            item.criticalRuns > 0
                              ? {
                                  color: "var(--danger)",
                                  borderColor: "rgba(220,38,38,0.20)",
                                  background: "rgba(220,38,38,0.08)",
                                }
                              : undefined
                          }
                        >
                          critical {item.criticalRuns}
                        </span>
                      </div>

                      <div className="muted">
                        {item.latestRunAt
                          ? `Latest run: ${new Date(item.latestRunAt).toLocaleString()}`
                          : "No recent run"}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="card stack" style={{ gap: 14 }}>
            <div
              className="row space-between"
              style={{ gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}
            >
              <div className="stack" style={{ gap: 4 }}>
                <div className="section-title">Filters</div>
                <div className="muted">
                  Narrow down the execution history by agent, status, or scenario.
                </div>
              </div>

              <span className="badge">{filteredRuns.length} visible run(s)</span>
            </div>

            <div className="grid grid-3">
              <label className="stack" style={{ gap: 6 }}>
                <span className="muted">Agent</span>
                <select
                  className="select"
                  value={agentFilter}
                  onChange={(event) => setAgentFilter(event.target.value as AgentFilterMode)}
                >
                  <option value="all">All agents</option>
                  <option value="support_triage">
                    support triage ({agentCounts.support_triage ?? 0})
                  </option>
                  <option value="support_resolution">
                    support resolution ({agentCounts.support_resolution ?? 0})
                  </option>
                  <option value="tech_ops_monitoring">
                    tech ops monitoring ({agentCounts.tech_ops_monitoring ?? 0})
                  </option>
                  <option value="business_ops_monitoring">
                    business ops monitoring ({agentCounts.business_ops_monitoring ?? 0})
                  </option>
                  <option value="customer_experience_monitoring">
                    customer experience monitoring (
                    {agentCounts.customer_experience_monitoring ?? 0})
                  </option>
                  <option value="chief_of_staff">
                    chief of staff ({agentCounts.chief_of_staff ?? 0})
                  </option>
                  <option value="daily_briefing">
                    daily briefing ({agentCounts.daily_briefing ?? 0})
                  </option>
                  <option value="growth_enrollment">
                    growth enrollment ({agentCounts.growth_enrollment ?? 0})
                  </option>
                </select>
              </label>

              <label className="stack" style={{ gap: 6 }}>
                <span className="muted">Status</span>
                <select
                  className="select"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as StatusFilterMode)}
                >
                  <option value="all">All statuses</option>
                  <option value="success">Success</option>
                  <option value="partial">Partial</option>
                  <option value="failed">Failed</option>
                  <option value="critical">Founder / Critical</option>
                </select>
              </label>

              <label className="stack" style={{ gap: 6 }}>
                <span className="muted">Scenario</span>
                <select
                  className="select"
                  value={scenarioFilter}
                  onChange={(event) => setScenarioFilter(event.target.value)}
                >
                  <option value="all">All scenarios</option>
                  {scenarioOptions.map((scenario) => (
                    <option key={scenario} value={scenario}>
                      {scenario}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="card-soft muted">
              Current filter: <strong>{selectedAgentLabel}</strong> · status{" "}
              <strong>{statusFilter}</strong> · scenario <strong>{scenarioFilter}</strong>.
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) minmax(360px, 0.95fr)",
              gap: 18,
              alignItems: "start",
            }}
          >
            <div className="card stack" style={{ gap: 14, minWidth: 0 }}>
              <div
                className="row space-between"
                style={{ gap: 12, flexWrap: "wrap", alignItems: "center" }}
              >
                <div className="section-title">Runs</div>
                <span className="badge">{filteredRuns.length} run(s)</span>
              </div>

              {filteredRuns.length === 0 ? (
                <div className="card-soft muted">No run matches the current filters.</div>
              ) : (
                <div
                  className="stack"
                  style={{
                    gap: 10,
                    maxHeight: "66vh",
                    overflowY: "auto",
                    paddingRight: 4,
                  }}
                >
                  {filteredRuns.map((run) => {
                    const escalations = run.escalations ?? [];
                    const critical = isCriticalRun(run);
                    const isSelected = selectedRunId === run.id;
                    const isPreopened = preopenedRunId === run.id;

                    return (
                      <button
                        key={run.id}
                        ref={isPreopened ? preopenedRunRef : null}
                        type="button"
                        className="card-soft stack"
                        onClick={() => {
                          setSelectedRunId(run.id);
                          void loadRunDetail(run.id);
                        }}
                        style={{
                          gap: 9,
                          textAlign: "left",
                          cursor: "pointer",
                          border: isSelected
                            ? isPreopened
                              ? "2px solid var(--danger)"
                              : "1px solid var(--primary)"
                            : "1px solid var(--border)",
                          background: isPreopened
                            ? "linear-gradient(180deg, rgba(254,242,242,0.95), rgba(255,255,255,0.98))"
                            : undefined,
                          boxShadow: isPreopened
                            ? "0 0 0 3px rgba(220,38,38,0.08)"
                            : undefined,
                        }}
                      >
                        <div
                          className="row space-between"
                          style={{ gap: 12, flexWrap: "wrap", alignItems: "center" }}
                        >
                          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                            <span className="badge">#{run.id}</span>
                            <span className="badge">
                              {normalizeScenarioLabel(run.scenario)}
                            </span>
                            <StatusPill status={run.status} />
                            <CriticalPill critical={critical} />

                            {isPreopened ? (
                              <span
                                style={{
                                  borderRadius: 999,
                                  padding: "5px 10px",
                                  color: "var(--danger)",
                                  background: "rgba(220,38,38,0.12)",
                                  fontWeight: 850,
                                  fontSize: 12,
                                }}
                              >
                                Opened
                              </span>
                            ) : null}
                          </div>

                          <div className="muted">
                            {new Date(run.created_at).toLocaleString()}
                          </div>
                        </div>

                        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                          {(run.executed_agents ?? []).length === 0 ? (
                            <span className="muted">No executed agents</span>
                          ) : (
                            (run.executed_agents ?? []).map((agent) => (
                              <span key={`${run.id}-${agent}`} className="badge">
                                {normalizeAgentLabel(agent)}
                              </span>
                            ))
                          )}
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
                              color: critical ? "var(--danger)" : "var(--text)",
                              lineHeight: 1.5,
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

            <div
              className="card stack"
              style={{
                gap: 14,
                minWidth: 0,
                position: "sticky",
                top: 96,
              }}
            >
              <div
                className="row space-between"
                style={{ gap: 12, flexWrap: "wrap", alignItems: "center" }}
              >
                <div className="section-title">Run detail</div>

                {selectedRunDetail ? (
                  <Link
                    className="button ghost"
                    href={`/admin/orchestration?filter=critical&run=${selectedRunDetail.id}`}
                  >
                    Open in orchestration
                  </Link>
                ) : null}
              </div>

              {!selectedRunId ? (
                <div className="card-soft muted">
                  Select a run to inspect its detailed output.
                </div>
              ) : detailLoading ? (
                <div className="card-soft">Loading detail...</div>
              ) : detailError ? (
                <div className="card-soft" style={{ color: "var(--danger)" }}>
                  {detailError}
                </div>
              ) : !selectedRunDetail ? (
                <div className="card-soft muted">No detail available.</div>
              ) : (
                <div className="stack" style={{ gap: 10 }}>
                  <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                    <span className="badge">#{selectedRunDetail.id}</span>
                    <span className="badge">
                      {normalizeScenarioLabel(selectedRunDetail.scenario)}
                    </span>
                    <StatusPill status={selectedRunDetail.status} />

                    {preopenedRunId === selectedRunDetail.id ? (
                      <span
                        style={{
                          borderRadius: 999,
                          padding: "5px 10px",
                          color: "var(--danger)",
                          background: "rgba(220,38,38,0.12)",
                          fontWeight: 850,
                          fontSize: 12,
                        }}
                      >
                        Preopened from dashboard
                      </span>
                    ) : null}
                  </div>

                  <pre
                    style={{
                      margin: 0,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      borderRadius: 14,
                      padding: 12,
                      background: "rgba(15,23,42,0.04)",
                      border: "1px solid var(--border)",
                      overflowX: "auto",
                      maxHeight: "66vh",
                      fontFamily:
                        "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                      fontSize: 12,
                      lineHeight: 1.55,
                    }}
                  >
                    {prettyJson(selectedRunDetail)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}