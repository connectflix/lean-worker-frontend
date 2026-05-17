"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminGuard } from "@/components/admin-guard";
import { AdminShell } from "@/components/admin-shell";
import { adminBusinessOpsMonitoring, getAdminMe } from "@/lib/api";
import type {
  AdminBusinessEnvironment,
  AdminBusinessIssueSeverity,
  AdminBusinessIssueStatus,
  AdminBusinessOpsMonitoringResponse,
  AdminBusinessSignalSource,
  AdminBusinessSignalType,
  AdminMe,
} from "@/lib/types";

const SAMPLE_SIGNALS = [
  {
    label: "Paiement sans déblocage",
    payload: {
      signal_type: "unlock_signal" as AdminBusinessSignalType,
      signal_source: "backend" as AdminBusinessSignalSource,
      message: "Several successful payments appear without effective content unlock in production.",
      language: "fr",
      environment: "production" as AdminBusinessEnvironment,
      context: {
        successful_payments_last_30m: 9,
        locked_after_payment_last_30m: 4,
      },
    },
  },
  {
    label: "Chute funnel",
    payload: {
      signal_type: "funnel_signal" as AdminBusinessSignalType,
      signal_source: "analytics" as AdminBusinessSignalSource,
      message: "Conversion from preview to checkout dropped sharply after the latest pricing change.",
      language: "fr",
      environment: "production" as AdminBusinessEnvironment,
      context: {
        previous_conversion_rate: 0.18,
        current_conversion_rate: 0.07,
      },
    },
  },
  {
    label: "Artefacts non livrés",
    payload: {
      signal_type: "artifact_signal" as AdminBusinessSignalType,
      signal_source: "dashboard" as AdminBusinessSignalSource,
      message: "Generated artifacts are accumulating in pending state and are not visible to users.",
      language: "fr",
      environment: "production" as AdminBusinessEnvironment,
      context: {
        pending_artifacts: 11,
      },
    },
  },
  {
    label: "Engagement recommandations",
    payload: {
      signal_type: "engagement_signal" as AdminBusinessSignalType,
      signal_source: "dashboard" as AdminBusinessSignalSource,
      message: "Recommendation engagement appears to be declining across recent sessions.",
      language: "fr",
      environment: "production" as AdminBusinessEnvironment,
      context: {
        open_rate_last_7d: 0.11,
      },
    },
  },
];

const SIGNAL_TYPES: AdminBusinessSignalType[] = [
  "payment_signal",
  "unlock_signal",
  "artifact_signal",
  "engagement_signal",
  "funnel_signal",
  "retention_signal",
  "unknown",
];

const SIGNAL_SOURCES: AdminBusinessSignalSource[] = [
  "stripe",
  "backend",
  "dashboard",
  "analytics",
  "manual_test",
  "unknown",
];

const ENVIRONMENTS: AdminBusinessEnvironment[] = ["production", "staging", "development"];

function formatContextText(value: string): Record<string, string | number | boolean | null> | null {
  const trimmed = value.trim();

  if (!trimmed) return null;

  try {
    const parsed = JSON.parse(trimmed);

    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, string | number | boolean | null>;
    }

    return null;
  } catch {
    return null;
  }
}

