"use client";

import type {
  ExecutionFollowUpResponse,
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

type ExecutionFollowUpCardProps = {
  followUp: ExecutionFollowUpResponse | null | undefined;
  uiLanguage: SupportedUiLanguage;
};

function cleanText(value: string | null | undefined): string | null {
  const normalized = (value || "").trim();
  return normalized || null;
}

function percentLabel(
  value: number | null | undefined,
  uiLanguage: SupportedUiLanguage,
): string | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  const bounded = Math.min(1, Math.max(0, value));
  const percentage = Math.round(bounded * 100);

  return uiLanguage === "fr"
    ? `Confiance après action ${percentage} %`
    : `Confidence after action ${percentage}%`;
}

function executionStatusLabel(
  value: ExecutionStatus,
  uiLanguage: SupportedUiLanguage,
): string {
  const labels: Record<ExecutionStatus, { fr: string; en: string }> = {
    not_started: {
      fr: "Non démarrée",
      en: "Not started",
    },
    in_progress: {
      fr: "En cours",
      en: "In progress",
    },
    completed: {
      fr: "Terminée",
      en: "Completed",
    },
    blocked: {
      fr: "Bloquée",
      en: "Blocked",
    },
    abandoned: {
      fr: "Abandonnée",
      en: "Abandoned",
    },
  };

  return labels[value]?.[uiLanguage] ?? value.replaceAll("_", " ");
}

function outcomeStatusLabel(
  value: OutcomeStatus,
  uiLanguage: SupportedUiLanguage,
): string {
  const labels: Record<OutcomeStatus, { fr: string; en: string }> = {
    unknown: {
      fr: "Résultat à confirmer",
      en: "Outcome to confirm",
    },
    achieved: {
      fr: "Résultat atteint",
      en: "Outcome achieved",
    },
    partially_achieved: {
      fr: "Résultat partiellement atteint",
      en: "Outcome partially achieved",
    },
    not_achieved: {
      fr: "Résultat non atteint",
      en: "Outcome not achieved",
    },
  };

  return labels[value]?.[uiLanguage] ?? value.replaceAll("_", " ");
}

