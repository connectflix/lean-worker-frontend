"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import type {
  ExecutionResultRecord,
  ExecutionResultResponse,
  ExecutionStatus,
  OutcomeStatus,
} from "@/lib/types";
import type { SupportedUiLanguage } from "@/lib/user-locales";
import {
  BadgePill,
  CheckCircleIcon,
  ClockIcon,
  SparkIcon,
  TargetIcon,
} from "@/components/ui-flat-icons";

type ExecutionFeedbackFormProps = {
  uiLanguage: SupportedUiLanguage;
  existingExecution?: ExecutionResultResponse | null;
  hasSelectedLever?: boolean;
  disabled?: boolean;
  onSubmit: (record: ExecutionResultRecord) => Promise<void> | void;
};

type Copy = {
  regionLabel: string;
  badge: string;
  eyebrow: string;
  title: string;
  description: string;
  statusLabel: string;
  outcomeLabel: string;
  observedLabel: string;
  observedPlaceholder: string;
  reflectionLabel: string;
  reflectionPlaceholder: string;
  blockersLabel: string;
  blockersPlaceholder: string;
  confidenceLabel: string;
  leverUsedLabel: string;
  submit: string;
  updateSubmit: string;
  submitting: string;
  updating: string;
  validationObserved: string;
  validationCompletedOutcome: string;
  submitError: string;
};

const COPY: Record<SupportedUiLanguage, Copy> = {
  fr: {
    regionLabel: "Retour d’exécution",
    badge: "Retour d’exécution",
    eyebrow: "Transformer l’action en apprentissage",
    title: "Qu’est-ce qui s’est réellement passé ?",
    description:
      "Enregistre uniquement ce que tu as observé. Ce retour servira à ajuster la suite de ta trajectoire, indépendamment de tout achat.",
    statusLabel: "État de l’action",
    outcomeLabel: "Résultat",
    observedLabel: "Résultat observé",
    observedPlaceholder:
      "Ex. : le recruteur a répondu, la réunion a été planifiée, le document a été envoyé…",
    reflectionLabel: "Ton retour",
    reflectionPlaceholder:
      "Qu’est-ce qui a été plus facile, plus difficile ou différent de ce que tu anticipais ?",
    blockersLabel: "Blocages rencontrés",
    blockersPlaceholder:
      "Un blocage par ligne, si nécessaire.",
    confidenceLabel: "Confiance après cette tentative",
    leverUsedLabel: "J’ai utilisé le levier sélectionné pendant cette tentative",
    submit: "Enregistrer le retour",
    updateSubmit: "Mettre à jour cette tentative",
    submitting: "Enregistrement…",
    updating: "Mise à jour…",
    validationObserved:
      "Décris brièvement le résultat observé avant d’enregistrer un résultat connu.",
    validationCompletedOutcome:
      "Une action terminée doit avoir un résultat confirmé.",
    submitError:
      "Le retour n’a pas pu être enregistré. Réessaie dans quelques instants.",
  },
  en: {
    regionLabel: "Execution feedback",
    badge: "Execution feedback",
    eyebrow: "Turn action into learning",
    title: "What actually happened?",
    description:
      "Record only what you observed. This feedback will help adapt what comes next in your trajectory, independently from any purchase.",
    statusLabel: "Action status",
    outcomeLabel: "Outcome",
    observedLabel: "Observed result",
    observedPlaceholder:
      "E.g. the recruiter replied, the meeting was scheduled, the document was sent…",
    reflectionLabel: "Your reflection",
    reflectionPlaceholder:
      "What was easier, harder, or different from what you expected?",
    blockersLabel: "Blockers encountered",
    blockersPlaceholder:
      "One blocker per line, if needed.",
    confidenceLabel: "Confidence after this attempt",
    leverUsedLabel: "I used the selected lever during this attempt",
    submit: "Save feedback",
    updateSubmit: "Update this attempt",
    submitting: "Saving…",
    updating: "Updating…",
    validationObserved:
      "Briefly describe the observed result before saving a known outcome.",
    validationCompletedOutcome:
      "A completed action must have a confirmed outcome.",
    submitError:
      "The feedback could not be saved. Please try again in a moment.",
  },
};

const EXECUTION_STATUS_OPTIONS: ExecutionStatus[] = [
  "not_started",
  "in_progress",
  "completed",
  "blocked",
  "abandoned",
];

