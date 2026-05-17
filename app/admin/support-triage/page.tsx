"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminGuard } from "@/components/admin-guard";
import { AdminShell } from "@/components/admin-shell";
import { adminSupportTriage, getAdminMe } from "@/lib/api";
import type { AdminMe, AdminSupportTriageResponse } from "@/lib/types";

const SAMPLE_MESSAGES = [
  {
    label: "Paid artifact locked",
    message: "J’ai payé mais mon audiobook est toujours verrouillé.",
  },
  {
    label: "LinkedIn login",
    message: "Je n’arrive plus à me connecter avec LinkedIn.",
  },
  {
    label: "Onboarding confusion",
    message: "Je ne comprends pas quoi faire après mon inscription.",
  },
  {
    label: "Bad recommendations",
    message: "Les recommandations que j’ai reçues ne correspondent pas à ma situation.",
  },
  {
    label: "Button blocked",
    message: "Quand je clique sur continuer, rien ne se passe.",
  },
  {
    label: "Privacy concern",
    message:
      "Je pense qu’il y a un problème grave de confidentialité avec mes données personnelles.",
  },
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

function severityBadgeStyle(severity?: string | null) {
  const normalized = (severity || "").toLowerCase();

  const base = {
    textTransform: "uppercase" as const,
    letterSpacing: "0.04em",
    fontWeight: 850,
  };

  if (normalized === "critical" || normalized === "high") {
    return {
      ...base,
      color: "var(--danger)",
      background: "rgba(220,38,38,0.08)",
      borderColor: "rgba(220,38,38,0.24)",
    };
  }

  if (normalized === "medium" || normalized === "watch") {
    return {
      ...base,
      color: "var(--warning, #b45309)",
      background: "rgba(245,158,11,0.10)",
      borderColor: "rgba(245,158,11,0.25)",
    };
  }

  return {
    ...base,
    color: "var(--success)",
    background: "rgba(21,128,61,0.08)",
    borderColor: "rgba(21,128,61,0.20)",
  };
}

function ownerBadgeStyle(owner?: string | null) {
  const normalized = (owner || "").toLowerCase();

  if (normalized.includes("tech") || normalized.includes("engineering")) {
    return {
      color: "#1d4ed8",
      background: "rgba(37,99,235,0.08)",
      borderColor: "rgba(37,99,235,0.18)",
      fontWeight: 850,
    };
  }

  if (normalized.includes("founder") || normalized.includes("admin")) {
    return {
      color: "var(--danger)",
      background: "rgba(220,38,38,0.08)",
      borderColor: "rgba(220,38,38,0.22)",
      fontWeight: 850,
    };
  }

  if (normalized.includes("support")) {
    return {
      color: "#0f766e",
      background: "rgba(20,184,166,0.10)",
      borderColor: "rgba(20,184,166,0.22)",
      fontWeight: 850,
    };
  }

  return {
    fontWeight: 850,
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

export default function AdminSupportTriagePage() {
  return (
    <AdminGuard>
      <AdminSupportTriageContent />
    </AdminGuard>
  );
}

function AdminSupportTriageContent() {
  const [admin, setAdmin] = useState<AdminMe | null>(null);

  const [message, setMessage] = useState(SAMPLE_MESSAGES[0].message);
  const [language, setLanguage] = useState("fr");
  const [source, setSource] = useState("admin_manual_test");
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState("");

  const [result, setResult] = useState<AdminSupportTriageResponse | null>(null);
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

  function applySample(sampleMessage: string) {
    setMessage(sampleMessage);
    setResult(null);
    setError(null);
  }

  async function handleAnalyze() {
    setLoading(true);
    setError(null);

    try {
      const response = await adminSupportTriage({
        message,
        language,
        source: source.trim() || null,
        user_email: userEmail.trim() || null,
        user_id: userId.trim() ? Number(userId.trim()) : null,
      });

      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec du triage support.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminShell
      activeHref="/admin/support-triage"
      title="Support Triage"
      subtitle="Manual support message triage, severity qualification and ownership routing."
      adminEmail={admin?.email ?? null}
      adminRole={admin?.role ?? "admin"}
      adminOrganizationName={admin?.organization_name ?? null}
    >
      {adminLoading ? (
        <div className="card">Loading support triage...</div>
      ) : (
        <div className="stack" style={{ gap: 18 }}>
          <div
            className="card stack"
            style={{
              gap: 16,
              border: "1px solid rgba(20,184,166,0.22)",
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
                    Support operations
                  </span>

                  <span
                    style={{
                      borderRadius: 999,
                      padding: "8px 12px",
                      background: "rgba(20,184,166,0.28)",
                      fontSize: 12,
                      fontWeight: 900,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Triage agent
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
                  Classify support messages and route them to the right owner.
                </div>

                <div
                  style={{
                    maxWidth: 980,
                    lineHeight: 1.7,
                    color: "rgba(255,255,255,0.74)",
                  }}
                >
                  Use this workspace to qualify user support messages, detect severity, identify
                  likely causes, recommend next actions, and flag cases that require founder or
                  critical escalation.
                </div>
              </div>

              <div className="row" style={{ gap: 8, flexWrap: "wrap", position: "relative" }}>
                <Link className="button ghost" href="/admin">
                  Dashboard
                </Link>

                <Link className="button ghost" href="/admin/support-resolution">
                  Support resolution
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
                <div className="section-title">Support message input</div>
                <div className="muted">
                  Select a sample or paste a real user message, then launch the support triage
                  analysis.
                </div>
              </div>

              <div className="stack" style={{ gap: 14 }}>
                <label className="stack" style={{ gap: 8 }}>
                  <span className="muted">Quick samples</span>

                  <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                    {SAMPLE_MESSAGES.map((sample) => (
                      <button
                        key={sample.label}
                        className="button ghost"
                        type="button"
                        onClick={() => applySample(sample.message)}
                      >
                        {sample.label}
                      </button>
                    ))}
                  </div>
                </label>

                <label className="stack" style={{ gap: 6 }}>
                  <span className="muted">Support message</span>
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
                    <span className="muted">Source</span>
                    <input
                      className="input"
                      value={source}
                      onChange={(event) => setSource(event.target.value)}
                      placeholder="admin_manual_test"
                    />
                  </label>
                </div>

                <div className="grid grid-2">
                  <label className="stack" style={{ gap: 6 }}>
                    <span className="muted">User email optional</span>
                    <input
                      className="input"
                      value={userEmail}
                      onChange={(event) => setUserEmail(event.target.value)}
                      placeholder="user@example.com"
                    />
                  </label>

                  <label className="stack" style={{ gap: 6 }}>
                    <span className="muted">User ID optional</span>
                    <input
                      className="input"
                      value={userId}
                      onChange={(event) => setUserId(event.target.value)}
                      inputMode="numeric"
                      placeholder="123"
                    />
                  </label>
                </div>

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
                    onClick={() => void handleAnalyze()}
                    disabled={loading || !message.trim()}
                  >
                    {loading ? "Analysing..." : "Analyse message"}
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
                <div className="section-title">Triage result</div>
                <div className="muted">
                  Category, severity, recommended owner, likely causes and recommended actions.
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
                      border: result.founder_escalation
                        ? "1px solid rgba(220,38,38,0.22)"
                        : "1px solid rgba(20,184,166,0.22)",
                      background: result.founder_escalation
                        ? "rgba(220,38,38,0.06)"
                        : "rgba(20,184,166,0.07)",
                    }}
                  >
                    <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                      <span className="badge">Category: {normalizeLabel(result.category)}</span>

                      <span className="badge" style={severityBadgeStyle(result.severity)}>
                        Severity: {normalizeLabel(result.severity)}
                      </span>

                      <span className="badge" style={ownerBadgeStyle(result.recommended_owner)}>
                        Owner: {normalizeLabel(result.recommended_owner)}
                      </span>

                      <span className="badge">
                        Confidence: {Math.round((result.confidence || 0) * 100)}%
                      </span>

                      <span
                        className="badge"
                        style={
                          result.founder_escalation
                            ? {
                                color: "var(--danger)",
                                background: "rgba(220,38,38,0.08)",
                                borderColor: "rgba(220,38,38,0.22)",
                                fontWeight: 850,
                              }
                            : undefined
                        }
                      >
                        Founder escalation: {result.founder_escalation ? "yes" : "no"}
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
                        Recommended actions
                      </div>

                      {result.recommended_actions.length === 0 ? (
                        <div className="muted">No recommended action returned.</div>
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