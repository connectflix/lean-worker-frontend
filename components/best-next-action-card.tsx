"use client";

import type { Recommendation } from "@/lib/types";
import { getUiCopy } from "@/lib/ui-copy";
import type { SupportedUiLanguage } from "@/lib/user-locales";
import {
  ActionListIcon,
  ArrowRightIcon,
  BadgePill,
  CheckCircleIcon,
  ClockIcon,
  LayerIcon,
  SparkIcon,
  TargetIcon,
} from "@/components/ui-flat-icons";

function localizePriority(
  priority: string | null | undefined,
  uiLanguage: SupportedUiLanguage,
): string {
  const value = (priority || "").trim().toLowerCase();

  if (uiLanguage === "fr") {
    if (value === "high") return "priorité haute";
    if (value === "medium") return "priorité moyenne";
    if (value === "low") return "priorité basse";
  }

  if (value === "high") return "high priority";
  if (value === "medium") return "medium priority";
  if (value === "low") return "low priority";

  return priority || "—";
}

function localizeStatus(
  status: string | null | undefined,
  uiLanguage: SupportedUiLanguage,
): string {
  const value = (status || "").trim().toLowerCase();

  if (uiLanguage === "fr") {
    if (value === "open") return "ouverte";
    if (value === "in_progress") return "en cours";
    if (value === "completed") return "terminée";
    if (value === "dismissed") return "écartée";
  }

  if (value === "open") return "open";
  if (value === "in_progress") return "in progress";
  if (value === "completed") return "completed";
  if (value === "dismissed") return "dismissed";

  return status || "—";
}

function localizeLeverType(
  leverType: string | null | undefined,
  uiLanguage: SupportedUiLanguage,
): string {
  const value = (leverType || "").trim().toLowerCase();

  if (uiLanguage === "fr") {
    if (value === "ai guide") return "guide IA";
    if (value === "coach") return "coach";
    if (value === "mentor") return "mentor";
    if (value === "therapist") return "thérapeute";
    if (value === "book") return "livre";
    if (value === "training") return "formation";
    if (value === "job opportunity") return "opportunité d’emploi";
  }

  return leverType || "—";
}

function getPriorityTone(priority: string | null | undefined) {
  const value = (priority || "").trim().toLowerCase();

  if (value === "high") {
    return {
      background: "rgba(255,122,89,0.14)",
      border: "1px solid rgba(255,122,89,0.24)",
      color: "var(--coach-accent)",
      icon: <TargetIcon size={14} />,
    };
  }

  if (value === "medium") {
    return {
      background: "rgba(88,180,174,0.13)",
      border: "1px solid rgba(88,180,174,0.22)",
      color: "var(--coach-calm)",
      icon: <ClockIcon size={14} />,
    };
  }

  return {
    background: "rgba(43,33,24,0.05)",
    border: "1px solid rgba(43,33,24,0.10)",
    color: "var(--coach-muted)",
    icon: <CheckCircleIcon size={14} />,
  };
}

