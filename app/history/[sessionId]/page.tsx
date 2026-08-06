"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth-guard";
import { AppShell } from "@/components/app-shell";
import { ProblemDetectionCard } from "@/components/problem-detection-card";
import { SessionSummaryCard } from "@/components/session-summary-card";
import {
  BadgePill,
  BrainIcon,
  ClockIcon,
  SessionIcon,
  SparkIcon,
} from "@/components/ui-flat-icons";
import { getSessionDetail, getSessionProblemDetection } from "@/lib/api";
import { useUiLanguage } from "@/lib/use-ui-language";
import type { SupportedUiLanguage } from "@/lib/user-locales";
import type { ProblemDetection, SessionDetail } from "@/lib/types";

export default function SessionDetailPage() {
  return (
    <AuthGuard>
      <SessionDetailContent />
    </AuthGuard>
  );
}

function getStatusLabel(status: string, uiLanguage: SupportedUiLanguage): string {
  if (uiLanguage === "fr") {
    if (status === "open") return "ouverte";
    if (status === "closed") return "clôturée";
    if (status === "force_closed") return "clôturée de force";
  }

  if (status === "open") return "open";
  if (status === "closed") return "closed";
  if (status === "force_closed") return "force closed";

  return status;
}

function getStatusTone(status: string) {
  if (status === "open") {
    return {
      background: "rgba(255,122,89,0.12)",
      borderColor: "rgba(255,122,89,0.22)",
      color: "var(--coach-accent)",
    };
  }

  if (status === "force_closed") {
    return {
      background: "rgba(198,40,40,0.08)",
      borderColor: "rgba(198,40,40,0.16)",
      color: "var(--danger)",
    };
  }

  return {
    background: "rgba(88,180,174,0.12)",
    borderColor: "rgba(88,180,174,0.20)",
    color: "var(--coach-calm)",
  };
}

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
        borderRadius: 24,
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

