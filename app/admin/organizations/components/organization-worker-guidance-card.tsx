"use client";

import { getOrganizationInsightsChildCardsCopy } from "@/lib/i18n/organization-insights-child-cards";
import { useAdminUiLanguage } from "@/lib/use-admin-ui-language";

import type {
  OrganizationWorkerMandateConstraint,
  OrganizationSupportRecommendation,
  OrganizationWorkerGuidanceResponse,
  OrganizationWorkerMandatePlan,
  OrganizationWorkerMandateSummary,
} from "@/lib/types";

function useGuidanceCopy() {
  const { uiLanguage } = useAdminUiLanguage();

  return getOrganizationInsightsChildCardsCopy(uiLanguage).guidance;
}


type OrganizationWorkerGuidanceCardProps = {
  guidance: OrganizationWorkerGuidanceResponse | null;
  loading: boolean;
  onOrganizationRecommendationCompleted?: (
    recommendationId: number,
  ) => void;
};

function CountBadge({
  count,
  label,
}: {
  count: number;
  label: string;
}) {
  return (
    <span
      className="badge"
      style={{
        whiteSpace: "nowrap",
      }}
    >
      {count} {label}
    </span>
  );
}

function SectionLabel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="muted"
      style={{
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
      }}
    >
      {children}
    </div>
  );
}

function SoftPanel({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className="card-soft"
      style={{
        padding: 14,
        border: "1px solid var(--admin-border, var(--border))",
        background: "rgba(255,255,255,0.82)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function CompactList({
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
    <div className="stack" style={{ gap: 8 }}>
      <div
        style={{
          fontWeight: 750,
          fontSize: 13,
        }}
      >
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
          <li key={`${title}-${index}`}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function ConstraintCards({
  title,
  items,
}: {
  title: string;
  items: OrganizationWorkerMandateConstraint[];
}) {
  const copy = useGuidanceCopy();
  if (!items.length) {
    return null;
  }

  return (
    <details>
      <summary
        style={{
          cursor: "pointer",
          listStyle: "none",
        }}
      >
        <div
          className="row space-between"
          style={{
            gap: 10,
            alignItems: "center",
          }}
        >
          <div style={{ fontWeight: 750 }}>{title}</div>

          <CountBadge
            count={items.length}
            label={items.length === 1 ? copy.item : copy.items}
          />
        </div>
      </summary>

      <div
        className="stack"
        style={{
          gap: 8,
          marginTop: 12,
        }}
      >
        {items.map((item) => (
          <SoftPanel
            key={`${title}-${item.code}-${item.description}`}
            style={{
              padding: 12,
            }}
          >
            <div className="stack" style={{ gap: 5 }}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 13,
                  lineHeight: 1.45,
                }}
              >
                {item.description}
              </div>

              <div
                className="muted"
                style={{
                  fontSize: 11,
                }}
              >
                {item.code}
              </div>
            </div>
          </SoftPanel>
        ))}
      </div>
    </details>
  );
}

function CollapsibleList({
  title,
  items,
  open = false,
}: {
  title: string;
  items: string[];
  open?: boolean;
}) {
  const copy = useGuidanceCopy();
  if (!items.length) {
    return null;
  }

  return (
    <details open={open}>
      <summary
        style={{
          cursor: "pointer",
          listStyle: "none",
        }}
      >
        <div
          className="row space-between"
          style={{
            gap: 10,
            alignItems: "center",
          }}
        >
          <div style={{ fontWeight: 750 }}>{title}</div>

          <CountBadge
            count={items.length}
            label={items.length === 1 ? copy.item : copy.items}
          />
        </div>
      </summary>

      <div style={{ marginTop: 12 }}>
        <CompactList
          title=""
          items={items}
        />
      </div>
    </details>
  );
}

function ExecutiveHeader({
  summary,
  plan,
  recommendations,
}: {
  summary: OrganizationWorkerMandateSummary | null;
  plan: OrganizationWorkerMandatePlan | null;
  recommendations: OrganizationSupportRecommendation[];
}) {
  const copy = useGuidanceCopy();
  return (
    <section
      className="card stack"
      style={{
        gap: 16,
        padding: 18,
        background:
          "linear-gradient(180deg, rgba(99,91,255,0.055) 0%, rgba(255,255,255,1) 100%)",
      }}
    >
      <div
        className="row space-between"
        style={{
          alignItems: "flex-start",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div className="stack" style={{ gap: 7 }}>
          <span
            className="badge primary"
            style={{ width: "fit-content" }}
          >
            {copy.badge}
          </span>

          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: "-0.025em",
            }}
          >
            {copy.workspaceTitle}
          </div>

          <div
            className="muted"
            style={{
              maxWidth: 760,
              lineHeight: 1.5,
            }}
          >
            {copy.workspaceDescription}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            justifyContent: "flex-end",
          }}
        >
          <span className="badge">
            {summary ? copy.mandateAvailable : copy.mandateMissing}
          </span>

          {plan ? (
            <>
              <span className="badge">{plan.planning_horizon}</span>
              <span className="badge">
                {plan.milestones.length}{" "}
                {plan.milestones.length === 1 ? copy.step : copy.steps}
              </span>
            </>
          ) : (
            <span className="badge">{copy.planMissing}</span>
          )}

          <span className="badge">
            {recommendations.length}{" "}
            {recommendations.length === 1
              ? copy.recommendation
              : copy.recommendations}
          </span>
        </div>
      </div>
    </section>
  );
}

