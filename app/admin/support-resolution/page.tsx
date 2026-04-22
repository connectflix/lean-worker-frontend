"use client";

import { useState } from "react";
import { AdminGuard } from "@/components/admin-guard";
import { adminSupportResolution } from "@/lib/api";
import type {
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
      message: "Je pense qu’il y a un problème grave de confidentialité avec mes données personnelles et je veux porter plainte.",
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

export default function AdminSupportResolutionPage() {
  return (
    <AdminGuard>
      <AdminSupportResolutionContent />
    </AdminGuard>
  );
}

function AdminSupportResolutionContent() {
  const [message, setMessage] = useState(SAMPLE_CASES[0].payload.message);
  const [language, setLanguage] = useState("fr");
  const [triageCategory, setTriageCategory] = useState<AdminSupportTriageCategory>("payment_issue");
  const [triageSeverity, setTriageSeverity] = useState<AdminSupportTriageSeverity>("P2");
  const [triageOwner, setTriageOwner] = useState<AdminSupportTriageOwner>("business_ops");
  const [founderEscalation, setFounderEscalation] = useState(false);
  const [source, setSource] = useState("admin_manual_resolution_test");
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [result, setResult] = useState<AdminSupportResolutionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        source: source || null,
        user_email: userEmail || null,
        user_id: userId ? Number(userId) : null,
      });

      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de la génération de résolution support.");
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
              <h1 className="title">Admin Support Resolution</h1>
              <p className="subtitle">
                Génération manuelle d’une réponse support et d’une checklist de résolution.
              </p>
            </div>

            <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
              <button className="button ghost" onClick={() => (window.location.href = "/admin")}>
                Dashboard
              </button>
              <button className="button ghost" onClick={() => (window.location.href = "/admin/support-triage")}>
                Support triage
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
                <span className="muted">Message support</span>
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
                  <span className="muted">Source</span>
                  <input
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    style={{
                      width: "100%",
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      background: "var(--card)",
                      color: "var(--text)",
                      padding: 12,
                    }}
                  />
                </label>
              </div>

              <div className="grid grid-3">
                <label className="stack" style={{ gap: 6 }}>
                  <span className="muted">Triage category</span>
                  <select
                    value={triageCategory}
                    onChange={(e) => setTriageCategory(e.target.value as AdminSupportTriageCategory)}
                    style={{
                      width: "100%",
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      background: "var(--card)",
                      color: "var(--text)",
                      padding: 12,
                    }}
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
                    value={triageSeverity}
                    onChange={(e) => setTriageSeverity(e.target.value as AdminSupportTriageSeverity)}
                    style={{
                      width: "100%",
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      background: "var(--card)",
                      color: "var(--text)",
                      padding: 12,
                    }}
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
                    value={triageOwner}
                    onChange={(e) => setTriageOwner(e.target.value as AdminSupportTriageOwner)}
                    style={{
                      width: "100%",
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      background: "var(--card)",
                      color: "var(--text)",
                      padding: 12,
                    }}
                  >
                    {TRIAGE_OWNERS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="row" style={{ gap: 10, alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={founderEscalation}
                  onChange={(e) => setFounderEscalation(e.target.checked)}
                />
                <span className="muted">Founder escalation</span>
              </label>

              <div className="grid grid-2">
                <label className="stack" style={{ gap: 6 }}>
                  <span className="muted">User email (optionnel)</span>
                  <input
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    style={{
                      width: "100%",
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      background: "var(--card)",
                      color: "var(--text)",
                      padding: 12,
                    }}
                  />
                </label>

                <label className="stack" style={{ gap: 6 }}>
                  <span className="muted">User ID (optionnel)</span>
                  <input
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    inputMode="numeric"
                    style={{
                      width: "100%",
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      background: "var(--card)",
                      color: "var(--text)",
                      padding: 12,
                    }}
                  />
                </label>
              </div>

              <div className="row" style={{ gap: 8 }}>
                <button className="button" type="button" onClick={handleResolve} disabled={loading || !message.trim()}>
                  {loading ? "Génération..." : "Générer la résolution"}
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
                    <div className="muted">User reply</div>
                    <div className="card-soft" style={{ whiteSpace: "pre-wrap" }}>
                      {result.user_reply}
                    </div>
                  </div>

                  <div>
                    <div className="muted">Internal summary</div>
                    <div className="card-soft" style={{ whiteSpace: "pre-wrap" }}>
                      {result.internal_summary}
                    </div>
                  </div>

                  <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                    <span className="badge">
                      Escalate: {result.escalate ? "yes" : "no"}
                    </span>
                    <span className="badge">
                      Confidence: {Math.round((result.confidence || 0) * 100)}%
                    </span>
                  </div>

                  <div>
                    <div className="muted">Suggested next step</div>
                    <div className="card-soft" style={{ whiteSpace: "pre-wrap" }}>
                      {result.suggested_next_step}
                    </div>
                  </div>

                  <div>
                    <div className="muted">Resolution checks</div>
                    {result.resolution_checks.length === 0 ? (
                      <div className="muted">Aucune checklist retournée.</div>
                    ) : (
                      <div className="stack">
                        {result.resolution_checks.map((item, index) => (
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