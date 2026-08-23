"use client";

import { useEffect, useMemo, useState } from "react";

import type {
  ExperiencedProgressValue,
  ProgressExperienceRecord,
} from "@/lib/types";

type ProgressExperienceFormProps = {
  uiLanguage: "fr" | "en";
  reflectionPrompt?: string | null;
  initialExperience?: ExperiencedProgressValue | null;
  initialExplanation?: string | null;
  onSubmit: (record: ProgressExperienceRecord) => Promise<void>;
};

type ChoiceCopy = {
  value: ExperiencedProgressValue;
  label: string;
  description: string;
};

const MAX_EXPLANATION_LENGTH = 2000;

function getChoices(uiLanguage: "fr" | "en"): ChoiceCopy[] {
  if (uiLanguage === "fr") {
    return [
      {
        value: "not_really",
        label: "Pas vraiment",
        description:
          "Je comprends ce qui a changé, mais je ne ressens pas encore de progression.",
      },
      {
        value: "a_little",
        label: "Un peu",
        description:
          "Je commence à percevoir une évolution, même si elle reste encore partielle.",
      },
      {
        value: "clearly",
        label: "Clairement",
        description:
          "Je ressens concrètement que ma situation ou ma trajectoire a évolué.",
      },
    ];
  }

  return [
    {
      value: "not_really",
      label: "Not really",
      description:
        "I understand what changed, but I do not yet feel that I am making progress.",
    },
    {
      value: "a_little",
      label: "A little",
      description:
        "I am starting to notice some movement, even if it still feels partial.",
    },
    {
      value: "clearly",
      label: "Clearly",
      description:
        "I can clearly feel that my situation or trajectory has moved forward.",
    },
  ];
}

