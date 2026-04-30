"use client";

import { useState } from "react";
import { AdminGuard } from "@/components/admin-guard";
import { adminCustomerExperienceMonitoring } from "@/lib/api";
import type {
  AdminCustomerExperienceMonitoringResponse,
  AdminCustomerExperienceRisk,
  AdminCustomerExperienceSeverity,
  AdminCustomerExperienceSignalSource,
  AdminCustomerExperienceSignalType,
  AdminCustomerExperienceStatus,
  AdminCustomerExperienceEnvironment,
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
  switch (status) {
    case "degraded":
      return { borderColor: "rgba(198,40,40,0.25)", color: "var(--danger)" };
    case "watch":
      return { borderColor: "rgba(183,121,31,0.25)", color: "var(--warning)" };
    default:
      return { borderColor: "rgba(21,128,61,0.20)", color: "var(--success)" };
  }
}

function severityBadgeStyle(severity: AdminCustomerExperienceSeverity) {
  switch (severity) {
    case "high":
      return { borderColor: "rgba(198,40,40,0.25)", color: "var(--danger)" };
    case "medium":
      return { borderColor: "rgba(183,121,31,0.25)", color: "var(--warning)" };
    default:
      return {};
  }
}

function riskBadgeStyle(risk: AdminCustomerExperienceRisk) {
  switch (risk) {
    case "high":
      return { borderColor: "rgba(198,40,40,0.25)", color: "var(--danger)" };
    case "medium":
      return { borderColor: "rgba(183,121,31,0.25)", color: "var(--warning)" };
    default:
      return { borderColor: "rgba(21,128,61,0.20)", color: "var(--success)" };
  }
}

export default function AdminCustomerExperienceMonitoringPage() {
  return (
    <AdminGuard>
      <AdminCustomerExperienceMonitoringContent />
    </AdminGuard>
  );
}

function AdminCustomerExperienceMonitoringContent() {
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setError(err instanceof Error ? err.message : "Échec de l’analyse customer experience.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <div className="container stack">
        <div className="card stack">
          <div className="row space-between" style={{ alignItems: "flex-start" }}>
            <div>
              <h1 className="title">Admin Customer Experience Monitoring</h1>
              <p className="subtitle">
                Analyse manuelle des signaux de satisfaction client sur le coach, les
                recommandations, les leviers et le parcours.
              </p>
            </div>

            <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
              <button className="button ghost" onClick={() => (window.location.href = "/admin")}>
                Dashboard
              </button>
              <button
                className="button ghost"
                onClick={() => (window.location.href = "/admin/business-ops-monitoring")}
              >
                Business ops
              </button>
              <button
                className="button ghost"
                onClick={() => (window.location.href = "/admin/daily-briefing")}
              >
                Daily Briefing
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-2">
          <div className="card stack">
            <div className="section-title">Entrée</div>

            <div className="stack">
              <label className="stack" style={{ gap: 6 }}>
                <span className="muted">Exemples rapides</span>
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
                    value={signalType}
                    onChange={(e) =>
                      setSignalType(e.target.value as AdminCustomerExperienceSignalType)
                    }
                    style={{
                      width: "100%",
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      background: "var(--card)",
                      color: "var(--text)",
                      padding: 12,
                    }}
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
                    value={signalSource}
                    onChange={(e) =>
                      setSignalSource(e.target.value as AdminCustomerExperienceSignalSource)
                    }
                    style={{
                      width: "100%",
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      background: "var(--card)",
                      color: "var(--text)",
                      padding: 12,
                    }}
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
                  <span className="muted">Langue</span>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    style={{
                      width: "100%",
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      background: "var(--card)",
                      color: "var(--text)",
                      padding: 12,
                    }}
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                  </select>
                </label>

                <label className="stack" style={{ gap: 6 }}>
                  <span className="muted">Environment</span>
                  <select
                    value={environment}
                    onChange={(e) =>
                      setEnvironment(e.target.value as AdminCustomerExperienceEnvironment)
                    }
                    style={{
                      width: "100%",
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      background: "var(--card)",
                      color: "var(--text)",
                      padding: 12,
                    }}
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
                <span className="muted">Message / signal expérience client</span>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={8}
                  style={{
                    width: "100%",
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                    color: "var(--text)",
                    padding: 12,
                    resize: "vertical",
                  }}
                />
              </label>

              <label className="stack" style={{ gap: 6 }}>
                <span className="muted">Context JSON (optionnel)</span>
                <textarea
                  value={contextText}
                  onChange={(e) => setContextText(e.target.value)}
                  rows={8}
                  style={{
                    width: "100%",
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                    color: "var(--text)",
                    padding: 12,
                    resize: "vertical",
                    fontFamily: "monospace",
                  }}
                />
              </label>

              <div className="row" style={{ gap: 8 }}>
                <button
                  className="button"
                  type="button"
                  onClick={handleAssess}
                  disabled={loading || !message.trim()}
                >
                  {loading ? "Analyse..." : "Analyser le signal"}
                </button>
              </div>

              {error ? (
                <div className="card" style={{ color: "var(--danger)" }}>
                  {error}
                </div>
              ) : null}
            </div>
          </div>

          <div className="card stack">
            <div className="section-title">Résultat</div>

            {!result ? (
              <div className="muted">Aucun résultat pour le moment.</div>
            ) : (
              <div className="stack">
                <div>
                  <div className="muted">Summary</div>
                  <div className="card-soft" style={{ whiteSpace: "pre-wrap" }}>
                    {result.summary}
                  </div>
                </div>

                <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                  <span className="badge" style={statusBadgeStyle(result.satisfaction_status)}>
                    Status: {result.satisfaction_status}
                  </span>
                  <span className="badge" style={severityBadgeStyle(result.severity)}>
                    Severity: {result.severity}
                  </span>
                  <span className="badge" style={riskBadgeStyle(result.user_experience_risk)}>
                    UX risk: {result.user_experience_risk}
                  </span>
                  <span className="badge">Area: {result.experience_area}</span>
                  <span className="badge">Issue: {result.issue_detected ? "yes" : "no"}</span>
                  <span className="badge">Escalate: {result.escalate ? "yes" : "no"}</span>
                  <span className="badge">
                    Confidence: {Math.round((result.confidence || 0) * 100)}%
                  </span>
                </div>

                <div>
                  <div className="muted">Likely causes</div>
                  {result.likely_causes.length === 0 ? (
                    <div className="muted">Aucune cause probable retournée.</div>
                  ) : (
                    <div className="stack">
                      {result.likely_causes.map((item, index) => (
                        <div
                          key={`${item}-${index}`}
                          style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <div className="muted">Recommended actions</div>
                  {result.recommended_actions.length === 0 ? (
                    <div className="muted">Aucune action retournée.</div>
                  ) : (
                    <div className="stack">
                      {result.recommended_actions.map((item, index) => (
                        <div
                          key={`${item}-${index}`}
                          style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <div className="muted">Escalation reason</div>
                  <div className="card-soft" style={{ whiteSpace: "pre-wrap" }}>
                    {result.escalation_reason || "—"}
                  </div>
                </div>

                <div className="stack">
                  <div className="section-title">Raw JSON</div>
                  <pre
                    style={{
                      margin: 0,
                      padding: 12,
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      overflowX: "auto",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}