export function BestNextActionCard({
  recommendation,
  uiLanguage = "en",
}: {
  recommendation: Recommendation;
  uiLanguage?: SupportedUiLanguage;
}) {
  const copy = getUiCopy(uiLanguage);

  const levers = Array.isArray(recommendation.levers) ? recommendation.levers : [];
  const bestLever = levers.find((lever) => lever.is_highlighted) ?? levers[0] ?? null;

  const localizedPriority = localizePriority(recommendation.priority, uiLanguage);
  const localizedStatus = localizeStatus(recommendation.status, uiLanguage);
  const localizedLeverType = localizeLeverType(bestLever?.type, uiLanguage);
  const priorityTone = getPriorityTone(recommendation.priority);

  return (
    <div
      className="card stack"
      style={{
        gap: 18,
        position: "relative",
        overflow: "hidden",
        borderRadius: 32,
        border: "1px solid rgba(43,33,24,0.08)",
        background:
          "linear-gradient(135deg, rgba(255,241,220,0.94), rgba(255,255,255,0.92) 54%, rgba(232,248,246,0.88))",
        boxShadow: "0 22px 60px rgba(43,33,24,0.07)",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          right: -110,
          top: -120,
          width: 280,
          height: 280,
          borderRadius: 999,
          background: "rgba(255,122,89,0.15)",
          pointerEvents: "none",
        }}
      />

      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "48%",
          bottom: -145,
          width: 320,
          height: 320,
          borderRadius: 999,
          background: "rgba(88,180,174,0.13)",
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
          <div className="stack" style={{ gap: 8, maxWidth: 760 }}>
            <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
              <span
                className="badge"
                style={{
                  background: "rgba(255,122,89,0.12)",
                  borderColor: "rgba(255,122,89,0.22)",
                  color: "var(--coach-accent)",
                  fontWeight: 850,
                }}
              >
                <SparkIcon size={14} />
                {uiLanguage === "fr" ? "Action prioritaire" : "Priority action"}
              </span>

              <span
                className="badge"
                style={{
                  background: "rgba(88,180,174,0.12)",
                  borderColor: "rgba(88,180,174,0.22)",
                  color: "var(--coach-calm)",
                  fontWeight: 850,
                }}
              >
                <TargetIcon size={14} />
                {uiLanguage === "fr" ? "Recommandation coach" : "Coach recommendation"}
              </span>
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
              {uiLanguage === "fr" ? "Prochaine meilleure action" : "Best next action"}
            </div>

            <div
              style={{
                fontSize: 30,
                lineHeight: 1.12,
                fontWeight: 950,
                letterSpacing: "-0.055em",
                color: "var(--coach-ink)",
              }}
            >
              {recommendation.title}
            </div>

            <div
              className="muted"
              style={{
                maxWidth: 820,
                color: "var(--coach-muted)",
                lineHeight: 1.7,
                fontSize: 15,
              }}
            >
              {recommendation.description}
            </div>
          </div>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              borderRadius: 999,
              padding: "8px 12px",
              background: priorityTone.background,
              border: priorityTone.border,
              color: priorityTone.color,
              fontSize: 12,
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.045em",
              whiteSpace: "nowrap",
            }}
          >
            {priorityTone.icon}
            {localizedPriority}
          </div>
        </div>

        {bestLever ? (
          <div
            className="card-soft stack"
            style={{
              gap: 14,
              borderRadius: 26,
              background: "rgba(255,255,255,0.72)",
              border: "1px solid rgba(43,33,24,0.08)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.74)",
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
              <div className="stack" style={{ gap: 10, minWidth: 0, flex: "1 1 360px" }}>
                <div className="row" style={{ gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 15,
                      display: "grid",
                      placeItems: "center",
                      background: "rgba(88,180,174,0.12)",
                      border: "1px solid rgba(88,180,174,0.20)",
                      color: "var(--coach-calm)",
                      flexShrink: 0,
                    }}
                  >
                    <LayerIcon size={18} />
                  </div>

                  <div className="stack" style={{ gap: 2, minWidth: 0 }}>
                    <strong
                      style={{
                        color: "var(--coach-ink)",
                        fontSize: 16,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {bestLever.name}
                    </strong>

                    <div
                      className="muted"
                      style={{
                        color: "var(--coach-muted)",
                        fontSize: 13,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <LayerIcon size={13} />
                      {localizedLeverType}
                    </div>
                  </div>
                </div>

                <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                  <BadgePill icon={<SparkIcon size={14} />}>
                    {copy.recommendations.bestMatch}
                  </BadgePill>

                  <BadgePill icon={<ActionListIcon size={14} />}>
                    {copy.recommendations.status}: {localizedStatus}
                  </BadgePill>
                </div>

                {bestLever.match_reason ? (
                  <div
                    className="muted"
                    style={{
                      color: "var(--coach-muted)",
                      fontSize: 13,
                      lineHeight: 1.6,
                    }}
                  >
                    {bestLever.match_reason}
                  </div>
                ) : null}
              </div>

              {bestLever.url ? (
                <a
                  href={bestLever.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button"
                  style={{
                    background: "var(--coach-accent)",
                    minHeight: 44,
                    paddingInline: 18,
                    boxShadow: "0 10px 24px rgba(255,122,89,0.18)",
                  }}
                >
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                    <ArrowRightIcon size={14} />
                    {copy.common.open}
                  </span>
                </a>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
          <BadgePill icon={<ActionListIcon size={14} />}>
            {copy.recommendations.status}: {localizedStatus}
          </BadgePill>

          {recommendation.started_at ? (
            <BadgePill icon={<ClockIcon size={14} />}>
              {copy.recommendations.started}:{" "}
              {new Date(recommendation.started_at).toLocaleDateString()}
            </BadgePill>
          ) : null}
        </div>
      </div>
    </div>
  );
}