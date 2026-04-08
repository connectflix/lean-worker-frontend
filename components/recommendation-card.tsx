"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getMyAIArtifacts, updateRecommendation } from "@/lib/api";
import type {
  AIArtifactStatusResponse,
  OfferItemResponse,
  Recommendation,
} from "@/lib/types";
import type { SupportedUiLanguage } from "@/lib/user-locales";
import {
  ArrowRightIcon,
  BadgePill,
  CheckCircleIcon,
  SparkIcon,
  TargetIcon,
} from "@/components/ui-flat-icons";
import { ActionNavigator } from "@/components/offers/ActionNavigator";
import { ActionStepNavigator } from "@/components/recommendation/ActionStepNavigator";

type RecommendationArtifactStatus = AIArtifactStatusResponse & {
  recommendation_id?: number;
};

function getPriorityLabel(priority: string, uiLanguage: SupportedUiLanguage): string {
  if (uiLanguage === "fr") {
    if (priority === "high") return "priorité haute";
    if (priority === "medium") return "priorité moyenne";
    if (priority === "low") return "priorité basse";
  }
  return priority;
}

function getArtifactStatusLabel(status: string, uiLanguage: SupportedUiLanguage): string {
  if (uiLanguage === "fr") {
    if (status === "completed") return "débloqué";
    if (status === "generating") return "génération";
    if (status === "paid") return "payé";
    if (status === "pending_payment") return "paiement en attente";
    if (status === "failed") return "échec";
  }

  if (status === "completed") return "unlocked";
  if (status === "generating") return "generating";
  if (status === "paid") return "paid";
  if (status === "pending_payment") return "pending payment";
  if (status === "failed") return "failed";
  return status;
}

function hasBundlePromotion(offer?: OfferItemResponse | null): boolean {
  return !!offer?.applied_promotions?.some(
    (promotion) => promotion.promotion_type === "bundle_discount",
  );
}

