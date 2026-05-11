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
  const incoherentRelations = relations.filter((relation) => relation.status === "incoherent").length;

  function getNodePosition(key: PurposeNodeKey) {
    return PURPOSE_NODES.find((node) => node.key === key) ?? PURPOSE_NODES[0];
  }

  function getLineColor(status: PurposeRelationStatus): string {
    if (status === "coherent") return "#2563eb";
    if (status === "incoherent") return "#dc2626";
    return "rgba(100,116,139,0.25)";
  }

  return (
    <div className="stack" style={{ gap: 16 }}>
      <div
        className="card-soft"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(160px, 1fr))",
          gap: 12,
          alignItems: "stretch",
        }}
      >
        <div className="stack" style={{ gap: 6 }}>
          <div className="muted">Global coherence</div>
          <div className="admin-metric-value" style={{ fontSize: 30 }}>
            {coherenceScore}%
          </div>
        </div>

        <div className="stack" style={{ gap: 6 }}>
          <div className="muted">Completed relations</div>
          <div className="admin-metric-value" style={{ fontSize: 30 }}>
            {completedRelations}/15
          </div>
        </div>

        <div className="stack" style={{ gap: 6 }}>
          <div className="muted">Coherent links</div>
          <div className="admin-metric-value" style={{ fontSize: 30, color: "#2563eb" }}>
            {coherentRelations}
          </div>
        </div>

        <div className="stack" style={{ gap: 6 }}>
          <div className="muted">Incoherent links</div>
          <div className="admin-metric-value" style={{ fontSize: 30, color: "#dc2626" }}>
            {incoherentRelations}
          </div>
        </div>
      </div>

      <div
        className="card-soft"
        style={{
          position: "relative",
          minHeight: 860,
          overflow: "hidden",
          border: "1px solid rgba(59,130,246,0.2)",
          background:
            "radial-gradient(circle at center, rgba(59,130,246,0.08), rgba(255,255,255,0.02) 55%)",
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
                stroke={getLineColor(relation.status)}
                strokeWidth={relation.status === "pending" ? 0.35 : 0.7}
                strokeDasharray={relation.status === "pending" ? "2 2" : "0"}
                opacity={relation.status === "pending" ? 0.55 : 0.9}
              />
            );
          })}
        </svg>

        {PURPOSE_NODES.map((node) => {
          const toneStyles = getCanvasToneStyles(node.tone);

          return (
            <div
              key={node.key}
              style={{
                position: "absolute",
                left: `${node.x}%`,
                top: `${node.y}%`,
                transform: "translate(-50%, -50%)",
                zIndex: 2,
                width: 250,
                minHeight: 150,
                borderRadius: 22,
                border: `2px solid ${toneStyles.border}`,
                background: "rgba(255,255,255,0.94)",
                boxShadow: "0 16px 36px rgba(15,23,42,0.13)",
                padding: 14,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div className="stack" style={{ gap: 2 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: toneStyles.title,
                  }}
                >
                  {node.label}
                </div>

                <div className="muted" style={{ fontSize: 12 }}>
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
                  minHeight: 74,
                  border: "1px solid var(--border)",
                  borderRadius: 14,
                  padding: 10,
                  resize: "vertical",
                  outline: "none",
                  font: "inherit",
                  fontSize: 13,
                  lineHeight: 1.45,
                  background: toneStyles.background,
                }}
              />
            </div>
          );
        })}
      </div>

      <div className="card-soft stack" style={{ gap: 10 }}>
        <div className="section-title" style={{ fontSize: 15 }}>
          Relation details
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
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
                  borderRadius: 12,
                  border:
                    relation.status === "coherent"
                      ? "1px solid rgba(37,99,235,0.3)"
                      : relation.status === "incoherent"
                        ? "1px solid rgba(220,38,38,0.3)"
                        : "1px solid var(--border)",
                  padding: 10,
                  background:
                    relation.status === "coherent"
                      ? "rgba(37,99,235,0.07)"
                      : relation.status === "incoherent"
                        ? "rgba(220,38,38,0.07)"
                        : "rgba(100,116,139,0.06)",
                }}
              >
                <div style={{ fontWeight: 800, fontSize: 13 }}>
                  {from.label} ↔ {to.label}
                </div>

                <div className="muted">
                  {relation.status === "coherent"
                    ? "Coherent"
                    : relation.status === "incoherent"
                      ? "Incoherent"
                      : "Pending"}
                </div>

                <div className="muted" style={{ fontSize: 12 }}>
                  {relation.reason}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}