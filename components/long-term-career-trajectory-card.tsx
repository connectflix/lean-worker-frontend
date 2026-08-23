"use client";

import React from "react";

import type {
  LongTermActivityVelocity,
  LongTermCareerTrajectoryRead,
  LongTermTemporalActivityChange,
} from "@/lib/types";


type LongTermCareerTrajectoryCardProps = {
  trajectory: LongTermCareerTrajectoryRead | null;
  language: "fr" | "en";
};


function SectionTitle({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <h3
      style={{
        margin: 0,
        fontSize: 15,
        lineHeight: 1.35,
        fontWeight: 700,
        letterSpacing: 0,
      }}
    >
      {children}
    </h3>
  );
}


function InfoPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-label={title}
      className="stack"
      style={{ gap: 10 }}
    >
      <SectionTitle>{title}</SectionTitle>

      <div
        className="stack"
        style={{
          gap: 8,
          padding: 14,
          borderRadius: 18,
          border: "1px solid rgba(43,33,24,0.08)",
          background: "rgba(255,255,255,0.72)",
        }}
      >
        {children}
      </div>
    </section>
  );
}


function activityChangeLabel(
  change: LongTermTemporalActivityChange,
  language: "fr" | "en",
): string {
  const labels: Record<
    LongTermTemporalActivityChange,
    { fr: string; en: string }
  > = {
    insufficient_evidence: {
      fr: "Preuves insuffisantes",
      en: "Insufficient evidence",
    },
    more_activity: {
      fr: "Plus d’activité",
      en: "More activity",
    },
    less_activity: {
      fr: "Moins d’activité",
      en: "Less activity",
    },
    similar_activity: {
      fr: "Activité similaire",
      en: "Similar activity",
    },
    mixed_activity: {
      fr: "Activité mixte",
      en: "Mixed activity",
    },
  };

  return labels[change][language];
}


function activityVelocityLabel(
  velocity: LongTermActivityVelocity,
  language: "fr" | "en",
): string {
  const labels: Record<
    LongTermActivityVelocity,
    { fr: string; en: string }
  > = {
    insufficient_evidence: {
      fr: "Preuves insuffisantes",
      en: "Insufficient evidence",
    },
    steady: {
      fr: "Régulier",
      en: "Steady",
    },
    accelerating: {
      fr: "En accélération",
      en: "Accelerating",
    },
    decelerating: {
      fr: "En ralentissement",
      en: "Decelerating",
    },
  };

  return labels[velocity][language];
}


function episodeLabel(
  count: number,
  language: "fr" | "en",
): string {
  if (language === "fr") {
    return `${count} épisode${count === 1 ? "" : "s"}`;
  }

  return `${count} episode${count === 1 ? "" : "s"}`;
}


function activeDayLabel(
  count: number,
  language: "fr" | "en",
): string {
  if (language === "fr") {
    return `${count} jour${count === 1 ? "" : "s"} actif${count === 1 ? "" : "s"}`;
  }

  return `${count} active day${count === 1 ? "" : "s"}`;
}


function coverageLabel(
  count: number,
  language: "fr" | "en",
): string {
  if (language === "fr") {
    return `${count} jour${count === 1 ? "" : "s"} couverts`;
  }

  return `${count} day${count === 1 ? "" : "s"} covered`;
}


