import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type {
  CareerTrajectoryIntelligenceResponse,
  LongTermCareerTrajectoryRead,
  TalentTrajectoryIntelligenceResponse,
  TrajectorySignalResponse,
} from "@/lib/types";

const apiMocks = vi.hoisted(() => ({
  getDashboardSummary: vi.fn(),
  getDashboardTimeline: vi.fn(),
  getCareerBlueprint: vi.fn(),
  getCareerGap: vi.fn(),
  getCareerTrajectory: vi.fn(),
  getCareerTrajectoryIntelligence: vi.fn(),
  getLongTermCareerTrajectory: vi.fn(),
  getTalentTrajectoryIntelligence: vi.fn(),
  getMyTrajectorySignal: vi.fn(),
  getRecommendations: vi.fn(),
  getSessionProfessionalDecision: vi.fn(),
  getActionExecutionFollowUp: vi.fn(),
  getProgressRealization: vi.fn(),
  getCurrentOpenSession: vi.fn(),
}));

const careerCardMock = vi.hoisted(() => vi.fn());
const longTermCardMock = vi.hoisted(() => vi.fn());
const talentCardMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return { ...actual, ...apiMocks };
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock("@/components/auth-guard", () => ({
  AuthGuard: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

vi.mock("@/components/user-context", () => ({
  useCurrentUser: () => ({
    user: {
      id: 1,
      given_name: "Alex",
      display_name: "Alex",
      profile_update_suspected: false,
    },
  }),
}));

vi.mock("@/lib/use-ui-language", () => ({
  useUiLanguage: () => ({
    uiLanguage: "fr",
    loadingLanguage: false,
  }),
}));

vi.mock("@/components/career-trajectory-intelligence-card", () => ({
  CareerTrajectoryIntelligenceCard: (props: unknown) => {
    careerCardMock(props);
    return <div data-testid="career-trajectory-intelligence-card" />;
  },
}));

vi.mock("@/components/long-term-career-trajectory-card", () => ({
  LongTermCareerTrajectoryCard: (props: unknown) => {
    longTermCardMock(props);
    return <div data-testid="long-term-career-trajectory-card" />;
  },
}));

vi.mock("@/components/talent-trajectory-intelligence-card", () => ({
  TalentTrajectoryIntelligenceCard: (props: unknown) => {
    talentCardMock(props);
    return <div data-testid="talent-trajectory-intelligence-card" />;
  },
}));

vi.mock("@/components/app-shell", () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-shell">{children}</div>
  ),
}));

import DashboardPage from "@/app/dashboard/page";

function careerIntelligence(): CareerTrajectoryIntelligenceResponse {
  return {
    current_direction: "Enterprise Architect",
    progression_state: "progressing",
    progression_velocity: "steady",
    persistent_blockers: [],
    direction_changes: [],
    stagnation_signals: [],
    career_summary:
      "Ta trajectoire de carrière progresse vers une contribution stratégique plus large.",
  };
}

function talentIntelligence(): TalentTrajectoryIntelligenceResponse {
  return {
    capability_trajectories: [],
    value_trajectories: [],
    impact_trajectories: [],
    talent_summary: null,
  };
}

function longTermTrajectory(
  overrides: Partial<LongTermCareerTrajectoryRead> = {},
): LongTermCareerTrajectoryRead {
  return {
    temporal_profile: {
      temporal_evidence_state: "longitudinal",
      episode_count: 8,
      ignored_episode_count: 0,
      recent_episode_count: 4,
      historical_episode_count: 4,
      active_day_count: 7,
      coverage_days: 90,
      first_observed_at: "2026-05-25T12:00:00Z",
      last_observed_at: "2026-08-22T12:00:00Z",
      temporal_trend: "insufficient_evidence",
    },
    temporal_windows: {
      recent: { episode_count: 4, active_day_count: 3 },
      previous: { episode_count: 4, active_day_count: 3 },
    },
    activity_comparison: { activity_change: "similar_activity" },
    velocity_evidence: { velocity_evidence_state: "comparable_windows" },
    velocity_interpretation: { activity_velocity: "steady" },
    ...overrides,
  };
}

function dashboardSummary(
  recentSessions = [
    {
      session_id: 12,
      status: "closed",
      summary: "Session clôturée",
      started_at: "2026-08-21T10:00:00Z",
      ended_at: "2026-08-21T10:30:00Z",
    },
  ],
) {
  return {
    recommendation_stats: {
      open: 0,
      in_progress: 0,
      completed: 0,
      dismissed: 0,
      total: 0,
      completion_rate: 0,
    },
    problem_trends: {
      top_primary_problem: null,
      top_secondary_problems: [],
      average_severity: null,
      average_urgency: null,
    },
    session_count: recentSessions.length,
    top_lever_types_used: [],
    recent_sessions: recentSessions,
    recent_recommendations: [],
  };
}

