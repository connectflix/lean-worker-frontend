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
    if (priority === "high") return "Priorité élevée";
    if (priority === "medium") return "Priorité moyenne";
    if (priority === "low") return "Priorité faible";
  }

  if (priority === "high") return "High priority";
  if (priority === "medium") return "Medium priority";
  if (priority === "low") return "Low priority";

  return priority;
}

function getArtifactStatusLabel(status: string, uiLanguage: SupportedUiLanguage): string {
  if (uiLanguage === "fr") {
    if (status === "completed") return "Disponible";
    if (status === "generating") return "En préparation";
    if (status === "paid") return "Paiement confirmé";
    if (status === "pending_payment") return "Paiement en attente";
    if (status === "failed") return "Échec de génération";
  }

  if (status === "completed") return "Available";
  if (status === "generating") return "Preparing";
  if (status === "paid") return "Payment confirmed";
  if (status === "pending_payment") return "Payment pending";
  if (status === "failed") return "Generation failed";

  return status;
}

function getPriorityTone(priority: string) {
  if (priority === "high") {
    return {
      background: "rgba(255,122,89,0.12)",
      borderColor: "rgba(255,122,89,0.22)",
      color: "var(--coach-accent)",
    };
  }

  if (priority === "medium") {
    return {
      background: "rgba(88,180,174,0.12)",
      borderColor: "rgba(88,180,174,0.22)",
      color: "var(--coach-calm)",
    };
  }

  return {
    background: "rgba(43,33,24,0.05)",
    borderColor: "rgba(43,33,24,0.10)",
    color: "var(--coach-muted)",
  };
}

function getArtifactTone(status: string) {
  if (status === "completed") {
    return {
      background: "rgba(88,180,174,0.12)",
      borderColor: "rgba(88,180,174,0.22)",
      color: "var(--coach-calm)",
    };
  }

  if (status === "failed") {
    return {
      background: "rgba(198,40,40,0.08)",
      borderColor: "rgba(198,40,40,0.16)",
      color: "var(--danger)",
    };
  }

  if (status === "generating" || status === "paid") {
    return {
      background: "rgba(255,122,89,0.12)",
      borderColor: "rgba(255,122,89,0.22)",
      color: "var(--coach-accent)",
    };
  }

  return {
    background: "rgba(43,33,24,0.05)",
    borderColor: "rgba(43,33,24,0.10)",
    color: "var(--coach-muted)",
  };
}

function hasBundlePromotion(offer?: OfferItemResponse | null): boolean {
  return !!offer?.applied_promotions?.some(
    (promotion) => promotion.promotion_type === "bundle_discount",
  );
}

function CoachPanel({
  children,
  warm = false,
}: {
  children: React.ReactNode;
  warm?: boolean;
}) {
  return (
    <div
      className="card-soft stack"
      style={{
        gap: 10,
        borderRadius: 20,
        background: warm
          ? "linear-gradient(135deg, rgba(255,241,220,0.86), rgba(255,255,255,0.76))"
          : "rgba(255,255,255,0.68)",
        border: "1px solid rgba(43,33,24,0.08)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.72)",
      }}
    >
      {children}
    </div>
  );
}

