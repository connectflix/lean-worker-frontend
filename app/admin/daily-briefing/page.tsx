"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminGuard } from "@/components/admin-guard";
import { AdminShell } from "@/components/admin-shell";
import { adminDailyBriefing, getAdminMe } from "@/lib/api";
import type {
  AdminDailyBriefingHealthStatus,
  AdminDailyBriefingResponse,
  AdminMe,
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
        "Reste prudent et ne surdramatise pas.",
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
  const base = {
    textTransform: "uppercase" as const,
    letterSpacing: "0.04em",
    fontWeight: 850,
  };

  switch (health) {
    case "critical":
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

function ResultList({
  title,
  emptyLabel,
  items,
}: {
  title: string;
  emptyLabel: string;
  items: string[];
}) {
  return (
    <div className="card-soft stack" style={{ gap: 8 }}>
      <div className="section-title" style={{ fontSize: 15 }}>
        {title}
      </div>

      {items.length === 0 ? (
        <div className="muted">{emptyLabel}</div>
      ) : (
        <div className="stack" style={{ gap: 8 }}>
          {items.map((item, index) => (
            <div
              key={`${title}-${item}-${index}`}
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
  );
}

export default function AdminDailyBriefingPage() {
  return (
    <AdminGuard>
      <AdminDailyBriefingContent />
    </AdminGuard>
  );
}

function AdminDailyBriefingContent() {
  const [admin, setAdmin] = useState<AdminMe | null>(null);

  const [language, setLanguage] = useState("fr");
  const [supportSummary, setSupportSummary] = useState(
    SAMPLE_CASES[0].payload.support_summary,
  );
  const [techOpsSummary, setTechOpsSummary] = useState(
    SAMPLE_CASES[0].payload.tech_ops_summary,
  );
  const [businessOpsSummary, setBusinessOpsSummary] = useState(
    SAMPLE_CASES[0].payload.business_ops_summary,
  );
  const [chiefOfStaffSummary, setChiefOfStaffSummary] = useState(
    SAMPLE_CASES[0].payload.chief_of_staff_summary,
  );
  const [founderNotes, setFounderNotes] = useState(
    SAMPLE_CASES[0].payload.founder_notes,
  );
  const [contextText, setContextText] = useState(
    JSON.stringify(SAMPLE_CASES[0].payload.context, null, 2),
  );

  const [result, setResult] = useState<AdminDailyBriefingResponse | null>(null);
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
      setError(
        err instanceof Error
          ? err.message
          : "Échec de la génération du daily briefing.",
      );
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminShell
      activeHref="/admin/daily-briefing"
      title="Daily Briefing"
      subtitle="Consolidated operational briefing across support, tech ops, business ops and Chief of Staff signals."
      adminEmail={admin?.email ?? null}
      adminRole={admin?.role ?? "admin"}
      adminOrganizationName={admin?.organization_name ?? null}
    >
      {adminLoading ? (
        <div className="card">Loading daily briefing workspace...</div>
      ) : (
        <div className="stack" style={{ gap: 18 }}>
          <div
            className="card stack"
            style={{
              gap: 16,
              border: "1px solid rgba(99,102,241,0.24)",
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
                background: "rgba(99,102,241,0.22)",
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
                    Daily operations
                  </span>

                  <span
                    style={{
                      borderRadius: 999,
                      padding: "8px 12px",
                      background: "rgba(99,102,241,0.32)",
                      fontSize: 12,
                      fontWeight: 900,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Founder-ready briefing
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
                  Turn scattered operational signals into a clear daily action view.
                </div>

                <div
                  style={{
                    maxWidth: 980,
                    lineHeight: 1.7,
                    color: "rgba(255,255,255,0.74)",
                  }}
                >
                  Consolidate support, technical, business and Chief of Staff signals into one
                  short, practical briefing: health status, priorities, owner actions and founder
                  focus.
                </div>
              </div>

              <div className="row" style={{ gap: 8, flexWrap: "wrap", position: "relative" }}>
                <Link className="button ghost" href="/admin">
                  Dashboard
                </Link>

                <Link className="button ghost" href="/admin/agent-reports">
                  Agent reports
                </Link>

                <Link className="button ghost" href="/admin/orchestration">
                  Orchestration
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
                <div className="section-title">Briefing input</div>
                <div className="muted">
                  Provide the operational summaries to consolidate into a daily executive view.
                </div>
              </div>

              <div className="stack" style={{ gap: 14 }}>
                <label className="stack" style={{ gap: 8 }}>
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

                <label className="stack" style={{ gap: 6 }}>
                  <span className="muted">Support summary</span>
                  <textarea
                    className="textarea"
                    value={supportSummary}
                    onChange={(event) => setSupportSummary(event.target.value)}
                    rows={5}
                    style={{ resize: "vertical", lineHeight: 1.55 }}
                  />
                </label>

                <label className="stack" style={{ gap: 6 }}>
                  <span className="muted">Tech ops summary</span>
                  <textarea
                    className="textarea"
                    value={techOpsSummary}
                    onChange={(event) => setTechOpsSummary(event.target.value)}
                    rows={5}
                    style={{ resize: "vertical", lineHeight: 1.55 }}
                  />
                </label>

                <label className="stack" style={{ gap: 6 }}>
                  <span className="muted">Business ops summary</span>
                  <textarea
                    className="textarea"
                    value={businessOpsSummary}
                    onChange={(event) => setBusinessOpsSummary(event.target.value)}
                    rows={5}
                    style={{ resize: "vertical", lineHeight: 1.55 }}
                  />
                </label>

                <label className="stack" style={{ gap: 6 }}>
                  <span className="muted">Chief of Staff summary</span>
                  <textarea
                    className="textarea"
                    value={chiefOfStaffSummary}
                    onChange={(event) => setChiefOfStaffSummary(event.target.value)}
                    rows={5}
                    style={{ resize: "vertical", lineHeight: 1.55 }}
                  />
                </label>

                <label className="stack" style={{ gap: 6 }}>
                  <span className="muted">Founder notes</span>
                  <textarea
                    className="textarea"
                    value={founderNotes}
                    onChange={(event) => setFounderNotes(event.target.value)}
                    rows={4}
                    style={{ resize: "vertical", lineHeight: 1.55 }}
                  />
                </label>

                <label className="stack" style={{ gap: 6 }}>
                  <span className="muted">Context JSON optional</span>
                  <textarea
                    className="textarea"
                    value={contextText}
                    onChange={(event) => setContextText(event.target.value)}
                    rows={6}
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
                    onClick={() => void handleGenerate()}
                    disabled={loading}
                  >
                    {loading ? "Generating..." : "Generate briefing"}
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
                <div className="section-title">Daily briefing result</div>
                <div className="muted">
                  Health status, daily overview, priority signals, owner actions and founder focus.
                </div>
              </div>

              {!result ? (
                <div className="card-soft muted">No briefing generated yet.</div>
              ) : (
                <div className="stack" style={{ gap: 16 }}>
                  <div
                    className="card-soft stack"
                    style={{
                      gap: 10,
                      border:
                        result.health_status === "critical"
                          ? "1px solid rgba(220,38,38,0.25)"
                          : result.health_status === "watch"
                            ? "1px solid rgba(245,158,11,0.25)"
                            : "1px solid rgba(21,128,61,0.22)",
                      background:
                        result.health_status === "critical"
                          ? "rgba(220,38,38,0.07)"
                          : result.health_status === "watch"
                            ? "rgba(245,158,11,0.07)"
                            : "rgba(21,128,61,0.07)",
                    }}
                  >
                    <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                      <span className="badge" style={healthBadgeStyle(result.health_status)}>
                        Health: {result.health_status}
                      </span>

                      <span className="badge">
                        Confidence: {Math.round((result.confidence || 0) * 100)}%
                      </span>
                    </div>

                    <div className="muted" style={{ lineHeight: 1.65 }}>
                      Daily overview
                    </div>

                    <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.65 }}>
                      {result.daily_overview}
                    </div>
                  </div>

                  <div className="grid grid-2">
                    <ResultList
                      title="New important signals"
                      emptyLabel="No new important signal returned."
                      items={result.new_important_signals}
                    />

                    <ResultList
                      title="Open operational points"
                      emptyLabel="No open operational point returned."
                      items={result.open_operational_points}
                    />

                    <ResultList
                      title="Things improving"
                      emptyLabel="No improvement returned."
                      items={result.things_improving}
                    />

                    <ResultList
                      title="Things worsening"
                      emptyLabel="No worsening signal returned."
                      items={result.things_worsening}
                    />

                    <ResultList
                      title="Today priorities"
                      emptyLabel="No priority returned."
                      items={result.today_priorities}
                    />

                    <ResultList
                      title="Owner action list"
                      emptyLabel="No owner action returned."
                      items={result.owner_action_list}
                    />
                  </div>

                  <div
                    className="card-soft stack"
                    style={{
                      gap: 8,
                      border: "1px solid rgba(99,102,241,0.22)",
                      background: "rgba(99,102,241,0.07)",
                    }}
                  >
                    <div className="section-title" style={{ fontSize: 15 }}>
                      Founder focus
                    </div>

                    <div className="muted" style={{ whiteSpace: "pre-wrap", lineHeight: 1.65 }}>
                      {result.founder_focus || "—"}
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