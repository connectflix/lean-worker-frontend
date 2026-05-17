"use client";

import { useEffect, useMemo, useState } from "react";
import type { OfferItemResponse } from "@/lib/types";
import type { SupportedUiLanguage } from "@/lib/user-locales";
import { BadgePill, SparkIcon } from "@/components/ui-flat-icons";
import { BaseOfferCard } from "./BaseOfferCard";
import { SecondaryOfferCard } from "./SecondaryOfferCard";

type ActionNavigatorProps = {
  baseOffer?: OfferItemResponse | null;
  upsellOffers?: OfferItemResponse[];
  crossSellOffers?: OfferItemResponse[];
  uiLanguage?: SupportedUiLanguage;
  onClick: (offer: OfferItemResponse) => void;
  hasExistingArtifactForFormat: (offer: OfferItemResponse) => boolean;
};

type NavigableOffer = {
  key: string;
  offer: OfferItemResponse;
  type: "base" | "upsell" | "cross_sell";
};

function getTypeLabel(
  type: "base" | "upsell" | "cross_sell",
  uiLanguage: SupportedUiLanguage,
): string {
  if (uiLanguage === "fr") {
    if (type === "base") return "Recommandé";
    if (type === "upsell") return "Amélioration";
    return "Complément";
  }

  if (type === "base") return "Recommended";
  if (type === "upsell") return "Upgrade";
  return "Complement";
}

export function ActionNavigator({
  baseOffer,
  upsellOffers = [],
  crossSellOffers = [],
  uiLanguage = "en",
  onClick,
  hasExistingArtifactForFormat,
}: ActionNavigatorProps) {
  const offers = useMemo<NavigableOffer[]>(() => {
    const list: NavigableOffer[] = [];

    if (baseOffer) {
      list.push({
        key: `base-${baseOffer.lever_category}-${baseOffer.format ?? "unknown"}-0`,
        offer: baseOffer,
        type: "base",
      });
    }

    upsellOffers.forEach((offer, index) => {
      list.push({
        key: `upsell-${offer.lever_category}-${offer.format ?? "unknown"}-${index}`,
        offer,
        type: "upsell",
      });
    });

    crossSellOffers.forEach((offer, index) => {
      list.push({
        key: `cross-sell-${offer.lever_category}-${offer.format ?? "unknown"}-${index}`,
        offer,
        type: "cross_sell",
      });
    });

    return list;
  }, [baseOffer, upsellOffers, crossSellOffers]);

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (offers.length === 0) {
      setCurrentIndex(0);
      return;
    }

    if (currentIndex > offers.length - 1) {
      setCurrentIndex(offers.length - 1);
    }
  }, [offers, currentIndex]);

  if (offers.length === 0) {
    return null;
  }

  const current = offers[currentIndex];

  function goPrevious() {
    setCurrentIndex((previousIndex) => Math.max(previousIndex - 1, 0));
  }

  function goNext() {
    setCurrentIndex((previousIndex) =>
      Math.min(previousIndex + 1, offers.length - 1),
    );
  }

  return (
    <div className="stack" style={{ gap: 12 }}>
      {offers.length > 1 ? (
        <div
          className="row space-between"
          style={{ alignItems: "center", gap: 12, flexWrap: "wrap" }}
        >
          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            <BadgePill icon={<SparkIcon size={14} />}>
              {currentIndex + 1} / {offers.length}
            </BadgePill>

            <BadgePill icon={<SparkIcon size={14} />}>
              {getTypeLabel(current.type, uiLanguage)}
            </BadgePill>
          </div>

          <div className="row" style={{ gap: 8 }}>
            <button
              className="button ghost"
              onClick={goPrevious}
              disabled={currentIndex === 0}
              type="button"
            >
              {uiLanguage === "fr" ? "Précédent" : "Previous"}
            </button>

            <button
              className="button ghost"
              onClick={goNext}
              disabled={currentIndex === offers.length - 1}
              type="button"
            >
              {uiLanguage === "fr" ? "Suivant" : "Next"}
            </button>
          </div>
        </div>
      ) : null}

      <div key={current.key}>
        {current.type === "base" ? (
          <BaseOfferCard
            offer={current.offer}
            uiLanguage={uiLanguage}
            hasExistingArtifactForFormat={hasExistingArtifactForFormat(current.offer)}
            onClick={() => onClick(current.offer)}
          />
        ) : (
          <SecondaryOfferCard
            offer={current.offer}
            kind={current.type}
            uiLanguage={uiLanguage}
            hasExistingArtifactForFormat={hasExistingArtifactForFormat(current.offer)}
            onClick={() => onClick(current.offer)}
          />
        )}
      </div>
    </div>
  );
}