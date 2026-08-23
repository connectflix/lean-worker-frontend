import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DeterminingLeverCard } from "@/components/determining-lever-card";
import type { LeverDecisionResponse } from "@/lib/types";

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
      "Structured support for executing the selected action.",
    selected_lever_url: "https://example.test/levers/9",

    necessity: "important",

    selection_reason:
      "This Lever best enables the selected action.",
    determinacy_reason:
      "It addresses the determining execution barrier.",
    pragmatic_reason:
      "It is usable now.",

    action_enablement_score: 0.9,
    attention_contribution_score: 0.8,
    intention_contribution_score: 0.8,
    mandate_contribution_score: 0.9,
    confidence: 0.88,

    pragmatic_fit_json: {},

    created_at: "2026-08-10T12:00:00Z",

    ...overrides,
  };
}

describe("DeterminingLeverCard", () => {
  it("renders the selected Lever only on the positive Lever path", () => {
    render(
      <DeterminingLeverCard
        decision={decision()}
        uiLanguage="fr"
      />,
    );

    expect(
      screen.getByRole("region", {
        name: "Levier déterminant",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Execution Focus Coach"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Coach"),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Structured support for executing the selected action.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "This Lever best enables the selected action.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "It addresses the determining execution barrier.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText("It is usable now."),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Confiance 88 %"),
    ).toBeInTheDocument();
  });

  it("renders the public Lever link only for an http or https URL", () => {
    const { rerender } = render(
      <DeterminingLeverCard
        decision={decision()}
        uiLanguage="fr"
      />,
    );

    const link = screen.getByRole("link", {
      name: "Voir le levier",
    });

    expect(link).toHaveAttribute(
      "href",
      "https://example.test/levers/9",
    );
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute(
      "rel",
      "noopener noreferrer",
    );

    rerender(
      <DeterminingLeverCard
        decision={decision({
          selected_lever_url: "javascript:alert(1)",
        })}
        uiLanguage="fr"
      />,
    );

    expect(
      screen.queryByRole("link", {
        name: "Voir le levier",
      }),
    ).not.toBeInTheDocument();
  });

  it("renders nothing for the No Lever path", () => {
    const { container } = render(
      <DeterminingLeverCard
        decision={decision({
          lever_needed: false,
          selected_lever_id: null,
          selected_lever_name: null,
          selected_lever_type: null,
          selected_lever_description: null,
          selected_lever_url: null,
          necessity: "none",
          selection_reason:
            "The worker can execute without a Lever.",
          determinacy_reason: null,
          pragmatic_reason: null,
          action_enablement_score: 0,
          attention_contribution_score: 0,
          intention_contribution_score: 0,
          mandate_contribution_score: 0,
          confidence: 1,
        })}
        uiLanguage="fr"
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when a selected Lever id is absent", () => {
    const { container } = render(
      <DeterminingLeverCard
        decision={decision({
          selected_lever_id: null,
        })}
        uiLanguage="fr"
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("keeps internal IDs, contribution scores and pragmatic-fit payload out of the DOM", () => {
    render(
      <DeterminingLeverCard
        decision={decision({
          id: 991,
          worker_id: 881,
          session_id: 771,
          decisive_action_id: 661,
          execution_gap_id: 551,
          selected_lever_id: 441,
          action_enablement_score: 0.912345,
          attention_contribution_score: 0.823456,
          intention_contribution_score: 0.734567,
          mandate_contribution_score: 0.845678,
          pragmatic_fit_json: {
            blocker: "INTERNAL_BLOCKER_CODE",
            internal_score: 0.654321,
          },
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
      "0.734567",
      "0.845678",
      "INTERNAL_BLOCKER_CODE",
      "0.654321",
    ]) {
      expect(
        screen.queryByText(hiddenValue),
      ).not.toBeInTheDocument();
    }
  });

  it("clamps confidence to the supported 0-100 percent range", () => {
    const { rerender } = render(
      <DeterminingLeverCard
        decision={decision({
          confidence: 1.4,
        })}
        uiLanguage="en"
      />,
    );

    expect(
      screen.getByText("Confidence 100%"),
    ).toBeInTheDocument();

    rerender(
      <DeterminingLeverCard
        decision={decision({
          confidence: -0.2,
        })}
        uiLanguage="en"
      />,
    );

    expect(
      screen.getByText("Confidence 0%"),
    ).toBeInTheDocument();
  });

  it("renders English labels while preserving persisted decision rationale text", () => {
    render(
      <DeterminingLeverCard
        decision={decision({
          selected_lever_name: "Execution Focus Coach",
          selected_lever_type: "coach",
          selection_reason:
            "This Lever best enables the selected action.",
          determinacy_reason:
            "It addresses the determining execution barrier.",
          pragmatic_reason:
            "It is usable now.",
        })}
        uiLanguage="en"
      />,
    );

    expect(
      screen.getByRole("region", {
        name: "Determining lever",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Why this lever"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Why it is determining"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Why it is usable now"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: "View lever",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "This Lever best enables the selected action.",
      ),
    ).toBeInTheDocument();
  });

  it("renders nothing when the decision is absent", () => {
    const { container } = render(
      <DeterminingLeverCard
        decision={null}
        uiLanguage="fr"
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});