function normalizeLabel(value?: string | null): string {
  if (!value) return "—";

  return value
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function severityBadgeStyle(severity: AdminBusinessIssueSeverity) {
  const base = {
    textTransform: "uppercase" as const,
    letterSpacing: "0.04em",
    fontWeight: 850,
  };

  switch (severity) {
    case "critical":
      return {
        ...base,
        borderColor: "rgba(220,38,38,0.24)",
        color: "var(--danger)",
        background: "rgba(220,38,38,0.08)",
      };
    case "high":
      return {
        ...base,
        borderColor: "rgba(245,158,11,0.25)",
        color: "var(--warning, #b45309)",
        background: "rgba(245,158,11,0.10)",
      };
    case "medium":
      return {
        ...base,
        borderColor: "rgba(37,99,235,0.18)",
        color: "var(--primary)",
        background: "rgba(37,99,235,0.08)",
      };
    default:
      return base;
  }
}

function statusBadgeStyle(status: AdminBusinessIssueStatus) {
  const base = {
    textTransform: "uppercase" as const,
    letterSpacing: "0.04em",
    fontWeight: 850,
  };

  if (status === "issue") {
    return {
      ...base,
      borderColor: "rgba(220,38,38,0.24)",
      color: "var(--danger)",
      background: "rgba(220,38,38,0.08)",
    };
  }

  if (status === "watch") {
    return {
      ...base,
      borderColor: "rgba(245,158,11,0.25)",
      color: "var(--warning, #b45309)",
      background: "rgba(245,158,11,0.10)",
    };
  }

  return {
    ...base,
    borderColor: "rgba(21,128,61,0.20)",
    color: "var(--success)",
    background: "rgba(21,128,61,0.08)",
  };
}

function JsonBlock({ value }: { value: unknown }) {
  return (
    <pre
      style={{
        margin: 0,
        padding: 12,
        borderRadius: 14,
        border: "1px solid var(--border)",
        background: "rgba(15,23,42,0.04)",
        overflowX: "auto",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        fontSize: 12,
        lineHeight: 1.55,
      }}
    >
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

export default function AdminBusinessOpsMonitoringPage() {
  return (
    <AdminGuard>
      <AdminBusinessOpsMonitoringContent />
    </AdminGuard>
  );
}

function AdminBusinessOpsMonitoringContent() {
  const [admin, setAdmin] = useState<AdminMe | null>(null);

  const [signalType, setSignalType] = useState<AdminBusinessSignalType>("unlock_signal");
  const [signalSource, setSignalSource] = useState<AdminBusinessSignalSource>("backend");
  const [message, setMessage] = useState(SAMPLE_SIGNALS[0].payload.message);
  const [language, setLanguage] = useState("fr");
  const [environment, setEnvironment] = useState<AdminBusinessEnvironment>("production");
  const [contextText, setContextText] = useState(
    JSON.stringify(SAMPLE_SIGNALS[0].payload.context, null, 2),
  );

  const [result, setResult] = useState<AdminBusinessOpsMonitoringResponse | null>(null);
  const [adminLoading, setAdminLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAdmin() {
      try {
        const me = await getAdminMe();
        setAdmin(me);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load admin profile.");
      } finally {
        setAdminLoading(false);
      }
    }

    void loadAdmin();
  }, []);

  function applySample(index: number) {
    const sample = SAMPLE_SIGNALS[index];

    if (!sample) return;

    setSignalType(sample.payload.signal_type);
    setSignalSource(sample.payload.signal_source);
    setMessage(sample.payload.message);
    setLanguage(sample.payload.language);
    setEnvironment(sample.payload.environment);
    setContextText(JSON.stringify(sample.payload.context ?? {}, null, 2));
    setResult(null);
    setError(null);
  }

  async function handleAssess() {
    setLoading(true);
    setError(null);

    try {
      const response = await adminBusinessOpsMonitoring({
        signal_type: signalType,
        signal_source: signalSource,
        message,
        language,
        environment,
        context: formatContextText(contextText),
      });

      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l’analyse business.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminShell
      activeHref="/admin/business-ops-monitoring"
      title="Business Ops Monitoring"
      subtitle="Manual business signal analysis and product anomaly qualification."
      adminEmail={admin?.email ?? null}
      adminRole={admin?.role ?? "admin"}
      adminOrganizationName={admin?.organization_name ?? null}
    >
      {adminLoading ? (
        <div className="card">Loading business ops monitoring...</div>
      ) : (
        <div className="stack" style={{ gap: 18 }}>
          <div
            className="card stack"
            style={{
              gap: 16,
              border: "1px solid rgba(124,58,237,0.20)",
              background:
                "linear-gradient(135deg, rgba(15,23,42,0.98), rgba(30,41,59,0.96))",
              color: "white",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                right: -110,
                top: -140,
                width: 310,
                height: 310,
                borderRadius: 999,
                background: "rgba(124,58,237,0.22)",
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
                    Business monitoring
                  </span>

                  <span
                    style={{
                      borderRadius: 999,
                      padding: "8px 12px",
                      background: "rgba(245,158,11,0.22)",
                      fontSize: 12,
                      fontWeight: 900,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Manual signal assessment
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
                  Analyse business signals before they become revenue or experience incidents.
                </div>

                <div
                  style={{
                    maxWidth: 980,
                    lineHeight: 1.7,
                    color: "rgba(255,255,255,0.74)",
                  }}
                >
                  Use this workspace to test business anomaly signals such as payment unlock
                  issues, funnel drops, artifact delivery problems, and recommendation engagement
                  declines.
                </div>
              </div>

              <div className="row" style={{ gap: 8, flexWrap: "wrap", position: "relative" }}>
                <Link className="button ghost" href="/admin">
                  Dashboard
                </Link>

                <Link className="button ghost" href="/admin/orchestration?mode=test">
                  Orchestration test
                </Link>

                <Link className="button ghost" href="/admin/agent-reports">
                  Agent reports
                </Link>
              </div>
            </div>
          </div>

          {error ? (
            <div className="card" style={{ color: "var(--danger)" }}>
              {error}
            </div>
          ) : null}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 0.95fr) minmax(360px, 1.05fr)",
              gap: 18,
              alignItems: "start",
            }}
          >
            <div className="card stack" style={{ gap: 16, minWidth: 0 }}>
              <div className="stack" style={{ gap: 4 }}>
                <div className="section-title">Signal input</div>
                <div className="muted">
                  Select a signal pattern, adjust the message and context, then launch the business
                  monitoring analysis.
                </div>
              </div>

              <div className="stack" style={{ gap: 14 }}>
                <label className="stack" style={{ gap: 8 }}>
                  <span className="muted">Quick samples</span>

                  <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                    {SAMPLE_SIGNALS.map((sample, index) => (
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
                </label>

                <div className="grid grid-2">
                  <label className="stack" style={{ gap: 6 }}>
                    <span className="muted">Signal type</span>
                    <select
                      className="select"
                      value={signalType}
                      onChange={(event) =>
                        setSignalType(event.target.value as AdminBusinessSignalType)
                      }
                    >
                      {SIGNAL_TYPES.map((item) => (
                        <option key={item} value={item}>
                          {normalizeLabel(item)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="stack" style={{ gap: 6 }}>
                    <span className="muted">Signal source</span>
                    <select
                      className="select"
                      value={signalSource}
                      onChange={(event) =>
                        setSignalSource(event.target.value as AdminBusinessSignalSource)
                      }
                    >
                      {SIGNAL_SOURCES.map((item) => (
                        <option key={item} value={item}>
                          {normalizeLabel(item)}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="grid grid-2">
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

                  <label className="stack" style={{ gap: 6 }}>
                    <span className="muted">Environment</span>
                    <select
                      className="select"
                      value={environment}
                      onChange={(event) =>
                        setEnvironment(event.target.value as AdminBusinessEnvironment)
                      }
                    >
                      {ENVIRONMENTS.map((item) => (
                        <option key={item} value={item}>
                          {normalizeLabel(item)}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="stack" style={{ gap: 6 }}>
                  <span className="muted">Business signal message</span>
                  <textarea
                    className="textarea"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    rows={8}
                    style={{
                      resize: "vertical",
                      lineHeight: 1.55,
                      minHeight: 170,
                    }}
                  />
                </label>

                <label className="stack" style={{ gap: 6 }}>
                  <span className="muted">Context JSON optional</span>
                  <textarea
                    className="textarea"
                    value={contextText}
                    onChange={(event) => setContextText(event.target.value)}
                    rows={8}
                    style={{
                      resize: "vertical",
                      fontFamily:
                        "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                      fontSize: 13,
                      lineHeight: 1.55,
                      minHeight: 170,
                    }}
                  />
                </label>

                <div
                  className="row"
                  style={{
                    gap: 8,
                    flexWrap: "wrap",
                    position: "sticky",
                    bottom: 0,
                    zIndex: 5,
                    paddingTop: 10,
                    paddingBottom: 4,
                    background: "rgba(255,255,255,0.94)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <button
                    className="button"
                    type="button"
                    onClick={() => void handleAssess()}
                    disabled={loading || !message.trim()}
                  >
                    {loading ? "Analysing..." : "Analyse signal"}
                  </button>

                  <button
                    className="button ghost"
                    type="button"
                    onClick={() => {
                      setResult(null);
                      setError(null);
                    }}
                    disabled={loading}
                  >
                    Clear result
                  </button>
                </div>
              </div>
            </div>

            <div
              className="card stack"
              style={{
                gap: 16,
                minWidth: 0,
                position: "sticky",
                top: 96,
              }}
            >
              <div className="stack" style={{ gap: 4 }}>
                <div className="section-title">Monitoring result</div>
                <div className="muted">
                  Business issue classification, likely causes, recommended checks and escalation
                  guidance.
                </div>
              </div>

              {!result ? (
                <div className="card-soft muted">No result yet.</div>
              ) : (
                <div className="stack" style={{ gap: 16 }}>
                  <div
                    className="card-soft stack"
                    style={{
                      gap: 10,
                      border:
                        result.status === "issue"
                          ? "1px solid rgba(220,38,38,0.20)"
                          : result.status === "watch"
                            ? "1px solid rgba(245,158,11,0.22)"
                            : "1px solid rgba(21,128,61,0.20)",
                      background:
                        result.status === "issue"
                          ? "rgba(220,38,38,0.06)"
                          : result.status === "watch"
                            ? "rgba(245,158,11,0.07)"
                            : "rgba(21,128,61,0.06)",
                    }}
                  >
                    <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                      <span className="badge" style={statusBadgeStyle(result.status)}>
                        Status: {normalizeLabel(result.status)}
                      </span>

                      <span className="badge" style={severityBadgeStyle(result.severity)}>
                        Severity: {normalizeLabel(result.severity)}
                      </span>

                      <span className="badge">Type: {normalizeLabel(result.issue_type)}</span>
                      <span className="badge">Issue: {result.issue_detected ? "yes" : "no"}</span>
                      <span className="badge">Escalate: {result.escalate ? "yes" : "no"}</span>
                      <span className="badge">
                        Confidence: {Math.round((result.confidence || 0) * 100)}%
                      </span>
                    </div>

                    <div className="muted" style={{ lineHeight: 1.65, whiteSpace: "pre-wrap" }}>
                      {result.summary}
                    </div>
                  </div>

                  <div className="grid grid-2">
                    <div className="card-soft stack" style={{ gap: 8 }}>
                      <div className="section-title" style={{ fontSize: 15 }}>
                        Likely causes
                      </div>

                      {result.likely_causes.length === 0 ? (
                        <div className="muted">No likely cause returned.</div>
                      ) : (
                        <div className="stack" style={{ gap: 8 }}>
                          {result.likely_causes.map((item, index) => (
                            <div
                              key={`${item}-${index}`}
                              className="muted"
                              style={{
                                lineHeight: 1.5,
                                borderTop: index === 0 ? "none" : "1px solid var(--border)",
                                paddingTop: index === 0 ? 0 : 8,
                              }}
                            >
                              {item}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="card-soft stack" style={{ gap: 8 }}>
                      <div className="section-title" style={{ fontSize: 15 }}>
                        Recommended checks
                      </div>

                      {result.recommended_checks.length === 0 ? (
                        <div className="muted">No recommended check returned.</div>
                      ) : (
                        <div className="stack" style={{ gap: 8 }}>
                          {result.recommended_checks.map((item, index) => (
                            <div
                              key={`${item}-${index}`}
                              className="muted"
                              style={{
                                lineHeight: 1.5,
                                borderTop: index === 0 ? "none" : "1px solid var(--border)",
                                paddingTop: index === 0 ? 0 : 8,
                              }}
                            >
                              {item}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="card-soft stack" style={{ gap: 8 }}>
                    <div className="section-title" style={{ fontSize: 15 }}>
                      Escalation reason
                    </div>

                    <div className="muted" style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                      {result.escalation_reason || "—"}
                    </div>
                  </div>

                  <div className="stack" style={{ gap: 8 }}>
                    <div className="section-title" style={{ fontSize: 15 }}>
                      Raw JSON
                    </div>

                    <JsonBlock value={result} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}