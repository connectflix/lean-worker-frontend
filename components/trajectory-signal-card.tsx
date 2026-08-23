"use client";

import type { TrajectorySignalResponse } from "@/lib/types";
import type { SupportedUiLanguage } from "@/lib/user-locales";
import {
  BadgePill,
  PathIcon,
  SparkIcon,
  TargetIcon,
} from "@/components/ui-flat-icons";

type TrajectorySignalCardProps = {
  signal: TrajectorySignalResponse | null | undefined;
  uiLanguage: SupportedUiLanguage;
};

function prettifySignal(value: string): string {
  return value.replaceAll("_", " ");
}

function confidenceLabel(
  confidence: number | null | undefined,
  uiLanguage: SupportedUiLanguage,
): string | null {
  if (typeof confidence !== "number") return null;

  const percentage = Math.round(
    Math.max(0, Math.min(1, confidence)) * 100,
  );

  return uiLanguage === "fr"
    ? `Confiance ${percentage} %`
    : `Confidence ${percentage}%`;
}

function trajectoryLabel(
  value: TrajectorySignalResponse["trajectory_signal"],
  uiLanguage: SupportedUiLanguage,
): string | null {
  if (!value) return null;

  const labels: Record<string, { fr: string; en: string }> = {
    positive: {
      fr: "Progression positive",
      en: "Positive progress",
    },
    mixed: {
      fr: "Progression mitigée",
      en: "Mixed progress",
    },
    neutral: {
      fr: "Signal stable",
      en: "Stable signal",
    },
    negative: {
      fr: "Progression à réajuster",
      en: "Progress needs adjustment",
    },
    insufficient_evidence: {
      fr: "Preuves encore insuffisantes",
      en: "Not enough evidence yet",
    },
  };

  const label = labels[value];

  if (label) {
    return label[uiLanguage === "fr" ? "fr" : "en"];
  }

  return prettifySignal(value);
}

function normalizeTextItems(
  values: unknown[] | null | undefined,
): string[] {
  if (!Array.isArray(values)) return [];

  return values
    .map((value) => {
      if (typeof value === "string") {
        return value.trim();
      }

      if (!value || typeof value !== "object") {
        return "";
      }

      const item = value as Record<string, unknown>;

      const candidate =
        item.focus ??
        item.constraint ??
        item.signal ??
        item.capability ??
        item.summary ??
        item.label ??
        item.title;

      return typeof candidate === "string"
        ? candidate.trim()
        : "";
    })
    .filter(Boolean)
    .slice(0, 3);
}

export function TrajectorySignalCard({
  signal,
  uiLanguage,
}: TrajectorySignalCardProps) {
  const hasSignal =
    signal &&
    Object.values(signal).some(
      (value) => value !== null && value !== undefined,
    );

  if (!hasSignal) {
    return null;
  }

  const trajectory = trajectoryLabel(
    signal.trajectory_signal,
    uiLanguage,
  );
  const confidence = confidenceLabel(
    signal.confidence,
    uiLanguage,
  );

  const learnedConstraints = normalizeTextItems(
    signal.learned_constraints,
  );
  const capabilities = normalizeTextItems(
    signal.capability_signals,
  );
  const nextCandidates = normalizeTextItems(
    signal.next_attention_candidates,
  );

  const supportingItems = [
    ...capabilities,
    ...learnedConstraints,
  ].slice(0, 3);

  return (
    <section
      className="card stack"
      aria-label={
        uiLanguage === "fr"
          ? "Trajectoire professionnelle"
          : "Professional trajectory"
      }
      style={{
        gap: 16,
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,250,252,0.96))",
      }}
    >
      <div
        className="row space-between"
        style={{
          gap: 12,
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        <div className="stack" style={{ gap: 6 }}>
          <div
            className="row"
            style={{
              gap: 8,
              alignItems: "center",
            }}
          >
            <PathIcon />
            <div className="section-title">
              {uiLanguage === "fr"
                ? "Ta trajectoire"
                : "Your trajectory"}
            </div>
          </div>

          <div className="muted">
            {uiLanguage === "fr"
              ? "Ce que tes actions récentes nous apprennent pour la suite."
              : "What your recent actions are teaching us about what comes next."}
          </div>
        </div>

        <div
          className="row"
          style={{
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          {trajectory ? (
            <BadgePill icon={<SparkIcon size={14} />}>
              {trajectory}
            </BadgePill>
          ) : null}

          {confidence ? (
            <BadgePill>
              {confidence}
            </BadgePill>
          ) : null}
        </div>
      </div>

      {signal.recommended_next_focus ? (
        <div
          className="card-soft stack"
          style={{
            gap: 8,
          }}
        >
          <div
            className="row"
            style={{
              gap: 8,
              alignItems: "center",
            }}
          >
            <TargetIcon size={16} />
            <strong>
              {uiLanguage === "fr"
                ? "Prochain focus"
                : "Next focus"}
            </strong>
          </div>

          <div>
            {signal.recommended_next_focus}
          </div>
        </div>
      ) : null}

      {signal.trajectory_summary ? (
        <div className="stack" style={{ gap: 6 }}>
          <div className="muted">
            {uiLanguage === "fr"
              ? "Ce qui évolue"
              : "What is changing"}
          </div>
          <div>{signal.trajectory_summary}</div>
        </div>
      ) : null}

      {supportingItems.length > 0 ? (
        <div className="stack" style={{ gap: 8 }}>
          <div className="muted">
            {uiLanguage === "fr"
              ? "Apprentissages utiles"
              : "Useful learnings"}
          </div>

          <div
            className="row"
            style={{
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            {supportingItems.map((item, index) => (
              <BadgePill
                key={`${item}-${index}`}
                icon={<SparkIcon size={14} />}
              >
                {item}
              </BadgePill>
            ))}
          </div>
        </div>
      ) : null}

      {nextCandidates.length > 0 &&
      !signal.recommended_next_focus ? (
        <div className="stack" style={{ gap: 8 }}>
          <div className="muted">
            {uiLanguage === "fr"
              ? "À garder en attention"
              : "Keep in attention"}
          </div>

          {nextCandidates.map((item, index) => (
            <div
              key={`${item}-${index}`}
              className="card-soft"
            >
              {item}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}