"use client";

import type {
  LeverDecisionResponse,
  LeverLearningExperience,
} from "@/lib/types";
import type { SupportedUiLanguage } from "@/lib/user-locales";
import {
  BadgePill,
  CheckCircleIcon,
  SparkIcon,
  TargetIcon,
} from "@/components/ui-flat-icons";

type DeterminingLeverCardProps = {
  decision: LeverDecisionResponse | null | undefined;
  learningExperience?: LeverLearningExperience | null;
  uiLanguage: SupportedUiLanguage;
};

function cleanText(value: string | null | undefined): string | null {
  const normalized = (value || "").trim();
  return normalized || null;
}

function localizeLeverType(
  value: string | null | undefined,
  uiLanguage: SupportedUiLanguage,
): string | null {
  const normalized = cleanText(value);
  if (!normalized) return null;

  const key = normalized.toLowerCase();

  if (uiLanguage === "fr") {
    const labels: Record<string, string> = {
      "ai guide": "Guide IA",
      coach: "Coach",
      mentor: "Mentor",
      therapist: "Thérapeute",
      book: "Livre",
      training: "Formation",
      program: "Programme",
      "job opportunity": "Opportunité professionnelle",
      engager: "Engager",
      developer: "Développer",
      transformer: "Transformer",
      employer: "Employeur",
      "ai-enabled-developer": "Développement assisté par IA",
    };

    return labels[key] ?? normalized.replaceAll("_", " ");
  }

  return normalized.replaceAll("_", " ");
}

function confidenceLabel(
  value: number | null | undefined,
  uiLanguage: SupportedUiLanguage,
): string | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  const bounded = Math.min(1, Math.max(0, value));
  const percentage = Math.round(bounded * 100);

  return uiLanguage === "fr"
    ? `Confiance ${percentage} %`
    : `Confidence ${percentage}%`;
}

