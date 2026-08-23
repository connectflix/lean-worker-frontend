"use client";

import React from "react";

import type {
  CapabilityTrajectory,
  ImpactTrajectory,
  TalentTrajectoryIntelligenceResponse,
  ValueContributionTrajectory,
} from "@/lib/types";


type TalentTrajectoryIntelligenceCardProps = {
  intelligence: TalentTrajectoryIntelligenceResponse | null;
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


function CapabilityItem({
  trajectory,
}: {
  trajectory: CapabilityTrajectory;
}) {
  const explanation = cleanText(trajectory.progression_explanation);

  return (
    <article
      className="card-soft stack"
      style={{
        gap: 7,
        padding: 12,
        background: "rgba(255, 250, 244, 0.72)",
      }}
    >
      <strong>{trajectory.capability_label}</strong>

      {explanation ? (
        <div style={{ lineHeight: 1.55 }}>
          {explanation}
        </div>
      ) : null}

      <EvidenceList items={trajectory.evidence} />
    </article>
  );
}


function ValueItem({
  trajectory,
}: {
  trajectory: ValueContributionTrajectory;
}) {
  const explanation = cleanText(trajectory.progression_explanation);

  return (
    <article
      className="card-soft stack"
      style={{
        gap: 7,
        padding: 12,
        background: "rgba(255, 250, 244, 0.72)",
      }}
    >
      <strong>{trajectory.value_label}</strong>

      {explanation ? (
        <div style={{ lineHeight: 1.55 }}>
          {explanation}
        </div>
      ) : null}

      <EvidenceList items={trajectory.evidence} />
    </article>
  );
}


function ImpactItem({
  trajectory,
}: {
  trajectory: ImpactTrajectory;
}) {
  const explanation = cleanText(trajectory.progression_explanation);

  return (
    <article
      className="card-soft stack"
      style={{
        gap: 7,
        padding: 12,
        background: "rgba(255, 250, 244, 0.72)",
      }}
    >
      <strong>{trajectory.impact_label}</strong>

      {explanation ? (
        <div style={{ lineHeight: 1.55 }}>
          {explanation}
        </div>
      ) : null}

      <EvidenceList items={trajectory.evidence} />
    </article>
  );
}


export function TalentTrajectoryIntelligenceCard({
  intelligence,
  language,
}: TalentTrajectoryIntelligenceCardProps) {
  if (!intelligence) {
    return null;
  }

  const hasCapability = intelligence.capability_trajectories.length > 0;
  const hasValue = intelligence.value_trajectories.length > 0;
  const hasImpact = intelligence.impact_trajectories.length > 0;
  const hasAnyEvidence = hasCapability || hasValue || hasImpact;
  const summary = cleanText(intelligence.talent_summary);

  const copy =
    language === "fr"
      ? {
          eyebrow: "Trajectoire de talent",
          title: "Ce qui se développe dans ta manière de créer de la valeur",
          empty:
            "Il n’y a pas encore assez de preuves professionnelles pour décrire ta trajectoire de talent.",
          capabilityTitle: "Capacités en développement",
          valueTitle: "Valeur que tu crées",
          impactTitle: "Impact observable",
          noCapability: "Pas encore de preuve suffisante sur une capacité en développement.",
          noValue: "Pas encore de preuve de contribution de valeur.",
          noImpact: "Pas encore de preuve d’impact observable.",
        }
      : {
          eyebrow: "Talent trajectory",
          title: "What is developing in how you create professional value",
          empty:
            "There is not enough professional evidence yet to describe your talent trajectory.",
          capabilityTitle: "Capabilities developing",
          valueTitle: "Value you are creating",
          impactTitle: "Observable impact",
          noCapability: "No sufficient capability development evidence yet.",
          noValue: "No value contribution evidence yet.",
          noImpact: "No observable impact evidence yet.",
        };

  return (
    <section
      aria-label={
        language === "fr"
          ? "Trajectoire de talent"
          : "Talent trajectory"
      }
      className="card stack"
      style={{
        gap: 12,
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
          ✦
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
            lineHeight: 1.55,
            maxWidth: 900,
          }}
        >
          {summary}
        </div>
      ) : null}

      {!hasAnyEvidence ? (
        <div
          className="card-soft"
          style={{
            padding: 14,
            lineHeight: 1.6,
            background: "rgba(255, 250, 244, 0.72)",
          }}
        >
          {copy.empty}
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gap: 16,
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            maxHeight: 430,
            overflowY: "auto",
            overscrollBehavior: "contain",
            paddingRight: 4,
          }}
        >
          <section
            aria-label={copy.capabilityTitle}
            className="stack"
            style={{ gap: 8 }}
          >
            <SectionTitle>{copy.capabilityTitle}</SectionTitle>

            {hasCapability ? (
              intelligence.capability_trajectories.map((trajectory) => (
                <CapabilityItem
                  key={trajectory.capability_key}
                  trajectory={trajectory}
                />
              ))
            ) : (
              <div className="muted">{copy.noCapability}</div>
            )}
          </section>

          <section
            aria-label={copy.valueTitle}
            className="stack"
            style={{ gap: 8 }}
          >
            <SectionTitle>{copy.valueTitle}</SectionTitle>

            {hasValue ? (
              intelligence.value_trajectories.map((trajectory) => (
                <ValueItem
                  key={`${trajectory.value_domain}:${trajectory.value_label}`}
                  trajectory={trajectory}
                />
              ))
            ) : (
              <div className="muted">{copy.noValue}</div>
            )}
          </section>

          <section
            aria-label={copy.impactTitle}
            className="stack"
            style={{ gap: 8 }}
          >
            <SectionTitle>{copy.impactTitle}</SectionTitle>

            {hasImpact ? (
              intelligence.impact_trajectories.map((trajectory) => (
                <ImpactItem
                  key={`${trajectory.impact_domain}:${trajectory.impact_label}`}
                  trajectory={trajectory}
                />
              ))
            ) : (
              <div className="muted">{copy.noImpact}</div>
            )}
          </section>
        </div>
      )}
    </section>
  );
}