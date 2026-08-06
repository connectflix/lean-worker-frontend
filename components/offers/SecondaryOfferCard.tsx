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
    return uiLanguage === "fr" ? "Option supérieure recommandée" : "Recommended upgrade option";
  }

  return uiLanguage === "fr" ? "Option complémentaire" : "Complementary option";
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
        ? "Ouvrir ce guide complémentaire"
        : "Open complementary guide";
    }

    return kind === "upsell"
      ? uiLanguage === "fr"
        ? "Ajouter cette version"
        : "Add this version"
      : uiLanguage === "fr"
        ? "Découvrir l’aperçu"
        : "Explore preview";
  }

  if (kind === "upsell") {
    return uiLanguage === "fr" ? "Choisir cette option" : "Choose this option";
  }

  if (offer.url) {
    return uiLanguage === "fr" ? "Voir cette option" : "View this option";
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
        ? "Pour approfondir avec un format plus immersif"
        : "To go deeper with a more immersive format";
    }

    return uiLanguage === "fr"
      ? "Pour compléter cette recommandation avec un support pratique"
      : "To complement this recommendation with practical support";
  }

  if (kind === "upsell") {
    return uiLanguage === "fr"
      ? "Une option plus complète pour aller plus loin"
      : "A more complete option to go further";
  }

  return uiLanguage === "fr"
    ? "Un levier complémentaire pour faciliter le passage à l’action"
    : "A complementary lever to support action";
}

function getHeaderIcon(kind: "upsell" | "cross_sell") {
  if (kind === "upsell") {
    return <SparkIcon size={18} />;
  }

  return <LayerIcon size={18} />;
}

export function SecondaryOfferCard({
  offer,
  uiLanguage = "fr",
  kind,
  hasExistingArtifactForFormat = false,
  onClick,
}: SecondaryOfferCardProps) {
  const isUpsell = kind === "upsell";

  return (
    <div className="stack" lang={uiLanguage} style={{ gap: 10 }}>
      <div
        className="card-soft row space-between"
        style={{
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
          borderRadius: 20,
          background: isUpsell
            ? "linear-gradient(135deg, rgba(255,241,220,0.78), rgba(255,255,255,0.72))"
            : "linear-gradient(135deg, rgba(232,248,246,0.78), rgba(255,255,255,0.72))",
          border: isUpsell
            ? "1px solid rgba(255,122,89,0.14)"
            : "1px solid rgba(88,180,174,0.16)",
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

          <div className="stack" style={{ gap: 2, minWidth: 0 }}>
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
          aria-label={
            isUpsell
              ? uiLanguage === "fr"
                ? "Option renforcée"
                : "Enhanced option"
              : uiLanguage === "fr"
                ? "Option complémentaire"
                : "Complementary option"
          }
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
              ? "Option renforcée"
              : "Enhanced option"
            : uiLanguage === "fr"
              ? "En complément"
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