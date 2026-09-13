import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProfessionalExecutionPlanCard } from "@/app/admin/organizations/components/professional-execution-plan-card";
import type { ProfessionalExecutionPlanResponse } from "@/lib/types";


function plan(): ProfessionalExecutionPlanResponse {
  return {
    plan_summary:
      "Build visible strategic contribution through staged professional progress.",
    planning_horizon_months: 12,
    milestones: [
      {
        sequence: 1,
        title: "Establish visible strategic contribution",
        objective:
          "Create observable strategic contribution in real professional work.",
        timing: "Months 1-3",
        expected_progress: [
          "Strategic contribution becomes visible",
          "Scope expands progressively",
        ],
        completion_evidence: [
          "One strategic contribution is documented",
          "Stakeholder feedback confirms increased scope",
        ],
        dependencies: [
          "Access to a cross-functional initiative",
        ],
      },
      {
        sequence: 2,
        title: "Increase decision influence",
        objective:
          "Move from contribution toward recurring decision influence.",
        timing: "Months 4-8",
        expected_progress: [
          "Worker contributes to higher-level decisions",
        ],
        completion_evidence: [
          "Repeated participation in strategic decisions",
        ],
        dependencies: [],
      },
    ],
    guardrails: [
      "Respect sustainable workload constraints",
      "Preserve the worker-owned professional direction",
    ],
    assumptions: [
      "The current Professional Intention remains valid.",
    ],
  };
}


describe("ProfessionalExecutionPlanCard", () => {
  it("renders a loading state independently", () => {
    render(
      <ProfessionalExecutionPlanCard
        plan={null}
        loading={true}
      />,
    );

    expect(
      screen.getByText(/loading professional execution plan/i),
    ).toBeInTheDocument();
  });


  it("renders an explicit empty state when no persisted plan exists", () => {
    render(
      <ProfessionalExecutionPlanCard
        plan={null}
        loading={false}
      />,
    );

    expect(
      screen.getByText(/no professional execution plan available yet/i),
    ).toBeInTheDocument();
  });


  it("renders the plan summary and numeric planning horizon", () => {
    render(
      <ProfessionalExecutionPlanCard
        plan={plan()}
        loading={false}
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: /professional execution plan/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Build visible strategic contribution through staged professional progress.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/12 months/i),
    ).toBeInTheDocument();
  });


  it("renders ordered milestones with objective and timing", () => {
    render(
      <ProfessionalExecutionPlanCard
        plan={plan()}
        loading={false}
      />,
    );

    expect(
      screen.getByText("Establish visible strategic contribution"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Increase decision influence"),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Create observable strategic contribution in real professional work.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Months 1-3"),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/step 1/i),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/step 2/i),
    ).toBeInTheDocument();
  });


  it("renders expected progress completion evidence and dependencies", () => {
    render(
      <ProfessionalExecutionPlanCard
        plan={plan()}
        loading={false}
      />,
    );

    expect(
      screen.getByText("Strategic contribution becomes visible"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("One strategic contribution is documented"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Access to a cross-functional initiative"),
    ).toBeInTheDocument();

    expect(
      screen.getAllByText(/expected progress/i).length,
    ).toBeGreaterThan(0);

    expect(
      screen.getAllByText(/completion evidence/i).length,
    ).toBeGreaterThan(0);
  });


  it("renders guardrails and assumptions as separate plan sections", () => {
    render(
      <ProfessionalExecutionPlanCard
        plan={plan()}
        loading={false}
      />,
    );

    expect(
      screen.getByText("Respect sustainable workload constraints"),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Preserve the worker-owned professional direction",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "The current Professional Intention remains valid.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/guardrails/i),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/planning assumptions/i),
    ).toBeInTheDocument();
  });
});
