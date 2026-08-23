import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TrajectorySignalCard } from "@/components/trajectory-signal-card";
import type { TrajectorySignalResponse } from "@/lib/types";

const signal: TrajectorySignalResponse = {
  trajectory_signal: "positive",
  trajectory_summary:
    "Execution is becoming more consistent.",
  recommended_next_focus:
    "Protect one priority decision this week.",
  capability_signals: [
    "Clearer escalation when blocked",
  ],
  learned_constraints: [
    "Parallel priorities reduce execution quality",
  ],
  confidence: 0.8,
};

describe("TrajectorySignalCard worker-facing copy contract", () => {
  it("uses the expected French worker-facing copy", () => {
    render(
      <TrajectorySignalCard
        signal={signal}
        uiLanguage="fr"
      />,
    );

    expect(
      screen.getByText("Ta trajectoire"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Progression positive"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Confiance 80 %"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Prochain focus"),
    ).toBeInTheDocument();
  });

  it("uses the expected English worker-facing copy", () => {
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
      screen.getByText("Positive progress"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Confidence 80%"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Next focus"),
    ).toBeInTheDocument();
  });

  it("keeps technical architecture terms out of the visible worker copy", () => {
    render(
      <TrajectorySignalCard
        signal={signal}
        uiLanguage="en"
      />,
    );

    const forbiddenVisibleTerms = [
      "ProfessionalAttention",
      "ContextSnapshot",
      "DecisiveAction",
      "ExecutionResult",
      "TrajectoryUpdate",
      "LeverDecision",
      "CommercialOfferResolution",
      "attention_shift",
      "capability_signals",
      "learned_constraints",
      "recommended_next_focus",
    ];

    for (const term of forbiddenVisibleTerms) {
      expect(
        screen.queryByText(term, {
          exact: false,
        }),
      ).not.toBeInTheDocument();
    }
  });

  it("keeps payment and commercial vocabulary out of the trajectory card", () => {
    render(
      <TrajectorySignalCard
        signal={signal}
        uiLanguage="fr"
      />,
    );

    const forbiddenCommercialTerms = [
      "payment",
      "paiement",
      "checkout",
      "price",
      "prix",
      "revenue",
      "revenu",
      "commercial offer",
      "offre commerciale",
      "transaction",
    ];

    for (const term of forbiddenCommercialTerms) {
      expect(
        screen.queryByText(term, {
          exact: false,
        }),
      ).not.toBeInTheDocument();
    }
  });
});