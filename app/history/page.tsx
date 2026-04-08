"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth-guard";
import { AppShell } from "@/components/app-shell";
import { SessionHistoryCard } from "@/components/session-history-card";
import {
  BadgePill,
  ClockIcon,
  SessionIcon,
  SparkIcon,
} from "@/components/ui-flat-icons";
import { getSessions } from "@/lib/api";
import { getUiCopy } from "@/lib/ui-copy";
import { useUiLanguage } from "@/lib/use-ui-language";
import type { SessionHistoryItem } from "@/lib/types";

export default function HistoryPage() {
  return (
    <AuthGuard>
      <HistoryContent />
    </AuthGuard>
  );
}

function HistoryContent() {
  const router = useRouter();
  const { uiLanguage, loadingLanguage } = useUiLanguage("en");
  const copy = getUiCopy(uiLanguage);

  const [items, setItems] = useState<SessionHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadHistory() {
    try {
      setError(null);
      setLoading(true);
      const data = await getSessions();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load session history.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadHistory();
  }, []);

  if (loadingLanguage) {
    return (
      <main className="page">
        <div className="page-wrap">
          <div className="card">{copy.common.loading}</div>
        </div>
      </main>
    );
  }

  return (
    <AppShell
      uiLanguage={uiLanguage}
      title={uiLanguage === "fr" ? "Historique" : "History"}
    >
      <div
        className="card stack"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(248,250,252,0.95))",
        }}
      >
        <div className="row" style={{ gap: 8, alignItems: "center" }}>
          <SessionIcon />
          <h1 className="title">
            {uiLanguage === "fr" ? "Historique des sessions" : "Session history"}
          </h1>
        </div>

        <p className="subtitle">
          {uiLanguage === "fr"
            ? "Retrouve tes conversations passées, leurs résumés et les signaux importants détectés au fil du temps."
            : "Review your past conversations, their summaries, and the most important signals detected over time."}
        </p>

        <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
          <BadgePill icon={<SparkIcon size={14} />}>
            {uiLanguage === "fr" ? "Mémoire continue" : "Continuous memory"}
          </BadgePill>
        </div>
      </div>

      {loading ? (
        <div className="card stack">
          <div className="section-title">
            {uiLanguage === "fr" ? "Chargement de l’historique" : "Loading history"}
          </div>
          <div className="muted">
            {uiLanguage === "fr"
              ? "Nous récupérons tes sessions précédentes."
              : "We are retrieving your previous sessions."}
          </div>
        </div>
      ) : error ? (
        <div className="card stack">
          <div className="section-title" style={{ color: "var(--danger)" }}>
            {uiLanguage === "fr" ? "Impossible de charger l’historique" : "Unable to load history"}
          </div>
          <div className="muted">{error}</div>
          <div className="row" style={{ flexWrap: "wrap" }}>
            <button className="button" onClick={() => void loadHistory()}>
              {uiLanguage === "fr" ? "Réessayer" : "Try again"}
            </button>
            <button className="button ghost" onClick={() => router.push("/dashboard")}>
              {uiLanguage === "fr" ? "Retour au tableau de bord" : "Back to dashboard"}
            </button>
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="card stack">
          <div className="section-title">
            {uiLanguage === "fr" ? "Aucune session passée pour le moment" : "No past sessions yet"}
          </div>

          <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
            <BadgePill icon={<ClockIcon size={14} />}>
              {uiLanguage === "fr" ? "Aucune session" : "No sessions yet"}
            </BadgePill>
          </div>

          <div className="muted">
            {uiLanguage === "fr"
              ? "Démarre une première session de coaching pour construire ton historique, tes résumés et tes recommandations."
              : "Start your first coaching session to build your history, summaries, and recommendations."}
          </div>

          <div className="row" style={{ flexWrap: "wrap" }}>
            <button className="button" onClick={() => router.push("/dashboard")}>
              {uiLanguage === "fr" ? "Démarrer une session" : "Start a session"}
            </button>
          </div>
        </div>
      ) : (
        <div className="stack" style={{ gap: 16 }}>
          {items.map((item) => (
            <SessionHistoryCard key={item.session_id} item={item} uiLanguage={uiLanguage} />
          ))}
        </div>
      )}
    </AppShell>
  );
}