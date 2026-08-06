"use client";

import type { SupportedUiLanguage } from "@/lib/user-locales";

type OfferPriceBlockProps = {
  currency?: string;
  originalPrice?: number | null;
  finalPrice?: number | null;
  priceMin?: number | null;
  priceMax?: number | null;
  uiLanguage?: SupportedUiLanguage;
};

function formatPrice(
  value: number | null | undefined,
  currency: string,
  uiLanguage: SupportedUiLanguage,
): string | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;

  const locale = uiLanguage === "fr" ? "fr-BE" : "en-BE";

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: value % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${value.toLocaleString(locale)} ${currency}`;
  }
}

export function OfferPriceBlock({
  currency = "EUR",
  originalPrice,
  finalPrice,
  priceMin,
  priceMax,
  uiLanguage = "fr",
}: OfferPriceBlockProps) {
  const hasDiscount =
    typeof originalPrice === "number" &&
    typeof finalPrice === "number" &&
    finalPrice < originalPrice;

  const formattedOriginal = formatPrice(originalPrice, currency, uiLanguage);
  const formattedFinal = formatPrice(finalPrice, currency, uiLanguage);
  const formattedMin = formatPrice(priceMin, currency, uiLanguage);
  const formattedMax = formatPrice(priceMax, currency, uiLanguage);

  const labels =
    uiLanguage === "fr"
      ? {
          originalPrice: "Prix initial",
          currentPrice: "Prix actuel",
          priceRange: "Fourchette de prix",
          minimumPrice: "Prix minimum",
          maximumPrice: "Prix maximum",
          discount: "Meilleur tarif",
        }
      : {
          originalPrice: "Original price",
          currentPrice: "Current price",
          priceRange: "Price range",
          minimumPrice: "Minimum price",
          maximumPrice: "Maximum price",
          discount: "Better value",
        };

  const hasRange =
    typeof priceMin === "number" &&
    typeof priceMax === "number" &&
    formattedMin &&
    formattedMax;

  const hasSingleMin =
    typeof priceMin === "number" &&
    typeof priceMax !== "number" &&
    formattedMin;

  const hasSingleMax =
    typeof priceMax === "number" &&
    typeof priceMin !== "number" &&
    formattedMax;

  if (!formattedFinal && !hasRange && !hasSingleMin && !hasSingleMax) {
    return null;
  }

  return (
    <div
      className="offer-price-wrap"
      lang={uiLanguage}
      role="group"
      aria-label={
        formattedFinal
          ? labels.currentPrice
          : hasRange
            ? labels.priceRange
            : hasSingleMin
              ? labels.minimumPrice
              : labels.maximumPrice
      }
      style={{
        alignItems: "flex-end",
        minWidth: 118,
      }}
    >
      {hasDiscount && formattedOriginal ? (
        <div
          className="offer-price-original"
          aria-label={`${labels.originalPrice}: ${formattedOriginal}`}
          style={{
            color: "var(--coach-muted)",
            fontSize: 13,
            fontWeight: 650,
            opacity: 0.72,
          }}
        >
          {formattedOriginal}
        </div>
      ) : null}

      {formattedFinal ? (
        <div
          className="offer-price-final"
          aria-label={`${labels.currentPrice}: ${formattedFinal}`}
          style={{
            color: "var(--coach-ink)",
            fontSize: 26,
            fontWeight: 950,
            letterSpacing: "-0.055em",
            lineHeight: 1,
          }}
        >
          {formattedFinal}
        </div>
      ) : hasRange ? (
        <div
          className="offer-price-range"
          aria-label={`${labels.priceRange}: ${formattedMin} – ${formattedMax}`}
          style={{
            color: "var(--coach-ink)",
            fontSize: 20,
            fontWeight: 900,
            letterSpacing: "-0.045em",
            lineHeight: 1.1,
            textAlign: "right",
          }}
        >
          {formattedMin} – {formattedMax}
        </div>
      ) : hasSingleMin ? (
        <div
          className="offer-price-range"
          aria-label={`${labels.minimumPrice}: ${formattedMin}`}
          style={{
            color: "var(--coach-ink)",
            fontSize: 20,
            fontWeight: 900,
            letterSpacing: "-0.045em",
            lineHeight: 1.1,
            textAlign: "right",
          }}
        >
          {formattedMin}
        </div>
      ) : hasSingleMax ? (
        <div
          className="offer-price-range"
          aria-label={`${labels.maximumPrice}: ${formattedMax}`}
          style={{
            color: "var(--coach-ink)",
            fontSize: 20,
            fontWeight: 900,
            letterSpacing: "-0.045em",
            lineHeight: 1.1,
            textAlign: "right",
          }}
        >
          {formattedMax}
        </div>
      ) : null}

      {hasDiscount ? (
        <div
          className="fine-print"
          style={{
            marginTop: 5,
            color: "var(--coach-accent)",
            fontWeight: 800,
            letterSpacing: "-0.01em",
          }}
        >
          {labels.discount}
        </div>
      ) : null}
    </div>
  );
}