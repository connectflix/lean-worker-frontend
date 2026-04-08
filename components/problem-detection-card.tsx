"use client";

import type { ProblemDetection } from "@/lib/types";
import {
  ActionListIcon,
  BadgePill,
  BrainIcon,
  ClockIcon,
  SparkIcon,
  TargetIcon,
} from "@/components/ui-flat-icons";

function prettify(value: string): string {
  return value.replaceAll("_", " ");
}

export function ProblemDetectionCard({ item }: { item: ProblemDetection }) {
  return (
    <div className="card stack">
      <div className="stack" style={{ gap: 6 }}>
        <div className="row" style={{ gap: 8, alignItems: "center" }}>
          <BrainIcon />
          <div className="section-title" style={{ margin: 0 }}>
            Detected situation
          </div>
        </div>
        <div className="muted" style={{ fontSize: 13 }}>
          What your coach understood from this session
        </div>
      </div>

      <div className="card-soft">
        <strong>{prettify(item.primary_problem)}</strong>
        <div className="muted" style={{ marginTop: 4 }}>
          {prettify(item.problem_domain)}
        </div>
      </div>

      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
        <BadgePill icon={<TargetIcon size={14} />}>
          Severity: {prettify(item.severity)}
        </BadgePill>
        <BadgePill icon={<ClockIcon size={14} />}>
          Urgency: {prettify(item.urgency)}
        </BadgePill>
      </div>

      {item.secondary_problems.length > 0 && (
        <div className="stack" style={{ gap: 8 }}>
          <div className="muted">Related signals</div>
          <div className="row" style={{ flexWrap: "wrap", gap: 6 }}>
            {item.secondary_problems.map((problem) => (
              <BadgePill key={problem} icon={<SparkIcon size={14} />}>
                {prettify(problem)}
              </BadgePill>
            ))}
          </div>
        </div>
      )}

      <div className="stack" style={{ gap: 8 }}>
        <div className="muted">Suggested directions</div>
        <div className="row" style={{ flexWrap: "wrap", gap: 6 }}>
          {item.recommended_action_tracks.map((track) => (
            <BadgePill key={track} icon={<ActionListIcon size={14} />}>
              {prettify(track)}
            </BadgePill>
          ))}
        </div>
      </div>

      <div className="card-soft">
        <div className="muted" style={{ fontSize: 13, marginBottom: 6 }}>
          Why this was detected
        </div>
        <div style={{ lineHeight: 1.6 }}>{item.rationale}</div>
      </div>
    </div>
  );
}