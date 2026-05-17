"use client";

import type { ReactNode } from "react";
import {
  CoherenceBadge,
  SavePill,
  type SaveIndicator,
} from "./canvas-status-pills";
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
  const dominantDimension =
    editingSignificanceCanvas?.dominant_dimension ||
    editingSignificanceCanvas?.dominant_section ||
    null;

  const canvasSummary =
    editingSignificanceCanvas?.analysis_summary ||
    editingSignificanceCanvas?.perception_summary ||
    null;

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
          <div className="section-title">Significance Canvas</div>
          <div className="muted">
            Assess how the worker currently perceives work through five dimensions: raison,
            métier, occupation, corvée and hobby.
          </div>
        </div>

        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
          <span className={selectedWorkerId ? "badge primary" : "badge warning"}>
            {selectedWorkerId ? `worker #${selectedWorkerId}` : "no worker selected"}
          </span>

          {significanceCanvasLoaded ? (
            <span className="badge success">loaded</span>
          ) : (
            <span className="badge">not loaded</span>
          )}

          {editingSignificanceCanvasId ? (
            <span className="badge">canvas #{editingSignificanceCanvasId}</span>
          ) : significanceCanvasLoaded ? (
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
            <span className="muted">Scoring rule</span>

            <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
              <span className="badge primary">deterministic scoring</span>

              {dominantDimension ? (
                <span className="badge">dominant: {dominantDimension}</span>
              ) : (
                <span className="badge">no dominant yet</span>
              )}

              <CoherenceBadge status={editingSignificanceCanvas?.coherence_status} />
            </div>
          </div>

          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            <button
              className="button"
              type="button"
              onClick={onLoadCanvas}
              disabled={!selectedWorkerId || significanceLoading}
            >
              {significanceLoading
                ? "Loading..."
                : significanceCanvasLoaded
                  ? "Reload canvas"
                  : "Load canvas"}
            </button>

            {significanceCanvasLoaded ? (
              <button className="button ghost" type="button" onClick={onClearCanvas}>
                Clear canvas
              </button>
            ) : null}
          </div>
        </div>

        <div className="muted" style={{ fontSize: 13 }}>
          Each answer contributes to a deterministic profile. The resulting dominant dimension
          helps clarify whether work is currently experienced as meaning, profession, occupation,
          burden or personal interest.
        </div>
      </div>

      {!selectedWorkerId ? (
        <div className="card-soft stack" style={{ gap: 8 }}>
          <div className="section-title" style={{ fontSize: 15 }}>
            Worker required
          </div>
          <div className="muted">
            Select a worker from the Workers tab before opening the Significance Canvas.
          </div>
        </div>
      ) : !significanceCanvasLoaded ? (
        <div className="card-soft stack" style={{ gap: 8 }}>
          <div className="section-title" style={{ fontSize: 15 }}>
            Canvas not loaded
          </div>
          <div className="muted">
            Click <strong>Load canvas</strong> to open the worker’s work-perception
            questionnaire.
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
                <span className="badge primary">Significance Canvas</span>

                {editingSignificanceCanvas ? (
                  <span className="badge">existing canvas</span>
                ) : (
                  <span className="badge warning">new canvas</span>
                )}

                {editingSignificanceCanvasId ? (
                  <span className="badge">#{editingSignificanceCanvasId}</span>
                ) : null}

                {dominantDimension ? (
                  <span className="badge primary">dominant: {dominantDimension}</span>
                ) : (
                  <span className="badge">not evaluated</span>
                )}

                <CoherenceBadge status={editingSignificanceCanvas?.coherence_status} />
              </div>

              <div className="stack" style={{ gap: 3 }}>
                <div style={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
                  Worker #{selectedWorkerId} · Work significance reading
                </div>

                <div className="muted">
                  {editingSignificanceCanvas
                    ? "Existing significance canvas loaded."
                    : "No existing significance canvas found. You are creating a new significance canvas."}
                </div>

                {canvasSummary ? <div className="muted">{canvasSummary}</div> : null}
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

          <div style={{ minWidth: 0, overflowX: "auto" }}>{children}</div>
        </>
      )}
    </div>
  );
}