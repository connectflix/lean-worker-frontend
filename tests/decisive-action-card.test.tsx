import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DecisiveActionCard } from "@/components/decisive-action-card";
import type {
  DecisiveActionResponse,
  ProfessionalDecisionAdaptationExplanation,
} from "@/lib/types";

function action(
  overrides: Partial<DecisiveActionResponse> = {},
): DecisiveActionResponse {
  return {
    id: 501,
    worker_id: 1,
    session_id: 77,
    context_snapshot_id: 101,
    context_alignment_id: 202,
    selected_candidate_id: 401,

    selection_reason:
      "Cette action est la plus forte parmi les options valides.",
    decision_confidence: 0.91,

    sequence: 1,
    title: "Contacter un recruteur ciblé",
    description:
      "Envoyer un message ciblé à un recruteur correspondant à ton objectif.",
    expected_outcome:
      "Obtenir un signal concret du marché.",
    time_horizon: "48 heures",
    deadline_at: null,
    success_criteria_json: [
      "Un message ciblé est envoyé.",
      {
        criterion: "Le recruteur reçoit une proposition claire.",
      },
      {
        title: "Une réponse ou un signal de marché est obtenu.",
      },
      "Ce quatrième critère ne doit pas être affiché.",
    ],

    attention_resolution:
      "Cette action traite directement le blocage actuel.",
    intention_progress:
      "Elle fait progresser ton positionnement sur le marché.",
    mandate_alignment:
      "Elle protège ta stabilité professionnelle actuelle.",

    attention_relevance_score: 0.9,
    intention_progress_score: 0.88,
    mandate_alignment_score: 0.96,
    decisiveness_score: 0.89,
    overall_validity_score: 0.676,

    risks_json: [],
    mandate_veto_cleared: true,
    respected_blocking_constraint_codes_json: [],

    status: "proposed",
    created_at: "2026-08-10T12:00:00Z",
    updated_at: "2026-08-10T12:00:00Z",

    ...overrides,
  };
}


function adaptationExplanation(
  overrides: Partial<ProfessionalDecisionAdaptationExplanation> = {},
): ProfessionalDecisionAdaptationExplanation {
  return {
    previous_learning:
      "Le contact ciblé a produit un signal plus utile que les candidatures larges.",
    focus_change:
      "Le focus passe des candidatures générales à la préparation ciblée de l'échange recruteur.",
    why_this_focus_now:
      "Le signal précédent montre que la conversation recruteur est maintenant le prochain point utile à travailler.",
    ...overrides,
  };
}