function setSuccessfulDashboardDefaults() {
  apiMocks.getDashboardSummary.mockResolvedValue(dashboardSummary());
  apiMocks.getDashboardTimeline.mockResolvedValue([]);
  apiMocks.getCurrentOpenSession.mockResolvedValue(null);
  apiMocks.getCareerBlueprint.mockResolvedValue({
    is_completed: true,
  });
  apiMocks.getCareerGap.mockResolvedValue(null);
  apiMocks.getCareerTrajectory.mockResolvedValue({
    current_position: "Business Analyst",
    target_position: "Enterprise Architect",
    strategic_bridge: "Broaden strategic scope.",
    trajectory_summary: "Career trajectory summary.",
  });
  apiMocks.getCareerTrajectoryIntelligence.mockResolvedValue(careerIntelligence());
  apiMocks.getLongTermCareerTrajectory.mockResolvedValue(longTermTrajectory());
  apiMocks.getTalentTrajectoryIntelligence.mockResolvedValue(talentIntelligence());
  apiMocks.getMyTrajectorySignal.mockResolvedValue(
    {} satisfies TrajectorySignalResponse,
  );
  apiMocks.getRecommendations.mockResolvedValue([]);
  apiMocks.getSessionProfessionalDecision.mockResolvedValue({
    adaptation_explanation: null,
    lever_learning_experience: null,
    action_candidates: [],
    decisive_actions: [],
    execution_gaps: [],
    lever_decisions: [],
    lever_candidate_evaluations: [],
  });
  apiMocks.getActionExecutionFollowUp.mockResolvedValue({
    decisive_action_id: 0,
    execution_results: [],
  });
  apiMocks.getProgressRealization.mockRejectedValue(
    new Error("No persisted realization"),
  );
}

describe("Dashboard Long-Term Career Trajectory integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setSuccessfulDashboardDefaults();
  });

  it("loads the worker-level read-only Long-Term trajectory once and renders its dedicated card", async () => {
    const payload = longTermTrajectory();
    apiMocks.getLongTermCareerTrajectory.mockResolvedValueOnce(payload);

    render(<DashboardPage />);

    await waitFor(() => {
      expect(apiMocks.getLongTermCareerTrajectory).toHaveBeenCalledTimes(1);
    });

    expect(
      await screen.findByTestId("long-term-career-trajectory-card"),
    ).toBeInTheDocument();

    expect(longTermCardMock).toHaveBeenCalledWith({
      trajectory: payload,
      language: "fr",
    });
  });

  it("loads Long-Term trajectory even when there is no closed decision session", async () => {
    apiMocks.getDashboardSummary.mockResolvedValueOnce(
      dashboardSummary([
        {
          session_id: 88,
          status: "open",
          summary: "Session encore ouverte",
          started_at: "2026-08-21T15:00:00Z",
          ended_at: null,
        },
      ]),
    );

    render(<DashboardPage />);

    await waitFor(() => {
      expect(apiMocks.getLongTermCareerTrajectory).toHaveBeenCalledTimes(1);
    });

    expect(apiMocks.getSessionProfessionalDecision).not.toHaveBeenCalled();
    expect(
      await screen.findByTestId("long-term-career-trajectory-card"),
    ).toBeInTheDocument();
  });

  it("keeps the dashboard available when the supplemental Long-Term read fails", async () => {
    apiMocks.getLongTermCareerTrajectory.mockRejectedValueOnce(
      new Error("Long-Term trajectory unavailable"),
    );

    render(<DashboardPage />);

    await waitFor(() => {
      expect(apiMocks.getLongTermCareerTrajectory).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByTestId("app-shell")).toBeInTheDocument();
    expect(
      screen.queryByTestId("long-term-career-trajectory-card"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Long-Term trajectory unavailable"),
    ).not.toBeInTheDocument();
  });

  it("passes insufficient Long-Term evidence through without inventing activity movement", async () => {
    const empty = longTermTrajectory({
      temporal_profile: {
        temporal_evidence_state: "insufficient_evidence",
        episode_count: 0,
        ignored_episode_count: 0,
        recent_episode_count: 0,
        historical_episode_count: 0,
        active_day_count: 0,
        coverage_days: 0,
        first_observed_at: null,
        last_observed_at: null,
        temporal_trend: "insufficient_evidence",
      },
      temporal_windows: {
        recent: { episode_count: 0, active_day_count: 0 },
        previous: { episode_count: 0, active_day_count: 0 },
      },
      activity_comparison: { activity_change: "insufficient_evidence" },
      velocity_evidence: { velocity_evidence_state: "insufficient_evidence" },
      velocity_interpretation: { activity_velocity: "insufficient_evidence" },
    });

    apiMocks.getLongTermCareerTrajectory.mockResolvedValueOnce(empty);

    render(<DashboardPage />);

    await waitFor(() => {
      expect(apiMocks.getLongTermCareerTrajectory).toHaveBeenCalledTimes(1);
    });

    expect(longTermCardMock).toHaveBeenCalledWith({
      trajectory: empty,
      language: "fr",
    });
  });

  it("keeps Long-Term activity separate from Career and Talent intelligence", async () => {
    const careerPayload = careerIntelligence();
    const longTermPayload = longTermTrajectory({
      activity_comparison: { activity_change: "mixed_activity" },
      velocity_interpretation: { activity_velocity: "insufficient_evidence" },
    });
    const talentPayload = talentIntelligence();

    apiMocks.getCareerTrajectoryIntelligence.mockResolvedValueOnce(careerPayload);
    apiMocks.getLongTermCareerTrajectory.mockResolvedValueOnce(longTermPayload);
    apiMocks.getTalentTrajectoryIntelligence.mockResolvedValueOnce(talentPayload);

    render(<DashboardPage />);

    await waitFor(() => {
      expect(apiMocks.getCareerTrajectoryIntelligence).toHaveBeenCalledTimes(1);
      expect(apiMocks.getLongTermCareerTrajectory).toHaveBeenCalledTimes(1);
      expect(apiMocks.getTalentTrajectoryIntelligence).toHaveBeenCalledTimes(1);
    });

    expect(careerCardMock).toHaveBeenCalledWith({
      intelligence: careerPayload,
      language: "fr",
    });
    expect(longTermCardMock).toHaveBeenCalledWith({
      trajectory: longTermPayload,
      language: "fr",
    });
    expect(talentCardMock).toHaveBeenCalledWith({
      intelligence: talentPayload,
      language: "fr",
    });
  });
});