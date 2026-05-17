"use client";

import type { ProblemDetection } from "@/lib/types";
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
        borderRadius: 22,
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

export function ProblemDetectionCard({ item }: { item: ProblemDetection }) {
  const secondaryProblems = item.secondary_problems ?? [];
  const recommendedActionTracks = item.recommended_action_tracks ?? [];

  return (
    <div
      className="card stack"
      style={{
        gap: 18,
        borderRadius: 28,
        border: "1px solid rgba(43,33,24,0.08)",
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.82), rgba(255,248,239,0.78))",
        boxShadow: "0 18px 48px rgba(43,33,24,0.06)",
      }}
    >
      <div className="row space-between" style={{ gap: 14, alignItems: "flex-start" }}>
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
              Detected situation
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
            What your coach understood from this session and how it translates into useful next
            directions.
          </div>
        </div>

        <BadgePill icon={<SparkIcon size={14} />}>AI reading</BadgePill>
      </div>

      <div
        className="card-soft stack"
        style={{
          gap: 10,
          borderRadius: 24,
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
          Primary signal
        </div>

        <div
          style={{
            fontSize: 24,
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
          Severity: {prettify(item.severity)}
        </span>

        <span
          className="badge"
          style={{
            ...getUrgencyTone(item.urgency),
            fontWeight: 850,
          }}
        >
          <ClockIcon size={14} />
          Urgency: {prettify(item.urgency)}
        </span>
      </div>

      {secondaryProblems.length > 0 ? (
        <InsightBlock title="Related signals">
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
        <InsightBlock title="Suggested directions">
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
          borderRadius: 24,
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
          Why this was detected
        </div>

        <div
          style={{
            color: "var(--coach-ink)",
            lineHeight: 1.7,
            whiteSpace: "pre-wrap",
          }}
        >
          {item.rationale || "—"}
        </div>
      </div>
    </div>
  );
}