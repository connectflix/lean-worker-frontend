"use client";

import type { ReactNode } from "react";
import type { AdminOrganizationWorkerSummary } from "@/lib/types";

export type OrganizationCanvasTab =
  | "engagement"
  | "purpose"
  | "time"
  | "significance";

type OrganizationCanvasesTabProps = {
  selectedWorkerId: number | null;
  selectedWorkerSummary: AdminOrganizationWorkerSummary | null;
  activeCanvasTab: OrganizationCanvasTab;
  onCanvasTabChange: (tab: OrganizationCanvasTab) => void;
  children: ReactNode;
};

export function OrganizationCanvasesTab({
  selectedWorkerId,
  selectedWorkerSummary,
  activeCanvasTab,
  onCanvasTabChange,
  children,
}: OrganizationCanvasesTabProps) {
  const canvasTabs: Array<{
    key: OrganizationCanvasTab;
    label: string;
    description: string;
  }> = [
    {
      key: "engagement",
      label: "Engagement",
      description: "Current and future engagement canvas.",
    },
    {
      key: "purpose",
      label: "Purpose",
      description: "Purpose coherence workspace.",
    },
    {
      key: "time",
      label: "Time",
      description: "Execution readiness and time constraints.",
    },
    {
      key: "significance",
      label: "Significance",
      description: "Meaning and significance questionnaire.",
    },
  ];

  return (
    <div className="stack" style={{ gap: 16 }}>
      <div
        className="card-soft stack"
        style={{
          gap: 12,
          border: "1px solid rgba(59,130,246,0.22)",
          background:
            "linear-gradient(135deg, rgba(59,130,246,0.07), rgba(255,255,255,0.94))",
        }}
      >
        <div className="row space-between" style={{ gap: 12, flexWrap: "wrap" }}>
          <div className="stack" style={{ gap: 4 }}>
            <div className="section-title">Worker canvases workspace</div>
            <div className="muted">
              Work on Engagement, Purpose, Time and Significance canvases for the selected worker.
            </div>
          </div>

          {selectedWorkerSummary?.worker ? (
            <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
              <span className="badge">worker #{selectedWorkerSummary.worker.id}</span>
              <span className="badge">{selectedWorkerSummary.worker.display_name}</span>
              <span className="badge">{selectedWorkerSummary.worker.subscription_pack}</span>
            </div>
          ) : selectedWorkerId ? (
            <span className="badge">worker #{selectedWorkerId}</span>
          ) : (
            <span className="badge">no worker selected</span>
          )}
        </div>

        {!selectedWorkerId ? (
          <div
            className="card-soft"
            style={{
              border: "1px solid rgba(245,158,11,0.28)",
              background: "rgba(245,158,11,0.08)",
            }}
          >
            <div className="muted">
              Select a worker from the Workers tab before opening or editing canvases.
            </div>
          </div>
        ) : null}

        {selectedWorkerId ? (
          <div
            className="card-soft"
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              alignItems: "center",
              background: "rgba(255,255,255,0.7)",
            }}
          >
            {canvasTabs.map((tab) => {
              const isActive = activeCanvasTab === tab.key;

              return (
                <button
                  key={tab.key}
                  type="button"
                  className={isActive ? "button" : "button ghost"}
                  onClick={() => onCanvasTabChange(tab.key)}
                  title={tab.description}
                  style={{
                    borderRadius: 999,
                    whiteSpace: "nowrap",
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {selectedWorkerId ? children : null}
    </div>
  );
}