function MandateOverview({
  summary,
}: {
  summary: OrganizationWorkerMandateSummary;
}) {
  const copy = useGuidanceCopy();
  return (
    <section className="card stack" style={{ gap: 16 }}>
      <div className="stack" style={{ gap: 5 }}>
        <SectionLabel>{copy.mandateLabel}</SectionLabel>

        <h2
          className="section-title"
          style={{
            margin: 0,
            fontSize: 18,
          }}
        >
          {copy.mandateSummary}
        </h2>

        <div className="muted">
          {copy.mandateSummaryDescription}
        </div>
      </div>

      <SoftPanel
        style={{
          padding: 16,
          background: "rgba(255,255,255,0.9)",
        }}
      >
        <div
          style={{
            lineHeight: 1.6,
            fontSize: 14,
          }}
        >
          {summary.mandate_summary}
        </div>
      </SoftPanel>

      {summary.professional_identity ? (
        <div className="stack" style={{ gap: 6 }}>
          <SectionLabel>{copy.professionalIdentity}</SectionLabel>

          <div
            style={{
              fontSize: 16,
              fontWeight: 750,
              lineHeight: 1.45,
            }}
          >
            {summary.professional_identity}
          </div>
        </div>
      ) : null}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 12,
        }}
      >
        <SoftPanel>
          <CompactList
            title={copy.expectedOutcomes}
            items={summary.expected_outcomes}
          />
        </SoftPanel>

        <SoftPanel>
          <CompactList
            title={copy.successDefinition}
            items={summary.success_definition}
          />
        </SoftPanel>

        <SoftPanel>
          <CompactList
            title={copy.contributionDrivers}
            items={summary.contribution_drivers}
          />
        </SoftPanel>
      </div>
    </section>
  );
}

