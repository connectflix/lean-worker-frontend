import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ProgressExperienceForm } from "@/components/progress-experience-form";
import type { ProgressExperienceRecord } from "@/lib/types";

describe("ProgressExperienceForm", () => {
  it("renders the French worker-facing copy and the three canonical choices", () => {
    render(
      <ProgressExperienceForm
        uiLanguage="fr"
        reflectionPrompt="Qu’est-ce que ce signal change pour toi ?"
        onSubmit={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("region", {
        name: "Ressenti de progression",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Et toi, est-ce que tu as le sentiment d’avoir avancé ?",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Il n’y a pas de bonne réponse. Ton ressenti peut être différent de ce qui a été observé.",
      ),
    ).toBeInTheDocument();

    expect(screen.getByText("Pas vraiment")).toBeInTheDocument();
    expect(screen.getByText("Un peu")).toBeInTheDocument();
    expect(screen.getByText("Clairement")).toBeInTheDocument();

    expect(
      screen.getByText("Qu’est-ce que ce signal change pour toi ?"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Enregistrer mon ressenti",
      }),
    ).toBeDisabled();
  });

  it("renders the English copy", () => {
    render(
      <ProgressExperienceForm
        uiLanguage="en"
        reflectionPrompt="What does this change for you?"
        onSubmit={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("region", {
        name: "Experienced progress",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "And for you, does this feel like progress?",
      ),
    ).toBeInTheDocument();

    expect(screen.getByText("Not really")).toBeInTheDocument();
    expect(screen.getByText("A little")).toBeInTheDocument();
    expect(screen.getByText("Clearly")).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Save how this feels",
      }),
    ).toBeDisabled();
  });

  it.each([
    ["not_really", "Pas vraiment"],
    ["a_little", "Un peu"],
    ["clearly", "Clairement"],
  ] as const)(
    "submits the exact subjective payload for %s",
    async (value, label) => {
      const onSubmit = vi.fn().mockResolvedValue(undefined);

      render(
        <ProgressExperienceForm
          uiLanguage="fr"
          onSubmit={onSubmit}
        />,
      );

      fireEvent.click(
        screen.getByRole("radio", {
          name: new RegExp(label, "i"),
        }),
      );

      fireEvent.change(
        screen.getByLabelText("Qu’est-ce qui te fait répondre ainsi ?"),
        {
          target: {
            value: "C’est mon ressenti personnel.",
          },
        },
      );

      fireEvent.click(
        screen.getByRole("button", {
          name: "Enregistrer mon ressenti",
        }),
      );

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledTimes(1);
      });

      const submitted = onSubmit.mock.calls[0][0] as ProgressExperienceRecord;

      expect(submitted).toEqual({
        experienced_progress: value,
        worker_explanation: "C’est mon ressenti personnel.",
      });
    },
  );

  it("submits null explanation when the optional text is blank", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <ProgressExperienceForm
        uiLanguage="fr"
        onSubmit={onSubmit}
      />,
    );

    fireEvent.click(
      screen.getByRole("radio", {
        name: /Un peu/i,
      }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Enregistrer mon ressenti",
      }),
    );

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    expect(onSubmit).toHaveBeenCalledWith({
      experienced_progress: "a_little",
      worker_explanation: null,
    });
  });

  it("trims the optional explanation before submitting", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <ProgressExperienceForm
        uiLanguage="fr"
        onSubmit={onSubmit}
      />,
    );

    fireEvent.click(
      screen.getByRole("radio", {
        name: /Clairement/i,
      }),
    );

    fireEvent.change(
      screen.getByLabelText("Qu’est-ce qui te fait répondre ainsi ?"),
      {
        target: {
          value: "   Je ressens une vraie évolution.   ",
        },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Enregistrer mon ressenti",
      }),
    );

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    expect(onSubmit).toHaveBeenCalledWith({
      experienced_progress: "clearly",
      worker_explanation: "Je ressens une vraie évolution.",
    });
  });

  it("prefills an existing experience and uses update copy", () => {
    render(
      <ProgressExperienceForm
        uiLanguage="fr"
        initialExperience="not_really"
        initialExplanation="Je ne le ressens pas encore."
        onSubmit={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("radio", {
        name: /Pas vraiment/i,
      }),
    ).toBeChecked();

    expect(
      screen.getByLabelText("Qu’est-ce qui te fait répondre ainsi ?"),
    ).toHaveValue("Je ne le ressens pas encore.");

    expect(
      screen.getByRole("button", {
        name: "Mettre à jour mon ressenti",
      }),
    ).toBeEnabled();
  });

  it("allows an existing experience to be replaced", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <ProgressExperienceForm
        uiLanguage="fr"
        initialExperience="not_really"
        initialExplanation="Pas encore."
        onSubmit={onSubmit}
      />,
    );

    fireEvent.click(
      screen.getByRole("radio", {
        name: /Clairement/i,
      }),
    );

    fireEvent.change(
      screen.getByLabelText("Qu’est-ce qui te fait répondre ainsi ?"),
      {
        target: {
          value: "Maintenant oui.",
        },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Mettre à jour mon ressenti",
      }),
    );

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        experienced_progress: "clearly",
        worker_explanation: "Maintenant oui.",
      });
    });
  });

  it("shows a local success state after submission", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <ProgressExperienceForm
        uiLanguage="fr"
        onSubmit={onSubmit}
      />,
    );

    fireEvent.click(
      screen.getByRole("radio", {
        name: /Un peu/i,
      }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Enregistrer mon ressenti",
      }),
    );

    expect(
      await screen.findByRole("status"),
    ).toHaveTextContent("Ton ressenti a été enregistré.");
  });

  it("surfaces submit errors locally without changing the selected response", async () => {
    const onSubmit = vi
      .fn()
      .mockRejectedValue(new Error("Service indisponible"));

    render(
      <ProgressExperienceForm
        uiLanguage="fr"
        onSubmit={onSubmit}
      />,
    );

    const choice = screen.getByRole("radio", {
      name: /Pas vraiment/i,
    });

    fireEvent.click(choice);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Enregistrer mon ressenti",
      }),
    );

    expect(
      await screen.findByRole("alert"),
    ).toHaveTextContent("Service indisponible");

    expect(choice).toBeChecked();
  });

  it("falls back to a worker-facing error message for unknown failures", async () => {
    const onSubmit = vi.fn().mockRejectedValue({});

    render(
      <ProgressExperienceForm
        uiLanguage="en"
        onSubmit={onSubmit}
      />,
    );

    fireEvent.click(
      screen.getByRole("radio", {
        name: /Clearly/i,
      }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Save how this feels",
      }),
    );

    expect(
      await screen.findByRole("alert"),
    ).toHaveTextContent(
      "Unable to save how this progress feels right now.",
    );
  });

  it("enforces the 2000-character explanation boundary", () => {
    render(
      <ProgressExperienceForm
        uiLanguage="fr"
        onSubmit={vi.fn()}
      />,
    );

    const textarea = screen.getByLabelText(
      "Qu’est-ce qui te fait répondre ainsi ?",
    );

    expect(textarea).toHaveAttribute("maxlength", "2000");

    fireEvent.change(textarea, {
      target: {
        value: "x".repeat(2000),
      },
    });

    expect(screen.getByText("2000/2000")).toBeInTheDocument();
  });

  it("does not expose scores, progress percentages, or gamified copy", () => {
    render(
      <ProgressExperienceForm
        uiLanguage="fr"
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.queryByText(/score/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/points/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/niveau/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });
});