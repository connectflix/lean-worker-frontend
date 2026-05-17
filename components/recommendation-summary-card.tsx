"use client";

import {
  BadgePill,
  CheckCircleIcon,
  ClockIcon,
  SparkIcon,
  TargetIcon,
} from "@/components/ui-flat-icons";
import type { Recommendation } from "@/lib/types";
import type { SupportedUiLanguage } from "@/lib/user-locales";

function getPriorityLabel(priority: string, uiLanguage: SupportedUiLanguage): string {
  if (uiLanguage === "fr") {
    if (priority === "high") return "priorité haute";
    if (priority === "medium") return "priorité moyenne";
    if (priority === "low") return "priorité basse";
  }

  if (priority === "high") return "high priority";
  if (priority === "medium") return "medium priority";
  if (priority === "low") return "low priority";

  return priority;
}

function getStatusLabel(
  status: Recommendation["status"],
  uiLanguage: SupportedUiLanguage,
): string {
  if (uiLanguage === "fr") {
    if (status === "open") return "ouverte";
    if (status === "in_progress") return "en cours";
    if (status === "completed") return "terminée";
    if (status === "dismissed") return "fermée";
  }

  if (status === "open") return "open";
  if (status === "in_progress") return "in progress";
  if (status === "completed") return "completed";
  if (status === "dismissed") return "dismissed";

  return status;
}

function getPriorityTone(priority: string) {
  if (priority === "high") {
    return {
      background: "rgba(255,122,89,0.12)",
      borderColor: "rgba(255,122,89,0.22)",
      color: "var(--coach-accent)",
    };
  }

  if (priority === "medium") {
    return {
      background: "rgba(88,180,174,0.12)",
      borderColor: "rgba(88,180,174,0.22)",
      color: "var(--coach-calm)",
    };
  }

  return {
    background: "rgba(43,33,24,0.05)",
    borderColor: "rgba(43,33,24,0.10)",
    color: "var(--coach-muted)",
  };
}

function getStatusTone(status: Recommendation["status"]) {
  if (status === "completed") {
    return {
      background: "rgba(21,128,61,0.10)",
      borderColor: "rgba(21,128,61,0.20)",
      color: "var(--success)",
    };
  }

  if (status === "in_progress") {
    return {
      background: "rgba(88,180,174,0.12)",
      borderColor: "rgba(88,180,174,0.22)",
      color: "var(--coach-calm)",
    };
  }

  if (status === "dismissed") {
    return {
      background: "rgba(43,33,24,0.05)",
      borderColor: "rgba(43,33,24,0.10)",
      color: "var(--coach-muted)",
    };
  }

  return {
    background: "rgba(255,122,89,0.10)",
    borderColor: "rgba(255,122,89,0.20)",
    color: "var(--coach-accent)",
  };
}

function prettify(value: string): string {
  return value.replaceAll("_", " ");
}

