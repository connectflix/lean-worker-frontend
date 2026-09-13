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
  icon,
}: {
  title: string;
  items: string[];
  icon?: string;
}) {
  if (!items.length) {
    return null;
  }

  return (
    <div
      className="stack"
      style={{
        gap: 8,
        minWidth: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          fontWeight: 750,
          fontSize: 13,
        }}
      >
        {icon ? (
          <span
            aria-hidden="true"
            style={{
              fontSize: 14,
              lineHeight: 1,
              opacity: 0.72,
            }}
          >
            {icon}
          </span>
        ) : null}

        {title}
      </div>

      <ul
        style={{
          margin: 0,
          paddingLeft: 18,
          display: "grid",
          gap: 7,
          lineHeight: 1.5,
          fontSize: 13,
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


function MilestoneCard({
  milestone,
  defaultOpen,
}: {
  milestone: ProfessionalExecutionPlanResponse["milestones"][number];
  defaultOpen: boolean;
}) {
  return (
    <details
      className="card-soft"
      open={defaultOpen}
      style={{
        border:
          "1px solid var(--admin-border, var(--border))",
        background: "#ffffff",
        overflow: "hidden",
      }}
    >
      <summary
        style={{
          cursor: "pointer",
          listStyle: "none",
          padding: 14,
          userSelect: "none",
        }}
      >
        <div
          className="row space-between"
          style={{
            gap: 14,
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 11,
              alignItems: "center",
              minWidth: 0,
              flex: 1,
            }}
          >
            <span
              className="badge"
              style={{
                flexShrink: 0,
              }}
            >
              Step {milestone.sequence}
            </span>

            <div
              style={{
                minWidth: 0,
              }}
            >
              <div
                style={{
                  fontWeight: 750,
                  fontSize: 14,
                  lineHeight: 1.35,
                }}
              >
                {milestone.title}
              </div>

            </div>
          </div>

          <span
            className="badge"
            style={{
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            {milestone.timing}
          </span>
        </div>
      </summary>

      <div
        className="stack"
        style={{
          gap: 14,
          padding: "0 14px 14px",
        }}
      >
        <div
          style={{
            height: 1,
            background:
              "var(--admin-border, var(--border))",
          }}
        />

        <div
          style={{
            padding: 12,
            borderRadius: 10,
            background:
              "var(--admin-soft, rgba(0, 0, 0, 0.025))",
          }}
        >
          <div
            className="muted"
            style={{
              fontSize: 11,
              fontWeight: 750,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              marginBottom: 5,
            }}
          >
            Objective
          </div>

          <div
            style={{
              lineHeight: 1.55,
              fontSize: 13,
            }}
          >
            {milestone.objective}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 10,
          }}
        >
          {milestone.expected_progress.length ? (
            <div
              style={{
                padding: 12,
                borderRadius: 10,
                border:
                  "1px solid var(--admin-border, var(--border))",
              }}
            >
              <SectionList
                title="Expected progress"
                icon="↗"
                items={milestone.expected_progress}
              />
            </div>
          ) : null}

          {milestone.completion_evidence.length ? (
            <div
              style={{
                padding: 12,
                borderRadius: 10,
                border:
                  "1px solid var(--admin-border, var(--border))",
              }}
            >
              <SectionList
                title="Completion evidence"
                icon="✓"
                items={milestone.completion_evidence}
              />
            </div>
          ) : null}

          {milestone.dependencies.length ? (
            <div
              style={{
                padding: 12,
                borderRadius: 10,
                border:
                  "1px solid var(--admin-border, var(--border))",
              }}
            >
              <SectionList
                title="Dependencies"
                icon="◇"
                items={milestone.dependencies}
              />
            </div>
          ) : null}
        </div>
      </div>
    </details>
  );
}


function SecondarySection({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: string[];
}) {
  if (!items.length) {
    return null;
  }

  return (
    <details
      className="card-soft"
      style={{
        border:
          "1px solid var(--admin-border, var(--border))",
        background: "rgba(255,255,255,0.7)",
      }}
    >
      <summary
        style={{
          cursor: "pointer",
          listStyle: "none",
          padding: 12,
        }}
      >
        <div
          className="row space-between"
          style={{
            alignItems: "center",
            gap: 12,
          }}
        >
          <div>
            <div
              style={{
                fontWeight: 750,
                fontSize: 13,
              }}
            >
              {title}
            </div>

            <div
              className="muted"
              style={{
                fontSize: 12,
                marginTop: 2,
              }}
            >
              {description}
            </div>
          </div>

          <span className="badge">
            {items.length}
          </span>
        </div>
      </summary>

      <div
        style={{
          padding: "0 12px 12px",
        }}
      >
        <ul
          style={{
            margin: 0,
            paddingLeft: 18,
            display: "grid",
            gap: 7,
            lineHeight: 1.5,
            fontSize: 13,
          }}
        >
          {items.map((item, index) => (
            <li key={`${title}-${index}`}>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </details>
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
      style={{ gap: 14 }}
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
          style={{
            gap: 4,
            minWidth: 0,
          }}
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

        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          <span className="badge">
            {plan.planning_horizon_months}{" "}
            {plan.planning_horizon_months === 1
              ? "month"
              : "months"}
          </span>

          <span className="badge">
            {plan.milestones.length}{" "}
            {plan.milestones.length === 1
              ? "step"
              : "steps"}
          </span>
        </div>
      </div>

      <div
        style={{
          padding: "13px 14px",
          borderRadius: 12,
          background:
            "var(--admin-soft, rgba(0, 0, 0, 0.025))",
          border:
            "1px solid var(--admin-border, var(--border))",
        }}
      >
        <div
          className="muted"
          style={{
            fontSize: 11,
            fontWeight: 750,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            marginBottom: 6,
          }}
        >
          Plan overview
        </div>

        <div
          style={{
            lineHeight: 1.55,
            fontSize: 13,
          }}
        >
          {plan.plan_summary}
        </div>
      </div>

      <div
        className="stack"
        style={{ gap: 8 }}
      >
        <div
          className="row space-between"
          style={{
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              fontWeight: 750,
              fontSize: 14,
            }}
          >
            Roadmap
          </div>

          <div
            className="muted"
            style={{
              fontSize: 12,
            }}
          >
            Select a step to view details
          </div>
        </div>

        {plan.milestones.map((milestone, index) => (
          <MilestoneCard
            key={`${milestone.sequence}-${milestone.title}`}
            milestone={milestone}
            defaultOpen={index === 0}
          />
        ))}
      </div>

      {(plan.guardrails.length > 0 ||
        plan.assumptions.length > 0) && (
        <div
          className="stack"
          style={{
            gap: 8,
            paddingTop: 2,
          }}
        >
          <div
            style={{
              fontWeight: 750,
              fontSize: 14,
            }}
          >
            Planning context
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 8,
            }}
          >
            <SecondarySection
              title="Guardrails"
              description="Constraints and boundaries that the plan must preserve."
              items={plan.guardrails}
            />

            <SecondarySection
              title="Planning assumptions"
              description="Assumptions used where the canonical sources do not provide certainty."
              items={plan.assumptions}
            />
          </div>
        </div>
      )}
    </section>
  );
}
