"use client";

export type SaveIndicator = "idle" | "typing" | "saving" | "saved" | "error";

type SavePillProps = {
  state: SaveIndicator;
  savedAt: string | null;
};

type CoherenceBadgeProps = {
  status?: "coherent" | "watch" | "critical" | string | null;
};

type PillTone = "neutral" | "info" | "success" | "warning" | "danger";

type PillVisualState = {
  label: string;
  tone: PillTone;
};

function getToneStyles(tone: PillTone): {
  color: string;
  background: string;
  border: string;
} {
  if (tone === "info") {
    return {
      color: "var(--admin-accent, var(--primary))",
      background: "var(--admin-accent-soft, var(--primary-soft))",
      border: "rgba(94,106,210,0.18)",
    };
  }

  if (tone === "success") {
    return {
      color: "var(--success)",
      background: "var(--success-soft, rgba(21,128,61,0.10))",
      border: "rgba(21,128,61,0.20)",
    };
  }

  if (tone === "warning") {
    return {
      color: "var(--warning)",
      background: "var(--warning-soft, rgba(180,83,9,0.10))",
      border: "rgba(180,83,9,0.20)",
    };
  }

  if (tone === "danger") {
    return {
      color: "var(--danger)",
      background: "var(--danger-soft, rgba(198,40,40,0.10))",
      border: "rgba(198,40,40,0.20)",
    };
  }

  return {
    color: "var(--foreground-soft)",
    background: "rgba(17,24,39,0.045)",
    border: "var(--admin-border, var(--border))",
  };
}

function getSaveVisualState(state: SaveIndicator, savedAt: string | null): PillVisualState {
  if (state === "typing") {
    return {
      label: "Editing…",
      tone: "warning",
    };
  }

  if (state === "saving") {
    return {
      label: "Saving…",
      tone: "info",
    };
  }

  if (state === "saved") {
    return {
      label: savedAt ? `Saved ${savedAt}` : "Saved",
      tone: "success",
    };
  }

  if (state === "error") {
    return {
      label: "Save error",
      tone: "danger",
    };
  }

  return {
    label: "Idle",
    tone: "neutral",
  };
}

function getCoherenceVisualState(status?: string | null): PillVisualState {
  if (status === "coherent" || status === "balanced" || status === "ready") {
    return {
      label:
        status === "balanced"
          ? "Balanced"
          : status === "ready"
            ? "Ready"
            : "Coherent",
      tone: "success",
    };
  }

  if (
    status === "watch" ||
    status === "partially_coherent" ||
    status === "partially_ready" ||
    status === "dominant" ||
    status === "tension"
  ) {
    return {
      label:
        status === "partially_coherent"
          ? "Partially coherent"
          : status === "partially_ready"
            ? "Partially ready"
            : status === "dominant"
              ? "Dominant"
              : status === "tension"
                ? "Tension"
                : "Watch",
      tone: "warning",
    };
  }

  if (
    status === "critical" ||
    status === "incoherent" ||
    status === "fragmented" ||
    status === "at_risk"
  ) {
    return {
      label:
        status === "fragmented"
          ? "Fragmented"
          : status === "incoherent"
            ? "Incoherent"
            : status === "at_risk"
              ? "At risk"
              : "Critical",
      tone: "danger",
    };
  }

  if (status === "not_evaluated" || status === "not_started") {
    return {
      label: status === "not_started" ? "Not started" : "Not evaluated",
      tone: "neutral",
    };
  }

  if (status === "in_progress") {
    return {
      label: "In progress",
      tone: "info",
    };
  }

  if (status === "completed") {
    return {
      label: "Completed",
      tone: "success",
    };
  }

  return {
    label: status || "Unknown",
    tone: "neutral",
  };
}

export function SavePill({ state, savedAt }: SavePillProps) {
  const visualState = getSaveVisualState(state, savedAt);
  const toneStyles = getToneStyles(visualState.tone);

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        minHeight: 32,
        padding: "7px 10px",
        borderRadius: 999,
        border: `1px solid ${toneStyles.border}`,
        fontSize: 12,
        fontWeight: 700,
        lineHeight: 1,
        letterSpacing: "-0.01em",
        color: toneStyles.color,
        background: toneStyles.background,
        whiteSpace: "nowrap",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 6,
          height: 6,
          borderRadius: 999,
          background: toneStyles.color,
          opacity: state === "idle" ? 0.45 : 1,
          flexShrink: 0,
        }}
      />
      {visualState.label}
    </span>
  );
}

export function CoherenceBadge({ status }: CoherenceBadgeProps) {
  const visualState = getCoherenceVisualState(status);
  const toneStyles = getToneStyles(visualState.tone);

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        minHeight: 32,
        padding: "7px 10px",
        borderRadius: 999,
        border: `1px solid ${toneStyles.border}`,
        fontSize: 11,
        fontWeight: 750,
        lineHeight: 1,
        color: toneStyles.color,
        background: toneStyles.background,
        textTransform: "uppercase",
        letterSpacing: "0.035em",
        whiteSpace: "nowrap",
      }}
    >
      {visualState.label}
    </span>
  );
}