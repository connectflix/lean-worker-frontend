"use client";

import { useState } from "react";
import { AdminGuard } from "@/components/admin-guard";
import { adminBusinessOpsMonitoring } from "@/lib/api";
import type {
  AdminBusinessEnvironment,
  AdminBusinessIssueSeverity,
  AdminBusinessIssueStatus,
  AdminBusinessIssueType,
  AdminBusinessOpsMonitoringResponse,
  AdminBusinessSignalSource,
  AdminBusinessSignalType,
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

function severityBadgeStyle(severity: AdminBusinessIssueSeverity) {
  switch (severity) {
    case "critical":
      return { borderColor: "rgba(198,40,40,0.25)", color: "var(--danger)" };
    case "high":
      return { borderColor: "rgba(183,121,31,0.25)", color: "var(--warning)" };
    case "medium":
      return { borderColor: "rgba(37,99,235,0.18)", color: "var(--primary)" };
    default:
      return {};
  }
}

function statusBadgeStyle(status: AdminBusinessIssueStatus) {
  if (status === "issue") {
    return { borderColor: "rgba(198,40,40,0.25)", color: "var(--danger)" };
  }
  if (status === "watch") {
    return { borderColor: "rgba(183,121,31,0.25)", color: "var(--warning)" };
  }
  return { borderColor: "rgba(21,128,61,0.20)", color: "var(--success)" };
}

export default function AdminBusinessOpsMonitoringPage() {
  return (
    <AdminGuard>
      <AdminBusinessOpsMonitoringContent />
    </AdminGuard>
  );
}

function AdminBusinessOpsMonitoringContent() {
  const [signalType, setSignalType] = useState<AdminBusinessSignalType>("unlock_signal");
  const [signalSource, setSignalSource] = useState<AdminBusinessSignalSource>("backend");
  const [message, setMessage] = useState(SAMPLE_SIGNALS[0].payload.message);
  const [language, setLanguage] = useState("fr");
  const [environment, setEnvironment] = useState<AdminBusinessEnvironment>("production");
  const [contextText, setContextText] = useState(
    JSON.stringify(SAMPLE_SIGNALS[0].payload.context, null, 2),
  );
  const [result, setResult] = useState<AdminBusinessOpsMonitoringResponse | null>(null);
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
    <main className="page">
      <div className="container stack">
        <div className="card stack">
          <div className="row space-between" style={{ alignItems: "flex-start" }}>
            <div>
              <h1 className="title">Admin Business Ops Monitoring</h1>
              <p className="subtitle">
                Analyse manuelle de signaux business et qualification d’anomalies produit.
              </p>
            </div>

            <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
              <button className="button ghost" onClick={() => (window.location.href = "/admin")}>
                Dashboard
              </button>
              <button className="button ghost" onClick={() => (window.location.href = "/admin/tech-ops-monitoring")}>
                Tech ops monitoring
              </button>
              <button className="button ghost" onClick={() => (window.location.href = "/admin/support-resolution")}>
                Support resolution
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
                    onChange={(e) => setSignalType(e.target.value as AdminBusinessSignalType)}
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
                    onChange={(e) => setSignalSource(e.target.value as AdminBusinessSignalSource)}
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
                    onChange={(e) => setEnvironment(e.target.value as AdminBusinessEnvironment)}
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
                <span className="muted">Message / signal business</span>
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
                <button className="button" type="button" onClick={handleAssess} disabled={loading || !message.trim()}>
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
                <div className="stack" style={{ gap: 12 }}>
                  <div>
                    <div className="muted">Summary</div>
                    <div className="card-soft" style={{ whiteSpace: "pre-wrap" }}>
                      {result.summary}
                    </div>
                  </div>

                  <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                    <span className="badge" style={statusBadgeStyle(result.status)}>
                      Status: {result.status}
                    </span>
                    <span className="badge" style={severityBadgeStyle(result.severity)}>
                      Severity: {result.severity}
                    </span>
                    <span className="badge">
                      Type: {result.issue_type}
                    </span>
                    <span className="badge">
                      Issue: {result.issue_detected ? "yes" : "no"}
                    </span>
                    <span className="badge">
                      Escalate: {result.escalate ? "yes" : "no"}
                    </span>
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
                    <div className="muted">Recommended checks</div>
                    {result.recommended_checks.length === 0 ? (
                      <div className="muted">Aucune vérification retournée.</div>
                    ) : (
                      <div className="stack">
                        {result.recommended_checks.map((item, index) => (
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