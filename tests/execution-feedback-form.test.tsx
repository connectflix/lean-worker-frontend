import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ExecutionFeedbackForm } from "@/components/execution-feedback-form";
import type { ExecutionResultRecord } from "@/lib/types";

describe("ExecutionFeedbackForm", () => {
  it("renders the French worker-facing execution feedback fields", () => {
    render(
      <ExecutionFeedbackForm
        uiLanguage="fr"
        onSubmit={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("region", {
        name: "Retour d’exécution",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("État de l’action"),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Résultat"),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Résultat observé"),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Ton retour"),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Blocages rencontrés"),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Confiance après cette tentative"),
    ).toBeInTheDocument();
  });

  it("does not expose the lever-used control when there is no selected lever", () => {
    render(
      <ExecutionFeedbackForm
        uiLanguage="fr"
        hasSelectedLever={false}
        onSubmit={vi.fn()}
      />,
    );

    expect(
      screen.queryByLabelText(
        "J’ai utilisé le levier sélectionné pendant cette tentative",
      ),
    ).not.toBeInTheDocument();
  });

  it("exposes the lever-used control only when a selected lever exists", () => {
    render(
      <ExecutionFeedbackForm
        uiLanguage="fr"
        hasSelectedLever
        onSubmit={vi.fn()}
      />,
    );

    expect(
      screen.getByLabelText(
        "J’ai utilisé le levier sélectionné pendant cette tentative",
      ),
    ).toBeInTheDocument();
  });

  it("forces a known outcome before submitting a completed action", async () => {
    const onSubmit = vi.fn();

    render(
      <ExecutionFeedbackForm
        uiLanguage="fr"
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(
      screen.getByLabelText("État de l’action"),
      {
        target: { value: "completed" },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Enregistrer le retour",
      }),
    );

    expect(
      await screen.findByRole("alert"),
    ).toHaveTextContent(
      "Une action terminée doit avoir un résultat confirmé.",
    );

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("requires an observed result when the outcome is known", async () => {
    const onSubmit = vi.fn();

    render(
      <ExecutionFeedbackForm
        uiLanguage="fr"
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(
      screen.getByLabelText("État de l’action"),
      {
        target: { value: "completed" },
      },
    );

    fireEvent.change(
      screen.getByLabelText("Résultat"),
      {
        target: { value: "achieved" },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Enregistrer le retour",
      }),
    );

    expect(
      await screen.findByRole("alert"),
    ).toHaveTextContent(
      "Décris brièvement le résultat observé avant d’enregistrer un résultat connu.",
    );

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits a normalized ExecutionResultRecord for a completed action", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <ExecutionFeedbackForm
        uiLanguage="fr"
        hasSelectedLever
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(
      screen.getByLabelText("État de l’action"),
      {
        target: { value: "completed" },
      },
    );

    fireEvent.change(
      screen.getByLabelText("Résultat"),
      {
        target: { value: "partially_achieved" },
      },
    );

    fireEvent.change(
      screen.getByLabelText("Résultat observé"),
      {
        target: {
          value: "  Le recruteur a répondu et proposé un autre créneau.  ",
        },
      },
    );

    fireEvent.change(
      screen.getByLabelText("Ton retour"),
      {
        target: {
          value: "  Le message direct a facilité la prise de contact.  ",
        },
      },
    );

    fireEvent.change(
      screen.getByLabelText("Blocages rencontrés"),
      {
        target: {
          value:
            "J’ai hésité avant l’envoi.\n\nLe créneau initial ne convenait pas.\n",
        },
      },
    );

    fireEvent.change(
      screen.getByLabelText("Confiance après cette tentative"),
      {
        target: { value: "85" },
      },
    );

    fireEvent.click(
      screen.getByLabelText(
        "J’ai utilisé le levier sélectionné pendant cette tentative",
      ),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Enregistrer le retour",
      }),
    );

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    const submitted = onSubmit.mock.calls[0][0] as ExecutionResultRecord;

    expect(submitted).toMatchObject({
      execution_status: "completed",
      outcome_status: "partially_achieved",
      observed_result:
        "Le recruteur a répondu et proposé un autre créneau.",
      worker_reflection:
        "Le message direct a facilité la prise de contact.",
      blockers: [
        "J’ai hésité avant l’envoi.",
        "Le créneau initial ne convenait pas.",
      ],
      worker_confidence_after: 0.85,
      lever_used: true,
    });

    expect(submitted.started_at).toEqual(expect.any(String));
    expect(submitted.completed_at).toEqual(expect.any(String));
  });

  it("keeps outcome unknown and completed_at empty for an in-progress action", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <ExecutionFeedbackForm
        uiLanguage="fr"
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(
      screen.getByLabelText("Résultat observé"),
      {
        target: {
          value: "Premier contact envoyé.",
        },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Enregistrer le retour",
      }),
    );

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      execution_status: "in_progress",
      outcome_status: "unknown",
      observed_result: "Premier contact envoyé.",
      lever_used: false,
      completed_at: null,
    });
  });

  it("clears a known outcome when execution returns to in-progress", () => {
    render(
      <ExecutionFeedbackForm
        uiLanguage="fr"
        onSubmit={vi.fn()}
      />,
    );

    const status = screen.getByLabelText("État de l’action");
    const outcome = screen.getByLabelText("Résultat") as HTMLSelectElement;

    fireEvent.change(status, {
      target: { value: "completed" },
    });

    fireEvent.change(outcome, {
      target: { value: "achieved" },
    });

    expect(outcome.value).toBe("achieved");

    fireEvent.change(status, {
      target: { value: "in_progress" },
    });

    expect(outcome.value).toBe("unknown");
    expect(outcome).toBeDisabled();
  });

  it("surfaces a non-technical submit error and keeps the form available", async () => {
    const onSubmit = vi
      .fn()
      .mockRejectedValue(new Error("backend internal failure 500"));

    render(
      <ExecutionFeedbackForm
        uiLanguage="fr"
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(
      screen.getByLabelText("Résultat observé"),
      {
        target: {
          value: "Premier contact envoyé.",
        },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Enregistrer le retour",
      }),
    );

    expect(
      await screen.findByRole("alert"),
    ).toHaveTextContent(
      "Le retour n’a pas pu être enregistré. Réessaie dans quelques instants.",
    );

    expect(
      screen.queryByText("backend internal failure 500"),
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Enregistrer le retour",
      }),
    ).toBeEnabled();
  });

  it("prefills the form from an existing execution attempt", () => {
    render(
      <ExecutionFeedbackForm
        uiLanguage="fr"
        existingExecution={{
          id: 901,
          worker_id: 7,
          session_id: 77,
          context_snapshot_id: 101,
          decisive_action_id: 501,
          lever_decision_id: 701,
          commercial_offer_resolution_id: null,
          attempt_number: 2,
          execution_status: "blocked",
          outcome_status: "unknown",
          observed_result: "Le décideur n'était pas disponible.",
          worker_reflection: "Je dois revoir le timing.",
          evidence_json: [],
          blockers_json: [
            "Absence du décideur",
            { blocker: "Créneau trop tardif" },
          ],
          outcome_score: null,
          worker_confidence_after: 0.62,
          lever_used: true,
          lever_helpfulness_score: 0.7,
          lever_usage_evidence_json: [],
          started_at: "2026-08-10T09:00:00Z",
          completed_at: null,
          recorded_at: "2026-08-10T09:30:00Z",
          created_at: "2026-08-10T09:30:00Z",
          updated_at: "2026-08-10T09:30:00Z",
        }}
        hasSelectedLever
        onSubmit={vi.fn()}
      />,
    );

    expect(
      screen.getByLabelText("État de l’action"),
    ).toHaveValue("blocked");

    expect(
      screen.getByLabelText("Résultat"),
    ).toHaveValue("unknown");

    expect(
      screen.getByLabelText("Résultat observé"),
    ).toHaveValue("Le décideur n'était pas disponible.");

    expect(
      screen.getByLabelText("Ton retour"),
    ).toHaveValue("Je dois revoir le timing.");

    expect(
      screen.getByLabelText("Blocages rencontrés"),
    ).toHaveValue("Absence du décideur\nCréneau trop tardif");

    expect(
      screen.getByLabelText("Confiance après cette tentative"),
    ).toHaveValue("62");

    expect(
      screen.getByLabelText(
        "J’ai utilisé le levier sélectionné pendant cette tentative",
      ),
    ).toBeChecked();

    expect(
      screen.getByRole("button", {
        name: "Mettre à jour cette tentative",
      }),
    ).toBeInTheDocument();
  });

  it("preserves started_at when finalizing an existing attempt", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <ExecutionFeedbackForm
        uiLanguage="fr"
        existingExecution={{
          id: 902,
          worker_id: 7,
          session_id: 77,
          context_snapshot_id: 101,
          decisive_action_id: 501,
          lever_decision_id: null,
          commercial_offer_resolution_id: null,
          attempt_number: 1,
          execution_status: "in_progress",
          outcome_status: "unknown",
          observed_result: "Premier contact envoyé.",
          worker_reflection: null,
          evidence_json: [],
          blockers_json: [],
          outcome_score: null,
          worker_confidence_after: 0.7,
          lever_used: false,
          lever_helpfulness_score: null,
          lever_usage_evidence_json: [],
          started_at: "2026-08-09T08:15:00Z",
          completed_at: null,
          recorded_at: "2026-08-09T08:20:00Z",
          created_at: "2026-08-09T08:20:00Z",
          updated_at: "2026-08-09T08:20:00Z",
        }}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(
      screen.getByLabelText("État de l’action"),
      {
        target: { value: "completed" },
      },
    );

    fireEvent.change(
      screen.getByLabelText("Résultat"),
      {
        target: { value: "achieved" },
      },
    );

    fireEvent.change(
      screen.getByLabelText("Résultat observé"),
      {
        target: { value: "Le contact a abouti." },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Mettre à jour cette tentative",
      }),
    );

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    const submitted = onSubmit.mock.calls[0][0] as ExecutionResultRecord;

    expect(submitted.started_at).toBe("2026-08-09T08:15:00Z");
    expect(submitted.completed_at).toEqual(expect.any(String));
    expect(submitted.execution_status).toBe("completed");
    expect(submitted.outcome_status).toBe("achieved");
  });

  it("preserves an existing completed_at when re-saving an already terminal attempt", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <ExecutionFeedbackForm
        uiLanguage="fr"
        existingExecution={{
          id: 903,
          worker_id: 7,
          session_id: 77,
          context_snapshot_id: 101,
          decisive_action_id: 501,
          lever_decision_id: null,
          commercial_offer_resolution_id: null,
          attempt_number: 1,
          execution_status: "completed",
          outcome_status: "achieved",
          observed_result: "Objectif atteint.",
          worker_reflection: null,
          evidence_json: [],
          blockers_json: [],
          outcome_score: 1,
          worker_confidence_after: 0.9,
          lever_used: false,
          lever_helpfulness_score: null,
          lever_usage_evidence_json: [],
          started_at: "2026-08-09T08:15:00Z",
          completed_at: "2026-08-09T10:30:00Z",
          recorded_at: "2026-08-09T10:35:00Z",
          created_at: "2026-08-09T10:35:00Z",
          updated_at: "2026-08-09T10:35:00Z",
        }}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Mettre à jour cette tentative",
      }),
    );

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    const submitted = onSubmit.mock.calls[0][0] as ExecutionResultRecord;

    expect(submitted.started_at).toBe("2026-08-09T08:15:00Z");
    expect(submitted.completed_at).toBe("2026-08-09T10:30:00Z");
  });

  it("resets to a fresh-attempt form when existingExecution becomes null", () => {
    const existingExecution = {
      id: 904,
      worker_id: 7,
      session_id: 77,
      context_snapshot_id: 101,
      decisive_action_id: 501,
      lever_decision_id: null,
      commercial_offer_resolution_id: null,
      attempt_number: 1,
      execution_status: "blocked" as const,
      outcome_status: "unknown" as const,
      observed_result: "Blocage existant.",
      worker_reflection: "Retour existant.",
      evidence_json: [],
      blockers_json: ["Blocage A"],
      outcome_score: null,
      worker_confidence_after: 0.55,
      lever_used: false,
      lever_helpfulness_score: null,
      lever_usage_evidence_json: [],
      started_at: "2026-08-09T08:15:00Z",
      completed_at: null,
      recorded_at: "2026-08-09T08:20:00Z",
      created_at: "2026-08-09T08:20:00Z",
      updated_at: "2026-08-09T08:20:00Z",
    };

    const { rerender } = render(
      <ExecutionFeedbackForm
        uiLanguage="fr"
        existingExecution={existingExecution}
        onSubmit={vi.fn()}
      />,
    );

    expect(
      screen.getByLabelText("Résultat observé"),
    ).toHaveValue("Blocage existant.");

    rerender(
      <ExecutionFeedbackForm
        uiLanguage="fr"
        existingExecution={null}
        onSubmit={vi.fn()}
      />,
    );

    expect(
      screen.getByLabelText("État de l’action"),
    ).toHaveValue("in_progress");

    expect(
      screen.getByLabelText("Résultat"),
    ).toHaveValue("unknown");

    expect(
      screen.getByLabelText("Résultat observé"),
    ).toHaveValue("");

    expect(
      screen.getByLabelText("Ton retour"),
    ).toHaveValue("");

    expect(
      screen.getByRole("button", {
        name: "Enregistrer le retour",
      }),
    ).toBeInTheDocument();
  });

  it("resets a fresh-attempt form after a successful submit", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <ExecutionFeedbackForm
        uiLanguage="fr"
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(
      screen.getByLabelText("Résultat observé"),
      {
        target: { value: "Premier contact envoyé." },
      },
    );

    fireEvent.change(
      screen.getByLabelText("Ton retour"),
      {
        target: { value: "Le premier pas est fait." },
      },
    );

    fireEvent.change(
      screen.getByLabelText("Blocages rencontrés"),
      {
        target: { value: "Attente de réponse" },
      },
    );

    fireEvent.change(
      screen.getByLabelText("Confiance après cette tentative"),
      {
        target: { value: "85" },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Enregistrer le retour",
      }),
    );

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(
        screen.getByLabelText("État de l’action"),
      ).toHaveValue("in_progress");

      expect(
        screen.getByLabelText("Résultat"),
      ).toHaveValue("unknown");

      expect(
        screen.getByLabelText("Résultat observé"),
      ).toHaveValue("");

      expect(
        screen.getByLabelText("Ton retour"),
      ).toHaveValue("");

      expect(
        screen.getByLabelText("Blocages rencontrés"),
      ).toHaveValue("");

      expect(
        screen.getByLabelText("Confiance après cette tentative"),
      ).toHaveValue("70");
    });
  });

  it("does not reset an existing execution form after a successful update", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <ExecutionFeedbackForm
        uiLanguage="fr"
        existingExecution={{
          id: 910,
          worker_id: 7,
          session_id: 77,
          context_snapshot_id: 101,
          decisive_action_id: 501,
          lever_decision_id: null,
          commercial_offer_resolution_id: null,
          attempt_number: 2,
          execution_status: "in_progress",
          outcome_status: "unknown",
          observed_result: "Tentative existante.",
          worker_reflection: "Réflexion existante.",
          evidence_json: [],
          blockers_json: ["Blocage existant"],
          outcome_score: null,
          worker_confidence_after: 0.65,
          lever_used: false,
          lever_helpfulness_score: null,
          lever_usage_evidence_json: [],
          started_at: "2026-08-11T08:00:00Z",
          completed_at: null,
          recorded_at: "2026-08-11T08:05:00Z",
          created_at: "2026-08-11T08:05:00Z",
          updated_at: "2026-08-11T08:05:00Z",
        }}
        onSubmit={onSubmit}
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByLabelText("Résultat observé"),
      ).toHaveValue("Tentative existante.");
    });

    fireEvent.change(
      screen.getByLabelText("Résultat observé"),
      {
        target: { value: "Tentative mise à jour." },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Mettre à jour cette tentative",
      }),
    );

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    expect(
      screen.getByLabelText("Résultat observé"),
    ).toHaveValue("Tentative mise à jour.");

    expect(
      screen.getByRole("button", {
        name: "Mettre à jour cette tentative",
      }),
    ).toBeInTheDocument();
  });

  it("keeps fresh-attempt values when submit fails", async () => {
    const onSubmit = vi
      .fn()
      .mockRejectedValue(new Error("temporary failure"));

    render(
      <ExecutionFeedbackForm
        uiLanguage="fr"
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(
      screen.getByLabelText("Résultat observé"),
      {
        target: { value: "Valeur à conserver." },
      },
    );

    fireEvent.change(
      screen.getByLabelText("Ton retour"),
      {
        target: { value: "Réflexion à conserver." },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Enregistrer le retour",
      }),
    );

    expect(
      await screen.findByRole("alert"),
    ).toHaveTextContent(
      "Le retour n’a pas pu être enregistré. Réessaie dans quelques instants.",
    );

    expect(
      screen.getByLabelText("Résultat observé"),
    ).toHaveValue("Valeur à conserver.");

    expect(
      screen.getByLabelText("Ton retour"),
    ).toHaveValue("Réflexion à conserver.");
  });

  it("renders English copy and submits without exposing commercial fields", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <ExecutionFeedbackForm
        uiLanguage="en"
        onSubmit={onSubmit}
      />,
    );

    expect(
      screen.getByRole("region", {
        name: "Execution feedback",
      }),
    ).toBeInTheDocument();

    fireEvent.change(
      screen.getByLabelText("Observed result"),
      {
        target: {
          value: "The hiring manager replied.",
        },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Save feedback",
      }),
    );

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    const submitted = onSubmit.mock.calls[0][0] as Record<string, unknown>;

    for (const forbiddenKey of [
      "worker_id",
      "session_id",
      "context_snapshot_id",
      "decisive_action_id",
      "lever_decision_id",
      "commercial_offer_resolution_id",
      "payment_transaction_id",
      "trajectory_update_id",
    ]) {
      expect(submitted).not.toHaveProperty(forbiddenKey);
    }
  });
});