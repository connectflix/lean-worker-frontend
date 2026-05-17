"use client";

import { useMemo } from "react";
import type { Recommendation } from "@/lib/types";
import type { SupportedUiLanguage } from "@/lib/user-locales";
import {
  ActionListIcon,
  BadgePill,
  BrainIcon,
  ClockIcon,
  PathIcon,
  SessionIcon,
  SparkIcon,
  TargetIcon,
} from "@/components/ui-flat-icons";

type CareerGapResponse = {
  key_gap_summary?: string | null;
  current_role?: string | null;
  short_term_role?: string | null;
  short_term_level?: string | null;
  mid_term_role?: string | null;
  mid_term_level?: string | null;
  long_term_role?: string | null;
  long_term_level?: string | null;
};

function getCoachModeLabel(
  mode: string | undefined,
  uiLanguage: SupportedUiLanguage,
): string | null {
  if (!mode) return null;

  const labels =
    uiLanguage === "fr"
      ? {
          coach_opening: "Ouverture",
          coach_exploration: "Exploration",
          coach_reflection: "Réflexion",
          coach_trajectory: "Trajectoire",
          coach_actionable: "Action",
          coach_regulation: "Stabilisation",
        }
      : {
          coach_opening: "Opening",
          coach_exploration: "Exploration",
          coach_reflection: "Reflection",
          coach_trajectory: "Trajectory",
          coach_actionable: "Action",
          coach_regulation: "Stabilization",
        };

  return labels[mode as keyof typeof labels] ?? null;
}

function getCoachIntentLabel(
  intent: string | undefined,
  uiLanguage: SupportedUiLanguage,
): string | null {
  if (!intent) return null;

  const labels =
    uiLanguage === "fr"
      ? {
          clarify: "Clarification",
          reframe: "Reformulation",
          prioritize: "Priorisation",
          sequence: "Structuration",
          encourage: "Renforcement",
          challenge_softly: "Tension douce",
        }
      : {
          clarify: "Clarification",
          reframe: "Reframing",
          prioritize: "Prioritization",
          sequence: "Sequencing",
          encourage: "Encouragement",
          challenge_softly: "Soft challenge",
        };

  return labels[intent as keyof typeof labels] ?? null;
}

function getDerivedCoachStyle(
  mode: string | undefined,
  intent: string | undefined,
  uiLanguage: SupportedUiLanguage,
): string {
  const mapFr: Record<string, string> = {
    "coach_opening:encourage": "Accueillant et chaleureux",
    "coach_exploration:clarify": "Curieux et clarifiant",
    "coach_reflection:encourage": "Empathique et soutenant",
    "coach_reflection:sequence": "Réflexif et structurant",
    "coach_trajectory:reframe": "Stratégique et recadrant",
    "coach_trajectory:sequence": "Stratégique et organisé",
    "coach_actionable:prioritize": "Direct et orienté action",
    "coach_regulation:sequence": "Calme et contenant",
    default: "Adaptatif et contextuel",
  };

  const mapEn: Record<string, string> = {
    "coach_opening:encourage": "Warm and welcoming",
    "coach_exploration:clarify": "Curious and clarifying",
    "coach_reflection:encourage": "Empathic and supportive",
    "coach_reflection:sequence": "Reflective and structuring",
    "coach_trajectory:reframe": "Strategic and reframing",
    "coach_trajectory:sequence": "Strategic and organized",
    "coach_actionable:prioritize": "Direct and action-oriented",
    "coach_regulation:sequence": "Calm and containing",
    default: "Adaptive and contextual",
  };

  const key = `${mode || ""}:${intent || ""}`;
  return uiLanguage === "fr" ? mapFr[key] || mapFr.default : mapEn[key] || mapEn.default;
}

function getStatusLabel(
  status: Recommendation["status"],
  copy: {
    statusOpen: string;
    statusInProgress: string;
    statusOther: string;
  },
): string {
  if (status === "in_progress") return copy.statusInProgress;
  if (status === "open") return copy.statusOpen;
  return copy.statusOther;
}

