"use client";

import type { OfferItemResponse } from "@/lib/types";
import type { SupportedUiLanguage } from "@/lib/user-locales";
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

export function SecondaryOfferCard({
  offer,
  uiLanguage = "en",
  kind,
  hasExistingArtifactForFormat = false,
  onClick,
}: SecondaryOfferCardProps) {
  return (
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
  );
}