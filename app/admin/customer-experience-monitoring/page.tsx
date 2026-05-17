"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminGuard } from "@/components/admin-guard";
import { AdminShell } from "@/components/admin-shell";
import { adminCustomerExperienceMonitoring, getAdminMe } from "@/lib/api";
import type {
  AdminCustomerExperienceEnvironment,
  AdminCustomerExperienceMonitoringResponse,
  AdminCustomerExperienceRisk,
  AdminCustomerExperienceSeverity,
  AdminCustomerExperienceSignalSource,
  AdminCustomerExperienceSignalType,
  AdminCustomerExperienceStatus,
  AdminMe,
} from "@/lib/types";

const SAMPLE_SIGNALS = [
  {
    label: "Coach mauvaise langue",
    payload: {
      signal_type: "coach_signal" as AdminCustomerExperienceSignalType,
      signal_source: "manual_test" as AdminCustomerExperienceSignalSource,
      message:
        "The coach answers in English while the user writes in French, which creates frustration and a poor experience.",
      language: "fr",
      environment: "production" as AdminCustomerExperienceEnvironment,
      context: {
        user_language: "fr",
        coach_reply_language: "en",
      },
    },
  },
  {
    label: "Recommendations génériques",
    payload: {
      signal_type: "recommendation_signal" as AdminCustomerExperienceSignalType,
      signal_source: "user_feedback" as AdminCustomerExperienceSignalSource,
      message:
        "The user says the recommendations feel too generic and not relevant to their situation.",
      language: "fr",
      environment: "production" as AdminCustomerExperienceEnvironment,
      context: {
        feedback_source: "user_feedback",
      },
    },
  },
  {
    label: "Levier peu clair",
    payload: {
      signal_type: "lever_signal" as AdminCustomerExperienceSignalType,
      signal_source: "support_case" as AdminCustomerExperienceSignalSource,
      message:
        "The user does not understand why this lever was suggested and does not see its value.",
      language: "fr",
      environment: "production" as AdminCustomerExperienceEnvironment,
      context: {
        lever_type: "developer",
      },
    },
  },
  {
    label: "Parcours confus",
    payload: {
      signal_type: "journey_signal" as AdminCustomerExperienceSignalType,
      signal_source: "manual_test" as AdminCustomerExperienceSignalSource,
      message:
        "The journey feels confusing and the next step is not clear after recommendations are shown.",
      language: "fr",
      environment: "production" as AdminCustomerExperienceEnvironment,
      context: {
        step: "recommendation_followup",
      },
    },
  },
];

const SIGNAL_TYPES: AdminCustomerExperienceSignalType[] = [
  "coach_signal",
  "recommendation_signal",
  "lever_signal",
  "artifact_signal",
  "journey_signal",
  "trust_signal",
  "unknown",
];

const SIGNAL_SOURCES: AdminCustomerExperienceSignalSource[] = [
  "user_feedback",
  "support_case",
  "manual_test",
  "dashboard",
  "conversation_review",
  "unknown",
];

const ENVIRONMENTS: AdminCustomerExperienceEnvironment[] = [
  "production",
  "staging",
  "development",
];

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

function statusBadgeStyle(status: AdminCustomerExperienceStatus) {
  const base = {
    textTransform: "uppercase" as const,
    letterSpacing: "0.04em",
    fontWeight: 850,
  };

  switch (status) {
    case "degraded":
      return {
        ...base,
        color: "var(--danger)",
        background: "rgba(220,38,38,0.08)",
        borderColor: "rgba(220,38,38,0.24)",
      };
    case "watch":
      return {
        ...base,
        color: "var(--warning, #b45309)",
        background: "rgba(245,158,11,0.10)",
        borderColor: "rgba(245,158,11,0.25)",
      };
    default:
      return {
        ...base,
        color: "var(--success)",
        background: "rgba(21,128,61,0.08)",
        borderColor: "rgba(21,128,61,0.20)",
      };
  }
}

