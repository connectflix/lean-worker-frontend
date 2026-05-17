"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminGuard } from "@/components/admin-guard";
import { AdminShell } from "@/components/admin-shell";
import { adminSupportResolution, getAdminMe } from "@/lib/api";
import type {
  AdminMe,
  AdminSupportResolutionResponse,
  AdminSupportTriageCategory,
  AdminSupportTriageOwner,
  AdminSupportTriageSeverity,
} from "@/lib/types";

const SAMPLE_CASES = [
  {
    label: "Paiement bloqué",
    payload: {
      message: "J’ai payé mais mon audiobook est toujours verrouillé.",
      language: "fr",
      triage_category: "payment_issue" as AdminSupportTriageCategory,
      triage_severity: "P2" as AdminSupportTriageSeverity,
      triage_owner: "business_ops" as AdminSupportTriageOwner,
      founder_escalation: false,
      source: "admin_manual_resolution_test",
    },
  },
  {
    label: "Connexion LinkedIn",
    payload: {
      message: "Je n’arrive plus à me connecter avec LinkedIn.",
      language: "fr",
      triage_category: "auth_login" as AdminSupportTriageCategory,
      triage_severity: "P2" as AdminSupportTriageSeverity,
      triage_owner: "tech_ops" as AdminSupportTriageOwner,
      founder_escalation: false,
      source: "admin_manual_resolution_test",
    },
  },
  {
    label: "Confidentialité",
    payload: {
      message:
        "Je pense qu’il y a un problème grave de confidentialité avec mes données personnelles et je veux porter plainte.",
      language: "fr",
      triage_category: "trust_safety" as AdminSupportTriageCategory,
      triage_severity: "P1" as AdminSupportTriageSeverity,
      triage_owner: "founder" as AdminSupportTriageOwner,
      founder_escalation: true,
      source: "admin_manual_resolution_test",
    },
  },
];

const TRIAGE_CATEGORIES: AdminSupportTriageCategory[] = [
  "auth_login",
  "payment_issue",
  "artifact_access_generation",
  "recommendation_quality",
  "onboarding_confusion",
  "technical_bug",
  "feature_request",
  "trust_safety",
  "other",
];

const TRIAGE_SEVERITIES: AdminSupportTriageSeverity[] = ["P1", "P2", "P3", "P4"];

