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
    label: "Available Time",
    subtitle: "Temps réellement disponible pour exécuter les actions",
    placeholder: "Ex: 3 créneaux de 45 minutes par semaine, plutôt le matin...",
    tone: "blue",
    metricLabel: "Availability",
  },
  {
    key: "time_constraints_text",
    label: "Time Constraints",
    subtitle: "Contraintes horaires, charge, obligations et limites",
    placeholder: "Ex: réunions longues, enfants le soir, fatigue après 18h...",
    tone: "rose",
    metricLabel: "Constraints",
  },
  {
    key: "time_energy_text",
    label: "Energy Rhythm",
    subtitle: "Moments d’énergie haute/basse et rythme naturel",
    placeholder: "Ex: énergie forte le matin, baisse après déjeuner...",
    tone: "amber",
    metricLabel: "Energy",
  },
  {
    key: "time_rituals_text",
    label: "Execution Rituals",
    subtitle: "Rituels, habitudes et routines d’exécution",
    placeholder: "Ex: revue du lundi, bloc focus mercredi, bilan vendredi...",
    tone: "teal",
    metricLabel: "Rituals",
  },
  {
    key: "time_priorities_text",
    label: "Priorities",
    subtitle: "Priorités temporelles et arbitrages importants",
    placeholder: "Ex: privilégier la progression carrière avant les tâches secondaires...",
    tone: "purple",
    metricLabel: "Priorities",
  },
  {
    key: "time_risks_text",
    label: "Risks",
    subtitle: "Risques de décrochage, surcharge ou non-exécution",
    placeholder: "Ex: procrastination, imprévus, fatigue, manque de clarté...",
    tone: "orange",
    metricLabel: "Risks",
  },
];

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

function CanvasTextBlock({
  title,
  subtitle,
  value,
  onChange,
  tone,
  placeholder,
  disabled = false,
}: {
  title: string;
  subtitle: string;
  value: string;
  onChange: (value: string) => void;
  tone: CanvasTone;
  placeholder?: string;
  disabled?: boolean;
}) {
  const toneStyles = getCanvasToneStyles(tone);
  const isFilled = Boolean(value.trim());

  return (
    <div
      style={{
        border: `1px solid ${isFilled ? toneStyles.border : "var(--admin-border)"}`,
        background: isFilled ? "rgba(255,255,255,0.96)" : "rgba(255,255,255,0.74)",
        borderRadius: 20,
        padding: 14,
        minHeight: 250,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        opacity: disabled ? 0.72 : 1,
      }}
    >
      <div className="stack" style={{ gap: 6 }}>
        <div
          className="row space-between"
          style={{
            gap: 8,
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              fontSize: 15,
              fontWeight: 750,
              letterSpacing: "-0.025em",
              color: toneStyles.title,
            }}
          >
            {title}
          </div>

          <span
            className={isFilled ? "badge primary" : "badge"}
            style={{
              fontSize: 11,
              padding: "5px 8px",
            }}
          >
            {isFilled ? "filled" : "empty"}
          </span>
        </div>

        <div
          className="muted"
          style={{
            fontSize: 12,
            lineHeight: 1.45,
          }}
        >
          {subtitle}
        </div>
      </div>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder || "Saisir ici..."}
        disabled={disabled}
        style={{
          width: "100%",
          flex: 1,
          minHeight: 150,
          maxHeight: 260,
          resize: "vertical",
          border: `1px solid ${toneStyles.border}`,
          borderRadius: 14,
          outline: "none",
          background: toneStyles.surface,
          color: "var(--foreground)",
          font: "inherit",
          fontSize: 13,
          lineHeight: 1.55,
          padding: 12,
          cursor: disabled ? "not-allowed" : "text",
          overflowY: "auto",
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
  const completedNodes = getTimeCanvasCompletedNodes(form);
  const emptyNodes = TIME_NODES.length - completedNodes;
  const filledNodeLabels = getFilledNodeLabels(form);
  const emptyNodeLabels = getEmptyNodeLabels(form);
  const readinessEmphasis = getReadinessEmphasis(readinessScore);

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
            label="Readiness score"
            value={`${readinessScore}%`}
            hint="Execution readiness"
            emphasis={readinessEmphasis}
          />

          <TimeMetricCard
            label="Filled blocks"
            value={`${completedNodes}/${TIME_NODES.length}`}
            hint={`${emptyNodes} block(s) still empty`}
            emphasis={completedNodes === TIME_NODES.length ? "success" : "neutral"}
          />

          <TimeMetricCard
            label="Execution anchors"
            value={String(filledNodeLabels.length)}
            hint={filledNodeLabels.length > 0 ? filledNodeLabels.join(" · ") : "No signal yet"}
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
            <div className="muted">Readiness status</div>

            <div>
              <CoherenceBadge status={readinessStatus} />
            </div>

            <div className="muted" style={{ fontSize: 12 }}>
              Status computed from completed execution signals.
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
              Time Canvas reading
            </div>

            <div className="muted">
              Consolidated view of the worker’s real execution capacity.
            </div>
          </div>

          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            <span className={completedNodes > 0 ? "badge primary" : "badge"}>
              {completedNodes} filled
            </span>
            <span className={emptyNodes > 0 ? "badge warning" : "badge success"}>
              {emptyNodes} missing
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
            {summary || "No Time Canvas summary available yet."}
          </div>
        </div>

        {emptyNodeLabels.length > 0 ? (
          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            <span className="muted" style={{ fontSize: 12 }}>
              Missing signals:
            </span>

            {emptyNodeLabels.map((label) => (
              <span key={label} className="badge">
                {label}
              </span>
            ))}
          </div>
        ) : (
          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            <span className="badge success">All execution signals captured</span>
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