function MandateSidebar({
  summary,
}: {
  summary: OrganizationWorkerMandateSummary;
}) {
  const copy = useGuidanceCopy();
  return (
    <aside
      className="stack"
      style={{
        gap: 12,
        position: "sticky",
        top: 18,
        alignSelf: "start",
      }}
    >
      <section className="card stack" style={{ gap: 14 }}>
        <div className="stack" style={{ gap: 4 }}>
          <SectionLabel>{copy.operatingFrame}</SectionLabel>
          <div className="section-title">{copy.atAGlance}</div>
        </div>

        <SoftPanel>
          <CompactList
            title={copy.timeCapacity}
            items={summary.time_capacity}
          />
        </SoftPanel>

        <SoftPanel>
          <CompactList
            title={copy.nonNegotiables}
            items={summary.non_negotiables}
          />
        </SoftPanel>

        <SoftPanel>
          <CompactList
            title={copy.risksToAvoid}
            items={summary.risks_to_avoid}
          />
        </SoftPanel>
      </section>

      <section className="card stack" style={{ gap: 14 }}>
        <div className="stack" style={{ gap: 4 }}>
          <SectionLabel>{copy.drivers}</SectionLabel>
          <div className="section-title">{copy.sustainsWorker}</div>
        </div>

        <CollapsibleList
          title={copy.meaningDrivers}
          items={summary.meaning_drivers}
        />

        <CollapsibleList
          title={copy.engagementDrivers}
          items={summary.engagement_drivers}
        />

        <CollapsibleList
          title={copy.energyConstraints}
          items={summary.energy_constraints}
        />
      </section>

      <section className="card stack" style={{ gap: 14 }}>
        <div className="stack" style={{ gap: 4 }}>
          <SectionLabel>{copy.guardrails}</SectionLabel>
          <div className="section-title">{copy.constraints}</div>
        </div>

        <ConstraintCards
          title={copy.hardConstraints}
          items={summary.hard_constraints}
        />

        <ConstraintCards
          title={copy.softConstraints}
          items={summary.soft_constraints}
        />
      </section>
    </aside>
  );
}

function MilestoneAccordion({
  milestone,
  defaultOpen,
}: {
  milestone: OrganizationWorkerMandatePlan["milestones"][number];
  defaultOpen: boolean;
}) {
  const copy = useGuidanceCopy();
  return (
    <details
      open={defaultOpen}
      className="card-soft"
      style={{
        border: "1px solid var(--admin-border, var(--border))",
        background: "#ffffff",
        overflow: "hidden",
      }}
    >
      <summary
        style={{
          cursor: "pointer",
          listStyle: "none",
          padding: 15,
        }}
      >
        <div
          className="row space-between"
          style={{
            gap: 12,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div
            className="row"
            style={{
              gap: 10,
              alignItems: "center",
              minWidth: 0,
              flex: 1,
            }}
          >
            <span className="badge">
              {copy.step.charAt(0).toUpperCase() + copy.step.slice(1)}{" "}
              {milestone.sequence}
            </span>

            <div
              style={{
                fontWeight: 750,
                fontSize: 15,
                lineHeight: 1.35,
              }}
            >
              {milestone.title}
            </div>
          </div>

          <span
            className="badge"
            style={{
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
          padding: "0 15px 15px",
        }}
      >
        <SoftPanel
          style={{
            background: "rgba(248,249,255,0.78)",
          }}
        >
          <div className="stack" style={{ gap: 6 }}>
            <SectionLabel>{copy.objective}</SectionLabel>

            <div
              style={{
                lineHeight: 1.55,
              }}
            >
              {milestone.objective}
            </div>
          </div>
        </SoftPanel>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 12,
          }}
        >
          <SoftPanel>
            <CompactList
              title={copy.expectedProgress}
              items={milestone.expected_progress}
            />
          </SoftPanel>

          <SoftPanel>
            <CompactList
              title={copy.organizationSupport}
              items={milestone.organization_support}
            />
          </SoftPanel>

          <SoftPanel>
            <CompactList
              title={copy.dependencies}
              items={milestone.dependencies}
            />
          </SoftPanel>
        </div>
      </div>
    </details>
  );
}