function normalizeEvidence(values: unknown[]): string[] {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .map((value) => {
      if (typeof value === "string") {
        return cleanText(value);
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

      return null;
    })
    .filter((value): value is string => Boolean(value));
}

function latestExecution(
  executions: ExecutionResultResponse[],
): ExecutionResultResponse | null {
  if (!Array.isArray(executions) || executions.length === 0) {
    return null;
  }

  return [...executions].sort((left, right) => {
    if (right.attempt_number !== left.attempt_number) {
      return right.attempt_number - left.attempt_number;
    }

    return right.id - left.id;
  })[0] ?? null;
}

function formatDate(
  value: string | null | undefined,
  uiLanguage: SupportedUiLanguage,
): string | null {
  const normalized = cleanText(value);
  if (!normalized) return null;

  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat(
    uiLanguage === "fr" ? "fr-FR" : "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(parsed);
}

export function ExecutionFollowUpCard({
  followUp,
  uiLanguage,
}: ExecutionFollowUpCardProps) {
  if (!followUp) {
    return null;
  }

  const execution = latestExecution(followUp.execution_results);

  if (!execution) {
    return (
      <section
        aria-label={
          uiLanguage === "fr"
            ? "Suivi d’exécution"
            : "Execution follow-up"
        }
        className="card stack"
        style={{
          gap: 12,
          borderRadius: 28,
          border: "1px solid rgba(43,33,24,0.08)",
          background: "rgba(255,255,255,0.92)",
        }}
      >
        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
          <BadgePill icon={<ClockIcon size={14} />}>
            {uiLanguage === "fr"
              ? "Suivi d’exécution"
              : "Execution follow-up"}
          </BadgePill>
        </div>

        <strong style={{ color: "var(--coach-ink)" }}>
          {uiLanguage === "fr"
            ? "Aucun retour d’exécution enregistré pour le moment"
            : "No execution feedback recorded yet"}
        </strong>

        <div
          className="muted"
          style={{
            color: "var(--coach-muted)",
            lineHeight: 1.65,
            fontSize: 14,
          }}
        >
          {uiLanguage === "fr"
            ? "Le suivi apparaîtra ici dès qu’une tentative d’exécution de cette action aura été enregistrée."
            : "Follow-up will appear here once an execution attempt for this action has been recorded."}
        </div>
      </section>
    );
  }

  const observedResult = cleanText(execution.observed_result);
  const workerReflection = cleanText(execution.worker_reflection);
  const blockers = normalizeEvidence(execution.blockers_json).slice(0, 3);
  const confidence = percentLabel(
    execution.worker_confidence_after,
    uiLanguage,
  );
  const completedDate = formatDate(
    execution.completed_at ?? execution.recorded_at,
    uiLanguage,
  );
  const attemptCount = followUp.execution_results.length;

  return (
    <section
      aria-label={
        uiLanguage === "fr"
          ? "Suivi d’exécution"
          : "Execution follow-up"
      }
      className="card stack"
      style={{
        gap: 18,
        position: "relative",
        overflow: "hidden",
        borderRadius: 30,
        border: "1px solid rgba(43,33,24,0.08)",
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.96), rgba(245,250,255,0.94) 55%, rgba(237,251,249,0.84))",
        boxShadow: "0 20px 54px rgba(43,33,24,0.05)",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          right: -95,
          bottom: -110,
          width: 245,
          height: 245,
          borderRadius: 999,
          background: "rgba(88,180,174,0.08)",
          pointerEvents: "none",
        }}
      />

      <div
        className="stack"
        style={{
          gap: 16,
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          className="row space-between"
          style={{
            gap: 14,
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          <div className="stack" style={{ gap: 8 }}>
            <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
              <BadgePill icon={<ClockIcon size={14} />}>
                {uiLanguage === "fr"
                  ? "Suivi d’exécution"
                  : "Execution follow-up"}
              </BadgePill>

              <BadgePill icon={<TargetIcon size={14} />}>
                {executionStatusLabel(
                  execution.execution_status,
                  uiLanguage,
                )}
              </BadgePill>

              <BadgePill icon={<CheckCircleIcon size={14} />}>
                {outcomeStatusLabel(
                  execution.outcome_status,
                  uiLanguage,
                )}
              </BadgePill>

              {confidence ? (
                <BadgePill icon={<SparkIcon size={14} />}>
                  {confidence}
                </BadgePill>
              ) : null}
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
              {uiLanguage === "fr"
                ? "Ce qui s’est réellement passé"
                : "What actually happened"}
            </div>
          </div>

          <div
            className="muted"
            style={{
              color: "var(--coach-muted)",
              fontSize: 13,
              textAlign: "right",
            }}
          >
            <div>
              {uiLanguage === "fr"
                ? `Tentative ${execution.attempt_number} sur ${attemptCount}`
                : `Attempt ${execution.attempt_number} of ${attemptCount}`}
            </div>
            {completedDate ? <div>{completedDate}</div> : null}
          </div>
        </div>

        {observedResult ? (
          <div
            className="card-soft stack"
            style={{
              gap: 7,
              borderRadius: 20,
              background: "rgba(255,255,255,0.72)",
              border: "1px solid rgba(43,33,24,0.07)",
            }}
          >
            <strong style={{ color: "var(--coach-ink)" }}>
              {uiLanguage === "fr"
                ? "Résultat observé"
                : "Observed result"}
            </strong>
            <div
              className="muted"
              style={{
                color: "var(--coach-muted)",
                lineHeight: 1.65,
                fontSize: 14,
              }}
            >
              {observedResult}
            </div>
          </div>
        ) : null}

        {workerReflection ? (
          <div
            className="card-soft stack"
            style={{
              gap: 7,
              borderRadius: 20,
              background: "rgba(255,255,255,0.66)",
              border: "1px solid rgba(43,33,24,0.07)",
            }}
          >
            <strong style={{ color: "var(--coach-ink)" }}>
              {uiLanguage === "fr"
                ? "Ton retour"
                : "Your reflection"}
            </strong>
            <div
              className="muted"
              style={{
                color: "var(--coach-muted)",
                lineHeight: 1.65,
                fontSize: 14,
              }}
            >
              {workerReflection}
            </div>
          </div>
        ) : null}

        {blockers.length > 0 ? (
          <div className="stack" style={{ gap: 9 }}>
            <strong style={{ color: "var(--coach-ink)" }}>
              {uiLanguage === "fr"
                ? "Blocages rencontrés"
                : "Blockers encountered"}
            </strong>

            <div className="stack" style={{ gap: 8 }}>
              {blockers.map((blocker, index) => (
                <div
                  key={`${index}-${blocker}`}
                  className="row"
                  style={{
                    gap: 9,
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: 999,
                      marginTop: 8,
                      flex: "0 0 auto",
                      background: "var(--coach-accent)",
                    }}
                  />
                  <div
                    className="muted"
                    style={{
                      color: "var(--coach-muted)",
                      lineHeight: 1.6,
                      fontSize: 13,
                    }}
                  >
                    {blocker}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {execution.lever_used ? (
          <div
            className="muted"
            style={{
              color: "var(--coach-muted)",
              fontSize: 13,
              lineHeight: 1.6,
            }}
          >
            {uiLanguage === "fr"
              ? "Le levier sélectionné a été utilisé pendant cette tentative."
              : "The selected lever was used during this attempt."}
          </div>
        ) : null}
      </div>
    </section>
  );
}