export function RecommendationCard({
  item,
  onUpdated,
  uiLanguage = "fr",
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

  const [updateError, setUpdateError] = useState<string | null>(null);

  async function handleUpdate(status: Recommendation["status"]) {
    try {
      setSaving(true);
      setUpdateError(null);
      const updated = await updateRecommendation(item.id, { status });
      await onUpdated(updated);
    } catch {
      setUpdateError(
        uiLanguage === "fr"
          ? "Impossible de mettre à jour cette recommandation."
          : "Unable to update this recommendation.",
      );
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
      return uiLanguage === "fr" ? "E-book et audio disponibles" : "E-book and audio available";
    }

    if (ebookArtifact?.status === "completed") {
      return uiLanguage === "fr" ? "Mini e-book disponible" : "Mini e-book available";
    }

    if (audiobookArtifact?.status === "completed") {
      return uiLanguage === "fr" ? "Mini audio disponible" : "Mini audio available";
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

  const hasOffers = !!baseOffer || upsellOffers.length > 0 || crossSellOffers.length > 0;
  const priorityTone = getPriorityTone(item.priority);
  const artifactTone = primaryArtifact
    ? getArtifactTone(primaryArtifact.status)
    : getArtifactTone("pending_payment");

  return (
    <div
      className="card stack"
      lang={uiLanguage}
      style={{
        gap: 16,
        maxWidth: focusMode ? 1040 : undefined,
        margin: focusMode ? "0 auto" : undefined,
        position: "relative",
        overflow: "hidden",
        borderRadius: 28,
        border: "1px solid rgba(43,33,24,0.08)",
        background:
          item.priority === "high"
            ? "linear-gradient(135deg, rgba(255,241,220,0.96), rgba(255,255,255,0.92) 56%, rgba(232,248,246,0.82))"
            : "linear-gradient(135deg, rgba(255,255,255,0.88), rgba(255,248,239,0.74))",
        boxShadow: "0 22px 60px rgba(43,33,24,0.07)",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          right: -110,
          top: -120,
          width: 300,
          height: 300,
          borderRadius: 999,
          background:
            item.priority === "high"
              ? "rgba(255,122,89,0.14)"
              : "rgba(88,180,174,0.10)",
          pointerEvents: "none",
        }}
      />

      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "48%",
          bottom: -150,
          width: 330,
          height: 330,
          borderRadius: 999,
          background: "rgba(88,180,174,0.11)",
          pointerEvents: "none",
        }}
      />

      <div className="stack" style={{ gap: 14, position: "relative", zIndex: 1 }}>
        <div className="row space-between" style={{ gap: 14, alignItems: "flex-start" }}>
          <div className="stack" style={{ gap: 10, minWidth: 0, flex: 1 }}>
            <div className="row" style={{ gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <span
                className="badge"
                style={{
                  background: priorityTone.background,
                  borderColor: priorityTone.borderColor,
                  color: priorityTone.color,
                  fontWeight: 850,
                }}
              >
                <TargetIcon size={14} />
                {getPriorityLabel(item.priority, uiLanguage)}
              </span>

              {guideStateLabel ? (
                <span
                  className="badge"
                  style={{
                    background: artifactTone.background,
                    borderColor: artifactTone.borderColor,
                    color: artifactTone.color,
                    fontWeight: 850,
                  }}
                >
                  <CheckCircleIcon size={14} />
                  {guideStateLabel}
                </span>
              ) : null}

              {item.offers?.urgency_badge ? (
                <span
                  className="badge"
                  style={{
                    background: "rgba(255,122,89,0.10)",
                    borderColor: "rgba(255,122,89,0.20)",
                    color: "var(--coach-accent)",
                    fontWeight: 850,
                  }}
                >
                  <SparkIcon size={14} />
                  {item.offers.urgency_badge}
                </span>
              ) : null}
            </div>

            <div
              style={{
                fontSize: focusMode ? 34 : 26,
                lineHeight: 1.08,
                fontWeight: 950,
                letterSpacing: "-0.06em",
                color: "var(--coach-ink)",
              }}
            >
              {item.title}
            </div>

            <div
              className="muted"
              style={{
                lineHeight: 1.72,
                color: "var(--coach-muted)",
                maxWidth: 860,
                fontSize: 15,
              }}
            >
              {item.description}
            </div>
          </div>

          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: 20,
              display: "grid",
              placeItems: "center",
              background: priorityTone.background,
              border: `1px solid ${priorityTone.borderColor}`,
              color: priorityTone.color,
              flexShrink: 0,
            }}
          >
            <TargetIcon size={21} />
          </div>
        </div>
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        <ActionStepNavigator
          primaryProblem={item.primary_problem}
          actionTrack={item.action_track}
          whyRecommended={item.why_recommended}
          uiLanguage={uiLanguage}
        />
      </div>

      {marketingMessage ? (
        <CoachPanel warm>
          <div className="row" style={{ gap: 8, alignItems: "center" }}>
            <SparkIcon size={16} />
            <strong>{uiLanguage === "fr" ? "Proposition associée" : "Related proposal"}</strong>
          </div>

          <div className="muted" style={{ color: "var(--coach-muted)", lineHeight: 1.65 }}>
            {marketingMessage}
          </div>
        </CoachPanel>
      ) : null}

      {bundleActive ? (
        <CoachPanel warm>
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
              {uiLanguage === "fr" ? "Avantage groupé" : "Bundle offer"}
            </span>
          </div>

          <div className="muted" style={{ color: "var(--coach-muted)", lineHeight: 1.65 }}>
            {uiLanguage === "fr"
              ? "L’e-book et le format audio bénéficient actuellement d’une offre groupée."
              : "The e-book and audio format currently benefit from a bundle offer."}
          </div>
        </CoachPanel>
      ) : null}

      <div style={{ position: "relative", zIndex: 1 }}>
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
          <CoachPanel>
            <div className="row" style={{ gap: 8, alignItems: "center" }}>
              <SparkIcon size={16} />
              <strong>{uiLanguage === "fr" ? "Levier recommandé" : "Recommended lever"}</strong>
            </div>

            <div
              className="row space-between"
              style={{ gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}
            >
              <div className="stack" style={{ minWidth: 0, flex: 1, gap: 6 }}>
                <strong style={{ color: "var(--coach-ink)" }}>{bestLever.name}</strong>

                {bestLever.match_reason ? (
                  <div className="muted" style={{ color: "var(--coach-muted)", lineHeight: 1.6 }}>
                    {bestLever.match_reason}
                  </div>
                ) : null}
              </div>

              {bestLever.is_highlighted ? (
                <BadgePill icon={<SparkIcon size={14} />}>
                  {uiLanguage === "fr" ? "Le plus pertinent" : "Best fit"}
                </BadgePill>
              ) : null}
            </div>
          </CoachPanel>
        ) : null}
      </div>

      {!focusMode && hasAnyArtifact ? (
        <CoachPanel>
          <div className="row" style={{ gap: 8, alignItems: "center" }}>
            <SparkIcon size={16} />
            <strong>{uiLanguage === "fr" ? "Guide associé" : "Related guide"}</strong>
          </div>

          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            {ebookArtifact ? (
              <span
                className="badge"
                style={{
                  background: getArtifactTone(ebookArtifact.status).background,
                  borderColor: getArtifactTone(ebookArtifact.status).borderColor,
                  color: getArtifactTone(ebookArtifact.status).color,
                  fontWeight: 750,
                }}
              >
                <SparkIcon size={14} />
                {uiLanguage === "fr" ? "E-book" : "E-book"} ·{" "}
                {getArtifactStatusLabel(ebookArtifact.status, uiLanguage)}
              </span>
            ) : null}

            {audiobookArtifact ? (
              <span
                className="badge"
                style={{
                  background: getArtifactTone(audiobookArtifact.status).background,
                  borderColor: getArtifactTone(audiobookArtifact.status).borderColor,
                  color: getArtifactTone(audiobookArtifact.status).color,
                  fontWeight: 750,
                }}
              >
                <SparkIcon size={14} />
                {uiLanguage === "fr" ? "Audio" : "Audio"} ·{" "}
                {getArtifactStatusLabel(audiobookArtifact.status, uiLanguage)}
              </span>
            ) : null}
          </div>

          <div className="muted" style={{ color: "var(--coach-muted)", lineHeight: 1.65 }}>
            {uiLanguage === "fr"
              ? "Ce guide est déjà associé à cette recommandation. Tu peux l’ouvrir ou découvrir l’autre format."
              : "This guide is already linked to this recommendation. You can open it or explore the other format."}
          </div>
        </CoachPanel>
      ) : null}

      {!focusMode && bothFormatsUnlocked && complementaryLever ? (
        <CoachPanel warm>
          <div className="row" style={{ gap: 8, alignItems: "center" }}>
            <ArrowRightIcon size={16} />
            <strong>
              {uiLanguage === "fr"
                ? "Étape complémentaire"
                : "Complementary next step"}
            </strong>
          </div>

          <div className="muted" style={{ color: "var(--coach-muted)", lineHeight: 1.65 }}>
            {uiLanguage === "fr"
              ? `Après le guide, le levier "${complementaryLever.name}" peut t’aider à transformer cette recommandation en action concrète.`
              : `After the guide, the "${complementaryLever.name}" lever can help turn this recommendation into concrete action.`}
          </div>

          <BadgePill icon={<SparkIcon size={14} />}>{complementaryLever.name}</BadgePill>
        </CoachPanel>
      ) : null}

      {updateError ? (
        <div
          role="alert"
          className="card-soft"
          style={{
            position: "relative",
            zIndex: 1,
            color: "var(--danger)",
            borderRadius: 18,
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.18)",
          }}
        >
          {updateError}
        </div>
      ) : null}

      <div
        className="row"
        style={{
          flexWrap: "wrap",
          gap: 10,
          position: "relative",
          zIndex: 1,
          paddingTop: 4,
        }}
      >
        {item.status === "open" ? (
          <button
            className="button secondary"
            aria-label={
              uiLanguage === "fr"
                ? `Démarrer la recommandation ${item.title}`
                : `Start recommendation ${item.title}`
            }
            disabled={saving}
            onClick={() => void handleUpdate("in_progress")}
            type="button"
            style={{
              color: "var(--coach-accent)",
              borderColor: "rgba(255,122,89,0.28)",
              background: "rgba(255,255,255,0.60)",
            }}
          >
            {saving
              ? uiLanguage === "fr"
                ? "Mise à jour..."
                : "Updating..."
              : uiLanguage === "fr"
                ? "Commencer"
                : "Start"}
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
                  aria-label={uiLanguage === "fr" ? "Ouvrir le guide associé" : "Open related guide"}
                  onClick={() => openArtifact(primaryArtifact.id)}
                  type="button"
                  style={{
                    background: "var(--coach-accent)",
                    borderColor: "var(--coach-accent)",
                  }}
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
                  aria-label={
                    secondaryFormatToSuggest === "ebook"
                      ? uiLanguage === "fr"
                        ? "Découvrir la version e-book"
                        : "Explore e-book version"
                      : uiLanguage === "fr"
                        ? "Découvrir la version audio"
                        : "Explore audio version"
                  }
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
              aria-label={uiLanguage === "fr" ? "Découvrir le guide associé" : "Explore related guide"}
              onClick={() =>
                openPreview(
                  item.artifact_default_format === "audiobook" ? "audiobook" : "ebook",
                )
              }
              type="button"
              style={{
                background: "var(--coach-accent)",
                borderColor: "var(--coach-accent)",
              }}
            >
              <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                <ArrowRightIcon size={14} />
                {uiLanguage === "fr" ? "Découvrir le guide" : "Explore guide"}
              </span>
            </button>
          )
        ) : null}
      </div>
    </div>
  );
}