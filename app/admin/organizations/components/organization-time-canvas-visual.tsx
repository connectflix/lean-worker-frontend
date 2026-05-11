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
}> = [
  {
    key: "available_time_text",
    label: "Available Time",
    subtitle: "Temps réellement disponible pour exécuter les actions",
    placeholder: "Ex: 3 créneaux de 45 minutes par semaine, plutôt le matin...",
    tone: "blue",
  },
  {
    key: "time_constraints_text",
    label: "Time Constraints",
    subtitle: "Contraintes horaires, charge, obligations et limites",
    placeholder: "Ex: réunions longues, enfants le soir, fatigue après 18h...",
    tone: "rose",
  },
  {
    key: "time_energy_text",
    label: "Energy Rhythm",
    subtitle: "Moments d’énergie haute/basse et rythme naturel",
    placeholder: "Ex: énergie forte le matin, baisse après déjeuner...",
    tone: "amber",
  },
  {
    key: "time_rituals_text",
    label: "Execution Rituals",
    subtitle: "Rituels, habitudes et routines d’exécution",
    placeholder: "Ex: revue du lundi, bloc focus mercredi, bilan vendredi...",
    tone: "teal",
  },
  {
    key: "time_priorities_text",
    label: "Priorities",
    subtitle: "Priorités temporelles et arbitrages importants",
    placeholder: "Ex: privilégier la progression carrière avant les tâches secondaires...",
    tone: "purple",
  },
  {
    key: "time_risks_text",
    label: "Risks",
    subtitle: "Risques de décrochage, surcharge ou non-exécution",
    placeholder: "Ex: procrastination, imprévus, fatigue, manque de clarté...",
    tone: "orange",
  },
];

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

function getTimeCanvasCompletedNodes(form: TimeFormState): number {
  return TIME_NODES.reduce((count, node) => {
    const value = form[node.key] || "";
    return value.trim() ? count + 1 : count;
  }, 0);
}

function CanvasTextBlock({
  title,
  value,
  onChange,
  minHeight,
  tone,
  placeholder,
  disabled = false,
}: {
  title: string;
  value: string;
  onChange: (value: string) => void;
  minHeight: number;
  tone: CanvasTone;
  placeholder?: string;
  disabled?: boolean;
}) {
  const toneStyles = getCanvasToneStyles(tone);

  return (
    <div
      style={{
        border: `2px solid ${toneStyles.border}`,
        background: toneStyles.background,
        borderRadius: 16,
        padding: 12,
        minHeight,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        boxShadow: "0 8px 24px rgba(15,23,42,0.04)",
        opacity: disabled ? 0.72 : 1,
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: toneStyles.title,
        }}
      >
        {title}
      </div>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder || "Saisir ici..."}
        disabled={disabled}
        style={{
          width: "100%",
          flex: 1,
          minHeight: 0,
          resize: "none",
          border: "none",
          outline: "none",
          background: "transparent",
          color: "inherit",
          font: "inherit",
          fontSize: 15,
          lineHeight: 1.55,
          cursor: disabled ? "not-allowed" : "text",
        }}
      />
    </div>
  );
}

type OrganizationTimeCanvasVisualProps = {
  form: TimeFormState;
  onChange: (key: TimeNodeKey, value: string) => void;
  readinessScore: number;
  readinessStatus: string;
  summary: string;
};

export function OrganizationTimeCanvasVisual({
  form,
  onChange,
  readinessScore,
  readinessStatus,
  summary,
}: OrganizationTimeCanvasVisualProps) {
  return (
    <div className="stack" style={{ gap: 16 }}>
      <div
        className="card-soft"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(180px, 1fr))",
          gap: 12,
          alignItems: "stretch",
        }}
      >
        <div className="stack" style={{ gap: 6 }}>
          <div className="muted">Readiness score</div>
          <div className="admin-metric-value" style={{ fontSize: 30 }}>
            {readinessScore}%
          </div>
        </div>

        <div className="stack" style={{ gap: 6 }}>
          <div className="muted">Readiness status</div>
          <div>
            <CoherenceBadge status={readinessStatus} />
          </div>
        </div>

        <div className="stack" style={{ gap: 6 }}>
          <div className="muted">Filled blocks</div>
          <div className="admin-metric-value" style={{ fontSize: 30 }}>
            {getTimeCanvasCompletedNodes(form)}/{TIME_NODES.length}
          </div>
        </div>
      </div>

      <div className="card-soft stack" style={{ gap: 10 }}>
        <div className="section-title" style={{ fontSize: 15 }}>
          Time Canvas reading
        </div>
        <div className="muted">{summary}</div>
      </div>

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
            value={form[node.key]}
            onChange={(value) => onChange(node.key, value)}
            minHeight={220}
            tone={node.tone}
            placeholder={node.placeholder}
          />
        ))}
      </div>
    </div>
  );
}