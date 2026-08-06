"use client";

import type { ProblemDetection } from "@/lib/types";
import type { SupportedUiLanguage } from "@/lib/user-locales";
import {
  ActionListIcon,
  BadgePill,
  BrainIcon,
  ClockIcon,
  SparkIcon,
  TargetIcon,
} from "@/components/ui-flat-icons";

function prettify(value: string | null | undefined): string {
  if (!value) return "—";

  return value
    .replaceAll("_", " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getSeverityLabel(
  severity: string | null | undefined,
  uiLanguage: SupportedUiLanguage,
): string {
  const value = (severity || "").toLowerCase();

  if (uiLanguage === "fr") {
    if (value === "critical") return "Critique";
    if (value === "high") return "Élevée";
    if (value === "medium") return "Moyenne";
    if (value === "low") return "Faible";
    return prettify(severity);
  }

  if (value === "critical") return "Critical";
  if (value === "high") return "High";
  if (value === "medium") return "Medium";
  if (value === "low") return "Low";
  return prettify(severity);
}

function getUrgencyLabel(
  urgency: string | null | undefined,
  uiLanguage: SupportedUiLanguage,
): string {
  const value = (urgency || "").toLowerCase();

  if (uiLanguage === "fr") {
    if (value === "critical") return "Critique";
    if (value === "urgent") return "Urgente";
    if (value === "high") return "Élevée";
    if (value === "medium") return "Moyenne";
    if (value === "low") return "Faible";
    return prettify(urgency);
  }

  if (value === "critical") return "Critical";
  if (value === "urgent") return "Urgent";
  if (value === "high") return "High";
  if (value === "medium") return "Medium";
  if (value === "low") return "Low";
  return prettify(urgency);
}

function getSeverityTone(severity: string | null | undefined) {
  const value = (severity || "").toLowerCase();

  if (value === "critical" || value === "high") {
    return {
      background: "rgba(198,40,40,0.08)",
      borderColor: "rgba(198,40,40,0.16)",
      color: "var(--danger)",
    };
  }

  if (value === "medium") {
    return {
      background: "rgba(255,122,89,0.12)",
      borderColor: "rgba(255,122,89,0.20)",
      color: "var(--coach-accent)",
    };
  }

  return {
    background: "rgba(88,180,174,0.12)",
    borderColor: "rgba(88,180,174,0.20)",
    color: "var(--coach-calm)",
  };
}

function getUrgencyTone(urgency: string | null | undefined) {
  const value = (urgency || "").toLowerCase();

  if (value === "critical" || value === "high" || value === "urgent") {
    return {
      background: "rgba(255,122,89,0.12)",
      borderColor: "rgba(255,122,89,0.20)",
      color: "var(--coach-accent)",
    };
  }

  return {
    background: "rgba(43,33,24,0.05)",
    borderColor: "rgba(43,33,24,0.08)",
    color: "var(--coach-muted)",
  };
}

function InsightBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="card-soft stack"
      style={{
        gap: 8,
        borderRadius: 18,
        background: "rgba(255,248,239,0.68)",
        border: "1px solid rgba(43,33,24,0.08)",
      }}
    >
      <div
        className="muted"
        style={{
          color: "var(--coach-muted)",
          fontSize: 13,
          fontWeight: 700,
        }}
      >
        {title}
      </div>

      {children}
    </div>
  );
}

