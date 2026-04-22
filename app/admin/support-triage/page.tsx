"use client";

import { useState } from "react";
import { AdminGuard } from "@/components/admin-guard";
import { adminSupportTriage } from "@/lib/api";
import type { AdminSupportTriageResponse } from "@/lib/types";

const SAMPLE_MESSAGES = [
  "J’ai payé mais mon audiobook est toujours verrouillé.",
  "Je n’arrive plus à me connecter avec LinkedIn.",
  "Je ne comprends pas quoi faire après mon inscription.",
  "Les recommandations que j’ai reçues ne correspondent pas à ma situation.",
  "Quand je clique sur continuer, rien ne se passe.",
  "Je pense qu’il y a un problème grave de confidentialité avec mes données personnelles.",
];

export default function AdminSupportTriagePage() {
  return (
    <AdminGuard>
      <AdminSupportTriageContent />
    </AdminGuard>
  );
}

function AdminSupportTriageContent() {
  const [message, setMessage] = useState(SAMPLE_MESSAGES[0]);
  const [language, setLanguage] = useState("fr");
  const [source, setSource] = useState("admin_manual_test");
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [result, setResult] = useState<AdminSupportTriageResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze() {
    setLoading(true);
    setError(null);

    try {
      const response = await adminSupportTriage({
        message,
        language,
        source: source || null,
        user_email: userEmail || null,
        user_id: userId ? Number(userId) : null,
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
    <main className="page">
      <div className="container stack">
        <div className="card stack">
          <div className="row space-between" style={{ alignItems: "flex-start" }}>
            <div>
              <h1 className="title">Admin Support Triage</h1>
              <p className="subtitle">
                Test manuel du Support Triage Agent sur des messages support.
              </p>
            </div>

            <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
              <button className="button ghost" onClick={() => (window.location.href = "/admin")}>
                Dashboard
              </button>
              <button className="button ghost" onClick={() => (window.location.href = "/admin/intelligence")}>
                Intelligence
              </button>
              <button className="button ghost" onClick={() => (window.location.href = "/admin/coverage")}>
                Coverage
              </button>
              <button className="button ghost" onClick={() => (window.location.href = "/admin/quality")}>
                Quality
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
                  {SAMPLE_MESSAGES.map((sample) => (
                    <button
                      key={sample}
                      className="button ghost"
                      type="button"
                      onClick={() => setMessage(sample)}
                    >
                      Utiliser cet exemple
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
                <button className="button" type="button" onClick={handleAnalyze} disabled={loading || !message.trim()}>
                  {loading ? "Analyse..." : "Analyser"}
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
                <div className="stack" style={{ gap: 10 }}>
                  <div>
                    <div className="muted">Summary</div>
                    <strong>{result.summary}</strong>
                  </div>

                  <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                    <span className="badge">Category: {result.category}</span>
                    <span className="badge">Severity: {result.severity}</span>
                    <span className="badge">Owner: {result.recommended_owner}</span>
                    <span className="badge">
                      Confidence: {Math.round((result.confidence || 0) * 100)}%
                    </span>
                    <span className="badge">
                      Founder escalation: {result.founder_escalation ? "yes" : "no"}
                    </span>
                  </div>
                </div>

                <div className="stack">
                  <div className="section-title">Likely causes</div>
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

                <div className="stack">
                  <div className="section-title">Recommended actions</div>
                  {result.recommended_actions.length === 0 ? (
                    <div className="muted">Aucune action recommandée retournée.</div>
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