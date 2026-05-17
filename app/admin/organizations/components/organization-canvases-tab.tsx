"use client";

import type { ReactNode } from "react";
import type { AdminOrganizationWorkerSummary } from "@/lib/types";

export type OrganizationCanvasTab = "engagement" | "purpose" | "time" | "significance";

type OrganizationCanvasesTabProps = {
  selectedWorkerId: number | null;
  selectedWorkerSummary: AdminOrganizationWorkerSummary | null;
  activeCanvasTab: OrganizationCanvasTab;
  onCanvasTabChange: (tab: OrganizationCanvasTab) => void;
  children: ReactNode;
};

type CanvasTabItem = {
  key: OrganizationCanvasTab;
  label: string;
  shortLabel: string;
  description: string;
};

const CANVAS_TABS: CanvasTabItem[] = [
  {
    key: "engagement",
    label: "Engagement",
    shortLabel: "Engagement",
    description: "Current and future engagement canvas.",
  },
  {
    key: "purpose",
    label: "Purpose",
    shortLabel: "Purpose",
    description: "Purpose coherence workspace.",
  },
  {
    key: "time",
    label: "Time",
    shortLabel: "Time",
    description: "Execution readiness and time constraints.",
  },
  {
    key: "significance",
    label: "Significance",
    shortLabel: "Meaning",
    description: "Meaning and significance questionnaire.",
  },
];

export function OrganizationCanvasesTab({
  selectedWorkerId,
  selectedWorkerSummary,
  activeCanvasTab,
  onCanvasTabChange,
  children,
}: OrganizationCanvasesTabProps) {
  const activeDescription =
    CANVAS_TABS.find((tab) => tab.key === activeCanvasTab)?.description ??
    "Worker canvas workspace.";

  return (
    <div className="stack" style={{ gap: 16 }}>
      <div className="card stack" style={{ gap: 14 }}>
        <div
          className="row space-between"
          style={{ gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}
        >
          <div className="stack" style={{ gap: 5, maxWidth: 760 }}>
            <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
              <span className="badge primary">Canvases</span>

              {selectedWorkerSummary?.worker ? (
                <>
                  <span className="badge">worker #{selectedWorkerSummary.worker.id}</span>
                  <span className="badge">{selectedWorkerSummary.worker.subscription_pack}</span>
                </>
              ) : selectedWorkerId ? (
                <span className="badge">worker #{selectedWorkerId}</span>
              ) : (
                <span className="badge">no worker selected</span>
              )}
            </div>

            <div className="section-title" style={{ fontSize: 20 }}>
              Worker canvases workspace
            </div>

            <div className="muted">
              Work on Engagement, Purpose, Time and Significance canvases for the selected worker.
            </div>
          </div>

          {selectedWorkerSummary?.worker ? (
            <div
              className="card-soft"
              style={{
                minWidth: 260,
                background: "#ffffff",
              }}
            >
              <div className="muted">Selected worker</div>
              <div
                style={{
                  marginTop: 5,
                  fontWeight: 750,
                  letterSpacing: "-0.03em",
                  wordBreak: "break-word",
                }}
              >
                {selectedWorkerSummary.worker.display_name}
              </div>
              <div className="muted" style={{ fontSize: 12 }}>
                {selectedWorkerSummary.worker.email || "No email"}
              </div>
            </div>
          ) : null}
        </div>

        {!selectedWorkerId ? (
          <div className="card-soft" style={{ borderColor: "rgba(180,83,9,0.22)" }}>
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
              flexDirection: "column",
              gap: 8,
              padding: 10,
              background: "var(--admin-surface-muted)",
            }}
          >
            <div
              style={{
                width: "100%",
                overflowX: "auto",
                overflowY: "hidden",
                WebkitOverflowScrolling: "touch",
                paddingBottom: 2,
              }}
            >
              <div
                role="tablist"
                aria-label="Worker canvas tabs"
                style={{
                  display: "flex",
                  gap: 6,
                  alignItems: "center",
                  flexWrap: "nowrap",
                  minWidth: "max-content",
                }}
              >
                {CANVAS_TABS.map((tab) => {
                  const isActive = activeCanvasTab === tab.key;

                  return (
                    <button
                      key={tab.key}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      className={isActive ? "button" : "button ghost"}
                      onClick={() => onCanvasTabChange(tab.key)}
                      title={tab.description}
                      style={{
                        minHeight: 36,
                        borderRadius: 999,
                        padding: "8px 13px",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                        fontSize: 13,
                        fontWeight: isActive ? 700 : 600,
                        letterSpacing: "-0.01em",
                        boxShadow: "none",
                      }}
                    >
                      <span className="canvas-tab-label-full">{tab.label}</span>
                      <span className="canvas-tab-label-short">{tab.shortLabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="muted" style={{ fontSize: 12, lineHeight: 1.45, padding: "0 4px" }}>
              {activeDescription}
            </div>
          </div>
        ) : null}
      </div>

      {selectedWorkerId ? children : null}

      <style jsx>{`
        .canvas-tab-label-short {
          display: none;
        }

        @media (max-width: 720px) {
          .canvas-tab-label-full {
            display: none;
          }

          .canvas-tab-label-short {
            display: inline;
          }
        }
      `}</style>
    </div>
  );
}