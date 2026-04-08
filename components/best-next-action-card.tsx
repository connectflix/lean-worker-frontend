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
    if (value === "high") return "haute";
    if (value === "medium") return "moyenne";
    if (value === "low") return "basse";
  }

  if (value === "high") return "high";
  if (value === "medium") return "medium";
  if (value === "low") return "low";

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

export function BestNextActionCard({
  recommendation,
  uiLanguage = "en",
}: {
  recommendation: Recommendation;
  uiLanguage?: SupportedUiLanguage;
}) {
  const copy = getUiCopy(uiLanguage);

  const levers = Array.isArray(recommendation.levers) ? recommendation.levers : [];
  const bestLever = levers.find((l) => l.is_highlighted) ?? levers[0] ?? null;

  const localizedPriority = localizePriority(recommendation.priority, uiLanguage);
  const localizedStatus = localizeStatus(recommendation.status, uiLanguage);
  const localizedLeverType = localizeLeverType(bestLever?.type, uiLanguage);

  const priorityIcon =
    recommendation.priority === "high" ? (
      <TargetIcon size={14} />
    ) : recommendation.priority === "medium" ? (
      <ClockIcon size={14} />
    ) : (
      <CheckCircleIcon size={14} />
    );

  return (
    <div
      className="card stack"
      style={{
        border: "1px solid rgba(37,99,235,0.18)",
        background:
          "linear-gradient(180deg, rgba(37,99,235,0.08), rgba(255,255,255,0.92))",
        gap: 16,
      }}
    >
      <div className="row space-between" style={{ alignItems: "center", gap: 12 }}>
        <div
          className="section-title"
          style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
        >
          <TargetIcon />
          {uiLanguage === "fr" ? "Prochaine meilleure action" : "Best next action"}
        </div>

        <BadgePill icon={priorityIcon}>{localizedPriority}</BadgePill>
      </div>

      <div style={{ fontSize: 18, fontWeight: 600 }}>{recommendation.title}</div>

      <div className="muted">{recommendation.description}</div>

      {bestLever && (
        <div className="card-soft stack" style={{ gap: 10 }}>
          <div className="row space-between" style={{ alignItems: "flex-start", gap: 12 }}>
            <div className="stack" style={{ gap: 6 }}>
              <div className="row" style={{ gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <strong>{bestLever.name}</strong>

                <BadgePill icon={<SparkIcon size={14} />}>
                  {copy.recommendations.bestMatch}
                </BadgePill>
              </div>

              <div
                className="muted"
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <LayerIcon size={14} />
                {localizedLeverType}
              </div>

              {bestLever.match_reason && (
                <div className="muted" style={{ fontSize: 12 }}>
                  {bestLever.match_reason}
                </div>
              )}
            </div>

            {bestLever.url ? (
              <a
                href={bestLever.url}
                target="_blank"
                rel="noopener noreferrer"
                className="button"
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <ArrowRightIcon size={14} />
                  {copy.common.open}
                </span>
              </a>
            ) : null}
          </div>
        </div>
      )}

      <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
        <BadgePill icon={<ActionListIcon size={14} />}>
          {copy.recommendations.status}: {localizedStatus}
        </BadgePill>

        {recommendation.started_at && (
          <BadgePill icon={<ClockIcon size={14} />}>
            {copy.recommendations.started}:{" "}
            {new Date(recommendation.started_at).toLocaleDateString()}
          </BadgePill>
        )}
      </div>
    </div>
  );
}