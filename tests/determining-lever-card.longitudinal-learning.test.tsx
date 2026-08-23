import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DeterminingLeverCard } from "@/components/determining-lever-card";
import type {
  LeverDecisionResponse,
  LeverLearningExperience,
} from "@/lib/types";

function decision(
  overrides: Partial<LeverDecisionResponse> = {},
): LeverDecisionResponse {
  return {
    id: 701,
    worker_id: 7,
    session_id: 33,
    decisive_action_id: 501,
    execution_gap_id: 601,

    lever_needed: true,
    selected_lever_id: 9,

    selected_lever_name: "Execution Focus Coach",
    selected_lever_type: "coach",
    selected_lever_description:
      "Un soutien structuré pour exécuter l'action sélectionnée.",
    selected_lever_url: null,

    necessity: "important",
    selection_reason:
      "Ce soutien répond au principal obstacle d'exécution.",
    determinacy_reason:
      "Il cible directement le facteur qui bloque l'action.",
    pragmatic_reason:
      "Il est utilisable immédiatement.",

    action_enablement_score: 0.9,
    attention_contribution_score: 0.8,
    intention_contribution_score: 0.8,
    mandate_contribution_score: 0.9,
    confidence: 0.88,

    pragmatic_fit_json: {},
    created_at: "2026-08-16T12:00:00Z",

    ...overrides,
  };
}

function learningExperience(
  overrides: Partial<LeverLearningExperience> = {},
): LeverLearningExperience {
  return {
    learning_signal: {
      lever_id: 9,
      evidence_state: "repeated_support",
      consistency: "consistent_support",
      recent_episode_count: 3,
      historical_episode_count: 1,
      latest_signal: "helpful",
      evidence_strength: "moderate",
      cautions: [],
    },
    learning_explanation:
      "Ce type de soutien a déjà été utile dans plusieurs situations récentes.",
    ...overrides,
  };
}

describe("DeterminingLeverCard longitudinal learning", () => {
  it("renders the Worker-facing longitudinal explanation for the selected Lever", () => {
    render(
      <DeterminingLeverCard
        decision={decision()}
        learningExperience={learningExperience()}
        uiLanguage="fr"
      />,
    );

    expect(
      screen.getByText(
        "Ce type de soutien a déjà été utile dans plusieurs situations récentes.",
      ),
    ).toBeInTheDocument();
  });

  it("keeps the historical explanation supplemental to the current selection rationale", () => {
    render(
      <DeterminingLeverCard
        decision={decision()}
        learningExperience={learningExperience()}
        uiLanguage="fr"
      />,
    );

    expect(
      screen.getByText(
        "Ce soutien répond au principal obstacle d'exécution.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Ce type de soutien a déjà été utile dans plusieurs situations récentes.",
      ),
    ).toBeInTheDocument();
  });

  it("does not render an empty longitudinal explanation", () => {
    render(
      <DeterminingLeverCard
        decision={decision()}
        learningExperience={learningExperience({
          learning_explanation: "   ",
        })}
        uiLanguage="fr"
      />,
    );

    expect(
      screen.queryByText(/situations récentes/i),
    ).not.toBeInTheDocument();
  });

  it("does not render longitudinal learning on the No Lever path", () => {
    const { container } = render(
      <DeterminingLeverCard
        decision={decision({
          lever_needed: false,
          selected_lever_id: null,
        })}
        learningExperience={learningExperience()}
        uiLanguage="fr"
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("does not expose internal longitudinal signal fields in the DOM", () => {
    const { container } = render(
      <DeterminingLeverCard
        decision={decision()}
        learningExperience={{
          learning_signal: {
            lever_id: 987654,
            evidence_state: "contradictory",
            consistency: "contradictory",
            recent_episode_count: 73,
            historical_episode_count: 41,
            latest_signal: "not_helpful",
            evidence_strength: "moderate",
            cautions: ["Internal caution should remain presentation-neutral."],
          },
          learning_explanation:
            "Les observations récentes sont contrastées, aucune conclusion stable n'est encore tirée.",
        }}
        uiLanguage="fr"
      />,
    );

    const text = container.textContent ?? "";

    expect(text).toContain(
      "Les observations récentes sont contrastées, aucune conclusion stable n'est encore tirée.",
    );

    expect(text).not.toContain("987654");
    expect(text).not.toContain("73");
    expect(text).not.toContain("41");
    expect(text).not.toContain("contradictory");
    expect(text).not.toContain("not_helpful");
    expect(text).not.toContain("moderate");
    expect(text).not.toContain(
      "Internal caution should remain presentation-neutral.",
    );
  });

  it("does not add ranking, recommendation, preference or effectiveness-score copy", () => {
    const { container } = render(
      <DeterminingLeverCard
        decision={decision()}
        learningExperience={learningExperience()}
        uiLanguage="fr"
      />,
    );

    const text = (container.textContent ?? "").toLowerCase();

    expect(text).not.toContain("meilleur lever");
    expect(text).not.toContain("classement");
    expect(text).not.toContain("préférence");
    expect(text).not.toContain("score d'efficacité");
    expect(text).not.toContain("recommandé grâce à l'historique");
  });
});