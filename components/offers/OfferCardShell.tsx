"use client";

import { BadgePill, SparkIcon } from "@/components/ui-flat-icons";
import type { OfferItemResponse } from "@/lib/types";
import type { SupportedUiLanguage } from "@/lib/user-locales";
import { OfferPriceBlock } from "./OfferPriceBlock";

type OfferCardShellProps = {
  offer: OfferItemResponse;
  uiLanguage?: SupportedUiLanguage;
  variant?: "hero" | "secondary";
  sectionLabel: string;
  ctaLabel: string;
  onClick: () => void;
};

function getOfferFormatLabel(
  format: OfferItemResponse["format"] | string | undefined,
  uiLanguage: SupportedUiLanguage = "en",
): string {
  if (format === "ebook") return uiLanguage === "fr" ? "E-book" : "E-book";
  if (format === "audiobook") return uiLanguage === "fr" ? "Audio" : "Audio";
  if (format === "session") return uiLanguage === "fr" ? "Session" : "Session";
  if (format === "program") return uiLanguage === "fr" ? "Programme" : "Program";
  if (format === "job_opportunity") {
    return uiLanguage === "fr" ? "Opportunité" : "Opportunity";
  }
  if (format === "resource") return uiLanguage === "fr" ? "Ressource" : "Resource";
  return uiLanguage === "fr" ? "Offre" : "Offer";
}

export function OfferCardShell({
  offer,
  uiLanguage = "en",
  variant = "secondary",
  sectionLabel,
  ctaLabel,
  onClick,
}: OfferCardShellProps) {
  const promoBadge = offer.applied_promotions?.[0]?.badge_text;
  const promoMessage = offer.applied_promotions?.[0]?.marketing_message;
  const isHero = variant === "hero";

  return (
    <div className={isHero ? "card offer-hero-card" : "card-soft offer-secondary-card"}>
      <div className="stack" style={{ gap: 14 }}>
        <div
          className="row space-between"
          style={{ gap: 14, alignItems: "flex-start", flexWrap: "wrap" }}
        >
          <div className="stack" style={{ gap: 8, flex: 1, minWidth: 260 }}>
            <div className="row" style={{ gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <BadgePill icon={<SparkIcon size={14} />}>{sectionLabel}</BadgePill>
              <BadgePill icon={<SparkIcon size={14} />}>
                {getOfferFormatLabel(offer.format, uiLanguage)}
              </BadgePill>
              {promoBadge ? (
                <BadgePill icon={<SparkIcon size={14} />}>{promoBadge}</BadgePill>
              ) : null}
            </div>

            <div className="stack" style={{ gap: 4 }}>
              <div className={isHero ? "offer-header-title" : "offer-header-title-secondary"}>
                {offer.title}
              </div>

              {offer.subtitle ? <div className="muted">{offer.subtitle}</div> : null}
            </div>
          </div>

          <OfferPriceBlock
            currency={offer.currency}
            originalPrice={offer.original_price_eur}
            finalPrice={offer.final_price_eur}
            priceMin={offer.price_min_eur}
            priceMax={offer.price_max_eur}
          />
        </div>

        {offer.description ? (
          <div className="muted" style={{ lineHeight: 1.55 }}>
            {offer.description}
          </div>
        ) : null}

        {offer.commercial_reason ? (
          <div className="offer-meta-block">
            <div className="offer-meta-label">
              {uiLanguage === "fr" ? "Pourquoi maintenant" : "Why now"}
            </div>
            <div className="offer-meta-text">{offer.commercial_reason}</div>
          </div>
        ) : null}

        {offer.match_reason ? (
          <div className="offer-meta-block">
            <div className="offer-meta-label">
              {uiLanguage === "fr" ? "Lien avec ta situation" : "Fit with your situation"}
            </div>
            <div className="offer-meta-text">{offer.match_reason}</div>
          </div>
        ) : null}

        {promoMessage ? (
          <div className="offer-meta-block">
            <div className="offer-meta-label">
              {uiLanguage === "fr" ? "Avantage" : "Special benefit"}
            </div>
            <div className="offer-meta-text">{promoMessage}</div>
          </div>
        ) : null}

        <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
          <button
            className={isHero ? "button offer-hero-cta" : "button ghost offer-secondary-cta"}
            onClick={onClick}
            type="button"
          >
            {ctaLabel}
          </button>
        </div>
      </div>
    </div>
  );
}