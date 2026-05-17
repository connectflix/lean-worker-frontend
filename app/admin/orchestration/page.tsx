"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AdminGuard } from "@/components/admin-guard";
import { AdminShell } from "@/components/admin-shell";
import {
  adminOrchestrationRun,
  getAdminMe,
  getAdminOrchestrationRunDetail,
  getAdminOrchestrationRuns,
} from "@/lib/api";
import type {
  AdminMe,
  AdminOrchestrationOptions,
  AdminOrchestrationResponse,
  AdminOrchestrationRunDetail,
  AdminOrchestrationRunSummary,
  AdminOrchestrationScenario,
} from "@/lib/types";

const SCENARIOS: AdminOrchestrationScenario[] = [
  "support_case_flow",
  "ops_incident_flow",
  "daily_management_flow",
  "growth_followup_flow",
  "customer_experience_flow",
];

const SAMPLE_CASES: {
  label: string;
  scenario: AdminOrchestrationScenario;
  language: string;
  input_payload: Record<string, unknown>;
  options: AdminOrchestrationOptions;
}[] = [
  {
    label: "Support case",
    scenario: "support_case_flow",
    language: "fr",
    input_payload: {
      message: "J’ai payé mais mon audiobook est toujours verrouillé.",
      user_email: "user@example.com",
      source: "admin_orchestration_test",
    },
    options: {
      include_intermediate_results: true,
      force_chief_of_staff: false,
      force_daily_briefing: false,
      force_customer_experience: false,
    },
  },
  {
    label: "Ops incident mixte",
    scenario: "ops_incident_flow",
    language: "fr",
    input_payload: {
      signal_type: "unlock_signal",
      signal_source: "backend",
      environment: "production",
      message:
        "Several successful payments appear without effective content unlock in production.",
      context: {
        successful_payments_last_30m: 9,
        locked_after_payment_last_30m: 4,
      },
      founder_notes: "Vérifie si cela justifie une attention founder.",
    },
    options: {
      include_intermediate_results: true,
      force_chief_of_staff: false,
      force_daily_briefing: false,
      force_customer_experience: false,
    },
  },
  {
    label: "Daily management",
    scenario: "daily_management_flow",
    language: "fr",
    input_payload: {
      support_summary:
        "Hausse de tickets sur des paiements réussis sans déblocage effectif du contenu.",
      tech_ops_summary: "Erreurs intermittentes sur le callback LinkedIn en production.",
      business_ops_summary: "Chute récente du funnel preview → checkout.",
      customer_experience_summary:
        "Plusieurs utilisateurs semblent frustrés par des réponses du coach perçues comme insuffisamment pertinentes.",
      customer_experience_signal_type: "coach_signal",
      customer_experience_signal_source: "user_feedback",
      customer_experience_environment: "production",
      customer_experience_context: {
        issue: "coach_relevance",
      },
      founder_notes: "Je veux une vue de pilotage claire pour aujourd’hui.",
      context: {
        day: "today",
      },
    },
    options: {
      include_intermediate_results: true,
      force_chief_of_staff: false,
      force_daily_briefing: false,
      force_customer_experience: true,
    },
  },
  {
    label: "Growth follow-up",
    scenario: "growth_followup_flow",
    language: "fr",
    input_payload: {
      signal_type: "artifact_signal",
      signal_source: "analytics",
      environment: "production",
      message:
        "Many users preview the artifact but do not continue to checkout after pricing is shown.",
      context: {
        preview_to_checkout_rate: 0.08,
      },
      founder_notes: "Regarde si cela demande une revue manuelle.",
    },
    options: {
      include_intermediate_results: true,
      force_chief_of_staff: false,
      force_daily_briefing: false,
      force_customer_experience: false,
    },
  },
  {
    label: "Customer experience",
    scenario: "customer_experience_flow",
    language: "fr",
    input_payload: {
      signal_type: "coach_signal",
      signal_source: "manual_test",
      environment: "production",
      message:
        "The coach answers in English while the user writes in French, creating frustration and a poor overall experience.",
      context: {
        user_language: "fr",
        coach_reply_language: "en",
      },
      founder_notes: "Vérifie si cela justifie une attention particulière.",
    },
    options: {
      include_intermediate_results: true,
      force_chief_of_staff: false,
      force_daily_briefing: false,
      force_customer_experience: false,
    },
  },
];

