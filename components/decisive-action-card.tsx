"use client";

import type {
  DecisiveActionResponse,
  ProfessionalDecisionAdaptationExplanation,
} from "@/lib/types";
import type { SupportedUiLanguage } from "@/lib/user-locales";
import {
  BadgePill,
  CheckCircleIcon,
  ClockIcon,
  SparkIcon,
  TargetIcon,
} from "@/components/ui-flat-icons";

type DecisiveActionCardProps = {
  action: DecisiveActionResponse | null | undefined;
  adaptationExplanation?:
    | ProfessionalDecisionAdaptationExplanation
    | null
    | undefined;
  uiLanguage: SupportedUiLanguage;
};

function cleanText(value: string | null | undefined): string | null {
  const normalized = (value || "").trim();
  return normalized || null;
}

function confidenceLabel(
  confidence: number | null | undefined,
  uiLanguage: SupportedUiLanguage,
): string | null {
  if (typeof confidence !== "number" || !Number.isFinite(confidence)) {
    return null;
  }

  const bounded = Math.min(1, Math.max(0, confidence));
  const percentage = Math.round(bounded * 100);

  return uiLanguage === "fr"
    ? `Confiance ${percentage} %`
    : `Confidence ${percentage}%`;
}

function normalizeCriteria(values: unknown[]): string[] {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .map((value) => {
      if (typeof value === "string") {
        return cleanText(value);
      }

      if (value && typeof value === "object") {
        const candidate = value as Record<string, unknown>;

        for (const key of ["criterion", "label", "title", "description", "value"]) {
          const text = candidate[key];
          if (typeof text === "string" && text.trim()) {
            return text.trim();
          }
        }
      }

      return null;
    })
    .filter((value): value is string => Boolean(value))
    .slice(0, 3);
}

