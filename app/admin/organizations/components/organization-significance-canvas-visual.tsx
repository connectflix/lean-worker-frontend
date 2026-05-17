"use client";

import type {
  AdminWorkerSignificanceAnswerValue,
  AdminWorkerSignificanceDimension,
  AdminWorkerSignificanceScoreMap,
} from "@/lib/types";

type CanvasTone =
  | "blue"
  | "purple"
  | "orange"
  | "teal"
  | "rose"
  | "amber"
  | "indigo"
  | "green"
  | "cyan";

type AdminWorkerSignificanceQuestionAnswer = {
  value: AdminWorkerSignificanceAnswerValue;
  label: string;
  scores: AdminWorkerSignificanceScoreMap;
};

export type NormalizedSignificanceQuestion = {
  id: number;
  key: string;
  order: number;
  text: string;
  answers: AdminWorkerSignificanceQuestionAnswer[];
  options: AdminWorkerSignificanceQuestionAnswer[];
};

type SignificanceFormState = {
  worker_id: string;
  answers: Record<number, AdminWorkerSignificanceAnswerValue>;
};

type SignificanceDimensionDisplay = AdminWorkerSignificanceDimension;

function normalizeCanvasTone(tone?: string | null): CanvasTone {
  if (
    tone === "blue" ||
    tone === "purple" ||
    tone === "orange" ||
    tone === "teal" ||
    tone === "rose" ||
    tone === "amber" ||
    tone === "indigo" ||
    tone === "green" ||
    tone === "cyan"
  ) {
    return tone;
  }

  return "blue";
}

function getCanvasToneStyles(tone: CanvasTone): {
  border: string;
  background: string;
  surface: string;
  title: string;
  softTitle: string;
} {
  switch (tone) {
    case "blue":
      return {
        border: "rgba(94,106,210,0.28)",
        background: "rgba(94,106,210,0.055)",
        surface: "rgba(94,106,210,0.035)",
        title: "#4f5bc4",
        softTitle: "rgba(79,91,196,0.82)",
      };
    case "purple":
      return {
        border: "rgba(126,87,194,0.25)",
        background: "rgba(126,87,194,0.055)",
        surface: "rgba(126,87,194,0.035)",
        title: "#6f47b8",
        softTitle: "rgba(111,71,184,0.82)",
      };
    case "orange":
      return {
        border: "rgba(217,119,6,0.24)",
        background: "rgba(217,119,6,0.055)",
        surface: "rgba(217,119,6,0.035)",
        title: "#b45309",
        softTitle: "rgba(180,83,9,0.82)",
      };
    case "teal":
      return {
        border: "rgba(13,148,136,0.24)",
        background: "rgba(13,148,136,0.055)",
        surface: "rgba(13,148,136,0.035)",
        title: "#0f766e",
        softTitle: "rgba(15,118,110,0.82)",
      };
    case "rose":
      return {
        border: "rgba(225,29,72,0.22)",
        background: "rgba(225,29,72,0.052)",
        surface: "rgba(225,29,72,0.032)",
        title: "#be123c",
        softTitle: "rgba(190,18,60,0.82)",
      };
    case "amber":
      return {
        border: "rgba(180,83,9,0.24)",
        background: "rgba(180,83,9,0.055)",
        surface: "rgba(180,83,9,0.035)",
        title: "#b45309",
        softTitle: "rgba(180,83,9,0.82)",
      };
    case "indigo":
      return {
        border: "rgba(79,70,229,0.24)",
        background: "rgba(79,70,229,0.055)",
        surface: "rgba(79,70,229,0.035)",
        title: "#4338ca",
        softTitle: "rgba(67,56,202,0.82)",
      };
    case "green":
      return {
        border: "rgba(21,128,61,0.24)",
        background: "rgba(21,128,61,0.055)",
        surface: "rgba(21,128,61,0.035)",
        title: "#15803d",
        softTitle: "rgba(21,128,61,0.82)",
      };
    case "cyan":
      return {
        border: "rgba(8,145,178,0.24)",
        background: "rgba(8,145,178,0.055)",
        surface: "rgba(8,145,178,0.035)",
        title: "#0e7490",
        softTitle: "rgba(14,116,144,0.82)",
      };
    default:
      return {
        border: "rgba(94,106,210,0.28)",
        background: "rgba(94,106,210,0.055)",
        surface: "rgba(94,106,210,0.035)",
        title: "#4f5bc4",
        softTitle: "rgba(79,91,196,0.82)",
      };
  }
}

function getDominantSignificanceDimension(
  dimensions: AdminWorkerSignificanceDimension[],
): AdminWorkerSignificanceDimension | null {
  if (dimensions.length === 0) return null;

  const sorted = [...dimensions].sort((left, right) => right.score - left.score);
  const top = sorted[0];

  if (!top || top.score <= 0) return null;

  return top;
}

function getAnsweredQuestionsCount(form: SignificanceFormState): number {
  return Object.values(form.answers).filter((value) => value && value !== "unknown").length;
}

