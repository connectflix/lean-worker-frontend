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
    .filter((r) => r.status !== "completed" && r.status !== "dismissed")
    .sort((a, b) => {
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 0;
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 0;

      if (bPriority !== aPriority) {
        return bPriority - aPriority;
      }

      const aStarted = a.started_at ? new Date(a.started_at).getTime() : 0;
      const bStarted = b.started_at ? new Date(b.started_at).getTime() : 0;

      return bStarted - aStarted;
    });

  return candidates[0] ?? null;
}

function buildLocalizedTrajectorySummary(
  trajectory: any,
  uiLanguage: "fr" | "en",
): string | null {
  if (!trajectory) return null;

  const rawSummary = trajectory.trajectory_summary?.trim?.() || "";
  const currentPosition = trajectory.current_position?.trim?.() || "";
  const targetPosition = trajectory.target_position?.trim?.() || "";
  const strategicBridge = trajectory.strategic_bridge?.trim?.() || "";

  if (rawSummary && !looksLikeTranslationKey(rawSummary) && !looksLikeTranslationKey(strategicBridge)) {
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
  const [careerBlueprint, setCareerBlueprint] = useState<CareerBlueprintResponse | null>(null);
  const [careerGap, setCareerGap] = useState<CareerGap | null>(null);
  const [trajectory, setTrajectory] = useState<any>(null);
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
      setTrajectory(trajectoryData);
      setRecommendations(recommendationsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard.");
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create session.");
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to close active session.");
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to confirm profile.");
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
      title={uiLanguage === "fr" ? "Tableau de bord" : "Dashboard"}
    >
      {loading ? (
        <div className="card stack">
          <div className="section-title">{copy.dashboard.loading}</div>
          <div className="muted">
            {uiLanguage === "fr"
              ? "Nous préparons ton espace, tes sessions et tes signaux de progression."
              : "We are preparing your workspace, sessions, and progress signals."}
          </div>
        </div>
      ) : error ? (
        <div className="card stack">
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
        </div>
      ) : !hasUsefulDashboardContent ? (
        <div className="card stack">
          <div className="section-title">
            {uiLanguage === "fr"
              ? "Ton espace est prêt, mais encore vide"
              : "Your workspace is ready, but still empty"}
          </div>
          <div className="muted">
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
            <button
              className="button ghost"
              onClick={() => router.push("/career-blueprint")}
            >
              {uiLanguage === "fr" ? "Compléter le blueprint" : "Complete blueprint"}
            </button>
          </div>
        </div>
      ) : (
        <>
          {user?.profile_update_suspected && (
            <div className="card stack">
              <div className="section-title">
                {uiLanguage === "fr"
                  ? "Ton contexte professionnel a peut-être évolué"
                  : "Your professional context may have changed"}
              </div>

              <div className="muted">
                {uiLanguage === "fr"
                  ? "Le coach a détecté un possible changement de rôle, d’industrie ou d’objectif. Mets à jour ton profil pour garder un coaching pertinent."
                  : "The coach detected a possible change in your role, industry, or goals. Update your profile to keep your coaching relevant."}
              </div>

              <div className="row" style={{ flexWrap: "wrap", gap: 10 }}>
                <button
                  className="button"
                  onClick={() => router.push("/profile/update-context")}
                >
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
            </div>
          )}

          {!blueprintCompleted && (
            <div className="card stack">
              <div className="section-title">
                {uiLanguage === "fr"
                  ? "Complète ton Career Blueprint"
                  : "Complete your Career Blueprint"}
              </div>

              <div className="muted">
                {uiLanguage === "fr"
                  ? "Clarifie ton identité, ta vision, tes horizons de carrière et ton point de départ pour rendre ton coaching beaucoup plus précis."
                  : "Clarify your identity, vision, career horizons, and starting point to make your coaching much more precise."}
              </div>

              <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
                <button
                  className="button"
                  onClick={() => router.push("/career-blueprint")}
                >
                  {uiLanguage === "fr" ? "Commencer le blueprint" : "Start blueprint"}
                </button>

                <button
                  className="button ghost"
                  onClick={() => router.push("/career-blueprint")}
                >
                  {uiLanguage === "fr" ? "En savoir plus" : "Learn more"}
                </button>
              </div>
            </div>
          )}

          {blueprintCompleted && (
            <div className="card stack">
              <div className="row space-between" style={{ alignItems: "center" }}>
                <div>
                  <div className="section-title">
                    {uiLanguage === "fr"
                      ? "Career Blueprint actif"
                      : "Career Blueprint active"}
                  </div>
                  <div className="muted">
                    {uiLanguage === "fr"
                      ? "Ton blueprint est enregistré et utilisé par le coach pour personnaliser les échanges."
                      : "Your blueprint is saved and used by the coach to personalize conversations."}
                  </div>
                </div>

                <button
                  className="button ghost"
                  onClick={() => router.push("/career-blueprint")}
                >
                  {uiLanguage === "fr" ? "Mettre à jour" : "Update"}
                </button>
              </div>
            </div>
          )}

          <div
            className="card stack"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(248,250,252,0.95))",
            }}
          >
            <div className="row" style={{ alignItems: "center", gap: 8 }}>
              <ChartIcon />
              <h1 className="title">
                {uiLanguage === "fr"
                  ? `Bonjour ${user?.given_name || user?.display_name || "toi"}`
                  : `Hello ${user?.given_name || user?.display_name || "there"}`}
              </h1>
            </div>

            <p className="subtitle">{copy.dashboard.subtitle}</p>

            <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
              <BadgePill icon={<SparkIcon size={14} />}>
                {uiLanguage === "fr" ? "Espace actif" : "Active workspace"}
              </BadgePill>
              <BadgePill icon={<BrainIcon size={14} />}>
                {uiLanguage === "fr" ? "Mémoire continue" : "Continuous memory"}
              </BadgePill>
              <BadgePill icon={<TargetIcon size={14} />}>
                {uiLanguage === "fr" ? "Trajectoire suivie" : "Trajectory tracking"}
              </BadgePill>
            </div>

            <div className="row" style={{ flexWrap: "wrap" }}>
              <button
                className="button"
                onClick={handleStartSession}
                disabled={starting || forceClosing}
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
              >
                {uiLanguage === "fr"
                  ? "Voir les recommandations"
                  : "View recommendations"}
              </button>

              <button
                className="button ghost"
                onClick={() => router.push("/career-blueprint")}
              >
                {uiLanguage === "fr" ? "Ouvrir le blueprint" : "Open blueprint"}
              </button>
            </div>

            {error && <div style={{ color: "var(--danger)" }}>{error}</div>}
          </div>

          {openSession && (
            <div className="card stack">
              <div className="row" style={{ alignItems: "center", gap: 8 }}>
                <SessionIcon />
                <div className="section-title">
                  {uiLanguage === "fr"
                    ? "Session active détectée"
                    : "Active session detected"}
                </div>
              </div>

              <div className="muted">
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
                >
                  {uiLanguage === "fr" ? "Reprendre la session" : "Resume session"}
                </button>

                <button
                  className="button secondary"
                  onClick={handleForceClose}
                  disabled={forceClosing}
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
            </div>
          )}

          {bestRecommendation ? (
            <BestNextActionCard
              recommendation={bestRecommendation}
              uiLanguage={uiLanguage}
            />
          ) : (
            <div className="card stack">
              <div className="section-title">
                {uiLanguage === "fr"
                  ? "Prochaine meilleure action"
                  : "Best next action"}
              </div>
              <div className="muted">
                {uiLanguage === "fr"
                  ? "Le coach n’a pas encore assez de matière pour proposer une action prioritaire unique. Une ou deux sessions supplémentaires aideront à faire émerger un meilleur next move."
                  : "Your coach does not yet have enough signal to suggest one priority action. One or two more sessions will help surface a stronger next move."}
              </div>
            </div>
          )}

          <div className="grid grid-2">
            <div className="card stack">
              <div className="row" style={{ alignItems: "center", gap: 8 }}>
                <PathIcon />
                <div className="section-title">
                  {uiLanguage === "fr" ? "Trajectoire de carrière" : "Career trajectory"}
                </div>
              </div>
              <div className="muted">
                {localizedTrajectorySummary ||
                  (uiLanguage === "fr"
                    ? "La trajectoire est en cours d’analyse."
                    : "Your trajectory is still being analyzed.")}
              </div>
            </div>

            <div className="card stack">
              <div className="row" style={{ alignItems: "center", gap: 8 }}>
                <ClockIcon />
                <div className="section-title">
                  {uiLanguage === "fr" ? "Chronologie récente" : "Recent timeline"}
                </div>
              </div>

              {timeline.length === 0 ? (
                <div className="muted">
                  {uiLanguage === "fr"
                    ? "Aucune activité récente pour le moment."
                    : "No recent activity yet."}
                </div>
              ) : (
                <div className="stack" style={{ gap: 10 }}>
                  {timeline.slice(0, 4).map((item) => (
                    <div key={`${item.session_id}-${item.started_at}`} className="card-soft">
                      <div className="row space-between" style={{ gap: 8, alignItems: "center" }}>
                        <strong>Session #{item.session_id}</strong>
                        <BadgePill icon={<ClockIcon size={14} />}>
                          {new Date(item.started_at).toLocaleDateString()}
                        </BadgePill>
                      </div>

                      <div className="muted" style={{ marginTop: 8 }}>
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
            </div>
          </div>

          {careerGap && (
            <div className="card stack">
              <div className="row space-between" style={{ alignItems: "center" }}>
                <div className="row" style={{ alignItems: "center", gap: 8 }}>
                  <TargetIcon />
                  <div className="section-title">
                    {uiLanguage === "fr"
                      ? "Analyse des écarts de trajectoire"
                      : "Career gap analysis"}
                  </div>
                </div>

                <button
                  className="button ghost"
                  onClick={() => router.push("/career-blueprint")}
                >
                  {uiLanguage === "fr" ? "Voir le blueprint" : "View blueprint"}
                </button>
              </div>

              {careerGap.key_gap_summary ? (
                <div className="muted">{careerGap.key_gap_summary}</div>
              ) : (
                <div className="muted">
                  {uiLanguage === "fr"
                    ? "Aucun écart marquant détecté pour le moment."
                    : "No major gap detected for now."}
                </div>
              )}

              <div className="grid grid-4">
                <div className="card-soft">
                  <strong>{uiLanguage === "fr" ? "Aujourd’hui" : "Today"}</strong>
                  <div className="muted" style={{ marginTop: 8 }}>
                    {careerGap.current_role ||
                      (uiLanguage === "fr" ? "Rôle non renseigné" : "No current role")}
                  </div>
                </div>

                <div className="card-soft">
                  <strong>{uiLanguage === "fr" ? "Court terme" : "Short term"}</strong>
                  <div className="muted" style={{ marginTop: 8 }}>
                    {careerGap.short_term_role || "—"}
                  </div>
                  <div className="muted">{careerGap.short_term_level || "—"}</div>
                </div>

                <div className="card-soft">
                  <strong>{uiLanguage === "fr" ? "Moyen terme" : "Mid term"}</strong>
                  <div className="muted" style={{ marginTop: 8 }}>
                    {careerGap.mid_term_role || "—"}
                  </div>
                  <div className="muted">{careerGap.mid_term_level || "—"}</div>
                </div>

                <div className="card-soft">
                  <strong>{uiLanguage === "fr" ? "Long terme" : "Long term"}</strong>
                  <div className="muted" style={{ marginTop: 8 }}>
                    {careerGap.long_term_role || "—"}
                  </div>
                  <div className="muted">{careerGap.long_term_level || "—"}</div>
                </div>
              </div>

              <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
                {careerGap.role_gap_short_term && (
                  <BadgePill icon={<TargetIcon size={14} />}>
                    {uiLanguage === "fr"
                      ? "Écart de rôle à court terme"
                      : "Short-term role gap"}
                  </BadgePill>
                )}
                {careerGap.role_gap_mid_term && (
                  <BadgePill icon={<PathIcon size={14} />}>
                    {uiLanguage === "fr"
                      ? "Évolution de rôle à moyen terme"
                      : "Mid-term role shift"}
                  </BadgePill>
                )}
                {careerGap.role_gap_long_term && (
                  <BadgePill icon={<LayerIcon size={14} />}>
                    {uiLanguage === "fr"
                      ? "Évolution de rôle à long terme"
                      : "Long-term role shift"}
                  </BadgePill>
                )}
                {careerGap.level_gap_mid_term && (
                  <BadgePill icon={<ChartIcon size={14} />}>
                    {uiLanguage === "fr"
                      ? "Progression de niveau attendue"
                      : "Level progression expected"}
                  </BadgePill>
                )}
                {careerGap.level_gap_long_term && (
                  <BadgePill icon={<ChartIcon size={14} />}>
                    {uiLanguage === "fr"
                      ? "Progression long terme attendue"
                      : "Long-term level progression"}
                  </BadgePill>
                )}
              </div>
            </div>
          )}

          {summary && (
            <>
              <div className="grid grid-2">
                <div className="card stack">
                  <div className="row" style={{ alignItems: "center", gap: 8 }}>
                    <ChartIcon />
                    <div className="section-title">
                      {uiLanguage === "fr"
                        ? "Progression des recommandations"
                        : "Recommendation progress"}
                    </div>
                  </div>

                  <div className="grid grid-2">
                    <div>
                      <strong>Total</strong>
                      <div className="muted">{summary.recommendation_stats.total}</div>
                    </div>

                    <div>
                      <strong>{uiLanguage === "fr" ? "Ouvertes" : "Open"}</strong>
                      <div className="muted">{summary.recommendation_stats.open}</div>
                    </div>

                    <div>
                      <strong>{uiLanguage === "fr" ? "En cours" : "In progress"}</strong>
                      <div className="muted">{summary.recommendation_stats.in_progress}</div>
                    </div>

                    <div>
                      <strong>{uiLanguage === "fr" ? "Terminées" : "Completed"}</strong>
                      <div className="muted">{summary.recommendation_stats.completed}</div>
                    </div>
                  </div>
                </div>

                <div className="card stack">
                  <div className="row" style={{ alignItems: "center", gap: 8 }}>
                    <BrainIcon />
                    <div className="section-title">
                      {uiLanguage === "fr" ? "Patterns récurrents" : "Recurring patterns"}
                    </div>
                  </div>

                  <div>
                    <strong>
                      {uiLanguage === "fr"
                        ? "Problème principal dominant"
                        : "Dominant primary problem"}
                    </strong>
                    <div className="muted">
                      {summary.problem_trends.top_primary_problem
                        ? prettify(summary.problem_trends.top_primary_problem)
                        : uiLanguage === "fr"
                          ? "Pas encore assez de données"
                          : "Not enough data yet"}
                    </div>
                  </div>

                  <div>
                    <strong>{uiLanguage === "fr" ? "Sévérité moyenne" : "Average severity"}</strong>
                    <div className="muted">
                      {summary.problem_trends.average_severity || "—"}
                    </div>
                  </div>

                  <div>
                    <strong>{uiLanguage === "fr" ? "Urgence moyenne" : "Average urgency"}</strong>
                    <div className="muted">
                      {summary.problem_trends.average_urgency || "—"}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </AppShell>
  );
}