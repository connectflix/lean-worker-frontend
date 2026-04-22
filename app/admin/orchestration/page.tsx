"use client";

import { useState } from "react";
import { AdminGuard } from "@/components/admin-guard";
import { adminOrchestrationRun } from "@/lib/api";
import type {
  AdminOrchestrationOptions,
  AdminOrchestrationResponse,
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
      tech_ops_summary:
        "Erreurs intermittentes sur le callback LinkedIn en production.",
      business_ops_summary:
        "Chute récente du funnel preview → checkout.",
      customer_experience_summary:
        "Plusieurs utilisateurs semblent frustrés par des réponses du coach perçues comme insuffisamment pertinentes.",
      customer_experience_signal_type: "coach_signal",
      customer_experience_signal_source: "user_feedback",
      customer_experience_environment: "production",
      customer_experience_context: {
        issue: "coach_relevance",
      },
      founder_notes:
        "Je veux une vue de pilotage claire pour aujourd’hui.",
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

function prettyJson(value: unknown): string {
  return JSON.stringify(value ?? {}, null, 2);
}

function parseJsonObject(value: string): Record<string, unknown> {
  const trimmed = value.trim();
  if (!trimmed) return {};

  const parsed = JSON.parse(trimmed);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Le JSON doit être un objet.");
  }
  return parsed as Record<string, unknown>;
}

export default function AdminOrchestrationPage() {
  return (
    <AdminGuard>
      <AdminOrchestrationContent />
    </AdminGuard>
  );
}

function AdminOrchestrationContent() {
  const [scenario, setScenario] = useState<AdminOrchestrationScenario>("support_case_flow");
  const [language, setLanguage] = useState("fr");
  const [inputPayloadText, setInputPayloadText] = useState(
    prettyJson(SAMPLE_CASES[0].input_payload),
  );
  const [optionsText, setOptionsText] = useState(
    prettyJson(SAMPLE_CASES[0].options),
  );
  const [result, setResult] = useState<AdminOrchestrationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec du run d’orchestration.");
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
              <h1 className="title">Admin Orchestration</h1>
              <p className="subtitle">
                Exécution manuelle des scénarios multi-agents de bout en bout.
              </p>
            </div>

            <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
              <button className="button ghost" onClick={() => (window.location.href = "/admin")}>
                Dashboard
              </button>
              <button className="button ghost" onClick={() => (window.location.href = "/admin/chief-of-staff")}>
                Chief of Staff
              </button>
              <button className="button ghost" onClick={() => (window.location.href = "/admin/customer-experience-monitoring")}>
                Customer Experience
              </button>
              <button className="button ghost" onClick={() => (window.location.href = "/admin/daily-briefing")}>
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
              </label>

              <div className="grid grid-2">
                <label className="stack" style={{ gap: 6 }}>
                  <span className="muted">Scenario</span>
                  <select
                    value={scenario}
                    onChange={(e) => setScenario(e.target.value as AdminOrchestrationScenario)}
                    style={{
                      width: "100%",
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      background: "var(--card)",
                      color: "var(--text)",
                      padding: 12,
                    }}
                  >
                    {SCENARIOS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>

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
              </div>

              <label className="stack" style={{ gap: 6 }}>
                <span className="muted">Input payload JSON</span>
                <textarea
                  value={inputPayloadText}
                  onChange={(e) => setInputPayloadText(e.target.value)}
                  rows={16}
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

              <label className="stack" style={{ gap: 6 }}>
                <span className="muted">Options JSON</span>
                <textarea
                  value={optionsText}
                  onChange={(e) => setOptionsText(e.target.value)}
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
                <button className="button" type="button" onClick={handleRun} disabled={loading}>
                  {loading ? "Exécution..." : "Lancer l’orchestration"}
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
                <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                  <span className="badge">Scenario: {result.scenario}</span>
                  <span className="badge">Status: {result.status}</span>
                  <span className="badge">
                    Confidence: {Math.round((result.confidence || 0) * 100)}%
                  </span>
                </div>

                <div>
                  <div className="muted">Executed agents</div>
                  {result.executed_agents.length === 0 ? (
                    <div className="muted">Aucun agent exécuté.</div>
                  ) : (
                    <div className="stack">
                      {result.executed_agents.map((item, index) => (
                        <div key={`${item}-${index}`} style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                          {item}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <div className="muted">Escalations</div>
                  {result.escalations.length === 0 ? (
                    <div className="muted">Aucune escalade.</div>
                  ) : (
                    <div className="stack">
                      {result.escalations.map((item, index) => (
                        <div key={`${item}-${index}`} style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                          {item}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="stack">
                  <div className="section-title">Final output</div>
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
                    {JSON.stringify(result.final_output, null, 2)}
                  </pre>
                </div>

                <div className="stack">
                  <div className="section-title">Intermediate results</div>
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
                    {JSON.stringify(result.intermediate_results, null, 2)}
                  </pre>
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