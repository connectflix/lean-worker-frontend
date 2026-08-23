import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TalentTrajectoryIntelligenceCard } from "@/components/talent-trajectory-intelligence-card";
import type { TalentTrajectoryIntelligenceResponse } from "@/lib/types";


function talentIntelligence(
  overrides: Partial<TalentTrajectoryIntelligenceResponse> = {},
): TalentTrajectoryIntelligenceResponse {
  return {
    capability_trajectories: [
      {
        capability_key: "stakeholder_alignment",
        capability_label: "Stakeholder alignment",
        progression_state: "strengthening",
        recent_episode_count: 2,
        historical_episode_count: 1,
        repetition: "repeated",
        consistency: "mostly_consistent",
        independence: "increasing",
        context_breadth: "expanding",
        complexity: "increasing",
        evidence_strength: "moderate",
        evidence: [
          "Aligned two teams around a shared decision.",
          "Clarified ownership before the delivery review.",
        ],
        progression_explanation:
          "Stakeholder alignment is being demonstrated repeatedly across recent situations.",
      },
    ],
    value_trajectories: [
      {
        value_domain: "decision_quality",
        value_label: "Clearer cross-team decisions",
        progression_state: "repeated_contribution",
        recent_episode_count: 2,
        historical_episode_count: 0,
        recurrence: "repeated",
        context_breadth: "limited",
        materiality: "meaningful",
        evidence_strength: "moderate",
        beneficiaries: ["Delivery team", "Project leadership"],
        evidence: [
          "The teams reached a shared decision with explicit ownership.",
        ],
        progression_explanation:
          "Clearer cross-team decisions have been created in more than one recent professional episode.",
      },
    ],
    impact_trajectories: [
      {
        impact_domain: "decision_acceleration",
        impact_label: "Faster decision making",
        progression_state: "isolated_impact",
        recent_episode_count: 1,
        historical_episode_count: 0,
        reliability: "isolated",
        scope: "team",
        materiality: "meaningful",
        evidence_strength: "limited",
        evidence: [
          "The delivery decision was made during the same review instead of being deferred.",
        ],
        progression_explanation:
          "Faster decision making has one recent observable occurrence.",
      },
    ],
    talent_summary:
      "Your recent work shows growing capability, repeated useful contribution, and one observable impact signal.",
    ...overrides,
  };
}


describe("TalentTrajectoryIntelligenceCard", () => {
  it("renders the three Talent pillars as distinct worker-facing sections", () => {
    render(
      <TalentTrajectoryIntelligenceCard
        intelligence={talentIntelligence()}
        language="en"
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Capabilities developing" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Value you are creating" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Observable impact" }),
    ).toBeInTheDocument();

    expect(screen.getByText("Stakeholder alignment")).toBeInTheDocument();
    expect(screen.getByText("Clearer cross-team decisions")).toBeInTheDocument();
    expect(screen.getByText("Faster decision making")).toBeInTheDocument();
  });

  it("renders the worker-facing talent summary without turning it into a score", () => {
    render(
      <TalentTrajectoryIntelligenceCard
        intelligence={talentIntelligence()}
        language="en"
      />,
    );

    expect(
      screen.getByText(
        "Your recent work shows growing capability, repeated useful contribution, and one observable impact signal.",
      ),
    ).toBeInTheDocument();

    expect(screen.queryByText(/talent score/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/capability score/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/impact score/i)).not.toBeInTheDocument();
  });

  it("shows evidence-backed explanations instead of raw technical dimensions", () => {
    render(
      <TalentTrajectoryIntelligenceCard
        intelligence={talentIntelligence()}
        language="en"
      />,
    );

    expect(
      screen.getByText(
        "Stakeholder alignment is being demonstrated repeatedly across recent situations.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "The teams reached a shared decision with explicit ownership.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "The delivery decision was made during the same review instead of being deferred.",
      ),
    ).toBeInTheDocument();

    expect(screen.queryByText("mostly_consistent")).not.toBeInTheDocument();
    expect(screen.queryByText("evidence_strength")).not.toBeInTheDocument();
    expect(screen.queryByText("recent_episode_count")).not.toBeInTheDocument();
  });

  it("keeps Value visible even when no Impact is yet evidenced", () => {
    render(
      <TalentTrajectoryIntelligenceCard
        intelligence={talentIntelligence({
          impact_trajectories: [],
          talent_summary:
            "Useful contribution is visible, while observable impact is not yet established.",
        })}
        language="en"
      />,
    );

    expect(screen.getByText("Clearer cross-team decisions")).toBeInTheDocument();

    expect(
      screen.getByText(
        "Useful contribution is visible, while observable impact is not yet established.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText("No observable impact evidence yet."),
    ).toBeInTheDocument();
  });

  it("does not infer Value or Impact when only Capability evidence exists", () => {
    render(
      <TalentTrajectoryIntelligenceCard
        intelligence={talentIntelligence({
          value_trajectories: [],
          impact_trajectories: [],
          talent_summary:
            "A capability pattern is emerging; value and impact remain unconfirmed.",
        })}
        language="en"
      />,
    );

    expect(screen.getByText("Stakeholder alignment")).toBeInTheDocument();

    expect(
      screen.getByText("No value contribution evidence yet."),
    ).toBeInTheDocument();

    expect(
      screen.getByText("No observable impact evidence yet."),
    ).toBeInTheDocument();
  });

  it("renders a bounded empty-history state without inventing talent progress", () => {
    render(
      <TalentTrajectoryIntelligenceCard
        intelligence={{
          capability_trajectories: [],
          value_trajectories: [],
          impact_trajectories: [],
          talent_summary: null,
        }}
        language="en"
      />,
    );

    expect(
      screen.getByText(
        "There is not enough professional evidence yet to describe your talent trajectory.",
      ),
    ).toBeInTheDocument();

    expect(screen.queryByText(/growing/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/improving/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/expert/i)).not.toBeInTheDocument();
  });

  it("supports French worker-facing copy", () => {
    render(
      <TalentTrajectoryIntelligenceCard
        intelligence={talentIntelligence()}
        language="fr"
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Capacités en développement" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Valeur que tu crées" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Impact observable" }),
    ).toBeInTheDocument();
  });

  it("never exposes lineage, commerce, ranking, recommendations, or hidden scores", () => {
    const { container } = render(
      <TalentTrajectoryIntelligenceCard
        intelligence={talentIntelligence()}
        language="en"
      />,
    );

    const visibleText = container.textContent?.toLowerCase() ?? "";

    const forbidden = [
      "worker_id",
      "trajectory_update_id",
      "source_session_id",
      "source_context_snapshot_id",
      "source_decisive_action_id",
      "source_execution_result_id",
      "payment",
      "checkout",
      "commercial",
      "revenue",
      "ranking",
      "top capabilities",
      "recommended capability",
      "recommendation",
      "talent_score",
      "capability_score",
      "value_score",
      "impact_score",
    ];

    for (const token of forbidden) {
      expect(visibleText).not.toContain(token);
    }
  });
});