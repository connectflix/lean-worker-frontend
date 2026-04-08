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

  if (
    !formattedFinal &&
    typeof priceMin !== "number" &&
    typeof priceMax !== "number"
  ) {
    return null;
  }

  return (
    <div className="offer-price-wrap">
      {hasDiscount && formattedOriginal ? (
        <div className="offer-price-original">{formattedOriginal}</div>
      ) : null}

      {formattedFinal ? (
        <div className="offer-price-final">{formattedFinal}</div>
      ) : typeof priceMin === "number" && typeof priceMax === "number" ? (
        <div className="offer-price-range">
          {formatPrice(priceMin, currency)} – {formatPrice(priceMax, currency)}
        </div>
      ) : null}
    </div>
  );
}