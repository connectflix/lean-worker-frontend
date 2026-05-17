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
}> = [
  {
    key: "travail_text",
    label: "Travail",
    subtitle: "Ce que le worker fait, produit ou porte concrètement",
    placeholder: "Phrase courte sur le travail réel, le rôle ou l’activité portée...",
    tone: "blue",
    x: 50,
    y: 10,
  },
  {
    key: "aspiration_text",
    label: "Aspiration",
    subtitle: "Ce vers quoi le worker souhaite évoluer",
    placeholder: "Phrase courte sur l’aspiration professionnelle ou personnelle...",
    tone: "purple",
    x: 85,
    y: 32,
  },
  {
    key: "inspiration_text",
    label: "Inspiration",
    subtitle: "Ce qui nourrit, influence ou élève sa trajectoire",
    placeholder: "Phrase courte sur ce qui inspire le worker...",
    tone: "teal",
    x: 85,
    y: 72,
  },
  {
    key: "passion_text",
    label: "Passion",
    subtitle: "Ce qui donne de l’énergie et de l’élan",
    placeholder: "Phrase courte sur ce qui donne de l’énergie...",
    tone: "orange",
    x: 50,
    y: 90,
  },
  {
    key: "vocation_text",
    label: "Vocation",
    subtitle: "La contribution profonde que le worker sent devoir porter",
    placeholder: "Phrase courte sur la vocation ou la contribution profonde...",
    tone: "green",
    x: 15,
    y: 72,
  },
  {
    key: "formation_text",
    label: "Formation",
    subtitle: "Ce qu’il faut apprendre, renforcer ou développer",
    placeholder: "Phrase courte sur les apprentissages ou développements nécessaires...",
    tone: "rose",
    x: 15,
    y: 32,
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

type OrganizationPurposeCanvasVisualProps = {
  form: PurposeFormState;
  onChange: (key: PurposeNodeKey, value: string) => void;
};

export function OrganizationPurposeCanvasVisual({
  form,
  onChange,
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

  return (
    <div className="stack" style={{ gap: 16, minWidth: 0 }}>
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

      <div
        className="card-soft"
        style={{
          minWidth: 0,
          overflowX: "auto",
          overflowY: "hidden",
          padding: 12,
          background: "rgba(255,255,255,0.72)",
        }}
      >
        <div
          style={{
            position: "relative",
            minWidth: 1080,
            minHeight: 820,
            overflow: "hidden",
            borderRadius: 24,
            border: "1px solid rgba(17,24,39,0.10)",
            background:
              "radial-gradient(circle at center, rgba(94,106,210,0.08), rgba(255,255,255,0.98) 56%)",
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

              return (
                <line
                  key={`${relation.from}-${relation.to}`}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={getRelationColor(relation.status)}
                  strokeWidth={relation.status === "pending" ? 0.28 : 0.58}
                  strokeDasharray={relation.status === "pending" ? "2 2" : "0"}
                  opacity={relation.status === "pending" ? 0.5 : 0.88}
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
              width: 190,
              height: 190,
              borderRadius: 999,
              border: "1px solid rgba(94,106,210,0.16)",
              background: "rgba(255,255,255,0.54)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: 20,
            }}
          >
            <div className="stack" style={{ gap: 6, alignItems: "center" }}>
              <div
                style={{
                  fontSize: 34,
                  lineHeight: 1,
                  fontWeight: 750,
                  letterSpacing: "-0.045em",
                  color: "var(--foreground)",
                }}
              >
                {coherenceScore}%
              </div>
              <div className="muted" style={{ fontSize: 12 }}>
                Purpose coherence
              </div>
            </div>
          </div>

          {PURPOSE_NODES.map((node) => {
            const toneStyles = getCanvasToneStyles(node.tone);
            const hasValue = Boolean(form[node.key].trim());

            return (
              <div
                key={node.key}
                style={{
                  position: "absolute",
                  left: `${node.x}%`,
                  top: `${node.y}%`,
                  transform: "translate(-50%, -50%)",
                  zIndex: 2,
                  width: 270,
                  minHeight: 168,
                  borderRadius: 22,
                  border: `1px solid ${hasValue ? toneStyles.border : "rgba(17,24,39,0.10)"}`,
                  background: "rgba(255,255,255,0.94)",
                  padding: 14,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div className="stack" style={{ gap: 4 }}>
                  <div
                    className="row space-between"
                    style={{ gap: 8, alignItems: "flex-start" }}
                  >
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 750,
                        letterSpacing: "-0.025em",
                        color: toneStyles.title,
                      }}
                    >
                      {node.label}
                    </div>

                    <span
                      className={hasValue ? "badge primary" : "badge"}
                      style={{
                        fontSize: 11,
                        padding: "5px 8px",
                      }}
                    >
                      {hasValue ? "filled" : "empty"}
                    </span>
                  </div>

                  <div
                    className="muted"
                    style={{
                      fontSize: 12,
                      lineHeight: 1.45,
                    }}
                  >
                    {node.subtitle}
                  </div>
                </div>

                <textarea
                  value={form[node.key]}
                  onChange={(event) => onChange(node.key, event.target.value)}
                  placeholder={node.placeholder}
                  style={{
                    width: "100%",
                    flex: 1,
                    minHeight: 86,
                    maxHeight: 148,
                    border: `1px solid ${toneStyles.border}`,
                    borderRadius: 14,
                    padding: 10,
                    resize: "vertical",
                    outline: "none",
                    font: "inherit",
                    fontSize: 13,
                    lineHeight: 1.5,
                    background: toneStyles.surface,
                    color: "var(--foreground)",
                    overflowY: "auto",
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

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

        <div
          className="scroll-panel"
          style={{
            maxHeight: 420,
            paddingRight: 6,
          }}
        >
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
                        style={{
                          fontSize: 11,
                          padding: "5px 8px",
                        }}
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