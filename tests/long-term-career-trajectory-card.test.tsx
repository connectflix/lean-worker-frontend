import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LongTermCareerTrajectoryCard } from "@/components/long-term-career-trajectory-card";
import type { LongTermCareerTrajectoryRead } from "@/lib/types";


function longTermTrajectory(
  overrides: Partial<LongTermCareerTrajectoryRead> = {},
): LongTermCareerTrajectoryRead {
  return {
    temporal_profile: {
      temporal_evidence_state: "longitudinal",
      episode_count: 8,
      ignored_episode_count: 1,
      recent_episode_count: 4,
      historical_episode_count: 4,
      active_day_count: 7,
      coverage_days: 90,
      first_observed_at: "2026-05-25T12:00:00Z",
      last_observed_at: "2026-08-22T12:00:00Z",
      temporal_trend: "insufficient_evidence",
    },
    temporal_windows: {
      recent: {
        episode_count: 4,
        active_day_count: 3,
      },
      previous: {
        episode_count: 4,
        active_day_count: 3,
      },
    },
    activity_comparison: {
      activity_change: "similar_activity",
    },
    velocity_evidence: {
      velocity_evidence_state: "comparable_windows",
    },
    velocity_interpretation: {
      activity_velocity: "steady",
    },
    ...overrides,
  };
}


describe("LongTermCareerTrajectoryCard", () => {
  it("renders a dedicated worker-facing Long-Term trajectory card", () => {
    render(
      <LongTermCareerTrajectoryCard
        trajectory={longTermTrajectory()}
        language="en"
      />,
    );

    expect(
      screen.getByTestId("long-term-career-trajectory-card"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Long-term trajectory activity" }),
    ).toBeInTheDocument();
  });


  it("renders factual temporal coverage without claiming career progress", () => {
    render(
      <LongTermCareerTrajectoryCard
        trajectory={longTermTrajectory()}
        language="en"
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Observed history" }),
    ).toBeInTheDocument();

    expect(screen.getByText("8 episodes")).toBeInTheDocument();
    expect(screen.getByText("7 active days")).toBeInTheDocument();
    expect(screen.getByText("90 days covered")).toBeInTheDocument();

    expect(
      screen.queryByText(/career progress/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/career progression/i),
    ).not.toBeInTheDocument();
  });


  it("keeps recent and previous temporal windows distinct", () => {
    render(
      <LongTermCareerTrajectoryCard
        trajectory={longTermTrajectory({
          temporal_windows: {
            recent: {
              episode_count: 6,
              active_day_count: 4,
            },
            previous: {
              episode_count: 3,
              active_day_count: 2,
            },
          },
        })}
        language="en"
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Recent 30 days" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Previous 30 days" }),
    ).toBeInTheDocument();

    expect(screen.getByText("6 episodes")).toBeInTheDocument();
    expect(screen.getByText("4 active days")).toBeInTheDocument();
    expect(screen.getByText("3 episodes")).toBeInTheDocument();
    expect(screen.getByText("2 active days")).toBeInTheDocument();
  });


  it("renders activity comparison and activity velocity as distinct dimensions", () => {
    render(
      <LongTermCareerTrajectoryCard
        trajectory={longTermTrajectory({
          activity_comparison: {
            activity_change: "more_activity",
          },
          velocity_interpretation: {
            activity_velocity: "accelerating",
          },
        })}
        language="en"
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Activity comparison" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Activity pace" }),
    ).toBeInTheDocument();

    expect(screen.getByText("More activity")).toBeInTheDocument();
    expect(screen.getByText("Accelerating")).toBeInTheDocument();
  });


  it("renders mixed activity conservatively and never calls it steady", () => {
    render(
      <LongTermCareerTrajectoryCard
        trajectory={longTermTrajectory({
          activity_comparison: {
            activity_change: "mixed_activity",
          },
          velocity_interpretation: {
            activity_velocity: "insufficient_evidence",
          },
        })}
        language="en"
      />,
    );

    expect(screen.getByText("Mixed activity")).toBeInTheDocument();
    expect(screen.getByText("Insufficient evidence")).toBeInTheDocument();
    expect(screen.queryByText("Steady")).not.toBeInTheDocument();
  });


  it("renders a bounded insufficient-evidence state without inventing movement", () => {
    render(
      <LongTermCareerTrajectoryCard
        trajectory={longTermTrajectory({
          temporal_profile: {
            temporal_evidence_state: "insufficient_evidence",
            episode_count: 0,
            ignored_episode_count: 0,
            recent_episode_count: 0,
            historical_episode_count: 0,
            active_day_count: 0,
            coverage_days: 0,
            first_observed_at: null,
            last_observed_at: null,
            temporal_trend: "insufficient_evidence",
          },
          temporal_windows: {
            recent: {
              episode_count: 0,
              active_day_count: 0,
            },
            previous: {
              episode_count: 0,
              active_day_count: 0,
            },
          },
          activity_comparison: {
            activity_change: "insufficient_evidence",
          },
          velocity_evidence: {
            velocity_evidence_state: "insufficient_evidence",
          },
          velocity_interpretation: {
            activity_velocity: "insufficient_evidence",
          },
        })}
        language="en"
      />,
    );

    expect(
      screen.getByText(
        "There is not enough longitudinal activity evidence yet to compare your recent trajectory history.",
      ),
    ).toBeInTheDocument();

    expect(screen.queryByText("Accelerating")).not.toBeInTheDocument();
    expect(screen.queryByText("Decelerating")).not.toBeInTheDocument();
    expect(screen.queryByText("Steady")).not.toBeInTheDocument();
  });


  it("supports French worker-facing copy", () => {
    render(
      <LongTermCareerTrajectoryCard
        trajectory={longTermTrajectory()}
        language="fr"
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Activité de trajectoire à long terme" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Historique observé" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "30 derniers jours" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "30 jours précédents" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Comparaison d’activité" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Rythme d’activité" }),
    ).toBeInTheDocument();
  });


  it("keeps Long-Term activity distinct from Career Progress and Talent Progress", () => {
    const { container } = render(
      <LongTermCareerTrajectoryCard
        trajectory={longTermTrajectory()}
        language="en"
      />,
    );

    const visibleText = container.textContent?.toLowerCase() ?? "";

    expect(visibleText).toContain("activity");
    expect(visibleText).not.toContain("career progress");
    expect(visibleText).not.toContain("career movement");
    expect(visibleText).not.toContain("capability trajectory");
    expect(visibleText).not.toContain("value trajectory");
    expect(visibleText).not.toContain("impact trajectory");
    expect(visibleText).not.toContain("talent score");
  });


  it("never exposes lineage, commerce, rankings, recommendations or progression fields", () => {
    const { container } = render(
      <LongTermCareerTrajectoryCard
        trajectory={longTermTrajectory()}
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
      "progression_state",
      "progression_velocity",
      "career_score",
      "progression_score",
      "velocity_score",
    ];

    for (const token of forbidden) {
      expect(visibleText).not.toContain(token);
    }
  });
});