const OUTCOME_STATUS_OPTIONS: OutcomeStatus[] = [
  "unknown",
  "achieved",
  "partially_achieved",
  "not_achieved",
];

function executionStatusLabel(
  value: ExecutionStatus,
  uiLanguage: SupportedUiLanguage,
): string {
  const labels: Record<ExecutionStatus, { fr: string; en: string }> = {
    not_started: { fr: "Non démarrée", en: "Not started" },
    in_progress: { fr: "En cours", en: "In progress" },
    completed: { fr: "Terminée", en: "Completed" },
    blocked: { fr: "Bloquée", en: "Blocked" },
    abandoned: { fr: "Abandonnée", en: "Abandoned" },
  };

  return labels[value][uiLanguage];
}

function outcomeStatusLabel(
  value: OutcomeStatus,
  uiLanguage: SupportedUiLanguage,
): string {
  const labels: Record<OutcomeStatus, { fr: string; en: string }> = {
    unknown: {
      fr: "À confirmer",
      en: "To confirm",
    },
    achieved: {
      fr: "Atteint",
      en: "Achieved",
    },
    partially_achieved: {
      fr: "Partiellement atteint",
      en: "Partially achieved",
    },
    not_achieved: {
      fr: "Non atteint",
      en: "Not achieved",
    },
  };

  return labels[value][uiLanguage];
}

function cleanOptional(value: string): string | null {
  const normalized = value.trim();
  return normalized || null;
}

function blockersFromText(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 10);
}

function blockersToText(values: unknown[] | null | undefined): string {
  if (!Array.isArray(values)) {
    return "";
  }

  return values
    .map((value) => {
      if (typeof value === "string") {
        return value.trim();
      }

      if (value && typeof value === "object") {
        const candidate = value as Record<string, unknown>;

        for (const key of [
          "label",
          "text",
          "description",
          "value",
          "blocker",
          "evidence",
        ]) {
          const raw = candidate[key];
          if (typeof raw === "string" && raw.trim()) {
            return raw.trim();
          }
        }
      }

      return "";
    })
    .filter(Boolean)
    .join("\n");
}

function nowIso(): string {
  return new Date().toISOString();
}