export function ProgressExperienceForm({
  uiLanguage,
  reflectionPrompt,
  initialExperience = null,
  initialExplanation = null,
  onSubmit,
}: ProgressExperienceFormProps) {
  const choices = useMemo(() => getChoices(uiLanguage), [uiLanguage]);

  const [experiencedProgress, setExperiencedProgress] =
    useState<ExperiencedProgressValue | null>(initialExperience);
  const [workerExplanation, setWorkerExplanation] = useState(
    initialExplanation ?? "",
  );
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setExperiencedProgress(initialExperience);
    setWorkerExplanation(initialExplanation ?? "");
    setSaved(false);
    setError(null);
  }, [initialExperience, initialExplanation]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!experiencedProgress || submitting) {
      return;
    }

    setSubmitting(true);
    setSaved(false);
    setError(null);

    const explanation = workerExplanation.trim();

    try {
      await onSubmit({
        experienced_progress: experiencedProgress,
        worker_explanation: explanation || null,
      });
      setSaved(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error && err.message.trim()
          ? err.message
          : uiLanguage === "fr"
            ? "Impossible d’enregistrer ton ressenti pour le moment."
            : "Unable to save how this progress feels right now.";

      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  const title =
    uiLanguage === "fr"
      ? "Et toi, est-ce que tu as le sentiment d’avoir avancé ?"
      : "And for you, does this feel like progress?";

  const helper =
    uiLanguage === "fr"
      ? "Il n’y a pas de bonne réponse. Ton ressenti peut être différent de ce qui a été observé."
      : "There is no right answer. How it feels to you may differ from what was observed.";

  const explanationLabel =
    uiLanguage === "fr"
      ? "Qu’est-ce qui te fait répondre ainsi ?"
      : "What makes you answer this way?";

  const explanationHelper =
    uiLanguage === "fr"
      ? "Facultatif — quelques mots suffisent."
      : "Optional — a few words are enough.";

  const submitLabel = submitting
    ? uiLanguage === "fr"
      ? "Enregistrement..."
      : "Saving..."
    : initialExperience
      ? uiLanguage === "fr"
        ? "Mettre à jour mon ressenti"
        : "Update how this feels"
      : uiLanguage === "fr"
        ? "Enregistrer mon ressenti"
        : "Save how this feels";

  return (
    <section
      aria-label={
        uiLanguage === "fr"
          ? "Ressenti de progression"
          : "Experienced progress"
      }
      className="card stack"
      style={{
        gap: 18,
        borderRadius: 28,
        border: "1px solid rgba(43,33,24,0.08)",
        background: "rgba(255,255,255,0.78)",
        boxShadow: "0 18px 48px rgba(43,33,24,0.06)",
      }}
    >
      <div className="stack" style={{ gap: 8 }}>
        <div
          className="section-title"
          style={{
            color: "var(--coach-ink)",
          }}
        >
          {title}
        </div>

        <div
          className="muted"
          style={{
            color: "var(--coach-muted)",
            lineHeight: 1.65,
            maxWidth: 760,
          }}
        >
          {helper}
        </div>

        {reflectionPrompt?.trim() ? (
          <div
            className="card-soft"
            style={{
              borderRadius: 20,
              background: "rgba(255,248,239,0.68)",
              border: "1px solid rgba(43,33,24,0.08)",
              color: "var(--coach-muted)",
              lineHeight: 1.6,
              fontStyle: "italic",
            }}
          >
            {reflectionPrompt}
          </div>
        ) : null}
      </div>

      <form className="stack" style={{ gap: 18 }} onSubmit={handleSubmit}>
        <fieldset
          disabled={submitting}
          style={{
            display: "grid",
            gap: 10,
            padding: 0,
            margin: 0,
            border: 0,
            minWidth: 0,
          }}
        >
          <legend
            style={{
              marginBottom: 10,
              fontWeight: 800,
              color: "var(--coach-ink)",
            }}
          >
            {uiLanguage === "fr" ? "Ton ressenti" : "How it feels to you"}
          </legend>

          {choices.map((choice) => {
            const selected = experiencedProgress === choice.value;

            return (
              <label
                key={choice.value}
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr",
                  gap: 12,
                  alignItems: "start",
                  padding: 14,
                  borderRadius: 20,
                  cursor: submitting ? "default" : "pointer",
                  border: selected
                    ? "1px solid rgba(88,180,174,0.42)"
                    : "1px solid rgba(43,33,24,0.08)",
                  background: selected
                    ? "rgba(232,248,246,0.78)"
                    : "rgba(255,248,239,0.52)",
                }}
              >
                <input
                  type="radio"
                  name="experienced-progress"
                  value={choice.value}
                  checked={selected}
                  onChange={() => {
                    setExperiencedProgress(choice.value);
                    setSaved(false);
                    setError(null);
                  }}
                  style={{ marginTop: 4 }}
                />

                <span className="stack" style={{ gap: 4 }}>
                  <strong style={{ color: "var(--coach-ink)" }}>
                    {choice.label}
                  </strong>
                  <span
                    className="muted"
                    style={{
                      color: "var(--coach-muted)",
                      lineHeight: 1.55,
                    }}
                  >
                    {choice.description}
                  </span>
                </span>
              </label>
            );
          })}
        </fieldset>

        <label className="stack" style={{ gap: 7 }}>
          <span
            style={{
              fontWeight: 800,
              color: "var(--coach-ink)",
            }}
          >
            {explanationLabel}
          </span>

          <span
            className="muted"
            style={{
              color: "var(--coach-muted)",
              fontSize: 13,
            }}
          >
            {explanationHelper}
          </span>

          <textarea
            aria-label={explanationLabel}
            value={workerExplanation}
            maxLength={MAX_EXPLANATION_LENGTH}
            disabled={submitting}
            onChange={(event) => {
              setWorkerExplanation(event.target.value);
              setSaved(false);
              setError(null);
            }}
            rows={4}
            placeholder={
              uiLanguage === "fr"
                ? "Par exemple : je vois ce qui a changé, mais je n’en ressens pas encore les effets."
                : "For example: I can see what changed, but I do not feel the effects yet."
            }
            style={{
              width: "100%",
              resize: "vertical",
              borderRadius: 18,
              border: "1px solid rgba(43,33,24,0.12)",
              background: "rgba(255,255,255,0.82)",
              color: "var(--coach-ink)",
              padding: 14,
              lineHeight: 1.55,
              font: "inherit",
            }}
          />

          <span
            className="fine-print"
            style={{
              color: "var(--coach-muted)",
              textAlign: "right",
            }}
          >
            {workerExplanation.length}/{MAX_EXPLANATION_LENGTH}
          </span>
        </label>

        {error ? (
          <div
            role="alert"
            style={{
              color: "var(--danger)",
              lineHeight: 1.55,
            }}
          >
            {error}
          </div>
        ) : null}

        {saved ? (
          <div
            role="status"
            className="muted"
            style={{
              color: "var(--coach-muted)",
              lineHeight: 1.55,
            }}
          >
            {uiLanguage === "fr"
              ? "Ton ressenti a été enregistré."
              : "How this feels to you has been saved."}
          </div>
        ) : null}

        <div className="row" style={{ flexWrap: "wrap", gap: 10 }}>
          <button
            type="submit"
            className="button"
            disabled={!experiencedProgress || submitting}
            style={{
              minHeight: 44,
              paddingInline: 18,
            }}
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </section>
  );
}