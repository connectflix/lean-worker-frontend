import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TrajectorySignalCard } from "@/components/trajectory-signal-card";
import type { TrajectorySignalResponse } from "@/lib/types";

function renderWithConfidence(
  confidence: number | null | undefined,
  uiLanguage: "fr" | "en" = "en",
) {
  const signal: TrajectorySignalResponse = {
    trajectory_signal: "positive",
    trajectory_summary:
      "Confidence formatting test summary.",
    confidence,
  };

  return render(
    <TrajectorySignalCard
      signal={signal}
      uiLanguage={uiLanguage}
    />,
  );
}

describe("TrajectorySignalCard confidence formatting", () => {
  it("renders 0% at the lower bound in English", () => {
    renderWithConfidence(0, "en");

    expect(
      screen.getByText("Confidence 0%"),
    ).toBeInTheDocument();
  });

  it("renders a rounded intermediate percentage in English", () => {
    renderWithConfidence(0.846, "en");

    expect(
      screen.getByText("Confidence 85%"),
    ).toBeInTheDocument();
  });

  it("renders 100% at the upper bound in English", () => {
    renderWithConfidence(1, "en");

    expect(
      screen.getByText("Confidence 100%"),
    ).toBeInTheDocument();
  });

  it("clamps values above 1 to 100%", () => {
    renderWithConfidence(1.75, "en");

    expect(
      screen.getByText("Confidence 100%"),
    ).toBeInTheDocument();
  });

  it("clamps negative values to 0%", () => {
    renderWithConfidence(-0.4, "en");

    expect(
      screen.getByText("Confidence 0%"),
    ).toBeInTheDocument();
  });

  it("uses the French confidence label and spacing", () => {
    renderWithConfidence(0.42, "fr");

    expect(
      screen.getByText("Confiance 42 %"),
    ).toBeInTheDocument();
  });

  it("does not render a confidence badge when confidence is null", () => {
    renderWithConfidence(null, "en");

    expect(
      screen.queryByText(/^Confidence \d+%$/),
    ).not.toBeInTheDocument();

    expect(
      screen.getByText(
        "Confidence formatting test summary.",
      ),
    ).toBeInTheDocument();
  });

  it("does not render a confidence badge when confidence is undefined", () => {
    renderWithConfidence(undefined, "fr");

    expect(
      screen.queryByText(/^Confiance \d+ %$/),
    ).not.toBeInTheDocument();

    expect(
      screen.getByText(
        "Confidence formatting test summary.",
      ),
    ).toBeInTheDocument();
  });
});