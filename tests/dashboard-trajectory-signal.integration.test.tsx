import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import DashboardPage from "@/app/dashboard/page";
import type { TrajectorySignalResponse } from "@/lib/types";

const apiMocks = vi.hoisted(() => ({
  confirmCurrentProfileContext: vi.fn(),
  createSession: vi.fn(),
  forceCloseSession: vi.fn(),
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
  getTalentTrajectoryIntelligence: vi.fn(),
}));

vi.mock("@/lib/api", () => apiMocks);

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

vi.mock("@/components/app-shell", () => ({
  AppShell: ({
    children,
  }: {
    children: React.ReactNode;
  }) => <main data-testid="app-shell">{children}</main>,
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

vi.mock("@/components/best-next-action-card", () => ({
  BestNextActionCard: () => (
    <div data-testid="best-next-action-card" />
  ),
}));

function setSuccessfulDashboardDefaults() {
  apiMocks.getDashboardSummary.mockResolvedValue({
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
    session_count: 0,
    top_lever_types_used: [],
    recent_sessions: [],
    recent_recommendations: [],
  });
  apiMocks.getDashboardTimeline.mockResolvedValue([]);
  apiMocks.getCurrentOpenSession.mockResolvedValue(null);
  apiMocks.getCareerBlueprint.mockResolvedValue({
    is_completed: false,
  });
  apiMocks.getCareerGap.mockResolvedValue(null);
  apiMocks.getCareerTrajectory.mockResolvedValue(null);
  apiMocks.getCareerTrajectoryIntelligence.mockResolvedValue(null);
  apiMocks.getLongTermCareerTrajectory.mockResolvedValue(null);
  apiMocks.getTalentTrajectoryIntelligence.mockResolvedValue(null);
  apiMocks.getProgressRealization.mockRejectedValue(
    new Error("No persisted realization"),
  );
  apiMocks.getRecommendations.mockResolvedValue([]);
}

describe("Dashboard + real TrajectorySignalCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setSuccessfulDashboardDefaults();
  });

  it("renders the longitudinal trajectory signal returned by the API", async () => {
    const signal: TrajectorySignalResponse = {
      trajectory_update_id: 120,
      source_session_id: 110,
      source_context_snapshot_id: 100,
      source_decisive_action_id: 90,
      source_execution_result_id: 80,
      trajectory_signal: "positive",
      trajectory_summary:
        "Tes décisions se traduisent plus régulièrement en actions concrètes.",
      learned_constraints: [
        "La surcharge réduit la qualité de priorisation",
      ],
      capability_signals: [
        "Passage à l'action plus rapide",
      ],
      next_attention_candidates: [
        "Clarifier la prochaine décision prioritaire",
      ],
      recommended_next_focus:
        "Protéger une seule décision prioritaire cette semaine.",
      confidence: 0.86,
    };

    apiMocks.getMyTrajectorySignal.mockResolvedValue(signal);

    render(<DashboardPage />);

    await waitFor(() => {
      expect(
        apiMocks.getMyTrajectorySignal,
      ).toHaveBeenCalledTimes(1);
    });

    expect(
      await screen.findByRole("region", {
        name: "Trajectoire professionnelle",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Ta trajectoire"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Progression positive"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Confiance 86 %"),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Protéger une seule décision prioritaire cette semaine.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Tes décisions se traduisent plus régulièrement en actions concrètes.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Passage à l'action plus rapide",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "La surcharge réduit la qualité de priorisation",
      ),
    ).toBeInTheDocument();
  });

  it("keeps lineage identifiers out of the worker-facing DOM", async () => {
    apiMocks.getMyTrajectorySignal.mockResolvedValue({
      trajectory_update_id: 991,
      source_session_id: 881,
      source_context_snapshot_id: 771,
      source_decisive_action_id: 661,
      source_execution_result_id: 551,
      trajectory_signal: "positive",
      recommended_next_focus:
        "Continuer avec la prochaine action validée.",
    } satisfies TrajectorySignalResponse);

    render(<DashboardPage />);

    expect(
      await screen.findByText(
        "Continuer avec la prochaine action validée.",
      ),
    ).toBeInTheDocument();

    for (const internalId of [
      "991",
      "881",
      "771",
      "661",
      "551",
    ]) {
      expect(
        screen.queryByText(internalId),
      ).not.toBeInTheDocument();
    }
  });

  it("does not render the trajectory card for the empty-history contract", async () => {
    apiMocks.getMyTrajectorySignal.mockResolvedValue({});

    render(<DashboardPage />);

    await waitFor(() => {
      expect(
        apiMocks.getMyTrajectorySignal,
      ).toHaveBeenCalledTimes(1);
    });

    expect(
      screen.queryByRole("region", {
        name: "Trajectoire professionnelle",
      }),
    ).not.toBeInTheDocument();

    expect(
      screen.getByTestId("app-shell"),
    ).toBeInTheDocument();
  });

  it("keeps the dashboard available when the optional trajectory read fails", async () => {
    apiMocks.getMyTrajectorySignal.mockRejectedValue(
      new Error("trajectory endpoint unavailable"),
    );

    render(<DashboardPage />);

    await waitFor(() => {
      expect(
        apiMocks.getMyTrajectorySignal,
      ).toHaveBeenCalledTimes(1);
    });

    expect(
      screen.getByTestId("app-shell"),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("region", {
        name: "Trajectoire professionnelle",
      }),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText(
        "trajectory endpoint unavailable",
      ),
    ).not.toBeInTheDocument();
  });
});