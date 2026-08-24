import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import DashboardPage from "@/app/dashboard/page";
import type {
  TalentTrajectoryIntelligenceResponse,
  TrajectorySignalResponse,
} from "@/lib/types";


const apiMocks = vi.hoisted(() => ({
  confirmCurrentProfileContext: vi.fn(),
  createProgressRealization: vi.fn(),
  createSession: vi.fn(),
  finalizeExecutionResult: vi.fn(),
  forceCloseSession: vi.fn(),
  getActionExecutionFollowUp: vi.fn(),
  getCareerBlueprint: vi.fn(),
  getCareerGap: vi.fn(),
  getCareerTrajectory: vi.fn(),
  getCareerTrajectoryIntelligence: vi.fn(),
  getLongTermCareerTrajectory: vi.fn(),
  getCurrentOpenSession: vi.fn(),
  getDashboardSummary: vi.fn(),
  getDashboardTimeline: vi.fn(),
  getMyTrajectorySignal: vi.fn(),
  getProgressRealization: vi.fn(),
  getRecommendations: vi.fn(),
  getSessionProfessionalDecision: vi.fn(),
  getTalentTrajectoryIntelligence: vi.fn(),
  reconcilePendingTrajectory: vi.fn(),
  recordActionExecutionResult: vi.fn(),
  recordProgressExperience: vi.fn(),
}));

const talentCardMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/api", () => apiMocks);

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock("@/components/auth-guard", () => ({
  AuthGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/app-shell", () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => (
    <main data-testid="app-shell">{children}</main>
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

vi.mock("@/lib/ui-copy", () => ({
  getUiCopy: () => ({
    common: {
      loading: "Loading",
    },
    dashboard: {
      loading: "Loading dashboard",
      subtitle: "Ton espace de coaching.",
      resumeOpenSession: "Reprendre",
      startNewSession: "Démarrer",
    },
  }),
}));

vi.mock("@/components/best-next-action-card", () => ({
  BestNextActionCard: () => <div data-testid="best-next-action-card" />,
}));

vi.mock("@/components/decisive-action-card", () => ({
  DecisiveActionCard: () => <div data-testid="decisive-action-card" />,
}));

vi.mock("@/components/determining-lever-card", () => ({
  DeterminingLeverCard: () => <div data-testid="determining-lever-card" />,
}));

vi.mock("@/components/execution-follow-up-card", () => ({
  ExecutionFollowUpCard: () => <div data-testid="execution-follow-up-card" />,
}));

vi.mock("@/components/execution-feedback-form", () => ({
  ExecutionFeedbackForm: () => <div data-testid="execution-feedback-form" />,
}));

vi.mock("@/components/progress-realization-card", () => ({
  ProgressRealizationCard: () => <div data-testid="progress-realization-card" />,
}));

vi.mock("@/components/trajectory-signal-card", () => ({
  TrajectorySignalCard: () => <div data-testid="trajectory-signal-card" />,
}));

vi.mock("@/components/talent-trajectory-intelligence-card", () => ({
  TalentTrajectoryIntelligenceCard: (props: {
    intelligence: TalentTrajectoryIntelligenceResponse | null;
    language: "fr" | "en";
  }) => {
    talentCardMock(props);

    return (
      <section data-testid="talent-trajectory-intelligence-card">
        <span>{props.language}</span>
        <span>{props.intelligence?.talent_summary ?? "empty-talent-summary"}</span>
      </section>
    );
  },
}));

vi.mock("@/components/ui-flat-icons", () => {
  const Icon = () => <span aria-hidden="true" />;

  return {
    BadgePill: ({ children }: { children: React.ReactNode }) => (
      <span>{children}</span>
    ),
    BrainIcon: Icon,
    ChartIcon: Icon,
    ClockIcon: Icon,
    LayerIcon: Icon,
    PathIcon: Icon,
    SessionIcon: Icon,
    SparkIcon: Icon,
    TargetIcon: Icon,
  };
});


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
        evidence: ["Deux équipes ont été alignées autour d’une décision partagée."],
        progression_explanation:
          "L’alignement des parties prenantes se renforce dans les situations récentes.",
      },
    ],
    value_trajectories: [],
    impact_trajectories: [],
    talent_summary:
      "Ta capacité à aligner les parties prenantes devient plus visible dans le travail réel.",
    ...overrides,
  };
}


function dashboardSummary(recentSessions: unknown[] = []) {
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
  apiMocks.getDashboardSummary.mockResolvedValue(dashboardSummary([]));
  apiMocks.getDashboardTimeline.mockResolvedValue([]);
  apiMocks.getCurrentOpenSession.mockResolvedValue(null);
  apiMocks.getCareerBlueprint.mockResolvedValue({
    is_completed: true,
  });
  apiMocks.getCareerGap.mockResolvedValue(null);
  apiMocks.getCareerTrajectory.mockResolvedValue({
    trajectory_summary: "Career movement is intentionally separate from Talent.",
    current_position: "Business Analyst",
    target_position: "Business Architect",
    strategic_bridge: "Broaden strategic scope.",
  });
  apiMocks.getCareerTrajectoryIntelligence.mockResolvedValue(null);
  apiMocks.getLongTermCareerTrajectory.mockResolvedValue(null);
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
  apiMocks.getTalentTrajectoryIntelligence.mockResolvedValue(
    talentIntelligence(),
  );
}


