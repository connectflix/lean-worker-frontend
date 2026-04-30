"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

function normalizeAgentLabel(agent: string): string {
  return agent.replaceAll("_", " ");
}

function runIncludesAgent(run: AdminOrchestrationRunSummary, agent: AgentFilterMode): boolean {
  if (agent === "all") return true;
  const agents = run.executed_agents ?? [];
  return agents.includes(agent);
}

export default function AdminAgentReportsPage() {
  return (
    <AdminGuard>
      <AdminAgentReportsContent />
    </AdminGuard>
  );
}

function AdminAgentReportsContent() {
  const searchParams = useSearchParams();
  const preopenedRunRef = useRef<HTMLButtonElement | null>(null);

  const [admin, setAdmin] = useState<AdminMe | null>(null);
  const [runs, setRuns] = useState<AdminOrchestrationRunSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedRunId, setSelectedRunId] = useState<number | null>(null);
  const [selectedRunDetail, setSelectedRunDetail] = useState<AdminOrchestrationRunDetail | null>(null);
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
    async function load() {
      try {
        const [me, runData] = await Promise.all([
          getAdminMe(),
          getAdminOrchestrationRuns(100),
        ]);
        setAdmin(me);
        setRuns(runData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load agent reports.");
      } finally {
        setLoading(false);
      }
    }

    void load();
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
    const values = Array.from(new Set(runs.map((run) => run.scenario))).sort();
    return values;
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
          ? [...agentRuns]
              .sort(
                (a, b) =>
                  new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
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
        <>
          <div className="card stack">
            <div className="row space-between" style={{ gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}>
              <div className="stack" style={{ gap: 4 }}>
                <div className="section-title">Centralized agent reporting</div>
                <div className="muted">
                  One single entry point to inspect runs, filter by agent, and review execution outputs in a structured way.
                </div>
              </div>

              <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                <a className="button ghost" href="/admin/orchestration">
                  Open orchestration
                </a>
              </div>
            </div>

            <div className="grid grid-4">
              <div className="card-soft stack" style={{ gap: 6 }}>
                <div className="muted">Total runs</div>
                <div className="admin-metric-value" style={{ fontSize: 28 }}>
                  {runs.length}
                </div>
              </div>

              <div className="card-soft stack" style={{ gap: 6 }}>
                <div className="muted">Critical / founder</div>
                <div className="admin-metric-value" style={{ fontSize: 28, color: "var(--danger)" }}>
                  {totalCriticalRuns}
                </div>
              </div>

              <div className="card-soft stack" style={{ gap: 6 }}>
                <div className="muted">Failed</div>
                <div className="admin-metric-value" style={{ fontSize: 28, color: "var(--danger)" }}>
                  {totalFailedRuns}
                </div>
              </div>

              <div className="card-soft stack" style={{ gap: 6 }}>
                <div className="muted">Partial</div>
                <div className="admin-metric-value" style={{ fontSize: 28, color: "var(--warning, #b45309)" }}>
                  {totalPartialRuns}
                </div>
              </div>
            </div>
          </div>

          <div className="card stack">
            <div className="row space-between" style={{ gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}>
              <div className="stack" style={{ gap: 4 }}>
                <div className="section-title">Agent summary</div>
                <div className="muted">
                  Quick synthesis of each agent’s recent activity, execution volume, and risk level.
                </div>
              </div>
            </div>

            {visibleAgentSummaries.length === 0 ? (
              <div className="muted">No agent summary available for the current selection.</div>
            ) : (
              <div className="grid grid-4">
                {visibleAgentSummaries.map((item) => (
                  <button
                    key={item.agent}
                    type="button"
                    className="card-soft stack"
                    onClick={() => setAgentFilter(item.agent)}
                    style={{
                      gap: 8,
                      textAlign: "left",
                      cursor: "pointer",
                      border:
                        agentFilter === item.agent
                          ? "1px solid var(--primary)"
                          : "1px solid var(--border)",
                      background:
                        agentFilter === item.agent
                          ? "linear-gradient(180deg, rgba(239,246,255,0.95), rgba(255,255,255,0.98))"
                          : undefined,
                    }}
                  >
                    <div className="row space-between" style={{ gap: 8, flexWrap: "wrap", alignItems: "center" }}>
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
                ))}
              </div>
            )}
          </div>

          <div className="card stack">
            <div className="row space-between" style={{ gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}>
              <div className="stack" style={{ gap: 4 }}>
                <div className="section-title">Filters</div>
                <div className="muted">
                  Narrow down the execution history by agent, status, or scenario.
                </div>
              </div>
            </div>

            <div className="grid grid-3">
              <label className="stack" style={{ gap: 6 }}>
                <span className="muted">Agent</span>
                <select
                  className="select"
                  value={agentFilter}
                  onChange={(e) => setAgentFilter(e.target.value as AgentFilterMode)}
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
                    customer experience monitoring ({agentCounts.customer_experience_monitoring ?? 0})
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
                  onChange={(e) => setStatusFilter(e.target.value as StatusFilterMode)}
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
                  onChange={(e) => setScenarioFilter(e.target.value)}
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

            <div className="muted">
              {filteredRuns.length} run(s) currently visible.
            </div>
          </div>

          <div className="grid grid-2">
            <div className="card stack">
              <div className="section-title">Runs</div>

              {filteredRuns.length === 0 ? (
                <div className="muted">No run matches the current filters.</div>
              ) : (
                <div
                  className="stack"
                  style={{
                    gap: 10,
                    maxHeight: "62vh",
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
                          gap: 8,
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
                        <div className="row space-between" style={{ gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                            <span className="badge">#{run.id}</span>
                            <span className="badge">{run.scenario}</span>
                            <span
                              style={{
                                borderRadius: 999,
                                padding: "4px 10px",
                                color: getStatusColor(run.status),
                                background: "rgba(15,23,42,0.06)",
                                fontWeight: 700,
                              }}
                            >
                              {formatRunStatus(run.status)}
                            </span>
                            {critical ? (
                              <span
                                style={{
                                  borderRadius: 999,
                                  padding: "4px 10px",
                                  color: "var(--danger)",
                                  background: "rgba(220,38,38,0.08)",
                                }}
                              >
                                critical
                              </span>
                            ) : null}
                            {isPreopened ? (
                              <span
                                style={{
                                  borderRadius: 999,
                                  padding: "4px 10px",
                                  color: "var(--danger)",
                                  background: "rgba(220,38,38,0.12)",
                                  fontWeight: 700,
                                }}
                              >
                                opened
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
                          <div className="muted" style={{ color: critical ? "var(--danger)" : "var(--text)" }}>
                            {escalations[0]}
                          </div>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="card stack">
              <div className="section-title">Run detail</div>

              {!selectedRunId ? (
                <div className="muted">
                  Select a run to inspect its detailed output.
                </div>
              ) : detailLoading ? (
                <div className="muted">Loading detail...</div>
              ) : detailError ? (
                <div className="card-soft" style={{ color: "var(--danger)" }}>
                  {detailError}
                </div>
              ) : !selectedRunDetail ? (
                <div className="muted">No detail available.</div>
              ) : (
                <div className="stack" style={{ gap: 10 }}>
                  <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                    <span className="badge">#{selectedRunDetail.id}</span>
                    <span className="badge">{selectedRunDetail.scenario}</span>
                    <span
                      style={{
                        borderRadius: 999,
                        padding: "4px 10px",
                        background: "rgba(15,23,42,0.06)",
                        color: getStatusColor(selectedRunDetail.status),
                        fontWeight: 700,
                      }}
                    >
                      {selectedRunDetail.status}
                    </span>
                    {preopenedRunId === selectedRunDetail.id ? (
                      <span
                        style={{
                          borderRadius: 999,
                          padding: "4px 10px",
                          color: "var(--danger)",
                          background: "rgba(220,38,38,0.12)",
                          fontWeight: 700,
                        }}
                      >
                        preopened from dashboard
                      </span>
                    ) : null}
                  </div>

                  <pre
                    style={{
                      margin: 0,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      borderRadius: 12,
                      padding: 12,
                      background: "var(--panel)",
                      border: "1px solid var(--border)",
                      overflowX: "auto",
                      maxHeight: "62vh",
                    }}
                  >
                    {prettyJson(selectedRunDetail)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </AdminShell>
  );
}