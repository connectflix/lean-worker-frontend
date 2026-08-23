import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TrajectorySignalCard } from "@/components/trajectory-signal-card";
import type { TrajectorySignalResponse } from "@/lib/types";

describe("TrajectorySignalCard", () => {
  it("renders nothing when no longitudinal signal exists", () => {
    const { container } = render(
      <TrajectorySignalCard
        signal={{}}
        uiLanguage="fr"
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renders the worker-facing French trajectory summary", () => {
    const signal: TrajectorySignalResponse = {
      trajectory_update_id: 17,
      trajectory_signal: "positive",
      trajectory_summary:
        "Tu transformes plus régulièrement tes décisions en actions concrètes.",
      recommended_next_focus:
        "Conserver ce rythme et clarifier la prochaine décision prioritaire.",
      confidence: 0.84,
      capability_signals: [
        "Passage à l'action plus rapide",
      ],
      learned_constraints: [
        "La surcharge réduit la qualité de priorisation",
      ],
    };

    render(
      <TrajectorySignalCard
        signal={signal}
        uiLanguage="fr"
      />,
    );

    expect(
      screen.getByRole("region", {
        name: "Trajectoire professionnelle",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Ta trajectoire"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Progression positive"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Confiance 84 %"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Prochain focus"),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Conserver ce rythme et clarifier la prochaine décision prioritaire.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Tu transformes plus régulièrement tes décisions en actions concrètes.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Passage à l'action plus rapide"),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "La surcharge réduit la qualité de priorisation",
      ),
    ).toBeInTheDocument();
  });

  it("renders the English labels and bounded confidence", () => {
    const signal: TrajectorySignalResponse = {
      trajectory_signal: "mixed",
      trajectory_summary:
        "Execution improved, but prioritization remains inconsistent.",
      recommended_next_focus:
        "Choose one decision to protect this week.",
      confidence: 1.4,
    };

    render(
      <TrajectorySignalCard
        signal={signal}
        uiLanguage="en"
      />,
    );

    expect(
      screen.getByText("Your trajectory"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Mixed progress"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Confidence 100%"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Next focus"),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Choose one decision to protect this week.",
      ),
    ).toBeInTheDocument();
  });

  it("uses next attention candidates when no explicit next focus exists", () => {
    const signal: TrajectorySignalResponse = {
      trajectory_signal: "neutral",
      next_attention_candidates: [
        "Clarify the decision boundary",
        {
          focus: "Protect uninterrupted execution time",
        },
        {
          title: "Reassess accountability",
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
      screen.getByText("Keep in attention"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Clarify the decision boundary"),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Protect uninterrupted execution time",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Reassess accountability"),
    ).toBeInTheDocument();
  });

  it("does not render next attention candidates when an explicit next focus exists", () => {
    const signal: TrajectorySignalResponse = {
      trajectory_signal: "positive",
      recommended_next_focus:
        "Prepare the stakeholder decision.",
      next_attention_candidates: [
        "This candidate should stay hidden",
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
        "Prepare the stakeholder decision.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.queryByText(
        "This candidate should stay hidden",
      ),
    ).not.toBeInTheDocument();
  });

  it("does not expose source lineage identifiers in the worker-facing card", () => {
    const signal: TrajectorySignalResponse = {
      trajectory_update_id: 91,
      source_session_id: 81,
      source_context_snapshot_id: 71,
      source_decisive_action_id: 61,
      source_execution_result_id: 51,
      trajectory_signal: "positive",
      recommended_next_focus:
        "Continue with the validated next step.",
    };

    render(
      <TrajectorySignalCard
        signal={signal}
        uiLanguage="en"
      />,
    );

    expect(
      screen.queryByText("91"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("81"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("71"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("61"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("51"),
    ).not.toBeInTheDocument();
  });
});