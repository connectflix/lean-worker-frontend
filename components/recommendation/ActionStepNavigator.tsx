"use client";

import { useEffect, useMemo, useState } from "react";
import type { SupportedUiLanguage } from "@/lib/user-locales";
import {
  ArrowRightIcon,
  BadgePill,
  CheckCircleIcon,
  ClockIcon,
  SparkIcon,
  TargetIcon,
} from "@/components/ui-flat-icons";

type Step = {
  title: string;
  content: string;
  eyebrow: string;
  tone: "warm" | "calm" | "neutral";
};

type Props = {
  primaryProblem?: string | null;
  actionTrack?: string | null;
  whyRecommended?: string | null;
  uiLanguage?: SupportedUiLanguage;
};

function prettify(value?: string | null): string {
  if (!value) return "";

  const normalized = value.replaceAll("_", " ").trim();
  if (!normalized) return "";

  return `${normalized.charAt(0).toUpperCase()}${normalized.slice(1)}`;
}

function getStepIcon(tone: Step["tone"]) {
  if (tone === "calm") return <CheckCircleIcon size={15} />;
  if (tone === "neutral") return <ClockIcon size={15} />;
  return <TargetIcon size={15} />;
}

export function ActionStepNavigator({
  primaryProblem,
  actionTrack,
  whyRecommended,
  uiLanguage = "fr",
}: Props) {
  const steps = useMemo<Step[]>(() => {
    const list: Step[] = [];

    if (primaryProblem) {
      list.push({
        title: uiLanguage === "fr" ? "Point de blocage" : "Identified blocker",
        eyebrow: uiLanguage === "fr" ? "Situation actuelle" : "Current situation",
        content: prettify(primaryProblem),
        tone: "warm",
      });
    }

    list.push({
      title: uiLanguage === "fr" ? "Sans action" : "Without action",
      eyebrow: uiLanguage === "fr" ? "Risque" : "Risk",
      content:
        uiLanguage === "fr"
          ? "Ce point peut continuer à ralentir ta progression et limiter les prochaines opportunités."
          : "This may continue to slow your progress and limit your next opportunities.",
      tone: "neutral",
    });

    if (actionTrack) {
      list.push({
        title: uiLanguage === "fr" ? "Prochaine action" : "Next action",
        eyebrow: uiLanguage === "fr" ? "À mettre en œuvre" : "To implement",
        content: prettify(actionTrack),
        tone: "calm",
      });
    }

    if (whyRecommended) {
      list.push({
        title: uiLanguage === "fr" ? "Pourquoi cette action" : "Why this action",
        eyebrow: uiLanguage === "fr" ? "Justification" : "Rationale",
        content: whyRecommended,
        tone: "warm",
      });
    }

    return list;
  }, [primaryProblem, actionTrack, whyRecommended, uiLanguage]);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex((currentIndex) => Math.min(currentIndex, Math.max(steps.length - 1, 0)));
  }, [steps.length]);

  if (steps.length === 0) return null;

  const current = steps[index];

  const toneStyles =
    current.tone === "calm"
      ? {
          accent: "var(--coach-calm)",
          soft: "rgba(88,180,174,0.12)",
          border: "rgba(88,180,174,0.20)",
        }
      : current.tone === "neutral"
        ? {
            accent: "var(--coach-muted)",
            soft: "rgba(43,33,24,0.05)",
            border: "rgba(43,33,24,0.08)",
          }
        : {
            accent: "var(--coach-accent)",
            soft: "rgba(255,122,89,0.12)",
            border: "rgba(255,122,89,0.20)",
          };

  function goPrevious() {
    setIndex((currentIndex) => Math.max(currentIndex - 1, 0));
  }

  function goNext() {
    setIndex((currentIndex) => Math.min(currentIndex + 1, steps.length - 1));
  }

  return (
    <div
      className="stack"
      style={{
        gap: 12,
      }}
    >
      <div
        className="card-soft stack"
        style={{
          gap: 14,
          borderRadius: 24,
          background:
            "linear-gradient(135deg, rgba(255,248,239,0.82), rgba(255,255,255,0.78))",
          border: "1px solid rgba(43,33,24,0.08)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.72)",
        }}
      >
        <div
          className="row space-between"
          style={{
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            <BadgePill icon={<SparkIcon size={14} />}>
              {uiLanguage === "fr" ? "Parcours d’action" : "Action path"}
            </BadgePill>

            {steps.length > 1 ? (
              <BadgePill icon={<ArrowRightIcon size={14} />}>
                {index + 1} / {steps.length}
              </BadgePill>
            ) : null}
          </div>

          {steps.length > 1 ? (
            <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
              <button
                className="button ghost"
                aria-label={uiLanguage === "fr" ? "Étape précédente" : "Previous step"}
                disabled={index === 0}
                onClick={goPrevious}
                type="button"
              >
                {uiLanguage === "fr" ? "Précédent" : "Previous"}
              </button>

              <button
                className="button ghost"
                aria-label={uiLanguage === "fr" ? "Étape suivante" : "Next step"}
                disabled={index === steps.length - 1}
                onClick={goNext}
                type="button"
              >
                {uiLanguage === "fr" ? "Suivant" : "Next"}
              </button>
            </div>
          ) : null}
        </div>

        <div
          className="stack"
          style={{
            gap: 12,
            borderRadius: 20,
            padding: 18,
            background: "rgba(255,255,255,0.74)",
            border: "1px solid rgba(43,33,24,0.08)",
          }}
        >
          <div className="row" style={{ gap: 12, alignItems: "flex-start" }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 15,
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
                color: toneStyles.accent,
                background: toneStyles.soft,
                border: `1px solid ${toneStyles.border}`,
              }}
            >
              {getStepIcon(current.tone)}
            </div>

            <div className="stack" style={{ gap: 5 }}>
              <div
                style={{
                  color: toneStyles.accent,
                  fontSize: 12,
                  fontWeight: 850,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                {current.eyebrow}
              </div>

              <div
                className="section-title"
                style={{
                  color: "var(--coach-ink)",
                  fontSize: 19,
                  lineHeight: 1.25,
                }}
              >
                {current.title}
              </div>
            </div>
          </div>

          <div
            className="muted"
            style={{
              color: "var(--coach-muted)",
              lineHeight: 1.7,
              fontSize: 15,
            }}
          >
            {current.content}
          </div>
        </div>

        {steps.length > 1 ? (
          <div
            aria-label={uiLanguage === "fr" ? "Progression des étapes" : "Step progress"}
            className="row"
            style={{
              gap: 6,
              flexWrap: "nowrap",
            }}
          >
            {steps.map((step, stepIndex) => (
              <button
                key={`${step.title}-${stepIndex}`}
                type="button"
                onClick={() => setIndex(stepIndex)}
                aria-label={`${stepIndex + 1}. ${step.title}`}
                aria-current={stepIndex === index ? "step" : undefined}
                style={{
                  flex: 1,
                  height: 8,
                  borderRadius: 999,
                  border: "none",
                  cursor: "pointer",
                  background:
                    stepIndex === index
                      ? "var(--coach-accent)"
                      : stepIndex < index
                        ? "var(--coach-calm)"
                        : "rgba(43,33,24,0.10)",
                }}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}