export function ExecutionFeedbackForm({
  uiLanguage,
  existingExecution = null,
  hasSelectedLever = false,
  disabled = false,
  onSubmit,
}: ExecutionFeedbackFormProps) {
  const copy = COPY[uiLanguage];

  const [executionStatus, setExecutionStatus] =
    useState<ExecutionStatus>("in_progress");
  const [outcomeStatus, setOutcomeStatus] =
    useState<OutcomeStatus>("unknown");
  const [observedResult, setObservedResult] = useState("");
  const [workerReflection, setWorkerReflection] = useState("");
  const [blockersText, setBlockersText] = useState("");
  const [confidence, setConfidence] = useState(70);
  const [leverUsed, setLeverUsed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validationMessage, setValidationMessage] =
    useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function resetFreshAttemptForm() {
    setExecutionStatus("in_progress");
    setOutcomeStatus("unknown");
    setObservedResult("");
    setWorkerReflection("");
    setBlockersText("");
    setConfidence(70);
    setLeverUsed(false);
    setValidationMessage(null);
    setSubmitError(null);
  }

  useEffect(() => {
    if (!existingExecution) {
      resetFreshAttemptForm();
      return;
    }

    setExecutionStatus(existingExecution.execution_status);
    setOutcomeStatus(existingExecution.outcome_status);
    setObservedResult(existingExecution.observed_result ?? "");
    setWorkerReflection(existingExecution.worker_reflection ?? "");
    setBlockersText(blockersToText(existingExecution.blockers_json));
    setConfidence(
      typeof existingExecution.worker_confidence_after === "number"
        ? Math.round(
            Math.min(
              1,
              Math.max(0, existingExecution.worker_confidence_after),
            ) * 100,
          )
        : 70,
    );
    setLeverUsed(Boolean(existingExecution.lever_used));
    setValidationMessage(null);
    setSubmitError(null);
  }, [existingExecution]);

  const isTerminal = useMemo(
    () =>
      executionStatus === "completed" ||
      executionStatus === "blocked" ||
      executionStatus === "abandoned",
    [executionStatus],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (disabled || submitting) {
      return;
    }

    setValidationMessage(null);
    setSubmitError(null);

    const observed = cleanOptional(observedResult);

    if (
      executionStatus === "completed" &&
      outcomeStatus === "unknown"
    ) {
      setValidationMessage(copy.validationCompletedOutcome);
      return;
    }

    if (outcomeStatus !== "unknown" && !observed) {
      setValidationMessage(copy.validationObserved);
      return;
    }

    const timestamp = nowIso();

    const record: ExecutionResultRecord = {
      execution_status: executionStatus,
      outcome_status: outcomeStatus,
      observed_result: observed,
      worker_reflection: cleanOptional(workerReflection),
      blockers: blockersFromText(blockersText),
      worker_confidence_after: confidence / 100,
      lever_used: hasSelectedLever ? leverUsed : false,
      started_at:
        executionStatus === "not_started"
          ? null
          : existingExecution?.started_at ?? timestamp,
      completed_at:
        isTerminal
          ? existingExecution?.completed_at ?? timestamp
          : null,
    };

    setSubmitting(true);

    try {
      await onSubmit(record);

      if (!existingExecution) {
        resetFreshAttemptForm();
      }
    } catch {
      setSubmitError(copy.submitError);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      aria-label={copy.regionLabel}
      className="card stack"
      style={{
        gap: 18,
        borderRadius: 30,
        border: "1px solid rgba(43,33,24,0.08)",
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.97), rgba(249,252,255,0.95) 55%, rgba(240,251,248,0.88))",
        boxShadow: "0 20px 54px rgba(43,33,24,0.05)",
      }}
    >
      <div className="stack" style={{ gap: 8 }}>
        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
          <BadgePill icon={<ClockIcon size={14} />}>
            {copy.badge}
          </BadgePill>
        </div>

        <div
          style={{
            fontSize: 13,
            fontWeight: 850,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--coach-calm)",
          }}
        >
          {copy.eyebrow}
        </div>

        <strong
          style={{
            color: "var(--coach-ink)",
            fontSize: 20,
            lineHeight: 1.3,
          }}
        >
          {copy.title}
        </strong>

        <div
          className="muted"
          style={{
            color: "var(--coach-muted)",
            lineHeight: 1.65,
            fontSize: 14,
            maxWidth: 720,
          }}
        >
          {copy.description}
        </div>
      </div>

      <form
        className="stack"
        style={{ gap: 16 }}
        onSubmit={handleSubmit}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 14,
          }}
        >
          <label className="stack" style={{ gap: 7 }}>
            <span
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: "var(--coach-ink)",
              }}
            >
              {copy.statusLabel}
            </span>
            <select
              aria-label={copy.statusLabel}
              value={executionStatus}
              disabled={disabled || submitting}
              onChange={(event) => {
                const next = event.target.value as ExecutionStatus;
                setExecutionStatus(next);

                if (
                  next === "not_started" ||
                  next === "in_progress"
                ) {
                  setOutcomeStatus("unknown");
                }
              }}
              style={{
                minHeight: 44,
                borderRadius: 14,
                border: "1px solid rgba(43,33,24,0.12)",
                padding: "0 12px",
                background: "white",
              }}
            >
              {EXECUTION_STATUS_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {executionStatusLabel(value, uiLanguage)}
                </option>
              ))}
            </select>
          </label>

          <label className="stack" style={{ gap: 7 }}>
            <span
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: "var(--coach-ink)",
              }}
            >
              {copy.outcomeLabel}
            </span>
            <select
              aria-label={copy.outcomeLabel}
              value={outcomeStatus}
              disabled={
                disabled ||
                submitting ||
                executionStatus === "not_started" ||
                executionStatus === "in_progress"
              }
              onChange={(event) =>
                setOutcomeStatus(event.target.value as OutcomeStatus)
              }
              style={{
                minHeight: 44,
                borderRadius: 14,
                border: "1px solid rgba(43,33,24,0.12)",
                padding: "0 12px",
                background: "white",
              }}
            >
              {OUTCOME_STATUS_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {outcomeStatusLabel(value, uiLanguage)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="stack" style={{ gap: 7 }}>
          <span
            className="row"
            style={{
              gap: 7,
              alignItems: "center",
              fontSize: 13,
              fontWeight: 800,
              color: "var(--coach-ink)",
            }}
          >
            <TargetIcon size={15} />
            {copy.observedLabel}
          </span>
          <textarea
            aria-label={copy.observedLabel}
            value={observedResult}
            disabled={disabled || submitting}
            onChange={(event) => setObservedResult(event.target.value)}
            placeholder={copy.observedPlaceholder}
            rows={3}
            style={{
              resize: "vertical",
              borderRadius: 16,
              border: "1px solid rgba(43,33,24,0.12)",
              padding: 12,
              background: "white",
              lineHeight: 1.55,
            }}
          />
        </label>

        <label className="stack" style={{ gap: 7 }}>
          <span
            className="row"
            style={{
              gap: 7,
              alignItems: "center",
              fontSize: 13,
              fontWeight: 800,
              color: "var(--coach-ink)",
            }}
          >
            <SparkIcon size={15} />
            {copy.reflectionLabel}
          </span>
          <textarea
            aria-label={copy.reflectionLabel}
            value={workerReflection}
            disabled={disabled || submitting}
            onChange={(event) => setWorkerReflection(event.target.value)}
            placeholder={copy.reflectionPlaceholder}
            rows={3}
            style={{
              resize: "vertical",
              borderRadius: 16,
              border: "1px solid rgba(43,33,24,0.12)",
              padding: 12,
              background: "white",
              lineHeight: 1.55,
            }}
          />
        </label>

        <label className="stack" style={{ gap: 7 }}>
          <span
            style={{
              fontSize: 13,
              fontWeight: 800,
              color: "var(--coach-ink)",
            }}
          >
            {copy.blockersLabel}
          </span>
          <textarea
            aria-label={copy.blockersLabel}
            value={blockersText}
            disabled={disabled || submitting}
            onChange={(event) => setBlockersText(event.target.value)}
            placeholder={copy.blockersPlaceholder}
            rows={3}
            style={{
              resize: "vertical",
              borderRadius: 16,
              border: "1px solid rgba(43,33,24,0.12)",
              padding: 12,
              background: "white",
              lineHeight: 1.55,
            }}
          />
        </label>

        <label className="stack" style={{ gap: 8 }}>
          <span
            className="row space-between"
            style={{
              gap: 12,
              fontSize: 13,
              fontWeight: 800,
              color: "var(--coach-ink)",
            }}
          >
            <span>{copy.confidenceLabel}</span>
            <span>{confidence}%</span>
          </span>
          <input
            aria-label={copy.confidenceLabel}
            type="range"
            min={0}
            max={100}
            step={5}
            value={confidence}
            disabled={disabled || submitting}
            onChange={(event) =>
              setConfidence(Number(event.target.value))
            }
          />
        </label>

        {hasSelectedLever ? (
          <label
            className="row"
            style={{
              gap: 10,
              alignItems: "flex-start",
              padding: 12,
              borderRadius: 16,
              background: "rgba(255,255,255,0.7)",
              border: "1px solid rgba(43,33,24,0.07)",
            }}
          >
            <input
              aria-label={copy.leverUsedLabel}
              type="checkbox"
              checked={leverUsed}
              disabled={disabled || submitting}
              onChange={(event) => setLeverUsed(event.target.checked)}
              style={{ marginTop: 3 }}
            />
            <span
              style={{
                color: "var(--coach-muted)",
                fontSize: 13,
                lineHeight: 1.55,
              }}
            >
              {copy.leverUsedLabel}
            </span>
          </label>
        ) : null}

        {validationMessage ? (
          <div
            role="alert"
            style={{
              borderRadius: 14,
              padding: "10px 12px",
              background: "rgba(176, 79, 79, 0.08)",
              color: "var(--coach-ink)",
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            {validationMessage}
          </div>
        ) : null}

        {submitError ? (
          <div
            role="alert"
            style={{
              borderRadius: 14,
              padding: "10px 12px",
              background: "rgba(176, 79, 79, 0.08)",
              color: "var(--coach-ink)",
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            {submitError}
          </div>
        ) : null}

        <div className="row" style={{ justifyContent: "flex-end" }}>
          <button
            type="submit"
            className="button"
            disabled={disabled || submitting}
          >
            <CheckCircleIcon size={16} />
            {submitting
              ? existingExecution
                ? copy.updating
                : copy.submitting
              : existingExecution
                ? copy.updateSubmit
                : copy.submit}
          </button>
        </div>
      </form>
    </section>
  );
}