function safeExternalUrl(value: string | null | undefined): string | null {
  const normalized = cleanText(value);
  if (!normalized) return null;

  try {
    const parsed = new URL(normalized);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

export function DeterminingLeverCard({
  decision,
  learningExperience,
  uiLanguage,
}: DeterminingLeverCardProps) {
  if (
    !decision ||
    decision.lever_needed !== true ||
    decision.selected_lever_id == null
  ) {
    return null;
  }

  const name = cleanText(decision.selected_lever_name);
  const description = cleanText(decision.selected_lever_description);
  const leverType = localizeLeverType(
    decision.selected_lever_type,
    uiLanguage,
  );
  const selectionReason = cleanText(decision.selection_reason);
  const determinacyReason = cleanText(decision.determinacy_reason);
  const pragmaticReason = cleanText(decision.pragmatic_reason);
  const confidence = confidenceLabel(decision.confidence, uiLanguage);
  const leverUrl = safeExternalUrl(decision.selected_lever_url);
  const learningExplanation = cleanText(
    learningExperience?.learning_explanation,
  );

  if (
    !name &&
    !description &&
    !selectionReason &&
    !determinacyReason &&
    !pragmaticReason
  ) {
    return null;
  }

  const reasons = [
    determinacyReason
      ? {
          label:
            uiLanguage === "fr"
              ? "Pourquoi il est déterminant"
              : "Why it is determining",
          value: determinacyReason,
        }
      : null,
    pragmaticReason
      ? {
          label:
            uiLanguage === "fr"
              ? "Pourquoi il est utilisable maintenant"
              : "Why it is usable now",
          value: pragmaticReason,
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
          ? "Levier déterminant"
          : "Determining lever"
      }
      className="card stack"
      style={{
        gap: 18,
        position: "relative",
        overflow: "hidden",
        borderRadius: 30,
        border: "1px solid rgba(88,180,174,0.18)",
        background:
          "linear-gradient(135deg, rgba(237,251,249,0.96), rgba(255,255,255,0.95) 58%, rgba(255,248,239,0.82))",
        boxShadow: "0 20px 54px rgba(43,33,24,0.06)",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: -90,
          bottom: -115,
          width: 250,
          height: 250,
          borderRadius: 999,
          background: "rgba(88,180,174,0.10)",
          pointerEvents: "none",
        }}
      />

      <div
        className="stack"
        style={{
          gap: 16,
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          className="row space-between"
          style={{
            gap: 14,
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          <div className="stack" style={{ gap: 8, maxWidth: 820 }}>
            <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
              <BadgePill icon={<SparkIcon size={14} />}>
                {uiLanguage === "fr"
                  ? "Levier déterminant"
                  : "Determining lever"}
              </BadgePill>

              {leverType ? (
                <BadgePill icon={<TargetIcon size={14} />}>
                  {leverType}
                </BadgePill>
              ) : null}

              {confidence ? (
                <BadgePill icon={<CheckCircleIcon size={14} />}>
                  {confidence}
                </BadgePill>
              ) : null}
            </div>

            <div
              style={{
                fontSize: 13,
                fontWeight: 850,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--coach-calm)",
              }}
            >
              {uiLanguage === "fr"
                ? "Le support qui débloque l'action"
                : "The support that unlocks the action"}
            </div>

            {name ? (
              <div
                style={{
                  fontSize: 26,
                  lineHeight: 1.15,
                  fontWeight: 950,
                  letterSpacing: "-0.045em",
                  color: "var(--coach-ink)",
                }}
              >
                {name}
              </div>
            ) : null}

            {description ? (
              <div
                className="muted"
                style={{
                  color: "var(--coach-muted)",
                  lineHeight: 1.7,
                  fontSize: 14,
                  maxWidth: 820,
                }}
              >
                {description}
              </div>
            ) : null}
          </div>

          {leverUrl ? (
            <a
              className="button secondary"
              href={leverUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                textDecoration: "none",
                whiteSpace: "nowrap",
                minHeight: 42,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {uiLanguage === "fr"
                ? "Voir le levier"
                : "View lever"}
            </a>
          ) : null}
        </div>

        {selectionReason ? (
          <div
            className="card-soft stack"
            style={{
              gap: 6,
              borderRadius: 20,
              background: "rgba(255,255,255,0.72)",
              border: "1px solid rgba(88,180,174,0.14)",
            }}
          >
            <strong style={{ color: "var(--coach-ink)" }}>
              {uiLanguage === "fr"
                ? "Pourquoi ce levier"
                : "Why this lever"}
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

        {learningExplanation ? (
          <div
            className="card-soft stack"
            style={{
              gap: 6,
              borderRadius: 20,
              background: "rgba(255,255,255,0.68)",
              border: "1px solid rgba(88,180,174,0.12)",
            }}
          >
            <strong style={{ color: "var(--coach-ink)" }}>
              {uiLanguage === "fr"
                ? "Ce que ton expérience montre"
                : "What your experience shows"}
            </strong>
            <div
              className="muted"
              style={{
                color: "var(--coach-muted)",
                lineHeight: 1.65,
                fontSize: 14,
              }}
            >
              {learningExplanation}
            </div>
          </div>
        ) : null}

        {reasons.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 12,
            }}
          >
            {reasons.map((reason) => (
              <div
                key={reason.label}
                className="card-soft stack"
                style={{
                  gap: 7,
                  borderRadius: 20,
                  background: "rgba(255,255,255,0.66)",
                  border: "1px solid rgba(43,33,24,0.07)",
                }}
              >
                <strong
                  style={{
                    color: "var(--coach-ink)",
                    fontSize: 14,
                  }}
                >
                  {reason.label}
                </strong>
                <div
                  className="muted"
                  style={{
                    color: "var(--coach-muted)",
                    lineHeight: 1.6,
                    fontSize: 13,
                  }}
                >
                  {reason.value}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}