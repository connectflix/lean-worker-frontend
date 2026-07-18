"use client";

import { CoherenceBadge } from "./canvas-status-pills";

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

type TimeNodeKey =
  | "available_time_text"
  | "time_constraints_text"
  | "time_energy_text"
  | "time_rituals_text"
  | "time_priorities_text"
  | "time_risks_text";

type TimeFormState = {
  worker_id: string;
  available_time_text: string;
  time_constraints_text: string;
  time_energy_text: string;
  time_rituals_text: string;
  time_priorities_text: string;
  time_risks_text: string;
};

const TIME_NODES: Array<{
  key: TimeNodeKey;
  label: string;
  subtitle: string;
  placeholder: string;
  tone: CanvasTone;
  metricLabel: string;
}> = [
  {
    key: "available_time_text",
    label: "Temps disponible",
    subtitle: "Temps réellement disponible pour exécuter les actions",
    placeholder: "Ex: 3 créneaux de 45 minutes par semaine, plutôt le matin...",
    tone: "blue",
    metricLabel: "Disponibilité",
  },
  {
    key: "time_constraints_text",
    label: "Contraintes de temps",
    subtitle: "Contraintes horaires, charge, obligations et limites",
    placeholder: "Ex: réunions longues, enfants le soir, fatigue après 18h...",
    tone: "rose",
    metricLabel: "Contraintes",
  },
  {
    key: "time_energy_text",
    label: "Rythme d’énergie",
    subtitle: "Moments d’énergie haute/basse et rythme naturel",
    placeholder: "Ex: énergie forte le matin, baisse après déjeuner...",
    tone: "amber",
    metricLabel: "Énergie",
  },
  {
    key: "time_rituals_text",
    label: "Rituels d’exécution",
    subtitle: "Rituels, habitudes et routines d’exécution",
    placeholder: "Ex: revue du lundi, bloc focus mercredi, bilan vendredi...",
    tone: "teal",
    metricLabel: "Rituels",
  },
  {
    key: "time_priorities_text",
    label: "Priorités",
    subtitle: "Priorités temporelles et arbitrages importants",
    placeholder: "Ex: privilégier la progression carrière avant les tâches secondaires...",
    tone: "purple",
    metricLabel: "Priorités",
  },
  {
    key: "time_risks_text",
    label: "Risques",
    subtitle: "Risques de décrochage, surcharge ou non-exécution",
    placeholder: "Ex: procrastination, imprévus, fatigue, manque de clarté...",
    tone: "orange",
    metricLabel: "Risques",
  },
];

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

function getTimeCanvasCompletedNodes(form: TimeFormState): number {
  return TIME_NODES.reduce((count, node) => {
    const value = form[node.key] || "";
    return value.trim() ? count + 1 : count;
  }, 0);
}

function getReadinessEmphasis(
  readinessScore: number,
): "primary" | "success" | "warning" | "danger" | "neutral" {
  if (readinessScore >= 80) return "success";
  if (readinessScore >= 50) return "warning";
  if (readinessScore > 0) return "danger";
  return "neutral";
}

function getFilledNodeLabels(form: TimeFormState): string[] {
  return TIME_NODES.filter((node) => form[node.key].trim()).map((node) => node.metricLabel);
}

function getEmptyNodeLabels(form: TimeFormState): string[] {
  return TIME_NODES.filter((node) => !form[node.key].trim()).map((node) => node.metricLabel);
}

function normalizeText(value: string): string {
  return (value || "").replace(/\r\n/g, "\n").trim();
}

