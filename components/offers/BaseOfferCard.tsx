"use client";

import type { OfferItemResponse } from "@/lib/types";
import type { SupportedUiLanguage } from "@/lib/user-locales";
import { SparkIcon, TargetIcon } from "@/components/ui-flat-icons";
import { OfferCardShell } from "./OfferCardShell";

type BaseOfferCardProps = {
  offer: OfferItemResponse;
  uiLanguage?: SupportedUiLanguage;
  hasExistingArtifactForFormat?: boolean;
  onClick: () => void;
};

function getBaseOfferCtaLabel(
  offer: OfferItemResponse,
  uiLanguage: SupportedUiLanguage,
  hasExistingArtifactForFormat: boolean,
): string {
  if (offer.lever_category === "ai-enabled-developer") {
    if (hasExistingArtifactForFormat) {
      return uiLanguage === "fr" ? "Ouvrir ce format" : "Open this format";
    }

    return uiLanguage === "fr"
      ? "Commencer avec ce guide"
      : "Start with this guide";
  }

  if (offer.url) {
    return uiLanguage === "fr" ? "Découvrir cette offre" : "Explore this offer";
  }

  return uiLanguage === "fr" ? "Découvrir" : "Discover";
}

function getBaseOfferSectionLabel(
  offer: OfferItemResponse,
  uiLanguage: SupportedUiLanguage,
): string {
  if (offer.lever_category === "ai-enabled-developer") {
    if (offer.format === "audiobook") {
      return uiLanguage === "fr" ? "Guide audio recommandé" : "Recommended audio guide";
    }

    return uiLanguage === "fr" ? "Guide IA recommandé" : "Recommended AI guide";
  }

  return uiLanguage === "fr" ? "Offre principale" : "Main offer";
}

function getBaseOfferEyebrow(
  offer: OfferItemResponse,
  uiLanguage: SupportedUiLanguage,
): string {
  if (offer.lever_category === "ai-enabled-developer") {
    return uiLanguage === "fr"
      ? "Pour transformer cette action en plan concret"
      : "To turn this action into a concrete plan";
  }

  return uiLanguage === "fr"
    ? "Le levier le plus directement aligné"
    : "The most directly aligned lever";
}

export function BaseOfferCard({
  offer,
  uiLanguage = "en",
  hasExistingArtifactForFormat = false,
  onClick,
}: BaseOfferCardProps) {
  return (
    <div
      className="stack"
      style={{
        gap: 10,
      }}
    >
      <div
        className="card-soft row space-between"
        style={{
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
          borderRadius: 24,
          background:
            "linear-gradient(135deg, rgba(255,241,220,0.86), rgba(255,255,255,0.76))",
          border: "1px solid rgba(255,122,89,0.16)",
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
              background: "rgba(255,122,89,0.12)",
              border: "1px solid rgba(255,122,89,0.22)",
              color: "var(--coach-accent)",
              flexShrink: 0,
            }}
          >
            <TargetIcon size={18} />
          </span>

          <div className="stack" style={{ gap: 2 }}>
            <div
              className="section-title"
              style={{
                fontSize: 15,
                color: "var(--coach-ink)",
              }}
            >
              {getBaseOfferSectionLabel(offer, uiLanguage)}
            </div>

            <div
              className="muted"
              style={{
                color: "var(--coach-muted)",
                fontSize: 13,
              }}
            >
              {getBaseOfferEyebrow(offer, uiLanguage)}
            </div>
          </div>
        </div>

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
          {uiLanguage === "fr" ? "Meilleur point de départ" : "Best starting point"}
        </span>
      </div>

      <OfferCardShell
        offer={offer}
        uiLanguage={uiLanguage}
        variant="hero"
        sectionLabel={getBaseOfferSectionLabel(offer, uiLanguage)}
        ctaLabel={getBaseOfferCtaLabel(offer, uiLanguage, hasExistingArtifactForFormat)}
        onClick={onClick}
      />
    </div>
  );
}