export function ProblemDetectionCard({
  item,
  uiLanguage = "fr",
}: {
  item: ProblemDetection;
  uiLanguage?: SupportedUiLanguage;
}) {
  const secondaryProblems = item.secondary_problems ?? [];
  const recommendedActionTracks = item.recommended_action_tracks ?? [];

  const copy =
    uiLanguage === "fr"
      ? {
          title: "Situation détectée",
          description:
            "Ce que le coach a compris de cette session et les directions utiles qui en ressortent.",
          badge: "Lecture du coach",
          primarySignal: "Signal principal",
          severity: "Intensité",
          urgency: "Urgence",
          relatedSignals: "Signaux associés",
          suggestedDirections: "Pistes recommandées",
          rationale: "Pourquoi ce signal a été détecté",
          noRationale: "Aucune justification détaillée n’est disponible.",
        }
      : {
          title: "Detected situation",
          description:
            "What the coach understood from this session and the useful directions that emerged.",
          badge: "Coach reading",
          primarySignal: "Primary signal",
          severity: "Severity",
          urgency: "Urgency",
          relatedSignals: "Related signals",
          suggestedDirections: "Suggested directions",
          rationale: "Why this signal was detected",
          noRationale: "No detailed rationale is available.",
        };

  return (
    <div
      className="card stack"
      lang={uiLanguage}
      style={{
        gap: 16,
        borderRadius: 24,
        border: "1px solid rgba(43,33,24,0.08)",
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.82), rgba(255,248,239,0.78))",
        boxShadow: "0 18px 48px rgba(43,33,24,0.06)",
      }}
    >
      <div
        className="row space-between"
        style={{ gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}
      >
        <div className="stack" style={{ gap: 7 }}>
          <div className="row" style={{ gap: 10, alignItems: "center" }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 16,
                display: "grid",
                placeItems: "center",
                background: "rgba(255,122,89,0.12)",
                border: "1px solid rgba(255,122,89,0.20)",
                color: "var(--coach-accent)",
              }}
            >
              <BrainIcon size={19} />
            </div>

            <div className="section-title" style={{ margin: 0 }}>
              {copy.title}
            </div>
          </div>

          <div
            className="muted"
            style={{
              color: "var(--coach-muted)",
              fontSize: 14,
              lineHeight: 1.55,
            }}
          >
            {copy.description}
          </div>
        </div>

        <BadgePill icon={<SparkIcon size={14} />}>{copy.badge}</BadgePill>
      </div>

      <div
        className="card-soft stack"
        style={{
          gap: 10,
          borderRadius: 20,
          background:
            "linear-gradient(135deg, rgba(255,241,220,0.88), rgba(255,255,255,0.76))",
          border: "1px solid rgba(43,33,24,0.08)",
        }}
      >
        <div
          className="muted"
          style={{
            color: "var(--coach-muted)",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {copy.primarySignal}
        </div>

        <div
          style={{
            fontSize: "clamp(21px, 3vw, 24px)",
            lineHeight: 1.12,
            fontWeight: 900,
            letterSpacing: "-0.045em",
            color: "var(--coach-ink)",
          }}
        >
          {prettify(item.primary_problem)}
        </div>

        <div
          className="muted"
          style={{
            color: "var(--coach-muted)",
            lineHeight: 1.55,
          }}
        >
          {prettify(item.problem_domain)}
        </div>
      </div>

      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
        <span
          className="badge"
          style={{
            ...getSeverityTone(item.severity),
            fontWeight: 850,
          }}
        >
          <TargetIcon size={14} />
          {copy.severity}: {getSeverityLabel(item.severity, uiLanguage)}
        </span>

        <span
          className="badge"
          style={{
            ...getUrgencyTone(item.urgency),
            fontWeight: 850,
          }}
        >
          <ClockIcon size={14} />
          {copy.urgency}: {getUrgencyLabel(item.urgency, uiLanguage)}
        </span>
      </div>

      {secondaryProblems.length > 0 ? (
        <InsightBlock title={copy.relatedSignals}>
          <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
            {secondaryProblems.map((problem) => (
              <BadgePill key={problem} icon={<SparkIcon size={14} />}>
                {prettify(problem)}
              </BadgePill>
            ))}
          </div>
        </InsightBlock>
      ) : null}

      {recommendedActionTracks.length > 0 ? (
        <InsightBlock title={copy.suggestedDirections}>
          <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
            {recommendedActionTracks.map((track) => (
              <BadgePill key={track} icon={<ActionListIcon size={14} />}>
                {prettify(track)}
              </BadgePill>
            ))}
          </div>
        </InsightBlock>
      ) : null}

      <div
        className="card-soft stack"
        style={{
          gap: 8,
          borderRadius: 20,
          background: "rgba(255,255,255,0.70)",
          border: "1px solid rgba(43,33,24,0.08)",
        }}
      >
        <div
          className="muted"
          style={{
            color: "var(--coach-muted)",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {copy.rationale}
        </div>

        <div
          style={{
            color: "var(--coach-ink)",
            lineHeight: 1.7,
            whiteSpace: "pre-wrap",
          }}
        >
          {item.rationale?.trim() || copy.noRationale}
        </div>
      </div>
    </div>
  );
}