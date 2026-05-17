// app/dashboard/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth-guard";
import { AppShell } from "@/components/app-shell";
import { BestNextActionCard } from "@/components/best-next-action-card";
import { useCurrentUser } from "@/components/user-context";
import {
  BadgePill,
  BrainIcon,
  ChartIcon,
  ClockIcon,
  LayerIcon,
  PathIcon,
  SessionIcon,
  SparkIcon,
  TargetIcon,
} from "@/components/ui-flat-icons";
import {
  confirmCurrentProfileContext,
  createSession,
  forceCloseSession,
  getCareerBlueprint,
  getCareerGap,
  getCareerTrajectory,
  getCurrentOpenSession,
  getDashboardSummary,
  getDashboardTimeline,
  getRecommendations,
} from "@/lib/api";
import { getUiCopy } from "@/lib/ui-copy";
import { useUiLanguage } from "@/lib/use-ui-language";
import type {
  CareerBlueprintResponse,
  DashboardSummary,
  DashboardTimelineItem,
  OpenSessionResponse,
  Recommendation,
} from "@/lib/types";

type ApiErrorLike = {
  message?: string;
  detail?: string;
};

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

type CareerTrajectory = {
  trajectory_summary?: string | null;
  current_position?: string | null;
  target_position?: string | null;
  strategic_bridge?: string | null;
};

function prettify(value: string): string {
  return value.replaceAll("_", " ");
}

function looksLikeTranslationKey(value: string | null | undefined): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  return /^[a-z0-9_]+\.[a-z0-9_.-]+$/i.test(trimmed);
}

function getBestRecommendation(recommendations: Recommendation[]): Recommendation | null {
  const priorityOrder = { high: 3, medium: 2, low: 1 };

  const candidates = recommendations
    .filter((recommendation) => {
      return recommendation.status !== "completed" && recommendation.status !== "dismissed";
    })
    .sort((left, right) => {
      const leftPriority = priorityOrder[left.priority as keyof typeof priorityOrder] ?? 0;
      const rightPriority = priorityOrder[right.priority as keyof typeof priorityOrder] ?? 0;

      if (rightPriority !== leftPriority) {
        return rightPriority - leftPriority;
      }

      const leftStarted = left.started_at ? new Date(left.started_at).getTime() : 0;
      const rightStarted = right.started_at ? new Date(right.started_at).getTime() : 0;

      return rightStarted - leftStarted;
    });

  return candidates[0] ?? null;
}

function buildLocalizedTrajectorySummary(
  trajectory: CareerTrajectory | null,
  uiLanguage: "fr" | "en",
): string | null {
  if (!trajectory) return null;

  const rawSummary = trajectory.trajectory_summary?.trim?.() || "";
  const currentPosition = trajectory.current_position?.trim?.() || "";
  const targetPosition = trajectory.target_position?.trim?.() || "";
  const strategicBridge = trajectory.strategic_bridge?.trim?.() || "";

  if (
    rawSummary &&
    !looksLikeTranslationKey(rawSummary) &&
    !looksLikeTranslationKey(strategicBridge)
  ) {
    return rawSummary;
  }

  const safeBridge =
    !strategicBridge || looksLikeTranslationKey(strategicBridge)
      ? uiLanguage === "fr"
        ? "développer le leadership, l’impact stratégique et la profondeur de capacité"
        : "expand leadership, strategic impact, and capability depth"
      : strategicBridge;

  if (!currentPosition && !targetPosition && !safeBridge) {
    return rawSummary || null;
  }

  if (uiLanguage === "fr") {
    if (currentPosition && targetPosition && safeBridge) {
      return `Tu es actuellement ${currentPosition}. Ta trajectoire vise ${targetPosition}. Le pont stratégique consiste à ${safeBridge}.`;
    }

    if (currentPosition && targetPosition) {
      return `Tu es actuellement ${currentPosition}. Ta trajectoire vise ${targetPosition}.`;
    }

    if (targetPosition && safeBridge) {
      return `Ta trajectoire vise ${targetPosition}. Le pont stratégique consiste à ${safeBridge}.`;
    }

    if (currentPosition && safeBridge) {
      return `Tu es actuellement ${currentPosition}. Le pont stratégique consiste à ${safeBridge}.`;
    }
  } else {
    if (currentPosition && targetPosition && safeBridge) {
      return `You are currently ${currentPosition}. Your trajectory aims toward ${targetPosition}. The strategic bridge is ${safeBridge}.`;
    }

    if (currentPosition && targetPosition) {
      return `You are currently ${currentPosition}. Your trajectory aims toward ${targetPosition}.`;
    }

    if (targetPosition && safeBridge) {
      return `Your trajectory aims toward ${targetPosition}. The strategic bridge is ${safeBridge}.`;
    }

    if (currentPosition && safeBridge) {
      return `You are currently ${currentPosition}. The strategic bridge is ${safeBridge}.`;
    }
  }

  return rawSummary || null;
}

