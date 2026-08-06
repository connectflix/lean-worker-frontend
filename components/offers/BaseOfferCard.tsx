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
      return uiLanguage === "fr" ? "Ouvrir ce guide" : "Open this guide";
    }

    return uiLanguage === "fr"
      ? "Découvrir ce guide"
      : "Explore this guide";
  }

  if (offer.url) {
    return uiLanguage === "fr" ? "Voir cette offre" : "View this offer";
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

    return uiLanguage === "fr" ? "Guide personnalisé recommandé" : "Recommended personalized guide";
  }

  return uiLanguage === "fr" ? "Option recommandée" : "Recommended option";
}

function getBaseOfferEyebrow(
  offer: OfferItemResponse,
  uiLanguage: SupportedUiLanguage,
): string {
  if (offer.lever_category === "ai-enabled-developer") {
    return uiLanguage === "fr"
      ? "Pour transformer cette recommandation en plan concret"
      : "To turn this recommendation into a concrete plan";
  }

  return uiLanguage === "fr"
    ? "Le levier le plus adapté à cette recommandation"
    : "The lever best aligned with this recommendation";
}

export function BaseOfferCard({
  offer,
  uiLanguage = "fr",
  hasExistingArtifactForFormat = false,
  onClick,
}: BaseOfferCardProps) {
  return (
    <div
      className="stack"
      lang={uiLanguage}
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
          borderRadius: 20,
          background:
            "linear-gradient(135deg, rgba(255,241,220,0.86), rgba(255,255,255,0.76))",
          border: "1px solid rgba(255,122,89,0.16)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.72)",
        }}
      >
        <div
          className="row"
          style={{
            gap: 10,
            alignItems: "center",
            minWidth: 0,
            flex: "1 1 280px",
          }}
        >
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

          <div className="stack" style={{ gap: 2, minWidth: 0 }}>
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
          aria-label={
            uiLanguage === "fr"
              ? "Point de départ recommandé"
              : "Recommended starting point"
          }
          style={{
            background: "rgba(255,122,89,0.12)",
            borderColor: "rgba(255,122,89,0.22)",
            color: "var(--coach-accent)",
            fontWeight: 850,
          }}
        >
          <SparkIcon size={14} />
          {uiLanguage === "fr" ? "Point de départ recommandé" : "Recommended starting point"}
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