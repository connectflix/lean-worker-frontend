import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

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
        id: 801,
        title: "Clarify decision boundaries",
        action: (
          "Make explicit which decisions the Worker can take "
          + "without additional approval."
        ),
        example: (
          "For example: allow the Worker to approve decisions "
          + "up to a defined threshold without additional approval."
        ),
        rationale: "This removes an avoidable organizational dependency.",
        timing: "Before the next execution step",
        completed_at: null,
      },
      {
        id: 802,
        title: "Protect focused execution time",
        action: "Reserve focused time for the selected action.",
        example: null,
        rationale: "This improves the conditions for execution.",
        timing: null,
        completed_at: null,
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


  it("renders a concrete example when the recommendation provides one", () => {
    render(
      <OrganizationWorkerGuidanceCard
        guidance={guidance()}
        loading={false}
      />,
    );

    expect(
      screen.getByText("Example"),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "For example: allow the Worker to approve decisions up to a defined threshold without additional approval.",
      ),
    ).toBeInTheDocument();
  });


  it("does not render an example block for legacy recommendations without one", () => {
    render(
      <OrganizationWorkerGuidanceCard
        guidance={guidance({
          organization_recommendations: [
            {
              id: 799,
              title: "Historical recommendation",
              action: "Clarify the execution condition.",
              example: null,
              rationale: "Historical grounded rationale.",
              timing: null,
              completed_at: null,
            },
          ],
        })}
        loading={false}
      />,
    );

    expect(
      screen.queryByText("Example"),
    ).not.toBeInTheDocument();

    expect(
      screen.getByText("Historical recommendation"),
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


  it("offers a completion action for an open organization recommendation", () => {
    const onCompleted = vi.fn();

    render(
      <OrganizationWorkerGuidanceCard
        guidance={guidance()}
        loading={false}
        onOrganizationRecommendationCompleted={onCompleted}
      />,
    );

    const button = screen.getByRole("button", {
      name: /mark clarify decision boundaries completed/i,
    });

    fireEvent.click(button);

    expect(onCompleted).toHaveBeenCalledTimes(1);
    expect(onCompleted).toHaveBeenCalledWith(801);
  });


  it("keeps completed recommendations visible and removes their completion action", () => {
    render(
      <OrganizationWorkerGuidanceCard
        guidance={guidance({
          organization_recommendations: [
            {
              ...guidance().organization_recommendations[0],
              completed_at: "2026-09-17T20:00:00",
            },
          ],
        })}
        loading={false}
        onOrganizationRecommendationCompleted={vi.fn()}
      />,
    );

    expect(
      screen.getByText("Clarify decision boundaries"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Completed"),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", {
        name: /mark clarify decision boundaries completed/i,
      }),
    ).not.toBeInTheDocument();
  });


  it("keeps organization recommendations inside a bounded scroll panel", () => {
    const { container } = render(
      <OrganizationWorkerGuidanceCard
        guidance={guidance()}
        loading={false}
      />,
    );

    const heading = screen.getByRole("heading", {
      name: "Organization recommendations",
    });

    const section = heading.closest("section");

    expect(section).not.toBeNull();

    const scrollPanel = section?.querySelector(".scroll-panel");

    expect(scrollPanel).not.toBeNull();
    expect(scrollPanel).toHaveClass("stack");
    expect(scrollPanel).toHaveStyle({
      maxHeight: "430px",
    });
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
