import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CareerTrajectoryIntelligenceCard } from "@/components/career-trajectory-intelligence-card";
import type { CareerTrajectoryIntelligenceResponse } from "@/lib/types";


function careerIntelligence(
  overrides: Partial<CareerTrajectoryIntelligenceResponse> = {},
): CareerTrajectoryIntelligenceResponse {
  return {
    current_direction: "Enterprise Architect",
    progression_state: "progressing",
    progression_velocity: "steady",
    persistent_blockers: [
      {
        blocker: "Limited exposure to strategic decision forums",
        persistence: "persistent",
        evidence: [
          "The same access constraint appeared across multiple professional cycles.",
        ],
      },
    ],
    direction_changes: [
      {
        from_direction: "Deepen delivery specialization",
        to_direction: "Broaden strategic contribution",
        evidence: [
          "Recent professional intentions consistently point toward broader scope.",
        ],
        interpretation:
          "The observed direction has shifted toward broader strategic contribution.",
      },
    ],
    stagnation_signals: [
      "One development area is explicitly stalled in the available longitudinal evidence.",
    ],
    career_summary:
      "Your career trajectory is moving toward broader strategic contribution.",
    ...overrides,
  };
}


describe("CareerTrajectoryIntelligenceCard", () => {
  it("renders Career Progress as a dedicated worker-facing card", () => {
    render(
      <CareerTrajectoryIntelligenceCard
        intelligence={careerIntelligence()}
        language="en"
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Career progress" }),
    ).toBeInTheDocument();

    expect(screen.getByText("Enterprise Architect")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Your career trajectory is moving toward broader strategic contribution.",
      ),
    ).toBeInTheDocument();
  });

  it("keeps direction, progression and velocity as distinct worker-facing dimensions", () => {
    render(
      <CareerTrajectoryIntelligenceCard
        intelligence={careerIntelligence()}
        language="en"
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Current direction" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Career movement" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Movement pace" }),
    ).toBeInTheDocument();

    expect(screen.getByText("Progressing")).toBeInTheDocument();
    expect(screen.getByText("Steady")).toBeInTheDocument();
  });

  it("renders persistent blockers with bounded evidence", () => {
    render(
      <CareerTrajectoryIntelligenceCard
        intelligence={careerIntelligence()}
        language="en"
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Persistent blockers" }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Limited exposure to strategic decision forums"),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "The same access constraint appeared across multiple professional cycles.",
      ),
    ).toBeInTheDocument();
  });

  it("renders evidence-backed direction changes without judging one direction as better", () => {
    render(
      <CareerTrajectoryIntelligenceCard
        intelligence={careerIntelligence()}
        language="en"
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Direction changes" }),
    ).toBeInTheDocument();

    expect(screen.getByText("Deepen delivery specialization")).toBeInTheDocument();
    expect(screen.getByText("Broaden strategic contribution")).toBeInTheDocument();

    expect(
      screen.getByText(
        "The observed direction has shifted toward broader strategic contribution.",
      ),
    ).toBeInTheDocument();

    expect(screen.queryByText(/better direction/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/worse direction/i)).not.toBeInTheDocument();
  });

  it("renders stagnation signals only when the CTI response contains them", () => {
    const { rerender } = render(
      <CareerTrajectoryIntelligenceCard
        intelligence={careerIntelligence()}
        language="en"
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Stagnation signals" }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "One development area is explicitly stalled in the available longitudinal evidence.",
      ),
    ).toBeInTheDocument();

    rerender(
      <CareerTrajectoryIntelligenceCard
        intelligence={careerIntelligence({ stagnation_signals: [] })}
        language="en"
      />,
    );

    expect(
      screen.queryByRole("heading", { name: "Stagnation signals" }),
    ).not.toBeInTheDocument();
  });

  it("renders a bounded insufficient-evidence state without inventing career movement", () => {
    render(
      <CareerTrajectoryIntelligenceCard
        intelligence={careerIntelligence({
          current_direction: null,
          progression_state: "insufficient_evidence",
          progression_velocity: "insufficient_evidence",
          persistent_blockers: [],
          direction_changes: [],
          stagnation_signals: [],
          career_summary: null,
        })}
        language="en"
      />,
    );

    expect(
      screen.getByText(
        "There is not enough longitudinal career evidence yet to describe your career progress.",
      ),
    ).toBeInTheDocument();

    expect(screen.queryByText("Progressing")).not.toBeInTheDocument();
    expect(screen.queryByText("Accelerating")).not.toBeInTheDocument();
    expect(screen.queryByText("Stagnating")).not.toBeInTheDocument();
  });

  it("supports French worker-facing copy", () => {
    render(
      <CareerTrajectoryIntelligenceCard
        intelligence={careerIntelligence()}
        language="fr"
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Progression de carrière" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Direction actuelle" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Mouvement de carrière" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Rythme du mouvement" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Blocages persistants" }),
    ).toBeInTheDocument();
  });

  it("keeps Career Progress distinct from Talent Progress", () => {
    const { container } = render(
      <CareerTrajectoryIntelligenceCard
        intelligence={careerIntelligence()}
        language="en"
      />,
    );

    const visibleText = container.textContent?.toLowerCase() ?? "";

    expect(visibleText).toContain("career");
    expect(visibleText).not.toContain("capability trajectory");
    expect(visibleText).not.toContain("value trajectory");
    expect(visibleText).not.toContain("impact trajectory");
    expect(visibleText).not.toContain("talent score");
  });

  it("never exposes lineage, commerce, ranking, recommendations, or hidden scores", () => {
    const { container } = render(
      <CareerTrajectoryIntelligenceCard
        intelligence={careerIntelligence()}
        language="en"
      />,
    );

    const visibleText = container.textContent?.toLowerCase() ?? "";

    const forbidden = [
      "worker_id",
      "user_id",
      "trajectory_update_id",
      "session_id",
      "snapshot_id",
      "execution_result_id",
      "decisive_action_id",
      "payment",
      "checkout",
      "commercial",
      "revenue",
      "ranking",
      "recommendation",
      "career_score",
      "progression_score",
      "velocity_score",
    ];

    for (const token of forbidden) {
      expect(visibleText).not.toContain(token);
    }
  });
});