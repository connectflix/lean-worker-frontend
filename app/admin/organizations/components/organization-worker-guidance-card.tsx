"use client";

import type {
  OrganizationWorkerMandateConstraint,
  OrganizationSupportRecommendation,
  OrganizationWorkerGuidanceResponse,
  OrganizationWorkerMandatePlan,
  OrganizationWorkerMandateSummary,
} from "@/lib/types";


type OrganizationWorkerGuidanceCardProps = {
  guidance: OrganizationWorkerGuidanceResponse | null;
  loading: boolean;
};


function SectionList({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  if (!items.length) return null;

  return (
    <div className="stack" style={{ gap: 6 }}>
      <div style={{ fontWeight: 700 }}>{title}</div>
      <ul
        style={{
          margin: 0,
          paddingLeft: 18,
          display: "grid",
          gap: 6,
        }}
      >
        {items.map((item, index) => (
          <li key={`${title}-${index}`}>{item}</li>
        ))}
      </ul>
    </div>
  );
}


function ConstraintList({
  title,
  items,
}: {
  title: string;
  items: OrganizationWorkerMandateConstraint[];
}) {
  if (!items.length) return null;

  return (
    <div className="stack" style={{ gap: 6 }}>
      <div style={{ fontWeight: 700 }}>{title}</div>
      <div className="stack" style={{ gap: 8 }}>
        {items.map((item) => (
          <div
            key={`${title}-${item.code}-${item.description}`}
            className="card-soft"
            style={{
              display: "grid",
              gap: 4,
              padding: 10,
              border: "1px solid var(--admin-border, var(--border))",
              background: "rgba(255,255,255,0.68)",
            }}
          >
            <div style={{ fontWeight: 650 }}>{item.description}</div>
            <div className="muted" style={{ fontSize: 12 }}>
              {item.code}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


function MandateSummarySection({
  summary,
}: {
  summary: OrganizationWorkerMandateSummary;
}) {
  return (
    <section className="card stack" style={{ gap: 16 }}>
      <div className="stack" style={{ gap: 4 }}>
        <div className="badge primary" style={{ width: "fit-content" }}>
          Organization guidance
        </div>
        <h2 className="section-title" style={{ margin: 0 }}>
          Mandate summary
        </h2>
        <div className="muted">
          Consolidated reading of the Worker&apos;s current professional mandate.
        </div>
      </div>

      <div
        className="card-soft"
        style={{
          padding: 14,
          lineHeight: 1.55,
          background: "rgba(255,255,255,0.78)",
          border: "1px solid var(--admin-border, var(--border))",
        }}
      >
        {summary.mandate_summary}
      </div>

      {summary.professional_identity ? (
        <div className="stack" style={{ gap: 6 }}>
          <div style={{ fontWeight: 700 }}>Professional identity</div>
          <div>{summary.professional_identity}</div>
        </div>
      ) : null}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 14,
        }}
      >
        <SectionList
          title="Expected outcomes"
          items={summary.expected_outcomes}
        />
        <SectionList
          title="Success definition"
          items={summary.success_definition}
        />
        <SectionList
          title="Meaning drivers"
          items={summary.meaning_drivers}
        />
        <SectionList
          title="Engagement drivers"
          items={summary.engagement_drivers}
        />
        <SectionList
          title="Contribution drivers"
          items={summary.contribution_drivers}
        />
        <SectionList
          title="Time capacity"
          items={summary.time_capacity}
        />
        <SectionList
          title="Energy constraints"
          items={summary.energy_constraints}
        />
        <SectionList
          title="Risks to avoid"
          items={summary.risks_to_avoid}
        />
        <SectionList
          title="Non-negotiables"
          items={summary.non_negotiables}
        />
        <ConstraintList
          title="Hard constraints"
          items={summary.hard_constraints}
        />
        <ConstraintList
          title="Soft constraints"
          items={summary.soft_constraints}
        />
      </div>
    </section>
  );
}


function OrganizationRecommendationsSection({
  recommendations,
}: {
  recommendations: OrganizationSupportRecommendation[];
}) {
  if (!recommendations.length) return null;

  return (
    <section className="card stack" style={{ gap: 16 }}>
      <div className="stack" style={{ gap: 4 }}>
        <h2 className="section-title" style={{ margin: 0 }}>
          Organization recommendations
        </h2>
        <div className="muted">
          What the organization can do to improve the conditions for the Worker&apos;s next action.
        </div>
      </div>

      <div className="stack" style={{ gap: 12 }}>
        {recommendations.map((recommendation, index) => (
          <article
            key={`${recommendation.title}-${index}`}
            className="card-soft stack"
            style={{
              gap: 10,
              padding: 14,
              border: "1px solid var(--admin-border, var(--border))",
              background: "#ffffff",
            }}
          >
            <div
              className="row space-between"
              style={{
                gap: 10,
                alignItems: "flex-start",
                flexWrap: "wrap",
              }}
            >
              <div style={{ fontWeight: 750, fontSize: 16 }}>
                {recommendation.title}
              </div>

              {recommendation.timing ? (
                <span className="badge">{recommendation.timing}</span>
              ) : null}
            </div>

            <div className="stack" style={{ gap: 6 }}>
              <div style={{ fontWeight: 700 }}>Organization action</div>
              <div>{recommendation.action}</div>
            </div>

            <div className="stack" style={{ gap: 6 }}>
              <div style={{ fontWeight: 700 }}>Why this support matters</div>
              <div className="muted">{recommendation.rationale}</div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}


function MandatePlanSection({
  plan,
}: {
  plan: OrganizationWorkerMandatePlan;
}) {
  return (
    <section className="card stack" style={{ gap: 16 }}>
      <div
        className="row space-between"
        style={{
          alignItems: "flex-start",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div className="stack" style={{ gap: 4 }}>
          <h2 className="section-title" style={{ margin: 0 }}>
            Mandate plan
          </h2>
          <div className="muted">
            Adaptive milestone plan for helping the Worker realize the mandate.
          </div>
        </div>

        <span className="badge">{plan.planning_horizon}</span>
      </div>

      <div
        className="card-soft"
        style={{
          padding: 14,
          lineHeight: 1.55,
          background: "rgba(255,255,255,0.78)",
          border: "1px solid var(--admin-border, var(--border))",
        }}
      >
        {plan.plan_summary}
      </div>

      <SectionList title="Approach" items={plan.approach} />

      <div className="stack" style={{ gap: 12 }}>
        {plan.milestones.map((milestone) => (
          <article
            key={`${milestone.sequence}-${milestone.title}`}
            className="card-soft stack"
            style={{
              gap: 12,
              padding: 14,
              border: "1px solid var(--admin-border, var(--border))",
              background: "#ffffff",
            }}
          >
            <div
              className="row space-between"
              style={{
                gap: 10,
                alignItems: "flex-start",
                flexWrap: "wrap",
              }}
            >
              <div className="stack" style={{ gap: 4 }}>
                <span className="badge" style={{ width: "fit-content" }}>
                  Step {milestone.sequence}
                </span>
                <div style={{ fontWeight: 750, fontSize: 16 }}>
                  {milestone.title}
                </div>
              </div>

              <span className="badge">{milestone.timing}</span>
            </div>

            <div>{milestone.objective}</div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 12,
              }}
            >
              <SectionList
                title="Expected progress"
                items={milestone.expected_progress}
              />
              <SectionList
                title="Organization support"
                items={milestone.organization_support}
              />
              <SectionList
                title="Dependencies"
                items={milestone.dependencies}
              />
            </div>
          </article>
        ))}
      </div>

      <SectionList title="Planning assumptions" items={plan.assumptions} />
    </section>
  );
}


export function OrganizationWorkerGuidanceCard({
  guidance,
  loading,
}: OrganizationWorkerGuidanceCardProps) {
  const organizationRecommendations =
    guidance?.organization_recommendations ?? [];

  if (loading) {
    return (
      <div className="card-soft">
        Loading organization guidance...
      </div>
    );
  }

  if (!guidance) {
    return (
      <div className="card-soft stack" style={{ gap: 6 }}>
        <div style={{ fontWeight: 750 }}>
          No mandate guidance available yet.
        </div>
        <div className="muted">
          Guidance will appear after a professional mandate has been established
          for this Worker.
        </div>
      </div>
    );
  }

  if (
    !guidance.mandate_summary
    && !guidance.mandate_plan
    && !organizationRecommendations.length
  ) {
    return (
      <div className="card-soft stack" style={{ gap: 6 }}>
        <div style={{ fontWeight: 750 }}>
          No mandate guidance available yet.
        </div>
        <div className="muted">
          Guidance will appear after a professional mandate has been established
          for this Worker.
        </div>
      </div>
    );
  }

  return (
    <div className="stack" style={{ gap: 16 }}>
      {guidance.mandate_summary ? (
        <MandateSummarySection summary={guidance.mandate_summary} />
      ) : (
        <div className="card-soft">
          No mandate summary available yet.
        </div>
      )}

      {guidance.mandate_plan ? (
        <MandatePlanSection plan={guidance.mandate_plan} />
      ) : (
        <div className="card-soft">
          No mandate plan available yet.
        </div>
      )}

      <OrganizationRecommendationsSection
        recommendations={organizationRecommendations}
      />
    </div>
  );
}