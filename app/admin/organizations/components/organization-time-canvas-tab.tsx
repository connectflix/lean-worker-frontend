"use client";

import type { ReactNode } from "react";
import {
  CoherenceBadge,
  SavePill,
  type SaveIndicator,
} from "./canvas-status-pills";
import type { AdminWorkerTimeCanvas } from "@/lib/types";


type OrganizationTimeCanvasTabProps = {
  selectedWorkerId: number | null;
  workerDisplayValue: string;

  timeCanvasLoaded: boolean;
  timeLoading: boolean;
  timeSaving: boolean;

  editingTimeCanvas: AdminWorkerTimeCanvas | null;
  editingTimeCanvasId: number | null;

  timeSaveState: SaveIndicator;
  timeLastSavedAtLabel: string | null;

  timeReadinessScore: number;
  timeReadinessStatus: string;
  timeSummary: string;

  onLoadCanvas: () => void;
  onClearCanvas: () => void;
  onSaveCanvas: () => void;

  children: ReactNode;
};

export function OrganizationTimeCanvasTab({
  selectedWorkerId,
  workerDisplayValue,
  timeCanvasLoaded,
  timeLoading,
  timeSaving,
  editingTimeCanvas,
  editingTimeCanvasId,
  timeSaveState,
  timeLastSavedAtLabel,
  timeReadinessScore,
  timeReadinessStatus,
  timeSummary,
  onLoadCanvas,
  onClearCanvas,
  onSaveCanvas,
  children,
}: OrganizationTimeCanvasTabProps) {
  return (
    <div className="card stack" style={{ gap: 16, minWidth: 0 }}>
      <div className="section-title">Time Canvas</div>

      <div className="muted">
        Capture available time, constraints, energy rhythm, rituals, priorities and execution
        risks.
      </div>

      <div className="card-soft stack" style={{ gap: 12 }}>
        <div className="grid grid-3" style={{ alignItems: "end" }}>
          <label className="stack">
            <strong>Worker</strong>
            <input
              className="input"
              value={workerDisplayValue}
              disabled
              placeholder="Select a worker above"
            />
          </label>

          <div className="stack">
            <strong>Readiness</strong>
            <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
              <span className="badge">{timeReadinessScore}%</span>
              <CoherenceBadge status={timeReadinessStatus} />
            </div>
          </div>

          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            <button
              className="button"
              type="button"
              onClick={onLoadCanvas}
              disabled={!selectedWorkerId || timeLoading}
            >
              {timeLoading ? "Loading..." : "Load canvas"}
            </button>

            {timeCanvasLoaded ? (
              <button className="button ghost" type="button" onClick={onClearCanvas}>
                Clear canvas
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {!selectedWorkerId ? (
        <div className="card-soft">
          <div className="muted">Select a worker above to work on the Time Canvas.</div>
        </div>
      ) : !timeCanvasLoaded ? (
        <div className="card-soft">
          <div className="muted">
            No time canvas displayed yet. Select a worker and click{" "}
            <strong>Load canvas</strong>.
          </div>
        </div>
      ) : (
        <>
          <div
            className="row space-between"
            style={{ gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}
          >
            <div className="stack" style={{ gap: 4 }}>
              <div className="muted">Worker #{selectedWorkerId}</div>

              <div className="muted">
                {editingTimeCanvas
                  ? "Existing time canvas loaded."
                  : "No existing time canvas found. You are creating a new one."}
              </div>

              <div className="muted">{timeSummary}</div>
            </div>

            <div className="row" style={{ gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <SavePill state={timeSaveState} savedAt={timeLastSavedAtLabel} />

              <button
                className="button"
                type="button"
                onClick={onSaveCanvas}
                disabled={timeSaving}
              >
                {timeSaving ? "Saving..." : editingTimeCanvasId ? "Save" : "Create"}
              </button>
            </div>
          </div>

          {children}
        </>
      )}
    </div>
  );
}