type RunFilterMode = "all" | "failed" | "partial" | "critical";
type OrchestrationViewMode = "production" | "test";

function prettyJson(value: unknown): string {
  return JSON.stringify(value ?? {}, null, 2);
}

function parseJsonObject(value: string): Record<string, unknown> {
  const trimmed = value.trim();

  if (!trimmed) {
    return {};
  }

  const parsed = JSON.parse(trimmed);

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Le JSON doit être un objet.");
  }

  return parsed as Record<string, unknown>;
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

function isCriticalRun(run: AdminOrchestrationRunSummary): boolean {
  const escalations = run.escalations ?? [];
  const haystack = escalations.join(" | ").toLowerCase();

  if (run.status === "failed") return true;
  if (haystack.includes("founder")) return true;
  if (haystack.includes("critical")) return true;
  if (haystack.includes("p1")) return true;

  return false;
}

function normalizeScenarioLabel(value: string): string {
  return value
    .replaceAll("_", " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
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

export default function AdminOrchestrationPage() {
  return (
    <AdminGuard>
      <Suspense
        fallback={
          <main className="page">
            <div className="container">
              <div className="card">Loading orchestration workspace...</div>
            </div>
          </main>
        }
      >
        <AdminOrchestrationContent />
      </Suspense>
    </AdminGuard>
  );
}

function AdminOrchestrationContent() {
  const searchParams = useSearchParams();
  const preopenedRunRef = useRef<HTMLButtonElement | null>(null);

  const [admin, setAdmin] = useState<AdminMe | null>(null);
  const [viewMode, setViewMode] = useState<OrchestrationViewMode>("production");

  const [scenario, setScenario] = useState<AdminOrchestrationScenario>("support_case_flow");
  const [language, setLanguage] = useState("fr");
  const [inputPayloadText, setInputPayloadText] = useState(
    prettyJson(SAMPLE_CASES[0].input_payload),
  );
  const [optionsText, setOptionsText] = useState(prettyJson(SAMPLE_CASES[0].options));
  const [result, setResult] = useState<AdminOrchestrationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [runs, setRuns] = useState<AdminOrchestrationRunSummary[]>([]);
  const [runsLoading, setRunsLoading] = useState(true);
  const [runsError, setRunsError] = useState<string | null>(null);

  const [selectedRunId, setSelectedRunId] = useState<number | null>(null);
  const [selectedRunDetail, setSelectedRunDetail] =
    useState<AdminOrchestrationRunDetail | null>(null);
  const [runDetailLoading, setRunDetailLoading] = useState(false);
  const [runDetailError, setRunDetailError] = useState<string | null>(null);

  const [runFilter, setRunFilter] = useState<RunFilterMode>("all");

  const preopenedRunId = useMemo(() => {
    const rawRun = searchParams.get("run");

    if (!rawRun) return null;

    const parsed = Number(rawRun);

    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [searchParams]);

  useEffect(() => {
    async function loadAdminAndRuns() {
      try {
        const [me, data] = await Promise.all([getAdminMe(), getAdminOrchestrationRuns(100)]);

        setAdmin(me);
        setRuns(data);
      } catch (err) {
        setRunsError(err instanceof Error ? err.message : "Impossible de charger les runs.");
      } finally {
        setRunsLoading(false);
      }
    }

    void loadAdminAndRuns();
  }, []);

  useEffect(() => {
    const rawFilter = searchParams.get("filter");
    const rawMode = searchParams.get("mode");

    if (
      rawFilter === "all" ||
      rawFilter === "failed" ||
      rawFilter === "partial" ||
      rawFilter === "critical"
    ) {
      setRunFilter(rawFilter);
    }

    if (rawMode === "test") {
      setViewMode("test");
    }
  }, [searchParams]);

  async function refreshRuns() {
    setRunsLoading(true);
    setRunsError(null);

    try {
      const data = await getAdminOrchestrationRuns(100);
      setRuns(data);
    } catch (err) {
      setRunsError(err instanceof Error ? err.message : "Impossible de charger les runs.");
    } finally {
      setRunsLoading(false);
    }
  }

  async function loadRunDetail(runId: number) {
    setRunDetailLoading(true);
    setRunDetailError(null);

    try {
      const detail = await getAdminOrchestrationRunDetail(runId);
      setSelectedRunDetail(detail);
    } catch (err) {
      setRunDetailError(
        err instanceof Error ? err.message : "Impossible de charger le détail du run.",
      );
      setSelectedRunDetail(null);
    } finally {
      setRunDetailLoading(false);
    }
  }

  useEffect(() => {
    if (!preopenedRunId) return;

    setSelectedRunId(preopenedRunId);
    void loadRunDetail(preopenedRunId);
  }, [preopenedRunId]);

  function applySample(index: number) {
    const sample = SAMPLE_CASES[index];

    if (!sample) return;

    setScenario(sample.scenario);
    setLanguage(sample.language);
    setInputPayloadText(prettyJson(sample.input_payload));
    setOptionsText(prettyJson(sample.options));
    setResult(null);
    setError(null);
  }

  async function handleRun() {
    setLoading(true);
    setError(null);

    try {
      const inputPayload = parseJsonObject(inputPayloadText);
      const options = parseJsonObject(optionsText) as AdminOrchestrationOptions;

      const response = await adminOrchestrationRun({
        scenario,
        language,
        input_payload: inputPayload,
        options,
      });

      setResult(response);
      await refreshRuns();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec du run d’orchestration.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  const filteredRuns = useMemo(() => {
    if (runFilter === "all") return runs;
    if (runFilter === "failed") return runs.filter((run) => run.status === "failed");
    if (runFilter === "partial") return runs.filter((run) => run.status === "partial");

    return runs.filter((run) => isCriticalRun(run));
  }, [runs, runFilter]);

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

  const failedCount = runs.filter((run) => run.status === "failed").length;
  const partialCount = runs.filter((run) => run.status === "partial").length;
  const successCount = runs.filter((run) => run.status === "success").length;
  const criticalCount = runs.filter((run) => isCriticalRun(run)).length;

  const latestRun = runs[0] ?? null;

  return (
    <AdminShell
      activeHref="/admin/orchestration"
      title="Orchestration"
      subtitle="Production monitoring by default, with an optional test console when needed."
      adminEmail={admin?.email ?? null}
    >
      <div className="stack" style={{ gap: 18 }}>
        <div
          className="card stack"
          style={{
            gap: 16,
            border: "1px solid rgba(59,130,246,0.18)",
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
              right: -100,
              top: -120,
              width: 290,
              height: 290,
              borderRadius: 999,
              background: "rgba(59,130,246,0.22)",
              filter: "blur(4px)",
            }}
          />

          <div
            style={{
              position: "absolute",
              left: "48%",
              bottom: -130,
              width: 310,
              height: 310,
              borderRadius: 999,
              background: "rgba(20,184,166,0.16)",
              filter: "blur(6px)",
            }}
          />

          <div
            className="row space-between"
            style={{
              gap: 12,
              alignItems: "flex-start",
              flexWrap: "wrap",
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
                  Orchestration Control
                </span>

                <span
                  style={{
                    borderRadius: 999,
                    padding: "8px 12px",
                    background:
                      viewMode === "production"
                        ? "rgba(21,128,61,0.28)"
                        : "rgba(245,158,11,0.24)",
                    fontSize: 12,
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {viewMode === "production" ? "Production mode" : "Test mode"}
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
                Monitor orchestration runs, incidents and founder-level alerts.
              </div>

              <div
                style={{
                  maxWidth: 940,
                  lineHeight: 1.7,
                  color: "rgba(255,255,255,0.74)",
                }}
              >
                Production mode keeps the workspace focused on operational review. Test mode exposes
                the manual scenario console for controlled validation.
              </div>
            </div>

            <div className="row" style={{ gap: 8, flexWrap: "wrap", position: "relative" }}>
              <button
                className={viewMode === "production" ? "button" : "button ghost"}
                type="button"
                onClick={() => setViewMode("production")}
              >
                Production mode
              </button>

              <button
                className={viewMode === "test" ? "button secondary" : "button ghost"}
                type="button"
                onClick={() => setViewMode("test")}
              >
                Test mode
              </button>

              <Link className="button ghost" href="/admin/agent-reports">
                Agent Reports
              </Link>
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
              { label: "Success", value: successCount },
              { label: "Partial", value: partialCount },
              { label: "Failed", value: failedCount },
              { label: "Critical", value: criticalCount },
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

          {latestRun ? (
            <div
              style={{
                position: "relative",
                borderRadius: 16,
                padding: 12,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.62)" }}>
                Latest run
              </div>
              <div style={{ marginTop: 4, fontWeight: 850 }}>
                #{latestRun.id} · {normalizeScenarioLabel(latestRun.scenario)} ·{" "}
                {new Date(latestRun.created_at).toLocaleString()}
              </div>
            </div>
          ) : null}
        </div>

        {viewMode === "test" ? (
          <div className="grid grid-2" style={{ alignItems: "start" }}>
            <div className="card stack" style={{ gap: 16 }}>
              <div
                className="row space-between"
                style={{ gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}
              >
                <div className="stack" style={{ gap: 4 }}>
                  <div className="section-title">Manual test console</div>
                  <div className="muted">
                    Launch a scenario manually to test or inspect orchestration behavior.
                  </div>
                </div>
              </div>

              <div className="card-soft stack" style={{ gap: 12 }}>
                <span className="muted">Quick samples</span>

                <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                  {SAMPLE_CASES.map((sample, index) => (
                    <button
                      key={sample.label}
                      className="button ghost"
                      type="button"
                      onClick={() => applySample(index)}
                    >
                      {sample.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-2">
                <label className="stack" style={{ gap: 6 }}>
                  <span className="muted">Scenario</span>
                  <select
                    className="select"
                    value={scenario}
                    onChange={(event) =>
                      setScenario(event.target.value as AdminOrchestrationScenario)
                    }
                  >
                    {SCENARIOS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="stack" style={{ gap: 6 }}>
                  <span className="muted">Language</span>
                  <select
                    className="select"
                    value={language}
                    onChange={(event) => setLanguage(event.target.value)}
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                  </select>
                </label>
              </div>

              <label className="stack" style={{ gap: 6 }}>
                <span className="muted">Input payload JSON</span>
                <textarea
                  className="textarea"
                  value={inputPayloadText}
                  onChange={(event) => setInputPayloadText(event.target.value)}
                  rows={14}
                  style={{
                    fontFamily:
                      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                    fontSize: 13,
                    lineHeight: 1.55,
                  }}
                />
              </label>

              <label className="stack" style={{ gap: 6 }}>
                <span className="muted">Options JSON</span>
                <textarea
                  className="textarea"
                  value={optionsText}
                  onChange={(event) => setOptionsText(event.target.value)}
                  rows={8}
                  style={{
                    fontFamily:
                      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                    fontSize: 13,
                    lineHeight: 1.55,
                  }}
                />
              </label>

              <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
                <button
                  className="button"
                  onClick={() => void handleRun()}
                  type="button"
                  disabled={loading}
                >
                  {loading ? "Exécution..." : "Lancer le scénario"}
                </button>

                <button
                  className="button ghost"
                  onClick={() => void refreshRuns()}
                  type="button"
                  disabled={runsLoading}
                >
                  Rafraîchir les runs
                </button>
              </div>

              {error ? (
                <div className="card-soft" style={{ color: "var(--danger)" }}>
                  {error}
                </div>
              ) : null}
            </div>

            <div
              className="card stack"
              style={{
                gap: 14,
                position: "sticky",
                top: 96,
              }}
            >
              <div className="section-title">Immediate test result</div>

              {result ? (
                <div className="stack" style={{ gap: 10 }}>
                  <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                    <span className="badge">{result.scenario}</span>
                    <StatusPill status={result.status} />
                    <span className="badge">confidence {result.confidence.toFixed(2)}</span>
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
                      maxHeight: "62vh",
                    }}
                  >
                    {prettyJson(result)}
                  </pre>
                </div>
              ) : (
                <div className="muted">Aucun résultat de test affiché pour le moment.</div>
              )}
            </div>
          </div>
        ) : null}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(360px, 0.9fr)",
            gap: 18,
            alignItems: "start",
          }}
        >
          <div className="card stack" style={{ gap: 16, minWidth: 0 }}>
            <div
              className="row space-between"
              style={{ alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}
            >
              <div className="stack" style={{ gap: 4 }}>
                <div className="section-title">Recent incidents and alerts</div>
                <div className="muted">Filter recent runs by operational risk level.</div>
              </div>

              <button
                className="button ghost"
                type="button"
                onClick={() => void refreshRuns()}
                disabled={runsLoading}
              >
                {runsLoading ? "Refreshing..." : "Refresh runs"}
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(140px, 1fr))",
                gap: 10,
              }}
            >
              <button
                className="card-soft stack"
                type="button"
                onClick={() => setRunFilter("all")}
                style={{
                  gap: 6,
                  cursor: "pointer",
                  textAlign: "left",
                  border:
                    runFilter === "all" ? "1px solid var(--primary)" : "1px solid var(--border)",
                }}
              >
                <div className="muted">All</div>
                <div className="admin-metric-value" style={{ fontSize: 24 }}>
                  {runs.length}
                </div>
              </button>

              <button
                className="card-soft stack"
                type="button"
                onClick={() => setRunFilter("failed")}
                style={{
                  gap: 6,
                  cursor: "pointer",
                  textAlign: "left",
                  border:
                    runFilter === "failed"
                      ? "1px solid var(--primary)"
                      : "1px solid var(--border)",
                }}
              >
                <div className="muted">Failed</div>
                <div
                  className="admin-metric-value"
                  style={{ fontSize: 24, color: "var(--danger)" }}
                >
                  {failedCount}
                </div>
              </button>

              <button
                className="card-soft stack"
                type="button"
                onClick={() => setRunFilter("partial")}
                style={{
                  gap: 6,
                  cursor: "pointer",
                  textAlign: "left",
                  border:
                    runFilter === "partial"
                      ? "1px solid var(--primary)"
                      : "1px solid var(--border)",
                }}
              >
                <div className="muted">Partial</div>
                <div
                  className="admin-metric-value"
                  style={{ fontSize: 24, color: "var(--warning, #b45309)" }}
                >
                  {partialCount}
                </div>
              </button>

              <button
                className="card-soft stack"
                type="button"
                onClick={() => setRunFilter("critical")}
                style={{
                  gap: 6,
                  cursor: "pointer",
                  textAlign: "left",
                  border:
                    runFilter === "critical"
                      ? "1px solid var(--primary)"
                      : "1px solid var(--border)",
                }}
              >
                <div className="muted">Critical</div>
                <div
                  className="admin-metric-value"
                  style={{ fontSize: 24, color: "var(--danger)" }}
                >
                  {criticalCount}
                </div>
              </button>
            </div>

            {runsLoading ? (
              <div className="card-soft">Chargement des runs...</div>
            ) : runsError ? (
              <div className="card-soft" style={{ color: "var(--danger)" }}>
                {runsError}
              </div>
            ) : filteredRuns.length === 0 ? (
              <div className="card-soft muted">Aucun run correspondant à ce filtre.</div>
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
                        boxShadow: isPreopened ? "0 0 0 3px rgba(220,38,38,0.08)" : undefined,
                      }}
                    >
                      <div
                        className="row space-between"
                        style={{ gap: 12, alignItems: "center", flexWrap: "wrap" }}
                      >
                        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                          <span className="badge">#{run.id}</span>
                          <span className="badge">{normalizeScenarioLabel(run.scenario)}</span>
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

                        <div className="muted">{new Date(run.created_at).toLocaleString()}</div>
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
            <div className="row space-between" style={{ gap: 12, flexWrap: "wrap" }}>
              <div className="section-title">Selected run detail</div>

              {selectedRunDetail ? (
                <Link
                  className="button ghost"
                  href={`/admin/agent-reports?status=critical&run=${selectedRunDetail.id}`}
                >
                  Open in Agent Reports
                </Link>
              ) : null}
            </div>

            {!selectedRunId ? (
              <div className="card-soft muted">
                Sélectionne un run dans la liste pour voir son détail.
              </div>
            ) : runDetailLoading ? (
              <div className="card-soft">Chargement du détail...</div>
            ) : runDetailError ? (
              <div className="card-soft" style={{ color: "var(--danger)" }}>
                {runDetailError}
              </div>
            ) : !selectedRunDetail ? (
              <div className="card-soft muted">Aucun détail disponible.</div>
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
                    maxHeight: "62vh",
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
    </AdminShell>
  );
}