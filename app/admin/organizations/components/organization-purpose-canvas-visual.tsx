"use client";

import { useMemo } from "react";

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

type PurposeNodeKey =
  | "travail_text"
  | "aspiration_text"
  | "inspiration_text"
  | "passion_text"
  | "vocation_text"
  | "formation_text";

type PurposeRelationStatus = "pending" | "coherent" | "incoherent";

type PurposeFormState = {
  worker_id: string;
  travail_text: string;
  aspiration_text: string;
  inspiration_text: string;
  passion_text: string;
  vocation_text: string;
  formation_text: string;
};

type PurposeRelation = {
  from: PurposeNodeKey;
  to: PurposeNodeKey;
  status: PurposeRelationStatus;
  reason: string;
};

const PURPOSE_NODES: Array<{
  key: PurposeNodeKey;
  label: string;
  subtitle: string;
  placeholder: string;
  tone: CanvasTone;
  x: number;
  y: number;
  printX: number;
  printY: number;
}> = [
  {
    key: "travail_text",
    label: "Travail",
    subtitle: "Ce que le worker fait, produit ou porte concrètement",
    placeholder: "Phrase courte sur le travail réel, le rôle ou l’activité portée...",
    tone: "blue",
    x: 50,
    y: 10,
    printX: 50,
    printY: 15,
  },
  {
    key: "aspiration_text",
    label: "Aspiration",
    subtitle: "Ce vers quoi le worker souhaite évoluer",
    placeholder: "Phrase courte sur l’aspiration professionnelle ou personnelle...",
    tone: "purple",
    x: 85,
    y: 32,
    printX: 82,
    printY: 35,
  },
  {
    key: "inspiration_text",
    label: "Inspiration",
    subtitle: "Ce qui nourrit, influence ou élève sa trajectoire",
    placeholder: "Phrase courte sur ce qui inspire le worker...",
    tone: "teal",
    x: 85,
    y: 72,
    printX: 82,
    printY: 65,
  },
  {
    key: "passion_text",
    label: "Passion",
    subtitle: "Ce qui donne de l’énergie et de l’élan",
    placeholder: "Phrase courte sur ce qui donne de l’énergie...",
    tone: "orange",
    x: 50,
    y: 90,
    printX: 50,
    printY: 82,
  },
  {
    key: "vocation_text",
    label: "Vocation",
    subtitle: "La contribution profonde que le worker sent devoir porter",
    placeholder: "Phrase courte sur la vocation ou la contribution profonde...",
    tone: "green",
    x: 15,
    y: 72,
    printX: 18,
    printY: 65,
  },
  {
    key: "formation_text",
    label: "Formation",
    subtitle: "Ce qu’il faut apprendre, renforcer ou développer",
    placeholder: "Phrase courte sur les apprentissages ou développements nécessaires...",
    tone: "rose",
    x: 15,
    y: 32,
    printX: 18,
    printY: 35,
  },
];

function normalizePurposeText(value?: string | null): string {
  return (value || "").trim();
}

function tokenizePurposeText(value: string): Set<string> {
  const stopWords = new Set([
    "the",
    "and",
    "for",
    "with",
    "that",
    "this",
    "dans",
    "pour",
    "avec",
    "les",
    "des",
    "une",
    "sur",
    "qui",
    "que",
    "est",
    "mon",
    "mes",
    "aux",
    "par",
    "leur",
    "être",
    "etre",
    "work",
    "job",
    "role",
    "faire",
    "plus",
    "bien",
  ]);

  return new Set(
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .map((item) => item.trim())
      .filter((item) => item.length >= 4 && !stopWords.has(item)),
  );
}

function getPurposeRelationStatus(
  left: string,
  right: string,
): { status: PurposeRelationStatus; reason: string } {
  const normalizedLeft = normalizePurposeText(left);
  const normalizedRight = normalizePurposeText(right);

  if (!normalizedLeft || !normalizedRight) {
    return {
      status: "pending",
      reason: "Relation pending until both nodes are filled.",
    };
  }

  const leftTokens = tokenizePurposeText(normalizedLeft);
  const rightTokens = tokenizePurposeText(normalizedRight);
  const overlap = [...leftTokens].filter((token) => rightTokens.has(token));

  if (overlap.length > 0) {
    return {
      status: "coherent",
      reason: `Shared meaning detected through: ${overlap.slice(0, 4).join(", ")}.`,
    };
  }

  const leftLower = normalizedLeft.toLowerCase();
  const rightLower = normalizedRight.toLowerCase();

  if (leftLower.includes(rightLower) || rightLower.includes(leftLower)) {
    return {
      status: "coherent",
      reason: "One statement reinforces or contains the other.",
    };
  }

  return {
    status: "incoherent",
    reason: "No obvious coherence detected between both statements.",
  };
}