function severityBadgeStyle(severity: AdminCustomerExperienceSeverity) {
  const base = {
    textTransform: "uppercase" as const,
    letterSpacing: "0.04em",
    fontWeight: 850,
  };

  switch (severity) {
    case "high":
      return {
        ...base,
        color: "var(--danger)",
        background: "rgba(220,38,38,0.08)",
        borderColor: "rgba(220,38,38,0.24)",
      };
    case "medium":
      return {
        ...base,
        color: "var(--warning, #b45309)",
        background: "rgba(245,158,11,0.10)",
        borderColor: "rgba(245,158,11,0.25)",
      };
    default:
      return {
        ...base,
        color: "var(--success)",
        background: "rgba(21,128,61,0.08)",
        borderColor: "rgba(21,128,61,0.20)",
      };
  }
}

function riskBadgeStyle(risk: AdminCustomerExperienceRisk) {
  const base = {
    textTransform: "uppercase" as const,
    letterSpacing: "0.04em",
    fontWeight: 850,
  };

  switch (risk) {
    case "high":
      return {
        ...base,
        color: "var(--danger)",
        background: "rgba(220,38,38,0.08)",
        borderColor: "rgba(220,38,38,0.24)",
      };
    case "medium":
      return {
        ...base,
        color: "var(--warning, #b45309)",
        background: "rgba(245,158,11,0.10)",
        borderColor: "rgba(245,158,11,0.25)",
      };
    default:
      return {
        ...base,
        color: "var(--success)",
        background: "rgba(21,128,61,0.08)",
        borderColor: "rgba(21,128,61,0.20)",
      };
  }
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

export default function AdminCustomerExperienceMonitoringPage() {
  return (
    <AdminGuard>
      <AdminCustomerExperienceMonitoringContent />
    </AdminGuard>
  );
}

function AdminCustomerExperienceMonitoringContent() {
  const [admin, setAdmin] = useState<AdminMe | null>(null);

  const [signalType, setSignalType] =
    useState<AdminCustomerExperienceSignalType>("coach_signal");
  const [signalSource, setSignalSource] =
    useState<AdminCustomerExperienceSignalSource>("manual_test");
  const [message, setMessage] = useState(SAMPLE_SIGNALS[0].payload.message);
  const [language, setLanguage] = useState("fr");
  const [environment, setEnvironment] =
    useState<AdminCustomerExperienceEnvironment>("production");
  const [contextText, setContextText] = useState(
    JSON.stringify(SAMPLE_SIGNALS[0].payload.context, null, 2),
  );

  const [result, setResult] =
    useState<AdminCustomerExperienceMonitoringResponse | null>(null);
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
      const response = await adminCustomerExperienceMonitoring({
        signal_type: signalType,
        signal_source: signalSource,
        message,
        language,
        environment,
        context: formatContextText(contextText),
      });

      setResult(response);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Échec de l’analyse customer experience.",
      );
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminShell
      activeHref="/admin/customer-experience-monitoring"
      title="Customer Experience Monitoring"
      subtitle="Analyze satisfaction signals across the coach, recommendations, levers, artifacts and user journey."
      adminEmail={admin?.email ?? null}
      adminRole={admin?.role ?? "admin"}
      adminOrganizationName={admin?.organization_name ?? null}
    >
      {adminLoading ? (
        <div className="card">Loading customer experience monitoring...</div>
      ) : (
        <div className="stack" style={{ gap: 18 }}>
          <div
            className="card stack"
            style={{
              gap: 16,
              border: "1px solid rgba(20,184,166,0.24)",
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
                right: -120,
                top: -140,
                width: 320,
                height: 320,
                borderRadius: 999,
                background: "rgba(20,184,166,0.22)",
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
                    Customer experience
                  </span>

                  <span
                    style={{
                      borderRadius: 999,
                      padding: "8px 12px",
                      background: "rgba(20,184,166,0.30)",
                      fontSize: 12,
                      fontWeight: 900,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Satisfaction monitoring
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
                  Detect and qualify experience degradation before it becomes churn.
                </div>

                <div
                  style={{
                    maxWidth: 980,
                    lineHeight: 1.7,
                    color: "rgba(255,255,255,0.74)",
                  }}
                >
                  Assess coach quality, recommendation relevance, lever clarity, artifact value,
                  trust signals and journey friction from manual tests, support cases or user
                  feedback.
                </div>
              </div>

              <div className="row" style={{ gap: 8, flexWrap: "wrap", position: "relative" }}>
                <Link className="button ghost" href="/admin">
                  Dashboard
                </Link>

                <Link className="button ghost" href="/admin/business-ops-monitoring">
                  Business ops
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
                <div className="section-title">Experience signal input</div>
                <div className="muted">
                  Select a signal type, source and environment, then describe the customer
                  experience issue to analyze.
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
                        setSignalType(
                          event.target.value as AdminCustomerExperienceSignalType,
                        )
                      }
                    >
                      {SIGNAL_TYPES.map((item) => (
                        <option key={item} value={item}>
                          {item}
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
                        setSignalSource(
                          event.target.value as AdminCustomerExperienceSignalSource,
                        )
                      }
                    >
                      {SIGNAL_SOURCES.map((item) => (
                        <option key={item} value={item}>
                          {item}
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
                        setEnvironment(
                          event.target.value as AdminCustomerExperienceEnvironment,
                        )
                      }
                    >
                      {ENVIRONMENTS.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="stack" style={{ gap: 6 }}>
                  <span className="muted">Customer experience signal</span>
                  <textarea
                    className="textarea"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    rows={9}
                    style={{
                      resize: "vertical",
                      lineHeight: 1.55,
                      minHeight: 210,
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
                    {loading ? "Analyzing..." : "Analyze signal"}
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
                <div className="section-title">Experience analysis result</div>
                <div className="muted">
                  Satisfaction status, severity, UX risk, causes, recommended actions and
                  escalation rationale.
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
                      border: result.issue_detected
                        ? "1px solid rgba(245,158,11,0.25)"
                        : "1px solid rgba(20,184,166,0.22)",
                      background: result.issue_detected
                        ? "rgba(245,158,11,0.07)"
                        : "rgba(20,184,166,0.07)",
                    }}
                  >
                    <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                      <span
                        className="badge"
                        style={statusBadgeStyle(result.satisfaction_status)}
                      >
                        Status: {result.satisfaction_status}
                      </span>

                      <span className="badge" style={severityBadgeStyle(result.severity)}>
                        Severity: {result.severity}
                      </span>

                      <span
                        className="badge"
                        style={riskBadgeStyle(result.user_experience_risk)}
                      >
                        UX risk: {result.user_experience_risk}
                      </span>

                      <span className="badge">
                        Area: {normalizeLabel(result.experience_area)}
                      </span>

                      <span
                        className="badge"
                        style={
                          result.escalate
                            ? {
                                color: "var(--danger)",
                                background: "rgba(220,38,38,0.08)",
                                borderColor: "rgba(220,38,38,0.22)",
                                fontWeight: 850,
                              }
                            : undefined
                        }
                      >
                        Escalate: {result.escalate ? "yes" : "no"}
                      </span>

                      <span className="badge">
                        Confidence: {Math.round((result.confidence || 0) * 100)}%
                      </span>
                    </div>

                    <div className="muted" style={{ lineHeight: 1.65 }}>
                      Summary
                    </div>

                    <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.65 }}>
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
                        Recommended actions
                      </div>

                      {result.recommended_actions.length === 0 ? (
                        <div className="muted">No action returned.</div>
                      ) : (
                        <div className="stack" style={{ gap: 8 }}>
                          {result.recommended_actions.map((item, index) => (
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

                    <div className="muted" style={{ whiteSpace: "pre-wrap", lineHeight: 1.65 }}>
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