function getAnswerLabel(value: AdminWorkerSignificanceAnswerValue): string {
  if (value === "yes") return "Oui";
  if (value === "no") return "Non";
  if (value === "maybe") return "Peut-être";
  return "Je ne sais pas";
}

function getAnswerTone(value: AdminWorkerSignificanceAnswerValue): CanvasTone {
  if (value === "yes") return "green";
  if (value === "no") return "rose";
  if (value === "maybe") return "amber";
  return "blue";
}

function getCompletionPercentage(answeredQuestions: number, totalQuestions: number): number {
  if (totalQuestions <= 0) return 0;
  return Math.round((answeredQuestions / totalQuestions) * 100);
}

type OrganizationSignificanceCanvasVisualProps = {
  form: SignificanceFormState;
  onChange: (
    questionId: number,
    value: AdminWorkerSignificanceAnswerValue,
  ) => void;
  questions: NormalizedSignificanceQuestion[];
  dimensions: SignificanceDimensionDisplay[];
  analysisSummary: string;
};

export function OrganizationSignificanceCanvasVisual({
  form,
  onChange,
  questions,
  dimensions,
  analysisSummary,
}: OrganizationSignificanceCanvasVisualProps) {
  const dominant = getDominantSignificanceDimension(dimensions);
  const answeredQuestions = getAnsweredQuestionsCount(form);
  const completionPercentage = getCompletionPercentage(answeredQuestions, questions.length);
  const topDimensions = [...dimensions]
    .filter((dimension) => Number(dimension.score || 0) > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 3);

  return (
    <div className="stack" style={{ gap: 16, minWidth: 0 }}>
      <div className="admin-kpi-scroll">
        <div
          className="admin-kpi-row"
          style={{
            gridTemplateColumns: "repeat(4, minmax(180px, 1fr))",
          }}
        >
          <SignificanceMetricCard
            label="Dominant dimension"
            value={dominant?.label ?? "—"}
            hint={
              dominant
                ? `${dominant.percentage}% of the current perception profile`
                : "No dominant dimension yet"
            }
            emphasis={dominant ? normalizeCanvasTone(dominant.tone) : "blue"}
          />

          <SignificanceMetricCard
            label="Completion"
            value={`${completionPercentage}%`}
            hint={`${answeredQuestions}/${questions.length} question(s) answered`}
            emphasis={completionPercentage >= 100 ? "green" : "blue"}
          />

          <SignificanceMetricCard
            label="Total score"
            value={String(
              dimensions.reduce((sum, dimension) => sum + Number(dimension.score || 0), 0),
            )}
            hint="Accumulated deterministic score"
            emphasis="purple"
          />

          <SignificanceMetricCard
            label="Profile spread"
            value={topDimensions.length > 0 ? String(topDimensions.length) : "—"}
            hint={
              topDimensions.length > 0
                ? topDimensions.map((dimension) => dimension.label).join(" · ")
                : "No scored dimension yet"
            }
            emphasis="teal"
          />
        </div>
      </div>

      <div
        className="card-soft"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(140px, 1fr))",
          gap: 12,
          alignItems: "stretch",
          background: "rgba(255,255,255,0.72)",
        }}
      >
        {dimensions.map((dimension) => {
          const tone = normalizeCanvasTone(dimension.tone);
          const toneStyles = getCanvasToneStyles(tone);
          const isDominant = dominant?.key === dimension.key;

          return (
            <div
              key={dimension.key}
              className="stack"
              style={{
                gap: 9,
                border: `1px solid ${isDominant ? toneStyles.title : toneStyles.border}`,
                background: isDominant ? toneStyles.background : "#ffffff",
                borderRadius: 18,
                padding: 14,
              }}
            >
              <div
                className="row space-between"
                style={{
                  gap: 8,
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 750,
                    letterSpacing: "-0.02em",
                    color: toneStyles.title,
                  }}
                >
                  {dimension.label}
                </div>

                {isDominant ? (
                  <span
                    className="badge primary"
                    style={{
                      fontSize: 11,
                      padding: "5px 8px",
                    }}
                  >
                    dominant
                  </span>
                ) : null}
              </div>

              <div
                className="admin-metric-value"
                style={{
                  fontSize: 28,
                  color: isDominant ? toneStyles.title : "var(--foreground)",
                }}
              >
                {dimension.percentage}%
              </div>

              <div className="muted" style={{ fontSize: 12 }}>
                score: {dimension.score}
              </div>

              <div
                style={{
                  width: "100%",
                  height: 8,
                  borderRadius: 999,
                  background: "rgba(17,24,39,0.08)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${Math.min(100, Math.max(0, dimension.percentage))}%`,
                    height: "100%",
                    borderRadius: 999,
                    background: toneStyles.title,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div
        className="card-soft stack"
        style={{
          gap: 12,
          background: "rgba(255,255,255,0.76)",
          border: dominant
            ? `1px solid ${getCanvasToneStyles(normalizeCanvasTone(dominant.tone)).border}`
            : "1px solid var(--admin-border)",
        }}
      >
        <div
          className="row space-between"
          style={{
            gap: 12,
            flexWrap: "wrap",
            alignItems: "flex-start",
          }}
        >
          <div className="stack" style={{ gap: 4 }}>
            <div className="section-title" style={{ fontSize: 15 }}>
              Significance reading
            </div>

            <div className="muted">
              Reading of how the worker currently perceives their work.
            </div>
          </div>

          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            {dominant ? (
              <span className="badge primary">dominant: {dominant.label}</span>
            ) : (
              <span className="badge">no dominant dimension</span>
            )}

            <span className={completionPercentage >= 100 ? "badge success" : "badge"}>
              {answeredQuestions}/{questions.length} answered
            </span>
          </div>
        </div>

        <div
          style={{
            border: "1px solid var(--admin-border)",
            borderRadius: 16,
            background: "#ffffff",
            padding: 14,
          }}
        >
          <div
            className="muted"
            style={{
              fontSize: 13,
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {analysisSummary ||
              "Aucune lecture n’est encore disponible. Répondez au questionnaire pour générer une première interprétation."}
          </div>
        </div>

        {topDimensions.length > 0 ? (
          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            <span className="muted" style={{ fontSize: 12 }}>
              Top dimensions:
            </span>

            {topDimensions.map((dimension) => (
              <span key={dimension.key} className="badge">
                {dimension.label} · {dimension.percentage}%
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div
        className="card-soft stack"
        style={{
          gap: 12,
          background: "rgba(255,255,255,0.72)",
        }}
      >
        <div
          className="row space-between"
          style={{
            gap: 12,
            flexWrap: "wrap",
            alignItems: "flex-start",
          }}
        >
          <div className="stack" style={{ gap: 4 }}>
            <div className="section-title" style={{ fontSize: 15 }}>
              Questionnaire
            </div>

            <div className="muted">
              Each response updates the deterministic score and the dominant perception profile.
            </div>
          </div>

          <span className={completionPercentage >= 100 ? "badge success" : "badge primary"}>
            {completionPercentage}% complete
          </span>
        </div>

        <div
          className="stack"
          style={{
            gap: 12,
            maxHeight: "min(760px, calc(100vh - 360px))",
            overflowY: "auto",
            overflowX: "hidden",
            paddingRight: 6,
          }}
        >
          {questions.map((question) => {
            const selectedValue = form.answers[question.id] || "unknown";
            const selectedToneStyles = getCanvasToneStyles(getAnswerTone(selectedValue));
            const questionAnswers = question.answers;

            return (
              <div
                key={question.id}
                className="card-soft stack"
                style={{
                  gap: 12,
                  background: "#ffffff",
                  border:
                    selectedValue !== "unknown"
                      ? `1px solid ${selectedToneStyles.border}`
                      : "1px solid var(--admin-border)",
                }}
              >
                <div
                  className="row"
                  style={{
                    gap: 10,
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    className={selectedValue !== "unknown" ? "badge primary" : "badge"}
                    style={{ flexShrink: 0 }}
                  >
                    Q{question.id}
                  </span>

                  <div className="stack" style={{ gap: 5 }}>
                    <div
                      style={{
                        fontWeight: 750,
                        lineHeight: 1.45,
                        letterSpacing: "-0.015em",
                      }}
                    >
                      {question.text}
                    </div>

                    <div className="muted" style={{ fontSize: 12 }}>
                      Current answer: {getAnswerLabel(selectedValue)}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
                    gap: 10,
                  }}
                >
                  {questionAnswers.map((answer) => {
                    const isSelected = selectedValue === answer.value;
                    const answerToneStyles = getCanvasToneStyles(getAnswerTone(answer.value));

                    return (
                      <button
                        key={`${question.id}-${answer.value}`}
                        type="button"
                        onClick={() => onChange(question.id, answer.value)}
                        className={isSelected ? "button" : "button ghost"}
                        style={{
                          justifyContent: "flex-start",
                          textAlign: "left",
                          whiteSpace: "normal",
                          minHeight: 44,
                          borderRadius: 14,
                          background: isSelected ? answerToneStyles.title : "#ffffff",
                          borderColor: isSelected
                            ? answerToneStyles.title
                            : "var(--admin-border)",
                          color: isSelected ? "#ffffff" : "var(--foreground)",
                        }}
                      >
                        {answer.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SignificanceMetricCard({
  label,
  value,
  hint,
  emphasis,
}: {
  label: string;
  value: string;
  hint: string;
  emphasis: CanvasTone;
}) {
  const toneStyles = getCanvasToneStyles(emphasis);

  return (
    <div
      className="card-soft stack admin-kpi-card"
      style={{
        gap: 6,
        background: toneStyles.background,
        borderColor: toneStyles.border,
      }}
    >
      <div className="muted">{label}</div>

      <div
        className="admin-metric-value"
        style={{
          fontSize: 26,
          color: toneStyles.title,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
        title={value}
      >
        {value}
      </div>

      <div
        className="muted"
        style={{
          fontSize: 12,
          lineHeight: 1.4,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
        title={hint}
      >
        {hint}
      </div>
    </div>
  );
}