export function LongTermCareerTrajectoryCard({
  trajectory,
  language,
}: LongTermCareerTrajectoryCardProps) {
  if (!trajectory) {
    return null;
  }

  const profile = trajectory.temporal_profile;
  const recent = trajectory.temporal_windows.recent;
  const previous = trajectory.temporal_windows.previous;

  const isInsufficient =
    profile.temporal_evidence_state === "insufficient_evidence" &&
    profile.episode_count === 0 &&
    recent.episode_count === 0 &&
    previous.episode_count === 0 &&
    trajectory.activity_comparison.activity_change ===
      "insufficient_evidence" &&
    trajectory.velocity_interpretation.activity_velocity ===
      "insufficient_evidence";

  const copy =
    language === "fr"
      ? {
          eyebrow: "Trajectoire longitudinale",
          title: "Activité de trajectoire à long terme",
          empty:
            "Il n’y a pas encore assez de preuves longitudinales d’activité pour comparer ton historique de trajectoire récent.",
          observedHistory: "Historique observé",
          recentWindow: "30 derniers jours",
          previousWindow: "30 jours précédents",
          activityComparison: "Comparaison d’activité",
          activityPace: "Rythme d’activité",
        }
      : {
          eyebrow: "Longitudinal trajectory",
          title: "Long-term trajectory activity",
          empty:
            "There is not enough longitudinal activity evidence yet to compare your recent trajectory history.",
          observedHistory: "Observed history",
          recentWindow: "Recent 30 days",
          previousWindow: "Previous 30 days",
          activityComparison: "Activity comparison",
          activityPace: "Activity pace",
        };

  return (
    <section
      data-testid="long-term-career-trajectory-card"
      aria-label={copy.title}
      className="card stack"
      style={{
        gap: 14,
        position: "relative",
        overflow: "hidden",
        borderRadius: 32,
        border: "1px solid rgba(43,33,24,0.08)",
        background:
          "linear-gradient(135deg, rgba(248,252,255,0.97), rgba(255,255,255,0.95) 52%, rgba(246,250,255,0.92))",
        boxShadow: "0 22px 60px rgba(43,33,24,0.07)",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          right: -90,
          top: -110,
          width: 250,
          height: 250,
          borderRadius: 999,
          background: "rgba(90, 130, 170, 0.08)",
          pointerEvents: "none",
        }}
      />

      <div
        className="stack"
        style={{
          gap: 14,
          position: "relative",
          zIndex: 1,
        }}
      >
        <header className="stack" style={{ gap: 6, maxWidth: 860 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              opacity: 0.65,
            }}
          >
            {copy.eyebrow}
          </div>

          <h2
            className="section-title"
            style={{
              margin: 0,
            }}
          >
            {copy.title}
          </h2>
        </header>

        {isInsufficient ? (
          <div
            style={{
              padding: 16,
              borderRadius: 18,
              background: "rgba(255,255,255,0.70)",
              lineHeight: 1.6,
            }}
          >
            {copy.empty}
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gap: 14,
              maxHeight: 430,
              overflowY: "auto",
              paddingRight: 4,
              overscrollBehavior: "contain",
              scrollbarGutter: "stable",
            }}
          >
            <div
              style={{
                display: "grid",
                gap: 16,
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
              }}
            >
              <InfoPanel title={copy.observedHistory}>
                <strong>{episodeLabel(profile.episode_count, language)}</strong>
                <div>{activeDayLabel(profile.active_day_count, language)}</div>
                <div>{coverageLabel(profile.coverage_days, language)}</div>
              </InfoPanel>

              <InfoPanel title={copy.recentWindow}>
                <strong>{episodeLabel(recent.episode_count, language)}</strong>
                <div>{activeDayLabel(recent.active_day_count, language)}</div>
              </InfoPanel>

              <InfoPanel title={copy.previousWindow}>
                <strong>{episodeLabel(previous.episode_count, language)}</strong>
                <div>{activeDayLabel(previous.active_day_count, language)}</div>
              </InfoPanel>
            </div>

            <div
              style={{
                display: "grid",
                gap: 16,
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
              }}
            >
              <InfoPanel title={copy.activityComparison}>
                <strong>
                  {activityChangeLabel(
                    trajectory.activity_comparison.activity_change,
                    language,
                  )}
                </strong>
              </InfoPanel>

              <InfoPanel title={copy.activityPace}>
                <strong>
                  {activityVelocityLabel(
                    trajectory.velocity_interpretation.activity_velocity,
                    language,
                  )}
                </strong>
              </InfoPanel>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}