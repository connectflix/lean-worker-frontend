"use client";

import { BadgePill, CheckCircleIcon, SparkIcon, TargetIcon } from "@/components/ui-flat-icons";
import type { Recommendation } from "@/lib/types";
import type { SupportedUiLanguage } from "@/lib/user-locales";

function getPriorityLabel(priority: string, uiLanguage: SupportedUiLanguage): string {
  if (uiLanguage === "fr") {
    if (priority === "high") return "priorité haute";
    if (priority === "medium") return "priorité moyenne";
    if (priority === "low") return "priorité basse";
  }
  return priority;
}

function getStatusLabel(status: Recommendation["status"], uiLanguage: SupportedUiLanguage): string {
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

  return (
    <div className="card-soft stack" style={{ gap: 12 }}>
      <div className="row space-between" style={{ alignItems: "flex-start", gap: 12 }}>
        <div className="stack" style={{ gap: 6, flex: 1, minWidth: 0 }}>
          <div className="section-title">{item.title}</div>
          <div className="muted">{shortDescription}</div>
        </div>

        <BadgePill icon={<TargetIcon size={14} />}>
          {getPriorityLabel(item.priority, uiLanguage)}
        </BadgePill>
      </div>

      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
        <BadgePill icon={<CheckCircleIcon size={14} />}>
          {getStatusLabel(item.status, uiLanguage)}
        </BadgePill>

        {item.primary_problem ? (
          <BadgePill icon={<SparkIcon size={14} />}>
            {item.primary_problem.replaceAll("_", " ")}
          </BadgePill>
        ) : null}

        {item.artifact_generation_available ? (
          <BadgePill icon={<SparkIcon size={14} />}>
            {uiLanguage === "fr" ? "Guide IA possible" : "AI guide available"}
          </BadgePill>
        ) : null}
      </div>

      <div className="row space-between" style={{ gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div className="muted">
          {item.action_track
            ? uiLanguage === "fr"
              ? `Action clé : ${item.action_track.replaceAll("_", " ")}`
              : `Key action: ${item.action_track.replaceAll("_", " ")}`
            : uiLanguage === "fr"
              ? "Ouvre cette recommandation pour voir les prochaines étapes."
              : "Open this recommendation to view the next steps."}
        </div>

        <button className="button" onClick={onOpen} type="button">
          {uiLanguage === "fr" ? "Voir détails" : "View details"}
        </button>
      </div>
    </div>
  );
}