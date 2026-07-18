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
  noteBackground: string;
  noteBorder: string;
} {
  switch (tone) {
    case "blue":
      return {
        border: "rgba(94,106,210,0.28)",
        background: "rgba(94,106,210,0.055)",
        surface: "rgba(94,106,210,0.035)",
        title: "#4f5bc4",
        softTitle: "rgba(79,91,196,0.82)",
        noteBackground: "rgba(94,106,210,0.10)",
        noteBorder: "rgba(94,106,210,0.22)",
      };
    case "purple":
      return {
        border: "rgba(126,87,194,0.25)",
        background: "rgba(126,87,194,0.055)",
        surface: "rgba(126,87,194,0.035)",
        title: "#6f47b8",
        softTitle: "rgba(111,71,184,0.82)",
        noteBackground: "rgba(126,87,194,0.10)",
        noteBorder: "rgba(126,87,194,0.22)",
      };
    case "orange":
      return {
        border: "rgba(217,119,6,0.24)",
        background: "rgba(217,119,6,0.055)",
        surface: "rgba(217,119,6,0.035)",
        title: "#b45309",
        softTitle: "rgba(180,83,9,0.82)",
        noteBackground: "rgba(217,119,6,0.10)",
        noteBorder: "rgba(217,119,6,0.22)",
      };
    case "teal":
      return {
        border: "rgba(13,148,136,0.24)",
        background: "rgba(13,148,136,0.055)",
        surface: "rgba(13,148,136,0.035)",
        title: "#0f766e",
        softTitle: "rgba(15,118,110,0.82)",
        noteBackground: "rgba(13,148,136,0.10)",
        noteBorder: "rgba(13,148,136,0.22)",
      };
    case "rose":
      return {
        border: "rgba(225,29,72,0.22)",
        background: "rgba(225,29,72,0.052)",
        surface: "rgba(225,29,72,0.032)",
        title: "#be123c",
        softTitle: "rgba(190,18,60,0.82)",
        noteBackground: "rgba(225,29,72,0.10)",
        noteBorder: "rgba(225,29,72,0.22)",
      };
    case "amber":
      return {
        border: "rgba(180,83,9,0.24)",
        background: "rgba(180,83,9,0.055)",
        surface: "rgba(180,83,9,0.035)",
        title: "#b45309",
        softTitle: "rgba(180,83,9,0.82)",
        noteBackground: "rgba(180,83,9,0.10)",
        noteBorder: "rgba(180,83,9,0.22)",
      };
    case "indigo":
      return {
        border: "rgba(79,70,229,0.24)",
        background: "rgba(79,70,229,0.055)",
        surface: "rgba(79,70,229,0.035)",
        title: "#4338ca",
        softTitle: "rgba(67,56,202,0.82)",
        noteBackground: "rgba(79,70,229,0.10)",
        noteBorder: "rgba(79,70,229,0.22)",
      };
    case "green":
      return {
        border: "rgba(21,128,61,0.24)",
        background: "rgba(21,128,61,0.055)",
        surface: "rgba(21,128,61,0.035)",
        title: "#15803d",
        softTitle: "rgba(21,128,61,0.82)",
        noteBackground: "rgba(21,128,61,0.10)",
        noteBorder: "rgba(21,128,61,0.22)",
      };
    case "cyan":
      return {
        border: "rgba(8,145,178,0.24)",
        background: "rgba(8,145,178,0.055)",
        surface: "rgba(8,145,178,0.035)",
        title: "#0e7490",
        softTitle: "rgba(14,116,144,0.82)",
        noteBackground: "rgba(8,145,178,0.10)",
        noteBorder: "rgba(8,145,178,0.22)",
      };
    default:
      return {
        border: "rgba(94,106,210,0.28)",
        background: "rgba(94,106,210,0.055)",
        surface: "rgba(94,106,210,0.035)",
        title: "#4f5bc4",
        softTitle: "rgba(79,91,196,0.82)",
        noteBackground: "rgba(94,106,210,0.10)",
        noteBorder: "rgba(94,106,210,0.22)",
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

function normalizeSummaryText(value: string): string {
  return (value || "").replace(/\r\n/g, "\n").trim();
}

function buildSummaryNotes(value: string): string[] {
  const normalized = normalizeSummaryText(value);

  if (!normalized) {
    return [];
  }

  const byLines = normalized
    .split(/\n+/)
    .map((item) =>
      item
        .trim()
        .replace(/^[•\-\–\—\*\d\.\)\(]+\s*/g, "")
        .trim(),
    )
    .filter(Boolean);

  if (byLines.length > 1) {
    return byLines;
  }

  const bySentences = normalized
    .split(/(?<=[\.\!\?\;\:])\s+/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (bySentences.length > 1) {
    return bySentences;
  }

  return [normalized];
}

function getCompactNoteStyle(entryCount: number): {
  fontSize: number;
  lineHeight: number;
  padding: string;
  gap: number;
  borderRadius: number;
} {
  if (entryCount >= 10) {
    return {
      fontSize: 6.2,
      lineHeight: 1.1,
      padding: "2.5px 4px",
      gap: 2,
      borderRadius: 6,
    };
  }

  if (entryCount >= 6) {
    return {
      fontSize: 6.8,
      lineHeight: 1.12,
      padding: "3px 4px",
      gap: 2.5,
      borderRadius: 7,
    };
  }

  return {
    fontSize: 7.6,
    lineHeight: 1.16,
    padding: "4px 5px",
    gap: 3,
    borderRadius: 8,
  };
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
  printMode?: boolean;
};

export function OrganizationSignificanceCanvasVisual({
  form,
  onChange,
  questions,
  dimensions,
  analysisSummary,
  printMode = false,
}: OrganizationSignificanceCanvasVisualProps) {
  const dominant = getDominantSignificanceDimension(dimensions);
  const answeredQuestions = getAnsweredQuestionsCount(form);
  const completionPercentage = getCompletionPercentage(answeredQuestions, questions.length);
  const totalScore = dimensions.reduce((sum, dimension) => sum + Number(dimension.score || 0), 0);
  const topDimensions = [...dimensions]
    .filter((dimension) => Number(dimension.score || 0) > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 3);

  if (printMode) {
    return (
      <SignificancePrintCanvas
        form={form}
        questions={questions}
        dimensions={dimensions}
        analysisSummary={analysisSummary}
        dominant={dominant}
        answeredQuestions={answeredQuestions}
        completionPercentage={completionPercentage}
        totalScore={totalScore}
        topDimensions={topDimensions}
      />
    );
  }

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
            value={String(totalScore)}
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
        {dimensions.map((dimension) => (
          <SignificanceDimensionCard
            key={dimension.key}
            dimension={dimension}
            isDominant={dominant?.key === dimension.key}
          />
        ))}
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

function SignificancePrintCanvas({
  form,
  questions,
  dimensions,
  analysisSummary,
  dominant,
  answeredQuestions,
  completionPercentage,
  totalScore,
  topDimensions,
}: {
  form: SignificanceFormState;
  questions: NormalizedSignificanceQuestion[];
  dimensions: SignificanceDimensionDisplay[];
  analysisSummary: string;
  dominant: AdminWorkerSignificanceDimension | null;
  answeredQuestions: number;
  completionPercentage: number;
  totalScore: number;
  topDimensions: SignificanceDimensionDisplay[];
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        maxHeight: "100%",
        display: "grid",
        gridTemplateRows: "auto auto 1fr",
        gap: 8,
        overflow: "hidden",
        breakInside: "avoid-page",
        pageBreakInside: "avoid",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 8,
        }}
      >
        <PrintSummaryCard
          label="Dominant dimension"
          value={dominant?.label ?? "—"}
          hint={dominant ? `${dominant.percentage}% profile` : "No dominant profile"}
          tone={dominant ? normalizeCanvasTone(dominant.tone) : "blue"}
        />

        <PrintSummaryCard
          label="Completion"
          value={`${completionPercentage}%`}
          hint={`${answeredQuestions}/${questions.length} answered`}
          tone={completionPercentage >= 100 ? "green" : "blue"}
        />

        <PrintSummaryCard
          label="Total score"
          value={String(totalScore)}
          hint="Deterministic score"
          tone="purple"
        />

        <PrintSummaryCard
          label="Profile spread"
          value={topDimensions.length > 0 ? String(topDimensions.length) : "—"}
          hint={
            topDimensions.length > 0
              ? topDimensions.map((dimension) => dimension.label).join(" · ")
              : "No scored dimension"
          }
          tone="teal"
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.12fr 0.88fr",
          gap: 8,
          minHeight: 0,
        }}
      >
        <div
          style={{
            border: "1px solid rgba(17,24,39,0.10)",
            borderRadius: 14,
            background: "rgba(255,255,255,0.94)",
            padding: 8,
            minHeight: 0,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              fontSize: 10.5,
              fontWeight: 850,
              letterSpacing: "-0.03em",
              color: "#0f172a",
              marginBottom: 5,
            }}
          >
            Significance reading
          </div>

          <HighlightedNotes
            entries={
              buildSummaryNotes(
                analysisSummary ||
                  "Aucune lecture n’est encore disponible. Répondez au questionnaire pour générer une première interprétation.",
              )
            }
            tone={dominant ? normalizeCanvasTone(dominant.tone) : "blue"}
            compact
            emptyLabel="Aucune lecture disponible"
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 8,
            minHeight: 0,
            overflow: "hidden",
          }}
        >
          {dimensions.map((dimension) => (
            <PrintDimensionCard
              key={dimension.key}
              dimension={dimension}
              isDominant={dominant?.key === dimension.key}
            />
          ))}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 6,
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        {questions.slice(0, 10).map((question) => {
          const selectedValue = form.answers[question.id] || "unknown";
          const tone = getAnswerTone(selectedValue);
          const toneStyles = getCanvasToneStyles(tone);

          return (
            <div
              key={question.id}
              style={{
                border: `1px solid ${toneStyles.noteBorder}`,
                borderRadius: 10,
                background: selectedValue !== "unknown" ? toneStyles.noteBackground : "#ffffff",
                padding: 6,
                minHeight: 0,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    flexShrink: 0,
                    borderRadius: 999,
                    background: toneStyles.title,
                    color: "#ffffff",
                    fontSize: 6.5,
                    lineHeight: 1,
                    fontWeight: 850,
                    padding: "4px 5px",
                  }}
                >
                  Q{question.id}
                </div>

                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontSize: 7.2,
                      lineHeight: 1.16,
                      fontWeight: 750,
                      color: "#0f172a",
                      marginBottom: 4,
                    }}
                  >
                    {question.text}
                  </div>

                  <div
                    style={{
                      display: "inline-flex",
                      maxWidth: "100%",
                      borderRadius: 999,
                      border: `1px solid ${toneStyles.border}`,
                      background: "#ffffff",
                      color: toneStyles.title,
                      fontSize: 6.6,
                      lineHeight: 1,
                      fontWeight: 850,
                      padding: "4px 6px",
                    }}
                  >
                    {getAnswerLabel(selectedValue)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SignificanceDimensionCard({
  dimension,
  isDominant,
}: {
  dimension: SignificanceDimensionDisplay;
  isDominant: boolean;
}) {
  const tone = normalizeCanvasTone(dimension.tone);
  const toneStyles = getCanvasToneStyles(tone);

  return (
    <div
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

      <DimensionProgressBar percentage={dimension.percentage} tone={tone} />
    </div>
  );
}

function PrintDimensionCard({
  dimension,
  isDominant,
}: {
  dimension: SignificanceDimensionDisplay;
  isDominant: boolean;
}) {
  const tone = normalizeCanvasTone(dimension.tone);
  const toneStyles = getCanvasToneStyles(tone);

  return (
    <div
      style={{
        border: `1px solid ${isDominant ? toneStyles.title : toneStyles.border}`,
        background: isDominant ? toneStyles.background : "#ffffff",
        borderRadius: 12,
        padding: 7,
        minHeight: 0,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 6,
          alignItems: "flex-start",
          marginBottom: 4,
        }}
      >
        <div
          style={{
            fontSize: 8,
            lineHeight: 1.1,
            fontWeight: 850,
            color: toneStyles.title,
            letterSpacing: "-0.02em",
          }}
        >
          {dimension.label}
        </div>

        {isDominant ? (
          <div
            style={{
              borderRadius: 999,
              background: toneStyles.title,
              color: "#ffffff",
              fontSize: 5.8,
              lineHeight: 1,
              fontWeight: 850,
              padding: "3px 5px",
              whiteSpace: "nowrap",
            }}
          >
            dominant
          </div>
        ) : null}
      </div>

      <div
        style={{
          fontSize: 18,
          lineHeight: 1,
          fontWeight: 900,
          color: toneStyles.title,
          marginBottom: 3,
        }}
      >
        {dimension.percentage}%
      </div>

      <div
        style={{
          fontSize: 6.5,
          lineHeight: 1.15,
          color: "#64748b",
          marginBottom: 5,
        }}
      >
        score: {dimension.score}
      </div>

      <DimensionProgressBar percentage={dimension.percentage} tone={tone} compact />
    </div>
  );
}

function PrintSummaryCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  tone: CanvasTone;
}) {
  const toneStyles = getCanvasToneStyles(tone);

  return (
    <div
      style={{
        border: `1px solid ${toneStyles.border}`,
        background: toneStyles.background,
        borderRadius: 12,
        padding: 8,
        minWidth: 0,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          fontSize: 6.8,
          lineHeight: 1.1,
          fontWeight: 850,
          color: toneStyles.softTitle,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          marginBottom: 4,
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: 14,
          lineHeight: 1,
          fontWeight: 900,
          color: toneStyles.title,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          marginBottom: 4,
        }}
        title={value}
      >
        {value}
      </div>

      <div
        style={{
          fontSize: 6.7,
          lineHeight: 1.15,
          color: "#64748b",
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

function DimensionProgressBar({
  percentage,
  tone,
  compact = false,
}: {
  percentage: number;
  tone: CanvasTone;
  compact?: boolean;
}) {
  const toneStyles = getCanvasToneStyles(tone);

  return (
    <div
      style={{
        width: "100%",
        height: compact ? 5 : 8,
        borderRadius: 999,
        background: "rgba(17,24,39,0.08)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${Math.min(100, Math.max(0, percentage))}%`,
          height: "100%",
          borderRadius: 999,
          background: toneStyles.title,
        }}
      />
    </div>
  );
}

function HighlightedNotes({
  entries,
  tone,
  compact = false,
  emptyLabel,
}: {
  entries: string[];
  tone: CanvasTone;
  compact?: boolean;
  emptyLabel: string;
}) {
  const toneStyles = getCanvasToneStyles(tone);
  const noteStyle = getCompactNoteStyle(entries.length);

  if (!entries.length) {
    return (
      <div
        style={{
          borderRadius: compact ? noteStyle.borderRadius : 12,
          border: `1px dashed ${toneStyles.noteBorder}`,
          background: "rgba(248,250,252,0.9)",
          color: "rgba(100,116,139,0.9)",
          fontSize: compact ? noteStyle.fontSize : 12.5,
          lineHeight: compact ? noteStyle.lineHeight : 1.45,
          padding: compact ? noteStyle.padding : "9px 10px",
          fontStyle: "italic",
          overflow: "hidden",
        }}
      >
        {emptyLabel}
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: compact ? noteStyle.gap : 7,
        alignItems: "stretch",
        overflow: "hidden",
      }}
    >
      {entries.map((entry, index) => (
        <div
          key={`${entry}-${index}`}
          style={{
            borderRadius: compact ? noteStyle.borderRadius : 12,
            border: `1px solid ${toneStyles.noteBorder}`,
            background: toneStyles.noteBackground,
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.45)",
            padding: compact ? noteStyle.padding : "9px 10px",
            fontSize: compact ? noteStyle.fontSize : 12.5,
            lineHeight: compact ? noteStyle.lineHeight : 1.45,
            color: "rgba(15,23,42,0.90)",
            wordBreak: "break-word",
            overflow: "hidden",
          }}
        >
          {entry}
        </div>
      ))}
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