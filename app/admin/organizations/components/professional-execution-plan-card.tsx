"use client";

import type {
  ProfessionalExecutionPlanResponse,
} from "@/lib/types";


type ProfessionalExecutionPlanCardProps = {
  plan: ProfessionalExecutionPlanResponse | null;
  loading: boolean;
};


function SectionList({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  if (!items.length) {
    return null;
  }

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
          <li key={`${title}-${index}`}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}


export function ProfessionalExecutionPlanCard({
  plan,
  loading,
}: ProfessionalExecutionPlanCardProps) {
  if (loading) {
    return (
      <div className="card-soft">
        Loading Professional Execution Plan...
      </div>
    );
  }

  if (!plan) {
    return (
      <div
        className="card-soft stack"
        style={{ gap: 6 }}
      >
        <div style={{ fontWeight: 750 }}>
          No Professional Execution Plan available yet.
        </div>

        <div className="muted">
          The persisted plan will appear here once Professional Mandate
          and Professional Intention are ready for plan generation.
        </div>
      </div>
    );
  }

  return (
    <section
      className="card stack"
      style={{ gap: 16 }}
    >
      <div
        className="row space-between"
        style={{
          alignItems: "flex-start",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div
          className="stack"
          style={{ gap: 4 }}
        >
          <div
            className="badge primary"
            style={{ width: "fit-content" }}
          >
            Professional planning
          </div>

          <h2
            className="section-title"
            style={{ margin: 0 }}
          >
            Professional Execution Plan
          </h2>

          <div className="muted">
            Durable professional path derived from the current
            Professional Mandate and Professional Intention.
          </div>
        </div>

        <span className="badge">
          {plan.planning_horizon_months}{" "}
          {plan.planning_horizon_months === 1
            ? "month"
            : "months"}
        </span>
      </div>

      <div
        className="card-soft"
        style={{
          padding: 14,
          lineHeight: 1.55,
          background: "rgba(255,255,255,0.78)",
          border:
            "1px solid var(--admin-border, var(--border))",
        }}
      >
        {plan.plan_summary}
      </div>

      <div
        className="stack"
        style={{ gap: 12 }}
      >
        {plan.milestones.map((milestone) => (
          <article
            key={`${milestone.sequence}-${milestone.title}`}
            className="card-soft stack"
            style={{
              gap: 12,
              padding: 14,
              border:
                "1px solid var(--admin-border, var(--border))",
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
              <div
                className="stack"
                style={{ gap: 4 }}
              >
                <span
                  className="badge"
                  style={{ width: "fit-content" }}
                >
                  Step {milestone.sequence}
                </span>

                <div
                  style={{
                    fontWeight: 750,
                    fontSize: 16,
                  }}
                >
                  {milestone.title}
                </div>
              </div>

              <span className="badge">
                {milestone.timing}
              </span>
            </div>

            <div
              style={{
                lineHeight: 1.55,
              }}
            >
              {milestone.objective}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 12,
              }}
            >
              <SectionList
                title="Expected progress"
                items={milestone.expected_progress}
              />

              <SectionList
                title="Completion evidence"
                items={milestone.completion_evidence}
              />

              <SectionList
                title="Dependencies"
                items={milestone.dependencies}
              />
            </div>
          </article>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 14,
        }}
      >
        <SectionList
          title="Guardrails"
          items={plan.guardrails}
        />

        <SectionList
          title="Planning assumptions"
          items={plan.assumptions}
        />
      </div>
    </section>
  );
}
