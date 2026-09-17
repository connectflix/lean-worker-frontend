import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { OrganizationWorkerGuidanceCard } from "@/app/admin/organizations/components/organization-worker-guidance-card";
import type { OrganizationWorkerGuidanceResponse } from "@/lib/types";


function guidance(
  overrides: Partial<OrganizationWorkerGuidanceResponse> = {},
): OrganizationWorkerGuidanceResponse {
  return {
    mandate_summary: null,
    mandate_plan: null,
    organization_recommendations: [
      {
        title: "Clarify decision boundaries",
        action: (
          "Make explicit which decisions the Worker can take "
          + "without additional approval."
        ),
        rationale: "This removes an avoidable organizational dependency.",
        timing: "Before the next execution step",
      },
      {
        title: "Protect focused execution time",
        action: "Reserve focused time for the selected action.",
        rationale: "This improves the conditions for execution.",
        timing: null,
      },
    ],
    ...overrides,
  };
}


describe("OrganizationWorkerGuidanceCard organization recommendations", () => {
  it("renders organization recommendations even when mandate summary and plan are absent", () => {
    render(
      <OrganizationWorkerGuidanceCard
        guidance={guidance()}
        loading={false}
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: "Organization recommendations",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Clarify decision boundaries"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Protect focused execution time"),
    ).toBeInTheDocument();

    expect(
      screen.queryByText("No mandate guidance available yet."),
    ).not.toBeInTheDocument();
  });


  it("renders action, rationale and optional timing for each recommendation", () => {
    render(
      <OrganizationWorkerGuidanceCard
        guidance={guidance()}
        loading={false}
      />,
    );

    expect(
      screen.getByText(
        "Make explicit which decisions the Worker can take without additional approval.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "This removes an avoidable organizational dependency.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Before the next execution step"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Reserve focused time for the selected action."),
    ).toBeInTheDocument();
  });


  it("keeps recommendations explicitly organization-facing rather than Worker instructions", () => {
    render(
      <OrganizationWorkerGuidanceCard
        guidance={guidance()}
        loading={false}
      />,
    );

    expect(
      screen.getByText(
        /what the organization can do to improve the conditions for the Worker's next action/i,
      ),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", { name: "Worker recommendations" }),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("heading", { name: "Worker actions" }),
    ).not.toBeInTheDocument();
  });


  it("does not render an empty recommendation section", () => {
    render(
      <OrganizationWorkerGuidanceCard
        guidance={guidance({
          organization_recommendations: [],
          mandate_summary: {
            mandate_summary: "Current mandate.",
            professional_identity: null,
            expected_outcomes: [],
            success_definition: [],
            meaning_drivers: [],
            engagement_drivers: [],
            contribution_drivers: [],
            hard_constraints: [],
            soft_constraints: [],
            time_capacity: [],
            energy_constraints: [],
            risks_to_avoid: [],
            non_negotiables: [],
          },
        })}
        loading={false}
      />,
    );

    expect(
      screen.queryByRole("heading", {
        name: "Organization recommendations",
      }),
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Mandate summary" }),
    ).toBeInTheDocument();
  });


  it("preserves the existing loading state", () => {
    render(
      <OrganizationWorkerGuidanceCard
        guidance={guidance()}
        loading={true}
      />,
    );

    expect(
      screen.getByText("Loading organization guidance..."),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", {
        name: "Organization recommendations",
      }),
    ).not.toBeInTheDocument();
  });
});

it("shows current organization recommendations before the mandate plan", () => {
  render(
    <OrganizationWorkerGuidanceCard
      guidance={guidance({
        mandate_summary: {
          mandate_summary: "Current professional mandate.",
          professional_identity: "Program coordinator",
          expected_outcomes: [],
          success_definition: [],
          meaning_drivers: [],
          engagement_drivers: [],
          contribution_drivers: [],
          hard_constraints: [],
          soft_constraints: [],
          time_capacity: [],
          energy_constraints: [],
          risks_to_avoid: [],
          non_negotiables: [],
        },
        mandate_plan: {
          plan_summary: "A multi-step organization support path.",
          planning_horizon: "8 to 12 weeks",
          approach: [],
          milestones: [],
          assumptions: [],
        } as any,
      })}
      loading={false}
    />,
  );

  const recommendationsHeading = screen.getByRole("heading", {
    name: "Organization recommendations",
  });

  const mandatePlanHeading = screen.getByRole("heading", {
    name: "Mandate plan",
  });

  expect(
    recommendationsHeading.compareDocumentPosition(mandatePlanHeading)
      & Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();
});
