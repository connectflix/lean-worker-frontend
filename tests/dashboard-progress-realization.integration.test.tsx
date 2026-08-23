import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import DashboardPage from "@/app/dashboard/page";
import type {
  DecisiveActionResponse,
  ExecutionFollowUpResponse,
  ExecutionResultRecord,
  ExecutionResultResponse,
  ProfessionalDecisionBundleResponse,
  ProgressRealizationResponse,
  TrajectorySignalResponse,
  TrajectoryUpdateResponse,
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
  getRecommendations: vi.fn(),
  getSessionProfessionalDecision: vi.fn(),
  getTalentTrajectoryIntelligence: vi.fn(),
  reconcilePendingTrajectory: vi.fn(),
  recordActionExecutionResult: vi.fn(),
  recordProgressExperience: vi.fn(),
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

vi.mock("@/components/trajectory-signal-card", () => ({
  TrajectorySignalCard: ({
    signal,
  }: {
    signal: TrajectorySignalResponse;
  }) => (
    <div data-testid="trajectory-signal-card">
      {signal.recommended_next_focus ?? "no-trajectory-signal"}
    </div>
  ),
}));

vi.mock("@/components/execution-feedback-form", () => ({
  ExecutionFeedbackForm: ({
    onSubmit,
  }: {
    onSubmit: (record: ExecutionResultRecord) => Promise<void>;
  }) => (
    <button
      type="button"
      onClick={() =>
        void onSubmit({
          execution_status: "completed",
          outcome_status: "achieved",
          observed_result: "Un signal concret a été obtenu.",
          worker_reflection: "Le contact a répondu.",
          evidence: [{ text: "Réponse reçue" }],
          blockers: [],
          outcome_score: 0.8,
          worker_confidence_after: 0.8,
          lever_used: false,
          lever_helpfulness_score: null,
          lever_usage_evidence: [],
          started_at: null,
          completed_at: null,
        })
      }
    >
      Submit terminal execution
    </button>
  ),
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

function decisiveAction(): DecisiveActionResponse {
  return {
    id: 501,
    worker_id: 1,
    session_id: 77,
    context_snapshot_id: 101,
    context_alignment_id: 202,
    selected_candidate_id: 401,
    selection_reason: "Cette action est la meilleure option valide.",
    decision_confidence: 0.91,
    sequence: 1,
    title: "Contacter un recruteur ciblé",
    description: "Envoyer un message ciblé.",
    expected_outcome: "Obtenir un signal concret.",
    time_horizon: "48 heures",
    deadline_at: null,
    success_criteria_json: ["Une réponse exploitable est obtenue."],
    attention_resolution: "Réduit l'incertitude actuelle.",
    intention_progress: "Fait progresser le positionnement.",
    mandate_alignment: "Préserve la stabilité.",
    attention_relevance_score: 0.9,
    intention_progress_score: 0.88,
    mandate_alignment_score: 0.96,
    decisiveness_score: 0.89,
    overall_validity_score: 0.87,
    risks_json: [],
    mandate_veto_cleared: true,
    respected_blocking_constraint_codes_json: [],
    status: "selected",
    created_at: "2026-08-12T10:00:00Z",
    updated_at: "2026-08-12T10:00:00Z",
  };
}

function decisionBundle(): ProfessionalDecisionBundleResponse {
  return {
    action_candidates: [],
    decisive_actions: [decisiveAction()],
    execution_gaps: [],
    lever_decisions: [],
    lever_candidate_evaluations: [],
  };
}

function executionResult(): ExecutionResultResponse {
  return {
    id: 901,
    worker_id: 1,
    session_id: 77,
    context_snapshot_id: 101,
    decisive_action_id: 501,
    lever_decision_id: null,
    commercial_offer_resolution_id: null,
    attempt_number: 1,
    execution_status: "completed",
    outcome_status: "achieved",
    observed_result: "Un signal concret a été obtenu.",
    worker_reflection: "Le contact a répondu.",
    evidence_json: [{ text: "Réponse reçue" }],
    blockers_json: [],
    outcome_score: 0.8,
    worker_confidence_after: 0.8,
    lever_used: false,
    lever_helpfulness_score: null,
    lever_usage_evidence_json: [],
    started_at: null,
    completed_at: "2026-08-12T12:00:00Z",
    recorded_at: "2026-08-12T12:00:00Z",
    created_at: "2026-08-12T12:00:00Z",
    updated_at: "2026-08-12T12:00:00Z",
  };
}

function followUp(
  executions: ExecutionResultResponse[] = [],
): ExecutionFollowUpResponse {
  return {
    decisive_action_id: 501,
    execution_results: executions,
  };
}

function trajectoryUpdate(id = 51): TrajectoryUpdateResponse {
  return {
    id,
    worker_id: 1,
    source_session_id: 77,
    context_snapshot_id: 101,
    decisive_action_id: 501,
    execution_result_id: 901,
    trajectory_signal: "positive",
    trajectory_summary: "Un signal professionnel concret a été établi.",
    attention_shift_json: {},
    intention_progress_evidence_json: [],
    mandate_preservation_evidence_json: [],
    attention_resolution_score: 0.8,
    intention_progress_score: 0.8,
    mandate_preservation_score: 1,
    learned_constraints_json: [],
    capability_signals_json: [],
    effective_lever_signals_json: [],
    next_attention_candidates_json: [],
    recommended_next_focus: "Préparer le prochain mouvement.",
    confidence: 0.86,
    rationale_json: {},
    created_at: "2026-08-12T12:01:00Z",
  };
}

function progressRealization(): ProgressRealizationResponse {
  return {
    progress_type: "learning_progress",
    progress_confirmed: true,
    change_summary: "Une incertitude professionnelle a été réduite.",
    why_it_matters_now: "La prochaine décision repose sur un signal réel.",
    intention_connection: "Ce signal rapproche le Worker de sa direction visée.",
    mandate_connection: "La stabilité professionnelle reste préservée.",
    evidence: [{ text: "Réponse reçue" }],
    learning_value: "Le marché répond à ce positionnement.",
    worker_message: "Tu disposes maintenant d'un signal concret du marché.",
    reflection_prompt: "Qu'est-ce que ce signal change pour toi ?",
    confidence: 0.82,
    experienced_progress: null,
    worker_explanation: null,
  };
}

function progressRealizationWithExperience(
  experiencedProgress: "not_really" | "a_little" | "clearly",
  workerExplanation: string | null,
): ProgressRealizationResponse {
  return {
    ...progressRealization(),
    experienced_progress: experiencedProgress,
    worker_explanation: workerExplanation,
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
        summary: "Session close",
        started_at: "2026-08-12T09:00:00Z",
        ended_at: "2026-08-12T10:00:00Z",
      },
    ],
    recent_recommendations: [],
  });
  apiMocks.getDashboardTimeline.mockResolvedValue([]);
  apiMocks.getCurrentOpenSession.mockResolvedValue(null);
  apiMocks.getCareerBlueprint.mockResolvedValue({
    is_completed: true,
  });
  apiMocks.getCareerGap.mockResolvedValue(null);
  apiMocks.getCareerTrajectory.mockResolvedValue(null);
  apiMocks.getCareerTrajectoryIntelligence.mockResolvedValue(null);
  apiMocks.getLongTermCareerTrajectory.mockResolvedValue(null);
  apiMocks.getTalentTrajectoryIntelligence.mockResolvedValue(null);
  apiMocks.getRecommendations.mockResolvedValue([]);
  apiMocks.getSessionProfessionalDecision.mockResolvedValue(decisionBundle());
  apiMocks.getActionExecutionFollowUp
    .mockResolvedValueOnce(followUp([]))
    .mockResolvedValue(followUp([executionResult()]));
  apiMocks.recordActionExecutionResult.mockResolvedValue(executionResult());
  apiMocks.finalizeExecutionResult.mockResolvedValue(executionResult());
  apiMocks.getMyTrajectorySignal.mockResolvedValue({
    trajectory_update_id: 51,
    trajectory_signal: "positive",
    trajectory_summary: "Un signal professionnel concret a été établi.",
    recommended_next_focus: "Préparer le prochain mouvement.",
    confidence: 0.86,
  } satisfies TrajectorySignalResponse);
  apiMocks.reconcilePendingTrajectory.mockResolvedValue(trajectoryUpdate());
  apiMocks.createProgressRealization.mockResolvedValue(progressRealization());
  apiMocks.recordProgressExperience.mockResolvedValue(
    progressRealizationWithExperience(
      "not_really",
      "Je ne ressens pas encore cette progression.",
    ),
  );
}

describe("Dashboard Progress Realization integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setSuccessfulDashboardDefaults();
  });

  it("creates Progress Realization after terminal execution using reconciled trajectory id", async () => {
    render(<DashboardPage />);

    const submit = await screen.findByRole("button", {
      name: "Submit terminal execution",
    });

    fireEvent.click(submit);

    await waitFor(() => {
      expect(apiMocks.reconcilePendingTrajectory).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(apiMocks.createProgressRealization).toHaveBeenCalledWith(51);
    });

    expect(apiMocks.createProgressRealization).toHaveBeenCalledTimes(1);
  });

  it("falls back to trajectory signal id when reconciliation returns null", async () => {
    apiMocks.reconcilePendingTrajectory.mockResolvedValueOnce(null);
    apiMocks.getMyTrajectorySignal
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({
        trajectory_update_id: 73,
        trajectory_signal: "positive",
        recommended_next_focus: "Préparer la suite.",
        confidence: 0.84,
      } satisfies TrajectorySignalResponse);

    render(<DashboardPage />);

    const submit = await screen.findByRole("button", {
      name: "Submit terminal execution",
    });

    fireEvent.click(submit);

    await waitFor(() => {
      expect(apiMocks.createProgressRealization).toHaveBeenCalledWith(73);
    });
  });

  it("renders the worker-facing Progress Realization without internal technical fields", async () => {
    render(<DashboardPage />);

    const submit = await screen.findByRole("button", {
      name: "Submit terminal execution",
    });

    fireEvent.click(submit);

    expect(
      await screen.findByText("Ce qui a réellement changé"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Tu disposes maintenant d'un signal concret du marché."),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Une incertitude professionnelle a été réduite."),
    ).toBeInTheDocument();

    expect(
      screen.getByText("La prochaine décision repose sur un signal réel."),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Ce signal rapproche le Worker de sa direction visée."),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Le marché répond à ce positionnement."),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Qu'est-ce que ce signal change pour toi ?"),
    ).toBeInTheDocument();

    expect(screen.queryByText("0.82")).not.toBeInTheDocument();
    expect(screen.queryByText("worker_id")).not.toBeInTheDocument();
    expect(screen.queryByText("trajectory_update_id")).not.toBeInTheDocument();
  });

  it("keeps execution and trajectory visible when Progress Realization fails", async () => {
    apiMocks.createProgressRealization.mockRejectedValueOnce(
      new Error("Progress Realization unavailable"),
    );

    render(<DashboardPage />);

    const submit = await screen.findByRole("button", {
      name: "Submit terminal execution",
    });

    fireEvent.click(submit);

    await waitFor(() => {
      expect(apiMocks.createProgressRealization).toHaveBeenCalledWith(51);
    });

    expect(
      await screen.findByText("Préparer le prochain mouvement."),
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("execution-follow-up-card"),
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Progress Realization unavailable"),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("Ce qui a réellement changé"),
    ).not.toBeInTheDocument();
  });

  it("records the Worker experience against the same trajectory realization", async () => {
    render(<DashboardPage />);

    fireEvent.click(
      await screen.findByRole("button", {
        name: "Submit terminal execution",
      }),
    );

    await screen.findByText("Ce qui a réellement changé");

    fireEvent.click(
      screen.getByRole("radio", {
        name: /Pas vraiment/i,
      }),
    );

    fireEvent.change(
      screen.getByLabelText("Qu’est-ce qui te fait répondre ainsi ?"),
      {
        target: {
          value: "Je ne ressens pas encore cette progression.",
        },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Enregistrer mon ressenti",
      }),
    );

    await waitFor(() => {
      expect(apiMocks.recordProgressExperience).toHaveBeenCalledTimes(1);
    });

    expect(apiMocks.recordProgressExperience).toHaveBeenCalledWith(51, {
      experienced_progress: "not_really",
      worker_explanation: "Je ne ressens pas encore cette progression.",
    });
  });

  it("updates the local Progress Realization from the experienced-progress response", async () => {
    apiMocks.recordProgressExperience.mockResolvedValueOnce(
      progressRealizationWithExperience(
        "clearly",
        "Je vois maintenant concrètement l'évolution.",
      ),
    );

    render(<DashboardPage />);

    fireEvent.click(
      await screen.findByRole("button", {
        name: "Submit terminal execution",
      }),
    );

    await screen.findByText("Ce qui a réellement changé");

    fireEvent.click(
      screen.getByRole("radio", {
        name: /Clairement/i,
      }),
    );

    fireEvent.change(
      screen.getByLabelText("Qu’est-ce qui te fait répondre ainsi ?"),
      {
        target: {
          value: "Je vois maintenant concrètement l'évolution.",
        },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Enregistrer mon ressenti",
      }),
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", {
          name: "Mettre à jour mon ressenti",
        }),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByRole("radio", {
        name: /Clairement/i,
      }),
    ).toBeChecked();

    expect(
      screen.getByLabelText("Qu’est-ce qui te fait répondre ainsi ?"),
    ).toHaveValue("Je vois maintenant concrètement l'évolution.");
  });

  it("preserves observed progress when the Worker says not_really", async () => {
    apiMocks.recordProgressExperience.mockResolvedValueOnce(
      progressRealizationWithExperience(
        "not_really",
        "Je comprends le signal mais je ne le ressens pas.",
      ),
    );

    render(<DashboardPage />);

    fireEvent.click(
      await screen.findByRole("button", {
        name: "Submit terminal execution",
      }),
    );

    await screen.findByText("Ce qui a réellement changé");

    fireEvent.click(
      screen.getByRole("radio", {
        name: /Pas vraiment/i,
      }),
    );

    fireEvent.change(
      screen.getByLabelText("Qu’est-ce qui te fait répondre ainsi ?"),
      {
        target: {
          value: "Je comprends le signal mais je ne le ressens pas.",
        },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Enregistrer mon ressenti",
      }),
    );

    await waitFor(() => {
      expect(apiMocks.recordProgressExperience).toHaveBeenCalledTimes(1);
    });

    expect(
      screen.getByText("Tu disposes maintenant d'un signal concret du marché."),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Une incertitude professionnelle a été réduite."),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("radio", {
        name: /Pas vraiment/i,
      }),
    ).toBeChecked();
  });

  it("keeps observed Progress Realization visible when experienced-progress persistence fails", async () => {
    apiMocks.recordProgressExperience.mockRejectedValueOnce(
      new Error("Experienced progress unavailable"),
    );

    render(<DashboardPage />);

    fireEvent.click(
      await screen.findByRole("button", {
        name: "Submit terminal execution",
      }),
    );

    await screen.findByText("Ce qui a réellement changé");

    const aLittleRadio = screen.getByRole("radio", {
      name: /Un peu/i,
    });

    fireEvent.click(aLittleRadio);

    await waitFor(() => {
      expect(aLittleRadio).toBeChecked();
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Enregistrer mon ressenti",
      }),
    );

    await waitFor(() => {
      expect(apiMocks.recordProgressExperience).toHaveBeenCalledTimes(1);
    });

    expect(
      await screen.findByRole("alert"),
    ).toHaveTextContent("Experienced progress unavailable");

    expect(
      screen.getByText("Tu disposes maintenant d'un signal concret du marché."),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Une incertitude professionnelle a été réduite."),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("radio", {
        name: /Un peu/i,
      }),
    ).toBeChecked();
  });

  it("does not attempt Progress Realization when no trajectory id is available", async () => {
    apiMocks.reconcilePendingTrajectory.mockResolvedValueOnce(null);
    apiMocks.getMyTrajectorySignal
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({});

    render(<DashboardPage />);

    const submit = await screen.findByRole("button", {
      name: "Submit terminal execution",
    });

    fireEvent.click(submit);

    await waitFor(() => {
      expect(apiMocks.reconcilePendingTrajectory).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(apiMocks.getMyTrajectorySignal).toHaveBeenCalledTimes(2);
    });

    expect(apiMocks.createProgressRealization).not.toHaveBeenCalled();
    expect(screen.getByTestId("app-shell")).toBeInTheDocument();
  });
});