const TRIAGE_OWNERS: AdminSupportTriageOwner[] = [
  "support_resolution",
  "tech_ops",
  "business_ops",
  "founder",
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

  if (normalized === "p1") {
    return {
      ...base,
      color: "var(--danger)",
      background: "rgba(220,38,38,0.08)",
      borderColor: "rgba(220,38,38,0.24)",
    };
  }

  if (normalized === "p2") {
    return {
      ...base,
      color: "var(--warning, #b45309)",
      background: "rgba(245,158,11,0.10)",
      borderColor: "rgba(245,158,11,0.25)",
    };
  }

  if (normalized === "p3") {
    return {
      ...base,
      color: "#1d4ed8",
      background: "rgba(37,99,235,0.08)",
      borderColor: "rgba(37,99,235,0.18)",
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

  if (normalized.includes("tech")) {
    return {
      color: "#1d4ed8",
      background: "rgba(37,99,235,0.08)",
      borderColor: "rgba(37,99,235,0.18)",
      fontWeight: 850,
    };
  }

  if (normalized.includes("business")) {
    return {
      color: "#7e22ce",
      background: "rgba(124,58,237,0.08)",
      borderColor: "rgba(124,58,237,0.20)",
      fontWeight: 850,
    };
  }

  if (normalized.includes("founder")) {
    return {
      color: "var(--danger)",
      background: "rgba(220,38,38,0.08)",
      borderColor: "rgba(220,38,38,0.22)",
      fontWeight: 850,
    };
  }

  return {
    color: "#0f766e",
    background: "rgba(20,184,166,0.10)",
    borderColor: "rgba(20,184,166,0.22)",
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

export default function AdminSupportResolutionPage() {
  return (
    <AdminGuard>
      <AdminSupportResolutionContent />
    </AdminGuard>
  );
}

function AdminSupportResolutionContent() {
  const [admin, setAdmin] = useState<AdminMe | null>(null);

  const [message, setMessage] = useState(SAMPLE_CASES[0].payload.message);
  const [language, setLanguage] = useState("fr");
  const [triageCategory, setTriageCategory] =
    useState<AdminSupportTriageCategory>("payment_issue");
  const [triageSeverity, setTriageSeverity] = useState<AdminSupportTriageSeverity>("P2");
  const [triageOwner, setTriageOwner] = useState<AdminSupportTriageOwner>("business_ops");
  const [founderEscalation, setFounderEscalation] = useState(false);
  const [source, setSource] = useState("admin_manual_resolution_test");
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState("");

  const [result, setResult] = useState<AdminSupportResolutionResponse | null>(null);
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

    setMessage(sample.payload.message);
    setLanguage(sample.payload.language);
    setTriageCategory(sample.payload.triage_category);
    setTriageSeverity(sample.payload.triage_severity);
    setTriageOwner(sample.payload.triage_owner);
    setFounderEscalation(sample.payload.founder_escalation);
    setSource(sample.payload.source ?? "admin_manual_resolution_test");
    setResult(null);
    setError(null);
  }

  async function handleResolve() {
    setLoading(true);
    setError(null);

    try {
      const response = await adminSupportResolution({
        message,
        language,
        triage_category: triageCategory,
        triage_severity: triageSeverity,
        triage_owner: triageOwner,
        founder_escalation: founderEscalation,
        source: source.trim() || null,
        user_email: userEmail.trim() || null,
        user_id: userId.trim() ? Number(userId.trim()) : null,
      });

      setResult(response);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Échec de la génération de résolution support.",
      );
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminShell
      activeHref="/admin/support-resolution"
      title="Support Resolution"
      subtitle="Generate user-ready replies, internal summaries and operational resolution checklists."
      adminEmail={admin?.email ?? null}
      adminRole={admin?.role ?? "admin"}
      adminOrganizationName={admin?.organization_name ?? null}
    >
      {adminLoading ? (
        <div className="card">Loading support resolution...</div>
      ) : (
        <div className="stack" style={{ gap: 18 }}>
          <div
            className="card stack"
            style={{
              gap: 16,
              border: "1px solid rgba(124,58,237,0.24)",
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
                background: "rgba(124,58,237,0.24)",
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
                      background: "rgba(124,58,237,0.34)",
                      fontSize: 12,
                      fontWeight: 900,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Resolution agent
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
                  Turn triaged support cases into clear resolution responses.
                </div>

                <div
                  style={{
                    maxWidth: 980,
                    lineHeight: 1.7,
                    color: "rgba(255,255,255,0.74)",
                  }}
                >
                  Generate a user-facing reply, an internal summary, a suggested next step,
                  a resolution checklist and escalation rationale based on the triage outcome.
                </div>
              </div>

              <div className="row" style={{ gap: 8, flexWrap: "wrap", position: "relative" }}>
                <Link className="button ghost" href="/admin">
                  Dashboard
                </Link>

                <Link className="button ghost" href="/admin/support-triage">
                  Support triage
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
                <div className="section-title">Resolution input</div>
                <div className="muted">
                  Start from a triaged support case, adjust category, severity and owner, then
                  generate the proposed resolution.
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
                      placeholder="admin_manual_resolution_test"
                    />
                  </label>
                </div>

                <div className="grid grid-3">
                  <label className="stack" style={{ gap: 6 }}>
                    <span className="muted">Triage category</span>
                    <select
                      className="select"
                      value={triageCategory}
                      onChange={(event) =>
                        setTriageCategory(event.target.value as AdminSupportTriageCategory)
                      }
                    >
                      {TRIAGE_CATEGORIES.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="stack" style={{ gap: 6 }}>
                    <span className="muted">Triage severity</span>
                    <select
                      className="select"
                      value={triageSeverity}
                      onChange={(event) =>
                        setTriageSeverity(event.target.value as AdminSupportTriageSeverity)
                      }
                    >
                      {TRIAGE_SEVERITIES.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="stack" style={{ gap: 6 }}>
                    <span className="muted">Triage owner</span>
                    <select
                      className="select"
                      value={triageOwner}
                      onChange={(event) =>
                        setTriageOwner(event.target.value as AdminSupportTriageOwner)
                      }
                    >
                      {TRIAGE_OWNERS.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label
                  className="card-soft row"
                  style={{
                    gap: 10,
                    alignItems: "center",
                    cursor: "pointer",
                    border: founderEscalation
                      ? "1px solid rgba(220,38,38,0.22)"
                      : "1px solid var(--border)",
                    background: founderEscalation
                      ? "rgba(220,38,38,0.06)"
                      : undefined,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={founderEscalation}
                    onChange={(event) => setFounderEscalation(event.target.checked)}
                  />

                  <span className="muted">Founder escalation</span>

                  {founderEscalation ? (
                    <span
                      className="badge"
                      style={{
                        marginLeft: "auto",
                        color: "var(--danger)",
                        background: "rgba(220,38,38,0.08)",
                        borderColor: "rgba(220,38,38,0.22)",
                      }}
                    >
                      escalated
                    </span>
                  ) : null}
                </label>

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
                    onClick={() => void handleResolve()}
                    disabled={loading || !message.trim()}
                  >
                    {loading ? "Generating..." : "Generate resolution"}
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
                <div className="section-title">Resolution result</div>
                <div className="muted">
                  User reply, internal summary, checklist, next step and escalation rationale.
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
                      border: result.escalate
                        ? "1px solid rgba(220,38,38,0.22)"
                        : "1px solid rgba(124,58,237,0.20)",
                      background: result.escalate
                        ? "rgba(220,38,38,0.06)"
                        : "rgba(124,58,237,0.06)",
                    }}
                  >
                    <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                      <span className="badge" style={severityBadgeStyle(triageSeverity)}>
                        Severity: {triageSeverity}
                      </span>

                      <span className="badge" style={ownerBadgeStyle(triageOwner)}>
                        Owner: {normalizeLabel(triageOwner)}
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
                      Suggested next step
                    </div>

                    <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.65 }}>
                      {result.suggested_next_step}
                    </div>
                  </div>

                  <div className="card-soft stack" style={{ gap: 8 }}>
                    <div className="section-title" style={{ fontSize: 15 }}>
                      User reply
                    </div>

                    <div className="muted" style={{ whiteSpace: "pre-wrap", lineHeight: 1.65 }}>
                      {result.user_reply}
                    </div>
                  </div>

                  <div className="card-soft stack" style={{ gap: 8 }}>
                    <div className="section-title" style={{ fontSize: 15 }}>
                      Internal summary
                    </div>

                    <div className="muted" style={{ whiteSpace: "pre-wrap", lineHeight: 1.65 }}>
                      {result.internal_summary}
                    </div>
                  </div>

                  <div className="grid grid-2">
                    <div className="card-soft stack" style={{ gap: 8 }}>
                      <div className="section-title" style={{ fontSize: 15 }}>
                        Resolution checks
                      </div>

                      {result.resolution_checks.length === 0 ? (
                        <div className="muted">No checklist returned.</div>
                      ) : (
                        <div className="stack" style={{ gap: 8 }}>
                          {result.resolution_checks.map((item, index) => (
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
                        Escalation reason
                      </div>

                      <div className="muted" style={{ whiteSpace: "pre-wrap", lineHeight: 1.65 }}>
                        {result.escalation_reason || "—"}
                      </div>
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