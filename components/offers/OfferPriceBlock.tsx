"use client";

type OfferPriceBlockProps = {
  currency?: string;
  originalPrice?: number | null;
  finalPrice?: number | null;
  priceMin?: number | null;
  priceMax?: number | null;
};

function formatPrice(value?: number | null, currency = "EUR"): string | null {
  if (typeof value !== "number" || Number.isNaN(value)) return null;

  try {
    return new Intl.NumberFormat("fr-BE", {
      style: "currency",
      currency,
      minimumFractionDigits: value % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${value} €`;
  }
}

export function OfferPriceBlock({
  currency = "EUR",
  originalPrice,
  finalPrice,
  priceMin,
  priceMax,
}: OfferPriceBlockProps) {
  const hasDiscount =
    typeof originalPrice === "number" &&
    typeof finalPrice === "number" &&
    finalPrice < originalPrice;

  const formattedOriginal = formatPrice(originalPrice, currency);
  const formattedFinal = formatPrice(finalPrice, currency);
  const formattedMin = formatPrice(priceMin, currency);
  const formattedMax = formatPrice(priceMax, currency);

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
      style={{
        alignItems: "flex-end",
        minWidth: 118,
      }}
    >
      {hasDiscount && formattedOriginal ? (
        <div
          className="offer-price-original"
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
          Better value
        </div>
      ) : null}
    </div>
  );
}