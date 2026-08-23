import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import DashboardPage from "@/app/dashboard/page";
import type {
  DecisiveActionResponse,
  ExecutionFollowUpResponse,
  ExecutionResultResponse,
  LeverDecisionResponse,
  LeverLearningExperience,
  ProfessionalDecisionAdaptationExplanation,
  ProfessionalDecisionBundleResponse,
} from "@/lib/types";

const apiMocks = vi.hoisted(() => ({
  confirmCurrentProfileContext: vi.fn(),
  createProgressRealization: vi.fn(),
  createSession: vi.fn(),
  forceCloseSession: vi.fn(),
  getActionExecutionFollowUp: vi.fn(),
  getCareerBlueprint: vi.fn(),
  finalizeExecutionResult: vi.fn(),
  recordActionExecutionResult: vi.fn(),

  getCareerGap: vi.fn(),
  getCareerTrajectory: vi.fn(),
  getCareerTrajectoryIntelligence: vi.fn(),
  getLongTermCareerTrajectory: vi.fn(),
  getCurrentOpenSession: vi.fn(),
  getDashboardSummary: vi.fn(),
  getDashboardTimeline: vi.fn(),
  getMyTrajectorySignal: vi.fn(),
  getProgressRealization: vi.fn(),
  reconcilePendingTrajectory: vi.fn(),
  getRecommendations: vi.fn(),
  getSessionProfessionalDecision: vi.fn(),
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

vi.mock("@/components/trajectory-signal-card", () => ({
  TrajectorySignalCard: ({
    signal,
  }: {
    signal?: {
      trajectory_summary?: string | null;
    } | null;
  }) => (
    <div data-testid="trajectory-signal-card">
      {signal?.trajectory_summary ?? ""}
    </div>
  ),
}));

function decisiveAction(
  overrides: Partial<DecisiveActionResponse> = {},
): DecisiveActionResponse {
  return {
    id: 501,
    worker_id: 1,
    session_id: 77,
    context_snapshot_id: 101,
    context_alignment_id: 202,
    selected_candidate_id: 401,

    selection_reason:
      "Cette action est la plus forte parmi les options valides.",
    decision_confidence: 0.91,

    sequence: 1,
    title: "Contacter un recruteur ciblé",
    description:
      "Envoyer un message ciblé à un recruteur correspondant à ton objectif.",
    expected_outcome:
      "Obtenir un signal concret du marché.",
    time_horizon: "48 heures",
    deadline_at: null,
    success_criteria_json: [
      "Un message ciblé est envoyé.",
    ],

    attention_resolution:
      "Cette action traite directement le blocage actuel.",
    intention_progress:
      "Elle fait progresser ton positionnement sur le marché.",
    mandate_alignment:
      "Elle protège ta stabilité professionnelle actuelle.",

    attention_relevance_score: 0.9,
    intention_progress_score: 0.88,
    mandate_alignment_score: 0.96,
    decisiveness_score: 0.89,
    overall_validity_score: 0.676,

    risks_json: [],
    mandate_veto_cleared: true,
    respected_blocking_constraint_codes_json: [],

    status: "proposed",
    created_at: "2026-08-10T12:00:00Z",
    updated_at: "2026-08-10T12:00:00Z",

    ...overrides,
  };
}

function leverDecision(
  overrides: Partial<LeverDecisionResponse> = {},
): LeverDecisionResponse {
  return {
    id: 701,
    worker_id: 1,
    session_id: 77,
    decisive_action_id: 501,
    execution_gap_id: 601,

    lever_needed: true,
    selected_lever_id: 9,

    selected_lever_name: "Execution Focus Coach",
    selected_lever_type: "coach",
    selected_lever_description:
      "Structured support for executing the selected action.",
    selected_lever_url: "https://example.test/levers/9",

    necessity: "important",

    selection_reason:
      "This Lever best enables the selected action.",
    determinacy_reason:
      "It addresses the determining execution barrier.",
    pragmatic_reason:
      "It is usable now.",

    action_enablement_score: 0.9,
    attention_contribution_score: 0.8,
    intention_contribution_score: 0.8,
    mandate_contribution_score: 0.9,
    confidence: 0.88,

    pragmatic_fit_json: {},

    created_at: "2026-08-10T12:00:00Z",

    ...overrides,
  };
}

function executionResult(
  overrides: Partial<ExecutionResultResponse> = {},
): ExecutionResultResponse {
  return {
    id: 900,
    worker_id: 1,
    session_id: 77,
    context_snapshot_id: 101,

    decisive_action_id: 501,
    lever_decision_id: 701,
    commercial_offer_resolution_id: null,

    attempt_number: 1,

    execution_status: "completed",
    outcome_status: "achieved",

    observed_result: "Le recruteur a répondu.",
    worker_reflection: "L'action a produit un signal utile.",

    evidence_json: [],
    blockers_json: [],

    outcome_score: 0.8,
    worker_confidence_after: 0.86,

    lever_used: true,
    lever_helpfulness_score: 0.8,
    lever_usage_evidence_json: [],

    started_at: "2026-08-10T13:00:00Z",
    completed_at: "2026-08-10T14:00:00Z",
    recorded_at: "2026-08-10T14:05:00Z",
    created_at: "2026-08-10T14:05:00Z",
    updated_at: "2026-08-10T14:05:00Z",

    ...overrides,
  };
}

function executionFollowUp(
  overrides: Partial<ExecutionFollowUpResponse> = {},
): ExecutionFollowUpResponse {
  return {
    decisive_action_id: 501,
    execution_results: [executionResult()],
    ...overrides,
  };
}

function decisionBundle(
  actions: DecisiveActionResponse[],
  leverDecisions: LeverDecisionResponse[] = [],
  adaptationExplanation:
    | ProfessionalDecisionAdaptationExplanation
    | null = null,
  leverLearningExperience: LeverLearningExperience | null = null,
): ProfessionalDecisionBundleResponse {
  return {
    adaptation_explanation: adaptationExplanation,
    lever_learning_experience: leverLearningExperience,
    action_candidates: [],
    decisive_actions: actions,
    execution_gaps: [],
    lever_decisions: leverDecisions,
    lever_candidate_evaluations: [],
  };
}

function adaptationExplanation(
  overrides: Partial<ProfessionalDecisionAdaptationExplanation> = {},
): ProfessionalDecisionAdaptationExplanation {
  return {
    previous_learning:
      "Le contact ciblé a produit un signal plus utile que les candidatures larges.",
    focus_change:
      "Le focus passe des candidatures générales à la préparation ciblée de l'échange recruteur.",
    why_this_focus_now:
      "Le signal précédent montre que la conversation recruteur est maintenant le prochain point utile à travailler.",
    ...overrides,
  };
}


function leverLearningExperience(
  overrides: Partial<LeverLearningExperience> = {},
): LeverLearningExperience {
  return {
    learning_signal: {
      lever_id: 9,
      evidence_state: "repeated_support",
      consistency: "consistent_support",
      recent_episode_count: 3,
      historical_episode_count: 1,
      latest_signal: "helpful",
      evidence_strength: "moderate",
      cautions: [],
    },
    learning_explanation:
      "Ce type de soutien a déjà été utile dans plusieurs situations récentes.",
    ...overrides,
  };
}

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
    session_count: 1,
    top_lever_types_used: [],
    recent_sessions: [
      {
        session_id: 77,
        status: "closed",
        summary: "Session clôturée",
        started_at: "2026-08-10T10:00:00Z",
        ended_at: "2026-08-10T11:00:00Z",
      },
    ],
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
  apiMocks.getMyTrajectorySignal.mockResolvedValue({});
  apiMocks.getProgressRealization.mockRejectedValue(
    new Error("No persisted Progress Realization"),
  );
  apiMocks.getTalentTrajectoryIntelligence.mockResolvedValue({
    capability_trajectories: [],
    value_trajectories: [],
    impact_trajectories: [],
    talent_summary: null,
  });
  apiMocks.createProgressRealization.mockRejectedValue(
    new Error("Progress Realization unavailable"),
  );
  apiMocks.reconcilePendingTrajectory.mockResolvedValue(null);
  apiMocks.getRecommendations.mockResolvedValue([]);
  apiMocks.getSessionProfessionalDecision.mockResolvedValue(
    decisionBundle([]),
  );
  apiMocks.getActionExecutionFollowUp.mockResolvedValue(
    executionFollowUp({
      execution_results: [],
    }),
  );
  apiMocks.recordActionExecutionResult.mockResolvedValue(
    executionResult(),
  );
  apiMocks.finalizeExecutionResult.mockResolvedValue(
    executionResult(),
  );
}

describe("Dashboard + DecisiveAction Wave 2 integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setSuccessfulDashboardDefaults();
  });

  it("loads the read-only decision bundle for the latest closed dashboard session", async () => {
    apiMocks.getSessionProfessionalDecision.mockResolvedValue(
      decisionBundle([decisiveAction()]),
    );

    render(<DashboardPage />);

    await waitFor(() => {
      expect(
        apiMocks.getSessionProfessionalDecision,
      ).toHaveBeenCalledTimes(1);
    });

    expect(
      apiMocks.getSessionProfessionalDecision,
    ).toHaveBeenCalledWith(77);

    expect(
      await screen.findByRole("region", {
        name: "Action décisive",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Contacter un recruteur ciblé"),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Cette action traite directement le blocage actuel.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Elle fait progresser ton positionnement sur le marché.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Elle protège ta stabilité professionnelle actuelle.",
      ),
    ).toBeInTheDocument();
  });

  it("renders the adaptation explanation returned by the same decision bundle", async () => {
    const explanation = adaptationExplanation();

    apiMocks.getSessionProfessionalDecision.mockResolvedValue(
      decisionBundle(
        [decisiveAction()],
        [],
        explanation,
      ),
    );

    render(<DashboardPage />);

    expect(
      await screen.findByText("Pourquoi le focus évolue"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Ce que le cycle précédent nous a appris"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(explanation.previous_learning),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Ce qui change dans le focus"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(explanation.focus_change),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Pourquoi ce focus maintenant"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(explanation.why_this_focus_now),
    ).toBeInTheDocument();

    expect(
      apiMocks.getSessionProfessionalDecision,
    ).toHaveBeenCalledTimes(1);
    expect(
      apiMocks.getSessionProfessionalDecision,
    ).toHaveBeenCalledWith(77);
  });

  it("keeps the adaptation explanation invisible when the decision bundle returns null", async () => {
    apiMocks.getSessionProfessionalDecision.mockResolvedValue(
      decisionBundle(
        [decisiveAction()],
        [],
        null,
      ),
    );

    render(<DashboardPage />);

    expect(
      await screen.findByText("Contacter un recruteur ciblé"),
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Pourquoi le focus évolue"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Ce que le cycle précédent nous a appris"),
    ).not.toBeInTheDocument();

    expect(
      screen.getByText("Pourquoi cette action"),
    ).toBeInTheDocument();
  });

  it("shows adaptation explanation alongside Lever and execution without another Wave 2 read", async () => {
    const explanation = adaptationExplanation();

    apiMocks.getSessionProfessionalDecision.mockResolvedValue(
      decisionBundle(
        [decisiveAction()],
        [leverDecision()],
        explanation,
      ),
    );
    apiMocks.getActionExecutionFollowUp.mockResolvedValue(
      executionFollowUp(),
    );

    render(<DashboardPage />);

    expect(
      await screen.findByText(explanation.previous_learning),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("region", {
        name: "Levier déterminant",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Execution Focus Coach"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("region", {
        name: "Suivi d’exécution",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Le recruteur a répondu."),
    ).toBeInTheDocument();

    expect(
      apiMocks.getSessionProfessionalDecision,
    ).toHaveBeenCalledTimes(1);
    expect(
      apiMocks.getActionExecutionFollowUp,
    ).toHaveBeenCalledWith(501);
  });

  it("renders Lever learning from the same decision bundle for the displayed determining Lever", async () => {
    const learning = leverLearningExperience();

    apiMocks.getSessionProfessionalDecision.mockResolvedValue(
      decisionBundle(
        [decisiveAction()],
        [leverDecision()],
        null,
        learning,
      ),
    );

    render(<DashboardPage />);

    expect(
      await screen.findByText(learning.learning_explanation),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Ce que ton expérience montre"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Execution Focus Coach"),
    ).toBeInTheDocument();

    expect(
      apiMocks.getSessionProfessionalDecision,
    ).toHaveBeenCalledTimes(1);
    expect(
      apiMocks.getSessionProfessionalDecision,
    ).toHaveBeenCalledWith(77);
  });

  it("does not display Lever learning when its Lever identity does not match the displayed decision", async () => {
    const learning = leverLearningExperience({
      learning_signal: {
        lever_id: 999,
        evidence_state: "repeated_support",
        consistency: "consistent_support",
        recent_episode_count: 3,
        historical_episode_count: 1,
        latest_signal: "helpful",
        evidence_strength: "moderate",
        cautions: [],
      },
      learning_explanation:
        "Cette explication appartient à un autre Lever et ne doit pas être affichée.",
    });

    apiMocks.getSessionProfessionalDecision.mockResolvedValue(
      decisionBundle(
        [decisiveAction()],
        [leverDecision({ selected_lever_id: 9 })],
        null,
        learning,
      ),
    );

    render(<DashboardPage />);

    expect(
      await screen.findByText("Execution Focus Coach"),
    ).toBeInTheDocument();

    expect(
      screen.queryByText(learning.learning_explanation),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("Ce que ton expérience montre"),
    ).not.toBeInTheDocument();
  });

  it("keeps Lever learning invisible when the decision bundle returns null", async () => {
    apiMocks.getSessionProfessionalDecision.mockResolvedValue(
      decisionBundle(
        [decisiveAction()],
        [leverDecision()],
        null,
        null,
      ),
    );

    render(<DashboardPage />);

    expect(
      await screen.findByText("Execution Focus Coach"),
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Ce que ton expérience montre"),
    ).not.toBeInTheDocument();
  });

  it("selects the latest persisted decisive action by sequence, then id", async () => {
    apiMocks.getSessionProfessionalDecision.mockResolvedValue(
      decisionBundle([
        decisiveAction({
          id: 501,
          sequence: 1,
          title: "Première action",
        }),
        decisiveAction({
          id: 503,
          sequence: 2,
          title: "Action la plus récente",
        }),
        decisiveAction({
          id: 502,
          sequence: 2,
          title: "Action plus ancienne au même niveau",
        }),
      ]),
    );

    render(<DashboardPage />);

    expect(
      await screen.findByText("Action la plus récente"),
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Première action"),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("Action plus ancienne au même niveau"),
    ).not.toBeInTheDocument();
  });

  it("does not call Wave 2 when there is no closed or ended recent session", async () => {
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
      session_count: 1,
      top_lever_types_used: [],
      recent_sessions: [
        {
          session_id: 88,
          status: "open",
          summary: "Session encore ouverte",
          started_at: "2026-08-10T14:00:00Z",
          ended_at: null,
        },
      ],
      recent_recommendations: [],
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(
        apiMocks.getDashboardSummary,
      ).toHaveBeenCalledTimes(1);
    });

    expect(
      apiMocks.getSessionProfessionalDecision,
    ).not.toHaveBeenCalled();

    expect(
      screen.queryByRole("region", {
        name: "Action décisive",
      }),
    ).not.toBeInTheDocument();

    expect(
      screen.getByTestId("app-shell"),
    ).toBeInTheDocument();
  });

  it("keeps the dashboard available when the supplemental Wave 2 read fails", async () => {
    apiMocks.getSessionProfessionalDecision.mockRejectedValue(
      new Error("decision endpoint unavailable"),
    );

    render(<DashboardPage />);

    await waitFor(() => {
      expect(
        apiMocks.getSessionProfessionalDecision,
      ).toHaveBeenCalledWith(77);
    });

    expect(
      screen.getByTestId("app-shell"),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("region", {
        name: "Action décisive",
      }),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("decision endpoint unavailable"),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("Unable to load the dashboard"),
    ).not.toBeInTheDocument();
  });

  it("renders the determining Lever linked to the displayed DecisiveAction", async () => {
    apiMocks.getSessionProfessionalDecision.mockResolvedValue(
      decisionBundle(
        [decisiveAction()],
        [leverDecision()],
      ),
    );

    render(<DashboardPage />);

    expect(
      await screen.findByRole("region", {
        name: "Action décisive",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("region", {
        name: "Levier déterminant",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Execution Focus Coach"),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "It addresses the determining execution barrier.",
      ),
    ).toBeInTheDocument();

    expect(
      apiMocks.getSessionProfessionalDecision,
    ).toHaveBeenCalledTimes(1);
  });

  it("ignores a LeverDecision linked to a different DecisiveAction", async () => {
    apiMocks.getSessionProfessionalDecision.mockResolvedValue(
      decisionBundle(
        [decisiveAction()],
        [
          leverDecision({
            decisive_action_id: 999,
            selected_lever_name: "Wrong Lever",
          }),
        ],
      ),
    );

    render(<DashboardPage />);

    expect(
      await screen.findByText("Contacter un recruteur ciblé"),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("region", {
        name: "Levier déterminant",
      }),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("Wrong Lever"),
    ).not.toBeInTheDocument();
  });

  it("keeps the No Lever path invisible even when it belongs to the displayed action", async () => {
    apiMocks.getSessionProfessionalDecision.mockResolvedValue(
      decisionBundle(
        [decisiveAction()],
        [
          leverDecision({
            lever_needed: false,
            selected_lever_id: null,
            selected_lever_name: null,
            selected_lever_type: null,
            selected_lever_description: null,
            selected_lever_url: null,
            necessity: "none",
            determinacy_reason: null,
            pragmatic_reason: null,
          }),
        ],
      ),
    );

    render(<DashboardPage />);

    expect(
      await screen.findByText("Contacter un recruteur ciblé"),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("region", {
        name: "Levier déterminant",
      }),
    ).not.toBeInTheDocument();
  });

  it("selects the latest positive LeverDecision for the displayed action by id", async () => {
    apiMocks.getSessionProfessionalDecision.mockResolvedValue(
      decisionBundle(
        [decisiveAction()],
        [
          leverDecision({
            id: 701,
            selected_lever_name: "Older Lever Decision",
          }),
          leverDecision({
            id: 703,
            selected_lever_name: "Latest Lever Decision",
          }),
          leverDecision({
            id: 702,
            selected_lever_name: "Middle Lever Decision",
          }),
        ],
      ),
    );

    render(<DashboardPage />);

    expect(
      await screen.findByText("Latest Lever Decision"),
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Older Lever Decision"),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("Middle Lever Decision"),
    ).not.toBeInTheDocument();
  });

  it("loads execution follow-up for the exact displayed DecisiveAction", async () => {
    apiMocks.getSessionProfessionalDecision.mockResolvedValue(
      decisionBundle(
        [decisiveAction()],
        [leverDecision()],
      ),
    );
    apiMocks.getActionExecutionFollowUp.mockResolvedValue(
      executionFollowUp(),
    );

    render(<DashboardPage />);

    expect(
      await screen.findByRole("region", {
        name: "Suivi d’exécution",
      }),
    ).toBeInTheDocument();

    expect(
      apiMocks.getActionExecutionFollowUp,
    ).toHaveBeenCalledTimes(1);

    expect(
      apiMocks.getActionExecutionFollowUp,
    ).toHaveBeenCalledWith(501);

    expect(
      screen.getByText("Le recruteur a répondu."),
    ).toBeInTheDocument();

    expect(
      screen.getByText("L'action a produit un signal utile."),
    ).toBeInTheDocument();
  });

  it("loads execution follow-up for the latest selected DecisiveAction id, not another action", async () => {
    apiMocks.getSessionProfessionalDecision.mockResolvedValue(
      decisionBundle([
        decisiveAction({
          id: 501,
          sequence: 1,
          title: "Ancienne action",
        }),
        decisiveAction({
          id: 503,
          sequence: 2,
          title: "Action affichée",
        }),
      ]),
    );

    apiMocks.getActionExecutionFollowUp.mockResolvedValue(
      executionFollowUp({
        decisive_action_id: 503,
        execution_results: [
          executionResult({
            decisive_action_id: 503,
            observed_result: "Résultat de l'action affichée",
          }),
        ],
      }),
    );

    render(<DashboardPage />);

    expect(
      await screen.findByText("Action affichée"),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(
        apiMocks.getActionExecutionFollowUp,
      ).toHaveBeenCalledWith(503);
    });

    expect(
      apiMocks.getActionExecutionFollowUp,
    ).not.toHaveBeenCalledWith(501);

    expect(
      screen.getByText("Résultat de l'action affichée"),
    ).toBeInTheDocument();
  });

  it("renders the explicit empty execution-history state for the displayed action", async () => {
    apiMocks.getSessionProfessionalDecision.mockResolvedValue(
      decisionBundle([decisiveAction()]),
    );
    apiMocks.getActionExecutionFollowUp.mockResolvedValue(
      executionFollowUp({
        execution_results: [],
      }),
    );

    render(<DashboardPage />);

    expect(
      await screen.findByText(
        "Aucun retour d’exécution enregistré pour le moment",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("region", {
        name: "Suivi d’exécution",
      }),
    ).toBeInTheDocument();
  });

  it("keeps the dashboard and DecisiveAction available when execution follow-up fails", async () => {
    apiMocks.getSessionProfessionalDecision.mockResolvedValue(
      decisionBundle(
        [decisiveAction()],
        [leverDecision()],
      ),
    );
    apiMocks.getActionExecutionFollowUp.mockRejectedValue(
      new Error("execution follow-up unavailable"),
    );

    render(<DashboardPage />);

    expect(
      await screen.findByText("Contacter un recruteur ciblé"),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(
        apiMocks.getActionExecutionFollowUp,
      ).toHaveBeenCalledWith(501);
    });

    expect(
      screen.getByRole("region", {
        name: "Levier déterminant",
      }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("region", {
        name: "Suivi d’exécution",
      }),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("execution follow-up unavailable"),
    ).not.toBeInTheDocument();

    expect(
      screen.getByTestId("app-shell"),
    ).toBeInTheDocument();
  });

  it("does not request execution follow-up when no DecisiveAction was resolved", async () => {
    apiMocks.getSessionProfessionalDecision.mockResolvedValue(
      decisionBundle([]),
    );

    render(<DashboardPage />);

    await waitFor(() => {
      expect(
        apiMocks.getSessionProfessionalDecision,
      ).toHaveBeenCalledWith(77);
    });

    expect(
      apiMocks.getActionExecutionFollowUp,
    ).not.toHaveBeenCalled();

    expect(
      screen.queryByRole("region", {
        name: "Suivi d’exécution",
      }),
    ).not.toBeInTheDocument();
  });

  it("records execution feedback for the displayed DecisiveAction and refreshes follow-up", async () => {
    apiMocks.getSessionProfessionalDecision.mockResolvedValue(
      decisionBundle(
        [decisiveAction()],
        [leverDecision()],
      ),
    );

    apiMocks.getActionExecutionFollowUp
      .mockResolvedValueOnce(
        executionFollowUp({
          execution_results: [],
        }),
      )
      .mockResolvedValueOnce(
        executionFollowUp({
          execution_results: [
            executionResult({
              id: 911,
              decisive_action_id: 501,
              attempt_number: 1,
              execution_status: "in_progress",
              outcome_status: "unknown",
              observed_result: "Premier contact envoyé.",
              lever_decision_id: 701,
            }),
          ],
        }),
      );

    render(<DashboardPage />);

    expect(
      await screen.findByRole("region", {
        name: "Retour d’exécution",
      }),
    ).toBeInTheDocument();

    fireEvent.change(
      screen.getByLabelText("Résultat observé"),
      {
        target: {
          value: "Premier contact envoyé.",
        },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Enregistrer le retour",
      }),
    );

    await waitFor(() => {
      expect(
        apiMocks.recordActionExecutionResult,
      ).toHaveBeenCalledTimes(1);
    });

    expect(
      apiMocks.recordActionExecutionResult,
    ).toHaveBeenCalledWith(
      501,
      expect.objectContaining({
        execution_status: "in_progress",
        outcome_status: "unknown",
        observed_result: "Premier contact envoyé.",
        lever_used: false,
      }),
      1,
      701,
    );

    await waitFor(() => {
      expect(
        apiMocks.getActionExecutionFollowUp,
      ).toHaveBeenCalledTimes(2);
    });

    const executionFollowUpRegion = screen.getByRole("region", {
      name: "Suivi d’exécution",
    });

    expect(
      within(executionFollowUpRegion).getByText(
        "Premier contact envoyé.",
      ),
    ).toBeInTheDocument();
  });

  it("increments attempt number from the highest persisted execution attempt", async () => {
    apiMocks.getSessionProfessionalDecision.mockResolvedValue(
      decisionBundle([decisiveAction()]),
    );

    apiMocks.getActionExecutionFollowUp
      .mockResolvedValueOnce(
        executionFollowUp({
          execution_results: [
            executionResult({
              id: 901,
              attempt_number: 1,
            }),
            executionResult({
              id: 905,
              attempt_number: 3,
            }),
            executionResult({
              id: 903,
              attempt_number: 2,
            }),
          ],
        }),
      )
      .mockResolvedValueOnce(
        executionFollowUp({
          execution_results: [
            executionResult({
              id: 906,
              attempt_number: 4,
              observed_result: "Quatrième tentative enregistrée.",
            }),
          ],
        }),
      );

    render(<DashboardPage />);

    expect(
      await screen.findByRole("region", {
        name: "Retour d’exécution",
      }),
    ).toBeInTheDocument();

    fireEvent.change(
      screen.getByLabelText("Résultat observé"),
      {
        target: {
          value: "Quatrième tentative enregistrée.",
        },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Enregistrer le retour",
      }),
    );

    await waitFor(() => {
      expect(
        apiMocks.recordActionExecutionResult,
      ).toHaveBeenCalledTimes(1);
    });

    expect(
      apiMocks.recordActionExecutionResult.mock.calls[0][2],
    ).toBe(4);
  });

  it("does not send a lever decision id when no determining Lever exists", async () => {
    apiMocks.getSessionProfessionalDecision.mockResolvedValue(
      decisionBundle([decisiveAction()], []),
    );

    apiMocks.getActionExecutionFollowUp
      .mockResolvedValueOnce(
        executionFollowUp({
          execution_results: [],
        }),
      )
      .mockResolvedValueOnce(
        executionFollowUp({
          execution_results: [
            executionResult({
              lever_decision_id: null,
              observed_result: "Action lancée sans levier.",
            }),
          ],
        }),
      );

    render(<DashboardPage />);

    expect(
      await screen.findByRole("region", {
        name: "Retour d’exécution",
      }),
    ).toBeInTheDocument();

    expect(
      screen.queryByLabelText(
        "J’ai utilisé le levier sélectionné pendant cette tentative",
      ),
    ).not.toBeInTheDocument();

    fireEvent.change(
      screen.getByLabelText("Résultat observé"),
      {
        target: {
          value: "Action lancée sans levier.",
        },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Enregistrer le retour",
      }),
    );

    await waitFor(() => {
      expect(
        apiMocks.recordActionExecutionResult,
      ).toHaveBeenCalledTimes(1);
    });

    expect(
      apiMocks.recordActionExecutionResult.mock.calls[0][3],
    ).toBeNull();
  });

  it("does not send any commercial resolution id from the dashboard recording flow", async () => {
    apiMocks.getSessionProfessionalDecision.mockResolvedValue(
      decisionBundle(
        [decisiveAction()],
        [leverDecision()],
      ),
    );

    apiMocks.getActionExecutionFollowUp
      .mockResolvedValueOnce(
        executionFollowUp({
          execution_results: [],
        }),
      )
      .mockResolvedValueOnce(
        executionFollowUp({
          execution_results: [
            executionResult({
              observed_result: "Signal observé.",
            }),
          ],
        }),
      );

    render(<DashboardPage />);

    expect(
      await screen.findByRole("region", {
        name: "Retour d’exécution",
      }),
    ).toBeInTheDocument();

    fireEvent.change(
      screen.getByLabelText("Résultat observé"),
      {
        target: { value: "Signal observé." },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Enregistrer le retour",
      }),
    );

    await waitFor(() => {
      expect(
        apiMocks.recordActionExecutionResult,
      ).toHaveBeenCalledTimes(1);
    });

    const call = apiMocks.recordActionExecutionResult.mock.calls[0];

    expect(call).toHaveLength(4);
    expect(call[0]).toBe(501);
    expect(call[2]).toBe(1);
    expect(call[3]).toBe(701);
  });

  it("keeps the current execution follow-up visible when recording fails", async () => {
    apiMocks.getSessionProfessionalDecision.mockResolvedValue(
      decisionBundle([decisiveAction()]),
    );

    apiMocks.getActionExecutionFollowUp.mockResolvedValue(
      executionFollowUp({
        execution_results: [
          executionResult({
            id: 920,
            attempt_number: 1,
            observed_result: "Tentative déjà persistée.",
          }),
        ],
      }),
    );

    apiMocks.recordActionExecutionResult.mockRejectedValue(
      new Error("backend execution persistence failure"),
    );

    render(<DashboardPage />);

    expect(
      await screen.findByText("Tentative déjà persistée."),
    ).toBeInTheDocument();

    fireEvent.change(
      screen.getByLabelText("Résultat observé"),
      {
        target: {
          value: "Nouvelle tentative non persistée.",
        },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Enregistrer le retour",
      }),
    );

    expect(
      await screen.findByRole("alert"),
    ).toHaveTextContent(
      "Le retour n’a pas pu être enregistré. Réessaie dans quelques instants.",
    );

    expect(
      screen.getByText("Tentative déjà persistée."),
    ).toBeInTheDocument();

    expect(
      screen.queryByText("backend execution persistence failure"),
    ).not.toBeInTheDocument();

    expect(
      apiMocks.getActionExecutionFollowUp,
    ).toHaveBeenCalledTimes(1);
  });

  it("refreshes trajectory after a terminal execution feedback submit", async () => {
    apiMocks.getSessionProfessionalDecision.mockResolvedValue(
      decisionBundle(
        [decisiveAction()],
        [leverDecision()],
      ),
    );

    apiMocks.getActionExecutionFollowUp
      .mockResolvedValueOnce(
        executionFollowUp({
          execution_results: [],
        }),
      )
      .mockResolvedValueOnce(
        executionFollowUp({
          execution_results: [
            executionResult({
              id: 950,
              decisive_action_id: 501,
              attempt_number: 1,
              execution_status: "completed",
              outcome_status: "achieved",
              observed_result: "Objectif atteint.",
            }),
          ],
        }),
      );

    apiMocks.getMyTrajectorySignal
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({
        trajectory_update_id: 1201,
        source_session_id: 77,
        source_context_snapshot_id: 101,
        source_decisive_action_id: 501,
        source_execution_result_id: 950,
        trajectory_signal: "positive",
        trajectory_summary: "L’action a produit un signal de progression.",
        attention_shift: {},
        learned_constraints: [],
        capability_signals: [],
        effective_lever_signals: [],
        next_attention_candidates: [],
        recommended_next_focus: "Consolider cette progression.",
        confidence: 0.91,
      });

    render(<DashboardPage />);

    expect(
      await screen.findByRole("region", {
        name: "Retour d’exécution",
      }),
    ).toBeInTheDocument();

    fireEvent.change(
      screen.getByLabelText("État de l’action"),
      {
        target: { value: "completed" },
      },
    );

    fireEvent.change(
      screen.getByLabelText("Résultat"),
      {
        target: { value: "achieved" },
      },
    );

    fireEvent.change(
      screen.getByLabelText("Résultat observé"),
      {
        target: { value: "Objectif atteint." },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Enregistrer le retour",
      }),
    );

    await waitFor(() => {
      expect(
        apiMocks.recordActionExecutionResult,
      ).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(
        apiMocks.getMyTrajectorySignal,
      ).toHaveBeenCalledTimes(2);
    });

    await waitFor(() => {
      expect(
        within(
          screen.getByTestId("trajectory-signal-card"),
        ).getByText(
          "L’action a produit un signal de progression.",
        ),
      ).toBeInTheDocument();
    });
  });

  it("does not refresh trajectory after an in-progress execution feedback submit", async () => {
    apiMocks.getSessionProfessionalDecision.mockResolvedValue(
      decisionBundle([decisiveAction()]),
    );

    apiMocks.getActionExecutionFollowUp
      .mockResolvedValueOnce(
        executionFollowUp({
          execution_results: [],
        }),
      )
      .mockResolvedValueOnce(
        executionFollowUp({
          execution_results: [
            executionResult({
              id: 951,
              decisive_action_id: 501,
              attempt_number: 1,
              execution_status: "in_progress",
              outcome_status: "unknown",
              observed_result: "Premier pas réalisé.",
            }),
          ],
        }),
      );

    apiMocks.getMyTrajectorySignal.mockResolvedValue({});

    render(<DashboardPage />);

    expect(
      await screen.findByRole("region", {
        name: "Retour d’exécution",
      }),
    ).toBeInTheDocument();

    fireEvent.change(
      screen.getByLabelText("Résultat observé"),
      {
        target: { value: "Premier pas réalisé." },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Enregistrer le retour",
      }),
    );

    await waitFor(() => {
      expect(
        apiMocks.recordActionExecutionResult,
      ).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(
        apiMocks.getActionExecutionFollowUp,
      ).toHaveBeenCalledTimes(2);
    });

    expect(
      apiMocks.getMyTrajectorySignal,
    ).toHaveBeenCalledTimes(1);
  });

  it("keeps persisted execution feedback visible when terminal trajectory refresh fails", async () => {
    apiMocks.getSessionProfessionalDecision.mockResolvedValue(
      decisionBundle([decisiveAction()]),
    );

    apiMocks.getActionExecutionFollowUp
      .mockResolvedValueOnce(
        executionFollowUp({
          execution_results: [],
        }),
      )
      .mockResolvedValueOnce(
        executionFollowUp({
          execution_results: [
            executionResult({
              id: 952,
              decisive_action_id: 501,
              attempt_number: 1,
              execution_status: "blocked",
              outcome_status: "unknown",
              observed_result: "Le décideur n’était pas disponible.",
            }),
          ],
        }),
      );

    apiMocks.getMyTrajectorySignal
      .mockResolvedValueOnce({})
      .mockRejectedValueOnce(
        new Error("trajectory projection unavailable"),
      );

    render(<DashboardPage />);

    expect(
      await screen.findByRole("region", {
        name: "Retour d’exécution",
      }),
    ).toBeInTheDocument();

    fireEvent.change(
      screen.getByLabelText("État de l’action"),
      {
        target: { value: "blocked" },
      },
    );

    fireEvent.change(
      screen.getByLabelText("Résultat observé"),
      {
        target: {
          value: "Le décideur n’était pas disponible.",
        },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Enregistrer le retour",
      }),
    );

    await waitFor(() => {
      expect(
        apiMocks.getMyTrajectorySignal,
      ).toHaveBeenCalledTimes(2);
    });

    const executionFollowUpRegion = screen.getByRole("region", {
      name: "Suivi d’exécution",
    });

    expect(
      within(executionFollowUpRegion).getByText(
        "Le décideur n’était pas disponible.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.queryByText("trajectory projection unavailable"),
    ).not.toBeInTheDocument();
  });

  it("resumes the latest non-terminal execution attempt with PUT instead of creating a new attempt", async () => {
    apiMocks.getSessionProfessionalDecision.mockResolvedValue(
      decisionBundle(
        [decisiveAction()],
        [leverDecision()],
      ),
    );

    apiMocks.getActionExecutionFollowUp
      .mockResolvedValueOnce(
        executionFollowUp({
          execution_results: [
            executionResult({
              id: 980,
              attempt_number: 2,
              execution_status: "in_progress",
              outcome_status: "unknown",
              observed_result: "Premier contact envoyé.",
              started_at: "2026-08-10T09:00:00Z",
            }),
          ],
        }),
      )
      .mockResolvedValueOnce(
        executionFollowUp({
          execution_results: [
            executionResult({
              id: 980,
              attempt_number: 2,
              execution_status: "completed",
              outcome_status: "achieved",
              observed_result: "Le contact a abouti.",
              started_at: "2026-08-10T09:00:00Z",
              completed_at: "2026-08-10T10:00:00Z",
            }),
          ],
        }),
      );

    render(<DashboardPage />);

    expect(
      await screen.findByRole("button", {
        name: "Mettre à jour cette tentative",
      }),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByLabelText("Résultat observé"),
      ).toHaveValue("Premier contact envoyé.");
    });

    fireEvent.change(
      screen.getByLabelText("État de l’action"),
      {
        target: { value: "completed" },
      },
    );

    fireEvent.change(
      screen.getByLabelText("Résultat"),
      {
        target: { value: "achieved" },
      },
    );

    fireEvent.change(
      screen.getByLabelText("Résultat observé"),
      {
        target: { value: "Le contact a abouti." },
      },
    );

    await waitFor(() => {
      expect(
        screen.getByLabelText("État de l’action"),
      ).toHaveValue("completed");
      expect(
        screen.getByLabelText("Résultat"),
      ).toHaveValue("achieved");
      expect(
        screen.getByLabelText("Résultat observé"),
      ).toHaveValue("Le contact a abouti.");
    });

    const updateButton = screen.getByRole("button", {
      name: "Mettre à jour cette tentative",
    });
    const updateForm = updateButton.closest("form");

    expect(updateForm).not.toBeNull();
    fireEvent.submit(updateForm!);

    await waitFor(() => {
      expect(
        apiMocks.finalizeExecutionResult,
      ).toHaveBeenCalledTimes(1);
    });

    expect(
      apiMocks.finalizeExecutionResult,
    ).toHaveBeenCalledWith(
      980,
      expect.objectContaining({
        execution_status: "completed",
        outcome_status: "achieved",
        observed_result: "Le contact a abouti.",
        started_at: "2026-08-10T09:00:00Z",
      }),
    );

    expect(
      apiMocks.recordActionExecutionResult,
    ).not.toHaveBeenCalled();
  });

  it("creates a new attempt when the latest persisted execution is terminal", async () => {
    apiMocks.getSessionProfessionalDecision.mockResolvedValue(
      decisionBundle([decisiveAction()]),
    );

    apiMocks.getActionExecutionFollowUp
      .mockResolvedValueOnce(
        executionFollowUp({
          execution_results: [
            executionResult({
              id: 981,
              attempt_number: 3,
              execution_status: "completed",
              outcome_status: "achieved",
              observed_result: "Tentative précédente terminée.",
            }),
          ],
        }),
      )
      .mockResolvedValueOnce(
        executionFollowUp({
          execution_results: [
            executionResult({
              id: 982,
              attempt_number: 4,
              execution_status: "in_progress",
              outcome_status: "unknown",
              observed_result: "Nouvelle tentative.",
            }),
          ],
        }),
      );

    render(<DashboardPage />);

    expect(
      await screen.findByRole("button", {
        name: "Enregistrer le retour",
      }),
    ).toBeInTheDocument();

    fireEvent.change(
      screen.getByLabelText("Résultat observé"),
      {
        target: { value: "Nouvelle tentative." },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Enregistrer le retour",
      }),
    );

    await waitFor(() => {
      expect(
        apiMocks.recordActionExecutionResult,
      ).toHaveBeenCalledTimes(1);
    });

    expect(
      apiMocks.recordActionExecutionResult.mock.calls[0][2],
    ).toBe(4);

    expect(
      apiMocks.finalizeExecutionResult,
    ).not.toHaveBeenCalled();
  });

  it("does not resume an older open attempt when a newer terminal attempt exists", async () => {
    apiMocks.getSessionProfessionalDecision.mockResolvedValue(
      decisionBundle([decisiveAction()]),
    );

    apiMocks.getActionExecutionFollowUp
      .mockResolvedValueOnce(
        executionFollowUp({
          execution_results: [
            executionResult({
              id: 970,
              attempt_number: 1,
              execution_status: "in_progress",
              outcome_status: "unknown",
              observed_result: "Ancienne tentative ouverte.",
            }),
            executionResult({
              id: 975,
              attempt_number: 2,
              execution_status: "completed",
              outcome_status: "achieved",
              observed_result: "Tentative la plus récente terminée.",
            }),
          ],
        }),
      )
      .mockResolvedValueOnce(
        executionFollowUp({
          execution_results: [
            executionResult({
              id: 976,
              attempt_number: 3,
              execution_status: "in_progress",
              outcome_status: "unknown",
              observed_result: "Nouvelle tentative après terminal.",
            }),
          ],
        }),
      );

    render(<DashboardPage />);

    expect(
      await screen.findByRole("button", {
        name: "Enregistrer le retour",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Résultat observé"),
    ).toHaveValue("");

    fireEvent.change(
      screen.getByLabelText("Résultat observé"),
      {
        target: {
          value: "Nouvelle tentative après terminal.",
        },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Enregistrer le retour",
      }),
    );

    await waitFor(() => {
      expect(
        apiMocks.recordActionExecutionResult,
      ).toHaveBeenCalledTimes(1);
    });

    expect(
      apiMocks.recordActionExecutionResult.mock.calls[0][2],
    ).toBe(3);

    expect(
      apiMocks.finalizeExecutionResult,
    ).not.toHaveBeenCalled();
  });

  it("refreshes follow-up after finalizing the existing attempt", async () => {
    apiMocks.getSessionProfessionalDecision.mockResolvedValue(
      decisionBundle([decisiveAction()]),
    );

    apiMocks.getActionExecutionFollowUp
      .mockResolvedValueOnce(
        executionFollowUp({
          execution_results: [
            executionResult({
              id: 983,
              attempt_number: 1,
              execution_status: "in_progress",
              outcome_status: "unknown",
              observed_result: "Travail en cours.",
            }),
          ],
        }),
      )
      .mockResolvedValueOnce(
        executionFollowUp({
          execution_results: [
            executionResult({
              id: 983,
              attempt_number: 1,
              execution_status: "blocked",
              outcome_status: "unknown",
              observed_result: "Blocage confirmé.",
            }),
          ],
        }),
      );

    render(<DashboardPage />);

    expect(
      await screen.findByRole("button", {
        name: "Mettre à jour cette tentative",
      }),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByLabelText("Résultat observé"),
      ).toHaveValue("Travail en cours.");
    });

    fireEvent.change(
      screen.getByLabelText("État de l’action"),
      {
        target: { value: "blocked" },
      },
    );

    fireEvent.change(
      screen.getByLabelText("Résultat observé"),
      {
        target: { value: "Blocage confirmé." },
      },
    );

    await waitFor(() => {
      expect(
        screen.getByLabelText("État de l’action"),
      ).toHaveValue("blocked");
      expect(
        screen.getByLabelText("Résultat observé"),
      ).toHaveValue("Blocage confirmé.");
    });

    const updateButton = screen.getByRole("button", {
      name: "Mettre à jour cette tentative",
    });
    const updateForm = updateButton.closest("form");

    expect(updateForm).not.toBeNull();
    fireEvent.submit(updateForm!);

    await waitFor(() => {
      expect(
        apiMocks.finalizeExecutionResult,
      ).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(
        apiMocks.getActionExecutionFollowUp,
      ).toHaveBeenCalledTimes(2);
    });

    const executionFollowUpRegion = screen.getByRole("region", {
      name: "Suivi d’exécution",
    });

    expect(
      within(executionFollowUpRegion).getByText(
        "Blocage confirmé.",
      ),
    ).toBeInTheDocument();
  });

  it("returns the execution form to fresh-attempt mode after finalizing the latest open attempt", async () => {
    apiMocks.getSessionProfessionalDecision.mockResolvedValue(
      decisionBundle([decisiveAction()]),
    );

    apiMocks.getActionExecutionFollowUp
      .mockResolvedValueOnce(
        executionFollowUp({
          execution_results: [
            executionResult({
              id: 990,
              attempt_number: 2,
              execution_status: "in_progress",
              outcome_status: "unknown",
              observed_result: "Tentative en cours.",
              started_at: "2026-08-11T08:00:00Z",
            }),
          ],
        }),
      )
      .mockResolvedValueOnce(
        executionFollowUp({
          execution_results: [
            executionResult({
              id: 990,
              attempt_number: 2,
              execution_status: "completed",
              outcome_status: "achieved",
              observed_result: "Tentative finalisée.",
              started_at: "2026-08-11T08:00:00Z",
              completed_at: "2026-08-11T09:00:00Z",
            }),
          ],
        }),
      );

    render(<DashboardPage />);

    expect(
      await screen.findByRole("button", {
        name: "Mettre à jour cette tentative",
      }),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByLabelText("Résultat observé"),
      ).toHaveValue("Tentative en cours.");
    });

    fireEvent.change(
      screen.getByLabelText("État de l’action"),
      {
        target: { value: "completed" },
      },
    );

    fireEvent.change(
      screen.getByLabelText("Résultat"),
      {
        target: { value: "achieved" },
      },
    );

    fireEvent.change(
      screen.getByLabelText("Résultat observé"),
      {
        target: { value: "Tentative finalisée." },
      },
    );

    await waitFor(() => {
      expect(
        screen.getByLabelText("État de l’action"),
      ).toHaveValue("completed");
      expect(
        screen.getByLabelText("Résultat"),
      ).toHaveValue("achieved");
      expect(
        screen.getByLabelText("Résultat observé"),
      ).toHaveValue("Tentative finalisée.");
    });

    const updateButton = screen.getByRole("button", {
      name: "Mettre à jour cette tentative",
    });
    const updateForm = updateButton.closest("form");

    expect(updateForm).not.toBeNull();
    fireEvent.submit(updateForm!);

    await waitFor(() => {
      expect(
        apiMocks.finalizeExecutionResult,
      ).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(
        apiMocks.getActionExecutionFollowUp,
      ).toHaveBeenCalledTimes(2);
    });

    expect(
      await screen.findByRole("button", {
        name: "Enregistrer le retour",
      }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", {
        name: "Mettre à jour cette tentative",
      }),
    ).not.toBeInTheDocument();

    expect(
      screen.getByLabelText("État de l’action"),
    ).toHaveValue("in_progress");

    expect(
      screen.getByLabelText("Résultat"),
    ).toHaveValue("unknown");

    expect(
      screen.getByLabelText("Résultat observé"),
    ).toHaveValue("");

    expect(
      apiMocks.recordActionExecutionResult,
    ).not.toHaveBeenCalled();
  });

  it("refreshes trajectory after finalizing an existing attempt into a terminal state", async () => {
    apiMocks.getSessionProfessionalDecision.mockResolvedValue(
      decisionBundle([decisiveAction()]),
    );

    apiMocks.getActionExecutionFollowUp
      .mockResolvedValueOnce(
        executionFollowUp({
          execution_results: [
            executionResult({
              id: 995,
              attempt_number: 1,
              execution_status: "in_progress",
              outcome_status: "unknown",
              observed_result: "Action en cours.",
              started_at: "2026-08-11T08:00:00Z",
            }),
          ],
        }),
      )
      .mockResolvedValueOnce(
        executionFollowUp({
          execution_results: [
            executionResult({
              id: 995,
              attempt_number: 1,
              execution_status: "completed",
              outcome_status: "achieved",
              observed_result: "Résultat confirmé.",
              started_at: "2026-08-11T08:00:00Z",
              completed_at: "2026-08-11T09:00:00Z",
            }),
          ],
        }),
      );

    apiMocks.getMyTrajectorySignal
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({
        trajectory_update_id: 1301,
        source_session_id: 77,
        source_context_snapshot_id: 101,
        source_decisive_action_id: 501,
        source_execution_result_id: 995,
        trajectory_signal: "positive",
        trajectory_summary:
          "La tentative finalisée confirme une progression exploitable.",
        attention_shift: {},
        learned_constraints: [],
        capability_signals: [],
        effective_lever_signals: [],
        next_attention_candidates: [],
        recommended_next_focus:
          "Capitaliser sur ce résultat dans la prochaine action.",
        confidence: 0.9,
      });

    render(<DashboardPage />);

    expect(
      await screen.findByRole("button", {
        name: "Mettre à jour cette tentative",
      }),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByLabelText("Résultat observé"),
      ).toHaveValue("Action en cours.");
    });

    fireEvent.change(
      screen.getByLabelText("État de l’action"),
      {
        target: { value: "completed" },
      },
    );

    fireEvent.change(
      screen.getByLabelText("Résultat"),
      {
        target: { value: "achieved" },
      },
    );

    fireEvent.change(
      screen.getByLabelText("Résultat observé"),
      {
        target: { value: "Résultat confirmé." },
      },
    );

    await waitFor(() => {
      expect(
        screen.getByLabelText("État de l’action"),
      ).toHaveValue("completed");
      expect(
        screen.getByLabelText("Résultat"),
      ).toHaveValue("achieved");
      expect(
        screen.getByLabelText("Résultat observé"),
      ).toHaveValue("Résultat confirmé.");
    });

    const updateButton = screen.getByRole("button", {
      name: "Mettre à jour cette tentative",
    });
    const updateForm = updateButton.closest("form");

    expect(updateForm).not.toBeNull();
    fireEvent.submit(updateForm!);

    await waitFor(() => {
      expect(
        apiMocks.finalizeExecutionResult,
      ).toHaveBeenCalledTimes(1);
    });

    expect(
      apiMocks.recordActionExecutionResult,
    ).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(
        apiMocks.getActionExecutionFollowUp,
      ).toHaveBeenCalledTimes(2);
    });

    await waitFor(() => {
      expect(
        apiMocks.getMyTrajectorySignal,
      ).toHaveBeenCalledTimes(2);
    });

    await waitFor(() => {
      expect(
        within(
          screen.getByTestId("trajectory-signal-card"),
        ).getByText(
          "La tentative finalisée confirme une progression exploitable.",
        ),
      ).toBeInTheDocument();
    });
  });

  it("does not refresh trajectory when updating an existing attempt that remains non-terminal", async () => {
    apiMocks.getSessionProfessionalDecision.mockResolvedValue(
      decisionBundle([decisiveAction()]),
    );

    apiMocks.getActionExecutionFollowUp
      .mockResolvedValueOnce(
        executionFollowUp({
          execution_results: [
            executionResult({
              id: 996,
              attempt_number: 1,
              execution_status: "in_progress",
              outcome_status: "unknown",
              observed_result: "Premier signal enregistré.",
              started_at: "2026-08-11T08:00:00Z",
            }),
          ],
        }),
      )
      .mockResolvedValueOnce(
        executionFollowUp({
          execution_results: [
            executionResult({
              id: 996,
              attempt_number: 1,
              execution_status: "in_progress",
              outcome_status: "unknown",
              observed_result: "Deuxième signal enregistré.",
              started_at: "2026-08-11T08:00:00Z",
            }),
          ],
        }),
      );

    apiMocks.getMyTrajectorySignal.mockResolvedValue({});

    render(<DashboardPage />);

    expect(
      await screen.findByRole("button", {
        name: "Mettre à jour cette tentative",
      }),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByLabelText("Résultat observé"),
      ).toHaveValue("Premier signal enregistré.");
    });

    fireEvent.change(
      screen.getByLabelText("Résultat observé"),
      {
        target: { value: "Deuxième signal enregistré." },
      },
    );

    await waitFor(() => {
      expect(
        screen.getByLabelText("État de l’action"),
      ).toHaveValue("in_progress");
      expect(
        screen.getByLabelText("Résultat"),
      ).toHaveValue("unknown");
      expect(
        screen.getByLabelText("Résultat observé"),
      ).toHaveValue("Deuxième signal enregistré.");
    });

    const updateButton = screen.getByRole("button", {
      name: "Mettre à jour cette tentative",
    });
    const updateForm = updateButton.closest("form");

    expect(updateForm).not.toBeNull();
    fireEvent.submit(updateForm!);

    await waitFor(() => {
      expect(
        apiMocks.finalizeExecutionResult,
      ).toHaveBeenCalledTimes(1);
    });

    expect(
      apiMocks.recordActionExecutionResult,
    ).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(
        apiMocks.getActionExecutionFollowUp,
      ).toHaveBeenCalledTimes(2);
    });

    expect(
      apiMocks.getMyTrajectorySignal,
    ).toHaveBeenCalledTimes(1);

    expect(
      screen.getByRole("button", {
        name: "Mettre à jour cette tentative",
      }),
    ).toBeInTheDocument();

    const executionFollowUpRegion = screen.getByRole("region", {
      name: "Suivi d’exécution",
    });

    expect(
      within(executionFollowUpRegion).getByText(
        "Deuxième signal enregistré.",
      ),
    ).toBeInTheDocument();
  });

  it("transitions a successful non-terminal POST into edit mode for the persisted open attempt", async () => {
    apiMocks.getSessionProfessionalDecision.mockResolvedValue(
      decisionBundle([decisiveAction()]),
    );

    apiMocks.getActionExecutionFollowUp
      .mockResolvedValueOnce(
        executionFollowUp({
          execution_results: [],
        }),
      )
      .mockResolvedValueOnce(
        executionFollowUp({
          execution_results: [
            executionResult({
              id: 997,
              attempt_number: 1,
              execution_status: "in_progress",
              outcome_status: "unknown",
              observed_result: "Premier contact enregistré.",
              worker_reflection: "Le premier pas est fait.",
              worker_confidence_after: 0.85,
            }),
          ],
        }),
      );

    render(<DashboardPage />);

    expect(
      await screen.findByRole("button", {
        name: "Enregistrer le retour",
      }),
    ).toBeInTheDocument();

    fireEvent.change(
      screen.getByLabelText("Résultat observé"),
      {
        target: { value: "Premier contact enregistré." },
      },
    );

    fireEvent.change(
      screen.getByLabelText("Ton retour"),
      {
        target: { value: "Le premier pas est fait." },
      },
    );

    fireEvent.change(
      screen.getByLabelText("Confiance après cette tentative"),
      {
        target: { value: "85" },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Enregistrer le retour",
      }),
    );

    await waitFor(() => {
      expect(
        apiMocks.recordActionExecutionResult,
      ).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(
        apiMocks.getActionExecutionFollowUp,
      ).toHaveBeenCalledTimes(2);
    });

    const executionFollowUpRegion = screen.getByRole("region", {
      name: "Suivi d’exécution",
    });

    expect(
      within(executionFollowUpRegion).getByText(
        "Premier contact enregistré.",
      ),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByRole("button", {
          name: "Mettre à jour cette tentative",
        }),
      ).toBeInTheDocument();

      expect(
        screen.getByLabelText("État de l’action"),
      ).toHaveValue("in_progress");

      expect(
        screen.getByLabelText("Résultat"),
      ).toHaveValue("unknown");

      expect(
        screen.getByLabelText("Résultat observé"),
      ).toHaveValue("Premier contact enregistré.");

      expect(
        screen.getByLabelText("Ton retour"),
      ).toHaveValue("Le premier pas est fait.");

      expect(
        screen.getByLabelText("Confiance après cette tentative"),
      ).toHaveValue("85");
    });

    expect(
      screen.queryByRole("button", {
        name: "Enregistrer le retour",
      }),
    ).not.toBeInTheDocument();

    expect(
      apiMocks.finalizeExecutionResult,
    ).not.toHaveBeenCalled();
  });

  it("reads trajectory first, reconciles when stale, then refreshes after successful recovery", async () => {
    apiMocks.getSessionProfessionalDecision.mockResolvedValue(
      decisionBundle([decisiveAction()]),
    );

    apiMocks.getActionExecutionFollowUp
      .mockResolvedValueOnce(
        executionFollowUp({
          execution_results: [],
        }),
      )
      .mockResolvedValueOnce(
        executionFollowUp({
          execution_results: [
            executionResult({
              id: 998,
              attempt_number: 1,
              execution_status: "completed",
              outcome_status: "achieved",
              observed_result: "Résultat terminal confirmé.",
            }),
          ],
        }),
      );

    apiMocks.recordActionExecutionResult.mockResolvedValue(
      executionResult({
        id: 998,
        attempt_number: 1,
        execution_status: "completed",
        outcome_status: "achieved",
        observed_result: "Résultat terminal confirmé.",
      }),
    );

    apiMocks.reconcilePendingTrajectory.mockResolvedValue({
      id: 1301,
      worker_id: 1,
      source_session_id: 77,
      context_snapshot_id: 101,
      decisive_action_id: 501,
      execution_result_id: 998,
      trajectory_signal: "positive",
      trajectory_summary: "Progression consolidée.",
      attention_shift_json: {},
      intention_progress_evidence_json: [],
      mandate_preservation_evidence_json: [],
      attention_resolution_score: 0.8,
      intention_progress_score: 0.7,
      mandate_preservation_score: 1,
      learned_constraints_json: [],
      capability_signals_json: [],
      effective_lever_signals_json: [],
      next_attention_candidates_json: [],
      recommended_next_focus: "Consolider le prochain mouvement.",
      confidence: 0.85,
      rationale_json: {},
      created_at: "2026-08-11T09:45:00Z",
    });

    apiMocks.getMyTrajectorySignal
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({
        trajectory_update_id: 1301,
        source_session_id: 77,
        source_context_snapshot_id: 101,
        source_decisive_action_id: 501,
        source_execution_result_id: 998,
        trajectory_signal: "positive",
        trajectory_summary: "Progression consolidée.",
        attention_shift: {},
        learned_constraints: [],
        capability_signals: [],
        effective_lever_signals: [],
        next_attention_candidates: [],
        recommended_next_focus: "Consolider le prochain mouvement.",
        confidence: 0.85,
      });

    render(<DashboardPage />);

    expect(
      await screen.findByRole("button", {
        name: "Enregistrer le retour",
      }),
    ).toBeInTheDocument();

    fireEvent.change(
      screen.getByLabelText("État de l’action"),
      {
        target: { value: "completed" },
      },
    );
    fireEvent.change(
      screen.getByLabelText("Résultat"),
      {
        target: { value: "achieved" },
      },
    );
    fireEvent.change(
      screen.getByLabelText("Résultat observé"),
      {
        target: { value: "Résultat terminal confirmé." },
      },
    );

    await waitFor(() => {
      expect(
        screen.getByLabelText("État de l’action"),
      ).toHaveValue("completed");
      expect(
        screen.getByLabelText("Résultat"),
      ).toHaveValue("achieved");
      expect(
        screen.getByLabelText("Résultat observé"),
      ).toHaveValue("Résultat terminal confirmé.");
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Enregistrer le retour",
      }),
    );

    await waitFor(() => {
      expect(
        apiMocks.reconcilePendingTrajectory,
      ).toHaveBeenCalledTimes(1);
      expect(
        apiMocks.getMyTrajectorySignal,
      ).toHaveBeenCalledTimes(3);
    });

    const postExecutionReadOrder =
      apiMocks.getMyTrajectorySignal.mock.invocationCallOrder[1];
    const reconcileOrder =
      apiMocks.reconcilePendingTrajectory.mock.invocationCallOrder[0];
    const recoveredTrajectoryRefreshOrder =
      apiMocks.getMyTrajectorySignal.mock.invocationCallOrder[2];

    expect(postExecutionReadOrder).toBeLessThan(
      reconcileOrder,
    );
    expect(reconcileOrder).toBeLessThan(
      recoveredTrajectoryRefreshOrder,
    );

    expect(
      screen.getByText("Progression consolidée."),
    ).toBeInTheDocument();
  });

  it("keeps terminal execution visible and still refreshes trajectory when reconciliation fails", async () => {
    apiMocks.getSessionProfessionalDecision.mockResolvedValue(
      decisionBundle([decisiveAction()]),
    );

    apiMocks.getActionExecutionFollowUp
      .mockResolvedValueOnce(
        executionFollowUp({
          execution_results: [],
        }),
      )
      .mockResolvedValueOnce(
        executionFollowUp({
          execution_results: [
            executionResult({
              id: 999,
              attempt_number: 1,
              execution_status: "blocked",
              outcome_status: "not_achieved",
              observed_result: "Blocage confirmé.",
            }),
          ],
        }),
      );

    apiMocks.recordActionExecutionResult.mockResolvedValue(
      executionResult({
        id: 999,
        attempt_number: 1,
        execution_status: "blocked",
        outcome_status: "not_achieved",
        observed_result: "Blocage confirmé.",
      }),
    );

    apiMocks.reconcilePendingTrajectory.mockRejectedValue(
      new Error("temporary reconciliation failure"),
    );

    apiMocks.getMyTrajectorySignal
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({
        trajectory_update_id: 1299,
        source_session_id: 76,
        source_context_snapshot_id: 100,
        source_decisive_action_id: 500,
        source_execution_result_id: 900,
        trajectory_signal: "mixed",
        trajectory_summary: "Signal précédent conservé.",
        attention_shift: {},
        learned_constraints: [],
        capability_signals: [],
        effective_lever_signals: [],
        next_attention_candidates: [],
        recommended_next_focus: null,
        confidence: 0.6,
      });

    render(<DashboardPage />);

    expect(
      await screen.findByRole("button", {
        name: "Enregistrer le retour",
      }),
    ).toBeInTheDocument();

    fireEvent.change(
      screen.getByLabelText("État de l’action"),
      {
        target: { value: "blocked" },
      },
    );
    fireEvent.change(
      screen.getByLabelText("Résultat"),
      {
        target: { value: "not_achieved" },
      },
    );
    fireEvent.change(
      screen.getByLabelText("Résultat observé"),
      {
        target: { value: "Blocage confirmé." },
      },
    );

    await waitFor(() => {
      expect(
        screen.getByLabelText("État de l’action"),
      ).toHaveValue("blocked");
      expect(
        screen.getByLabelText("Résultat"),
      ).toHaveValue("not_achieved");
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Enregistrer le retour",
      }),
    );

    await waitFor(() => {
      expect(
        apiMocks.reconcilePendingTrajectory,
      ).toHaveBeenCalledTimes(1);
      expect(
        apiMocks.getMyTrajectorySignal,
      ).toHaveBeenCalledTimes(2);
    });

    const executionFollowUpRegion = screen.getByRole("region", {
      name: "Suivi d’exécution",
    });

    expect(
      within(executionFollowUpRegion).getByText(
        "Blocage confirmé.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Signal précédent conservé."),
    ).toBeInTheDocument();
  });

  it("does not reconcile pending trajectory for non-terminal feedback", async () => {
    apiMocks.getSessionProfessionalDecision.mockResolvedValue(
      decisionBundle([decisiveAction()]),
    );

    apiMocks.getActionExecutionFollowUp
      .mockResolvedValueOnce(
        executionFollowUp({
          execution_results: [],
        }),
      )
      .mockResolvedValueOnce(
        executionFollowUp({
          execution_results: [
            executionResult({
              id: 1000,
              attempt_number: 1,
              execution_status: "in_progress",
              outcome_status: "unknown",
              observed_result: "Action toujours en cours.",
            }),
          ],
        }),
      );

    render(<DashboardPage />);

    expect(
      await screen.findByRole("button", {
        name: "Enregistrer le retour",
      }),
    ).toBeInTheDocument();

    fireEvent.change(
      screen.getByLabelText("Résultat observé"),
      {
        target: { value: "Action toujours en cours." },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Enregistrer le retour",
      }),
    );

    await waitFor(() => {
      expect(
        apiMocks.recordActionExecutionResult,
      ).toHaveBeenCalledTimes(1);
      expect(
        apiMocks.getActionExecutionFollowUp,
      ).toHaveBeenCalledTimes(2);
    });

    expect(
      apiMocks.reconcilePendingTrajectory,
    ).not.toHaveBeenCalled();

    expect(
      apiMocks.getMyTrajectorySignal,
    ).toHaveBeenCalledTimes(1);
  });

  it("keeps Wave 2 lineage and scoring fields out of the worker-facing DOM", async () => {
    apiMocks.getSessionProfessionalDecision.mockResolvedValue(
      decisionBundle([
        decisiveAction({
          id: 991,
          context_snapshot_id: 881,
          context_alignment_id: 771,
          selected_candidate_id: 661,
          attention_relevance_score: 0.912345,
          intention_progress_score: 0.823456,
          mandate_alignment_score: 0.934567,
          decisiveness_score: 0.845678,
          overall_validity_score: 0.654321,
        }),
      ]),
    );

    render(<DashboardPage />);

    expect(
      await screen.findByText("Contacter un recruteur ciblé"),
    ).toBeInTheDocument();

    for (const hiddenValue of [
      "991",
      "881",
      "771",
      "661",
      "0.912345",
      "0.823456",
      "0.934567",
      "0.845678",
      "0.654321",
    ]) {
      expect(
        screen.queryByText(hiddenValue),
      ).not.toBeInTheDocument();
    }
  });
});