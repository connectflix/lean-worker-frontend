"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth-guard";
import { AppShell } from "@/components/app-shell";
import { SessionHistoryCard } from "@/components/session-history-card";
import {
  BadgePill,
  BrainIcon,
  ClockIcon,
  SessionIcon,
  SparkIcon,
} from "@/components/ui-flat-icons";
import { getSessions } from "@/lib/api";
import { getUiCopy } from "@/lib/ui-copy";
import { useUiLanguage } from "@/lib/use-ui-language";
import type { SessionHistoryItem } from "@/lib/types";

function CoachSectionCard({
  children,
  warm = false,
}: {
  children: React.ReactNode;
  warm?: boolean;
}) {
  return (
    <div
      className="card stack"
      style={{
        gap: 16,
        borderRadius: 28,
        border: "1px solid rgba(43,33,24,0.08)",
        background: warm
          ? "linear-gradient(135deg, rgba(255,241,220,0.92), rgba(255,255,255,0.90))"
          : "rgba(255,255,255,0.78)",
        boxShadow: "0 18px 48px rgba(43,33,24,0.06)",
      }}
    >
      {children}
    </div>
  );
}

function HistoryMetricCard({
  label,
  value,
  helper,
  icon,
  tone = "warm",
}: {
  label: string;
  value: string | number;
  helper?: string;
  icon: React.ReactNode;
  tone?: "warm" | "calm" | "neutral";
}) {
  const toneStyle =
    tone === "calm"
      ? {
          background: "rgba(88,180,174,0.11)",
          border: "1px solid rgba(88,180,174,0.18)",
          color: "var(--coach-calm)",
        }
      : tone === "neutral"
        ? {
            background: "rgba(43,33,24,0.05)",
            border: "1px solid rgba(43,33,24,0.08)",
            color: "var(--coach-muted)",
          }
        : {
            background: "rgba(255,122,89,0.12)",
            border: "1px solid rgba(255,122,89,0.20)",
            color: "var(--coach-accent)",
          };

  return (
    <div
      className="card-soft stack"
      style={{
        gap: 10,
        background: "rgba(255,255,255,0.68)",
        border: "1px solid rgba(43,33,24,0.08)",
        borderRadius: 24,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.72)",
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 14,
          display: "grid",
          placeItems: "center",
          ...toneStyle,
        }}
      >
        {icon}
      </div>

      <div className="stack" style={{ gap: 4 }}>
        <div
          className="muted"
          style={{
            color: "var(--coach-muted)",
            fontSize: 13,
          }}
        >
          {label}
        </div>

        <div
          style={{
            fontSize: 30,
            lineHeight: 1,
            fontWeight: 900,
            letterSpacing: "-0.055em",
            color: "var(--coach-ink)",
          }}
        >
          {value}
        </div>

        {helper ? (
          <div
            className="muted"
            style={{
              color: "var(--coach-muted)",
              fontSize: 13,
              lineHeight: 1.45,
            }}
          >
            {helper}
          </div>
        ) : null}
      </div>
    </div>
  );
}

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

  const completedSessions = items.filter((item) => item.ended_at).length;
  const sessionsWithSummary = items.filter((item) => item.summary).length;
  const latestSession = items[0] ?? null;

  if (loadingLanguage) {
    return (
      <main
        className="page"
        style={{
          minHeight: "100vh",
          background: "var(--coach-bg)",
          padding: 24,
        }}
      >
        <div className="page-wrap">
          <CoachSectionCard>
            <div className="section-title">{copy.common.loading}</div>
          </CoachSectionCard>
        </div>
      </main>
    );
  }

  return (
    <AppShell
      uiLanguage={uiLanguage}
      title={uiLanguage === "fr" ? "Historique" : "History"}
    >
      <div className="stack" style={{ gap: 18 }}>
        <div
          className="card stack"
          style={{
            gap: 18,
            position: "relative",
            overflow: "hidden",
            borderRadius: 32,
            border: "1px solid rgba(43,33,24,0.08)",
            background:
              "linear-gradient(135deg, rgba(255,241,220,0.96), rgba(255,255,255,0.92) 52%, rgba(232,248,246,0.88))",
            boxShadow: "0 22px 60px rgba(43,33,24,0.07)",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              right: -110,
              top: -130,
              width: 310,
              height: 310,
              borderRadius: 999,
              background: "rgba(255,122,89,0.16)",
              pointerEvents: "none",
            }}
          />

          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              left: "46%",
              bottom: -150,
              width: 340,
              height: 340,
              borderRadius: 999,
              background: "rgba(88,180,174,0.14)",
              pointerEvents: "none",
            }}
          />

          <div
            className="stack"
            style={{
              gap: 16,
              position: "relative",
            }}
          >
            <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
              <span
                className="badge"
                style={{
                  background: "rgba(255,122,89,0.12)",
                  borderColor: "rgba(255,122,89,0.20)",
                  color: "var(--coach-accent)",
                  fontWeight: 850,
                }}
              >
                {uiLanguage === "fr" ? "Mémoire continue" : "Continuous memory"}
              </span>

              <span
                className="badge"
                style={{
                  background: "rgba(88,180,174,0.12)",
                  borderColor: "rgba(88,180,174,0.20)",
                  color: "var(--coach-calm)",
                  fontWeight: 850,
                }}
              >
                {uiLanguage === "fr" ? "Sessions conservées" : "Saved sessions"}
              </span>
            </div>

            <div
              style={{
                maxWidth: 900,
                fontSize: 44,
                lineHeight: 1.02,
                fontWeight: 950,
                letterSpacing: "-0.07em",
                color: "var(--coach-ink)",
              }}
            >
              {uiLanguage === "fr"
                ? "Retrouve ce que tes sessions ont déjà révélé."
                : "Revisit what your sessions have already revealed."}
            </div>

            <p
              className="subtitle"
              style={{
                maxWidth: 780,
                color: "var(--coach-muted)",
                fontSize: 16,
                lineHeight: 1.7,
              }}
            >
              {uiLanguage === "fr"
                ? "Ton historique t’aide à relire tes conversations passées, repérer les signaux récurrents et suivre l’évolution de ta trajectoire au fil du temps."
                : "Your history helps you review past conversations, spot recurring signals, and follow how your trajectory evolves over time."}
            </p>

            <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
              <BadgePill icon={<SparkIcon size={14} />}>
                {uiLanguage === "fr" ? "Synthèses IA" : "AI summaries"}
              </BadgePill>

              <BadgePill icon={<BrainIcon size={14} />}>
                {uiLanguage === "fr" ? "Mémoire de coaching" : "Coaching memory"}
              </BadgePill>

              <BadgePill icon={<ClockIcon size={14} />}>
                {uiLanguage === "fr" ? "Progression dans le temps" : "Progress over time"}
              </BadgePill>
            </div>

            <div className="row" style={{ flexWrap: "wrap", gap: 10 }}>
              <button
                className="button"
                onClick={() => router.push("/session")}
                type="button"
                style={{
                  background: "var(--coach-accent)",
                  minHeight: 46,
                  paddingInline: 20,
                }}
              >
                {uiLanguage === "fr" ? "Démarrer une session" : "Start a session"}
              </button>

              <button
                className="button ghost"
                onClick={() => router.push("/dashboard")}
                type="button"
              >
                {uiLanguage === "fr" ? "Retour au tableau de bord" : "Back to dashboard"}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-3">
          <HistoryMetricCard
            label={uiLanguage === "fr" ? "Sessions totales" : "Total sessions"}
            value={items.length}
            helper={
              uiLanguage === "fr"
                ? "Toutes les conversations enregistrées."
                : "All saved coaching conversations."
            }
            icon={<SessionIcon size={18} />}
            tone="warm"
          />

          <HistoryMetricCard
            label={uiLanguage === "fr" ? "Sessions clôturées" : "Closed sessions"}
            value={completedSessions}
            helper={
              uiLanguage === "fr"
                ? "Sessions avec fin enregistrée."
                : "Sessions with a recorded ending."
            }
            icon={<ClockIcon size={18} />}
            tone="calm"
          />

          <HistoryMetricCard
            label={uiLanguage === "fr" ? "Synthèses disponibles" : "Available summaries"}
            value={sessionsWithSummary}
            helper={
              uiLanguage === "fr"
                ? "Sessions enrichies par une synthèse."
                : "Sessions enriched with a summary."
            }
            icon={<BrainIcon size={18} />}
            tone="neutral"
          />
        </div>

        {latestSession ? (
          <CoachSectionCard warm>
            <div className="row space-between" style={{ gap: 12, flexWrap: "wrap" }}>
              <div className="stack" style={{ gap: 6 }}>
                <div className="section-title">
                  {uiLanguage === "fr" ? "Dernière session" : "Latest session"}
                </div>

                <div className="muted" style={{ color: "var(--coach-muted)" }}>
                  {uiLanguage === "fr"
                    ? `Session #${latestSession.session_id} démarrée le ${new Date(
                        latestSession.started_at,
                      ).toLocaleString()}.`
                    : `Session #${latestSession.session_id} started on ${new Date(
                        latestSession.started_at,
                      ).toLocaleString()}.`}
                </div>
              </div>

              <button
                className="button ghost"
                type="button"
                onClick={() => router.push(`/history/${latestSession.session_id}`)}
              >
                {uiLanguage === "fr" ? "Voir le détail" : "View detail"}
              </button>
            </div>
          </CoachSectionCard>
        ) : null}

        {loading ? (
          <CoachSectionCard>
            <div className="section-title">
              {uiLanguage === "fr" ? "Chargement de l’historique" : "Loading history"}
            </div>

            <div className="muted" style={{ color: "var(--coach-muted)" }}>
              {uiLanguage === "fr"
                ? "Nous récupérons tes sessions précédentes."
                : "We are retrieving your previous sessions."}
            </div>
          </CoachSectionCard>
        ) : error ? (
          <CoachSectionCard>
            <div className="section-title" style={{ color: "var(--danger)" }}>
              {uiLanguage === "fr" ? "Impossible de charger l’historique" : "Unable to load history"}
            </div>

            <div className="muted">{error}</div>

            <div className="row" style={{ flexWrap: "wrap", gap: 10 }}>
              <button className="button" onClick={() => void loadHistory()} type="button">
                {uiLanguage === "fr" ? "Réessayer" : "Try again"}
              </button>

              <button
                className="button ghost"
                onClick={() => router.push("/dashboard")}
                type="button"
              >
                {uiLanguage === "fr" ? "Retour au tableau de bord" : "Back to dashboard"}
              </button>
            </div>
          </CoachSectionCard>
        ) : items.length === 0 ? (
          <CoachSectionCard warm>
            <div className="section-title">
              {uiLanguage === "fr" ? "Aucune session passée pour le moment" : "No past sessions yet"}
            </div>

            <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
              <BadgePill icon={<ClockIcon size={14} />}>
                {uiLanguage === "fr" ? "Aucune session" : "No sessions yet"}
              </BadgePill>
            </div>

            <div className="muted" style={{ color: "var(--coach-muted)" }}>
              {uiLanguage === "fr"
                ? "Démarre une première session de coaching pour construire ton historique, tes résumés et tes recommandations."
                : "Start your first coaching session to build your history, summaries, and recommendations."}
            </div>

            <div className="row" style={{ flexWrap: "wrap" }}>
              <button
                className="button"
                onClick={() => router.push("/session")}
                type="button"
                style={{ background: "var(--coach-accent)" }}
              >
                {uiLanguage === "fr" ? "Démarrer une session" : "Start a session"}
              </button>
            </div>
          </CoachSectionCard>
        ) : (
          <div className="stack" style={{ gap: 16 }}>
            <div
              className="card-soft stack"
              style={{
                gap: 8,
                borderRadius: 24,
                background: "rgba(255,255,255,0.70)",
                border: "1px solid rgba(43,33,24,0.08)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.72)",
              }}
            >
              <div className="section-title">
                {uiLanguage === "fr" ? "Toutes tes sessions" : "All your sessions"}
              </div>

              <div className="muted" style={{ color: "var(--coach-muted)" }}>
                {uiLanguage === "fr"
                  ? `${items.length} session${items.length > 1 ? "s" : ""} enregistrée${items.length > 1 ? "s" : ""}.`
                  : `${items.length} saved session${items.length > 1 ? "s" : ""}.`}
              </div>
            </div>

            {items.map((item) => (
              <SessionHistoryCard
                key={item.session_id}
                item={item}
                uiLanguage={uiLanguage}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}