"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminGuard } from "@/components/admin-guard";
import { AdminShell } from "@/components/admin-shell";
import { adminTechOpsMonitoring, getAdminMe } from "@/lib/api";
import type {
  AdminMe,
  AdminTechEnvironment,
  AdminTechIncidentSeverity,
  AdminTechIncidentStatus,
  AdminTechOpsMonitoringResponse,
  AdminTechSignalSource,
  AdminTechSignalType,
} from "@/lib/types";

const SAMPLE_SIGNALS = [
  {
    label: "Auth LinkedIn",
    payload: {
      signal_type: "auth_error" as AdminTechSignalType,
      signal_source: "backend" as AdminTechSignalSource,
      message:
        "Multiple 401/403 errors detected on LinkedIn auth callback and /auth/me in production.",
      language: "fr",
      environment: "production" as AdminTechEnvironment,
      context: {
        route: "/auth/linkedin/callback",
        failures_last_10m: 12,
      },
    },
  },
  {
    label: "Webhook Stripe",
    payload: {
      signal_type: "webhook_failure" as AdminTechSignalType,
      signal_source: "stripe" as AdminTechSignalSource,
      message: "Repeated Stripe webhook signature verification failures detected in production.",
      language: "fr",
      environment: "production" as AdminTechEnvironment,
      context: {
        route: "/webhooks/stripe",
        failures_last_10m: 8,
      },
    },
  },
  {
    label: "Génération artefact",
    payload: {
      signal_type: "artifact_generation_failure" as AdminTechSignalType,
      signal_source: "backend" as AdminTechSignalSource,
      message: "Artifact generation jobs are failing repeatedly after payment success events.",
      language: "fr",
      environment: "production" as AdminTechEnvironment,
      context: {
        flow: "ai_artifacts_generate",
        failures_last_30m: 5,
      },
    },
  },
  {
    label: "Frontend runtime",
    payload: {
      signal_type: "frontend_runtime_error" as AdminTechSignalType,
      signal_source: "vercel" as AdminTechSignalSource,
      message: "React runtime error detected on session page after recent deployment.",
      language: "fr",
      environment: "production" as AdminTechEnvironment,
      context: {
        page: "/session",
      },
    },
  },
];

const SIGNAL_TYPES: AdminTechSignalType[] = [
  "auth_error",
  "api_error",
  "webhook_failure",
  "artifact_generation_failure",
  "availability_alert",
  "frontend_runtime_error",
  "unknown",
];

const SIGNAL_SOURCES: AdminTechSignalSource[] = [
  "render",
  "vercel",
  "stripe",
  "backend",
  "frontend",
  "manual_test",
  "unknown",
];

const ENVIRONMENTS: AdminTechEnvironment[] = ["production", "staging", "development"];

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

function severityBadgeStyle(severity: AdminTechIncidentSeverity) {
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

function statusBadgeStyle(status: AdminTechIncidentStatus) {
  const base = {
    textTransform: "uppercase" as const,
    letterSpacing: "0.04em",
    fontWeight: 850,
  };

  if (status === "incident") {
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

export default function AdminTechOpsMonitoringPage() {
  return (
    <AdminGuard>
      <AdminTechOpsMonitoringContent />
    </AdminGuard>
  );
}

function AdminTechOpsMonitoringContent() {
  const [admin, setAdmin] = useState<AdminMe | null>(null);

  const [signalType, setSignalType] = useState<AdminTechSignalType>("auth_error");
  const [signalSource, setSignalSource] = useState<AdminTechSignalSource>("backend");
  const [message, setMessage] = useState(SAMPLE_SIGNALS[0].payload.message);
  const [language, setLanguage] = useState("fr");
  const [environment, setEnvironment] = useState<AdminTechEnvironment>("production");
  const [contextText, setContextText] = useState(
    JSON.stringify(SAMPLE_SIGNALS[0].payload.context, null, 2),
  );

  const [result, setResult] = useState<AdminTechOpsMonitoringResponse | null>(null);
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
      const response = await adminTechOpsMonitoring({
        signal_type: signalType,
        signal_source: signalSource,
        message,
        language,
        environment,
        context: formatContextText(contextText),
      });

      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l’analyse technique.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminShell
      activeHref="/admin/tech-ops-monitoring"
      title="Tech Ops Monitoring"
      subtitle="Manual technical signal analysis and incident qualification."
      adminEmail={admin?.email ?? null}
      adminRole={admin?.role ?? "admin"}
      adminOrganizationName={admin?.organization_name ?? null}
    >
      {adminLoading ? (
        <div className="card">Loading tech ops monitoring...</div>
      ) : (
        <div className="stack" style={{ gap: 18 }}>
          <div
            className="card stack"
            style={{
              gap: 16,
              border: "1px solid rgba(37,99,235,0.20)",
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
                background: "rgba(37,99,235,0.22)",
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
                    Technical monitoring
                  </span>

                  <span
                    style={{
                      borderRadius: 999,
                      padding: "8px 12px",
                      background: "rgba(59,130,246,0.26)",
                      fontSize: 12,
                      fontWeight: 900,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Incident assessment
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
                  Detect technical incidents before they break the worker experience.
                </div>

                <div
                  style={{
                    maxWidth: 980,
                    lineHeight: 1.7,
                    color: "rgba(255,255,255,0.74)",
                  }}
                >
                  Use this workspace to test and qualify technical signals such as LinkedIn auth
                  failures, Stripe webhook errors, artifact generation failures, frontend runtime
                  crashes, or availability alerts.
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
                  Select a technical pattern, adjust the message and context, then launch the tech
                  ops monitoring analysis.
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
                        setSignalType(event.target.value as AdminTechSignalType)
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
                        setSignalSource(event.target.value as AdminTechSignalSource)
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
                        setEnvironment(event.target.value as AdminTechEnvironment)
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
                  <span className="muted">Technical signal message</span>
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
                  Technical incident classification, likely causes, recommended checks and
                  escalation guidance.
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
                        result.status === "incident"
                          ? "1px solid rgba(220,38,38,0.20)"
                          : result.status === "watch"
                            ? "1px solid rgba(245,158,11,0.22)"
                            : "1px solid rgba(21,128,61,0.20)",
                      background:
                        result.status === "incident"
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

                      <span className="badge">Type: {normalizeLabel(result.incident_type)}</span>
                      <span className="badge">
                        Incident: {result.incident_detected ? "yes" : "no"}
                      </span>
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