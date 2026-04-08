"use client";

import type { OfferItemResponse } from "@/lib/types";
import type { SupportedUiLanguage } from "@/lib/user-locales";
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

export function BaseOfferCard({
  offer,
  uiLanguage = "en",
  hasExistingArtifactForFormat = false,
  onClick,
}: BaseOfferCardProps) {
  return (
    <OfferCardShell
      offer={offer}
      uiLanguage={uiLanguage}
      variant="hero"
      sectionLabel={uiLanguage === "fr" ? "Offre principale" : "Main offer"}
      ctaLabel={getBaseOfferCtaLabel(offer, uiLanguage, hasExistingArtifactForFormat)}
      onClick={onClick}
    />
  );
}