describe("Dashboard Talent Trajectory Intelligence integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setSuccessfulDashboardDefaults();
  });

  it("labels the positioning block as Cap de carrière in French", async () => {
    render(<DashboardPage />);

    expect(await screen.findByText("Cap de carrière")).toBeInTheDocument();
    expect(screen.queryByText("Trajectoire de carrière")).not.toBeInTheDocument();
  });

  it("loads the worker-level read-only TTI once and renders its dedicated card", async () => {
    const payload = talentIntelligence();

    apiMocks.getTalentTrajectoryIntelligence.mockResolvedValueOnce(payload);

    render(<DashboardPage />);

    await waitFor(() => {
      expect(apiMocks.getTalentTrajectoryIntelligence).toHaveBeenCalledTimes(1);
    });

    expect(
      await screen.findByTestId("talent-trajectory-intelligence-card"),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Ta capacité à aligner les parties prenantes devient plus visible dans le travail réel.",
      ),
    ).toBeInTheDocument();

    expect(talentCardMock).toHaveBeenCalledWith({
      intelligence: payload,
      language: "fr",
    });
  });

  it("loads TTI even when there is no closed decision session", async () => {
    apiMocks.getDashboardSummary.mockResolvedValueOnce(
      dashboardSummary([
        {
          session_id: 88,
          status: "open",
          summary: "Session encore ouverte",
          started_at: "2026-08-19T15:00:00Z",
          ended_at: null,
        },
      ]),
    );

    render(<DashboardPage />);

    await waitFor(() => {
      expect(apiMocks.getTalentTrajectoryIntelligence).toHaveBeenCalledTimes(1);
    });

    expect(apiMocks.getSessionProfessionalDecision).not.toHaveBeenCalled();

    expect(
      await screen.findByTestId("talent-trajectory-intelligence-card"),
    ).toBeInTheDocument();
  });

  it("keeps the dashboard available when the supplemental TTI read fails", async () => {
    apiMocks.getTalentTrajectoryIntelligence.mockRejectedValueOnce(
      new Error("TTI unavailable"),
    );

    render(<DashboardPage />);

    await waitFor(() => {
      expect(apiMocks.getTalentTrajectoryIntelligence).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByTestId("app-shell")).toBeInTheDocument();

    expect(
      screen.queryByTestId("talent-trajectory-intelligence-card"),
    ).not.toBeInTheDocument();

    expect(screen.queryByText("TTI unavailable")).not.toBeInTheDocument();
  });

  it("passes an empty TTI response through without inventing talent progress", async () => {
    const empty: TalentTrajectoryIntelligenceResponse = {
      capability_trajectories: [],
      value_trajectories: [],
      impact_trajectories: [],
      talent_summary: null,
    };

    apiMocks.getTalentTrajectoryIntelligence.mockResolvedValueOnce(empty);

    render(<DashboardPage />);

    await waitFor(() => {
      expect(apiMocks.getTalentTrajectoryIntelligence).toHaveBeenCalledTimes(1);
    });

    expect(
      await screen.findByText("empty-talent-summary"),
    ).toBeInTheDocument();

    expect(talentCardMock).toHaveBeenCalledWith({
      intelligence: empty,
      language: "fr",
    });
  });

  it("keeps Talent Intelligence distinct from Career Trajectory data", async () => {
    const talent = talentIntelligence({
      talent_summary: "Talent evidence summary.",
    });

    apiMocks.getTalentTrajectoryIntelligence.mockResolvedValueOnce(talent);
    apiMocks.getCareerTrajectory.mockResolvedValueOnce({
      trajectory_summary: "Career trajectory summary.",
      current_position: "Business Analyst",
      target_position: "Business Architect",
      strategic_bridge: "Move into broader role scope.",
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(apiMocks.getTalentTrajectoryIntelligence).toHaveBeenCalledTimes(1);
    });

    expect(
      await screen.findByText("Talent evidence summary."),
    ).toBeInTheDocument();

    expect(talentCardMock).toHaveBeenCalledWith({
      intelligence: talent,
      language: "fr",
    });

    const lastCall = talentCardMock.mock.calls.at(-1)?.[0];

    expect(lastCall).not.toHaveProperty("trajectory");
    expect(lastCall).not.toHaveProperty("careerTrajectory");
    expect(lastCall).not.toHaveProperty("career_trajectory");
  });
});