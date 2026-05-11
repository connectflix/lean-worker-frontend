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
  title: string;
} {
  switch (tone) {
    case "blue":
      return {
        border: "rgba(59,130,246,0.55)",
        background: "rgba(59,130,246,0.08)",
        title: "#1d4ed8",
      };
    case "purple":
      return {
        border: "rgba(168,85,247,0.55)",
        background: "rgba(168,85,247,0.08)",
        title: "#7e22ce",
      };
    case "orange":
      return {
        border: "rgba(249,115,22,0.55)",
        background: "rgba(249,115,22,0.08)",
        title: "#c2410c",
      };
    case "teal":
      return {
        border: "rgba(20,184,166,0.55)",
        background: "rgba(20,184,166,0.08)",
        title: "#0f766e",
      };
    case "rose":
      return {
        border: "rgba(244,63,94,0.55)",
        background: "rgba(244,63,94,0.08)",
        title: "#be123c",
      };
    case "amber":
      return {
        border: "rgba(245,158,11,0.55)",
        background: "rgba(245,158,11,0.1)",
        title: "#b45309",
      };
    case "indigo":
      return {
        border: "rgba(99,102,241,0.55)",
        background: "rgba(99,102,241,0.08)",
        title: "#4338ca",
      };
    case "green":
      return {
        border: "rgba(34,197,94,0.55)",
        background: "rgba(34,197,94,0.08)",
        title: "#15803d",
      };
    case "cyan":
      return {
        border: "rgba(6,182,212,0.55)",
        background: "rgba(6,182,212,0.08)",
        title: "#0e7490",
      };
    default:
      return {
        border: "rgba(59,130,246,0.55)",
        background: "rgba(59,130,246,0.08)",
        title: "#1d4ed8",
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

  return (
    <div className="stack" style={{ gap: 16 }}>
      <div
        className="card-soft"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(140px, 1fr))",
          gap: 12,
          alignItems: "stretch",
        }}
      >
        {dimensions.map((dimension) => {
          const tone = normalizeCanvasTone(dimension.tone);
          const toneStyles = getCanvasToneStyles(tone);

          return (
            <div
              key={dimension.key}
              className="stack"
              style={{
                gap: 8,
                border: `1px solid ${toneStyles.border}`,
                background: toneStyles.background,
                borderRadius: 14,
                padding: 12,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: toneStyles.title,
                }}
              >
                {dimension.label}
              </div>

              <div className="admin-metric-value" style={{ fontSize: 28 }}>
                {dimension.percentage}%
              </div>

              <div className="muted">score: {dimension.score}</div>

              <div
                style={{
                  width: "100%",
                  height: 8,
                  borderRadius: 999,
                  background: "rgba(15,23,42,0.08)",
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
          gap: 10,
          border: dominant
            ? "1px solid rgba(59,130,246,0.25)"
            : "1px solid var(--border)",
        }}
      >
        <div className="row" style={{ gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <div className="section-title" style={{ fontSize: 15 }}>
            Significance reading
          </div>

          {dominant ? <span className="badge">dominant: {dominant.label}</span> : null}
        </div>

        <div className="muted">{analysisSummary}</div>
      </div>

      <div className="stack" style={{ gap: 12 }}>
        {questions.map((question) => {
          const selectedValue = form.answers[question.id] || "unknown";
          const questionAnswers = question.answers;

          return (
            <div key={question.id} className="card-soft stack" style={{ gap: 10 }}>
              <div className="row" style={{ gap: 10, alignItems: "flex-start" }}>
                <span className="badge">Q{question.id}</span>
                <div style={{ fontWeight: 800, lineHeight: 1.45 }}>
                  {question.text}
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                  gap: 10,
                }}
              >
                {questionAnswers.map((answer) => {
                  const isSelected = selectedValue === answer.value;

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
  );
}