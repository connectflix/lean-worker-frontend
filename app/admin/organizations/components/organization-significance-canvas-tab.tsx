"use client";

import type { ReactNode } from "react";
import { SavePill, type SaveIndicator } from "./canvas-status-pills";
import type { AdminWorkerSignificanceCanvas } from "@/lib/types";

type OrganizationSignificanceCanvasTabProps = {
  selectedWorkerId: number | null;
  workerDisplayValue: string;

  significanceCanvasLoaded: boolean;
  significanceLoading: boolean;
  significanceSaving: boolean;

  editingSignificanceCanvas: AdminWorkerSignificanceCanvas | null;
  editingSignificanceCanvasId: number | null;

  significanceSaveState: SaveIndicator;
  significanceLastSavedAtLabel: string | null;

  onLoadCanvas: () => void;
  onClearCanvas: () => void;
  onSaveCanvas: () => void;

  children: ReactNode;
};

export function OrganizationSignificanceCanvasTab({
  selectedWorkerId,
  workerDisplayValue,
  significanceCanvasLoaded,
  significanceLoading,
  significanceSaving,
  editingSignificanceCanvas,
  editingSignificanceCanvasId,
  significanceSaveState,
  significanceLastSavedAtLabel,
  onLoadCanvas,
  onClearCanvas,
  onSaveCanvas,
  children,
}: OrganizationSignificanceCanvasTabProps) {
  return (
    <div className="card stack" style={{ gap: 16, minWidth: 0 }}>
      <div className="section-title">Significance Canvas</div>

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
            <div className="muted">Each answer contributes to a deterministic score.</div>
          </div>

          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            <button
              className="button"
              type="button"
              onClick={onLoadCanvas}
              disabled={!selectedWorkerId || significanceLoading}
            >
              {significanceLoading ? "Loading..." : "Load canvas"}
            </button>

            {significanceCanvasLoaded ? (
              <button className="button ghost" type="button" onClick={onClearCanvas}>
                Clear canvas
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {!selectedWorkerId ? (
        <div className="card-soft">
          <div className="muted">
            Select a worker above to work on the Significance Canvas.
          </div>
        </div>
      ) : !significanceCanvasLoaded ? (
        <div className="card-soft">
          <div className="muted">
            No significance canvas displayed yet. Select a worker and click{" "}
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
                {editingSignificanceCanvas
                  ? "Existing significance canvas loaded."
                  : "No existing significance canvas found. You are creating a new one."}
              </div>
            </div>

            <div className="row" style={{ gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <SavePill
                state={significanceSaveState}
                savedAt={significanceLastSavedAtLabel}
              />

              <button
                className="button"
                type="button"
                onClick={onSaveCanvas}
                disabled={significanceSaving}
              >
                {significanceSaving
                  ? "Saving..."
                  : editingSignificanceCanvasId
                    ? "Save"
                    : "Create"}
              </button>
            </div>
          </div>

          {children}
        </>
      )}
    </div>
  );
}