function SessionDetailContent() {
  const params = useParams<{ sessionId: string }>();
  const router = useRouter();
  const { uiLanguage } = useUiLanguage("fr");

  const [item, setItem] = useState<SessionDetail | null>(null);
  const [analysis, setAnalysis] = useState<ProblemDetection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sessionId = useMemo(() => Number(params.sessionId), [params.sessionId]);

  const copy =
    uiLanguage === "fr"
      ? {
          title: "Détail de la session",
          loading: "Chargement de la session...",
          loadingBody:
            "Nous récupérons la synthèse, l’analyse et la conversation.",
          errorTitle: "Impossible de charger cette session",
          invalidSession: "Identifiant de session invalide.",
          loadError: "Impossible de charger le détail de la session.",
          notFound: "Session introuvable",
          notFoundBody:
            "Cette session n’existe pas ou n’est plus accessible depuis ton historique.",
          retry: "Réessayer",
          backToHistory: "Retour à l’historique",
          started: "Démarrée",
          closed: "Terminée",
          transcript: "Conversation",
          transcriptIntro:
            "Consulte le fil complet de l’échange et retrouve le contexte de la session.",
          noTranscript: "Aucun message n’est disponible pour cette session.",
          noAnalysis:
            "Aucune analyse complémentaire n’est disponible pour cette session.",
          noSummary: "Aucune synthèse n’est encore disponible pour cette session.",
          you: "Toi",
          agent: "Coach",
          sessionTrace: "Vue d’ensemble",
          sessionTraceBody:
            "Cette page réunit les informations essentielles, la synthèse, l’analyse et la conversation.",
          synthesisAvailable: "Synthèse disponible",
          analysisAvailable: "Analyse disponible",
          transcriptAvailable: "Conversation disponible",
          noAnalysisTitle: "Analyse complémentaire",
          loadingTitle: "Préparation de la session",
          messageCount: (count: number) => `${count} message${count > 1 ? "s" : ""}`,
        }
      : {
          title: "Session detail",
          loading: "Loading session...",
          loadingBody:
            "We are retrieving the summary, analysis, and conversation.",
          errorTitle: "Unable to load this session",
          invalidSession: "Invalid session id.",
          loadError: "Unable to load the session detail.",
          notFound: "Session not found",
          notFoundBody:
            "This session does not exist or is no longer accessible from your history.",
          retry: "Try again",
          backToHistory: "Back to history",
          started: "Started",
          closed: "Completed",
          transcript: "Conversation",
          transcriptIntro:
            "Review the full exchange and recover the context of the session.",
          noTranscript: "No messages are available for this session.",
          noAnalysis:
            "No additional analysis is available for this session.",
          noSummary: "No summary is available for this session yet.",
          you: "You",
          agent: "Coach",
          sessionTrace: "Overview",
          sessionTraceBody:
            "This page brings together the key information, summary, analysis, and conversation.",
          synthesisAvailable: "Summary available",
          analysisAvailable: "Analysis available",
          transcriptAvailable: "Conversation available",
          noAnalysisTitle: "Additional analysis",
          loadingTitle: "Preparing the session",
          messageCount: (count: number) => `${count} message${count > 1 ? "s" : ""}`,
        };

  const loadDetail = useCallback(async () => {
    if (!Number.isFinite(sessionId) || sessionId <= 0) {
      setError(copy.invalidSession);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [sessionData, analysisData] = await Promise.all([
        getSessionDetail(sessionId),
        getSessionProblemDetection(sessionId).catch(() => null),
      ]);

      setItem(sessionData);
      setAnalysis(analysisData);
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.loadError);
    } finally {
      setLoading(false);
    }
  }, [sessionId, copy.invalidSession, copy.loadError]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  return (
    <AppShell uiLanguage={uiLanguage} title={copy.title}>
      {loading ? (
        <CoachSectionCard warm>
          <div className="row" style={{ gap: 12, alignItems: "center" }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 16,
                display: "grid",
                placeItems: "center",
                background: "rgba(255,122,89,0.12)",
                color: "var(--coach-accent)",
              }}
            >
              <SparkIcon size={20} />
            </div>

            <div className="stack" style={{ gap: 4 }}>
              <div className="section-title">{copy.loadingTitle}</div>
              <div className="muted" style={{ color: "var(--coach-muted)" }}>
                {copy.loadingBody}
              </div>
            </div>
          </div>
        </CoachSectionCard>
      ) : error ? (
        <CoachSectionCard>
          <div className="section-title" style={{ color: "var(--danger)" }}>
            {copy.errorTitle}
          </div>

          <div className="muted" style={{ color: "var(--coach-muted)" }}>
            {error}
          </div>

          <div className="row" style={{ flexWrap: "wrap", gap: 10 }}>
            <button
              className="button"
              onClick={() => void loadDetail()}
              type="button"
              style={{
                background: "var(--coach-accent)",
              }}
            >
              {copy.retry}
            </button>

            <button
              className="button ghost"
              onClick={() => router.push("/history")}
              type="button"
            >
              {copy.backToHistory}
            </button>
          </div>
        </CoachSectionCard>
      ) : !item ? (
        <CoachSectionCard>
          <div className="section-title">{copy.notFound}</div>

          <div className="muted" style={{ color: "var(--coach-muted)" }}>
            {copy.notFoundBody}
          </div>

          <div className="row">
            <button
              className="button"
              onClick={() => router.push("/history")}
              type="button"
              style={{
                background: "var(--coach-accent)",
              }}
            >
              {copy.backToHistory}
            </button>
          </div>
        </CoachSectionCard>
      ) : (
        <>
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
              className="row space-between"
              style={{
                position: "relative",
                flexWrap: "wrap",
                gap: 16,
                alignItems: "flex-start",
              }}
            >
              <div className="stack" style={{ gap: 12, maxWidth: 820 }}>
                <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                  <span
                    className="badge"
                    style={{
                      ...getStatusTone(item.status),
                      fontWeight: 850,
                    }}
                  >
                    {getStatusLabel(item.status, uiLanguage)}
                  </span>

                  <BadgePill icon={<BrainIcon size={14} />}>
                    {item.summary ? copy.synthesisAvailable : copy.sessionTrace}
                  </BadgePill>

                  {analysis ? (
                    <BadgePill icon={<SparkIcon size={14} />}>
                      {copy.analysisAvailable}
                    </BadgePill>
                  ) : null}
                </div>

                <div
                  className="row"
                  style={{
                    gap: 10,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 17,
                      display: "grid",
                      placeItems: "center",
                      background: "rgba(255,122,89,0.12)",
                      border: "1px solid rgba(255,122,89,0.20)",
                      color: "var(--coach-accent)",
                    }}
                  >
                    <SessionIcon size={20} />
                  </div>

                  <h1
                    className="title"
                    style={{
                      color: "var(--coach-ink)",
                      fontSize: 42,
                      letterSpacing: "-0.065em",
                    }}
                  >
                    Session #{item.session_id}
                  </h1>
                </div>

                <p
                  className="subtitle"
                  style={{
                    color: "var(--coach-muted)",
                    maxWidth: 720,
                    lineHeight: 1.7,
                  }}
                >
                  {copy.sessionTraceBody}
                </p>
              </div>

              <button
                className="button ghost"
                onClick={() => router.push("/history")}
                type="button"
                style={{
                  position: "relative",
                  background: "rgba(255,255,255,0.62)",
                  borderColor: "rgba(43,33,24,0.10)",
                }}
              >
                {copy.backToHistory}
              </button>
            </div>

            <div
              className="grid grid-3"
              style={{
                position: "relative",
              }}
            >
              <div
                className="card-soft stack"
                style={{
                  gap: 8,
                  borderRadius: 22,
                  background: "rgba(255,255,255,0.62)",
                  border: "1px solid rgba(43,33,24,0.08)",
                }}
              >
                <div className="muted" style={{ color: "var(--coach-muted)" }}>
                  {copy.started}
                </div>
                <strong style={{ color: "var(--coach-ink)" }}>
                  {new Date(item.started_at).toLocaleString(uiLanguage === "fr" ? "fr-BE" : "en-GB")}
                </strong>
              </div>

              <div
                className="card-soft stack"
                style={{
                  gap: 8,
                  borderRadius: 22,
                  background: "rgba(255,255,255,0.62)",
                  border: "1px solid rgba(43,33,24,0.08)",
                }}
              >
                <div className="muted" style={{ color: "var(--coach-muted)" }}>
                  {copy.closed}
                </div>
                <strong style={{ color: "var(--coach-ink)" }}>
                  {item.ended_at
                    ? new Date(item.ended_at).toLocaleString(
                        uiLanguage === "fr" ? "fr-BE" : "en-GB",
                      )
                    : "—"}
                </strong>
              </div>

              <div
                className="card-soft stack"
                style={{
                  gap: 8,
                  borderRadius: 22,
                  background: "rgba(255,255,255,0.62)",
                  border: "1px solid rgba(43,33,24,0.08)",
                }}
              >
                <div className="muted" style={{ color: "var(--coach-muted)" }}>
                  {copy.transcript}
                </div>
                <strong style={{ color: "var(--coach-ink)" }}>
                  {copy.messageCount(item.transcript.length)}
                </strong>
              </div>
            </div>
          </div>

          <SessionSummaryCard
            summary={item.summary || copy.noSummary}
            uiLanguage={uiLanguage}
          />

          {analysis ? (
            <ProblemDetectionCard item={analysis} />
          ) : (
            <CoachSectionCard>
              <div className="row" style={{ gap: 10, alignItems: "center" }}>
                <BrainIcon />
                <div className="section-title">{copy.noAnalysisTitle}</div>
              </div>

              <div className="muted" style={{ color: "var(--coach-muted)" }}>
                {copy.noAnalysis}
              </div>
            </CoachSectionCard>
          )}

          <CoachSectionCard>
            <div className="row space-between" style={{ gap: 12, flexWrap: "wrap" }}>
              <div className="stack" style={{ gap: 6 }}>
                <div className="row" style={{ gap: 10, alignItems: "center" }}>
                  <SessionIcon />
                  <div className="section-title">{copy.transcript}</div>
                </div>

                <div className="muted" style={{ color: "var(--coach-muted)" }}>
                  {copy.transcriptIntro}
                </div>
              </div>

              <BadgePill icon={<ClockIcon size={14} />}>
                {copy.transcriptAvailable}
              </BadgePill>
            </div>

            <div
              className="stack"
              style={{
                maxHeight: 560,
                overflowY: "auto",
                overflowX: "hidden",
                gap: 14,
                padding: 16,
                borderRadius: 24,
                background:
                  "linear-gradient(180deg, rgba(255,248,239,0.76), rgba(255,255,255,0.70))",
                border: "1px solid rgba(43,33,24,0.08)",
              }}
            >
              {item.transcript.length === 0 ? (
                <div
                  className="card-soft"
                  style={{
                    borderRadius: 20,
                    background: "rgba(255,255,255,0.62)",
                    border: "1px solid rgba(43,33,24,0.08)",
                  }}
                >
                  <div className="muted" style={{ color: "var(--coach-muted)" }}>
                    {copy.noTranscript}
                  </div>
                </div>
              ) : (
                item.transcript.map((turn, index) => {
                  const isUser = turn.speaker === "user";

                  return (
                    <div
                      key={`${turn.created_at}-${index}`}
                      style={{
                        display: "flex",
                        justifyContent: isUser ? "flex-end" : "flex-start",
                      }}
                    >
                      <div
                        className={`chat-bubble ${isUser ? "chat-user" : "chat-agent"}`}
                        style={{
                          maxWidth: "88%",
                          borderRadius: isUser ? "22px 22px 6px 22px" : "22px 22px 22px 6px",
                          background: isUser ? "var(--coach-accent)" : "rgba(255,255,255,0.88)",
                          color: isUser ? "#ffffff" : "var(--coach-ink)",
                          border: isUser ? "1px solid rgba(255,122,89,0.20)" : "1px solid rgba(43,33,24,0.08)",
                          boxShadow: "0 10px 26px rgba(43,33,24,0.06)",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 850,
                            marginBottom: 8,
                            opacity: isUser ? 0.92 : 0.72,
                          }}
                        >
                          {isUser ? copy.you : copy.agent}
                        </div>

                        <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                          {turn.text}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CoachSectionCard>
        </>
      )}
    </AppShell>
  );
}