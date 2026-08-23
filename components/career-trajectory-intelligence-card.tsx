"use client";

import React from "react";

import type {
  CareerDirectionChange,
  CareerProgressionState,
  CareerProgressionVelocity,
  CareerTrajectoryIntelligenceResponse,
  PersistentCareerBlocker,
} from "@/lib/types";


type CareerTrajectoryIntelligenceCardProps = {
  intelligence: CareerTrajectoryIntelligenceResponse | null;
  language: "fr" | "en";
};


function cleanText(value: string | null | undefined): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}


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


function EvidenceList({
  items,
}: {
  items: string[];
}) {
  const evidence = items
    .map((item) => cleanText(item))
    .filter((item): item is string => Boolean(item))
    .slice(0, 3);

  if (evidence.length === 0) {
    return null;
  }

  return (
    <ul
      style={{
        margin: 0,
        paddingLeft: 20,
        display: "grid",
        gap: 6,
      }}
    >
      {evidence.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}


function progressionLabel(
  state: CareerProgressionState,
  language: "fr" | "en",
): string {
  const labels: Record<CareerProgressionState, { fr: string; en: string }> = {
    insufficient_evidence: {
      fr: "Preuves insuffisantes",
      en: "Insufficient evidence",
    },
    progressing: {
      fr: "En progression",
      en: "Progressing",
    },
    consolidating: {
      fr: "En consolidation",
      en: "Consolidating",
    },
    changing_direction: {
      fr: "Changement de direction",
      en: "Changing direction",
    },
    stagnating: {
      fr: "Stagnation observée",
      en: "Stagnating",
    },
    contradictory: {
      fr: "Signaux contradictoires",
      en: "Contradictory",
    },
  };

  return labels[state][language];
}


function velocityLabel(
  velocity: CareerProgressionVelocity,
  language: "fr" | "en",
): string {
  const labels: Record<CareerProgressionVelocity, { fr: string; en: string }> = {
    insufficient_evidence: {
      fr: "Preuves insuffisantes",
      en: "Insufficient evidence",
    },
    slow: {
      fr: "Lent",
      en: "Slow",
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


function persistenceLabel(
  blocker: PersistentCareerBlocker,
  language: "fr" | "en",
): string {
  const labels = {
    emerging: {
      fr: "Émergent",
      en: "Emerging",
    },
    repeated: {
      fr: "Répété",
      en: "Repeated",
    },
    persistent: {
      fr: "Persistant",
      en: "Persistent",
    },
  };

  return labels[blocker.persistence][language];
}


function MetricPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="stack"
      style={{
        gap: 5,
        minWidth: 0,
      }}
    >
      <h3
        className="muted"
        style={{
          margin: 0,
          fontSize: 12,
          lineHeight: 1.4,
          fontWeight: 600,
          letterSpacing: 0,
        }}
      >
        {title}
      </h3>
      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          lineHeight: 1.45,
        }}
      >
        {children}
      </div>
    </div>
  );
}


function BlockerItem({
  blocker,
  language,
}: {
  blocker: PersistentCareerBlocker;
  language: "fr" | "en";
}) {
  return (
    <article
      className="card-soft stack"
      style={{
        gap: 7,
        padding: 13,
        fontSize: 13,
        lineHeight: 1.5,
      }}
    >
      <strong>{blocker.blocker}</strong>
      <div className="muted">{persistenceLabel(blocker, language)}</div>
      <EvidenceList items={blocker.evidence} />
    </article>
  );
}


function DirectionChangeItem({
  change,
  language,
}: {
  change: CareerDirectionChange;
  language: "fr" | "en";
}) {
  const interpretation = cleanText(change.interpretation);

  return (
    <article
      className="card-soft stack"
      style={{
        gap: 7,
        padding: 13,
        fontSize: 13,
        lineHeight: 1.5,
      }}
    >
      <div
        style={{
          display: "grid",
          gap: 8,
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        }}
      >
        <div className="stack" style={{ gap: 4 }}>
          <span className="muted">
            {language === "fr" ? "Direction précédente" : "Previous direction"}
          </span>
          <strong>{change.from_direction}</strong>
        </div>

        <div className="stack" style={{ gap: 4 }}>
          <span className="muted">
            {language === "fr" ? "Nouvelle direction" : "New direction"}
          </span>
          <strong>{change.to_direction}</strong>
        </div>
      </div>

      {interpretation ? (
        <div style={{ lineHeight: 1.55 }}>
          {interpretation}
        </div>
      ) : null}

      <EvidenceList items={change.evidence} />
    </article>
  );
}


export function CareerTrajectoryIntelligenceCard({
  intelligence,
  language,
}: CareerTrajectoryIntelligenceCardProps) {
  if (!intelligence) {
    return null;
  }

  const direction = cleanText(intelligence.current_direction);
  const summary = cleanText(intelligence.career_summary);

  const isInsufficient =
    intelligence.progression_state === "insufficient_evidence" &&
    intelligence.progression_velocity === "insufficient_evidence" &&
    !direction &&
    intelligence.persistent_blockers.length === 0 &&
    intelligence.direction_changes.length === 0 &&
    intelligence.stagnation_signals.length === 0 &&
    !summary;

  const copy =
    language === "fr"
      ? {
          eyebrow: "Trajectoire de carrière",
          title: "Progression de carrière",
          empty:
            "Il n’y a pas encore assez de preuves longitudinales sur ta carrière pour décrire ta progression.",
          currentDirection: "Direction actuelle",
          careerMovement: "Mouvement de carrière",
          movementPace: "Rythme du mouvement",
          persistentBlockers: "Blocages persistants",
          directionChanges: "Changements de direction",
          stagnationSignals: "Signaux de stagnation",
          unknownDirection: "Direction pas encore suffisamment établie.",
          noBlockers: "Aucun blocage persistant confirmé.",
          noChanges: "Aucun changement de direction confirmé.",
        }
      : {
          eyebrow: "Career trajectory",
          title: "Career progress",
          empty:
            "There is not enough longitudinal career evidence yet to describe your career progress.",
          currentDirection: "Current direction",
          careerMovement: "Career movement",
          movementPace: "Movement pace",
          persistentBlockers: "Persistent blockers",
          directionChanges: "Direction changes",
          stagnationSignals: "Stagnation signals",
          unknownDirection: "No sufficiently established career direction yet.",
          noBlockers: "No persistent career blocker confirmed.",
          noChanges: "No direction change confirmed.",
        };

  return (
    <section
      data-testid="career-trajectory-intelligence-card"
      aria-label={language === "fr" ? "Progression de carrière" : "Career progress"}
      className="card stack"
      style={{
        gap: 14,
      }}
    >
      <div
        className="row"
        style={{
          gap: 8,
          alignItems: "center",
        }}
      >
        <span aria-hidden="true" style={{ fontSize: 15, lineHeight: 1 }}>
          ↗
        </span>
        <h2
          className="section-title"
          style={{
            margin: 0,
          }}
        >
          {copy.title}
        </h2>
      </div>

      {summary ? (
        <div
          className="muted"
          style={{
            lineHeight: 1.6,
            maxWidth: 900,
          }}
        >
          {summary}
        </div>
      ) : null}

      {isInsufficient ? (
        <div className="muted" style={{ lineHeight: 1.6 }}>
          {copy.empty}
        </div>
      ) : (
        <>
          <div
            className="card-soft"
            style={{
              display: "grid",
              gap: 18,
              padding: 14,
              gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
              background: "rgba(255, 250, 244, 0.72)",
            }}
          >
            <MetricPanel title={copy.currentDirection}>
              {direction ?? copy.unknownDirection}
            </MetricPanel>

            <MetricPanel title={copy.careerMovement}>
              {progressionLabel(intelligence.progression_state, language)}
            </MetricPanel>

            <MetricPanel title={copy.movementPace}>
              {velocityLabel(intelligence.progression_velocity, language)}
            </MetricPanel>
          </div>

          <div
            style={{
              display: "grid",
              gap: 18,
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            }}
          >
            <section
              aria-label={copy.persistentBlockers}
              className="stack"
              style={{ gap: 8, minWidth: 0 }}
            >
              <SectionTitle>{copy.persistentBlockers}</SectionTitle>

              <div
                className="stack"
                style={{
                  gap: 8,
                  maxHeight: 430,
                  overflowY: "auto",
                  overscrollBehavior: "contain",
                  paddingRight: 4,
                }}
              >
                {intelligence.persistent_blockers.length > 0 ? (
                  intelligence.persistent_blockers.map((blocker) => (
                    <BlockerItem
                      key={`${blocker.persistence}:${blocker.blocker}`}
                      blocker={blocker}
                      language={language}
                    />
                  ))
                ) : (
                  <div className="muted">{copy.noBlockers}</div>
                )}
              </div>
            </section>

            <section
              aria-label={copy.directionChanges}
              className="stack"
              style={{ gap: 8, minWidth: 0 }}
            >
              <SectionTitle>{copy.directionChanges}</SectionTitle>

              <div
                className="stack"
                style={{
                  gap: 8,
                  maxHeight: 430,
                  overflowY: "auto",
                  overscrollBehavior: "contain",
                  paddingRight: 4,
                }}
              >
                {intelligence.direction_changes.length > 0 ? (
                  intelligence.direction_changes.map((change) => (
                    <DirectionChangeItem
                      key={`${change.from_direction}:${change.to_direction}`}
                      change={change}
                      language={language}
                    />
                  ))
                ) : (
                  <div className="muted">{copy.noChanges}</div>
                )}
              </div>
            </section>
          </div>

          {intelligence.stagnation_signals.length > 0 ? (
            <section
              aria-label={copy.stagnationSignals}
              className="stack"
              style={{ gap: 8 }}
            >
              <SectionTitle>{copy.stagnationSignals}</SectionTitle>
              <div className="card-soft" style={{ padding: 14 }}>
                <EvidenceList items={intelligence.stagnation_signals} />
              </div>
            </section>
          ) : null}
        </>
      )}
    </section>
  );
}