export function DecisiveActionCard({
  action,
  adaptationExplanation,
  uiLanguage,
}: DecisiveActionCardProps) {
  if (!action) {
    return null;
  }

  const title = cleanText(action.title);
  const description = cleanText(action.description);
  const selectionReason = cleanText(action.selection_reason);
  const attentionResolution = cleanText(action.attention_resolution);
  const intentionProgress = cleanText(action.intention_progress);
  const mandateAlignment = cleanText(action.mandate_alignment);
  const expectedOutcome = cleanText(action.expected_outcome);
  const timeHorizon = cleanText(action.time_horizon);
  const confidence = confidenceLabel(action.decision_confidence, uiLanguage);
  const successCriteria = normalizeCriteria(action.success_criteria_json);
  const previousLearning = cleanText(adaptationExplanation?.previous_learning);
  const focusChange = cleanText(adaptationExplanation?.focus_change);
  const whyThisFocusNow = cleanText(adaptationExplanation?.why_this_focus_now);

  const adaptationItems = [
    previousLearning
      ? {
          label:
            uiLanguage === "fr"
              ? "Ce que le cycle précédent nous a appris"
              : "What the previous cycle taught us",
          value: previousLearning,
        }
      : null,
    focusChange
      ? {
          label:
            uiLanguage === "fr"
              ? "Ce qui change dans le focus"
              : "What changes in the focus",
          value: focusChange,
        }
      : null,
    whyThisFocusNow
      ? {
          label:
            uiLanguage === "fr"
              ? "Pourquoi ce focus maintenant"
              : "Why this focus now",
          value: whyThisFocusNow,
        }
      : null,
  ].filter(
    (
      item,
    ): item is {
      label: string;
      value: string;
    } => Boolean(item),
  );


  if (
    !title &&
    !description &&
    !selectionReason &&
    !attentionResolution &&
    !intentionProgress &&
    !mandateAlignment
  ) {
    return null;
  }

  const explanations = [
    attentionResolution
      ? {
          label:
            uiLanguage === "fr"
              ? "Pourquoi maintenant"
              : "Why now",
          value: attentionResolution,
        }
      : null,
    intentionProgress
      ? {
          label:
            uiLanguage === "fr"
              ? "Ce que cela fait avancer"
              : "What this moves forward",
          value: intentionProgress,
        }
      : null,
    mandateAlignment
      ? {
          label:
            uiLanguage === "fr"
              ? "Ce que cela protège"
              : "What this protects",
          value: mandateAlignment,
        }
      : null,
  ].filter(
    (
      item,
    ): item is {
      label: string;
      value: string;
    } => Boolean(item),
  );

  return (
    <section
      aria-label={
        uiLanguage === "fr"
          ? "Action décisive"
          : "Decisive action"
      }
      className="card stack"
      style={{
        gap: 18,
        position: "relative",
        overflow: "hidden",
        borderRadius: 32,
        border: "1px solid rgba(43,33,24,0.08)",
        background:
          "linear-gradient(135deg, rgba(255,248,239,0.96), rgba(255,255,255,0.94) 56%, rgba(232,248,246,0.86))",
        boxShadow: "0 22px 60px rgba(43,33,24,0.07)",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          right: -100,
          top: -120,
          width: 270,
          height: 270,
          borderRadius: 999,
          background: "rgba(255,122,89,0.12)",
          pointerEvents: "none",
        }}
      />

      <div
        className="stack"
        style={{
          gap: 18,
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          className="row space-between"
          style={{
            alignItems: "flex-start",
            gap: 14,
            flexWrap: "wrap",
          }}
        >
          <div className="stack" style={{ gap: 8, maxWidth: 820 }}>
            <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
              <BadgePill icon={<TargetIcon size={14} />}>
                {uiLanguage === "fr"
                  ? "Action décisive"
                  : "Decisive action"}
              </BadgePill>

              {confidence ? (
                <BadgePill icon={<SparkIcon size={14} />}>
                  {confidence}
                </BadgePill>
              ) : null}

              {timeHorizon ? (
                <BadgePill icon={<ClockIcon size={14} />}>
                  {timeHorizon}
                </BadgePill>
              ) : null}
            </div>

            <div
              style={{
                fontSize: 13,
                fontWeight: 850,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--coach-accent)",
              }}
            >
              {uiLanguage === "fr"
                ? "Ce qui mérite ton attention maintenant"
                : "What deserves your attention now"}
            </div>

            {title ? (
              <div
                style={{
                  fontSize: 30,
                  lineHeight: 1.12,
                  fontWeight: 950,
                  letterSpacing: "-0.055em",
                  color: "var(--coach-ink)",
                }}
              >
                {title}
              </div>
            ) : null}

            {description ? (
              <div
                className="muted"
                style={{
                  maxWidth: 820,
                  color: "var(--coach-muted)",
                  lineHeight: 1.7,
                  fontSize: 15,
                }}
              >
                {description}
              </div>
            ) : null}
          </div>
        </div>

        {adaptationItems.length > 0 ? (
          <div
            className="card-soft stack"
            style={{
              gap: 12,
              borderRadius: 24,
              background: "rgba(255,255,255,0.78)",
              border: "1px solid rgba(43,33,24,0.08)",
            }}
          >
            <div className="stack" style={{ gap: 4 }}>
              <strong style={{ color: "var(--coach-ink)" }}>
                {uiLanguage === "fr"
                  ? "Pourquoi le focus évolue"
                  : "Why the focus is evolving"}
              </strong>
              <div
                className="muted"
                style={{
                  color: "var(--coach-muted)",
                  lineHeight: 1.55,
                  fontSize: 13,
                }}
              >
                {uiLanguage === "fr"
                  ? "Ce changement s'appuie sur ce qui a été observé dans le cycle précédent."
                  : "This change builds on what was observed in the previous cycle."}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 10,
              }}
            >
              {adaptationItems.map((item) => (
                <div
                  key={item.label}
                  className="stack"
                  style={{
                    gap: 5,
                    padding: 14,
                    borderRadius: 18,
                    background: "rgba(255,248,239,0.72)",
                    border: "1px solid rgba(43,33,24,0.06)",
                  }}
                >
                  <strong
                    style={{
                      color: "var(--coach-ink)",
                      fontSize: 13,
                    }}
                  >
                    {item.label}
                  </strong>
                  <div
                    className="muted"
                    style={{
                      color: "var(--coach-muted)",
                      lineHeight: 1.55,
                      fontSize: 13,
                    }}
                  >
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {selectionReason ? (
          <div
            className="card-soft stack"
            style={{
              gap: 6,
              borderRadius: 22,
              background: "rgba(255,255,255,0.72)",
              border: "1px solid rgba(43,33,24,0.08)",
            }}
          >
            <strong style={{ color: "var(--coach-ink)" }}>
              {uiLanguage === "fr"
                ? "Pourquoi cette action"
                : "Why this action"}
            </strong>
            <div
              className="muted"
              style={{
                color: "var(--coach-muted)",
                lineHeight: 1.65,
                fontSize: 14,
              }}
            >
              {selectionReason}
            </div>
          </div>
        ) : null}

        {explanations.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 12,
            }}
          >
            {explanations.map((item) => (
              <div
                key={item.label}
                className="card-soft stack"
                style={{
                  gap: 7,
                  borderRadius: 20,
                  background: "rgba(255,255,255,0.68)",
                  border: "1px solid rgba(43,33,24,0.07)",
                }}
              >
                <strong
                  style={{
                    color: "var(--coach-ink)",
                    fontSize: 14,
                  }}
                >
                  {item.label}
                </strong>
                <div
                  className="muted"
                  style={{
                    color: "var(--coach-muted)",
                    lineHeight: 1.6,
                    fontSize: 13,
                  }}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {expectedOutcome || successCriteria.length > 0 ? (
          <div
            className="stack"
            style={{
              gap: 10,
              paddingTop: 2,
            }}
          >
            {expectedOutcome ? (
              <div className="row" style={{ gap: 8, alignItems: "flex-start" }}>
                <CheckCircleIcon size={16} />
                <div>
                  <strong style={{ color: "var(--coach-ink)" }}>
                    {uiLanguage === "fr"
                      ? "Résultat attendu"
                      : "Expected outcome"}
                  </strong>
                  <div
                    className="muted"
                    style={{
                      marginTop: 3,
                      color: "var(--coach-muted)",
                      lineHeight: 1.55,
                      fontSize: 13,
                    }}
                  >
                    {expectedOutcome}
                  </div>
                </div>
              </div>
            ) : null}

            {successCriteria.length > 0 ? (
              <div className="stack" style={{ gap: 7 }}>
                <strong
                  style={{
                    color: "var(--coach-ink)",
                    fontSize: 14,
                  }}
                >
                  {uiLanguage === "fr"
                    ? "Comment savoir que c'est fait"
                    : "How to know it is done"}
                </strong>

                {successCriteria.map((criterion) => (
                  <div
                    key={criterion}
                    className="row"
                    style={{
                      gap: 8,
                      alignItems: "flex-start",
                    }}
                  >
                    <CheckCircleIcon size={14} />
                    <span
                      className="muted"
                      style={{
                        color: "var(--coach-muted)",
                        lineHeight: 1.55,
                        fontSize: 13,
                      }}
                    >
                      {criterion}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}