describe("DecisiveActionCard", () => {
  it("renders the worker-facing rationale for the decisive action", () => {
    render(
      <DecisiveActionCard
        action={action()}
        uiLanguage="fr"
      />,
    );

    expect(
      screen.getByRole("region", {
        name: "Action décisive",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Contacter un recruteur ciblé"),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Cette action est la plus forte parmi les options valides.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Cette action traite directement le blocage actuel.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Elle fait progresser ton positionnement sur le marché.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Elle protège ta stabilité professionnelle actuelle.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Confiance 91 %"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("48 heures"),
    ).toBeInTheDocument();
  });

  it("renders expected outcome and at most three normalized success criteria", () => {
    render(
      <DecisiveActionCard
        action={action()}
        uiLanguage="fr"
      />,
    );

    expect(
      screen.getByText("Obtenir un signal concret du marché."),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Un message ciblé est envoyé."),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Le recruteur reçoit une proposition claire.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Une réponse ou un signal de marché est obtenu.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.queryByText(
        "Ce quatrième critère ne doit pas être affiché.",
      ),
    ).not.toBeInTheDocument();
  });

  it("keeps internal lineage identifiers and decision scores out of the DOM", () => {
    render(
      <DecisiveActionCard
        action={action({
          id: 991,
          worker_id: 881,
          session_id: 771,
          context_snapshot_id: 661,
          context_alignment_id: 551,
          selected_candidate_id: 441,
          attention_relevance_score: 0.912345,
          intention_progress_score: 0.823456,
          mandate_alignment_score: 0.934567,
          decisiveness_score: 0.845678,
          overall_validity_score: 0.654321,
        })}
        uiLanguage="fr"
      />,
    );

    for (const hiddenValue of [
      "991",
      "881",
      "771",
      "661",
      "551",
      "441",
      "0.912345",
      "0.823456",
      "0.934567",
      "0.845678",
      "0.654321",
    ]) {
      expect(
        screen.queryByText(hiddenValue),
      ).not.toBeInTheDocument();
    }
  });

  it("clamps confidence to the supported 0-100 percent display range", () => {
    const { rerender } = render(
      <DecisiveActionCard
        action={action({
          decision_confidence: 1.6,
        })}
        uiLanguage="en"
      />,
    );

    expect(
      screen.getByText("Confidence 100%"),
    ).toBeInTheDocument();

    rerender(
      <DecisiveActionCard
        action={action({
          decision_confidence: -0.3,
        })}
        uiLanguage="en"
      />,
    );

    expect(
      screen.getByText("Confidence 0%"),
    ).toBeInTheDocument();
  });

  it("renders nothing when the action is absent", () => {
    const { container } = render(
      <DecisiveActionCard
        action={null}
        uiLanguage="fr"
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renders English worker-facing labels without changing persisted rationale text", () => {
    render(
      <DecisiveActionCard
        action={action({
          title: "Contact one target recruiter",
          selection_reason:
            "This action has the strongest valid decision result.",
          attention_resolution:
            "It directly addresses the current bottleneck.",
          intention_progress:
            "It advances market positioning.",
          mandate_alignment:
            "It preserves current employment stability.",
          expected_outcome:
            "Produce one observable market signal.",
          time_horizon: "48 hours",
          success_criteria_json: [
            "One targeted message is sent.",
          ],
        })}
        uiLanguage="en"
      />,
    );

    expect(
      screen.getByRole("region", {
        name: "Decisive action",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Why this action"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Why now"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("What this moves forward"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("What this protects"),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "This action has the strongest valid decision result.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "It directly addresses the current bottleneck.",
      ),
    ).toBeInTheDocument();
  });

  it("renders the three worker-facing adaptation explanation blocks", () => {
    render(
      <DecisiveActionCard
        action={action()}
        adaptationExplanation={adaptationExplanation()}
        uiLanguage="fr"
      />,
    );

    expect(
      screen.getByText("Pourquoi le focus évolue"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Ce que le cycle précédent nous a appris"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Ce qui change dans le focus"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Pourquoi ce focus maintenant"),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Le contact ciblé a produit un signal plus utile que les candidatures larges.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Le focus passe des candidatures générales à la préparation ciblée de l'échange recruteur.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Le signal précédent montre que la conversation recruteur est maintenant le prochain point utile à travailler.",
      ),
    ).toBeInTheDocument();
  });

  it("does not render an adaptation section when no explanation is provided", () => {
    render(
      <DecisiveActionCard
        action={action()}
        adaptationExplanation={null}
        uiLanguage="fr"
      />,
    );

    expect(
      screen.queryByText("Pourquoi le focus évolue"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Ce que le cycle précédent nous a appris"),
    ).not.toBeInTheDocument();

    expect(
      screen.getByText("Pourquoi cette action"),
    ).toBeInTheDocument();
  });

  it("renders only non-empty adaptation fields without inventing fallback content", () => {
    render(
      <DecisiveActionCard
        action={action()}
        adaptationExplanation={adaptationExplanation({
          previous_learning: "  ",
          focus_change:
            "Le focus passe maintenant à la préparation de l'entretien.",
          why_this_focus_now: "",
        })}
        uiLanguage="fr"
      />,
    );

    expect(
      screen.queryByText("Ce que le cycle précédent nous a appris"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("Ce qui change dans le focus"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Le focus passe maintenant à la préparation de l'entretien.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Pourquoi ce focus maintenant"),
    ).not.toBeInTheDocument();
  });

  it("renders English adaptation labels while preserving backend explanation text exactly", () => {
    const explanation = adaptationExplanation({
      previous_learning:
        "A targeted recruiter message produced a concrete response.",
      focus_change:
        "The focus now shifts from outreach to recruiter-call preparation.",
      why_this_focus_now:
        "The prior response makes the recruiter conversation the next useful focus.",
    });

    render(
      <DecisiveActionCard
        action={action()}
        adaptationExplanation={explanation}
        uiLanguage="en"
      />,
    );

    expect(
      screen.getByText("Why the focus is evolving"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("What the previous cycle taught us"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("What changes in the focus"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Why this focus now"),
    ).toBeInTheDocument();

    expect(
      screen.getByText(explanation.previous_learning),
    ).toBeInTheDocument();
    expect(
      screen.getByText(explanation.focus_change),
    ).toBeInTheDocument();
    expect(
      screen.getByText(explanation.why_this_focus_now),
    ).toBeInTheDocument();
  });


});