function formatActionTrack(value?: string | null): string | null {
  if (!value) return null;

  return value
    .replaceAll("_", " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getPriorityTone(priority?: string | null): {
  background: string;
  border: string;
  color: string;
} {
  if (priority === "high") {
    return {
      background: "rgba(255,122,89,0.12)",
      border: "rgba(255,122,89,0.24)",
      color: "var(--coach-accent)",
    };
  }

  if (priority === "medium") {
    return {
      background: "rgba(245,158,11,0.10)",
      border: "rgba(245,158,11,0.20)",
      color: "#b45309",
    };
  }

  return {
    background: "rgba(88,180,174,0.12)",
    border: "rgba(88,180,174,0.22)",
    color: "var(--coach-calm)",
  };
}

export function SessionInsightsPanel({
  uiLanguage = "en",
  sessionId,
  careerGap,
  recommendations,
  coachMode,
  coachIntent,
}: {
  uiLanguage?: SupportedUiLanguage;
  sessionId: number;
  careerGap?: CareerGapResponse | null;
  recommendations?: Recommendation[];
  coachMode?: string;
  coachIntent?: string;
}) {
  const copy = useMemo(
    () =>
      uiLanguage === "fr"
        ? {
            live: "Session en cours",
            liveText:
              "Le coach ajuste sa posture selon ton niveau de charge, ton contexte et ta trajectoire.",
            focus: "Focus du coaching",
            focusText:
              "Clarification, trajectoire, régulation ou passage à l’action selon ce qui émerge.",
            currentCoachStyle: "Style actuel du coach",
            currentCoachStyleText:
              "Le ton du coach évolue selon ton besoin du moment et ton style préféré.",
            currentMode: "Mode courant",
            currentIntent: "Intention courante",
            gap: "Écart de trajectoire",
            noGap:
              "Aucun écart majeur détecté pour le moment. Le coach continue d’affiner la lecture de ta trajectoire.",
            recs: "Actions utiles",
            noRecs:
              "Le coach est encore en train d’analyser ta trajectoire. Les actions utiles apparaîtront à mesure que les signaux se clarifient.",
            short: "Court terme",
            mid: "Moyen terme",
            long: "Long terme",
            current: "Point de départ",
            notDefined: "Non défini pour le moment",
            activeRecommendations: "Recommandations actives",
            statusOpen: "ouverte",
            statusInProgress: "en cours",
            statusOther: "à suivre",
            adaptiveDefault: "Adaptatif",
            contextActive: "Contexte actif",
            softSignal: "Signal vivant",
            coachingMemory: "Mémoire active",
            nextSteps: "Prochains pas",
            trajectory: "Trajectoire",
            sessionLabel: "Session",
            priority: "Priorité",
          }
        : {
            live: "Live session",
            liveText:
              "Your coach adjusts its stance to your load, context, and trajectory.",
            focus: "Coaching focus",
            focusText:
              "Clarification, trajectory, regulation, or action depending on what emerges.",
            currentCoachStyle: "Current coach style",
            currentCoachStyleText:
              "The coach tone evolves based on your current need and your preferred coaching style.",
            currentMode: "Current mode",
            currentIntent: "Current intent",
            gap: "Trajectory gap",
            noGap:
              "No major gap detected for now. Your coach is still refining its reading of your trajectory.",
            recs: "Useful actions",
            noRecs:
              "Your coach is still analyzing your trajectory. Useful actions will appear as the signals become clearer.",
            short: "Short term",
            mid: "Mid term",
            long: "Long term",
            current: "Starting point",
            notDefined: "Not defined yet",
            activeRecommendations: "Active recommendations",
            statusOpen: "open",
            statusInProgress: "in progress",
            statusOther: "to follow",
            adaptiveDefault: "Adaptive",
            contextActive: "Active context",
            softSignal: "Live signal",
            coachingMemory: "Active memory",
            nextSteps: "Next steps",
            trajectory: "Trajectory",
            sessionLabel: "Session",
            priority: "Priority",
          },
    [uiLanguage],
  );

  const activeRecommendations = (recommendations ?? []).filter(
    (recommendation) =>
      recommendation.status !== "completed" && recommendation.status !== "dismissed",
  );

  const coachModeLabel = getCoachModeLabel(coachMode, uiLanguage);
  const coachIntentLabel = getCoachIntentLabel(coachIntent, uiLanguage);
  const coachStyleLabel = getDerivedCoachStyle(coachMode, coachIntent, uiLanguage);

  function renderRoleBlock(title: string, role?: string | null, level?: string | null) {
    const hasValue = Boolean(role || level);

    return (
      <div
        className="card-soft"
        style={{
          borderRadius: 20,
          background: "rgba(255,255,255,0.72)",
          border: "1px solid rgba(43,33,24,0.08)",
          padding: 14,
        }}
      >
        <strong style={{ color: "var(--coach-ink)" }}>{title}</strong>

        <div
          className="muted"
          style={{
            marginTop: 6,
            color: "var(--coach-muted)",
            lineHeight: 1.5,
          }}
        >
          {hasValue ? `${role || "—"} ${level || ""}`.trim() : copy.notDefined}
        </div>
      </div>
    );
  }

  return (
    <div className="session-insights-shell">
      <div className="session-insights-scroll">
        <div className="stack" style={{ gap: 16 }}>
          <div
            className="card stack"
            style={{
              gap: 14,
              borderRadius: 28,
              border: "1px solid rgba(43,33,24,0.08)",
              background:
                "linear-gradient(135deg, rgba(255,241,220,0.92), rgba(255,255,255,0.90))",
              boxShadow: "0 14px 34px rgba(43,33,24,0.05)",
            }}
          >
            <div className="row" style={{ gap: 10, alignItems: "center" }}>
              <span
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 15,
                  display: "grid",
                  placeItems: "center",
                  background: "rgba(255,122,89,0.13)",
                  border: "1px solid rgba(255,122,89,0.22)",
                  color: "var(--coach-accent)",
                  flexShrink: 0,
                }}
              >
                <SessionIcon size={18} />
              </span>

              <div>
                <div className="section-title" style={{ color: "var(--coach-ink)" }}>
                  {copy.live}
                </div>
                <div
                  className="muted"
                  style={{
                    marginTop: 2,
                    color: "var(--coach-muted)",
                    fontSize: 13,
                  }}
                >
                  {copy.sessionLabel} #{sessionId}
                </div>
              </div>
            </div>

            <div
              className="muted"
              style={{
                color: "var(--coach-muted)",
                lineHeight: 1.65,
              }}
            >
              {copy.liveText}
            </div>

            <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
              <BadgePill icon={<SessionIcon size={14} />}>
                {copy.sessionLabel} #{sessionId}
              </BadgePill>

              <BadgePill icon={<SparkIcon size={14} />}>{copy.contextActive}</BadgePill>

              <BadgePill icon={<BrainIcon size={14} />}>{copy.coachingMemory}</BadgePill>
            </div>

            <div
              className="card-soft"
              style={{
                borderRadius: 22,
                background: "rgba(255,255,255,0.70)",
                border: "1px solid rgba(43,33,24,0.08)",
              }}
            >
              <div className="row" style={{ gap: 8, alignItems: "center" }}>
                <TargetIcon size={16} />
                <strong style={{ color: "var(--coach-ink)" }}>{copy.focus}</strong>
              </div>

              <div
                className="muted"
                style={{
                  marginTop: 8,
                  color: "var(--coach-muted)",
                  lineHeight: 1.6,
                }}
              >
                {copy.focusText}
              </div>
            </div>
          </div>

          <div
            className="card stack"
            style={{
              gap: 14,
              borderRadius: 28,
              border: "1px solid rgba(43,33,24,0.08)",
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.92), rgba(255,248,239,0.90))",
              boxShadow: "0 14px 34px rgba(43,33,24,0.05)",
            }}
          >
            <div className="row" style={{ gap: 10, alignItems: "center" }}>
              <span
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 15,
                  display: "grid",
                  placeItems: "center",
                  background: "rgba(88,180,174,0.13)",
                  border: "1px solid rgba(88,180,174,0.22)",
                  color: "var(--coach-calm)",
                  flexShrink: 0,
                }}
              >
                <BrainIcon size={18} />
              </span>

              <div className="section-title" style={{ color: "var(--coach-ink)" }}>
                {copy.currentCoachStyle}
              </div>
            </div>

            <div
              className="muted"
              style={{
                color: "var(--coach-muted)",
                lineHeight: 1.65,
              }}
            >
              {copy.currentCoachStyleText}
            </div>

            <div
              className="card-soft stack"
              style={{
                gap: 12,
                borderRadius: 24,
                background:
                  "linear-gradient(135deg, rgba(88,180,174,0.12), rgba(255,255,255,0.72))",
                border: "1px solid rgba(88,180,174,0.18)",
              }}
            >
              <div
                style={{
                  fontSize: 18,
                  lineHeight: 1.25,
                  fontWeight: 800,
                  color: "var(--coach-ink)",
                  letterSpacing: "-0.03em",
                }}
              >
                {coachStyleLabel || copy.adaptiveDefault}
              </div>

              <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
                <BadgePill icon={<BrainIcon size={14} />}>
                  {copy.currentMode}: {coachModeLabel || copy.adaptiveDefault}
                </BadgePill>

                <BadgePill icon={<TargetIcon size={14} />}>
                  {copy.currentIntent}: {coachIntentLabel || copy.adaptiveDefault}
                </BadgePill>

                <BadgePill icon={<SparkIcon size={14} />}>{copy.softSignal}</BadgePill>
              </div>
            </div>
          </div>

          <div
            className="card stack"
            style={{
              gap: 14,
              borderRadius: 28,
              border: "1px solid rgba(43,33,24,0.08)",
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.92), rgba(255,241,220,0.74))",
              boxShadow: "0 14px 34px rgba(43,33,24,0.05)",
            }}
          >
            <div className="row" style={{ gap: 10, alignItems: "center" }}>
              <span
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 15,
                  display: "grid",
                  placeItems: "center",
                  background: "rgba(255,122,89,0.13)",
                  border: "1px solid rgba(255,122,89,0.22)",
                  color: "var(--coach-accent)",
                  flexShrink: 0,
                }}
              >
                <PathIcon size={18} />
              </span>

              <div className="section-title" style={{ color: "var(--coach-ink)" }}>
                {copy.gap}
              </div>
            </div>

            <div
              className="card-soft"
              style={{
                borderRadius: 22,
                background: "rgba(255,255,255,0.72)",
                border: "1px solid rgba(43,33,24,0.08)",
              }}
            >
              <div
                className="muted"
                style={{
                  color: "var(--coach-muted)",
                  lineHeight: 1.65,
                }}
              >
                {careerGap?.key_gap_summary || copy.noGap}
              </div>
            </div>

            <div className="stack" style={{ gap: 10 }}>
              {renderRoleBlock(copy.current, careerGap?.current_role, null)}
              {renderRoleBlock(copy.short, careerGap?.short_term_role, careerGap?.short_term_level)}
              {renderRoleBlock(copy.mid, careerGap?.mid_term_role, careerGap?.mid_term_level)}
              {renderRoleBlock(copy.long, careerGap?.long_term_role, careerGap?.long_term_level)}
            </div>
          </div>

          <div
            className="card stack"
            style={{
              gap: 14,
              borderRadius: 28,
              border: "1px solid rgba(43,33,24,0.08)",
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.94), rgba(255,248,239,0.92))",
              boxShadow: "0 14px 34px rgba(43,33,24,0.05)",
            }}
          >
            <div className="row" style={{ gap: 10, alignItems: "center" }}>
              <span
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 15,
                  display: "grid",
                  placeItems: "center",
                  background: "rgba(88,180,174,0.13)",
                  border: "1px solid rgba(88,180,174,0.22)",
                  color: "var(--coach-calm)",
                  flexShrink: 0,
                }}
              >
                <ActionListIcon size={18} />
              </span>

              <div className="section-title" style={{ color: "var(--coach-ink)" }}>
                {copy.recs}
              </div>
            </div>

            {activeRecommendations.length === 0 ? (
              <div
                className="card-soft"
                style={{
                  borderRadius: 22,
                  background: "rgba(255,255,255,0.72)",
                  border: "1px solid rgba(43,33,24,0.08)",
                }}
              >
                <div
                  className="muted"
                  style={{
                    color: "var(--coach-muted)",
                    lineHeight: 1.65,
                  }}
                >
                  {copy.noRecs}
                </div>
              </div>
            ) : (
              <>
                <div
                  className="muted"
                  style={{
                    color: "var(--coach-muted)",
                    lineHeight: 1.55,
                  }}
                >
                  {copy.activeRecommendations}
                </div>

                {activeRecommendations.slice(0, 3).map((recommendation) => {
                  const priorityTone = getPriorityTone(recommendation.priority);
                  const actionTrack = formatActionTrack(recommendation.action_track);

                  return (
                    <div
                      key={recommendation.id}
                      className="card-soft stack"
                      style={{
                        gap: 10,
                        borderRadius: 22,
                        background: "rgba(255,255,255,0.74)",
                        border: "1px solid rgba(43,33,24,0.08)",
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 800,
                          color: "var(--coach-ink)",
                          lineHeight: 1.35,
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {recommendation.title}
                      </div>

                      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            borderRadius: 999,
                            padding: "6px 10px",
                            fontSize: 12,
                            lineHeight: 1,
                            border: `1px solid ${priorityTone.border}`,
                            background: priorityTone.background,
                            color: priorityTone.color,
                            fontWeight: 750,
                          }}
                        >
                          <TargetIcon size={14} />
                          {copy.priority}: {recommendation.priority}
                        </span>

                        <BadgePill
                          icon={
                            recommendation.status === "in_progress" ? (
                              <ClockIcon size={14} />
                            ) : (
                              <ActionListIcon size={14} />
                            )
                          }
                        >
                          {getStatusLabel(recommendation.status, copy)}
                        </BadgePill>
                      </div>

                      {actionTrack ? (
                        <div
                          className="muted"
                          style={{
                            color: "var(--coach-muted)",
                            lineHeight: 1.55,
                          }}
                        >
                          {actionTrack}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}