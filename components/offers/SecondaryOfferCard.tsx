"use client";

import type { OfferItemResponse } from "@/lib/types";
import type { SupportedUiLanguage } from "@/lib/user-locales";
import { LayerIcon, SparkIcon, TargetIcon } from "@/components/ui-flat-icons";
import { OfferCardShell } from "./OfferCardShell";

type SecondaryOfferCardProps = {
  offer: OfferItemResponse;
  uiLanguage?: SupportedUiLanguage;
  kind: "upsell" | "cross_sell";
  hasExistingArtifactForFormat?: boolean;
  onClick: () => void;
};

function getSectionLabel(
  kind: "upsell" | "cross_sell",
  uiLanguage: SupportedUiLanguage,
): string {
  if (kind === "upsell") {
    return uiLanguage === "fr" ? "Upgrade recommandé" : "Recommended upgrade";
  }

  return uiLanguage === "fr" ? "Complément pertinent" : "Helpful complement";
}

function getSecondaryCtaLabel(
  offer: OfferItemResponse,
  kind: "upsell" | "cross_sell",
  uiLanguage: SupportedUiLanguage,
  hasExistingArtifactForFormat: boolean,
): string {
  if (offer.lever_category === "ai-enabled-developer") {
    if (hasExistingArtifactForFormat) {
      return uiLanguage === "fr"
        ? "Voir le format complémentaire"
        : "View complementary format";
    }

    return kind === "upsell"
      ? uiLanguage === "fr"
        ? "Ajouter ce format"
        : "Add this format"
      : uiLanguage === "fr"
        ? "Voir l’aperçu"
        : "View preview";
  }

  if (kind === "upsell") {
    return uiLanguage === "fr" ? "Améliorer mon parcours" : "Upgrade my path";
  }

  if (offer.url) {
    return uiLanguage === "fr" ? "Explorer cette option" : "Explore this option";
  }

  return uiLanguage === "fr" ? "Découvrir" : "Discover";
}

function getSecondaryEyebrow(
  offer: OfferItemResponse,
  kind: "upsell" | "cross_sell",
  uiLanguage: SupportedUiLanguage,
): string {
  if (offer.lever_category === "ai-enabled-developer") {
    if (kind === "upsell") {
      return uiLanguage === "fr"
        ? "Pour aller plus loin avec un format plus immersif"
        : "To go further with a more immersive format";
    }

    return uiLanguage === "fr"
      ? "Pour compléter ton action avec un support pratique"
      : "To complement your action with practical support";
  }

  if (kind === "upsell") {
    return uiLanguage === "fr"
      ? "Une option plus complète pour accélérer"
      : "A more complete option to accelerate";
  }

  return uiLanguage === "fr"
    ? "Un levier complémentaire pour soutenir l’exécution"
    : "A complementary lever to support execution";
}

function getHeaderIcon(kind: "upsell" | "cross_sell") {
  if (kind === "upsell") {
    return <SparkIcon size={18} />;
  }

  return <LayerIcon size={18} />;
}

export function SecondaryOfferCard({
  offer,
  uiLanguage = "en",
  kind,
  hasExistingArtifactForFormat = false,
  onClick,
}: SecondaryOfferCardProps) {
  const isUpsell = kind === "upsell";

  return (
    <div className="stack" style={{ gap: 10 }}>
      <div
        className="card-soft row space-between"
        style={{
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
          borderRadius: 24,
          background: isUpsell
            ? "linear-gradient(135deg, rgba(255,241,220,0.78), rgba(255,255,255,0.72))"
            : "linear-gradient(135deg, rgba(232,248,246,0.78), rgba(255,255,255,0.72))",
          border: isUpsell
            ? "1px solid rgba(255,122,89,0.14)"
            : "1px solid rgba(88,180,174,0.16)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.72)",
        }}
      >
        <div className="row" style={{ gap: 10, alignItems: "center" }}>
          <span
            style={{
              width: 38,
              height: 38,
              borderRadius: 15,
              display: "grid",
              placeItems: "center",
              background: isUpsell
                ? "rgba(255,122,89,0.11)"
                : "rgba(88,180,174,0.11)",
              border: isUpsell
                ? "1px solid rgba(255,122,89,0.20)"
                : "1px solid rgba(88,180,174,0.20)",
              color: isUpsell ? "var(--coach-accent)" : "var(--coach-calm)",
              flexShrink: 0,
            }}
          >
            {getHeaderIcon(kind)}
          </span>

          <div className="stack" style={{ gap: 2 }}>
            <div
              className="section-title"
              style={{
                fontSize: 15,
                color: "var(--coach-ink)",
              }}
            >
              {getSectionLabel(kind, uiLanguage)}
            </div>

            <div
              className="muted"
              style={{
                color: "var(--coach-muted)",
                fontSize: 13,
              }}
            >
              {getSecondaryEyebrow(offer, kind, uiLanguage)}
            </div>
          </div>
        </div>

        <span
          className="badge"
          style={{
            background: isUpsell
              ? "rgba(255,122,89,0.11)"
              : "rgba(88,180,174,0.11)",
            borderColor: isUpsell
              ? "rgba(255,122,89,0.20)"
              : "rgba(88,180,174,0.20)",
            color: isUpsell ? "var(--coach-accent)" : "var(--coach-calm)",
            fontWeight: 850,
          }}
        >
          <TargetIcon size={14} />
          {isUpsell
            ? uiLanguage === "fr"
              ? "Plus complet"
              : "More complete"
            : uiLanguage === "fr"
              ? "Complémentaire"
              : "Complementary"}
        </span>
      </div>

      <OfferCardShell
        offer={offer}
        uiLanguage={uiLanguage}
        variant="secondary"
        sectionLabel={getSectionLabel(kind, uiLanguage)}
        ctaLabel={getSecondaryCtaLabel(
          offer,
          kind,
          uiLanguage,
          hasExistingArtifactForFormat,
        )}
        onClick={onClick}
      />
    </div>
  );
}