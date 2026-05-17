"use client";

import {
  ArrowRightIcon,
  BadgePill,
  CheckCircleIcon,
  LayerIcon,
  SparkIcon,
  TargetIcon,
} from "@/components/ui-flat-icons";
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

function getOfferFormatIcon(format: OfferItemResponse["format"] | string | undefined) {
  if (format === "ebook" || format === "audiobook") return <LayerIcon size={14} />;
  if (format === "session" || format === "program") return <TargetIcon size={14} />;
  return <SparkIcon size={14} />;
}

function getOfferTypeLabel(
  offer: OfferItemResponse,
  uiLanguage: SupportedUiLanguage,
): string {
  if (offer.lever_category === "ai-enabled-developer") {
    return uiLanguage === "fr" ? "Guide IA personnalisé" : "Personalized AI guide";
  }

  if (offer.lever_category === "engager") {
    return uiLanguage === "fr" ? "Accompagnement humain" : "Human support";
  }

  if (offer.lever_category === "developer") {
    return uiLanguage === "fr" ? "Ressource de progression" : "Development resource";
  }

  if (offer.lever_category === "transformer") {
    return uiLanguage === "fr" ? "Transformation" : "Transformation";
  }

  if (offer.lever_category === "employer") {
    return uiLanguage === "fr" ? "Opportunité carrière" : "Career opportunity";
  }

  return uiLanguage === "fr" ? "Levier recommandé" : "Recommended lever";
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
    <div
      className={isHero ? "card offer-hero-card" : "card-soft offer-secondary-card"}
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: isHero ? 30 : 26,
        border: isHero
          ? "1px solid rgba(255,122,89,0.18)"
          : "1px solid rgba(43,33,24,0.08)",
        background: isHero
          ? "linear-gradient(135deg, rgba(255,241,220,0.96), rgba(255,255,255,0.92) 52%, rgba(232,248,246,0.86))"
          : "linear-gradient(180deg, rgba(255,255,255,0.78), rgba(255,248,239,0.70))",
        boxShadow: isHero
          ? "0 22px 60px rgba(43,33,24,0.07)"
          : "0 14px 36px rgba(43,33,24,0.045)",
      }}
    >
      {isHero ? (
        <>
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              right: -90,
              top: -110,
              width: 260,
              height: 260,
              borderRadius: 999,
              background: "rgba(255,122,89,0.15)",
            }}
          />

          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              left: "52%",
              bottom: -140,
              width: 300,
              height: 300,
              borderRadius: 999,
              background: "rgba(88,180,174,0.13)",
            }}
          />
        </>
      ) : null}

      <div className="stack" style={{ gap: 16, position: "relative" }}>
        <div
          className="row space-between"
          style={{ gap: 14, alignItems: "flex-start", flexWrap: "wrap" }}
        >
          <div className="stack" style={{ gap: 10, flex: 1, minWidth: 260 }}>
            <div className="row" style={{ gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <BadgePill icon={<SparkIcon size={14} />}>{sectionLabel}</BadgePill>

              <BadgePill icon={getOfferFormatIcon(offer.format)}>
                {getOfferFormatLabel(offer.format, uiLanguage)}
              </BadgePill>

              <BadgePill icon={<TargetIcon size={14} />}>
                {getOfferTypeLabel(offer, uiLanguage)}
              </BadgePill>

              {promoBadge ? (
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
                  {promoBadge}
                </span>
              ) : null}
            </div>

            <div className="stack" style={{ gap: 6 }}>
              <div
                className={isHero ? "offer-header-title" : "offer-header-title-secondary"}
                style={{
                  color: "var(--coach-ink)",
                  fontSize: isHero ? 24 : 19,
                  lineHeight: 1.16,
                  fontWeight: 900,
                  letterSpacing: "-0.045em",
                }}
              >
                {offer.title}
              </div>

              {offer.subtitle ? (
                <div
                  className="muted"
                  style={{
                    color: "var(--coach-muted)",
                    lineHeight: 1.55,
                  }}
                >
                  {offer.subtitle}
                </div>
              ) : null}
            </div>
          </div>

          <div
            style={{
              borderRadius: 22,
              padding: 12,
              background: "rgba(255,255,255,0.68)",
              border: "1px solid rgba(43,33,24,0.08)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.78)",
            }}
          >
            <OfferPriceBlock
              currency={offer.currency}
              originalPrice={offer.original_price_eur}
              finalPrice={offer.final_price_eur}
              priceMin={offer.price_min_eur}
              priceMax={offer.price_max_eur}
            />
          </div>
        </div>

        {offer.description ? (
          <div
            className="muted"
            style={{
              lineHeight: 1.7,
              color: "var(--coach-muted)",
            }}
          >
            {offer.description}
          </div>
        ) : null}

        {(offer.commercial_reason || offer.match_reason || promoMessage) ? (
          <div className="stack" style={{ gap: 10 }}>
            {offer.commercial_reason ? (
              <div
                className="offer-meta-block"
                style={{
                  borderRadius: 22,
                  padding: 14,
                  background: "rgba(255,255,255,0.62)",
                  border: "1px solid rgba(43,33,24,0.08)",
                }}
              >
                <div
                  className="offer-meta-label"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    color: "var(--coach-ink)",
                  }}
                >
                  <ClockIconFallback />
                  {uiLanguage === "fr" ? "Pourquoi maintenant" : "Why now"}
                </div>

                <div
                  className="offer-meta-text"
                  style={{
                    color: "var(--coach-muted)",
                    lineHeight: 1.65,
                  }}
                >
                  {offer.commercial_reason}
                </div>
              </div>
            ) : null}

            {offer.match_reason ? (
              <div
                className="offer-meta-block"
                style={{
                  borderRadius: 22,
                  padding: 14,
                  background: "rgba(232,248,246,0.56)",
                  border: "1px solid rgba(88,180,174,0.14)",
                }}
              >
                <div
                  className="offer-meta-label"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    color: "var(--coach-ink)",
                  }}
                >
                  <CheckCircleIcon size={14} />
                  {uiLanguage === "fr" ? "Lien avec ta situation" : "Fit with your situation"}
                </div>

                <div
                  className="offer-meta-text"
                  style={{
                    color: "var(--coach-muted)",
                    lineHeight: 1.65,
                  }}
                >
                  {offer.match_reason}
                </div>
              </div>
            ) : null}

            {promoMessage ? (
              <div
                className="offer-meta-block"
                style={{
                  borderRadius: 22,
                  padding: 14,
                  background: "rgba(255,122,89,0.08)",
                  border: "1px solid rgba(255,122,89,0.16)",
                }}
              >
                <div
                  className="offer-meta-label"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    color: "var(--coach-ink)",
                  }}
                >
                  <SparkIcon size={14} />
                  {uiLanguage === "fr" ? "Avantage" : "Special benefit"}
                </div>

                <div
                  className="offer-meta-text"
                  style={{
                    color: "var(--coach-muted)",
                    lineHeight: 1.65,
                  }}
                >
                  {promoMessage}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
          <button
            className={isHero ? "button offer-hero-cta" : "button ghost offer-secondary-cta"}
            onClick={onClick}
            type="button"
            style={{
              minHeight: isHero ? 46 : 42,
              paddingInline: isHero ? 20 : 17,
              background: isHero ? "var(--coach-accent)" : "rgba(255,255,255,0.72)",
              borderColor: isHero ? "transparent" : "rgba(43,33,24,0.10)",
              color: isHero ? "#ffffff" : "var(--coach-ink)",
              boxShadow: isHero ? "0 14px 30px rgba(255,122,89,0.18)" : "none",
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              {ctaLabel}
              <ArrowRightIcon size={14} />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

function ClockIconFallback() {
  return (
    <span
      aria-hidden="true"
      style={{
        width: 14,
        height: 14,
        borderRadius: 999,
        border: "1.8px solid currentColor",
        display: "inline-block",
        position: "relative",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          left: 5.2,
          top: 2.6,
          width: 1.6,
          height: 4.6,
          borderRadius: 999,
          background: "currentColor",
        }}
      />
      <span
        style={{
          position: "absolute",
          left: 5.2,
          top: 6,
          width: 4.2,
          height: 1.6,
          borderRadius: 999,
          background: "currentColor",
        }}
      />
    </span>
  );
}