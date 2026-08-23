import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ExecutionFollowUpCard } from "@/components/execution-follow-up-card";
import type {
  ExecutionFollowUpResponse,
  ExecutionResultResponse,
} from "@/lib/types";

function execution(
  overrides: Partial<ExecutionResultResponse> = {},
): ExecutionResultResponse {
  return {
    id: 900,
    worker_id: 7,
    session_id: 33,
    context_snapshot_id: 44,

    decisive_action_id: 101,
    lever_decision_id: 701,
    commercial_offer_resolution_id: null,

    attempt_number: 1,

    execution_status: "completed",
    outcome_status: "achieved",

    observed_result:
      "Le recruteur a répondu et un échange exploratoire a été planifié.",
    worker_reflection:
      "Le message était plus direct et plus facile à envoyer que prévu.",

    evidence_json: [
      "Réponse du recruteur reçue.",
    ],
    blockers_json: [
      "J'ai hésité avant l'envoi.",
      { blocker: "Le créneau proposé n'était pas idéal." },
      { description: "J'ai dû reformuler le message." },
      "Ce quatrième blocage ne doit pas être affiché.",
    ],

    outcome_score: 0.82,
    worker_confidence_after: 0.86,

    lever_used: true,
    lever_helpfulness_score: 0.8,
    lever_usage_evidence_json: [
      "Le guide a aidé à structurer le message.",
    ],

    started_at: "2026-08-10T09:00:00Z",
    completed_at: "2026-08-10T10:30:00Z",
    recorded_at: "2026-08-10T10:35:00Z",
    created_at: "2026-08-10T10:35:00Z",
    updated_at: "2026-08-10T10:35:00Z",

    ...overrides,
  };
}

function followUp(
  executions: ExecutionResultResponse[] = [execution()],
): ExecutionFollowUpResponse {
  return {
    decisive_action_id: 101,
    execution_results: executions,
  };
}

describe("ExecutionFollowUpCard", () => {
  it("renders the latest execution outcome in French", () => {
    render(
      <ExecutionFollowUpCard
        followUp={followUp()}
        uiLanguage="fr"
      />,
    );

    expect(
      screen.getByRole("region", {
        name: "Suivi d’exécution",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Terminée"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Résultat atteint"),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Le recruteur a répondu et un échange exploratoire a été planifié.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Le message était plus direct et plus facile à envoyer que prévu.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Confiance après action 86 %"),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Le levier sélectionné a été utilisé pendant cette tentative.",
      ),
    ).toBeInTheDocument();
  });

  it("selects the latest execution by attempt number, then id", () => {
    render(
      <ExecutionFollowUpCard
        followUp={followUp([
          execution({
            id: 900,
            attempt_number: 1,
            observed_result: "Première tentative",
          }),
          execution({
            id: 901,
            attempt_number: 2,
            observed_result: "Deuxième tentative ancienne",
          }),
          execution({
            id: 903,
            attempt_number: 2,
            observed_result: "Deuxième tentative la plus récente",
          }),
        ])}
        uiLanguage="fr"
      />,
    );

    expect(
      screen.getByText("Deuxième tentative la plus récente"),
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Première tentative"),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("Deuxième tentative ancienne"),
    ).not.toBeInTheDocument();

    expect(
      screen.getByText("Tentative 2 sur 3"),
    ).toBeInTheDocument();
  });

  it("normalizes blockers and displays at most three", () => {
    render(
      <ExecutionFollowUpCard
        followUp={followUp()}
        uiLanguage="fr"
      />,
    );

    expect(
      screen.getByText("J'ai hésité avant l'envoi."),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Le créneau proposé n'était pas idéal."),
    ).toBeInTheDocument();

    expect(
      screen.getByText("J'ai dû reformuler le message."),
    ).toBeInTheDocument();

    expect(
      screen.queryByText(
        "Ce quatrième blocage ne doit pas être affiché.",
      ),
    ).not.toBeInTheDocument();
  });

  it("renders the explicit empty-history state", () => {
    render(
      <ExecutionFollowUpCard
        followUp={followUp([])}
        uiLanguage="fr"
      />,
    );

    expect(
      screen.getByRole("region", {
        name: "Suivi d’exécution",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Aucun retour d’exécution enregistré pour le moment",
      ),
    ).toBeInTheDocument();
  });

  it("renders nothing when no follow-up is provided", () => {
    const { container } = render(
      <ExecutionFollowUpCard
        followUp={null}
        uiLanguage="fr"
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("keeps internal lineage and commercial reference values out of the DOM", () => {
    render(
      <ExecutionFollowUpCard
        followUp={followUp([
          execution({
            id: 99001,
            worker_id: 88002,
            session_id: 77003,
            context_snapshot_id: 66004,
            decisive_action_id: 55005,
            lever_decision_id: 44006,
            commercial_offer_resolution_id: 33007,
            outcome_score: 0.912345,
            lever_helpfulness_score: 0.823456,
          }),
        ])}
        uiLanguage="fr"
      />,
    );

    for (const hiddenValue of [
      "99001",
      "88002",
      "77003",
      "66004",
      "55005",
      "44006",
      "33007",
      "0.912345",
      "0.823456",
    ]) {
      expect(
        screen.queryByText(hiddenValue),
      ).not.toBeInTheDocument();
    }
  });

  it("clamps confidence to the supported 0-100 percent range", () => {
    const { rerender } = render(
      <ExecutionFollowUpCard
        followUp={followUp([
          execution({
            worker_confidence_after: 1.4,
          }),
        ])}
        uiLanguage="en"
      />,
    );

    expect(
      screen.getByText("Confidence after action 100%"),
    ).toBeInTheDocument();

    rerender(
      <ExecutionFollowUpCard
        followUp={followUp([
          execution({
            worker_confidence_after: -0.2,
          }),
        ])}
        uiLanguage="en"
      />,
    );

    expect(
      screen.getByText("Confidence after action 0%"),
    ).toBeInTheDocument();
  });

  it("renders English status labels without altering persisted feedback text", () => {
    render(
      <ExecutionFollowUpCard
        followUp={followUp([
          execution({
            execution_status: "blocked",
            outcome_status: "unknown",
            observed_result: "Waiting for hiring manager feedback.",
            worker_reflection: "I need a clearer next step.",
            lever_used: false,
          }),
        ])}
        uiLanguage="en"
      />,
    );

    expect(
      screen.getByRole("region", {
        name: "Execution follow-up",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Blocked"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Outcome to confirm"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Waiting for hiring manager feedback."),
    ).toBeInTheDocument();

    expect(
      screen.getByText("I need a clearer next step."),
    ).toBeInTheDocument();

    expect(
      screen.queryByText(
        "The selected lever was used during this attempt.",
      ),
    ).not.toBeInTheDocument();
  });
});