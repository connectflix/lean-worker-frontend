import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TrajectorySignalCard } from "@/components/trajectory-signal-card";
import type { TrajectorySignalResponse } from "@/lib/types";

describe("TrajectorySignalCard worker-facing learnings", () => {
  it("renders capability signals before learned constraints within the combined three-item cap", () => {
    const signal: TrajectorySignalResponse = {
      trajectory_signal: "positive",
      capability_signals: [
        "Capability one",
        "Capability two",
      ],
      learned_constraints: [
        "Constraint one",
        "Constraint two",
      ],
    };

    render(
      <TrajectorySignalCard
        signal={signal}
        uiLanguage="en"
      />,
    );

    const capabilityOne = screen.getByText("Capability one");
    const capabilityTwo = screen.getByText("Capability two");
    const constraintOne = screen.getByText("Constraint one");

    expect(
      capabilityOne.compareDocumentPosition(capabilityTwo) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    expect(
      capabilityTwo.compareDocumentPosition(constraintOne) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    expect(
      screen.queryByText("Constraint two"),
    ).not.toBeInTheDocument();
  });

  it("renders valid capability signals when constraints are absent", () => {
    const signal: TrajectorySignalResponse = {
      trajectory_signal: "positive",
      capability_signals: [
        "Clearer escalation under pressure",
      ],
      learned_constraints: null,
    };

    render(
      <TrajectorySignalCard
        signal={signal}
        uiLanguage="en"
      />,
    );

    expect(
      screen.getByText(
        "Clearer escalation under pressure",
      ),
    ).toBeInTheDocument();
  });

  it("renders valid learned constraints when capability signals are absent", () => {
    const signal: TrajectorySignalResponse = {
      trajectory_signal: "mixed",
      capability_signals: null,
      learned_constraints: [
        "Parallel priorities reduce execution quality",
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
        "Parallel priorities reduce execution quality",
      ),
    ).toBeInTheDocument();
  });

  it("ignores invalid entries without hiding valid learnings from the other source", () => {
    const signal: TrajectorySignalResponse = {
      trajectory_signal: "mixed",
      capability_signals: [
        {
          hidden_code:
            "INVALID_CAPABILITY_PAYLOAD",
        },
      ],
      learned_constraints: [
        "Valid constraint remains visible",
      ],
    };

    render(
      <TrajectorySignalCard
        signal={signal}
        uiLanguage="en"
      />,
    );

    expect(
      screen.queryByText("INVALID_CAPABILITY_PAYLOAD"),
    ).not.toBeInTheDocument();

    expect(
      screen.getByText(
        "Valid constraint remains visible",
      ),
    ).toBeInTheDocument();
  });

  it("keeps the combined worker-facing learning list bounded to three items total", () => {
    const signal: TrajectorySignalResponse = {
      trajectory_signal: "positive",
      capability_signals: [
        "Capability one",
        "Capability two",
        "Capability three",
        "Capability four",
      ],
      learned_constraints: [
        "Constraint one",
        "Constraint two",
        "Constraint three",
        "Constraint four",
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
  });
});