export function RecommendationSummaryCard({
  item,
  uiLanguage = "en",
  onOpen,
}: {
  item: Recommendation;
  uiLanguage?: SupportedUiLanguage;
  onOpen: () => void;
}) {
  const shortDescription =
    item.description.length > 180
      ? `${item.description.slice(0, 177).trim()}...`
      : item.description;

  const priorityTone = getPriorityTone(item.priority);
  const statusTone = getStatusTone(item.status);

  const actionTrackLabel = item.action_track ? prettify(item.action_track) : null;
  const primaryProblemLabel = item.primary_problem ? prettify(item.primary_problem) : null;

  return (
    <div
      className="card-soft stack"
      style={{
        gap: 14,
        position: "relative",
        overflow: "hidden",
        borderRadius: 28,
        background:
          item.priority === "high"
            ? "linear-gradient(135deg, rgba(255,241,220,0.92), rgba(255,255,255,0.88))"
            : "rgba(255,255,255,0.74)",
        border:
          item.priority === "high"
            ? "1px solid rgba(255,122,89,0.18)"
            : "1px solid rgba(43,33,24,0.08)",
        boxShadow:
          item.priority === "high"
            ? "0 18px 46px rgba(255,122,89,0.08)"
            : "0 14px 38px rgba(43,33,24,0.045)",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          right: -70,
          top: -80,
          width: 190,
          height: 190,
          borderRadius: 999,
          background:
            item.priority === "high"
              ? "rgba(255,122,89,0.12)"
              : "rgba(88,180,174,0.08)",
          pointerEvents: "none",
        }}
      />

      <div
        className="row space-between"
        style={{
          alignItems: "flex-start",
          gap: 14,
          position: "relative",
          zIndex: 1,
        }}
      >
        <div className="stack" style={{ gap: 8, flex: 1, minWidth: 0 }}>
          <div className="row" style={{ gap: 10, alignItems: "flex-start" }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 16,
                display: "grid",
                placeItems: "center",
                background: priorityTone.background,
                border: `1px solid ${priorityTone.borderColor}`,
                color: priorityTone.color,
                flexShrink: 0,
              }}
            >
              <TargetIcon size={18} />
            </div>

            <div className="stack" style={{ gap: 6, minWidth: 0 }}>
              <div
                className="section-title"
                style={{
                  color: "var(--coach-ink)",
                  fontSize: 18,
                  lineHeight: 1.25,
                }}
              >
                {item.title}
              </div>

              <div
                className="muted"
                style={{
                  color: "var(--coach-muted)",
                  lineHeight: 1.65,
                }}
              >
                {shortDescription}
              </div>
            </div>
          </div>
        </div>

        <span
          className="badge"
          style={{
            background: priorityTone.background,
            borderColor: priorityTone.borderColor,
            color: priorityTone.color,
            fontWeight: 850,
            flexShrink: 0,
          }}
        >
          <TargetIcon size={14} />
          {getPriorityLabel(item.priority, uiLanguage)}
        </span>
      </div>

      <div
        className="row"
        style={{
          gap: 8,
          flexWrap: "wrap",
          position: "relative",
          zIndex: 1,
        }}
      >
        <span
          className="badge"
          style={{
            background: statusTone.background,
            borderColor: statusTone.borderColor,
            color: statusTone.color,
            fontWeight: 750,
          }}
        >
          <CheckCircleIcon size={14} />
          {getStatusLabel(item.status, uiLanguage)}
        </span>

        {primaryProblemLabel ? (
          <BadgePill icon={<SparkIcon size={14} />}>{primaryProblemLabel}</BadgePill>
        ) : null}

        {item.artifact_generation_available ? (
          <span
            className="badge"
            style={{
              background: "rgba(88,180,174,0.12)",
              borderColor: "rgba(88,180,174,0.22)",
              color: "var(--coach-calm)",
              fontWeight: 750,
            }}
          >
            <SparkIcon size={14} />
            {uiLanguage === "fr" ? "Guide IA possible" : "AI guide available"}
          </span>
        ) : null}
      </div>

      <div
        className="row space-between"
        style={{
          gap: 14,
          alignItems: "center",
          flexWrap: "wrap",
          position: "relative",
          zIndex: 1,
          paddingTop: 12,
          borderTop: "1px solid rgba(43,33,24,0.08)",
        }}
      >
        <div
          className="muted"
          style={{
            color: "var(--coach-muted)",
            lineHeight: 1.55,
            flex: "1 1 320px",
          }}
        >
          {actionTrackLabel ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
              <ClockIcon size={14} />
              {uiLanguage === "fr"
                ? `Action clé : ${actionTrackLabel}`
                : `Key action: ${actionTrackLabel}`}
            </span>
          ) : uiLanguage === "fr" ? (
            "Ouvre cette recommandation pour voir les prochaines étapes."
          ) : (
            "Open this recommendation to view the next steps."
          )}
        </div>

        <button
          className="button"
          onClick={onOpen}
          type="button"
          style={{
            background: "var(--coach-accent)",
            borderColor: "var(--coach-accent)",
            minHeight: 42,
          }}
        >
          {uiLanguage === "fr" ? "Voir détails" : "View details"}
        </button>
      </div>
    </div>
  );
}