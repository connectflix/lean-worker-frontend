"use client";

import type { AdminWorkerEngagementState } from "@/lib/types";

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

type EngagementFormState = {
  worker_id: string;
  state_type: AdminWorkerEngagementState;

  identity_text: string;
  purpose_text: string;
  missions_text: string;
  ambitions_text: string;

  career_intent_compensation: string;
  career_intent_role: string;
  career_intent_passion_criteria: string;
  career_intent_collaboration_profile: string;
  career_intent_performance_level: string;
  career_intent_responsibilities: string;

  vision_text: string;
  actions_text: string;
  objectives_text: string;

  talent_intent_foundations: string;
  talent_intent_personality: string;
  talent_intent_watch: string;
  talent_intent_next_level: string;
  talent_intent_impact_niches: string;
  talent_intent_social_contributions: string;
};

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
  if (entryCount >= 18) {
    return {
      fontSize: 5.8,
      lineHeight: 1.08,
      padding: "2px 4px",
      gap: 2,
      borderRadius: 6,
    };
  }

  if (entryCount >= 14) {
    return {
      fontSize: 6.2,
      lineHeight: 1.1,
      padding: "2.5px 4px",
      gap: 2,
      borderRadius: 6,
    };
  }

  if (entryCount >= 10) {
    return {
      fontSize: 6.8,
      lineHeight: 1.12,
      padding: "3px 4px",
      gap: 2.5,
      borderRadius: 7,
    };
  }

  if (entryCount >= 7) {
    return {
      fontSize: 7.2,
      lineHeight: 1.14,
      padding: "3.5px 5px",
      gap: 3,
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

type OrganizationEngagementCanvasVisualProps = {
  form: EngagementFormState;
  onChange: <K extends keyof EngagementFormState>(
    key: K,
    value: EngagementFormState[K],
  ) => void;
  disabled?: boolean;
  printMode?: boolean;
};

export function OrganizationEngagementCanvasVisual({
  form,
  onChange,
  disabled = false,
  printMode = false,
}: OrganizationEngagementCanvasVisualProps) {
  const topHeight = printMode ? 520 : 620;
  const halfHeight = printMode ? 260 : 308;
  const bottomHeight = printMode ? 190 : 280;

  return (
    <div
      className="stack"
      style={{
        gap: printMode ? 0 : 14,
        minWidth: 0,
        width: "100%",
      }}
    >
      <div
        className={printMode ? undefined : "card-soft"}
        style={{
          minWidth: 0,
          overflow: printMode ? "hidden" : "auto",
          padding: printMode ? 0 : 12,
          background: printMode ? "transparent" : "rgba(255,255,255,0.72)",
          breakInside: "avoid-page",
          pageBreakInside: "avoid",
        }}
      >
        <div
          style={{
            width: "100%",
            overflow: "hidden",
            borderRadius: printMode ? 18 : 22,
            border: "1px solid rgba(17,24,39,0.10)",
            background: "#ffffff",
            breakInside: "avoid-page",
            pageBreakInside: "avoid",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.05fr 1.4fr 1.4fr 1.1fr 1.05fr",
              minHeight: topHeight,
              maxHeight: printMode ? topHeight : undefined,
              borderBottom: "1px solid rgba(17,24,39,0.10)",
              overflow: "hidden",
            }}
          >
            <div style={{ borderRight: "1px solid rgba(17,24,39,0.10)", overflow: "hidden" }}>
              <EngagementCanvasCell
                title="Ambitions"
                helper="Ce que le worker vise, cherche à accomplir ou souhaite devenir."
                tone="orange"
                value={form.ambitions_text}
                onChange={(value) => onChange("ambitions_text", value)}
                placeholder="Quelles ambitions professionnelles émergent ?"
                disabled={disabled}
                minHeight={topHeight}
                printMode={printMode}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateRows: "1fr 1fr",
                borderRight: "1px solid rgba(17,24,39,0.10)",
                overflow: "hidden",
              }}
            >
              <div style={{ borderBottom: "1px solid rgba(17,24,39,0.10)", overflow: "hidden" }}>
                <EngagementCanvasCell
                  title="But"
                  helper="Le sens immédiat ou la finalité visible dans son travail."
                  tone="purple"
                  value={form.purpose_text}
                  onChange={(value) => onChange("purpose_text", value)}
                  placeholder="Quel est le but visible dans son travail ?"
                  disabled={disabled}
                  minHeight={halfHeight}
                  printMode={printMode}
                />
              </div>

              <EngagementCanvasCell
                title="Missions"
                helper="Les responsabilités, contributions et activités importantes."
                tone="teal"
                value={form.missions_text}
                onChange={(value) => onChange("missions_text", value)}
                placeholder="Quelles missions, responsabilités ou contributions sont importantes ?"
                disabled={disabled}
                minHeight={halfHeight}
                printMode={printMode}
              />
            </div>

            <div style={{ borderRight: "1px solid rgba(17,24,39,0.10)", overflow: "hidden" }}>
              <EngagementCanvasCell
                title="Identité"
                helper="La manière dont le worker se définit professionnellement."
                tone="blue"
                value={form.identity_text}
                onChange={(value) => onChange("identity_text", value)}
                placeholder="Qui est ce worker professionnellement ?"
                disabled={disabled}
                minHeight={topHeight}
                printMode={printMode}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateRows: "1fr 1fr",
                borderRight: "1px solid rgba(17,24,39,0.10)",
                overflow: "hidden",
              }}
            >
              <div style={{ borderBottom: "1px solid rgba(17,24,39,0.10)", overflow: "hidden" }}>
                <EngagementCanvasCell
                  title="Vision"
                  helper="La direction claire qui doit guider la trajectoire."
                  tone="cyan"
                  value={form.vision_text}
                  onChange={(value) => onChange("vision_text", value)}
                  placeholder="Quelle vision doit guider le worker ?"
                  disabled={disabled}
                  minHeight={halfHeight}
                  printMode={printMode}
                />
              </div>

              <EngagementCanvasCell
                title="Actions"
                helper="Les actions concrètes à exécuter ou à renforcer."
                tone="amber"
                value={form.actions_text}
                onChange={(value) => onChange("actions_text", value)}
                placeholder="Quelles actions concrètes doivent être portées ?"
                disabled={disabled}
                minHeight={halfHeight}
                printMode={printMode}
              />
            </div>

            <EngagementCanvasCell
              title="Objectifs"
              helper="Les résultats ciblés et les points de progression mesurables."
              tone="rose"
              value={form.objectives_text}
              onChange={(value) => onChange("objectives_text", value)}
              placeholder="Quels objectifs doivent être ciblés ?"
              disabled={disabled}
              minHeight={topHeight}
              printMode={printMode}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              minHeight: bottomHeight,
              maxHeight: printMode ? bottomHeight : undefined,
              overflow: "hidden",
            }}
          >
            <div style={{ borderRight: "1px solid rgba(17,24,39,0.10)", overflow: "hidden" }}>
              <EngagementIntentCanvasCell
                title="Intentions Carrière"
                helper="Ce que le worker attend de sa trajectoire professionnelle."
                tone="indigo"
                disabled={disabled}
                printMode={printMode}
                minHeight={bottomHeight}
                items={[
                  {
                    label: "Rémunération",
                    value: form.career_intent_compensation,
                    onChange: (value) => onChange("career_intent_compensation", value),
                  },
                  {
                    label: "Rôle",
                    value: form.career_intent_role,
                    onChange: (value) => onChange("career_intent_role", value),
                  },
                  {
                    label: "Critères de passion",
                    value: form.career_intent_passion_criteria,
                    onChange: (value) =>
                      onChange("career_intent_passion_criteria", value),
                  },
                  {
                    label: "Profil de collaboration",
                    value: form.career_intent_collaboration_profile,
                    onChange: (value) =>
                      onChange("career_intent_collaboration_profile", value),
                  },
                  {
                    label: "Niveau de performance",
                    value: form.career_intent_performance_level,
                    onChange: (value) =>
                      onChange("career_intent_performance_level", value),
                  },
                  {
                    label: "Responsabilités",
                    value: form.career_intent_responsibilities,
                    onChange: (value) =>
                      onChange("career_intent_responsibilities", value),
                  },
                ]}
              />
            </div>

            <EngagementIntentCanvasCell
              title="Intentions Talent"
              helper="Ce qui permet de renforcer, développer ou exprimer son talent."
              tone="green"
              disabled={disabled}
              printMode={printMode}
              minHeight={bottomHeight}
              items={[
                {
                  label: "Fondations",
                  value: form.talent_intent_foundations,
                  onChange: (value) => onChange("talent_intent_foundations", value),
                },
                {
                  label: "Personnalité",
                  value: form.talent_intent_personality,
                  onChange: (value) => onChange("talent_intent_personality", value),
                },
                {
                  label: "Veille",
                  value: form.talent_intent_watch,
                  onChange: (value) => onChange("talent_intent_watch", value),
                },
                {
                  label: "Prochain niveau",
                  value: form.talent_intent_next_level,
                  onChange: (value) => onChange("talent_intent_next_level", value),
                },
                {
                  label: "Niches d’impact",
                  value: form.talent_intent_impact_niches,
                  onChange: (value) => onChange("talent_intent_impact_niches", value),
                },
                {
                  label: "Contributions sociales",
                  value: form.talent_intent_social_contributions,
                  onChange: (value) =>
                    onChange("talent_intent_social_contributions", value),
                },
              ]}
            />
          </div>
        </div>
      </div>

      {!printMode ? (
        <div
          className="card-soft"
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            alignItems: "center",
            background: "rgba(255,255,255,0.72)",
          }}
        >
          <span className="badge primary">Structure d’engagement</span>
          <span className="muted" style={{ lineHeight: 1.6 }}>
            Ambitions · But/Missions · Identité · Vision/Actions · Objectifs ·
            Intentions Carrière · Intentions Talent.
          </span>
        </div>
      ) : null}
    </div>
  );
}

