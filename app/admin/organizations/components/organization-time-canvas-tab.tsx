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
      <div
        className="row space-between"
        style={{
          gap: 12,
          flexWrap: "wrap",
          alignItems: "flex-start",
        }}
      >
        <div className="stack" style={{ gap: 4 }}>
          <div className="section-title">Time Canvas</div>
          <div className="muted">
            Capture the worker’s real execution capacity: available time, constraints, energy
            rhythm, rituals, priorities and execution risks.
          </div>
        </div>

        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
          <span className={selectedWorkerId ? "badge primary" : "badge warning"}>
            {selectedWorkerId ? `worker #${selectedWorkerId}` : "no worker selected"}
          </span>

          {timeCanvasLoaded ? (
            <span className="badge success">loaded</span>
          ) : (
            <span className="badge">not loaded</span>
          )}

          {editingTimeCanvasId ? (
            <span className="badge">canvas #{editingTimeCanvasId}</span>
          ) : timeCanvasLoaded ? (
            <span className="badge warning">new canvas</span>
          ) : null}
        </div>
      </div>

      <div
        className="card-soft stack"
        style={{
          gap: 14,
          border: "1px solid rgba(94,106,210,0.16)",
          background: "rgba(94,106,210,0.045)",
        }}
      >
        <div className="grid grid-3" style={{ alignItems: "end" }}>
          <label className="stack" style={{ gap: 6 }}>
            <span className="muted">Worker</span>
            <input
              className="input"
              value={workerDisplayValue}
              disabled
              placeholder="Select a worker above"
              style={{
                cursor: "not-allowed",
                background: "rgba(255,255,255,0.78)",
              }}
            />
          </label>

          <div className="stack" style={{ gap: 6 }}>
            <span className="muted">Execution readiness</span>

            <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
              <span className="badge primary">{timeReadinessScore}% readiness</span>
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
              {timeLoading
                ? "Loading..."
                : timeCanvasLoaded
                  ? "Reload canvas"
                  : "Load canvas"}
            </button>

            {timeCanvasLoaded ? (
              <button className="button ghost" type="button" onClick={onClearCanvas}>
                Clear canvas
              </button>
            ) : null}
          </div>
        </div>

        <div className="muted" style={{ fontSize: 13 }}>
          Time readiness helps translate coaching intentions into realistic execution windows.
          It should highlight whether the worker has the time, energy and routines needed to act.
        </div>
      </div>

      {!selectedWorkerId ? (
        <div className="card-soft stack" style={{ gap: 8 }}>
          <div className="section-title" style={{ fontSize: 15 }}>
            Worker required
          </div>
          <div className="muted">
            Select a worker from the Workers tab before opening the Time Canvas.
          </div>
        </div>
      ) : !timeCanvasLoaded ? (
        <div className="card-soft stack" style={{ gap: 8 }}>
          <div className="section-title" style={{ fontSize: 15 }}>
            Canvas not loaded
          </div>
          <div className="muted">
            Click <strong>Load canvas</strong> to open the worker’s execution-readiness workspace.
          </div>
        </div>
      ) : (
        <>
          <div
            className="card-soft"
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 14,
              flexWrap: "wrap",
              alignItems: "flex-start",
              background: "#ffffff",
            }}
          >
            <div className="stack" style={{ gap: 8, minWidth: 0 }}>
              <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                <span className="badge primary">Time Canvas</span>

                {editingTimeCanvas ? (
                  <span className="badge">existing canvas</span>
                ) : (
                  <span className="badge warning">new canvas</span>
                )}

                {editingTimeCanvasId ? (
                  <span className="badge">#{editingTimeCanvasId}</span>
                ) : null}

                <span className="badge primary">{timeReadinessScore}%</span>
                <CoherenceBadge status={timeReadinessStatus} />
              </div>

              <div className="stack" style={{ gap: 3 }}>
                <div style={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
                  Worker #{selectedWorkerId} · Execution readiness
                </div>

                <div className="muted">
                  {editingTimeCanvas
                    ? "Existing time canvas loaded."
                    : "No existing time canvas found. You are creating a new time canvas."}
                </div>

                {timeSummary ? <div className="muted">{timeSummary}</div> : null}
              </div>
            </div>

            <div
              className="row"
              style={{
                gap: 8,
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "flex-end",
              }}
            >
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

          <div style={{ minWidth: 0, overflowX: "auto" }}>{children}</div>
        </>
      )}
    </div>
  );
}