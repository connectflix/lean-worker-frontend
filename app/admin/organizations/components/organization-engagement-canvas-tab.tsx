"use client";

import type { ReactNode } from "react";
import {
  CoherenceBadge,
  SavePill,
  type SaveIndicator,
} from "./canvas-status-pills";
import type {
  AdminWorkerEngagement,
  AdminWorkerEngagementState,
} from "@/lib/types";


type OrganizationEngagementCanvasTabProps = {
  selectedWorkerId: number | null;
  workerDisplayValue: string;

  engagementSelectionState: AdminWorkerEngagementState;
  engagementCanvasLoaded: boolean;
  engagementsLoading: boolean;

  editingEngagement: AdminWorkerEngagement | null;
  editingEngagementId: number | null;

  engagementSaveState: SaveIndicator;
  lastSavedAtLabel: string | null;

  engagementSaving: boolean;
  engagementFinalizing: boolean;
  isFutureStateLocked: boolean;

  onStateChange: (state: AdminWorkerEngagementState) => void;
  onLoadCanvas: () => void;
  onClearCanvas: () => void;
  onSaveCanvas: () => void;
  onFinalizeFutureState: () => void;

  children: ReactNode;
};


export function OrganizationEngagementCanvasTab({
  selectedWorkerId,
  workerDisplayValue,
  engagementSelectionState,
  engagementCanvasLoaded,
  engagementsLoading,
  editingEngagement,
  editingEngagementId,
  engagementSaveState,
  lastSavedAtLabel,
  engagementSaving,
  engagementFinalizing,
  isFutureStateLocked,
  onStateChange,
  onLoadCanvas,
  onClearCanvas,
  onSaveCanvas,
  onFinalizeFutureState,
  children,
}: OrganizationEngagementCanvasTabProps) {
  return (
    <div className="card stack" style={{ gap: 16, minWidth: 0 }}>
      <div className="section-title">Engagement Canvas</div>

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

          <label className="stack">
            <strong>State</strong>
            <select
              className="select"
              value={engagementSelectionState}
              onChange={(event) =>
                onStateChange(event.target.value as AdminWorkerEngagementState)
              }
              disabled={!selectedWorkerId}
            >
              <option value="current">current</option>
              <option value="future">future</option>
            </select>
          </label>

          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            <button
              className="button"
              type="button"
              onClick={onLoadCanvas}
              disabled={!selectedWorkerId || engagementsLoading}
            >
              {engagementsLoading ? "Loading..." : "Load canvas"}
            </button>

            {engagementCanvasLoaded ? (
              <button className="button ghost" type="button" onClick={onClearCanvas}>
                Clear canvas
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {!selectedWorkerId ? (
        <div className="card-soft">
          <div className="muted">Select a worker above to work on the engagement canvas.</div>
        </div>
      ) : !engagementCanvasLoaded ? (
        <div className="card-soft">
          <div className="muted">
            No canvas displayed yet. Choose the state and click <strong>Load canvas</strong>.
          </div>
        </div>
      ) : (
        <>
          <div
            className="row space-between"
            style={{ gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}
          >
            <div className="stack" style={{ gap: 4 }}>
              <div className="muted">
                Worker #{selectedWorkerId} — state: {engagementSelectionState}
              </div>
              <div className="muted">
                {editingEngagement
                  ? `Existing canvas loaded (${editingEngagement.status})`
                  : "No existing canvas found. You are creating a new one."}
              </div>
            </div>

            <div className="row" style={{ gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <SavePill state={engagementSaveState} savedAt={lastSavedAtLabel} />
              <CoherenceBadge status={editingEngagement?.coherence_status} />

              <button
                className="button"
                type="button"
                onClick={onSaveCanvas}
                disabled={engagementSaving || isFutureStateLocked}
              >
                {engagementSaving ? "Saving..." : editingEngagementId ? "Save" : "Create"}
              </button>

              {engagementSelectionState === "future" && editingEngagementId ? (
                <button
                  className="button ghost"
                  type="button"
                  onClick={onFinalizeFutureState}
                  disabled={engagementFinalizing || isFutureStateLocked}
                >
                  {engagementFinalizing
                    ? "Confirming..."
                    : isFutureStateLocked
                      ? "Confirmed"
                      : "Confirm future state"}
                </button>
              ) : null}
            </div>
          </div>

          {isFutureStateLocked ? (
            <div className="card-soft" style={{ color: "#15803d" }}>
              This future-state engagement is finalized and locked for editing.
            </div>
          ) : null}

          {children}
        </>
      )}
    </div>
  );
}