function buildTextNotes(value: string): string[] {
  const normalized = normalizeText(value);

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

function buildEditableNotes(value: string): string[] {
  const normalized = (value || "").replace(/\r\n/g, "\n");

  if (!normalized.length) {
    return [""];
  }

  return normalized.split("\n");
}

function serializeEditableNotes(notes: string[]): string {
  return notes.join("\n");
}

function getCompactNoteStyle(entryCount: number): {
  fontSize: number;
  lineHeight: number;
  padding: string;
  gap: number;
  borderRadius: number;
} {
  if (entryCount >= 12) {
    return {
      fontSize: 5.8,
      lineHeight: 1.08,
      padding: "2px 4px",
      gap: 2,
      borderRadius: 6,
    };
  }

  if (entryCount >= 8) {
    return {
      fontSize: 6.4,
      lineHeight: 1.1,
      padding: "2.5px 4px",
      gap: 2,
      borderRadius: 6,
    };
  }

  if (entryCount >= 5) {
    return {
      fontSize: 7,
      lineHeight: 1.12,
      padding: "3px 4px",
      gap: 2.5,
      borderRadius: 7,
    };
  }

  return {
    fontSize: 7.8,
    lineHeight: 1.16,
    padding: "4px 5px",
    gap: 3,
    borderRadius: 8,
  };
}

function CanvasTextBlock({
  title,
  subtitle,
  value,
  onChange,
  tone,
  placeholder,
  disabled = false,
  printMode = false,
}: {
  title: string;
  subtitle: string;
  value: string;
  onChange: (value: string) => void;
  tone: CanvasTone;
  placeholder?: string;
  disabled?: boolean;
  printMode?: boolean;
}) {
  const toneStyles = getCanvasToneStyles(tone);
  const isFilled = Boolean(value.trim());

  return (
    <div
      style={{
        border: `1px solid ${isFilled ? toneStyles.border : "var(--admin-border)"}`,
        background: isFilled ? "rgba(255,255,255,0.96)" : "rgba(255,255,255,0.74)",
        borderRadius: printMode ? 14 : 20,
        padding: printMode ? 8 : 14,
        minHeight: printMode ? 0 : 250,
        height: printMode ? "100%" : undefined,
        display: "flex",
        flexDirection: "column",
        gap: printMode ? 6 : 12,
        opacity: disabled ? 0.72 : 1,
        overflow: "hidden",
        breakInside: "avoid-page",
        pageBreakInside: "avoid",
      }}
    >
      <div className="stack" style={{ gap: printMode ? 3 : 6, flexShrink: 0 }}>
        <div
          className="row space-between"
          style={{
            gap: 8,
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              fontSize: printMode ? 11 : 15,
              fontWeight: 750,
              letterSpacing: "-0.025em",
              color: toneStyles.title,
              lineHeight: 1.05,
            }}
          >
            {title}
          </div>

          {!printMode ? (
            <span
              className={isFilled ? "badge primary" : "badge"}
              style={{
                fontSize: 11,
                padding: "5px 8px",
              }}
            >
              {isFilled ? "renseigné" : "vide"}
            </span>
          ) : null}
        </div>

        <div
          className="muted"
          style={{
            fontSize: printMode ? 6.8 : 12,
            lineHeight: printMode ? 1.12 : 1.45,
          }}
        >
          {subtitle}
        </div>
      </div>

      {printMode ? (
        <div style={{ minHeight: 0, flex: 1, overflow: "hidden" }}>
          <HighlightedNotes
            entries={buildTextNotes(value)}
            tone={tone}
            compact
            emptyLabel="Non renseigné"
          />
        </div>
      ) : (
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
          }}
        >
          <EditableHighlightedNotes
            value={value}
            onChange={onChange}
            tone={tone}
            disabled={disabled}
            placeholder={placeholder || "Saisir une note..."}
          />
        </div>
      )}
    </div>
  );
}

type OrganizationTimeCanvasVisualProps = {
  form: TimeFormState;
  onChange: (key: TimeNodeKey, value: string) => void;
  readinessScore: number;
  readinessStatus: string;
  summary: string;
  printMode?: boolean;
};

