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

const FEED_MAX_WIDTH = 860;
const INITIAL_VISIBLE_COUNT = 8;
const LOAD_MORE_STEP = 6;
const FEED_SCROLL_HEIGHT = "72vh";

type FeedSortMode = "priority" | "open" | "recent";

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
      if (showRefreshing) setRefreshing(true);
      else setLoading(true);

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
    setRecommendations((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
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
    return recommendations.filter((r) => r.priority === "high").length;
  }, [recommendations]);

  const artifactEligibleCount = useMemo(() => {
    return recommendations.filter((r) => r.artifact_generation_available).length;
  }, [recommendations]);

  const openCount = useMemo(() => {
    return recommendations.filter((r) => r.status === "open").length;
  }, [recommendations]);

  const selectedRecommendation = useMemo(() => {
    if (selectedRecommendationId == null) return null;
    return recommendations.find((item) => item.id === selectedRecommendationId) ?? null;
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

    items.sort((a, b) => {
      if (sortMode === "priority") {
        const byPriority = priorityWeight(b) - priorityWeight(a);
        if (byPriority !== 0) return byPriority;

        const byOpen = openWeight(b) - openWeight(a);
        if (byOpen !== 0) return byOpen;

        return recentWeight(b) - recentWeight(a);
      }

      if (sortMode === "open") {
        const byOpen = openWeight(b) - openWeight(a);
        if (byOpen !== 0) return byOpen;

        const byPriority = priorityWeight(b) - priorityWeight(a);
        if (byPriority !== 0) return byPriority;

        return recentWeight(b) - recentWeight(a);
      }

      return recentWeight(b) - recentWeight(a);
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
      <main className="page">
        <div className="page-wrap">
          <div className="card">{copy.common.loading}</div>
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
          <div
            className="card"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,250,252,0.98))",
            }}
          >
            <div
              className="row space-between"
              style={{ gap: 12, alignItems: "center", flexWrap: "wrap" }}
            >
              <div className="stack" style={{ gap: 4 }}>
                <div className="section-title">
                  {uiLanguage === "fr"
                    ? "Mode focus — recommandation ouverte"
                    : "Focus mode — opened recommendation"}
                </div>
                <div className="muted">
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
          </div>

          {refreshing ? (
            <div className="card-soft">
              <div className="muted">
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
          gap: 16,
          maxWidth: FEED_MAX_WIDTH,
          margin: "0 auto",
          width: "100%",
        }}
      >
        <div
          className="card stack"
          style={{
            gap: 16,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(248,250,252,0.95))",
          }}
        >
          <div className="row" style={{ gap: 8, alignItems: "center" }}>
            <TargetIcon />
            <h1 className="title">
              {uiLanguage === "fr"
                ? "Les actions qui peuvent faire bouger ta trajectoire"
                : "The actions that can move your trajectory forward"}
            </h1>
          </div>

          <p className="subtitle">
            {uiLanguage === "fr"
              ? "Ces recommandations ne sont pas de simples idées. Elles représentent les actions les plus pertinentes à engager maintenant pour débloquer ta progression."
              : "These recommendations are not just ideas. They represent the most relevant actions to engage now to unlock your progress."}
          </p>

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
            <div className="card-soft stack" style={{ gap: 6 }}>
              <div className="muted">
                {uiLanguage === "fr" ? "Actions ouvertes" : "Open actions"}
              </div>
              <div className="section-title">{openCount}</div>
            </div>

            <div className="card-soft stack" style={{ gap: 6 }}>
              <div className="muted">
                {uiLanguage === "fr" ? "Priorité élevée" : "High priority"}
              </div>
              <div className="section-title">{priorityCount}</div>
            </div>

            <div className="card-soft stack" style={{ gap: 6 }}>
              <div className="muted">
                {uiLanguage === "fr" ? "Guides IA disponibles" : "AI guides available"}
              </div>
              <div className="section-title">{artifactEligibleCount}</div>
            </div>
          </div>

          <div className="card-soft stack" style={{ gap: 8 }}>
            <div className="section-title">
              {uiLanguage === "fr" ? "Pourquoi agir maintenant" : "Why act now"}
            </div>

            <div className="muted">
              {uiLanguage === "fr"
                ? "Plus une recommandation pertinente reste inactive, plus le coût caché augmente : stagnation, occasions manquées, manque de clarté ou progression plus lente que nécessaire."
                : "The longer a relevant recommendation stays inactive, the more the hidden cost grows: stagnation, missed opportunities, lack of clarity, or slower progress than necessary."}
            </div>
          </div>

          <div className="card-soft stack" style={{ gap: 8 }}>
            <div className="section-title">
              {uiLanguage === "fr" ? "Ce que tu peux débloquer" : "What you can unlock"}
            </div>

            <div className="muted">
              {uiLanguage === "fr"
                ? "Certaines recommandations peuvent inclure un guide IA personnalisé, sous forme de mini e-book ou mini audiobook, pour te montrer exactement quoi faire et dans quel ordre."
                : "Some recommendations can include a personalized AI guide, as a mini e-book or mini audiobook, to show you exactly what to do and in what order."}
            </div>
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
                >
                  {uiLanguage === "fr" ? "Mode focus" : "Focus mode"}
                </button>

                <button
                  className="button secondary"
                  onClick={closeRecommendation}
                  type="button"
                >
                  {uiLanguage === "fr" ? "Retour à la liste" : "Back to list"}
                </button>
              </>
            ) : null}
          </div>
        </div>

        {loading ? (
          <div className="card stack">
            <div className="section-title">
              {uiLanguage === "fr" ? "Chargement des recommandations" : "Loading recommendations"}
            </div>
            <div className="muted">
              {uiLanguage === "fr"
                ? "Le coach rassemble tes actions prioritaires."
                : "Your coach is gathering your priority actions."}
            </div>
          </div>
        ) : error ? (
          <div className="card stack">
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
          </div>
        ) : recommendations.length === 0 ? (
          <div className="card stack">
            <div className="section-title">
              {uiLanguage === "fr"
                ? "Aucune recommandation pour le moment"
                : "No recommendations yet"}
            </div>
            <div className="muted">
              {uiLanguage === "fr"
                ? "Le coach analysera tes sessions à mesure que ta trajectoire se clarifie. Lance une session pour faire émerger des actions vraiment utiles."
                : "Your coach will analyze your sessions as your trajectory becomes clearer. Start a session to surface truly useful actions."}
            </div>
            <div className="row" style={{ flexWrap: "wrap", gap: 10 }}>
              <button className="button" onClick={() => router.push("/dashboard")}>
                {uiLanguage === "fr" ? "Démarrer une session" : "Start a session"}
              </button>
            </div>
          </div>
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
              <div className="card-soft">
                <div className="muted">
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
                <div className="card-soft stack" style={{ gap: 8 }}>
                  <div className="section-title">
                    {uiLanguage === "fr"
                      ? "Recommandation ouverte"
                      : "Opened recommendation"}
                  </div>
                  <div className="muted">
                    {uiLanguage === "fr"
                      ? "Tu consultes maintenant cette recommandation seule, avec ses actions, ses offres et ses leviers de passage à l’action."
                      : "You are now viewing this recommendation on its own, with its actions, offers, and execution support."}
                  </div>
                </div>

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
                    gap: 8,
                    position: "sticky",
                    top: 12,
                    zIndex: 2,
                    backdropFilter: "blur(10px)",
                    background: "rgba(248, 250, 252, 0.92)",
                  }}
                >
                  <div className="section-title">
                    {uiLanguage === "fr"
                      ? "Choisis la prochaine action la plus utile"
                      : "Choose the next most useful action"}
                  </div>
                  <div className="muted">
                    {uiLanguage === "fr"
                      ? `Tu as actuellement ${totalCount} recommandation${totalCount > 1 ? "s" : ""}. Parcours-les comme un fil d’actions, en commençant par celles qui portent le plus de tension, de blocage ou de potentiel immédiat.`
                      : `You currently have ${totalCount} recommendation${totalCount > 1 ? "s" : ""}. Browse them as an action feed, starting with the ones carrying the most tension, blockage, or immediate potential.`}
                  </div>
                  <div className="muted">
                    {uiLanguage === "fr"
                      ? `${visibleRecommendations.length} affichée${visibleRecommendations.length > 1 ? "s" : ""} sur ${totalCount}`
                      : `${visibleRecommendations.length} shown out of ${totalCount}`}
                  </div>
                </div>

                <div className="card-soft stack" style={{ gap: 10 }}>
                  <div className="section-title">
                    {uiLanguage === "fr" ? "Trier le fil" : "Sort the feed"}
                  </div>

                  <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
                    <button
                      className={sortMode === "priority" ? "button" : "button ghost"}
                      onClick={() => setSortMode("priority")}
                      type="button"
                    >
                      {getSortLabel("priority")}
                    </button>

                    <button
                      className={sortMode === "open" ? "button" : "button ghost"}
                      onClick={() => setSortMode("open")}
                      type="button"
                    >
                      {getSortLabel("open")}
                    </button>

                    <button
                      className={sortMode === "recent" ? "button" : "button ghost"}
                      onClick={() => setSortMode("recent")}
                      type="button"
                    >
                      {getSortLabel("recent")}
                    </button>
                  </div>

                  <div className="muted">{getSortHelperText()}</div>
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
                  {visibleRecommendations.map((rec, index) => (
                    <div
                      key={rec.id}
                      style={{
                        width: "100%",
                        animation: `fadeInUp 180ms ease ${Math.min(index * 20, 180)}ms both`,
                      }}
                    >
                      <RecommendationSummaryCard
                        item={rec}
                        uiLanguage={uiLanguage}
                        onOpen={() => openRecommendation(rec.id)}
                      />
                    </div>
                  ))}
                </div>

                {hasMoreRecommendations ? (
                  <div className="card-soft row space-between" style={{ gap: 12, flexWrap: "wrap" }}>
                    <div className="muted">
                      {uiLanguage === "fr"
                        ? `Il reste ${sortedRecommendations.length - visibleCount} recommandation${sortedRecommendations.length - visibleCount > 1 ? "s" : ""} à afficher.`
                        : `${sortedRecommendations.length - visibleCount} recommendation${sortedRecommendations.length - visibleCount > 1 ? "s" : ""} left to show.`}
                    </div>

                    <button
                      className="button"
                      onClick={handleLoadMore}
                      type="button"
                    >
                      {uiLanguage === "fr" ? "Voir plus" : "Load more"}
                    </button>
                  </div>
                ) : (
                  <div className="card-soft">
                    <div className="muted">
                      {uiLanguage === "fr"
                        ? "Toutes les recommandations actuellement chargées sont visibles."
                        : "All currently loaded recommendations are visible."}
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