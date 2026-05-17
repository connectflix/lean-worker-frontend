"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthGuard } from "@/components/auth-guard";
import { AppShell } from "@/components/app-shell";
import { RecommendationCard } from "@/components/recommendation-card";
import { RecommendationSummaryCard } from "@/components/recommendation-summary-card";
import {
  BadgePill,
  CheckCircleIcon,
  ClockIcon,
  SparkIcon,
  TargetIcon,
} from "@/components/ui-flat-icons";
import { getRecommendations } from "@/lib/api";
import { getUiCopy } from "@/lib/ui-copy";
import { useUiLanguage } from "@/lib/use-ui-language";
import type { Recommendation } from "@/lib/types";

const FEED_MAX_WIDTH = 920;
const INITIAL_VISIBLE_COUNT = 8;
const LOAD_MORE_STEP = 6;
const FEED_SCROLL_HEIGHT = "72vh";

type FeedSortMode = "priority" | "open" | "recent";

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
          ? "linear-gradient(135deg, rgba(255,241,220,0.94), rgba(255,255,255,0.90))"
          : "rgba(255,255,255,0.78)",
        boxShadow: "0 18px 48px rgba(43,33,24,0.06)",
      }}
    >
      {children}
    </div>
  );
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
  tone?: "warm" | "calm" | "neutral";
}) {
  const toneStyle =
    tone === "calm"
      ? {
          background: "rgba(88,180,174,0.12)",
          border: "1px solid rgba(88,180,174,0.20)",
          color: "var(--coach-calm)",
        }
      : tone === "neutral"
        ? {
            background: "rgba(43,33,24,0.05)",
            border: "1px solid rgba(43,33,24,0.10)",
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
        borderRadius: 24,
        background: "rgba(255,255,255,0.68)",
        border: "1px solid rgba(43,33,24,0.08)",
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

export default function RecommendationsPage() {
  return (
    <AuthGuard>
      <RecommendationsContent />
    </AuthGuard>
  );
}

function RecommendationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { uiLanguage, loadingLanguage } = useUiLanguage("en");
  const copy = getUiCopy(uiLanguage);

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [selectedRecommendationId, setSelectedRecommendationId] = useState<number | null>(null);
  const [focusMode, setFocusMode] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const [sortMode, setSortMode] = useState<FeedSortMode>("priority");

  async function loadRecommendations(showRefreshing = false) {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      const data = await getRecommendations();
      setRecommendations(data);

      setSelectedRecommendationId((currentId) => {
        if (currentId == null) return null;
        return data.some((item) => item.id === currentId) ? currentId : null;
      });

      setVisibleCount((current) => {
        if (data.length <= INITIAL_VISIBLE_COUNT) {
          return data.length;
        }

        return Math.min(Math.max(current, INITIAL_VISIBLE_COUNT), data.length);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load recommendations");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void loadRecommendations();
  }, []);

  useEffect(() => {
    const openId = searchParams.get("open");
    const focusParam = searchParams.get("focus");

    if (!openId) {
      setSelectedRecommendationId(null);
      setFocusMode(false);
      return;
    }

    const parsedId = Number(openId);

    if (Number.isFinite(parsedId)) {
      setSelectedRecommendationId(parsedId);
    }

    setFocusMode(focusParam === "1");
  }, [searchParams]);

  async function handleRecommendationChanged(updated: Recommendation) {
    setRecommendations((prev) =>
      prev.map((recommendation) =>
        recommendation.id === updated.id ? updated : recommendation,
      ),
    );

    await loadRecommendations(true);
  }

  function openRecommendation(id: number) {
    setIsTransitioning(true);

    window.setTimeout(() => {
      setSelectedRecommendationId(id);
      setFocusMode(false);
      router.push(`/recommendations?open=${id}`, { scroll: false });
      setIsTransitioning(false);
    }, 150);
  }

  function closeRecommendation() {
    setIsTransitioning(true);

    window.setTimeout(() => {
      setSelectedRecommendationId(null);
      setFocusMode(false);
      router.push("/recommendations", { scroll: false });
      setIsTransitioning(false);
    }, 150);
  }

  function enableFocusMode() {
    if (!selectedRecommendationId) return;

    setFocusMode(true);
    router.push(`/recommendations?open=${selectedRecommendationId}&focus=1`, {
      scroll: false,
    });
  }

  function disableFocusMode() {
    if (!selectedRecommendationId) return;

    setFocusMode(false);
    router.push(`/recommendations?open=${selectedRecommendationId}`, {
      scroll: false,
    });
  }

  function handleLoadMore() {
    setVisibleCount((current) =>
      Math.min(current + LOAD_MORE_STEP, recommendations.length),
    );
  }

  const totalCount = recommendations.length;

  const priorityCount = useMemo(() => {
    return recommendations.filter((recommendation) => recommendation.priority === "high")
      .length;
  }, [recommendations]);

  const artifactEligibleCount = useMemo(() => {
    return recommendations.filter((recommendation) => {
      return recommendation.artifact_generation_available;
    }).length;
  }, [recommendations]);

  const openCount = useMemo(() => {
    return recommendations.filter((recommendation) => recommendation.status === "open")
      .length;
  }, [recommendations]);

  const activeCount = useMemo(() => {
    return recommendations.filter((recommendation) => {
      return (
        recommendation.status !== "completed" &&
        recommendation.status !== "dismissed"
      );
    }).length;
  }, [recommendations]);

  const selectedRecommendation = useMemo(() => {
    if (selectedRecommendationId == null) return null;

    return (
      recommendations.find((recommendation) => {
        return recommendation.id === selectedRecommendationId;
      }) ?? null
    );
  }, [recommendations, selectedRecommendationId]);

  const sortedRecommendations = useMemo(() => {
    const items = [...recommendations];

    const priorityWeight = (item: Recommendation) => {
      if (item.priority === "high") return 2;
      if (item.priority === "medium") return 1;
      return 0;
    };

    const openWeight = (item: Recommendation) => (item.status === "open" ? 1 : 0);
    const recentWeight = (item: Recommendation) => item.id ?? 0;

    items.sort((left, right) => {
      if (sortMode === "priority") {
        const byPriority = priorityWeight(right) - priorityWeight(left);
        if (byPriority !== 0) return byPriority;

        const byOpen = openWeight(right) - openWeight(left);
        if (byOpen !== 0) return byOpen;

        return recentWeight(right) - recentWeight(left);
      }

      if (sortMode === "open") {
        const byOpen = openWeight(right) - openWeight(left);
        if (byOpen !== 0) return byOpen;

        const byPriority = priorityWeight(right) - priorityWeight(left);
        if (byPriority !== 0) return byPriority;

        return recentWeight(right) - recentWeight(left);
      }

      return recentWeight(right) - recentWeight(left);
    });

    return items;
  }, [recommendations, sortMode]);

  const visibleRecommendations = useMemo(() => {
    return sortedRecommendations.slice(0, visibleCount);
  }, [sortedRecommendations, visibleCount]);

  const hasMoreRecommendations = visibleCount < sortedRecommendations.length;

  function getSortLabel(mode: FeedSortMode) {
    if (uiLanguage === "fr") {
      if (mode === "priority") return "Priorité";
      if (mode === "open") return "Ouvertes";
      return "Récentes";
    }

    if (mode === "priority") return "Priority";
    if (mode === "open") return "Open";
    return "Recent";
  }

  function getSortHelperText() {
    if (uiLanguage === "fr") {
      if (sortMode === "priority") {
        return "Les recommandations à plus fort impact apparaissent d’abord.";
      }

      if (sortMode === "open") {
        return "Les recommandations encore actives apparaissent en premier.";
      }

      return "Les recommandations les plus récentes apparaissent en premier.";
    }

    if (sortMode === "priority") {
      return "Higher-impact recommendations appear first.";
    }

    if (sortMode === "open") {
      return "Still-active recommendations appear first.";
    }

    return "Most recent recommendations appear first.";
  }

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

  if (focusMode && selectedRecommendation) {
    return (
      <AppShell
        uiLanguage={uiLanguage}
        title={uiLanguage === "fr" ? "Recommandation" : "Recommendation"}
      >
        <div
          className="stack"
          style={{
            gap: 16,
            maxWidth: 1120,
            margin: "0 auto",
            width: "100%",
            opacity: isTransitioning ? 0 : 1,
            transform: isTransitioning ? "translateY(8px)" : "translateY(0)",
            transition: "opacity 150ms ease, transform 150ms ease",
          }}
        >
          <CoachSectionCard warm>
            <div
              className="row space-between"
              style={{
                gap: 14,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <div className="stack" style={{ gap: 6, maxWidth: 720 }}>
                <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                  <span
                    className="badge"
                    style={{
                      background: "rgba(255,122,89,0.12)",
                      borderColor: "rgba(255,122,89,0.22)",
                      color: "var(--coach-accent)",
                      fontWeight: 850,
                    }}
                  >
                    <SparkIcon size={14} />
                    {uiLanguage === "fr" ? "Mode focus" : "Focus mode"}
                  </span>

                  <span
                    className="badge"
                    style={{
                      background: "rgba(88,180,174,0.12)",
                      borderColor: "rgba(88,180,174,0.22)",
                      color: "var(--coach-calm)",
                      fontWeight: 850,
                    }}
                  >
                    <TargetIcon size={14} />
                    {uiLanguage === "fr" ? "Exécution" : "Execution"}
                  </span>
                </div>

                <div
                  style={{
                    fontSize: 30,
                    lineHeight: 1.12,
                    fontWeight: 950,
                    letterSpacing: "-0.055em",
                    color: "var(--coach-ink)",
                  }}
                >
                  {uiLanguage === "fr"
                    ? "Une action, un espace clair, un prochain pas."
                    : "One action, one clear space, one next step."}
                </div>

                <div
                  className="muted"
                  style={{
                    color: "var(--coach-muted)",
                    lineHeight: 1.7,
                  }}
                >
                  {uiLanguage === "fr"
                    ? "Tu consultes cette recommandation dans un espace épuré, centré uniquement sur l’exécution."
                    : "You are viewing this recommendation in a simplified space focused only on execution."}
                </div>
              </div>

              <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
                <button
                  className="button secondary"
                  onClick={disableFocusMode}
                  type="button"
                  style={{
                    color: "var(--coach-accent)",
                    borderColor: "rgba(255,122,89,0.28)",
                  }}
                >
                  {uiLanguage === "fr" ? "Quitter le focus" : "Exit focus mode"}
                </button>

                <button
                  className="button ghost"
                  onClick={closeRecommendation}
                  type="button"
                >
                  {uiLanguage === "fr" ? "Retour à la liste" : "Back to list"}
                </button>
              </div>
            </div>
          </CoachSectionCard>

          {refreshing ? (
            <div
              className="card-soft"
              style={{
                borderRadius: 22,
                background: "rgba(255,255,255,0.72)",
                border: "1px solid rgba(43,33,24,0.08)",
              }}
            >
              <div className="muted" style={{ color: "var(--coach-muted)" }}>
                {uiLanguage === "fr"
                  ? "Actualisation de la recommandation..."
                  : "Refreshing recommendation..."}
              </div>
            </div>
          ) : null}

          <RecommendationCard
            item={selectedRecommendation}
            onUpdated={handleRecommendationChanged}
            uiLanguage={uiLanguage}
            focusMode
          />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      uiLanguage={uiLanguage}
      title={uiLanguage === "fr" ? "Recommandations" : "Recommendations"}
    >
      <div
        className="stack"
        style={{
          gap: 18,
          maxWidth: FEED_MAX_WIDTH,
          margin: "0 auto",
          width: "100%",
        }}
      >
        <div
          className="card stack"
          style={{
            gap: 18,
            position: "relative",
            overflow: "hidden",
            borderRadius: 32,
            border: "1px solid rgba(43,33,24,0.08)",
            background:
              "linear-gradient(135deg, rgba(255,241,220,0.96), rgba(255,255,255,0.92) 54%, rgba(232,248,246,0.88))",
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
              gap: 18,
              position: "relative",
              zIndex: 1,
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
                <SparkIcon size={14} />
                {uiLanguage === "fr" ? "Fil d’actions" : "Action feed"}
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
                <TargetIcon size={14} />
                {uiLanguage === "fr" ? "Priorisé par le coach" : "Coach-prioritized"}
              </span>
            </div>

            <div
              className="row"
              style={{
                gap: 12,
                alignItems: "flex-start",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 18,
                  display: "grid",
                  placeItems: "center",
                  background: "rgba(255,122,89,0.12)",
                  border: "1px solid rgba(255,122,89,0.22)",
                  color: "var(--coach-accent)",
                  flexShrink: 0,
                }}
              >
                <TargetIcon size={22} />
              </div>

              <div className="stack" style={{ gap: 10, flex: 1, minWidth: 0 }}>
                <h1
                  style={{
                    margin: 0,
                    maxWidth: 860,
                    fontSize: 42,
                    lineHeight: 1.04,
                    fontWeight: 950,
                    letterSpacing: "-0.07em",
                    color: "var(--coach-ink)",
                  }}
                >
                  {uiLanguage === "fr"
                    ? "Les actions qui peuvent faire bouger ta trajectoire."
                    : "The actions that can move your trajectory forward."}
                </h1>

                <p
                  className="subtitle"
                  style={{
                    maxWidth: 760,
                    color: "var(--coach-muted)",
                    fontSize: 16,
                    lineHeight: 1.7,
                  }}
                >
                  {uiLanguage === "fr"
                    ? "Ces recommandations ne sont pas de simples idées. Elles représentent les actions les plus pertinentes à engager maintenant pour débloquer ta progression."
                    : "These recommendations are not just ideas. They represent the most relevant actions to engage now to unlock your progress."}
                </p>
              </div>
            </div>

            <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
              <BadgePill icon={<SparkIcon size={14} />}>
                {uiLanguage === "fr"
                  ? "Actions personnalisées par ton coach"
                  : "Coach-personalized actions"}
              </BadgePill>

              <BadgePill icon={<TargetIcon size={14} />}>
                {uiLanguage === "fr" ? "Priorisées pour toi" : "Prioritized for you"}
              </BadgePill>

              <BadgePill icon={<CheckCircleIcon size={14} />}>
                {uiLanguage === "fr"
                  ? "Pensées pour passer à l’action"
                  : "Designed for action"}
              </BadgePill>
            </div>

            <div className="grid grid-3">
              <CoachMetricCard
                label={uiLanguage === "fr" ? "Actions ouvertes" : "Open actions"}
                value={openCount}
                helper={
                  uiLanguage === "fr"
                    ? "À lire, démarrer ou poursuivre."
                    : "Ready to read, start, or continue."
                }
                icon={<TargetIcon size={18} />}
                tone="warm"
              />

              <CoachMetricCard
                label={uiLanguage === "fr" ? "Priorité élevée" : "High priority"}
                value={priorityCount}
                helper={
                  uiLanguage === "fr"
                    ? "À fort potentiel d’impact."
                    : "Higher potential impact."
                }
                icon={<SparkIcon size={18} />}
                tone="calm"
              />

              <CoachMetricCard
                label={uiLanguage === "fr" ? "Guides IA disponibles" : "AI guides available"}
                value={artifactEligibleCount}
                helper={
                  uiLanguage === "fr"
                    ? "Mini e-books ou audiobooks personnalisés."
                    : "Personalized mini e-books or audiobooks."
                }
                icon={<CheckCircleIcon size={18} />}
                tone="neutral"
              />
            </div>

            <div className="row" style={{ flexWrap: "wrap", gap: 10 }}>
              <button
                className="button ghost"
                onClick={() => void loadRecommendations(true)}
                disabled={loading || refreshing}
                type="button"
              >
                <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                  <ClockIcon size={14} />
                  {refreshing
                    ? uiLanguage === "fr"
                      ? "Actualisation..."
                      : "Refreshing..."
                    : uiLanguage === "fr"
                      ? "Actualiser"
                      : "Refresh"}
                </span>
              </button>

              {selectedRecommendation ? (
                <>
                  <button
                    className="button secondary"
                    onClick={enableFocusMode}
                    type="button"
                    style={{
                      color: "var(--coach-accent)",
                      borderColor: "rgba(255,122,89,0.28)",
                    }}
                  >
                    {uiLanguage === "fr" ? "Mode focus" : "Focus mode"}
                  </button>

                  <button
                    className="button secondary"
                    onClick={closeRecommendation}
                    type="button"
                    style={{
                      color: "var(--coach-accent)",
                      borderColor: "rgba(255,122,89,0.28)",
                    }}
                  >
                    {uiLanguage === "fr" ? "Retour à la liste" : "Back to list"}
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </div>

        {loading ? (
          <CoachSectionCard warm>
            <div className="section-title">
              {uiLanguage === "fr" ? "Chargement des recommandations" : "Loading recommendations"}
            </div>

            <div className="muted" style={{ color: "var(--coach-muted)" }}>
              {uiLanguage === "fr"
                ? "Le coach rassemble tes actions prioritaires."
                : "Your coach is gathering your priority actions."}
            </div>
          </CoachSectionCard>
        ) : error ? (
          <CoachSectionCard>
            <div className="section-title" style={{ color: "var(--danger)" }}>
              {uiLanguage === "fr"
                ? "Impossible de charger les recommandations"
                : "Unable to load recommendations"}
            </div>

            <div className="muted">{error}</div>

            <div className="row" style={{ flexWrap: "wrap", gap: 10 }}>
              <button className="button" onClick={() => void loadRecommendations()}>
                {uiLanguage === "fr" ? "Réessayer" : "Try again"}
              </button>

              <button className="button ghost" onClick={() => router.push("/dashboard")}>
                {uiLanguage === "fr" ? "Retour au tableau de bord" : "Back to dashboard"}
              </button>
            </div>
          </CoachSectionCard>
        ) : recommendations.length === 0 ? (
          <CoachSectionCard warm>
            <div
              style={{
                fontSize: 32,
                lineHeight: 1.1,
                fontWeight: 950,
                letterSpacing: "-0.055em",
                color: "var(--coach-ink)",
              }}
            >
              {uiLanguage === "fr"
                ? "Aucune recommandation pour le moment"
                : "No recommendations yet"}
            </div>

            <div className="muted" style={{ color: "var(--coach-muted)", lineHeight: 1.7 }}>
              {uiLanguage === "fr"
                ? "Le coach analysera tes sessions à mesure que ta trajectoire se clarifie. Lance une session pour faire émerger des actions vraiment utiles."
                : "Your coach will analyze your sessions as your trajectory becomes clearer. Start a session to surface truly useful actions."}
            </div>

            <div className="row" style={{ flexWrap: "wrap", gap: 10 }}>
              <button className="button" onClick={() => router.push("/dashboard")}>
                {uiLanguage === "fr" ? "Démarrer une session" : "Start a session"}
              </button>
            </div>
          </CoachSectionCard>
        ) : (
          <div
            className="stack"
            style={{
              gap: 16,
              opacity: isTransitioning ? 0 : 1,
              transform: isTransitioning ? "translateY(8px)" : "translateY(0)",
              transition: "opacity 150ms ease, transform 150ms ease",
            }}
          >
            {refreshing ? (
              <div
                className="card-soft"
                style={{
                  borderRadius: 22,
                  background: "rgba(255,255,255,0.72)",
                  border: "1px solid rgba(43,33,24,0.08)",
                }}
              >
                <div className="muted" style={{ color: "var(--coach-muted)" }}>
                  {selectedRecommendation
                    ? uiLanguage === "fr"
                      ? "Actualisation de la recommandation..."
                      : "Refreshing recommendation..."
                    : uiLanguage === "fr"
                      ? "Actualisation des recommandations..."
                      : "Refreshing recommendations..."}
                </div>
              </div>
            ) : null}

            {selectedRecommendation ? (
              <>
                <CoachSectionCard>
                  <div className="row space-between" style={{ gap: 12, flexWrap: "wrap" }}>
                    <div className="stack" style={{ gap: 6, maxWidth: 680 }}>
                      <div className="section-title">
                        {uiLanguage === "fr"
                          ? "Recommandation ouverte"
                          : "Opened recommendation"}
                      </div>

                      <div className="muted" style={{ color: "var(--coach-muted)" }}>
                        {uiLanguage === "fr"
                          ? "Tu consultes maintenant cette recommandation seule, avec ses actions, ses offres et ses leviers de passage à l’action."
                          : "You are now viewing this recommendation on its own, with its actions, offers, and execution support."}
                      </div>
                    </div>

                    <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
                      <button
                        className="button secondary"
                        onClick={enableFocusMode}
                        type="button"
                        style={{
                          color: "var(--coach-accent)",
                          borderColor: "rgba(255,122,89,0.28)",
                        }}
                      >
                        {uiLanguage === "fr" ? "Mode focus" : "Focus mode"}
                      </button>

                      <button
                        className="button ghost"
                        onClick={closeRecommendation}
                        type="button"
                      >
                        {uiLanguage === "fr" ? "Retour à la liste" : "Back to list"}
                      </button>
                    </div>
                  </div>
                </CoachSectionCard>

                <RecommendationCard
                  item={selectedRecommendation}
                  onUpdated={handleRecommendationChanged}
                  uiLanguage={uiLanguage}
                />
              </>
            ) : (
              <>
                <div
                  className="card-soft stack"
                  style={{
                    gap: 10,
                    position: "sticky",
                    top: 12,
                    zIndex: 2,
                    backdropFilter: "blur(14px)",
                    borderRadius: 26,
                    background: "rgba(255,248,239,0.92)",
                    border: "1px solid rgba(43,33,24,0.08)",
                    boxShadow: "0 16px 40px rgba(43,33,24,0.06)",
                  }}
                >
                  <div className="row space-between" style={{ gap: 12, flexWrap: "wrap" }}>
                    <div className="stack" style={{ gap: 6, maxWidth: 620 }}>
                      <div className="section-title">
                        {uiLanguage === "fr"
                          ? "Choisis la prochaine action la plus utile"
                          : "Choose the next most useful action"}
                      </div>

                      <div className="muted" style={{ color: "var(--coach-muted)" }}>
                        {uiLanguage === "fr"
                          ? `Tu as actuellement ${totalCount} recommandation${totalCount > 1 ? "s" : ""}. Parcours-les comme un fil d’actions, en commençant par celles qui portent le plus de tension, de blocage ou de potentiel immédiat.`
                          : `You currently have ${totalCount} recommendation${totalCount > 1 ? "s" : ""}. Browse them as an action feed, starting with the ones carrying the most tension, blockage, or immediate potential.`}
                      </div>
                    </div>

                    <div
                      style={{
                        borderRadius: 999,
                        padding: "9px 13px",
                        background: "rgba(255,122,89,0.11)",
                        border: "1px solid rgba(255,122,89,0.20)",
                        color: "var(--coach-accent)",
                        fontSize: 13,
                        fontWeight: 850,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {uiLanguage === "fr"
                        ? `${visibleRecommendations.length} / ${totalCount} visibles`
                        : `${visibleRecommendations.length} / ${totalCount} visible`}
                    </div>
                  </div>
                </div>

                <div
                  className="card-soft stack"
                  style={{
                    gap: 12,
                    borderRadius: 26,
                    background: "rgba(255,255,255,0.72)",
                    border: "1px solid rgba(43,33,24,0.08)",
                  }}
                >
                  <div className="row space-between" style={{ gap: 12, flexWrap: "wrap" }}>
                    <div className="stack" style={{ gap: 4 }}>
                      <div className="section-title">
                        {uiLanguage === "fr" ? "Trier le fil" : "Sort the feed"}
                      </div>

                      <div className="muted" style={{ color: "var(--coach-muted)" }}>
                        {getSortHelperText()}
                      </div>
                    </div>

                    <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
                      {(["priority", "open", "recent"] as FeedSortMode[]).map((mode) => (
                        <button
                          key={mode}
                          className={sortMode === mode ? "button" : "button ghost"}
                          onClick={() => setSortMode(mode)}
                          type="button"
                          style={
                            sortMode === mode
                              ? {
                                  background: "var(--coach-accent)",
                                  borderColor: "var(--coach-accent)",
                                }
                              : undefined
                          }
                        >
                          {getSortLabel(mode)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div
                  className="stack"
                  style={{
                    gap: 14,
                    width: "100%",
                    maxHeight: FEED_SCROLL_HEIGHT,
                    overflowY: "auto",
                    paddingRight: 6,
                    scrollBehavior: "smooth",
                  }}
                >
                  {visibleRecommendations.map((recommendation, index) => (
                    <div
                      key={recommendation.id}
                      style={{
                        width: "100%",
                        animation: `fadeInUp 180ms ease ${Math.min(index * 20, 180)}ms both`,
                      }}
                    >
                      <RecommendationSummaryCard
                        item={recommendation}
                        uiLanguage={uiLanguage}
                        onOpen={() => openRecommendation(recommendation.id)}
                      />
                    </div>
                  ))}
                </div>

                {hasMoreRecommendations ? (
                  <div
                    className="card-soft row space-between"
                    style={{
                      gap: 12,
                      flexWrap: "wrap",
                      borderRadius: 24,
                      background: "rgba(255,248,239,0.74)",
                      border: "1px solid rgba(43,33,24,0.08)",
                    }}
                  >
                    <div className="muted" style={{ color: "var(--coach-muted)" }}>
                      {uiLanguage === "fr"
                        ? `Il reste ${sortedRecommendations.length - visibleCount} recommandation${
                            sortedRecommendations.length - visibleCount > 1 ? "s" : ""
                          } à afficher.`
                        : `${sortedRecommendations.length - visibleCount} recommendation${
                            sortedRecommendations.length - visibleCount > 1 ? "s" : ""
                          } left to show.`}
                    </div>

                    <button
                      className="button"
                      onClick={handleLoadMore}
                      type="button"
                      style={{
                        background: "var(--coach-accent)",
                      }}
                    >
                      {uiLanguage === "fr" ? "Voir plus" : "Load more"}
                    </button>
                  </div>
                ) : (
                  <div
                    className="card-soft"
                    style={{
                      borderRadius: 24,
                      background: "rgba(255,248,239,0.74)",
                      border: "1px solid rgba(43,33,24,0.08)",
                    }}
                  >
                    <div className="muted" style={{ color: "var(--coach-muted)" }}>
                      {uiLanguage === "fr"
                        ? `Toutes les ${activeCount} action${activeCount > 1 ? "s" : ""} active${activeCount > 1 ? "s" : ""} actuellement chargées sont visibles.`
                        : `All ${activeCount} currently active action${activeCount > 1 ? "s" : ""} are visible.`}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}