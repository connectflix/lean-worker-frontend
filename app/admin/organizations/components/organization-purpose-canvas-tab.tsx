"use client";

import type { ReactNode } from "react";
import {
  CoherenceBadge,
  SavePill,
  type SaveIndicator,
} from "./canvas-status-pills";
import type { AdminWorkerPurposeCanvas } from "@/lib/types";

type OrganizationPurposeCanvasTabProps = {
  selectedWorkerId: number | null;
  workerDisplayValue: string;

  purposeCanvasLoaded: boolean;
  purposeLoading: boolean;
  purposeSaving: boolean;

  editingPurposeCanvas: AdminWorkerPurposeCanvas | null;
  editingPurposeCanvasId: number | null;

  purposeSaveState: SaveIndicator;
  purposeLastSavedAtLabel: string | null;

  onLoadCanvas: () => void;
  onClearCanvas: () => void;
  onSaveCanvas: () => void;

  children: ReactNode;
};

export function OrganizationPurposeCanvasTab({
  selectedWorkerId,
  workerDisplayValue,
  purposeCanvasLoaded,
  purposeLoading,
  purposeSaving,
  editingPurposeCanvas,
  editingPurposeCanvasId,
  purposeSaveState,
  purposeLastSavedAtLabel,
  onLoadCanvas,
  onClearCanvas,
  onSaveCanvas,
  children,
}: OrganizationPurposeCanvasTabProps) {
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
          <div className="section-title">Purpose Workspace</div>
          <div className="muted">
            Clarify the worker’s purpose signals and evaluate coherence between work,
            aspiration, inspiration, passion, vocation and learning needs.
          </div>
        </div>

        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
          <span className={selectedWorkerId ? "badge primary" : "badge warning"}>
            {selectedWorkerId ? `worker #${selectedWorkerId}` : "no worker selected"}
          </span>

          {purposeCanvasLoaded ? (
            <span className="badge success">loaded</span>
          ) : (
            <span className="badge">not loaded</span>
          )}

          {editingPurposeCanvasId ? (
            <span className="badge">canvas #{editingPurposeCanvasId}</span>
          ) : purposeCanvasLoaded ? (
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
            <span className="muted">Canvas rule</span>

            <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
              <span className="badge primary">coherent</span>
              <span className="badge danger">incoherent</span>
              <span className="badge">pending</span>
            </div>
          </div>

          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            <button
              className="button"
              type="button"
              onClick={onLoadCanvas}
              disabled={!selectedWorkerId || purposeLoading}
            >
              {purposeLoading
                ? "Loading..."
                : purposeCanvasLoaded
                  ? "Reload canvas"
                  : "Load canvas"}
            </button>

            {purposeCanvasLoaded ? (
              <button className="button ghost" type="button" onClick={onClearCanvas}>
                Clear canvas
              </button>
            ) : null}
          </div>
        </div>

        <div className="muted" style={{ fontSize: 13 }}>
          The canvas computes simple coherence links between the six purpose nodes. Use it as a
          structured reading aid, not as a final diagnosis.
        </div>
      </div>

      {!selectedWorkerId ? (
        <div className="card-soft stack" style={{ gap: 8 }}>
          <div className="section-title" style={{ fontSize: 15 }}>
            Worker required
          </div>
          <div className="muted">
            Select a worker from the Workers tab before opening the Purpose Canvas.
          </div>
        </div>
      ) : !purposeCanvasLoaded ? (
        <div className="card-soft stack" style={{ gap: 8 }}>
          <div className="section-title" style={{ fontSize: 15 }}>
            Canvas not loaded
          </div>
          <div className="muted">
            Click <strong>Load canvas</strong> to open the worker’s purpose workspace.
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
                <span className="badge primary">Purpose Canvas</span>

                {editingPurposeCanvas ? (
                  <span className="badge">existing canvas</span>
                ) : (
                  <span className="badge warning">new canvas</span>
                )}

                {editingPurposeCanvasId ? (
                  <span className="badge">#{editingPurposeCanvasId}</span>
                ) : null}
              </div>

              <div className="stack" style={{ gap: 3 }}>
                <div style={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
                  Worker #{selectedWorkerId} · Purpose coherence
                </div>

                <div className="muted">
                  {editingPurposeCanvas
                    ? "Existing purpose canvas loaded."
                    : "No existing purpose canvas found. You are creating a new purpose canvas."}
                </div>

                {editingPurposeCanvas?.coherence_summary ? (
                  <div className="muted">{editingPurposeCanvas.coherence_summary}</div>
                ) : null}
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
              <SavePill state={purposeSaveState} savedAt={purposeLastSavedAtLabel} />
              <CoherenceBadge status={editingPurposeCanvas?.coherence_status} />

              <button
                className="button"
                type="button"
                onClick={onSaveCanvas}
                disabled={purposeSaving}
              >
                {purposeSaving ? "Saving..." : editingPurposeCanvasId ? "Save" : "Create"}
              </button>
            </div>
          </div>

          <div style={{ minWidth: 0, overflowX: "auto" }}>{children}</div>
        </>
      )}
    </div>
  );
}