function EngagementCanvasCell({
  title,
  helper,
  tone,
  value,
  onChange,
  placeholder,
  minHeight,
  disabled = false,
  printMode = false,
}: {
  title: string;
  helper: string;
  tone: CanvasTone;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight: number;
  disabled?: boolean;
  printMode?: boolean;
}) {
  const toneStyles = getCanvasToneStyles(tone);
  const notes = buildTextNotes(value);

  return (
    <div
      style={{
        minHeight,
        maxHeight: printMode ? minHeight : undefined,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: `linear-gradient(180deg, ${toneStyles.background}, #ffffff 46%)`,
        opacity: disabled ? 0.92 : 1,
        overflow: "hidden",
      }}
    >
      <div
        className="stack"
        style={{
          gap: printMode ? 2 : 5,
          padding: printMode ? "6px 9px 4px" : "18px 18px 10px",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontSize: printMode ? 12 : 24,
            lineHeight: 1,
            fontWeight: 750,
            letterSpacing: "-0.045em",
            color: toneStyles.title,
          }}
        >
          {title}
        </div>

        <div
          style={{
            maxWidth: 260,
            color: toneStyles.softTitle,
            fontSize: printMode ? 6.8 : 12,
            lineHeight: 1.12,
            fontWeight: 600,
          }}
        >
          {helper}
        </div>
      </div>

      <div
        style={{
          height: 1,
          margin: printMode ? "0 9px" : "0 18px",
          background: toneStyles.border,
          flexShrink: 0,
        }}
      />

      {printMode ? (
        <div
          style={{
            flex: 1,
            minHeight: 0,
            padding: "5px 7px 7px",
            overflow: "hidden",
          }}
        >
          <HighlightedNotes
            entries={notes}
            tone={tone}
            compact
            emptyLabel="Aucun contenu renseigné"
          />
        </div>
      ) : (
        <div
          style={{
            flex: 1,
            minHeight: 0,
            padding: "14px 18px 18px",
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

function EngagementIntentCanvasCell({
  title,
  helper,
  tone,
  items,
  disabled = false,
  printMode = false,
  minHeight,
}: {
  title: string;
  helper: string;
  tone: CanvasTone;
  items: Array<{
    label: string;
    value: string;
    onChange: (value: string) => void;
  }>;
  disabled?: boolean;
  printMode?: boolean;
  minHeight: number;
}) {
  const toneStyles = getCanvasToneStyles(tone);

  return (
    <div
      style={{
        minHeight,
        maxHeight: printMode ? minHeight : undefined,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: `linear-gradient(180deg, ${toneStyles.background}, #ffffff 52%)`,
        opacity: disabled ? 0.92 : 1,
        overflow: "hidden",
      }}
    >
      <div
        className="stack"
        style={{
          gap: printMode ? 2 : 5,
          padding: printMode ? "6px 9px 4px" : "18px 18px 10px",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontSize: printMode ? 11 : 22,
            lineHeight: 1,
            fontWeight: 750,
            letterSpacing: "-0.045em",
            color: toneStyles.title,
          }}
        >
          {title}
        </div>

        <div
          style={{
            color: toneStyles.softTitle,
            fontSize: printMode ? 6.8 : 12,
            lineHeight: 1.12,
            fontWeight: 600,
          }}
        >
          {helper}
        </div>
      </div>

      <div
        style={{
          height: 1,
          margin: printMode ? "0 9px" : "0 18px",
          background: toneStyles.border,
          flexShrink: 0,
        }}
      />

      {printMode ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 4,
            padding: "5px 7px 7px",
            flex: 1,
            minHeight: 0,
            alignContent: "start",
            overflow: "hidden",
          }}
        >
          {items.map((item) => (
            <div
              key={item.label}
              style={{
                border: `1px solid ${toneStyles.noteBorder}`,
                borderRadius: 8,
                background: "rgba(255,255,255,0.92)",
                padding: 4,
                minHeight: 0,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  fontSize: 6.8,
                  fontWeight: 800,
                  color: toneStyles.title,
                  letterSpacing: "0.02em",
                  textTransform: "uppercase",
                  marginBottom: 3,
                  lineHeight: 1.05,
                }}
              >
                {item.label}
              </div>

              <HighlightedNotes
                entries={buildTextNotes(item.value)}
                tone={tone}
                compact
                emptyLabel="Non renseigné"
              />
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 10,
            padding: "14px 18px 18px",
            flex: 1,
            minHeight: 0,
            overflow: "hidden",
          }}
        >
          {items.map((item) => (
            <div key={item.label} className="stack" style={{ gap: 5, minWidth: 0 }}>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: toneStyles.title,
                  letterSpacing: "-0.01em",
                }}
              >
                {item.label}
              </span>

              <div
                style={{
                  minHeight: 76,
                  maxHeight: 160,
                  overflowY: "auto",
                }}
              >
                <EditableHighlightedNotes
                  value={item.value}
                  onChange={item.onChange}
                  tone={tone}
                  disabled={disabled}
                  placeholder="Saisir une note..."
                  compact
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EditableHighlightedNotes({
  value,
  onChange,
  tone,
  disabled = false,
  placeholder = "Saisir une note...",
  compact = false,
}: {
  value: string;
  onChange: (value: string) => void;
  tone: CanvasTone;
  disabled?: boolean;
  placeholder?: string;
  compact?: boolean;
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
    <div className="stack" style={{ gap: compact ? 6 : 8 }}>
      {notes.map((note, index) => (
        <div
          key={`${index}-${notes.length}`}
          style={{
            borderRadius: compact ? 10 : 14,
            border: `1px solid ${toneStyles.noteBorder}`,
            background: toneStyles.noteBackground,
            padding: compact ? 6 : 8,
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.45)",
          }}
        >
          <textarea
            value={note}
            onChange={(event) => updateNote(index, event.target.value)}
            disabled={disabled}
            placeholder={placeholder}
            rows={compact ? 2 : 3}
            style={{
              width: "100%",
              minHeight: compact ? 40 : 54,
              resize: "vertical",
              border: "none",
              outline: "none",
              background: "transparent",
              color: "var(--foreground)",
              font: "inherit",
              fontSize: compact ? 12 : 13,
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
                minHeight: compact ? 24 : 26,
                padding: compact ? "3px 7px" : "4px 8px",
                fontSize: compact ? 10 : 11,
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
            minHeight: compact ? 28 : 30,
            padding: compact ? "5px 9px" : "6px 10px",
            fontSize: compact ? 11 : 12,
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