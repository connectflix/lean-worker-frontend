"use client";

import { BrainIcon, BadgePill, SparkIcon } from "@/components/ui-flat-icons";

export function SessionSummaryCard({ summary }: { summary: string }) {
  return (
    <div className="card stack">
      <div className="row space-between" style={{ alignItems: "center", gap: 12 }}>
        <div className="row" style={{ gap: 8, alignItems: "center" }}>
          <BrainIcon />
          <div className="section-title" style={{ margin: 0 }}>
            Session summary
          </div>
        </div>

        <BadgePill icon={<SparkIcon size={14} />}>AI synthesis</BadgePill>
      </div>

      <div
        className="card-soft"
        style={{
          whiteSpace: "pre-wrap",
          lineHeight: 1.7,
        }}
      >
        {summary}
      </div>
    </div>
  );
}