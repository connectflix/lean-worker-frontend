"use client";

import { Suspense, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthGuard } from "@/components/auth-guard";
import { ConversationPanel } from "@/components/conversation-panel";
import { SessionInsightsPanel } from "@/components/session-insights-panel";
import { VoiceSessionPanel } from "@/components/voice-session-panel";
import { WorkspaceShell } from "@/components/workspace-shell";
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
import { useUiLanguage } from "@/lib/use-ui-language";

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

function CoachCard({
  children,
  warm = false,
  style,
}: {
  children: ReactNode;
  warm?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className="card stack"
      style={{
        gap: 16,
        borderRadius: 24,
        border: "1px solid rgba(43,33,24,0.08)",
        background: warm
          ? "linear-gradient(135deg, rgba(255,241,220,0.94), rgba(255,255,255,0.92))"
          : "rgba(255,255,255,0.78)",
        boxShadow: "0 18px 48px rgba(43,33,24,0.06)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SoftIconFrame({
  children,
  tone = "warm",
}: {
  children: ReactNode;
  tone?: "warm" | "calm" | "neutral";
}) {
  const background =
    tone === "calm"
      ? "rgba(88,180,174,0.12)"
      : tone === "neutral"
        ? "rgba(43,33,24,0.06)"
        : "rgba(255,122,89,0.13)";

  const color =
    tone === "calm"
      ? "var(--coach-calm)"
      : tone === "neutral"
        ? "var(--coach-muted)"
        : "var(--coach-accent)";

  const border =
    tone === "calm"
      ? "1px solid rgba(88,180,174,0.20)"
      : tone === "neutral"
        ? "1px solid rgba(43,33,24,0.08)"
        : "1px solid rgba(255,122,89,0.22)";

  return (
    <span
      style={{
        width: 42,
        height: 42,
        borderRadius: 16,
        display: "grid",
        placeItems: "center",
        background,
        color,
        border,
        flexShrink: 0,
      }}
    >
      {children}
    </span>
  );
}

function ModeChoiceCard({
  title,
  description,
  detail,
  tag,
  icon,
  buttonLabel,
  loadingLabel,
  loading,
  disabled,
  tone,
  onClick,
}: {
  title: string;
  description: string;
  detail: string;
  tag: string;
  icon: ReactNode;
  buttonLabel: string;
  loadingLabel: string;
  loading: boolean;
  disabled: boolean;
  tone: "warm" | "calm";
  onClick: () => void;
}) {
  const isWarm = tone === "warm";

  return (
    <div
      className="card-soft stack"
      style={{
        gap: 16,
        padding: "clamp(18px, 3vw, 22px)",
        minHeight: 270,
        borderRadius: 24,
        border: isWarm
          ? "1px solid rgba(255,122,89,0.18)"
          : "1px solid rgba(88,180,174,0.18)",
        background: isWarm
          ? "linear-gradient(180deg, rgba(255,248,239,0.94), rgba(255,255,255,0.86))"
          : "linear-gradient(180deg, rgba(232,248,246,0.92), rgba(255,255,255,0.86))",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.72)",
      }}
    >
      <div className="row space-between" style={{ gap: 12, alignItems: "center" }}>
        <div className="row" style={{ gap: 10, alignItems: "center", minWidth: 0 }}>
          <SoftIconFrame tone={tone}>{icon}</SoftIconFrame>

          <div
            className="section-title"
            style={{
              margin: 0,
              fontSize: 22,
              color: "var(--coach-ink)",
            }}
          >
            {title}
          </div>
        </div>

        <span
          className="badge"
          style={{
            background: isWarm ? "rgba(255,122,89,0.12)" : "rgba(88,180,174,0.12)",
            borderColor: isWarm ? "rgba(255,122,89,0.20)" : "rgba(88,180,174,0.20)",
            color: isWarm ? "var(--coach-accent)" : "var(--coach-calm)",
            fontWeight: 850,
          }}
        >
          {tag}
        </span>
      </div>

      <div
        className="muted"
        style={{
          color: "var(--coach-muted)",
          fontSize: 15,
          lineHeight: 1.7,
        }}
      >
        {description}
      </div>

      <div
        className="muted"
        style={{
          fontSize: 14,
          lineHeight: 1.6,
          color: "var(--coach-muted)",
          paddingTop: 12,
          borderTop: "1px solid rgba(43,33,24,0.08)",
        }}
      >
        {detail}
      </div>

      <div style={{ marginTop: "auto", paddingTop: 6 }}>
        <button
          className="button"
          onClick={onClick}
          type="button"
          disabled={disabled}
          style={{
            width: "100%",
            minHeight: 48,
            background: isWarm ? "var(--coach-accent)" : "var(--coach-calm)",
          }}
        >
          {loading ? loadingLabel : buttonLabel}
        </button>
      </div>
    </div>
  );
}

export default function SessionPage() {
  return (
    <AuthGuard>
      <Suspense
        fallback={
          <main
            className="page"
            style={{
              minHeight: "100vh",
              background: "var(--coach-bg)",
              padding: "clamp(16px, 3vw, 24px)",
            }}
          >
            <div className="page-wrap">
              <CoachCard warm>
                <div className="section-title">Chargement de l’espace de coaching...</div>
              </CoachCard>
            </div>
          </main>
        }
      >
        <SessionPageContent />
      </Suspense>
    </AuthGuard>
  );
}

function SessionPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsKey = searchParams.toString();
  const { uiLanguage } = useUiLanguage("fr");
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [careerGap, setCareerGap] = useState<CareerGap | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [coachMode, setCoachMode] = useState<string | undefined>(undefined);
  const [coachIntent, setCoachIntent] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [sessionMode, setSessionMode] = useState<SessionMode>("written");
  const [launchingMode, setLaunchingMode] = useState<SessionMode | null>(null);

  const copy = useMemo(
    () =>
      uiLanguage === "fr"
        ? {
            title: "Coaching",
            noSession: "Démarre une nouvelle session de coaching",
            noSessionText:
              "Choisis le mode écrit ou vocal. Les deux utilisent le même contexte, la même mémoire et les mêmes recommandations.",
            noSessionHint:
              "Tu peux commencer immédiatement et changer de mode pendant la session.",
            sessionErrorTitle: "Impossible de charger l’espace de coaching",
            backToDashboard: "Retour au tableau de bord",
            loading: "Chargement de la session...",
            retry: "Réessayer",
            chooseMode: "Mode de conversation",
            chooseModeText:
              "Écris pour structurer tes idées ou parle pour une conversation plus naturelle.",
            writtenMode: "Session écrite",
            writtenModeText:
              "Conversation textuelle avec une trace complète de l’échange.",
            voiceMode: "Session vocale",
            voiceModeText:
              "Conversation vocale fluide et spontanée.",
            writtenModeEmptyText:
              "Idéal pour clarifier, structurer et relire facilement l’échange.",
            voiceModeEmptyText:
              "Idéal pour parler librement et avancer de manière plus spontanée.",
            activeContext: "Contexte actif",
            activeContextText:
              "Le coach utilise ton profil, ta trajectoire, ton historique et tes recommandations pour personnaliser l’échange.",
            activeContextPurpose:
              "Le Purpose Canvas enrichit les questions, reformulations et recommandations du coach.",
            writtenHeadline: "Session écrite",
            writtenLead:
              "Échange avec ton coach par écrit et conserve une trace complète.",
            voiceHeadline: "Session vocale",
            voiceLead:
              "Parle naturellement avec ton coach dans une conversation vocale.",
            modeCardTitle: "Mode sélectionné",
            trajectory: "Trajectoire",
            purposeCanvas: "Purpose Canvas",
            memoryActive: "Mémoire active",
            viewHistory: "Voir l’historique",
            viewDashboard: "Retour au tableau de bord",
            launchingWritten: "Ouverture de la session écrite...",
            launchingVoice: "Ouverture de la session vocale...",
            writtenTag: "Structuré",
            voiceTag: "Immersif",
            premiumTag: "Nouvelle session",
            whyTitle: "Choisis ton expérience",
          }
        : {
            title: "Coaching",
            noSession: "Start a new coaching session",
            noSessionText:
              "Choose written or voice mode. Both use the same context, memory, and recommendations.",
            noSessionHint:
              "You can start immediately and switch modes during the session.",
            sessionErrorTitle: "Unable to load the coaching workspace",
            backToDashboard: "Back to dashboard",
            loading: "Loading session...",
            retry: "Try again",
            chooseMode: "Conversation mode",
            chooseModeText:
              "Write to structure your thoughts or speak for a more natural conversation.",
            writtenMode: "Written session",
            writtenModeText:
              "Text conversation with a complete record of the exchange.",
            voiceMode: "Voice session",
            voiceModeText:
              "A fluid and spontaneous voice conversation.",
            writtenModeEmptyText:
              "Best for clarifying, structuring, and reviewing the exchange.",
            voiceModeEmptyText:
              "Best for speaking freely and moving forward spontaneously.",
            activeContext: "Active context",
            activeContextText:
              "Your coach uses your profile, trajectory, history, and recommendations to personalize the exchange.",
            activeContextPurpose:
              "The Purpose Canvas enriches the coach’s questions, reflections, and recommendations.",
            writtenHeadline: "Written session",
            writtenLead:
              "Chat with your coach in writing and keep a complete record.",
            voiceHeadline: "Voice session",
            voiceLead:
              "Speak naturally with your coach in a voice conversation.",
            modeCardTitle: "Selected mode",
            trajectory: "Trajectory",
            purposeCanvas: "Purpose Canvas",
            memoryActive: "Memory active",
            viewHistory: "View history",
            viewDashboard: "Back to dashboard",
            launchingWritten: "Opening written session...",
            launchingVoice: "Opening voice session...",
            writtenTag: "Structured",
            voiceTag: "Immersive",
            premiumTag: "New session",
            whyTitle: "Choose your experience",
          },
    [uiLanguage],
  );

  const loadSessionPage = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams(searchParamsKey);
      const modeParam = params.get("mode");
      setSessionMode(modeParam === "voice" ? "voice" : "written");

      const sessionIdParam = params.get("sessionId");
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
      setError(
        err instanceof Error
          ? err.message
          : uiLanguage === "fr"
            ? "Impossible de charger la session de coaching."
            : "Failed to load coaching session.",
      );
    } finally {
      setLoading(false);
    }
  }, [searchParamsKey, uiLanguage]);

  useEffect(() => {
    void loadSessionPage();
  }, [loadSessionPage]);

  async function handleStartSession(mode: SessionMode) {
    try {
      setLaunchingMode(mode);
      setError(null);

      const created = await createSession();
      const params = new URLSearchParams();
      params.set("mode", mode);
      params.set("sessionId", String(created.session_id));

      router.push(`/session?${params.toString()}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : uiLanguage === "fr"
            ? "Impossible de démarrer la session."
            : "Failed to start session.",
      );
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
    const params = new URLSearchParams(searchParamsKey);
    params.set("mode", mode);

    if (sessionId) {
      params.set("sessionId", String(sessionId));
    }

    router.replace(`/session?${params.toString()}`);
    setSessionMode(mode);
  }

  const modeSwitcher =
    !loading && !error && sessionId ? (
      <CoachCard warm>
        <div className="row" style={{ gap: 10, alignItems: "center" }}>
          <SoftIconFrame tone="warm">
            <SessionIcon size={18} />
          </SoftIconFrame>
          <div className="section-title">{copy.chooseMode}</div>
        </div>

        <div className="muted" style={{ color: "var(--coach-muted)", lineHeight: 1.65 }}>
          {copy.chooseModeText}
        </div>

        <div className="grid grid-1" style={{ gap: 10 }}>
          <button
            className={sessionMode === "written" ? "button" : "button ghost"}
            onClick={() => navigateToMode("written")}
            type="button"
            style={
              sessionMode === "written"
                ? { background: "var(--coach-accent)" }
                : undefined
            }
          >
            {copy.writtenMode}
          </button>

          <button
            className={sessionMode === "voice" ? "button" : "button ghost"}
            onClick={() => navigateToMode("voice")}
            type="button"
            style={
              sessionMode === "voice"
                ? { background: "var(--coach-calm)" }
                : undefined
            }
          >
            {copy.voiceMode}
          </button>
        </div>

        <div
          className="card-soft stack"
          style={{
            gap: 8,
            borderRadius: 22,
            background: "rgba(255,255,255,0.66)",
            border: "1px solid rgba(43,33,24,0.08)",
          }}
        >
          <strong>{copy.modeCardTitle}</strong>
          <div style={{ fontWeight: 700, color: "var(--coach-ink)" }}>
            {sessionMode === "written" ? copy.writtenMode : copy.voiceMode}
          </div>
          <div className="muted" style={{ color: "var(--coach-muted)" }}>
            {sessionMode === "written" ? copy.writtenModeText : copy.voiceModeText}
          </div>
        </div>
      </CoachCard>
    ) : null;

  const activeContextCard =
    !loading && !error && sessionId ? (
      <CoachCard>
        <div className="row" style={{ gap: 10, alignItems: "center" }}>
          <SoftIconFrame tone="calm">
            <BrainIcon size={18} />
          </SoftIconFrame>
          <div className="section-title">{copy.activeContext}</div>
        </div>

        <div className="muted" style={{ color: "var(--coach-muted)", lineHeight: 1.65 }}>
          {copy.activeContextText}
        </div>

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

        <div
          className="card-soft muted"
          style={{
            lineHeight: 1.6,
            color: "var(--coach-muted)",
            borderRadius: 22,
            background: "rgba(255,248,239,0.72)",
            border: "1px solid rgba(43,33,24,0.08)",
          }}
        >
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
      </CoachCard>
    ) : null;

  const fallbackCenter = loading ? (
    <CoachCard warm>
      <div className="row" style={{ gap: 12, alignItems: "center" }}>
        <SoftIconFrame tone="warm">
          <SparkIcon size={18} />
        </SoftIconFrame>

        <div className="stack" style={{ gap: 4 }}>
          <div className="section-title">{copy.loading}</div>
          <div className="muted" style={{ color: "var(--coach-muted)" }}>
            {uiLanguage === "fr"
              ? "Nous préparons ton espace de coaching."
              : "We are preparing your coaching workspace."}
          </div>
        </div>
      </div>
    </CoachCard>
  ) : error ? (
    <CoachCard>
      <div className="section-title" style={{ color: "var(--danger)" }}>
        {copy.sessionErrorTitle}
      </div>

      <div className="muted" style={{ color: "var(--coach-muted)" }}>
        {error}
      </div>

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
    </CoachCard>
  ) : !sessionId ? (
    <div
      style={{
        width: "100%",
        maxWidth: 1140,
        margin: "clamp(16px, 4vw, 40px) auto",
      }}
    >
      <CoachCard
        warm
        style={{
          gap: 28,
          padding: 32,
          overflow: "hidden",
          position: "relative",
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
            background: "rgba(255,122,89,0.14)",
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
            background: "rgba(88,180,174,0.13)",
          }}
        />

        <div className="stack" style={{ gap: 16, position: "relative" }}>
          <div className="row" style={{ gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <span
              className="badge"
              style={{
                background: "rgba(255,122,89,0.12)",
                borderColor: "rgba(255,122,89,0.20)",
                color: "var(--coach-accent)",
                fontWeight: 850,
              }}
            >
              {copy.premiumTag}
            </span>
          </div>

          <div
            className="row space-between"
            style={{ gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}
          >
            <div className="stack" style={{ gap: 12, maxWidth: 760 }}>
              <div
                style={{
                  fontSize: 42,
                  lineHeight: 1.04,
                  fontWeight: 950,
                  letterSpacing: "-0.07em",
                  color: "var(--coach-ink)",
                }}
              >
                {copy.noSession}
              </div>

              <div
                className="muted"
                style={{
                  fontSize: 16,
                  lineHeight: 1.75,
                  color: "var(--coach-muted)",
                }}
              >
                {copy.noSessionText}
              </div>

              <div
                className="muted"
                style={{
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: "var(--coach-muted)",
                }}
              >
                {copy.noSessionHint}
              </div>
            </div>

            <div
              className="card-soft stack"
              style={{
                gap: 8,
                minWidth: 230,
                borderRadius: 24,
                background: "rgba(255,255,255,0.66)",
                border: "1px solid rgba(43,33,24,0.08)",
              }}
            >
              <div className="section-title" style={{ fontSize: 15 }}>
                {copy.whyTitle}
              </div>
              <div className="muted" style={{ fontSize: 14, color: "var(--coach-muted)" }}>
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
            position: "relative",
          }}
        >
          <ModeChoiceCard
            title={copy.writtenMode}
            description={copy.writtenModeEmptyText}
            detail={copy.writtenModeText}
            tag={copy.writtenTag}
            icon={<SessionIcon size={18} />}
            buttonLabel={copy.writtenMode}
            loadingLabel={copy.launchingWritten}
            loading={launchingMode === "written"}
            disabled={launchingMode !== null}
            tone="warm"
            onClick={() => void handleStartSession("written")}
          />

          <ModeChoiceCard
            title={copy.voiceMode}
            description={copy.voiceModeEmptyText}
            detail={copy.voiceModeText}
            tag={copy.voiceTag}
            icon={<BrainIcon size={18} />}
            buttonLabel={copy.voiceMode}
            loadingLabel={copy.launchingVoice}
            loading={launchingMode === "voice"}
            disabled={launchingMode !== null}
            tone="calm"
            onClick={() => void handleStartSession("voice")}
          />
        </div>

        <div
          className="row"
          style={{
            flexWrap: "wrap",
            gap: 10,
            justifyContent: "flex-start",
            position: "relative",
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
      </CoachCard>
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
        <CoachCard
          warm
          style={{
            flexShrink: 0,
            borderRadius: 28,
          }}
        >
          <div className="row" style={{ gap: 10, alignItems: "center" }}>
            <SoftIconFrame tone="calm">
              <SessionIcon size={18} />
            </SoftIconFrame>

            <div className="stack" style={{ gap: 4 }}>
              <div className="section-title">{copy.voiceHeadline}</div>
              <div className="muted" style={{ color: "var(--coach-muted)" }}>
                {copy.voiceLead}
              </div>
            </div>
          </div>
        </CoachCard>

        <div
          className="chat-surface"
          style={{
            borderRadius: 32,
            border: "1px solid rgba(43,33,24,0.08)",
            boxShadow: "0 18px 48px rgba(43,33,24,0.06)",
          }}
        >
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
        <CoachCard
          warm
          style={{
            flexShrink: 0,
            borderRadius: 28,
          }}
        >
          <div className="row" style={{ gap: 10, alignItems: "center" }}>
            <SoftIconFrame tone="warm">
              <SessionIcon size={18} />
            </SoftIconFrame>

            <div className="stack" style={{ gap: 4 }}>
              <div className="section-title">{copy.writtenHeadline}</div>
              <div className="muted" style={{ color: "var(--coach-muted)" }}>
                {copy.writtenLead}
              </div>
            </div>
          </div>
        </CoachCard>

        <div
          className="chat-surface"
          style={{
            borderRadius: 32,
            border: "1px solid rgba(43,33,24,0.08)",
            boxShadow: "0 18px 48px rgba(43,33,24,0.06)",
          }}
        >
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