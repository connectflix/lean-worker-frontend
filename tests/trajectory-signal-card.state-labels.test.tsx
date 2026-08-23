import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TrajectorySignalCard } from "@/components/trajectory-signal-card";
import type {
  TrajectorySignalResponse,
  TrajectorySignalValue,
} from "@/lib/types";

const LABEL_CASES: Array<{
  value: TrajectorySignalValue;
  fr: string;
  en: string;
}> = [
  {
    value: "positive",
    fr: "Progression positive",
    en: "Positive progress",
  },
  {
    value: "mixed",
    fr: "Progression mitigée",
    en: "Mixed progress",
  },
  {
    value: "neutral",
    fr: "Signal stable",
    en: "Stable signal",
  },
  {
    value: "negative",
    fr: "Progression à réajuster",
    en: "Progress needs adjustment",
  },
  {
    value: "insufficient_evidence",
    fr: "Preuves encore insuffisantes",
    en: "Not enough evidence yet",
  },
];

function buildSignal(
  trajectorySignal: TrajectorySignalValue,
): TrajectorySignalResponse {
  return {
    trajectory_signal: trajectorySignal,
    trajectory_summary:
      "Worker-facing trajectory summary.",
  };
}

describe("TrajectorySignalCard trajectory state labels", () => {
  it.each(LABEL_CASES)(
    'maps "$value" to the expected French worker-facing label',
    ({ value, fr }) => {
      render(
        <TrajectorySignalCard
          signal={buildSignal(value)}
          uiLanguage="fr"
        />,
      );

      expect(
        screen.getByText(fr),
      ).toBeInTheDocument();
    },
  );

  it.each(LABEL_CASES)(
    'maps "$value" to the expected English worker-facing label',
    ({ value, en }) => {
      render(
        <TrajectorySignalCard
          signal={buildSignal(value)}
          uiLanguage="en"
        />,
      );

      expect(
        screen.getByText(en),
      ).toBeInTheDocument();
    },
  );

  it("does not display a trajectory-state badge when the state is absent", () => {
    render(
      <TrajectorySignalCard
        signal={{
          trajectory_summary:
            "A summary can exist without a trajectory state.",
        }}
        uiLanguage="en"
      />,
    );

    for (const { en } of LABEL_CASES) {
      expect(
        screen.queryByText(en),
      ).not.toBeInTheDocument();
    }

    expect(
      screen.getByText(
        "A summary can exist without a trajectory state.",
      ),
    ).toBeInTheDocument();
  });

  it("keeps the five canonical trajectory states fully covered", () => {
    const values = LABEL_CASES.map(
      ({ value }) => value,
    );

    expect(values).toEqual([
      "positive",
      "mixed",
      "neutral",
      "negative",
      "insufficient_evidence",
    ]);

    expect(new Set(values).size).toBe(5);
  });
});