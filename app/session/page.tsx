"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthGuard } from "@/components/auth-guard";
import { ConversationPanel } from "@/components/conversation-panel";
import { SessionInsightsPanel } from "@/components/session-insights-panel";
import { VoiceSessionPanel } from "@/components/voice-session-panel";
import { WorkspaceShell } from "@/components/workspace-shell";
import { useCurrentUser } from "@/components/user-context";
import {
  BadgePill,
  BrainIcon,
  SessionIcon,
  SparkIcon,
  TargetIcon,
} from "@/components/ui-flat-icons";
import {
  createSession,
  getCareerGap,
  getCurrentOpenSession,
  getRecommendations,
} from "@/lib/api";
import type { Recommendation } from "@/lib/types";
import { resolveUiLanguage, type SupportedUiLanguage } from "@/lib/user-locales";

type SessionMode = "written" | "voice";

type CareerGap = {
  current_role?: string | null;
  short_term_role?: string | null;
  short_term_level?: string | null;
  mid_term_role?: string | null;
  mid_term_level?: string | null;
  long_term_role?: string | null;
  long_term_level?: string | null;
  role_gap_short_term: boolean;
  role_gap_mid_term: boolean;
  role_gap_long_term: boolean;
  level_gap_mid_term: boolean;
  level_gap_long_term: boolean;
  profession_percent?: number | null;
  work_percent?: number | null;
  chore_percent?: number | null;
  destiny_percent?: number | null;
  hobby_percent?: number | null;
  key_gap_summary?: string | null;
};

export default function SessionPage() {
  return (
    <AuthGuard>
      <SessionPageContent />
    </AuthGuard>
  );
}

function SessionPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useCurrentUser();

  const [uiLanguage, setUiLanguage] = useState<SupportedUiLanguage>("en");
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [careerGap, setCareerGap] = useState<CareerGap | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [coachMode, setCoachMode] = useState<string | undefined>(undefined);
  const [coachIntent, setCoachIntent] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [sessionMode, setSessionMode] = useState<SessionMode>("written");
  const [launchingMode, setLaunchingMode] = useState<SessionMode | null>(null);

  useEffect(() => {
    setUiLanguage(
      resolveUiLanguage({
        language: user?.language,
        locale: user?.locale,
      }),
    );
  }, [user]);

  const searchParamsKey = searchParams.toString();

  async function loadSessionPage() {
    try {
      setLoading(true);
      setError(null);

      const modeParam = searchParams.get("mode");
      setSessionMode(modeParam === "voice" ? "voice" : "written");

      const sessionIdParam = searchParams.get("sessionId");
      let resolvedSessionId: number | null = null;

      if (sessionIdParam) {
        const parsed = Number(sessionIdParam);
        if (!Number.isNaN(parsed) && parsed > 0) {
          resolvedSessionId = parsed;
        }
      }

      if (!resolvedSessionId) {
        const openSession = await getCurrentOpenSession();
        if (openSession?.session_id) {
          resolvedSessionId = openSession.session_id;
        }
      }

      if (!resolvedSessionId) {
        setSessionId(null);
        setCareerGap(null);
        setRecommendations([]);
        setCoachMode(undefined);
        setCoachIntent(undefined);
        return;
      }

      setSessionId(resolvedSessionId);

      const [gap, recs] = await Promise.all([getCareerGap(), getRecommendations()]);

      setCareerGap(gap);
      setRecommendations(recs);
      setCoachMode(undefined);
      setCoachIntent(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load coaching session.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSessionPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParamsKey]);

  const copy = useMemo(
    () =>
      uiLanguage === "fr"
        ? {
            title: "Coaching",
            noSession: "Lance ton prochain espace de coaching",
            noSessionText:
              "Choisis le mode qui correspond le mieux à ta manière de réfléchir et d’avancer. Les deux expériences s’appuient sur le même cockpit de coaching, la même mémoire, le Purpose Canvas et les mêmes recommandations.",
            noSessionHint:
              "Tu peux démarrer immédiatement en mode écrit ou vocal, sans repasser par le tableau de bord.",
            sessionErrorTitle: "Impossible de charger l’espace de coaching",
            backToDashboard: "Retour au tableau de bord",
            loading: "Chargement de la session...",
            retry: "Réessayer",
            chooseMode: "Choisis ton mode de coaching",
            chooseModeText:
              "Le mode écrit est idéal pour structurer. Le mode vocal est idéal pour fluidifier et te laisser parler naturellement.",
            writtenMode: "Session écrite",
            writtenModeText:
              "Même cockpit de coaching, avec conversation écrite au centre.",
            voiceMode: "Session vocale",
            voiceModeText:
              "Même cockpit de coaching, avec orb et interaction voix-only au centre.",
            writtenModeEmptyText:
              "Pour clarifier, structurer, prendre du recul et garder une trace écrite de l’échange.",
            voiceModeEmptyText:
              "Pour une conversation plus fluide, plus spontanée et plus immersive.",
            activeContext: "Contexte actif",
            activeContextText:
              "Le coach s’appuie sur ton profil, ta trajectoire, ton historique, ton Purpose Canvas, tes canvases d’engagement et tes recommandations pour ajuster sa posture.",
            activeContextPurpose:
              "Le Purpose Canvas peut maintenant influencer naturellement les questions, reformulations et recommandations du coach.",
            writtenHeadline: "Conversation écrite active",
            writtenLead:
              "Retrouve le même espace de coaching que la session vocale, avec une interaction textuelle au centre.",
            voiceHeadline: "Conversation vocale active",
            voiceLead:
              "Interaction immersive voix-only avec le même cockpit de coaching.",
            modeCardTitle: "Mode actif",
            trajectory: "Trajectoire",
            purposeCanvas: "Purpose Canvas",
            memoryActive: "Mémoire active",
            viewHistory: "Voir l’historique",
            viewDashboard: "Retour au tableau de bord",
            launchingWritten: "Ouverture de la session écrite...",
            launchingVoice: "Ouverture de la session vocale...",
            writtenTag: "Structuré",
            voiceTag: "Immersif",
            premiumTag: "Démarrage direct",
            whyTitle: "Deux façons d’entrer en coaching",
          }
        : {
            title: "Coaching",
            noSession: "Launch your next coaching space",
            noSessionText:
              "Choose the mode that best fits the way you think and move forward. Both experiences rely on the same coaching cockpit, memory, Purpose Canvas, and recommendations.",
            noSessionHint:
              "You can start immediately in written or voice mode without going back through the dashboard.",
            sessionErrorTitle: "Unable to load the coaching workspace",
            backToDashboard: "Back to dashboard",
            loading: "Loading session...",
            retry: "Try again",
            chooseMode: "Choose your coaching mode",
            chooseModeText:
              "Written mode is ideal for structure. Voice mode is ideal for fluid and natural conversation.",
            writtenMode: "Written session",
            writtenModeText:
              "Same coaching cockpit, with written conversation in the center.",
            voiceMode: "Voice session",
            voiceModeText:
              "Same coaching cockpit, with orb and voice-only interaction in the center.",
            writtenModeEmptyText:
              "Best for clarifying, structuring, stepping back, and keeping a written trace of the exchange.",
            voiceModeEmptyText:
              "Best for a more fluid, spontaneous, and immersive conversation.",
            activeContext: "Active context",
            activeContextText:
              "Your coach uses your profile, trajectory, history, Purpose Canvas, engagement canvases, and recommendations to adapt its stance.",
            activeContextPurpose:
              "The Purpose Canvas can now naturally influence the coach’s questions, reflections, and recommendations.",
            writtenHeadline: "Written conversation active",
            writtenLead:
              "Use the same coaching cockpit as voice mode, with text interaction in the center.",
            voiceHeadline: "Voice conversation active",
            voiceLead:
              "Immersive voice-only interaction within the same coaching cockpit.",
            modeCardTitle: "Active mode",
            trajectory: "Trajectory",
            purposeCanvas: "Purpose Canvas",
            memoryActive: "Memory active",
            viewHistory: "View history",
            viewDashboard: "Back to dashboard",
            launchingWritten: "Opening written session...",
            launchingVoice: "Opening voice session...",
            writtenTag: "Structured",
            voiceTag: "Immersive",
            premiumTag: "Direct start",
            whyTitle: "Two ways to enter coaching",
          },
    [uiLanguage],
  );

  async function handleStartSession(mode: SessionMode) {
    try {
      setLaunchingMode(mode);
      setError(null);

      const created = await createSession();
      const params = new URLSearchParams();
      params.set("mode", mode);
      params.set("sessionId", String(created.session_id));

      router.push(`/sessions?${params.toString()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start session.");
    } finally {
      setLaunchingMode(null);
    }
  }

  function handleClosed() {
    router.push("/dashboard");
  }

  function handleCoachStateChange(next: {
    coachMode?: string;
    coachIntent?: string;
  }) {
    setCoachMode(next.coachMode);
    setCoachIntent(next.coachIntent);
  }

  function navigateToMode(mode: SessionMode) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("mode", mode);

    if (sessionId) {
      params.set("sessionId", String(sessionId));
    }

    router.replace(`/sessions?${params.toString()}`);
    setSessionMode(mode);
  }

  const modeSwitcher =
    !loading && !error && sessionId ? (
      <div
        className="card stack"
        style={{
          gap: 16,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(248,250,252,0.94))",
        }}
      >
        <div className="row" style={{ gap: 8, alignItems: "center" }}>
          <SessionIcon />
          <div className="section-title">{copy.chooseMode}</div>
        </div>

        <div className="muted">{copy.chooseModeText}</div>

        <div className="grid grid-1" style={{ gap: 10 }}>
          <button
            className={sessionMode === "written" ? "button" : "button ghost"}
            onClick={() => navigateToMode("written")}
            type="button"
          >
            {copy.writtenMode}
          </button>

          <button
            className={sessionMode === "voice" ? "button" : "button ghost"}
            onClick={() => navigateToMode("voice")}
            type="button"
          >
            {copy.voiceMode}
          </button>
        </div>

        <div className="card-soft stack" style={{ gap: 8 }}>
          <strong>{copy.modeCardTitle}</strong>
          <div style={{ fontWeight: 600 }}>
            {sessionMode === "written" ? copy.writtenMode : copy.voiceMode}
          </div>
          <div className="muted">
            {sessionMode === "written" ? copy.writtenModeText : copy.voiceModeText}
          </div>
        </div>
      </div>
    ) : null;

  const activeContextCard =
    !loading && !error && sessionId ? (
      <div className="card stack">
        <div className="row" style={{ gap: 8, alignItems: "center" }}>
          <BrainIcon />
          <div className="section-title">{copy.activeContext}</div>
        </div>

        <div className="muted">{copy.activeContextText}</div>

        <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
          <BadgePill icon={<TargetIcon size={14} />}>
            {careerGap?.key_gap_summary
              ? copy.trajectory
              : uiLanguage === "fr"
                ? "Trajectoire en analyse"
                : "Trajectory in analysis"}
          </BadgePill>

          <BadgePill icon={<BrainIcon size={14} />}>{copy.purposeCanvas}</BadgePill>

          <BadgePill icon={<SparkIcon size={14} />}>
            {uiLanguage === "fr"
              ? `${recommendations.length} recommandation${recommendations.length > 1 ? "s" : ""}`
              : `${recommendations.length} recommendation${recommendations.length > 1 ? "s" : ""}`}
          </BadgePill>

          <BadgePill icon={<SessionIcon size={14} />}>{copy.memoryActive}</BadgePill>
        </div>

        <div className="card-soft muted" style={{ lineHeight: 1.55 }}>
          {copy.activeContextPurpose}
        </div>

        <div className="row" style={{ flexWrap: "wrap", gap: 10 }}>
          <button
            className="button ghost"
            onClick={() => router.push("/history")}
            type="button"
          >
            {copy.viewHistory}
          </button>
        </div>
      </div>
    ) : null;

  const fallbackCenter = loading ? (
    <div className="card stack">
      <div className="section-title">{copy.loading}</div>
      <div className="muted">
        {uiLanguage === "fr"
          ? "Nous préparons ton espace de coaching."
          : "We are preparing your coaching workspace."}
      </div>
    </div>
  ) : error ? (
    <div className="card stack">
      <div className="section-title" style={{ color: "var(--danger)" }}>
        {copy.sessionErrorTitle}
      </div>
      <div className="muted">{error}</div>
      <div className="row" style={{ flexWrap: "wrap", gap: 10 }}>
        <button className="button" onClick={() => void loadSessionPage()} type="button">
          {copy.retry}
        </button>
        <button
          className="button ghost"
          onClick={() => router.push("/dashboard")}
          type="button"
        >
          {copy.backToDashboard}
        </button>
      </div>
    </div>
  ) : !sessionId ? (
    <div
      style={{
        width: "100%",
        maxWidth: 1120,
        margin: "40px auto",
      }}
    >
      <div
        className="card stack"
        style={{
          gap: 28,
          padding: 32,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,250,252,0.99))",
        }}
      >
        <div className="stack" style={{ gap: 14 }}>
          <div className="row" style={{ gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <BadgePill icon={<SparkIcon size={14} />}>{copy.premiumTag}</BadgePill>
          </div>

          <div
            className="row space-between"
            style={{ gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}
          >
            <div className="stack" style={{ gap: 10, maxWidth: 720 }}>
              <div
                className="section-title"
                style={{ fontSize: 30, lineHeight: 1.15 }}
              >
                {copy.noSession}
              </div>

              <div
                className="muted"
                style={{ fontSize: 16, lineHeight: 1.65 }}
              >
                {copy.noSessionText}
              </div>

              <div
                className="muted"
                style={{ fontSize: 14, lineHeight: 1.55 }}
              >
                {copy.noSessionHint}
              </div>
            </div>

            <div className="card-soft stack" style={{ gap: 8, minWidth: 220 }}>
              <div className="section-title" style={{ fontSize: 15 }}>
                {copy.whyTitle}
              </div>
              <div className="muted" style={{ fontSize: 14 }}>
                {copy.chooseModeText}
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 18,
            alignItems: "stretch",
          }}
        >
          <div
            className="card-soft stack"
            style={{
              gap: 16,
              padding: 22,
              minHeight: 280,
              border: "1px solid var(--border)",
              borderRadius: 24,
            }}
          >
            <div className="row space-between" style={{ gap: 12, alignItems: "center" }}>
              <div className="row" style={{ gap: 10, alignItems: "center" }}>
                <SessionIcon />
                <div className="section-title" style={{ margin: 0, fontSize: 22 }}>
                  {copy.writtenMode}
                </div>
              </div>

              <BadgePill icon={<SparkIcon size={14} />}>{copy.writtenTag}</BadgePill>
            </div>

            <div className="muted" style={{ fontSize: 15, lineHeight: 1.65 }}>
              {copy.writtenModeEmptyText}
            </div>

            <div
              className="muted"
              style={{
                fontSize: 14,
                lineHeight: 1.55,
                paddingTop: 10,
                borderTop: "1px solid var(--border)",
              }}
            >
              {copy.writtenModeText}
            </div>

            <div style={{ marginTop: "auto", paddingTop: 6 }}>
              <button
                className="button"
                onClick={() => void handleStartSession("written")}
                type="button"
                disabled={launchingMode !== null}
                style={{ width: "100%" }}
              >
                {launchingMode === "written" ? copy.launchingWritten : copy.writtenMode}
              </button>
            </div>
          </div>

          <div
            className="card-soft stack"
            style={{
              gap: 16,
              padding: 22,
              minHeight: 280,
              border: "1px solid var(--border)",
              borderRadius: 24,
            }}
          >
            <div className="row space-between" style={{ gap: 12, alignItems: "center" }}>
              <div className="row" style={{ gap: 10, alignItems: "center" }}>
                <BrainIcon />
                <div className="section-title" style={{ margin: 0, fontSize: 22 }}>
                  {copy.voiceMode}
                </div>
              </div>

              <BadgePill icon={<SparkIcon size={14} />}>{copy.voiceTag}</BadgePill>
            </div>

            <div className="muted" style={{ fontSize: 15, lineHeight: 1.65 }}>
              {copy.voiceModeEmptyText}
            </div>

            <div
              className="muted"
              style={{
                fontSize: 14,
                lineHeight: 1.55,
                paddingTop: 10,
                borderTop: "1px solid var(--border)",
              }}
            >
              {copy.voiceModeText}
            </div>

            <div style={{ marginTop: "auto", paddingTop: 6 }}>
              <button
                className="button"
                onClick={() => void handleStartSession("voice")}
                type="button"
                disabled={launchingMode !== null}
                style={{ width: "100%" }}
              >
                {launchingMode === "voice" ? copy.launchingVoice : copy.voiceMode}
              </button>
            </div>
          </div>
        </div>

        <div
          className="row"
          style={{
            flexWrap: "wrap",
            gap: 10,
            justifyContent: "flex-start",
          }}
        >
          <button
            className="button ghost"
            onClick={() => router.push("/history")}
            type="button"
            disabled={launchingMode !== null}
          >
            {copy.viewHistory}
          </button>

          <button
            className="button ghost"
            onClick={() => router.push("/dashboard")}
            type="button"
            disabled={launchingMode !== null}
          >
            {copy.viewDashboard}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  if (fallbackCenter) {
    return (
      <WorkspaceShell
        uiLanguage={uiLanguage}
        title={copy.title}
        left={undefined}
        center={fallbackCenter}
        right={undefined}
      />
    );
  }

  const left = (
    <div className="stack">
      {modeSwitcher}
      {activeContextCard}
    </div>
  );

  const right =
    !loading && !error && sessionId ? (
      <SessionInsightsPanel
        uiLanguage={uiLanguage}
        sessionId={sessionId}
        careerGap={careerGap}
        recommendations={recommendations}
        coachMode={coachMode}
        coachIntent={coachIntent}
      />
    ) : null;

  const center =
    sessionId && sessionMode === "voice" ? (
      <div className="session-cockpit-column">
        <div className="card stack" style={{ flexShrink: 0 }}>
          <div className="row" style={{ gap: 8, alignItems: "center" }}>
            <SessionIcon />
            <div className="section-title">{copy.voiceHeadline}</div>
          </div>
          <div className="muted">{copy.voiceLead}</div>
        </div>

        <div className="chat-surface">
          <VoiceSessionPanel
            key={`voice-${sessionId}-${uiLanguage}`}
            sessionId={sessionId}
            uiLanguage={uiLanguage}
            onClosed={handleClosed}
            onCoachStateChange={handleCoachStateChange}
          />
        </div>
      </div>
    ) : sessionId ? (
      <div className="session-cockpit-column">
        <div className="card stack" style={{ flexShrink: 0 }}>
          <div className="row" style={{ gap: 8, alignItems: "center" }}>
            <SessionIcon />
            <div className="section-title">{copy.writtenHeadline}</div>
          </div>
          <div className="muted">{copy.writtenLead}</div>
        </div>

        <div className="chat-surface">
          <ConversationPanel
            key={`written-${sessionId}-${uiLanguage}`}
            sessionId={sessionId}
            uiLanguage={uiLanguage}
            onClosed={handleClosed}
            onCoachStateChange={handleCoachStateChange}
            variant="cockpit"
          />
        </div>
      </div>
    ) : null;

  return (
    <WorkspaceShell
      uiLanguage={uiLanguage}
      title={copy.title}
      left={left}
      center={center}
      right={right}
    />
  );
}