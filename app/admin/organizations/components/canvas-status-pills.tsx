"use client";

export type SaveIndicator = "idle" | "typing" | "saving" | "saved" | "error";

type SavePillProps = {
  state: SaveIndicator;
  savedAt: string | null;
};

type CoherenceBadgeProps = {
  status?: "coherent" | "watch" | "critical" | string | null;
};

export function SavePill({ state, savedAt }: SavePillProps) {
  let label = "Idle";
  let color = "var(--muted-foreground, #64748b)";
  let background = "rgba(100,116,139,0.12)";

  if (state === "typing") {
    label = "Editing…";
    color = "#92400e";
    background = "rgba(245,158,11,0.14)";
  } else if (state === "saving") {
    label = "Saving…";
    color = "#1d4ed8";
    background = "rgba(59,130,246,0.14)";
  } else if (state === "saved") {
    label = savedAt ? `Saved ${savedAt}` : "Saved";
    color = "#15803d";
    background = "rgba(34,197,94,0.14)";
  } else if (state === "error") {
    label = "Save error";
    color = "#b91c1c";
    background = "rgba(239,68,68,0.14)";
  }

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "8px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        color,
        background,
      }}
    >
      {label}
    </span>
  );
}

export function CoherenceBadge({ status }: CoherenceBadgeProps) {
  let label = status || "unknown";
  let color = "#475569";
  let background = "rgba(100,116,139,0.14)";

  if (status === "coherent" || status === "balanced" || status === "ready") {
    label =
      status === "balanced"
        ? "Balanced"
        : status === "ready"
          ? "Ready"
          : "Coherent";
    color = "#15803d";
    background = "rgba(34,197,94,0.14)";
  } else if (
    status === "watch" ||
    status === "partially_coherent" ||
    status === "partially_ready" ||
    status === "dominant" ||
    status === "tension"
  ) {
    label =
      status === "partially_coherent"
        ? "Partially coherent"
        : status === "partially_ready"
          ? "Partially ready"
          : status === "dominant"
            ? "Dominant"
            : status === "tension"
              ? "Tension"
              : "Watch";
    color = "#b45309";
    background = "rgba(245,158,11,0.14)";
  } else if (
    status === "critical" ||
    status === "incoherent" ||
    status === "fragmented" ||
    status === "at_risk"
  ) {
    label =
      status === "fragmented"
        ? "Fragmented"
        : status === "incoherent"
          ? "Incoherent"
          : status === "at_risk"
            ? "At risk"
            : "Critical";
    color = "#b91c1c";
    background = "rgba(239,68,68,0.14)";
  } else if (status === "not_evaluated") {
    label = "Not evaluated";
    color = "#64748b";
    background = "rgba(100,116,139,0.14)";
  }

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "8px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 800,
        color,
        background,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
      }}
    >
      {label}
    </span>
  );
}