export function RecommendationCard({
  item,
  onUpdated,
  uiLanguage = "en",
  focusMode = false,
}: {
  item: Recommendation;
  onUpdated: (updated: Recommendation) => void | Promise<void>;
  uiLanguage?: SupportedUiLanguage;
  focusMode?: boolean;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [artifactsLoading, setArtifactsLoading] = useState(false);
  const [artifacts, setArtifacts] = useState<{
    ebook: RecommendationArtifactStatus | null;
    audiobook: RecommendationArtifactStatus | null;
  }>({
    ebook: null,
    audiobook: null,
  });

  const bestLever =
    Array.isArray(item.levers) && item.levers.length > 0
      ? item.levers.find((lever) => lever.is_highlighted) ?? item.levers[0]
      : null;

  const complementaryLever =
    Array.isArray(item.levers) && item.levers.length > 1
      ? item.levers.find((lever) => lever.id !== bestLever?.id) ?? item.levers[1]
      : null;

  const baseOffer = item.offers?.base_offer ?? null;
  const upsellOffers = Array.isArray(item.offers?.upsell_offers)
    ? item.offers.upsell_offers
    : [];
  const crossSellOffers = Array.isArray(item.offers?.cross_sell_offers)
    ? item.offers.cross_sell_offers
    : [];

  const bundleActive =
    hasBundlePromotion(baseOffer) ||
    upsellOffers.some((offer) => hasBundlePromotion(offer));

  const marketingMessage = item.offers?.marketing_message ?? null;

  useEffect(() => {
    let isMounted = true;

    async function loadArtifacts() {
      if (!item.artifact_generation_available) return;

      try {
        setArtifactsLoading(true);
        const allArtifacts = (await getMyAIArtifacts()) as RecommendationArtifactStatus[];
        const related = allArtifacts.filter((artifact) => artifact.recommendation_id === item.id);

        if (!isMounted) return;

        setArtifacts({
          ebook: related.find((artifact) => artifact.format === "ebook") ?? null,
          audiobook: related.find((artifact) => artifact.format === "audiobook") ?? null,
        });
      } catch {
        if (!isMounted) return;
        setArtifacts({
          ebook: null,
          audiobook: null,
        });
      } finally {
        if (isMounted) {
          setArtifactsLoading(false);
        }
      }
    }

    void loadArtifacts();

    return () => {
      isMounted = false;
    };
  }, [item.id, item.artifact_generation_available]);

  async function handleUpdate(status: Recommendation["status"]) {
    try {
      setSaving(true);
      const updated = await updateRecommendation(item.id, { status });
      await onUpdated(updated);
    } finally {
      setSaving(false);
    }
  }

  const ebookArtifact = artifacts.ebook;
  const audiobookArtifact = artifacts.audiobook;

  const unlockedArtifact =
    ebookArtifact?.status === "completed"
      ? ebookArtifact
      : audiobookArtifact?.status === "completed"
        ? audiobookArtifact
        : null;

  const primaryArtifact = unlockedArtifact ?? ebookArtifact ?? audiobookArtifact ?? null;

  const hasAnyArtifact = !!ebookArtifact || !!audiobookArtifact;
  const bothFormatsUnlocked =
    ebookArtifact?.status === "completed" && audiobookArtifact?.status === "completed";

  const secondaryFormatToSuggest =
    ebookArtifact?.status === "completed" && !audiobookArtifact
      ? "audiobook"
      : audiobookArtifact?.status === "completed" && !ebookArtifact
        ? "ebook"
        : null;

  const guideStateLabel = useMemo(() => {
    if (!hasAnyArtifact) return null;

    if (bothFormatsUnlocked) {
      return uiLanguage === "fr" ? "e-book + audio débloqués" : "e-book + audio unlocked";
    }

    if (ebookArtifact?.status === "completed") {
      return uiLanguage === "fr" ? "mini e-book débloqué" : "mini e-book unlocked";
    }

    if (audiobookArtifact?.status === "completed") {
      return uiLanguage === "fr" ? "mini audiobook débloqué" : "mini audiobook unlocked";
    }

    if (primaryArtifact) {
      return getArtifactStatusLabel(primaryArtifact.status, uiLanguage);
    }

    return null;
  }, [
    hasAnyArtifact,
    bothFormatsUnlocked,
    ebookArtifact,
    audiobookArtifact,
    primaryArtifact,
    uiLanguage,
  ]);

  function openArtifact(artifactId: number) {
    router.push(`/ai-artifacts/${artifactId}`);
  }

  function openPreview(format: "ebook" | "audiobook") {
    router.push(`/ai-artifacts/preview/${item.id}?format=${format}`);
  }

  function handleOfferClick(offer: OfferItemResponse) {
    if (offer.lever_category === "ai-enabled-developer") {
      const targetFormat = offer.format === "audiobook" ? "audiobook" : "ebook";
      openPreview(targetFormat);
      return;
    }

    if (offer.url) {
      window.open(offer.url, "_blank", "noopener,noreferrer");
    }
  }

  function hasExistingArtifactForFormat(offer: OfferItemResponse): boolean {
    if (offer.format === "ebook") return !!ebookArtifact;
    if (offer.format === "audiobook") return !!audiobookArtifact;
    return false;
  }

  const hasOffers =
    !!baseOffer || upsellOffers.length > 0 || crossSellOffers.length > 0;

  return (
    <div
      className="card stack"
      style={{
        gap: 16,
        maxWidth: focusMode ? 1080 : undefined,
        margin: focusMode ? "0 auto" : undefined,
      }}
    >
      <div className="stack" style={{ gap: 12 }}>
        <div className="stack" style={{ gap: 6 }}>
          <div className="section-title">{item.title}</div>
          <div className="muted" style={{ lineHeight: 1.6 }}>
            {item.description}
          </div>
        </div>

        <div
          className="row"
          style={{
            gap: 8,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <BadgePill icon={<TargetIcon size={14} />}>
            {getPriorityLabel(item.priority, uiLanguage)}
          </BadgePill>

          {guideStateLabel ? (
            <BadgePill icon={<CheckCircleIcon size={14} />}>
              {guideStateLabel}
            </BadgePill>
          ) : null}

          {item.offers?.urgency_badge ? (
            <BadgePill icon={<CheckCircleIcon size={14} />}>
              {item.offers.urgency_badge}
            </BadgePill>
          ) : null}
        </div>
      </div>

      <ActionStepNavigator
        primaryProblem={item.primary_problem}
        actionTrack={item.action_track}
        whyRecommended={item.why_recommended}
        uiLanguage={uiLanguage}
      />

      {marketingMessage ? (
        <div className="card-soft">
          <strong>{uiLanguage === "fr" ? "Ce que nous te proposons" : "What we recommend next"}</strong>
          <div className="muted">{marketingMessage}</div>
        </div>
      ) : null}

      {bundleActive ? (
        <div className="card-soft stack" style={{ gap: 8 }}>
          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            <BadgePill icon={<SparkIcon size={14} />}>
              {uiLanguage === "fr" ? "Bundle actif" : "Bundle active"}
            </BadgePill>
          </div>
          <div className="muted">
            {uiLanguage === "fr"
              ? "L’e-book principal et le format audio complémentaire bénéficient actuellement d’un avantage groupé."
              : "The main e-book and complementary audio format currently benefit from a combined bundle advantage."}
          </div>
        </div>
      ) : null}

      {hasOffers ? (
        <ActionNavigator
          baseOffer={baseOffer}
          upsellOffers={upsellOffers}
          crossSellOffers={crossSellOffers}
          uiLanguage={uiLanguage}
          hasExistingArtifactForFormat={hasExistingArtifactForFormat}
          onClick={handleOfferClick}
        />
      ) : bestLever ? (
        <div className="card-soft stack" style={{ gap: 6 }}>
          <strong>{uiLanguage === "fr" ? "Solution recommandée" : "Recommended solution"}</strong>

          <div
            className="row space-between"
            style={{ gap: 10, alignItems: "flex-start", flexWrap: "wrap" }}
          >
            <div style={{ minWidth: 0, flex: 1 }}>
              <strong>{bestLever.name}</strong>
              <div className="muted">{bestLever.match_reason}</div>
            </div>

            {bestLever.is_highlighted ? (
              <BadgePill icon={<SparkIcon size={14} />}>
                {uiLanguage === "fr" ? "Meilleur choix" : "Best match"}
              </BadgePill>
            ) : null}
          </div>
        </div>
      ) : null}

      {!focusMode && hasAnyArtifact ? (
        <div className="card-soft stack" style={{ gap: 8 }}>
          <strong>{uiLanguage === "fr" ? "Guide IA associé" : "Related AI guide"}</strong>

          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            {ebookArtifact ? (
              <BadgePill icon={<SparkIcon size={14} />}>
                {uiLanguage === "fr" ? "E-book" : "E-book"} ·{" "}
                {getArtifactStatusLabel(ebookArtifact.status, uiLanguage)}
              </BadgePill>
            ) : null}

            {audiobookArtifact ? (
              <BadgePill icon={<SparkIcon size={14} />}>
                {uiLanguage === "fr" ? "Audio" : "Audio"} ·{" "}
                {getArtifactStatusLabel(audiobookArtifact.status, uiLanguage)}
              </BadgePill>
            ) : null}
          </div>

          <div className="muted">
            {uiLanguage === "fr"
              ? "Ce guide ne peut plus être redébloqué. Tu peux l’ouvrir ou découvrir le format complémentaire."
              : "This guide cannot be unlocked again. You can open it or discover the complementary format."}
          </div>
        </div>
      ) : null}

      {!focusMode && bothFormatsUnlocked && complementaryLever ? (
        <div className="card-soft stack" style={{ gap: 8 }}>
          <strong>
            {uiLanguage === "fr"
              ? "Prochaine étape recommandée"
              : "Recommended next step"}
          </strong>
          <div className="muted">
            {uiLanguage === "fr"
              ? `Après le guide IA, le levier complémentaire "${complementaryLever.name}" peut aider à transformer cette recommandation en action réelle.`
              : `After the AI guide, the complementary lever "${complementaryLever.name}" can help turn this recommendation into real action.`}
          </div>
          <BadgePill icon={<SparkIcon size={14} />}>{complementaryLever.name}</BadgePill>
        </div>
      ) : null}

      <div className="row" style={{ flexWrap: "wrap", gap: 10 }}>
        {item.status === "open" ? (
          <button
            className="button secondary"
            disabled={saving}
            onClick={() => void handleUpdate("in_progress")}
          >
            {uiLanguage === "fr" ? "Commencer" : "Start"}
          </button>
        ) : null}

        {item.artifact_generation_available ? (
          artifactsLoading ? (
            <button className="button ghost" type="button" disabled>
              {uiLanguage === "fr" ? "Chargement du guide..." : "Loading guide..."}
            </button>
          ) : hasAnyArtifact ? (
            <>
              {primaryArtifact ? (
                <button
                  className="button"
                  onClick={() => openArtifact(primaryArtifact.id)}
                  type="button"
                >
                  <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                    <ArrowRightIcon size={14} />
                    {uiLanguage === "fr" ? "Ouvrir le guide" : "Open guide"}
                  </span>
                </button>
              ) : null}

              {secondaryFormatToSuggest ? (
                <button
                  className="button ghost"
                  onClick={() => openPreview(secondaryFormatToSuggest)}
                  type="button"
                >
                  {secondaryFormatToSuggest === "ebook"
                    ? uiLanguage === "fr"
                      ? "Découvrir la version e-book"
                      : "Discover e-book version"
                    : uiLanguage === "fr"
                      ? "Découvrir la version audio"
                      : "Discover audio version"}
                </button>
              ) : null}
            </>
          ) : (
            <button
              className="button"
              onClick={() =>
                openPreview(
                  item.artifact_default_format === "audiobook" ? "audiobook" : "ebook",
                )
              }
              type="button"
            >
              <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                <ArrowRightIcon size={14} />
                {uiLanguage === "fr" ? "Voir le guide IA" : "View AI guide"}
              </span>
            </button>
          )
        ) : null}
      </div>
    </div>
  );
}