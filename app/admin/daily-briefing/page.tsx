"use client";

import { useState } from "react";
import { AdminGuard } from "@/components/admin-guard";
import { adminDailyBriefing } from "@/lib/api";
import type {
  AdminDailyBriefingHealthStatus,
  AdminDailyBriefingResponse,
} from "@/lib/types";

const SAMPLE_CASES = [
  {
    label: "Journée sous vigilance",
    payload: {
      language: "fr",
      support_summary:
        "Hausse de tickets sur des paiements réussis sans déblocage effectif du contenu, avec frustration utilisateur croissante.",
      tech_ops_summary:
        "Erreurs intermittentes sur le callback LinkedIn et incidents ponctuels sur la génération d’artefacts en production.",
      business_ops_summary:
        "Chute récente du funnel preview → checkout et plusieurs cas de paiement sans unlock.",
      chief_of_staff_summary:
        "Le produit reste exploitable mais plusieurs flux critiques demandent une coordination rapprochée aujourd’hui.",
      founder_notes:
        "Je veux une vue courte et très actionnable pour aujourd’hui.",
      context: {
        day: "today",
        review_window: "24h",
      },
    },
  },
  {
    label: "Journée modérée",
    payload: {
      language: "fr",
      support_summary:
        "Quelques demandes de clarification onboarding, sans incident majeur.",
      tech_ops_summary:
        "Pas d’indisponibilité critique détectée, quelques erreurs isolées à surveiller.",
      business_ops_summary:
        "L’engagement sur recommandations semble légèrement en baisse mais reste ambigu.",
      chief_of_staff_summary:
        "La situation reste globalement maîtrisée avec quelques points de watch.",
      founder_notes:
        "Reste prudent et ne surdramatis e pas.",
      context: {
        day: "today",
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

function healthBadgeStyle(health: AdminDailyBriefingHealthStatus) {
  switch (health) {
    case "critical":
      return { borderColor: "rgba(198,40,40,0.25)", color: "var(--danger)" };
    case "watch":
      return { borderColor: "rgba(183,121,31,0.25)", color: "var(--warning)" };
    default:
      return { borderColor: "rgba(21,128,61,0.20)", color: "var(--success)" };
  }
}

export default function AdminDailyBriefingPage() {
  return (
    <AdminGuard>
      <AdminDailyBriefingContent />
    </AdminGuard>
  );
}

function AdminDailyBriefingContent() {
  const [language, setLanguage] = useState("fr");
  const [supportSummary, setSupportSummary] = useState(SAMPLE_CASES[0].payload.support_summary);
  const [techOpsSummary, setTechOpsSummary] = useState(SAMPLE_CASES[0].payload.tech_ops_summary);
  const [businessOpsSummary, setBusinessOpsSummary] = useState(SAMPLE_CASES[0].payload.business_ops_summary);
  const [chiefOfStaffSummary, setChiefOfStaffSummary] = useState(SAMPLE_CASES[0].payload.chief_of_staff_summary);
  const [founderNotes, setFounderNotes] = useState(SAMPLE_CASES[0].payload.founder_notes);
  const [contextText, setContextText] = useState(
    JSON.stringify(SAMPLE_CASES[0].payload.context, null, 2),
  );
  const [result, setResult] = useState<AdminDailyBriefingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function applySample(index: number) {
    const sample = SAMPLE_CASES[index];
    if (!sample) return;

    setLanguage(sample.payload.language);
    setSupportSummary(sample.payload.support_summary);
    setTechOpsSummary(sample.payload.tech_ops_summary);
    setBusinessOpsSummary(sample.payload.business_ops_summary);
    setChiefOfStaffSummary(sample.payload.chief_of_staff_summary);
    setFounderNotes(sample.payload.founder_notes);
    setContextText(JSON.stringify(sample.payload.context ?? {}, null, 2));
    setResult(null);
    setError(null);
  }

  async function handleGenerate() {
    setLoading(true);
    setError(null);

    try {
      const response = await adminDailyBriefing({
        language,
        support_summary: supportSummary || null,
        tech_ops_summary: techOpsSummary || null,
        business_ops_summary: businessOpsSummary || null,
        chief_of_staff_summary: chiefOfStaffSummary || null,
        founder_notes: founderNotes || null,
        context: formatContextText(contextText),
      });

      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de la génération du daily briefing.");
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
              <h1 className="title">Admin Daily Briefing</h1>
              <p className="subtitle">
                Briefing opérationnel quotidien consolidé à partir des signaux support, tech, business et Chief of Staff.
              </p>
            </div>

            <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
              <button className="button ghost" onClick={() => (window.location.href = "/admin")}>
                Dashboard
              </button>
              <button className="button ghost" onClick={() => (window.location.href = "/admin/chief-of-staff")}>
                Chief of Staff
              </button>
              <button className="button ghost" onClick={() => (window.location.href = "/admin/tech-ops-monitoring")}>
                Tech ops
              </button>
              <button className="button ghost" onClick={() => (window.location.href = "/admin/business-ops-monitoring")}>
                Business ops
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
                <span className="muted">Tech ops summary</span>
                <textarea
                  value={techOpsSummary}
                  onChange={(e) => setTechOpsSummary(e.target.value)}
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
                <span className="muted">Business ops summary</span>
                <textarea
                  value={businessOpsSummary}
                  onChange={(e) => setBusinessOpsSummary(e.target.value)}
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
                <span className="muted">Chief of Staff summary</span>
                <textarea
                  value={chiefOfStaffSummary}
                  onChange={(e) => setChiefOfStaffSummary(e.target.value)}
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
                <span className="muted">Founder notes</span>
                <textarea
                  value={founderNotes}
                  onChange={(e) => setFounderNotes(e.target.value)}
                  rows={4}
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
                  rows={5}
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
                <button className="button" type="button" onClick={handleGenerate} disabled={loading}>
                  {loading ? "Génération..." : "Générer le briefing"}
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
                  <div className="muted">Daily overview</div>
                  <div className="card-soft" style={{ whiteSpace: "pre-wrap" }}>
                    {result.daily_overview}
                  </div>
                </div>

                <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                  <span className="badge" style={healthBadgeStyle(result.health_status)}>
                    Health: {result.health_status}
                  </span>
                  <span className="badge">
                    Confidence: {Math.round((result.confidence || 0) * 100)}%
                  </span>
                </div>

                <div>
                  <div className="muted">New important signals</div>
                  {result.new_important_signals.length === 0 ? (
                    <div className="muted">Aucun signal nouveau retourné.</div>
                  ) : (
                    <div className="stack">
                      {result.new_important_signals.map((item, index) => (
                        <div key={`${item}-${index}`} style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                          {item}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <div className="muted">Open operational points</div>
                  {result.open_operational_points.length === 0 ? (
                    <div className="muted">Aucun point ouvert retourné.</div>
                  ) : (
                    <div className="stack">
                      {result.open_operational_points.map((item, index) => (
                        <div key={`${item}-${index}`} style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                          {item}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <div className="muted">Things improving</div>
                  {result.things_improving.length === 0 ? (
                    <div className="muted">Aucune amélioration retournée.</div>
                  ) : (
                    <div className="stack">
                      {result.things_improving.map((item, index) => (
                        <div key={`${item}-${index}`} style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                          {item}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <div className="muted">Things worsening</div>
                  {result.things_worsening.length === 0 ? (
                    <div className="muted">Aucune dégradation retournée.</div>
                  ) : (
                    <div className="stack">
                      {result.things_worsening.map((item, index) => (
                        <div key={`${item}-${index}`} style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                          {item}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <div className="muted">Today priorities</div>
                  {result.today_priorities.length === 0 ? (
                    <div className="muted">Aucune priorité retournée.</div>
                  ) : (
                    <div className="stack">
                      {result.today_priorities.map((item, index) => (
                        <div key={`${item}-${index}`} style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                          {item}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <div className="muted">Owner action list</div>
                  {result.owner_action_list.length === 0 ? (
                    <div className="muted">Aucune action owner retournée.</div>
                  ) : (
                    <div className="stack">
                      {result.owner_action_list.map((item, index) => (
                        <div key={`${item}-${index}`} style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                          {item}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <div className="muted">Founder focus</div>
                  <div className="card-soft" style={{ whiteSpace: "pre-wrap" }}>
                    {result.founder_focus || "—"}
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