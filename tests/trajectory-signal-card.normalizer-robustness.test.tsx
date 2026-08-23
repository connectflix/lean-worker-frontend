import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TrajectorySignalCard } from "@/components/trajectory-signal-card";
import type { TrajectorySignalResponse } from "@/lib/types";

describe("TrajectorySignalCard normalizer robustness", () => {
  it("ignores empty strings, numbers, booleans, nulls, and unknown object shapes", () => {
    const signal: TrajectorySignalResponse = {
      trajectory_signal: "mixed",
      learned_constraints: [
        "",
        "   ",
        42,
        true,
        false,
        null,
        undefined,
        {
          hidden_code: "SHOULD_NOT_RENDER_UNKNOWN_OBJECT",
        },
        {
          label: "Recognized public constraint",
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
      screen.getByText("Recognized public constraint"),
    ).toBeInTheDocument();

    expect(
      screen.queryByText("SHOULD_NOT_RENDER_UNKNOWN_OBJECT"),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("42"),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("true"),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("false"),
    ).not.toBeInTheDocument();
  });

  it("recognizes the approved safe text fields from object payloads", () => {
    const signal: TrajectorySignalResponse = {
      trajectory_signal: "positive",
      capability_signals: [
        { focus: "Focus field" },
        { constraint: "Constraint field" },
        { signal: "Signal field" },
        { capability: "Capability field" },
        { summary: "Summary field" },
        { label: "Label field" },
        { title: "Title field" },
      ],
    };

    render(
      <TrajectorySignalCard
        signal={signal}
        uiLanguage="en"
      />,
    );

    expect(
      screen.getByText("Focus field"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Constraint field"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Signal field"),
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Capability field"),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("Summary field"),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("Label field"),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("Title field"),
    ).not.toBeInTheDocument();
  });

  it("limits the combined normalized learnings to the first three safe text items", () => {
    const signal: TrajectorySignalResponse = {
      trajectory_signal: "positive",
      learned_constraints: [
        "Constraint one",
        "Constraint two",
        "Constraint three",
        "Constraint four",
        "Constraint five",
      ],
      capability_signals: [
        "Capability one",
        "Capability two",
        "Capability three",
        "Capability four",
      ],
    };

    render(
      <TrajectorySignalCard
        signal={signal}
        uiLanguage="en"
      />,
    );

    expect(
      screen.getByText("Capability one"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Capability two"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Capability three"),
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Capability four"),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("Constraint one"),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("Constraint two"),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("Constraint three"),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("Constraint four"),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("Constraint five"),
    ).not.toBeInTheDocument();
  });

  it("keeps recommended_next_focus precedence over normalized next attention candidates", () => {
    const signal: TrajectorySignalResponse = {
      trajectory_signal: "positive",
      recommended_next_focus:
        "Explicit next focus wins.",
      next_attention_candidates: [
        "Candidate one",
        "Candidate two",
        "Candidate three",
      ],
    };

    render(
      <TrajectorySignalCard
        signal={signal}
        uiLanguage="en"
      />,
    );

    expect(
      screen.getByText("Explicit next focus wins."),
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Candidate one"),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("Candidate two"),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("Candidate three"),
    ).not.toBeInTheDocument();
  });
});