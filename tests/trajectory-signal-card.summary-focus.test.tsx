import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TrajectorySignalCard } from "@/components/trajectory-signal-card";
import type { TrajectorySignalResponse } from "@/lib/types";

describe("TrajectorySignalCard summary and next-focus rendering", () => {
  it("renders both the summary and the explicit next focus when both exist", () => {
    const signal: TrajectorySignalResponse = {
      trajectory_signal: "positive",
      trajectory_summary:
        "Execution became more consistent after the last decision.",
      recommended_next_focus:
        "Protect one priority decision this week.",
    };

    render(
      <TrajectorySignalCard
        signal={signal}
        uiLanguage="en"
      />,
    );

    expect(
      screen.getByText(
        "Execution became more consistent after the last decision.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Next focus"),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Protect one priority decision this week.",
      ),
    ).toBeInTheDocument();
  });

  it("renders the summary without creating an empty next-focus block", () => {
    const signal: TrajectorySignalResponse = {
      trajectory_signal: "neutral",
      trajectory_summary:
        "The trajectory is currently stable.",
    };

    render(
      <TrajectorySignalCard
        signal={signal}
        uiLanguage="en"
      />,
    );

    expect(
      screen.getByText(
        "The trajectory is currently stable.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Next focus"),
    ).not.toBeInTheDocument();
  });

  it("renders the explicit next focus without requiring a trajectory summary", () => {
    const signal: TrajectorySignalResponse = {
      recommended_next_focus:
        "Clarify the decision boundary before adding another priority.",
    };

    render(
      <TrajectorySignalCard
        signal={signal}
        uiLanguage="en"
      />,
    );

    expect(
      screen.getByText("Next focus"),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Clarify the decision boundary before adding another priority.",
      ),
    ).toBeInTheDocument();
  });

  it("uses the French next-focus copy without requiring a summary", () => {
    const signal: TrajectorySignalResponse = {
      recommended_next_focus:
        "Protéger un créneau d'exécution sans interruption.",
    };

    render(
      <TrajectorySignalCard
        signal={signal}
        uiLanguage="fr"
      />,
    );

    expect(
      screen.getByText("Prochain focus"),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Protéger un créneau d'exécution sans interruption.",
      ),
    ).toBeInTheDocument();
  });

  it("does not render next-attention fallback when an explicit next focus is present", () => {
    const signal: TrajectorySignalResponse = {
      recommended_next_focus:
        "Keep the explicit next focus.",
      next_attention_candidates: [
        "Fallback candidate one",
        "Fallback candidate two",
      ],
    };

    render(
      <TrajectorySignalCard
        signal={signal}
        uiLanguage="en"
      />,
    );

    expect(
      screen.getByText(
        "Keep the explicit next focus.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Keep in attention"),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("Fallback candidate one"),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("Fallback candidate two"),
    ).not.toBeInTheDocument();
  });

  it("renders the next-attention fallback only when no explicit focus exists", () => {
    const signal: TrajectorySignalResponse = {
      trajectory_summary:
        "No single next focus has been synthesized yet.",
      next_attention_candidates: [
        "Clarify ownership",
        "Reduce parallel priorities",
      ],
    };

    render(
      <TrajectorySignalCard
        signal={signal}
        uiLanguage="en"
      />,
    );

    expect(
      screen.getByText("Keep in attention"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Clarify ownership"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Reduce parallel priorities"),
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Next focus"),
    ).not.toBeInTheDocument();
  });

  it("renders nothing when summary, focus, state, confidence, and learnings are all absent", () => {
    const { container } = render(
      <TrajectorySignalCard
        signal={{
          trajectory_update_id: null,
          source_session_id: null,
          source_context_snapshot_id: null,
          source_decisive_action_id: null,
          source_execution_result_id: null,
          trajectory_signal: null,
          trajectory_summary: null,
          attention_shift: null,
          learned_constraints: null,
          capability_signals: null,
          effective_lever_signals: null,
          next_attention_candidates: null,
          recommended_next_focus: null,
          confidence: null,
        }}
        uiLanguage="fr"
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});