function buildPurposeRelations(form: PurposeFormState): PurposeRelation[] {
  const relations: PurposeRelation[] = [];

  PURPOSE_NODES.forEach((fromNode, fromIndex) => {
    PURPOSE_NODES.slice(fromIndex + 1).forEach((toNode) => {
      const result = getPurposeRelationStatus(form[fromNode.key], form[toNode.key]);

      relations.push({
        from: fromNode.key,
        to: toNode.key,
        status: result.status,
        reason: result.reason,
      });
    });
  });

  return relations;
}

function getPurposeCoherenceScore(relations: PurposeRelation[]): number {
  const completedRelations = relations.filter((relation) => relation.status !== "pending");

  if (completedRelations.length === 0) {
    return 0;
  }

  const coherentRelations = completedRelations.filter(
    (relation) => relation.status === "coherent",
  );

  return Math.round((coherentRelations.length / completedRelations.length) * 100);
}

function getPurposeCoherenceStatus(score: number, completedRelations: number): string {
  if (completedRelations === 0) return "Not evaluated";
  if (score >= 75) return "Coherent";
  if (score >= 40) return "Partially coherent";
  return "Fragmented";
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

function getRelationColor(status: PurposeRelationStatus): string {
  if (status === "coherent") return "#4f5bc4";
  if (status === "incoherent") return "#c62828";
  return "rgba(107,114,128,0.32)";
}

function getRelationBackground(status: PurposeRelationStatus): string {
  if (status === "coherent") return "rgba(94,106,210,0.075)";
  if (status === "incoherent") return "rgba(198,40,40,0.075)";
  return "rgba(107,114,128,0.06)";
}

function getRelationLabel(status: PurposeRelationStatus): string {
  if (status === "coherent") return "Coherent";
  if (status === "incoherent") return "Incoherent";
  return "Pending";
}

function normalizeText(value: string): string {
  return (value || "").replace(/\r\n/g, "\n").trim();
}

function buildTextNotes(value: string): string[] {
  const normalized = normalizeText(value);

  if (!normalized) {
    return [];
  }

  return normalized
    .split(/\n+/)
    .map((item) =>
      item
        .trim()
        .replace(/^[•\-\–\—\*\d\.\)\(]+\s*/g, "")
        .trim(),
    )
    .filter(Boolean);
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

type OrganizationPurposeCanvasVisualProps = {
  form: PurposeFormState;
  onChange: (key: PurposeNodeKey, value: string) => void;
  printMode?: boolean;
};

export function OrganizationPurposeCanvasVisual({
  form,
  onChange,
  printMode = false,
}: OrganizationPurposeCanvasVisualProps) {
  const relations = useMemo(() => buildPurposeRelations(form), [form]);
  const coherenceScore = getPurposeCoherenceScore(relations);
  const completedRelations = relations.filter((relation) => relation.status !== "pending").length;
  const coherentRelations = relations.filter((relation) => relation.status === "coherent").length;
  const incoherentRelations = relations.filter(
    (relation) => relation.status === "incoherent",
  ).length;
  const pendingRelations = relations.filter((relation) => relation.status === "pending").length;
  const coherenceStatus = getPurposeCoherenceStatus(coherenceScore, completedRelations);

  function getNodePosition(key: PurposeNodeKey) {
    return PURPOSE_NODES.find((node) => node.key === key) ?? PURPOSE_NODES[0];
  }

  const canvasHeight = printMode ? 610 : 820;
  const nodeWidth = printMode ? 212 : 270;
  const nodeMinHeight = printMode ? 118 : 168;
  const centerSize = printMode ? 122 : 190;

  return (
    <div className="stack" style={{ gap: printMode ? 0 : 16, minWidth: 0, width: "100%" }}>
      {!printMode ? (
        <div className="admin-kpi-scroll">
          <div
            className="admin-kpi-row"
            style={{
              gridTemplateColumns: "repeat(5, minmax(170px, 1fr))",
            }}
          >
            <PurposeMetricCard
              label="Global coherence"
              value={`${coherenceScore}%`}
              hint={coherenceStatus}
              emphasis={coherenceScore >= 75 ? "success" : coherenceScore >= 40 ? "warning" : "neutral"}
            />

            <PurposeMetricCard
              label="Completed relations"
              value={`${completedRelations}/15`}
              hint={`${pendingRelations} pending`}
              emphasis="neutral"
            />

            <PurposeMetricCard
              label="Coherent links"
              value={String(coherentRelations)}
              hint="Meaning overlap detected"
              emphasis="primary"
            />

            <PurposeMetricCard
              label="Incoherent links"
              value={String(incoherentRelations)}
              hint="Needs clarification"
              emphasis={incoherentRelations > 0 ? "danger" : "neutral"}
            />

            <PurposeMetricCard
              label="Purpose nodes"
              value={`${PURPOSE_NODES.filter((node) => form[node.key].trim()).length}/6`}
              hint="Filled blocks"
              emphasis="neutral"
            />
          </div>
        </div>
      ) : null}

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
            position: "relative",
            width: "100%",
            minWidth: printMode ? "100%" : 1080,
            height: canvasHeight,
            maxHeight: printMode ? canvasHeight : undefined,
            overflow: "hidden",
            borderRadius: printMode ? 18 : 24,
            border: "1px solid rgba(17,24,39,0.10)",
            background:
              "radial-gradient(circle at center, rgba(94,106,210,0.08), rgba(255,255,255,0.98) 56%)",
            breakInside: "avoid-page",
            pageBreakInside: "avoid",
          }}
        >
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              zIndex: 1,
              pointerEvents: "none",
            }}
          >
            {relations.map((relation) => {
              const from = getNodePosition(relation.from);
              const to = getNodePosition(relation.to);

              const fromX = printMode ? from.printX : from.x;
              const fromY = printMode ? from.printY : from.y;
              const toX = printMode ? to.printX : to.x;
              const toY = printMode ? to.printY : to.y;

              return (
                <line
                  key={`${relation.from}-${relation.to}`}
                  x1={fromX}
                  y1={fromY}
                  x2={toX}
                  y2={toY}
                  stroke={getRelationColor(relation.status)}
                  strokeWidth={relation.status === "pending" ? 0.22 : 0.42}
                  strokeDasharray={relation.status === "pending" ? "2 2" : "0"}
                  opacity={relation.status === "pending" ? 0.32 : 0.7}
                />
              );
            })}
          </svg>

          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 1,
              width: centerSize,
              height: centerSize,
              borderRadius: 999,
              border: "1px solid rgba(94,106,210,0.16)",
              background: "rgba(255,255,255,0.72)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: printMode ? 10 : 20,
            }}
          >
            <div className="stack" style={{ gap: printMode ? 4 : 6, alignItems: "center" }}>
              <div
                style={{
                  fontSize: printMode ? 22 : 34,
                  lineHeight: 1,
                  fontWeight: 750,
                  letterSpacing: "-0.045em",
                  color: "var(--foreground)",
                }}
              >
                {coherenceScore}%
              </div>
              <div className="muted" style={{ fontSize: printMode ? 8 : 12 }}>
                Purpose coherence
              </div>
            </div>
          </div>

          {PURPOSE_NODES.map((node) => {
            const toneStyles = getCanvasToneStyles(node.tone);
            const hasValue = Boolean(form[node.key].trim());
            const nodeX = printMode ? node.printX : node.x;
            const nodeY = printMode ? node.printY : node.y;

            return (
              <div
                key={node.key}
                style={{
                  position: "absolute",
                  left: `${nodeX}%`,
                  top: `${nodeY}%`,
                  transform: "translate(-50%, -50%)",
                  zIndex: 2,
                  width: nodeWidth,
                  minHeight: nodeMinHeight,
                  maxHeight: printMode ? 150 : undefined,
                  borderRadius: printMode ? 15 : 22,
                  border: `1px solid ${hasValue ? toneStyles.border : "rgba(17,24,39,0.10)"}`,
                  background: "rgba(255,255,255,0.96)",
                  padding: printMode ? 8 : 14,
                  display: "flex",
                  flexDirection: "column",
                  gap: printMode ? 5 : 10,
                  overflow: "hidden",
                  boxShadow: printMode ? "0 8px 22px rgba(15,23,42,0.05)" : undefined,
                }}
              >
                <div className="stack" style={{ gap: printMode ? 2 : 4, flexShrink: 0 }}>
                  <div className="row space-between" style={{ gap: 8, alignItems: "flex-start" }}>
                    <div
                      style={{
                        fontSize: printMode ? 11 : 15,
                        fontWeight: 750,
                        letterSpacing: "-0.025em",
                        color: toneStyles.title,
                        lineHeight: 1.05,
                      }}
                    >
                      {node.label}
                    </div>

                    {!printMode ? (
                      <span
                        className={hasValue ? "badge primary" : "badge"}
                        style={{ fontSize: 11, padding: "5px 8px" }}
                      >
                        {hasValue ? "filled" : "empty"}
                      </span>
                    ) : null}
                  </div>

                  <div
                    className="muted"
                    style={{
                      fontSize: printMode ? 6.5 : 12,
                      lineHeight: printMode ? 1.1 : 1.45,
                    }}
                  >
                    {node.subtitle}
                  </div>
                </div>

                {printMode ? (
                  <HighlightedNotes
                    entries={buildTextNotes(form[node.key])}
                    tone={node.tone}
                    compact
                    emptyLabel="Non renseigné"
                  />
                ) : (
                  <EditableHighlightedNotes
                    value={form[node.key]}
                    onChange={(value) => onChange(node.key, value)}
                    tone={node.tone}
                    placeholder={node.placeholder}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {!printMode ? (
        <div className="card-soft stack" style={{ gap: 12 }}>
          <div
            className="row space-between"
            style={{ gap: 12, flexWrap: "wrap", alignItems: "center" }}
          >
            <div className="stack" style={{ gap: 3 }}>
              <div className="section-title" style={{ fontSize: 15 }}>
                Relation details
              </div>
              <div className="muted">
                Each relation is evaluated from shared meaning between two purpose nodes.
              </div>
            </div>

            <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
              <span className="badge primary">{coherentRelations} coherent</span>
              <span className={incoherentRelations > 0 ? "badge danger" : "badge"}>
                {incoherentRelations} incoherent
              </span>
              <span className="badge">{pendingRelations} pending</span>
            </div>
          </div>

          <div className="scroll-panel" style={{ maxHeight: 420, paddingRight: 6 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 10,
              }}
            >
              {relations.map((relation) => {
                const from = getNodePosition(relation.from);
                const to = getNodePosition(relation.to);

                return (
                  <div
                    key={`${relation.from}-${relation.to}-detail`}
                    style={{
                      borderRadius: 16,
                      border: `1px solid ${getRelationColor(relation.status)}`,
                      padding: 12,
                      background: getRelationBackground(relation.status),
                    }}
                  >
                    <div className="stack" style={{ gap: 6 }}>
                      <div
                        className="row space-between"
                        style={{ gap: 8, alignItems: "flex-start" }}
                      >
                        <div
                          style={{
                            fontWeight: 750,
                            fontSize: 13,
                            letterSpacing: "-0.01em",
                            lineHeight: 1.35,
                          }}
                        >
                          {from.label} ↔ {to.label}
                        </div>

                        <span
                          className={
                            relation.status === "coherent"
                              ? "badge primary"
                              : relation.status === "incoherent"
                                ? "badge danger"
                                : "badge"
                          }
                          style={{ fontSize: 11, padding: "5px 8px" }}
                        >
                          {getRelationLabel(relation.status)}
                        </span>
                      </div>

                      <div className="muted" style={{ fontSize: 12, lineHeight: 1.5 }}>
                        {relation.reason}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function EditableHighlightedNotes({
  value,
  onChange,
  tone,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  tone: CanvasTone;
  placeholder: string;
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
    <div
      className="stack"
      style={{
        gap: 7,
        minHeight: 0,
        overflowY: "auto",
      }}
    >
      {notes.map((note, index) => (
        <div
          key={`${index}-${notes.length}`}
          style={{
            borderRadius: 12,
            border: `1px solid ${toneStyles.noteBorder}`,
            background: toneStyles.noteBackground,
            padding: 7,
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.45)",
          }}
        >
          <textarea
            value={note}
            onChange={(event) => updateNote(index, event.target.value)}
            placeholder={placeholder}
            rows={2}
            style={{
              width: "100%",
              minHeight: 44,
              resize: "vertical",
              border: "none",
              outline: "none",
              background: "transparent",
              color: "var(--foreground)",
              font: "inherit",
              fontSize: 12.5,
              lineHeight: 1.42,
              padding: 0,
            }}
          />

          {notes.length > 1 ? (
            <button
              type="button"
              className="button ghost"
              onClick={() => removeNote(index)}
              style={{
                marginTop: 6,
                minHeight: 24,
                padding: "3px 7px",
                fontSize: 10.5,
              }}
            >
              Retirer
            </button>
          ) : null}
        </div>
      ))}

      <button
        type="button"
        className="button secondary"
        onClick={addNote}
        style={{
          alignSelf: "flex-start",
          minHeight: 28,
          padding: "5px 9px",
          fontSize: 11,
        }}
      >
        + Ajouter une note
      </button>
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

function PurposeMetricCard({
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
      <div className="muted" style={{ fontSize: 12 }}>
        {hint}
      </div>
    </div>
  );
}