export function OrganizationTimeCanvasVisual({
  form,
  onChange,
  readinessScore,
  readinessStatus,
  summary,
  printMode = false,
}: OrganizationTimeCanvasVisualProps) {
  const completedNodes = getTimeCanvasCompletedNodes(form);
  const emptyNodes = TIME_NODES.length - completedNodes;
  const filledNodeLabels = getFilledNodeLabels(form);
  const emptyNodeLabels = getEmptyNodeLabels(form);
  const readinessEmphasis = getReadinessEmphasis(readinessScore);

  if (printMode) {
    return (
      <TimePrintCanvas
        form={form}
        readinessScore={readinessScore}
        readinessStatus={readinessStatus}
        summary={summary}
        completedNodes={completedNodes}
        emptyNodes={emptyNodes}
        filledNodeLabels={filledNodeLabels}
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
          <TimeMetricCard
            label="Score de préparation"
            value={`${readinessScore}%`}
            hint="Capacité d’exécution"
            emphasis={readinessEmphasis}
          />

          <TimeMetricCard
            label="Blocs complétés"
            value={`${completedNodes}/${TIME_NODES.length}`}
            hint={`${emptyNodes} bloc(s) encore vide(s)`}
            emphasis={completedNodes === TIME_NODES.length ? "success" : "neutral"}
          />

          <TimeMetricCard
            label="Ancrages d’exécution"
            value={String(filledNodeLabels.length)}
            hint={
              filledNodeLabels.length > 0
                ? filledNodeLabels.join(" · ")
                : "Aucun signal pour le moment"
            }
            emphasis={filledNodeLabels.length > 0 ? "primary" : "neutral"}
          />

          <div
            className="card-soft stack admin-kpi-card"
            style={{
              gap: 8,
              background: "var(--admin-surface-muted)",
              borderColor: "var(--admin-border)",
            }}
          >
            <div className="muted">Statut de préparation</div>

            <div>
              <CoherenceBadge status={readinessStatus} />
            </div>

            <div className="muted" style={{ fontSize: 12 }}>
              Statut calculé à partir des signaux d’exécution complétés.
            </div>
          </div>
        </div>
      </div>

      <div
        className="card-soft stack"
        style={{
          gap: 12,
          background: "rgba(255,255,255,0.76)",
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
              Lecture du Time Canvas
            </div>

            <div className="muted">
              Vue consolidée de la capacité réelle d’exécution du worker.
            </div>
          </div>

          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            <span className={completedNodes > 0 ? "badge primary" : "badge"}>
              {completedNodes} renseigné(s)
            </span>
            <span className={emptyNodes > 0 ? "badge warning" : "badge success"}>
              {emptyNodes} manquant(s)
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
            {summary || "Aucune lecture du Time Canvas n’est encore disponible."}
          </div>
        </div>

        {emptyNodeLabels.length > 0 ? (
          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            <span className="muted" style={{ fontSize: 12 }}>
              Signaux manquants :
            </span>

            {emptyNodeLabels.map((label) => (
              <span key={label} className="badge">
                {label}
              </span>
            ))}
          </div>
        ) : (
          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            <span className="badge success">
              Tous les signaux d’exécution sont renseignés
            </span>
          </div>
        )}
      </div>

      <div
        className="card-soft"
        style={{
          padding: 12,
          background: "rgba(255,255,255,0.72)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(280px, 1fr))",
            gap: 14,
          }}
        >
          {TIME_NODES.map((node) => (
            <CanvasTextBlock
              key={node.key}
              title={node.label}
              subtitle={node.subtitle}
              value={form[node.key]}
              onChange={(value) => onChange(node.key, value)}
              tone={node.tone}
              placeholder={node.placeholder}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function TimePrintCanvas({
  form,
  readinessScore,
  readinessStatus,
  summary,
  completedNodes,
  emptyNodes,
  filledNodeLabels,
}: {
  form: TimeFormState;
  readinessScore: number;
  readinessStatus: string;
  summary: string;
  completedNodes: number;
  emptyNodes: number;
  filledNodeLabels: string[];
}) {
  const readinessEmphasis = getReadinessEmphasis(readinessScore);

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
          label="Score de préparation"
          value={`${readinessScore}%`}
          hint="Capacité d’exécution"
          emphasis={readinessEmphasis}
        />

        <PrintSummaryCard
          label="Blocs complétés"
          value={`${completedNodes}/${TIME_NODES.length}`}
          hint={`${emptyNodes} bloc(s) manquant(s)`}
          emphasis={completedNodes === TIME_NODES.length ? "success" : "neutral"}
        />

        <PrintSummaryCard
          label="Ancrages d’exécution"
          value={String(filledNodeLabels.length)}
          hint={
            filledNodeLabels.length > 0
              ? filledNodeLabels.join(" · ")
              : "Aucun signal pour le moment"
          }
          emphasis={filledNodeLabels.length > 0 ? "primary" : "neutral"}
        />

        <PrintSummaryCard
          label="Statut de préparation"
          value={readinessStatus || "—"}
          hint="Calculé à partir des signaux d’exécution"
          emphasis={readinessEmphasis}
        />
      </div>

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
          Lecture du Time Canvas
        </div>

        <HighlightedNotes
          entries={buildTextNotes(
            summary || "Aucune lecture du Time Canvas n’est encore disponible.",
          )}
          tone="blue"
          compact
          emptyLabel="Aucune lecture du Time Canvas n’est encore disponible."
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gridTemplateRows: "repeat(2, minmax(0, 1fr))",
          gap: 8,
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        {TIME_NODES.map((node) => (
          <CanvasTextBlock
            key={node.key}
            title={node.label}
            subtitle={node.subtitle}
            value={form[node.key]}
            onChange={() => undefined}
            tone={node.tone}
            placeholder={node.placeholder}
            disabled
            printMode
          />
        ))}
      </div>
    </div>
  );
}

function EditableHighlightedNotes({
  value,
  onChange,
  tone,
  disabled = false,
  placeholder = "Saisir une note...",
}: {
  value: string;
  onChange: (value: string) => void;
  tone: CanvasTone;
  disabled?: boolean;
  placeholder?: string;
}) {
  const toneStyles = getCanvasToneStyles(tone);
  const notes = buildEditableNotes(value);

  function updateNote(index: number, nextValue: string) {
    const normalizedValue = nextValue.replace(/\r\n/g, "\n");
    const splitValues = normalizedValue.split("\n");

    const nextNotes = [...notes];
    nextNotes.splice(index, 1, ...splitValues);

    onChange(serializeEditableNotes(nextNotes));
  }

  function addNote() {
    onChange(serializeEditableNotes([...notes, ""]));
  }

  function removeNote(index: number) {
    const nextNotes = notes.filter((_, itemIndex) => itemIndex !== index);

    if (nextNotes.length === 0) {
      onChange("");
      return;
    }

    onChange(serializeEditableNotes(nextNotes));
  }

  return (
    <div className="stack" style={{ gap: 8 }}>
      {notes.map((note, index) => (
        <div
          key={`${index}-${notes.length}`}
          style={{
            borderRadius: 14,
            border: `1px solid ${toneStyles.noteBorder}`,
            background: toneStyles.noteBackground,
            padding: 8,
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.45)",
          }}
        >
          <textarea
            value={note}
            onChange={(event) => updateNote(index, event.target.value)}
            disabled={disabled}
            placeholder={placeholder}
            rows={3}
            style={{
              width: "100%",
              minHeight: 54,
              resize: "vertical",
              border: "none",
              outline: "none",
              background: "transparent",
              color: "var(--foreground)",
              font: "inherit",
              fontSize: 13,
              lineHeight: 1.45,
              padding: 0,
              cursor: disabled ? "not-allowed" : "text",
            }}
          />

          {!disabled && notes.length > 1 ? (
            <button
              type="button"
              className="button ghost"
              onClick={() => removeNote(index)}
              style={{
                marginTop: 6,
                minHeight: 26,
                padding: "4px 8px",
                fontSize: 11,
              }}
            >
              Retirer
            </button>
          ) : null}
        </div>
      ))}

      {!disabled ? (
        <button
          type="button"
          className="button secondary"
          onClick={addNote}
          style={{
            alignSelf: "flex-start",
            minHeight: 30,
            padding: "6px 10px",
            fontSize: 12,
          }}
        >
          + Ajouter une note
        </button>
      ) : null}
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

function TimeMetricCard({
  label,
  value,
  hint,
  emphasis,
}: {
  label: string;
  value: string;
  hint: string;
  emphasis: "primary" | "success" | "warning" | "danger" | "neutral";
}) {
  const color =
    emphasis === "primary"
      ? "var(--admin-accent)"
      : emphasis === "success"
        ? "var(--success)"
        : emphasis === "warning"
          ? "var(--warning)"
          : emphasis === "danger"
            ? "var(--danger)"
            : "var(--foreground)";

  const background =
    emphasis === "primary"
      ? "var(--admin-accent-soft)"
      : emphasis === "success"
        ? "var(--success-soft)"
        : emphasis === "warning"
          ? "var(--warning-soft)"
          : emphasis === "danger"
            ? "var(--danger-soft)"
            : "var(--admin-surface-muted)";

  return (
    <div
      className="card-soft stack admin-kpi-card"
      style={{
        gap: 6,
        background,
        borderColor:
          emphasis === "neutral" ? "var(--admin-border)" : "rgba(17,24,39,0.08)",
      }}
    >
      <div className="muted">{label}</div>

      <div
        className="admin-metric-value"
        style={{
          fontSize: 28,
          color,
        }}
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

function PrintSummaryCard({
  label,
  value,
  hint,
  emphasis,
}: {
  label: string;
  value: string;
  hint: string;
  emphasis: "primary" | "success" | "warning" | "danger" | "neutral";
}) {
  const color =
    emphasis === "primary"
      ? "#4f46e5"
      : emphasis === "success"
        ? "#15803d"
        : emphasis === "warning"
          ? "#b45309"
          : emphasis === "danger"
            ? "#be123c"
            : "#0f172a";

  const background =
    emphasis === "primary"
      ? "rgba(79,70,229,0.08)"
      : emphasis === "success"
        ? "rgba(21,128,61,0.08)"
        : emphasis === "warning"
          ? "rgba(180,83,9,0.08)"
          : emphasis === "danger"
            ? "rgba(190,18,60,0.08)"
            : "rgba(248,250,252,0.95)";

  return (
    <div
      style={{
        border: "1px solid rgba(17,24,39,0.10)",
        background,
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
          color: "#64748b",
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
          color,
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