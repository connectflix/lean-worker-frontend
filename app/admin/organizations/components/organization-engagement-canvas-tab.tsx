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

function getEngagementStateLabel(state: AdminWorkerEngagementState): string {
  if (state === "future") return "Future state";
  return "Current state";
}

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
  const stateLabel = getEngagementStateLabel(engagementSelectionState);

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
          <div className="section-title">Engagement Canvas</div>
          <div className="muted">
            Capture the worker’s current reality and future ambition in a structured execution
            canvas.
          </div>
        </div>

        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
          <span className={selectedWorkerId ? "badge primary" : "badge warning"}>
            {selectedWorkerId ? `worker #${selectedWorkerId}` : "no worker selected"}
          </span>

          <span className="badge">{stateLabel}</span>

          {isFutureStateLocked ? (
            <span className="badge success">locked</span>
          ) : engagementCanvasLoaded ? (
            <span className="badge warning">editable</span>
          ) : (
            <span className="badge">not loaded</span>
          )}
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

          <label className="stack" style={{ gap: 6 }}>
            <span className="muted">Canvas state</span>
            <select
              className="select"
              value={engagementSelectionState}
              onChange={(event) =>
                onStateChange(event.target.value as AdminWorkerEngagementState)
              }
              disabled={!selectedWorkerId}
            >
              <option value="current">Current state</option>
              <option value="future">Future state</option>
            </select>
          </label>

          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            <button
              className="button"
              type="button"
              onClick={onLoadCanvas}
              disabled={!selectedWorkerId || engagementsLoading}
            >
              {engagementsLoading
                ? "Loading..."
                : engagementCanvasLoaded
                  ? "Reload canvas"
                  : "Load canvas"}
            </button>

            {engagementCanvasLoaded ? (
              <button className="button ghost" type="button" onClick={onClearCanvas}>
                Clear canvas
              </button>
            ) : null}
          </div>
        </div>

        <div className="muted" style={{ fontSize: 13 }}>
          Current state captures where the worker is now. Future state captures where the worker is
          going. Once confirmed, a future state becomes locked to protect the reference point.
        </div>
      </div>

      {!selectedWorkerId ? (
        <div className="card-soft stack" style={{ gap: 8 }}>
          <div className="section-title" style={{ fontSize: 15 }}>
            Worker required
          </div>
          <div className="muted">
            Select a worker from the Workers tab before opening the engagement canvas.
          </div>
        </div>
      ) : !engagementCanvasLoaded ? (
        <div className="card-soft stack" style={{ gap: 8 }}>
          <div className="section-title" style={{ fontSize: 15 }}>
            Canvas not loaded
          </div>
          <div className="muted">
            Choose the state, then click <strong>Load canvas</strong> to open the worker’s
            engagement workspace.
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
                <span className="badge primary">{stateLabel}</span>

                {editingEngagement ? (
                  <span className="badge">
                    {editingEngagement.is_finalized ? "finalized" : "draft"}
                  </span>
                ) : (
                  <span className="badge warning">new canvas</span>
                )}

                {editingEngagement?.status ? (
                  <span className="badge">{editingEngagement.status}</span>
                ) : null}
              </div>

              <div className="stack" style={{ gap: 3 }}>
                <div style={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
                  Worker #{selectedWorkerId} · {stateLabel}
                </div>

                <div className="muted">
                  {editingEngagement
                    ? "Existing engagement canvas loaded."
                    : "No existing canvas found. You are creating a new engagement canvas."}
                </div>
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
            <div
              className="card-soft"
              style={{
                color: "var(--success)",
                background: "var(--success-soft)",
                border: "1px solid rgba(21,128,61,0.20)",
              }}
            >
              This future-state engagement is finalized and locked for editing.
            </div>
          ) : null}

          <div style={{ minWidth: 0, overflowX: "auto" }}>{children}</div>
        </>
      )}
    </div>
  );
}