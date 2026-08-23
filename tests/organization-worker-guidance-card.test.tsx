import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { OrganizationWorkerGuidanceCard } from "@/app/admin/organizations/components/organization-worker-guidance-card";
import type { OrganizationWorkerGuidanceResponse } from "@/lib/types";


function guidance(
  overrides: Partial<OrganizationWorkerGuidanceResponse> = {},
): OrganizationWorkerGuidanceResponse {
  return {
    mandate_summary: {
      mandate_summary:
        "Strengthen strategic contribution while preserving sustainable execution.",
      professional_identity: "Senior cross-functional contributor",
      expected_outcomes: [
        "Increase strategic contribution",
      ],
      success_definition: [
        "Contribution is visible in real work",
      ],
      meaning_drivers: [
        "Useful contribution",
      ],
      engagement_drivers: [
        "Autonomy",
      ],
      contribution_drivers: [
        "Improve decision quality",
      ],
      hard_constraints: [
        {
          code: "capacity",
          description: "Protect delivery capacity",
          severity: "hard",
        },
      ],
      soft_constraints: [],
      time_capacity: [
        "Approximately four focused hours per week",
      ],
      energy_constraints: [
        "Avoid sustained overload",
      ],
      risks_to_avoid: [
        "Role expansion without decision authority",
      ],
      non_negotiables: [
        "Professional sustainability",
      ],
    },
    mandate_plan: {
      plan_summary:
        "Move from clarification to real-work demonstration and consolidation.",
      planning_horizon: "Approximately 4-6 months",
      approach: [
        "Clarify the contribution target",
        "Demonstrate it in real work",
      ],
      milestones: [
        {
          sequence: 1,
          title: "Clarify contribution target",
          objective: "Make the expected contribution explicit.",
          timing: "Weeks 1-2",
          expected_progress: [
            "The contribution target is explicit",
          ],
          organization_support: [
            "Clarify decision boundaries",
          ],
          dependencies: [],
        },
        {
          sequence: 2,
          title: "Demonstrate in real work",
          objective: "Apply the contribution in a concrete situation.",
          timing: "Weeks 3-8",
          expected_progress: [
            "A concrete contribution is observed",
          ],
          organization_support: [
            "Provide access to the relevant stakeholders",
          ],
          dependencies: [
            "Contribution target clarified",
          ],
        },
      ],
      assumptions: [
        "Timing should be revisited if the mandate changes.",
      ],
    },
    ...overrides,
  };
}


describe("OrganizationWorkerGuidanceCard", () => {
  it("renders the canonical mandate summary and planning horizon", () => {
    render(
      <OrganizationWorkerGuidanceCard
        guidance={guidance()}
        loading={false}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Mandate summary" }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Strengthen strategic contribution while preserving sustainable execution.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Approximately 4-6 months"),
    ).toBeInTheDocument();
  });


  it("renders mandate outcomes, success definition, capacity and constraints", () => {
    render(
      <OrganizationWorkerGuidanceCard
        guidance={guidance()}
        loading={false}
      />,
    );

    expect(
      screen.getByText("Increase strategic contribution"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Contribution is visible in real work"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Approximately four focused hours per week"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Protect delivery capacity"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Professional sustainability"),
    ).toBeInTheDocument();
  });


  it("renders milestones step by step with organization support", () => {
    render(
      <OrganizationWorkerGuidanceCard
        guidance={guidance()}
        loading={false}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Mandate plan" }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Clarify contribution target"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Demonstrate in real work"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Weeks 1-2"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Weeks 3-8"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Clarify decision boundaries"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Provide access to the relevant stakeholders"),
    ).toBeInTheDocument();
  });


  it("renders a bounded empty state when no guidance exists", () => {
    render(
      <OrganizationWorkerGuidanceCard
        guidance={{
          mandate_summary: null,
          mandate_plan: null,
        }}
        loading={false}
      />,
    );

    expect(
      screen.getByText("No mandate guidance available yet."),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /guidance will appear after a professional mandate has been established/i,
      ),
    ).toBeInTheDocument();
  });


  it("supports a summary even when the plan is not available yet", () => {
    render(
      <OrganizationWorkerGuidanceCard
        guidance={guidance({
          mandate_plan: null,
        })}
        loading={false}
      />,
    );

    expect(
      screen.getByText(
        "Strengthen strategic contribution while preserving sustainable execution.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText("No mandate plan available yet."),
    ).toBeInTheDocument();
  });


  it("shows loading without inventing mandate content", () => {
    render(
      <OrganizationWorkerGuidanceCard
        guidance={null}
        loading
      />,
    );

    expect(
      screen.getByText("Loading organization guidance..."),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", { name: "Mandate summary" }),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("heading", { name: "Mandate plan" }),
    ).not.toBeInTheDocument();
  });


  it("does not expose internal lineage, scores, rankings or performance ratings", () => {
    const { container } = render(
      <OrganizationWorkerGuidanceCard
        guidance={guidance()}
        loading={false}
      />,
    );

    const rendered = container.textContent?.toLowerCase() ?? "";

    for (const forbidden of [
      "worker_id",
      "professional_mandate_id",
      "source_canvas_refs",
      "source_payload",
      "worker score",
      "mandate score",
      "performance rating",
      "ranking",
      "payment",
      "checkout",
    ]) {
      expect(rendered).not.toContain(forbidden);
    }
  });
});