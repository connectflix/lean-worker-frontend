"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth-guard";
import { AppShell } from "@/components/app-shell";
import { ProblemDetectionCard } from "@/components/problem-detection-card";
import { SessionSummaryCard } from "@/components/session-summary-card";
import {
  BadgePill,
  ClockIcon,
  SessionIcon,
  SparkIcon,
} from "@/components/ui-flat-icons";
import { getSessionDetail, getSessionProblemDetection } from "@/lib/api";
import { useCurrentUser } from "@/components/user-context";
import { resolveUiLanguage, type SupportedUiLanguage } from "@/lib/user-locales";
import type { ProblemDetection, SessionDetail } from "@/lib/types";

export default function SessionDetailPage() {
  return (
    <AuthGuard>
      <SessionDetailContent />
    </AuthGuard>
  );
}

function SessionDetailContent() {
  const params = useParams<{ sessionId: string }>();
  const router = useRouter();
  const { user } = useCurrentUser();

  const [item, setItem] = useState<SessionDetail | null>(null);
  const [analysis, setAnalysis] = useState<ProblemDetection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const uiLanguage: SupportedUiLanguage = resolveUiLanguage({
    language: user?.language,
    locale: user?.locale,
  });

  const sessionId = useMemo(() => Number(params.sessionId), [params.sessionId]);

  async function loadDetail() {
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
      setError(err instanceof Error ? err.message : "Failed to load session detail.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!Number.isNaN(sessionId)) {
      void loadDetail();
    } else {
      setError("Invalid session id.");
      setLoading(false);
    }
  }, [sessionId]);

  const copy =
    uiLanguage === "fr"
      ? {
          title: "Détail de session",
          loading: "Chargement du détail de session...",
          errorTitle: "Impossible de charger cette session",
          notFound: "Session introuvable",
          notFoundBody:
            "Cette session n’existe pas ou n’est plus accessible depuis ton historique.",
          retry: "Réessayer",
          backToHistory: "Retour à l’historique",
          started: "Démarrée le",
          transcript: "Transcript",
          noTranscript: "Aucun transcript disponible pour cette session.",
          noAnalysis:
            "Aucune analyse complémentaire n’a encore été générée pour cette session.",
          noSummary: "Aucun résumé n’est encore disponible pour cette session.",
          you: "Toi",
          agent: "Coach",
        }
      : {
          title: "Session detail",
          loading: "Loading session detail...",
          errorTitle: "Unable to load this session",
          notFound: "Session not found",
          notFoundBody:
            "This session does not exist or is no longer accessible from your history.",
          retry: "Try again",
          backToHistory: "Back to history",
          started: "Started",
          transcript: "Transcript",
          noTranscript: "No transcript is available for this session.",
          noAnalysis:
            "No additional analysis has been generated yet for this session.",
          noSummary: "No summary is available for this session yet.",
          you: "You",
          agent: "Coach",
        };

  return (
    <AppShell uiLanguage={uiLanguage} title={copy.title}>
      {loading ? (
        <div className="card stack">
          <div className="section-title">{copy.loading}</div>
          <div className="muted">
            {uiLanguage === "fr"
              ? "Nous récupérons la conversation, le résumé et l’analyse associée."
              : "We are retrieving the conversation, summary, and related analysis."}
          </div>
        </div>
      ) : error ? (
        <div className="card stack">
          <div className="section-title" style={{ color: "var(--danger)" }}>
            {copy.errorTitle}
          </div>
          <div className="muted">{error}</div>
          <div className="row" style={{ flexWrap: "wrap" }}>
            <button className="button" onClick={() => void loadDetail()}>
              {copy.retry}
            </button>
            <button className="button ghost" onClick={() => router.push("/history")}>
              {copy.backToHistory}
            </button>
          </div>
        </div>
      ) : !item ? (
        <div className="card stack">
          <div className="section-title">{copy.notFound}</div>
          <div className="muted">{copy.notFoundBody}</div>
          <div className="row">
            <button className="button" onClick={() => router.push("/history")}>
              {copy.backToHistory}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div
            className="card stack"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(248,250,252,0.95))",
            }}
          >
            <div className="row space-between" style={{ flexWrap: "wrap", gap: 16 }}>
              <div className="stack" style={{ gap: 8 }}>
                <div className="row" style={{ gap: 8, alignItems: "center" }}>
                  <SessionIcon />
                  <h1 className="title">Session #{item.session_id}</h1>
                </div>

                <p className="subtitle">
                  {copy.started}: {new Date(item.started_at).toLocaleString()}
                </p>
              </div>

              <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
                <BadgePill icon={<SparkIcon size={14} />}>{item.status}</BadgePill>
                <BadgePill icon={<ClockIcon size={14} />}>
                  {new Date(item.started_at).toLocaleDateString()}
                </BadgePill>
              </div>
            </div>

            <div className="row" style={{ flexWrap: "wrap" }}>
              <button className="button secondary" onClick={() => router.push("/history")}>
                {copy.backToHistory}
              </button>
            </div>
          </div>

          <SessionSummaryCard summary={item.summary || copy.noSummary} />

          {analysis ? (
            <ProblemDetectionCard item={analysis} />
          ) : (
            <div className="card stack">
              <div className="section-title">
                {uiLanguage === "fr" ? "Analyse complémentaire" : "Additional analysis"}
              </div>
              <div className="muted">{copy.noAnalysis}</div>
            </div>
          )}

          <div className="card stack">
            <div className="section-title">{copy.transcript}</div>

            <div
              className="card-soft stack"
              style={{
                maxHeight: 520,
                overflow: "auto",
                gap: 12,
              }}
            >
              {item.transcript.length === 0 ? (
                <div className="muted">{copy.noTranscript}</div>
              ) : (
                item.transcript.map((turn, index) => {
                  const isUser = turn.speaker === "user";
                  return (
                    <div
                      key={`${turn.created_at}-${index}`}
                      className={`chat-bubble ${isUser ? "chat-user" : "chat-agent"}`}
                      style={{
                        alignSelf: isUser ? "flex-end" : "flex-start",
                        maxWidth: "88%",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          marginBottom: 8,
                          opacity: isUser ? 0.9 : 0.7,
                        }}
                      >
                        {isUser ? copy.you : copy.agent}
                      </div>
                      <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.55 }}>
                        {turn.text}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}