import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TrajectorySignalCard } from "@/components/trajectory-signal-card";
import type { TrajectorySignalResponse } from "@/lib/types";

describe("TrajectorySignalCard visibility boundary", () => {
  it("does not expose raw attention_shift content to the worker-facing UI", () => {
    const signal: TrajectorySignalResponse = {
      trajectory_signal: "positive",
      recommended_next_focus:
        "Protect the next decision boundary.",
      attention_shift: {
        from: "execution_gap",
        to: "decision_clarity",
        reason:
          "INTERNAL_ATTENTION_SHIFT_REASON_SHOULD_NOT_BE_RENDERED",
      },
    };

    render(
      <TrajectorySignalCard
        signal={signal}
        uiLanguage="en"
      />,
    );

    expect(
      screen.getByText(
        "Protect the next decision boundary.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.queryByText("execution_gap"),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("decision_clarity"),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText(
        "INTERNAL_ATTENTION_SHIFT_REASON_SHOULD_NOT_BE_RENDERED",
      ),
    ).not.toBeInTheDocument();
  });

  it("does not expose effective_lever_signals directly in the trajectory card", () => {
    const signal: TrajectorySignalResponse = {
      trajectory_signal: "positive",
      trajectory_summary:
        "Execution improved after the last decision.",
      effective_lever_signals: [
        "INTERNAL_EFFECTIVE_LEVER_SIGNAL_SHOULD_NOT_BE_RENDERED",
        {
          lever_id: 42,
          lever_name:
            "INTERNAL_LEVER_NAME_SHOULD_NOT_BE_RENDERED",
          determinacy_score: 0.97,
          reason:
            "INTERNAL_LEVER_REASON_SHOULD_NOT_BE_RENDERED",
        },
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
        "Execution improved after the last decision.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.queryByText(
        "INTERNAL_EFFECTIVE_LEVER_SIGNAL_SHOULD_NOT_BE_RENDERED",
      ),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText(
        "INTERNAL_LEVER_NAME_SHOULD_NOT_BE_RENDERED",
      ),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText(
        "INTERNAL_LEVER_REASON_SHOULD_NOT_BE_RENDERED",
      ),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("42"),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("0.97"),
    ).not.toBeInTheDocument();
  });

  it("still allows bounded worker-facing learnings from approved public fields", () => {
    const signal: TrajectorySignalResponse = {
      trajectory_signal: "mixed",
      learned_constraints: [
        "Too many simultaneous priorities reduce execution quality.",
      ],
      capability_signals: [
        "Clearer escalation when a blocker appears.",
      ],
      effective_lever_signals: [
        "INTERNAL_SIGNAL_NOT_FOR_THIS_CARD",
      ],
      attention_shift: {
        internal_reason:
          "INTERNAL_SHIFT_NOT_FOR_THIS_CARD",
      },
    };

    render(
      <TrajectorySignalCard
        signal={signal}
        uiLanguage="en"
      />,
    );

    expect(
      screen.getByText(
        "Too many simultaneous priorities reduce execution quality.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Clearer escalation when a blocker appears.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.queryByText(
        "INTERNAL_SIGNAL_NOT_FOR_THIS_CARD",
      ),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText(
        "INTERNAL_SHIFT_NOT_FOR_THIS_CARD",
      ),
    ).not.toBeInTheDocument();
  });

  it("does not render object payloads from approved collections unless a safe text field is recognized", () => {
    const signal: TrajectorySignalResponse = {
      trajectory_signal: "neutral",
      learned_constraints: [
        {
          hidden_code:
            "INTERNAL_CONSTRAINT_CODE_SHOULD_NOT_BE_RENDERED",
          score: 0.88,
        },
      ],
      capability_signals: [
        {
          label: "Recognized safe capability label",
          hidden_score: 0.91,
        },
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
        "Recognized safe capability label",
      ),
    ).toBeInTheDocument();

    expect(
      screen.queryByText(
        "INTERNAL_CONSTRAINT_CODE_SHOULD_NOT_BE_RENDERED",
      ),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("0.88"),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("0.91"),
    ).not.toBeInTheDocument();
  });
});