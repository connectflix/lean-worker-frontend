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
            adaptiveDefault: "Adaptatif",
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
            adaptiveDefault: "Adaptive",
          },
    [uiLanguage],
  );

  const activeRecommendations = (recommendations ?? []).filter(
    (r) => r.status !== "completed" && r.status !== "dismissed",
  );

  const coachModeLabel = getCoachModeLabel(coachMode, uiLanguage);
  const coachIntentLabel = getCoachIntentLabel(coachIntent, uiLanguage);
  const coachStyleLabel = getDerivedCoachStyle(coachMode, coachIntent, uiLanguage);

  function renderRoleBlock(title: string, role?: string | null, level?: string | null) {
    const hasValue = Boolean(role || level);

    return (
      <div className="card-soft">
        <strong>{title}</strong>
        <div className="muted" style={{ marginTop: 6 }}>
          {hasValue ? `${role || "—"} ${level || ""}`.trim() : copy.notDefined}
        </div>
      </div>
    );
  }

  return (
    <div className="stack">
      <div className="card stack">
        <div className="row" style={{ gap: 8, alignItems: "center" }}>
          <SessionIcon />
          <div className="section-title">{copy.live}</div>
        </div>

        <div className="muted">{copy.liveText}</div>

        <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
          <BadgePill icon={<SessionIcon size={14} />}>Session #{sessionId}</BadgePill>
          <BadgePill icon={<SparkIcon size={14} />}>{copy.focus}</BadgePill>
        </div>

        <div className="card-soft">
          <div className="muted">{copy.focusText}</div>
        </div>
      </div>

      <div className="card stack">
        <div className="row" style={{ gap: 8, alignItems: "center" }}>
          <BrainIcon />
          <div className="section-title">{copy.currentCoachStyle}</div>
        </div>

        <div className="muted">{copy.currentCoachStyleText}</div>

        <div className="card-soft stack" style={{ gap: 10 }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>
            {coachStyleLabel || copy.adaptiveDefault}
          </div>

          <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
            <BadgePill icon={<BrainIcon size={14} />}>
              {copy.currentMode}: {coachModeLabel || copy.adaptiveDefault}
            </BadgePill>

            <BadgePill icon={<TargetIcon size={14} />}>
              {copy.currentIntent}: {coachIntentLabel || copy.adaptiveDefault}
            </BadgePill>
          </div>
        </div>
      </div>

      <div className="card stack">
        <div className="row" style={{ gap: 8, alignItems: "center" }}>
          <PathIcon />
          <div className="section-title">{copy.gap}</div>
        </div>

        {careerGap?.key_gap_summary ? (
          <div className="card-soft">
            <div className="muted">{careerGap.key_gap_summary}</div>
          </div>
        ) : (
          <div className="card-soft">
            <div className="muted">{copy.noGap}</div>
          </div>
        )}

        <div className="stack" style={{ gap: 10 }}>
          {renderRoleBlock(copy.current, careerGap?.current_role, null)}
          {renderRoleBlock(copy.short, careerGap?.short_term_role, careerGap?.short_term_level)}
          {renderRoleBlock(copy.mid, careerGap?.mid_term_role, careerGap?.mid_term_level)}
          {renderRoleBlock(copy.long, careerGap?.long_term_role, careerGap?.long_term_level)}
        </div>
      </div>

      <div className="card stack">
        <div className="row" style={{ gap: 8, alignItems: "center" }}>
          <ActionListIcon />
          <div className="section-title">{copy.recs}</div>
        </div>

        {activeRecommendations.length === 0 ? (
          <div className="card-soft">
            <div className="muted">{copy.noRecs}</div>
          </div>
        ) : (
          <>
            <div className="muted">{copy.activeRecommendations}</div>

            {activeRecommendations.slice(0, 3).map((rec) => (
              <div key={rec.id} className="card-soft stack" style={{ gap: 10 }}>
                <strong>{rec.title}</strong>

                <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                  <BadgePill
                    icon={
                      rec.status === "in_progress" ? (
                        <ClockIcon size={14} />
                      ) : (
                        <ActionListIcon size={14} />
                      )
                    }
                  >
                    {rec.priority} •{" "}
                    {rec.status === "in_progress" ? copy.statusInProgress : copy.statusOpen}
                  </BadgePill>
                </div>

                {rec.action_track && (
                  <div className="muted">{rec.action_track.replaceAll("_", " ")}</div>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}