"use client";

import { useState } from "react";
import { AdminGuard } from "@/components/admin-guard";
import { adminChiefOfStaff } from "@/lib/api";
import type {
  AdminChiefOfStaffOverallHealth,
  AdminChiefOfStaffResponse,
} from "@/lib/types";

const SAMPLE_CASES = [
  {
    label: "Flux critiques sous tension",
    payload: {
      language: "fr",
      support_summary:
        "Hausse de tickets sur des paiements réussis sans déblocage effectif du contenu, avec frustration utilisateur croissante.",
      tech_ops_summary:
        "Erreurs intermittentes sur le callback LinkedIn et incidents ponctuels sur la génération d’artefacts en production.",
      business_ops_summary:
        "Chute récente du funnel preview → checkout et plusieurs cas de paiement sans unlock.",
      founder_notes:
        "Je veux savoir si cela nécessite une attention directe de ma part cette semaine.",
      context: {
        week: "current",
        priority_window: "7d",
      },
    },
  },
  {
    label: "Surveillance modérée",
    payload: {
      language: "fr",
      support_summary:
        "Quelques demandes de clarification onboarding, sans incident majeur.",
      tech_ops_summary:
        "Pas d’indisponibilité critique détectée, quelques erreurs isolées à surveiller.",
      business_ops_summary:
        "L’engagement sur recommandations semble légèrement en baisse mais reste ambigu.",
      founder_notes:
        "Donne-moi une lecture prudente sans dramatiser.",
      context: {
        week: "current",
      },
    },
  },
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

function healthBadgeStyle(health: AdminChiefOfStaffOverallHealth) {
  switch (health) {
    case "critical":
      return { borderColor: "rgba(198,40,40,0.25)", color: "var(--danger)" };
    case "watch":
      return { borderColor: "rgba(183,121,31,0.25)", color: "var(--warning)" };
    default:
      return { borderColor: "rgba(21,128,61,0.20)", color: "var(--success)" };
  }
}

export default function AdminChiefOfStaffPage() {
  return (
    <AdminGuard>
      <AdminChiefOfStaffContent />
    </AdminGuard>
  );
}

function AdminChiefOfStaffContent() {
  const [language, setLanguage] = useState("fr");
  const [supportSummary, setSupportSummary] = useState(SAMPLE_CASES[0].payload.support_summary);
  const [techOpsSummary, setTechOpsSummary] = useState(SAMPLE_CASES[0].payload.tech_ops_summary);
  const [businessOpsSummary, setBusinessOpsSummary] = useState(SAMPLE_CASES[0].payload.business_ops_summary);
  const [founderNotes, setFounderNotes] = useState(SAMPLE_CASES[0].payload.founder_notes);
  const [contextText, setContextText] = useState(
    JSON.stringify(SAMPLE_CASES[0].payload.context, null, 2),
  );
  const [result, setResult] = useState<AdminChiefOfStaffResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function applySample(index: number) {
    const sample = SAMPLE_CASES[index];
    if (!sample) return;

    setLanguage(sample.payload.language);
    setSupportSummary(sample.payload.support_summary);
    setTechOpsSummary(sample.payload.tech_ops_summary);
    setBusinessOpsSummary(sample.payload.business_ops_summary);
    setFounderNotes(sample.payload.founder_notes);
    setContextText(JSON.stringify(sample.payload.context ?? {}, null, 2));
    setResult(null);
    setError(null);
  }

  async function handleSynthesize() {
    setLoading(true);
    setError(null);

    try {
      const response = await adminChiefOfStaff({
        language,
        support_summary: supportSummary || null,
        tech_ops_summary: techOpsSummary || null,
        business_ops_summary: businessOpsSummary || null,
        founder_notes: founderNotes || null,
        context: formatContextText(contextText),
      });

      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de la synthèse Chief of Staff.");
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
              <h1 className="title">Admin Chief of Staff</h1>
              <p className="subtitle">
                Synthèse exécutive consolidée des signaux support, tech et business.
              </p>
            </div>

            <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
              <button className="button ghost" onClick={() => (window.location.href = "/admin")}>
                Dashboard
              </button>
              <button className="button ghost" onClick={() => (window.location.href = "/admin/tech-ops-monitoring")}>
                Tech ops
              </button>
              <button className="button ghost" onClick={() => (window.location.href = "/admin/business-ops-monitoring")}>
                Business ops
              </button>
              <button className="button ghost" onClick={() => (window.location.href = "/admin/support-resolution")}>
                Support
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
                <span className="muted">Support summary</span>
                <textarea
                  value={supportSummary}
                  onChange={(e) => setSupportSummary(e.target.value)}
                  rows={6}
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
                <span className="muted">Tech ops summary</span>
                <textarea
                  value={techOpsSummary}
                  onChange={(e) => setTechOpsSummary(e.target.value)}
                  rows={6}
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
                <span className="muted">Business ops summary</span>
                <textarea
                  value={businessOpsSummary}
                  onChange={(e) => setBusinessOpsSummary(e.target.value)}
                  rows={6}
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
                <span className="muted">Founder notes</span>
                <textarea
                  value={founderNotes}
                  onChange={(e) => setFounderNotes(e.target.value)}
                  rows={5}
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
                  rows={6}
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
                <button className="button" type="button" onClick={handleSynthesize} disabled={loading}>
                  {loading ? "Synthèse..." : "Générer la synthèse"}
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
                  <div className="muted">Executive summary</div>
                  <div className="card-soft" style={{ whiteSpace: "pre-wrap" }}>
                    {result.executive_summary}
                  </div>
                </div>

                <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                  <span className="badge" style={healthBadgeStyle(result.overall_health)}>
                    Health: {result.overall_health}
                  </span>
                  <span className="badge">
                    Founder attention: {result.founder_attention_required ? "yes" : "no"}
                  </span>
                  <span className="badge">
                    Confidence: {Math.round((result.confidence || 0) * 100)}%
                  </span>
                </div>

                <div>
                  <div className="muted">Top priorities</div>
                  {result.top_priorities.length === 0 ? (
                    <div className="muted">Aucune priorité retournée.</div>
                  ) : (
                    <div className="stack">
                      {result.top_priorities.map((item, index) => (
                        <div key={`${item}-${index}`} style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                          {item}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <div className="muted">Key risks</div>
                  {result.key_risks.length === 0 ? (
                    <div className="muted">Aucun risque retourné.</div>
                  ) : (
                    <div className="stack">
                      {result.key_risks.map((item, index) => (
                        <div key={`${item}-${index}`} style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                          {item}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <div className="muted">Recommended decisions</div>
                  {result.recommended_decisions.length === 0 ? (
                    <div className="muted">Aucune décision retournée.</div>
                  ) : (
                    <div className="stack">
                      {result.recommended_decisions.map((item, index) => (
                        <div key={`${item}-${index}`} style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                          {item}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <div className="muted">Recommended owner actions</div>
                  {result.recommended_owner_actions.length === 0 ? (
                    <div className="muted">Aucune action owner retournée.</div>
                  ) : (
                    <div className="stack">
                      {result.recommended_owner_actions.map((item, index) => (
                        <div key={`${item}-${index}`} style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                          {item}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <div className="muted">Founder attention reason</div>
                  <div className="card-soft" style={{ whiteSpace: "pre-wrap" }}>
                    {result.founder_attention_reason || "—"}
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