function MandatePlanSection({
  plan,
}: {
  plan: OrganizationWorkerMandatePlan;
}) {
  const copy = useGuidanceCopy();
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
        <div className="stack" style={{ gap: 5 }}>
          <SectionLabel>Organization support path</SectionLabel>

          <h2
            className="section-title"
            style={{
              margin: 0,
              fontSize: 18,
            }}
          >
            {copy.mandatePlan}
          </h2>

          <div className="muted">
            {copy.mandatePlanDescription}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <span className="badge">
            {plan.milestones.length}{" "}
            {plan.milestones.length === 1 ? copy.step : copy.steps}
          </span>
        </div>
      </div>

      <SoftPanel>
        <div className="stack" style={{ gap: 7 }}>
          <SectionLabel>Plan overview</SectionLabel>

          <div
            style={{
              lineHeight: 1.6,
              fontSize: 14,
            }}
          >
            {plan.plan_summary}
          </div>
        </div>
      </SoftPanel>

      {plan.approach.length ? (
        <details>
          <summary
            style={{
              cursor: "pointer",
              listStyle: "none",
            }}
          >
            <div
              className="row space-between"
              style={{
                alignItems: "center",
                gap: 10,
              }}
            >
              <div style={{ fontWeight: 750 }}>{copy.approach}</div>

              <CountBadge
                count={plan.approach.length}
                label={
                  plan.approach.length === 1
                    ? copy.principle
                    : copy.principles
                }
              />
            </div>
          </summary>

          <div style={{ marginTop: 12 }}>
            <SoftPanel>
              <CompactList
                title=""
                items={plan.approach}
              />
            </SoftPanel>
          </div>
        </details>
      ) : null}

      <div className="stack" style={{ gap: 10 }}>
        <div
          className="row space-between"
          style={{
            gap: 10,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div style={{ fontWeight: 800 }}>Roadmap</div>

          <div
            className="muted"
            style={{
              fontSize: 12,
            }}
          >
            Select a step to view details
          </div>
        </div>

        <div className="stack" style={{ gap: 10 }}>
          {plan.milestones.map((milestone, index) => (
            <MilestoneAccordion
              key={`${milestone.sequence}-${milestone.title}`}
              milestone={milestone}
              defaultOpen={index === 0}
            />
          ))}
        </div>
      </div>

      {plan.assumptions.length ? (
        <details>
          <summary
            style={{
              cursor: "pointer",
              listStyle: "none",
            }}
          >
            <div
              className="row space-between"
              style={{
                alignItems: "center",
                gap: 10,
              }}
            >
              <div style={{ fontWeight: 750 }}>{copy.planningAssumptions}</div>

              <CountBadge
                count={plan.assumptions.length}
                label={
                  plan.assumptions.length === 1
                    ? copy.assumption
                    : copy.assumptions
                }
              />
            </div>
          </summary>

          <div style={{ marginTop: 12 }}>
            <SoftPanel>
              <CompactList
                title=""
                items={plan.assumptions}
              />
            </SoftPanel>
          </div>
        </details>
      ) : null}
    </section>
  );
}

function OrganizationRecommendationsSection({
  recommendations,
  onCompleted,
}: {
  recommendations: OrganizationSupportRecommendation[];
  onCompleted?: (recommendationId: number) => void;
}) {
  const copy = useGuidanceCopy();
  if (!recommendations.length) {
    return null;
  }

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
        <div className="stack" style={{ gap: 5 }}>
          <SectionLabel>{copy.currentSupportActions}</SectionLabel>

          <h2
            className="section-title"
            style={{
              margin: 0,
              fontSize: 18,
            }}
          >
            {copy.organizationRecommendations}
          </h2>

          <div className="muted">
            {copy.organizationRecommendationsDescription}
          </div>
        </div>

        <CountBadge
          count={recommendations.length}
          label={
            recommendations.length === 1
              ? copy.recommendation
              : copy.recommendations
          }
        />
      </div>

      <div
        className="stack scroll-panel organization-recommendations-scroll"
        style={{
          gap: 10,
          maxHeight: 430,
          overflowY: "scroll",
          scrollbarGutter: "stable",
        }}
      >
        {recommendations.map((recommendation, index) => (
          <article
            key={`${recommendation.title}-${index}`}
            className="card-soft"
            style={{
              border: "1px solid var(--admin-border, var(--border))",
              background: "#ffffff",
            }}
          >
            <div
              className="row space-between"
              style={{
                gap: 12,
                alignItems: "center",
                flexWrap: "wrap",
                padding: 15,
              }}
            >
              <div
                className="row"
                style={{
                  gap: 10,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <span className="badge">
                  {copy.recommendationNumber(index + 1)}
                </span>

                <div
                  style={{
                    fontWeight: 750,
                    fontSize: 15,
                  }}
                >
                  {recommendation.title}
                </div>
              </div>

              <div
                className="row"
                style={{
                  gap: 8,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                {recommendation.completed_at ? (
                  <span className="badge">{copy.completed}</span>
                ) : null}

                {recommendation.timing ? (
                  <span className="badge">
                    {recommendation.timing}
                  </span>
                ) : null}

                {!recommendation.completed_at && onCompleted ? (
                  <button
                    type="button"
                    className="btn"
                    aria-label={copy.markCompleted(recommendation.title)}
                    onClick={() => onCompleted(recommendation.id)}
                  >
                    {copy.markCompletedButton}
                  </button>
                ) : null}
              </div>
            </div>

            <div
              className="stack"
              style={{
                gap: 12,
                padding: "0 15px 15px",
              }}
            >
              <SoftPanel>
                <div className="stack" style={{ gap: 6 }}>
                  <SectionLabel>{copy.organizationAction}</SectionLabel>
                  <div>{recommendation.action}</div>
                </div>
              </SoftPanel>

              <SoftPanel>
                <div className="stack" style={{ gap: 6 }}>
                  <SectionLabel>{copy.example}</SectionLabel>
                  <div className="muted" style={{ lineHeight: 1.55 }}>
                    {recommendation.example
                      ?? copy.historicalExampleUnavailable}
                  </div>
                </div>
              </SoftPanel>

              <SoftPanel>
                <div className="stack" style={{ gap: 6 }}>
                  <SectionLabel>{copy.rationale}</SectionLabel>

                  <div
                    className="muted"
                    style={{
                      lineHeight: 1.55,
                    }}
                  >
                    {recommendation.rationale}
                  </div>
                </div>
              </SoftPanel>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function EmptyGuidance() {
  const copy = useGuidanceCopy();
  return (
    <div className="card-soft stack" style={{ gap: 6 }}>
      <div style={{ fontWeight: 750 }}>
        {copy.emptyTitle}
      </div>

      <div className="muted">
        {copy.emptyDescription}
      </div>
    </div>
  );
}

export function OrganizationWorkerGuidanceCard({
  guidance,
  loading,
  onOrganizationRecommendationCompleted,
}: OrganizationWorkerGuidanceCardProps) {
  const copy = useGuidanceCopy();
  const organizationRecommendations =
    guidance?.organization_recommendations ?? [];

  if (loading) {
    return (
      <div className="card-soft">
        {copy.loading}
      </div>
    );
  }

  if (!guidance) {
    return <EmptyGuidance />;
  }

  if (
    !guidance.mandate_summary
    && !guidance.mandate_plan
    && !organizationRecommendations.length
  ) {
    return <EmptyGuidance />;
  }

  return (
    <div className="stack" style={{ gap: 16 }}>
      <ExecutiveHeader
        summary={guidance.mandate_summary}
        plan={guidance.mandate_plan}
        recommendations={organizationRecommendations}
      />

      <OrganizationRecommendationsSection
        recommendations={organizationRecommendations}
        onCompleted={onOrganizationRecommendationCompleted}
      />

      {guidance.mandate_summary ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.75fr) minmax(280px, 0.75fr)",
            gap: 16,
            alignItems: "start",
          }}
        >
          <div className="stack" style={{ gap: 16, minWidth: 0 }}>
            <MandateOverview
              summary={guidance.mandate_summary}
            />

            {guidance.mandate_plan ? (
              <MandatePlanSection
                plan={guidance.mandate_plan}
              />
            ) : (
              <div className="card-soft">
                {copy.planUnavailable}
              </div>
            )}

          </div>

          <MandateSidebar
            summary={guidance.mandate_summary}
          />
        </div>
      ) : (
        <div className="stack" style={{ gap: 16 }}>
          <div className="card-soft">
            {copy.summaryUnavailable}
          </div>

          {guidance.mandate_plan ? (
            <MandatePlanSection
              plan={guidance.mandate_plan}
            />
          ) : null}

        </div>
      )}
    </div>
  );
}