function CoachMetricCard({
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
  tone?: "warm" | "calm" | "neutral" | "danger";
}) {
  const toneStyle =
    tone === "calm"
      ? {
          background: "rgba(88,180,174,0.11)",
          border: "1px solid rgba(88,180,174,0.18)",
          color: "var(--coach-calm)",
        }
      : tone === "danger"
        ? {
            background: "rgba(198,40,40,0.08)",
            border: "1px solid rgba(198,40,40,0.16)",
            color: "var(--danger)",
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

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}

function DashboardContent() {
  const router = useRouter();
  const { user } = useCurrentUser();
  const { uiLanguage, loadingLanguage } = useUiLanguage("en");
  const copy = getUiCopy(uiLanguage);

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [timeline, setTimeline] = useState<DashboardTimelineItem[]>([]);
  const [openSession, setOpenSession] = useState<OpenSessionResponse | null>(null);
  const [careerBlueprint, setCareerBlueprint] =
    useState<CareerBlueprintResponse | null>(null);
  const [careerGap, setCareerGap] = useState<CareerGap | null>(null);
  const [trajectory, setTrajectory] = useState<CareerTrajectory | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [forceClosing, setForceClosing] = useState(false);
  const [confirmingProfile, setConfirmingProfile] = useState(false);

  async function loadDashboard() {
    try {
      setError(null);

      const [
        dashboardData,
        timelineData,
        openSessionData,
        careerBlueprintData,
        careerGapData,
        trajectoryData,
        recommendationsData,
      ] = await Promise.all([
        getDashboardSummary(),
        getDashboardTimeline(),
        getCurrentOpenSession(),
        getCareerBlueprint(),
        getCareerGap(),
        getCareerTrajectory(),
        getRecommendations(),
      ]);

      setSummary(dashboardData);
      setTimeline(timelineData);
      setOpenSession(openSessionData);
      setCareerBlueprint(careerBlueprintData);
      setCareerGap(careerGapData);
      setTrajectory(trajectoryData as CareerTrajectory);
      setRecommendations(recommendationsData);
    } catch (err: unknown) {
      const apiError = err as ApiErrorLike;
      setError(apiError.detail || apiError.message || "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  async function handleStartSession() {
    setStarting(true);
    setError(null);

    try {
      if (openSession) {
        router.push(`/session?sessionId=${openSession.session_id}`);
        return;
      }

      const session = await createSession();
      router.push(`/session?sessionId=${session.session_id}`);
    } catch (err: unknown) {
      const apiError = err as ApiErrorLike;
      setError(apiError.detail || apiError.message || "Failed to create session.");
      setStarting(false);
    }
  }

  async function handleForceClose() {
    if (!openSession) return;

    setForceClosing(true);
    setError(null);

    try {
      await forceCloseSession(openSession.session_id);
      await loadDashboard();
    } catch (err: unknown) {
      const apiError = err as ApiErrorLike;
      setError(apiError.detail || apiError.message || "Failed to close active session.");
    } finally {
      setForceClosing(false);
    }
  }

  async function handleConfirmProfileContext() {
    setConfirmingProfile(true);
    setError(null);

    try {
      await confirmCurrentProfileContext();
      await loadDashboard();
    } catch (err: unknown) {
      const apiError = err as ApiErrorLike;
      setError(apiError.detail || apiError.message || "Failed to confirm profile.");
    } finally {
      setConfirmingProfile(false);
    }
  }

  const blueprintCompleted = !!careerBlueprint?.is_completed;

  const bestRecommendation = useMemo(
    () => getBestRecommendation(recommendations),
    [recommendations],
  );

  const localizedTrajectorySummary = useMemo(
    () => buildLocalizedTrajectorySummary(trajectory, uiLanguage),
    [trajectory, uiLanguage],
  );

  const hasUsefulDashboardContent =
    !!summary ||
    !!openSession ||
    !!bestRecommendation ||
    !!careerGap ||
    !!trajectory ||
    timeline.length > 0;

  const firstName = user?.given_name || user?.display_name || null;
  const activeRecommendations = recommendations.filter((item) => {
    return item.status !== "completed" && item.status !== "dismissed";
  }).length;

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
      title={uiLanguage === "fr" ? "Tableau de bord" : "Dashboard"}
    >
      <div
        className="stack"
        style={{
          gap: 18,
        }}
      >
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
                <div className="section-title">{copy.dashboard.loading}</div>
                <div className="muted" style={{ color: "var(--coach-muted)" }}>
                  {uiLanguage === "fr"
                    ? "Nous préparons ton espace, tes sessions et tes signaux de progression."
                    : "We are preparing your workspace, sessions, and progress signals."}
                </div>
              </div>
            </div>
          </CoachSectionCard>
        ) : error ? (
          <CoachSectionCard>
            <div className="section-title" style={{ color: "var(--danger)" }}>
              {uiLanguage === "fr"
                ? "Impossible de charger le tableau de bord"
                : "Unable to load the dashboard"}
            </div>

            <div className="muted">{error}</div>

            <div className="row" style={{ flexWrap: "wrap" }}>
              <button className="button" onClick={() => void loadDashboard()}>
                {uiLanguage === "fr" ? "Réessayer" : "Try again"}
              </button>

              <button className="button ghost" onClick={handleStartSession}>
                {uiLanguage === "fr" ? "Démarrer une session" : "Start a session"}
              </button>
            </div>
          </CoachSectionCard>
        ) : !hasUsefulDashboardContent ? (
          <CoachSectionCard warm>
            <div
              style={{
                fontSize: 34,
                lineHeight: 1.08,
                fontWeight: 900,
                letterSpacing: "-0.055em",
                color: "var(--coach-ink)",
              }}
            >
              {uiLanguage === "fr"
                ? "Ton espace est prêt, mais encore vide"
                : "Your workspace is ready, but still empty"}
            </div>

            <div className="muted" style={{ color: "var(--coach-muted)", maxWidth: 720 }}>
              {uiLanguage === "fr"
                ? "Démarre une première session pour faire émerger tes premiers insights, recommandations et signaux de trajectoire."
                : "Start your first session to surface your first insights, recommendations, and trajectory signals."}
            </div>

            <div className="row" style={{ flexWrap: "wrap" }}>
              <button className="button" onClick={handleStartSession} disabled={starting}>
                {starting
                  ? uiLanguage === "fr"
                    ? "Ouverture..."
                    : "Opening..."
                  : uiLanguage === "fr"
                    ? "Démarrer une première session"
                    : "Start your first session"}
              </button>

              <button className="button ghost" onClick={() => router.push("/career-blueprint")}>
                {uiLanguage === "fr" ? "Compléter le blueprint" : "Complete blueprint"}
              </button>
            </div>
          </CoachSectionCard>
        ) : (
          <>
            {user?.profile_update_suspected ? (
              <CoachSectionCard>
                <div className="section-title">
                  {uiLanguage === "fr"
                    ? "Ton contexte professionnel a peut-être évolué"
                    : "Your professional context may have changed"}
                </div>

                <div className="muted" style={{ color: "var(--coach-muted)" }}>
                  {uiLanguage === "fr"
                    ? "Le coach a détecté un possible changement de rôle, d’industrie ou d’objectif. Mets à jour ton profil pour garder un coaching pertinent."
                    : "The coach detected a possible change in your role, industry, or goals. Update your profile to keep your coaching relevant."}
                </div>

                <div className="row" style={{ flexWrap: "wrap", gap: 10 }}>
                  <button className="button" onClick={() => router.push("/profile/update-context")}>
                    {uiLanguage === "fr" ? "Mettre à jour mon profil" : "Update my profile"}
                  </button>

                  <button
                    className="button ghost"
                    onClick={handleConfirmProfileContext}
                    disabled={confirmingProfile}
                  >
                    {confirmingProfile
                      ? uiLanguage === "fr"
                        ? "Confirmation..."
                        : "Confirming..."
                      : uiLanguage === "fr"
                        ? "Mon profil est toujours correct"
                        : "My profile is still correct"}
                  </button>
                </div>
              </CoachSectionCard>
            ) : null}

            {!blueprintCompleted ? (
              <CoachSectionCard>
                <div className="section-title">
                  {uiLanguage === "fr"
                    ? "Complète ton Career Blueprint"
                    : "Complete your Career Blueprint"}
                </div>

                <div className="muted" style={{ color: "var(--coach-muted)" }}>
                  {uiLanguage === "fr"
                    ? "Clarifie ton identité, ta vision, tes horizons de carrière et ton point de départ pour rendre ton coaching beaucoup plus précis."
                    : "Clarify your identity, vision, career horizons, and starting point to make your coaching much more precise."}
                </div>

                <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
                  <button className="button" onClick={() => router.push("/career-blueprint")}>
                    {uiLanguage === "fr" ? "Commencer le blueprint" : "Start blueprint"}
                  </button>

                  <button className="button ghost" onClick={() => router.push("/career-blueprint")}>
                    {uiLanguage === "fr" ? "En savoir plus" : "Learn more"}
                  </button>
                </div>
              </CoachSectionCard>
            ) : null}

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
                    {uiLanguage === "fr" ? "Espace actif" : "Active workspace"}
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
                    {uiLanguage === "fr" ? "Coaching personnalisé" : "Personalized coaching"}
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
                    ? `Bonjour ${firstName || "toi"}, où veux-tu avancer aujourd’hui ?`
                    : `Hello ${firstName || "there"}, where do you want to move forward today?`}
                </div>

                <p
                  className="subtitle"
                  style={{
                    maxWidth: 760,
                    color: "var(--coach-muted)",
                    fontSize: 16,
                    lineHeight: 1.7,
                  }}
                >
                  {copy.dashboard.subtitle}
                </p>

                <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
                  <BadgePill icon={<SparkIcon size={14} />}>
                    {uiLanguage === "fr" ? "Coach actif" : "Coach active"}
                  </BadgePill>

                  <BadgePill icon={<BrainIcon size={14} />}>
                    {uiLanguage === "fr" ? "Mémoire continue" : "Continuous memory"}
                  </BadgePill>

                  <BadgePill icon={<TargetIcon size={14} />}>
                    {uiLanguage === "fr" ? "Trajectoire suivie" : "Trajectory tracking"}
                  </BadgePill>
                </div>

                <div className="row" style={{ flexWrap: "wrap", gap: 10 }}>
                  <button
                    className="button"
                    onClick={handleStartSession}
                    disabled={starting || forceClosing}
                    style={{
                      background: "var(--coach-accent)",
                      minHeight: 46,
                      paddingInline: 20,
                    }}
                  >
                    {starting
                      ? uiLanguage === "fr"
                        ? "Ouverture..."
                        : "Opening..."
                      : openSession
                        ? copy.dashboard.resumeOpenSession
                        : copy.dashboard.startNewSession}
                  </button>

                  <button
                    className="button secondary"
                    onClick={() => router.push("/recommendations")}
                    style={{
                      color: "var(--coach-accent)",
                      borderColor: "rgba(255,122,89,0.28)",
                    }}
                  >
                    {uiLanguage === "fr" ? "Voir les recommandations" : "View recommendations"}
                  </button>

                  <button className="button ghost" onClick={() => router.push("/career-blueprint")}>
                    {uiLanguage === "fr" ? "Ouvrir le blueprint" : "Open blueprint"}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-4">
              <CoachMetricCard
                label={uiLanguage === "fr" ? "Sessions récentes" : "Recent sessions"}
                value={timeline.length}
                helper={
                  uiLanguage === "fr"
                    ? "Activités détectées dans ton historique."
                    : "Activities detected in your history."
                }
                icon={<ClockIcon size={18} />}
                tone="warm"
              />

              <CoachMetricCard
                label={uiLanguage === "fr" ? "Actions actives" : "Active actions"}
                value={activeRecommendations}
                helper={
                  uiLanguage === "fr"
                    ? "Recommandations ouvertes ou en cours."
                    : "Open or in-progress recommendations."
                }
                icon={<TargetIcon size={18} />}
                tone="calm"
              />

              <CoachMetricCard
                label={uiLanguage === "fr" ? "Blueprint" : "Blueprint"}
                value={blueprintCompleted ? "OK" : "—"}
                helper={
                  blueprintCompleted
                    ? uiLanguage === "fr"
                      ? "Utilisé pour personnaliser ton coaching."
                      : "Used to personalize your coaching."
                    : uiLanguage === "fr"
                      ? "À compléter pour améliorer le coaching."
                      : "Complete it to improve coaching."
                }
                icon={<PathIcon size={18} />}
                tone={blueprintCompleted ? "calm" : "neutral"}
              />

              <CoachMetricCard
                label={uiLanguage === "fr" ? "Session ouverte" : "Open session"}
                value={openSession ? `#${openSession.session_id}` : "—"}
                helper={
                  openSession
                    ? uiLanguage === "fr"
                      ? "Une conversation est prête à reprendre."
                      : "A conversation is ready to resume."
                    : uiLanguage === "fr"
                      ? "Aucune session ouverte pour l’instant."
                      : "No open session right now."
                }
                icon={<SessionIcon size={18} />}
                tone={openSession ? "warm" : "neutral"}
              />
            </div>

            {openSession ? (
              <CoachSectionCard warm>
                <div className="row" style={{ alignItems: "center", gap: 10 }}>
                  <SessionIcon />
                  <div className="section-title">
                    {uiLanguage === "fr" ? "Session active détectée" : "Active session detected"}
                  </div>
                </div>

                <div className="muted" style={{ color: "var(--coach-muted)" }}>
                  {uiLanguage === "fr"
                    ? `La session #${openSession.session_id}, démarrée le ${new Date(
                        openSession.started_at,
                      ).toLocaleString()}, est toujours ouverte.`
                    : `Session #${openSession.session_id} started on ${new Date(
                        openSession.started_at,
                      ).toLocaleString()} is still open.`}
                </div>

                <div className="row" style={{ flexWrap: "wrap" }}>
                  <button
                    className="button"
                    onClick={() => router.push(`/session?sessionId=${openSession.session_id}`)}
                    style={{
                      background: "var(--coach-accent)",
                    }}
                  >
                    {uiLanguage === "fr" ? "Reprendre la session" : "Resume session"}
                  </button>

                  <button
                    className="button secondary"
                    onClick={handleForceClose}
                    disabled={forceClosing}
                    style={{
                      color: "var(--coach-accent)",
                      borderColor: "rgba(255,122,89,0.28)",
                    }}
                  >
                    {forceClosing
                      ? uiLanguage === "fr"
                        ? "Clôture..."
                        : "Closing..."
                      : uiLanguage === "fr"
                        ? "Clôturer maintenant et générer l’analyse"
                        : "Close now and generate analysis"}
                  </button>
                </div>
              </CoachSectionCard>
            ) : null}

            {bestRecommendation ? (
              <BestNextActionCard recommendation={bestRecommendation} uiLanguage={uiLanguage} />
            ) : (
              <CoachSectionCard>
                <div className="row" style={{ alignItems: "center", gap: 10 }}>
                  <TargetIcon />
                  <div className="section-title">
                    {uiLanguage === "fr" ? "Prochaine meilleure action" : "Best next action"}
                  </div>
                </div>

                <div className="muted" style={{ color: "var(--coach-muted)" }}>
                  {uiLanguage === "fr"
                    ? "Le coach n’a pas encore assez de matière pour proposer une action prioritaire unique. Une ou deux sessions supplémentaires aideront à faire émerger un meilleur next move."
                    : "Your coach does not yet have enough signal to suggest one priority action. One or two more sessions will help surface a stronger next move."}
                </div>
              </CoachSectionCard>
            )}

            <div className="grid grid-2">
              <CoachSectionCard>
                <div className="row" style={{ alignItems: "center", gap: 10 }}>
                  <PathIcon />
                  <div className="section-title">
                    {uiLanguage === "fr" ? "Trajectoire de carrière" : "Career trajectory"}
                  </div>
                </div>

                <div
                  className="muted"
                  style={{
                    color: "var(--coach-muted)",
                    lineHeight: 1.7,
                  }}
                >
                  {localizedTrajectorySummary ||
                    (uiLanguage === "fr"
                      ? "La trajectoire est en cours d’analyse."
                      : "Your trajectory is still being analyzed.")}
                </div>
              </CoachSectionCard>

              <CoachSectionCard>
                <div className="row" style={{ alignItems: "center", gap: 10 }}>
                  <ClockIcon />
                  <div className="section-title">
                    {uiLanguage === "fr" ? "Chronologie récente" : "Recent timeline"}
                  </div>
                </div>

                {timeline.length === 0 ? (
                  <div className="muted" style={{ color: "var(--coach-muted)" }}>
                    {uiLanguage === "fr"
                      ? "Aucune activité récente pour le moment."
                      : "No recent activity yet."}
                  </div>
                ) : (
                  <div className="stack" style={{ gap: 10 }}>
                    {timeline.slice(0, 4).map((item) => (
                      <div
                        key={`${item.session_id}-${item.started_at}`}
                        className="card-soft"
                        style={{
                          borderRadius: 22,
                          background: "rgba(255,248,239,0.74)",
                          border: "1px solid rgba(43,33,24,0.08)",
                        }}
                      >
                        <div
                          className="row space-between"
                          style={{ gap: 8, alignItems: "center" }}
                        >
                          <strong>Session #{item.session_id}</strong>

                          <BadgePill icon={<ClockIcon size={14} />}>
                            {new Date(item.started_at).toLocaleDateString()}
                          </BadgePill>
                        </div>

                        <div className="muted" style={{ marginTop: 8, color: "var(--coach-muted)" }}>
                          {item.primary_problem
                            ? prettify(item.primary_problem)
                            : uiLanguage === "fr"
                              ? "Pas encore de problème principal détecté"
                              : "No primary problem detected yet"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CoachSectionCard>
            </div>

            {careerGap ? (
              <CoachSectionCard>
                <div className="row space-between" style={{ alignItems: "center" }}>
                  <div className="row" style={{ alignItems: "center", gap: 10 }}>
                    <TargetIcon />
                    <div className="section-title">
                      {uiLanguage === "fr"
                        ? "Analyse des écarts de trajectoire"
                        : "Career gap analysis"}
                    </div>
                  </div>

                  <button className="button ghost" onClick={() => router.push("/career-blueprint")}>
                    {uiLanguage === "fr" ? "Voir le blueprint" : "View blueprint"}
                  </button>
                </div>

                <div className="muted" style={{ color: "var(--coach-muted)", lineHeight: 1.7 }}>
                  {careerGap.key_gap_summary ||
                    (uiLanguage === "fr"
                      ? "Aucun écart marquant détecté pour le moment."
                      : "No major gap detected for now.")}
                </div>

                <div className="grid grid-4">
                  {[
                    {
                      label: uiLanguage === "fr" ? "Aujourd’hui" : "Today",
                      role:
                        careerGap.current_role ||
                        (uiLanguage === "fr" ? "Rôle non renseigné" : "No current role"),
                      level: null,
                    },
                    {
                      label: uiLanguage === "fr" ? "Court terme" : "Short term",
                      role: careerGap.short_term_role || "—",
                      level: careerGap.short_term_level || "—",
                    },
                    {
                      label: uiLanguage === "fr" ? "Moyen terme" : "Mid term",
                      role: careerGap.mid_term_role || "—",
                      level: careerGap.mid_term_level || "—",
                    },
                    {
                      label: uiLanguage === "fr" ? "Long terme" : "Long term",
                      role: careerGap.long_term_role || "—",
                      level: careerGap.long_term_level || "—",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="card-soft stack"
                      style={{
                        gap: 8,
                        borderRadius: 22,
                        background: "rgba(255,248,239,0.74)",
                        border: "1px solid rgba(43,33,24,0.08)",
                      }}
                    >
                      <strong>{item.label}</strong>
                      <div className="muted" style={{ color: "var(--coach-muted)" }}>
                        {item.role}
                      </div>
                      {item.level ? (
                        <div className="fine-print" style={{ color: "var(--coach-muted)" }}>
                          {item.level}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>

                <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
                  {careerGap.role_gap_short_term ? (
                    <BadgePill icon={<TargetIcon size={14} />}>
                      {uiLanguage === "fr" ? "Écart de rôle à court terme" : "Short-term role gap"}
                    </BadgePill>
                  ) : null}

                  {careerGap.role_gap_mid_term ? (
                    <BadgePill icon={<PathIcon size={14} />}>
                      {uiLanguage === "fr" ? "Évolution de rôle à moyen terme" : "Mid-term role shift"}
                    </BadgePill>
                  ) : null}

                  {careerGap.role_gap_long_term ? (
                    <BadgePill icon={<LayerIcon size={14} />}>
                      {uiLanguage === "fr" ? "Évolution de rôle à long terme" : "Long-term role shift"}
                    </BadgePill>
                  ) : null}

                  {careerGap.level_gap_mid_term ? (
                    <BadgePill icon={<ChartIcon size={14} />}>
                      {uiLanguage === "fr"
                        ? "Progression de niveau attendue"
                        : "Level progression expected"}
                    </BadgePill>
                  ) : null}

                  {careerGap.level_gap_long_term ? (
                    <BadgePill icon={<ChartIcon size={14} />}>
                      {uiLanguage === "fr"
                        ? "Progression long terme attendue"
                        : "Long-term level progression"}
                    </BadgePill>
                  ) : null}
                </div>
              </CoachSectionCard>
            ) : null}

            {summary ? (
              <div className="grid grid-2">
                <CoachSectionCard>
                  <div className="row" style={{ alignItems: "center", gap: 10 }}>
                    <ChartIcon />
                    <div className="section-title">
                      {uiLanguage === "fr"
                        ? "Progression des recommandations"
                        : "Recommendation progress"}
                    </div>
                  </div>

                  <div className="grid grid-2">
                    {[
                      {
                        label: "Total",
                        value: summary.recommendation_stats.total,
                      },
                      {
                        label: uiLanguage === "fr" ? "Ouvertes" : "Open",
                        value: summary.recommendation_stats.open,
                      },
                      {
                        label: uiLanguage === "fr" ? "En cours" : "In progress",
                        value: summary.recommendation_stats.in_progress,
                      },
                      {
                        label: uiLanguage === "fr" ? "Terminées" : "Completed",
                        value: summary.recommendation_stats.completed,
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="card-soft stack"
                        style={{
                          gap: 6,
                          borderRadius: 20,
                          background: "rgba(255,248,239,0.68)",
                          border: "1px solid rgba(43,33,24,0.08)",
                        }}
                      >
                        <strong>{item.label}</strong>
                        <div
                          style={{
                            fontSize: 26,
                            fontWeight: 900,
                            color: "var(--coach-ink)",
                            letterSpacing: "-0.04em",
                          }}
                        >
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </CoachSectionCard>

                <CoachSectionCard>
                  <div className="row" style={{ alignItems: "center", gap: 10 }}>
                    <BrainIcon />
                    <div className="section-title">
                      {uiLanguage === "fr" ? "Patterns récurrents" : "Recurring patterns"}
                    </div>
                  </div>

                  <div className="stack" style={{ gap: 12 }}>
                    <div>
                      <strong>
                        {uiLanguage === "fr"
                          ? "Problème principal dominant"
                          : "Dominant primary problem"}
                      </strong>

                      <div className="muted" style={{ color: "var(--coach-muted)", marginTop: 4 }}>
                        {summary.problem_trends.top_primary_problem
                          ? prettify(summary.problem_trends.top_primary_problem)
                          : uiLanguage === "fr"
                            ? "Pas encore assez de données"
                            : "Not enough data yet"}
                      </div>
                    </div>

                    <div className="grid grid-2">
                      <div
                        className="card-soft"
                        style={{
                          borderRadius: 20,
                          background: "rgba(255,248,239,0.68)",
                          border: "1px solid rgba(43,33,24,0.08)",
                        }}
                      >
                        <strong>{uiLanguage === "fr" ? "Sévérité moyenne" : "Average severity"}</strong>
                        <div className="muted" style={{ marginTop: 6, color: "var(--coach-muted)" }}>
                          {summary.problem_trends.average_severity || "—"}
                        </div>
                      </div>

                      <div
                        className="card-soft"
                        style={{
                          borderRadius: 20,
                          background: "rgba(255,248,239,0.68)",
                          border: "1px solid rgba(43,33,24,0.08)",
                        }}
                      >
                        <strong>{uiLanguage === "fr" ? "Urgence moyenne" : "Average urgency"}</strong>
                        <div className="muted" style={{ marginTop: 6, color: "var(--coach-muted)" }}>
                          {summary.problem_trends.average_urgency || "—"}
                        </div>
                      </div>
                    </div>
                  </div>
                </CoachSectionCard>
              </div>
            ) : null}
          </>
        )}
      </div>
    </AppShell>
  );
}