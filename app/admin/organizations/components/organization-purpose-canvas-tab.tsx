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
      <div className="section-title">Purpose Workspace</div>

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
            <strong>Canvas rule</strong>
            <div className="muted">
              Blue = coherent relation · Red = incoherent relation · Grey = pending
            </div>
          </div>

          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            <button
              className="button"
              type="button"
              onClick={onLoadCanvas}
              disabled={!selectedWorkerId || purposeLoading}
            >
              {purposeLoading ? "Loading..." : "Load canvas"}
            </button>

            {purposeCanvasLoaded ? (
              <button className="button ghost" type="button" onClick={onClearCanvas}>
                Clear canvas
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {!selectedWorkerId ? (
        <div className="card-soft">
          <div className="muted">Select a worker above to work on the Purpose Canvas.</div>
        </div>
      ) : !purposeCanvasLoaded ? (
        <div className="card-soft">
          <div className="muted">
            No purpose canvas displayed yet. Select a worker and click{" "}
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
                {editingPurposeCanvas
                  ? "Existing purpose canvas loaded."
                  : "No existing purpose canvas found. You are creating a new one."}
              </div>

              {editingPurposeCanvas?.coherence_summary ? (
                <div className="muted">{editingPurposeCanvas.coherence_summary}</div>
              ) : null}
            </div>

            <div className="row" style={{ gap: 8, flexWrap: "wrap", alignItems: "center" }}>
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

          {children}
        </>
      )}
    </div>
  );
}