import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { OrganizationInsightsTab } from "@/app/admin/organizations/components/organization-insights-tab";
import {
  getAdminWorkerProfessionalIntentionCompletionWorkspace,
  initializeAdminWorkerProfessionalIntention,
  recordAdminWorkerProfessionalIntentionClarification,
} from "@/lib/api";

vi.mock("@/lib/api", () => ({
  getAdminWorkerProfessionalIntentionCompletionWorkspace: vi.fn(),
  initializeAdminWorkerProfessionalIntention: vi.fn(),
  recordAdminWorkerProfessionalIntentionClarification: vi.fn(),
}));

vi.mock(
  "@/app/admin/organizations/components/organization-worker-guidance-card",
  () => ({
    OrganizationWorkerGuidanceCard: () => <div>Guidance card</div>,
  }),
);

const workerSummary = {
  worker: {
    id: 7,
    display_name: "Test Worker",
    email: "worker@example.com",
    business_id: "WK-00000007",
    current_role: "Senior Analyst",
    industry: "Technology",
    language: "en",
    subscription_pack: "standard",
    profession: "Analyst",
    location: "Brussels",
    subscription_total_paid_eur: 0,
    active_subscription: null,
  },
  session_count: 0,
  external_conversation_count: 0,
  recommendation_count: 0,
  artifact_count: 0,
  lever_count: 0,
  career_blueprint: {
    identity_text: "Strategic leader",
    vision_text: "Broader strategic influence",
    talent_focus_text: "Leadership",
    career_focus_text: "Transformation",
    inspiration_person: null,
    aspiration_person: null,
  },
  sessions: [],
  recommendations: [],
  artifacts: [],
  levers: [],
} as any;

const openWorkspace = {
  readiness_state: "progress_evaluable",
  completion_closed: false,
  initialization_available: false,
  items: [
    {
      dimension: "target_horizon",
      current_state: "unknown",
      reason: "A valid target horizon is still missing.",
      suggested_question:
        "Within what time horizon does the worker want to reach this professional target?",
      requested_source_actor: "worker",
      resolution_status: "open",
      resolution_condition:
        "A valid target horizon greater than zero is established.",
      evidence: [],
    },
  ],
} as any;

const movementWorkspace = {
  readiness_state: "partially_ready",
  completion_closed: false,
  initialization_available: false,
  items: [
    {
      dimension: "movement_definition",
      current_state: "unknown",
      reason: "The worker's current professional movement is not yet clear.",
      suggested_question:
        "What professional movement is the worker trying to accomplish now?",
      requested_source_actor: "worker",
      resolution_status: "open",
      resolution_condition:
        "A clear professional movement is established.",
      evidence: [],
    },
  ],
} as any;

const targetStateWorkspace = {
  readiness_state: "partially_ready",
  completion_closed: false,
  initialization_available: false,
  items: [
    {
      dimension: "target_state",
      current_state: "unknown",
      reason: "The worker's target professional state is not yet clear.",
      suggested_question:
        "What role, professional identity, scope, or career direction does the worker want to reach?",
      requested_source_actor: "worker",
      resolution_status: "open",
      resolution_condition:
        "A sufficiently specific target role, identity, or direction is established.",
      evidence: [],
    },
  ],
} as any;

const desiredOutcomesWorkspace = {
  readiness_state: "partially_ready",
  completion_closed: false,
  initialization_available: false,
  items: [
    {
      dimension: "desired_outcomes",
      current_state: "unknown",
      reason: "The worker's desired professional outcomes are not yet clear.",
      suggested_question:
        "What professional outcomes would make this movement meaningful for the worker?",
      requested_source_actor: "worker",
      resolution_status: "open",
      resolution_condition:
        "At least one sufficiently clear desired professional outcome is established.",
      evidence: [],
    },
  ],
} as any;

const progressMarkersWorkspace = {
  readiness_state: "partially_ready",
  completion_closed: false,
  initialization_available: false,
  items: [
    {
      dimension: "progress_markers",
      current_state: "unknown",
      reason: "The worker's concrete progress markers are not yet clear.",
      suggested_question:
        "What concrete result, milestone, or change would show that the worker is making progress?",
      requested_source_actor: "worker",
      resolution_status: "open",
      resolution_condition:
        "At least one concrete progress marker is established.",
      evidence: [],
    },
  ],
} as any;

const closedWorkspace = {
  readiness_state: "plan_ready",
  completion_closed: true,
  initialization_available: false,
  items: [],
} as any;

function renderComponent() {
  return render(
    <OrganizationInsightsTab
      selectedWorkerSummary={workerSummary}
      workerSummaryLoading={false}
      organizationGuidance={null}
      organizationGuidanceLoading={false}
      leverSearch=""
      leverCategoryFilter="all"
      leverSortMode="highlighted"
      leverCategories={[]}
      filteredLevers={[]}
      relatedLeversByRecommendationId={new Map()}
      onLeverSearchChange={vi.fn()}
      onLeverCategoryFilterChange={vi.fn()}
      onLeverSortModeChange={vi.fn()}
      onScrollToRecommendation={vi.fn()}
    />,
  );
}

describe("OrganizationInsightsTab Professional Intention clarification", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(initializeAdminWorkerProfessionalIntention).mockResolvedValue({
      initialized: true,
    });

    vi.mocked(
      recordAdminWorkerProfessionalIntentionClarification,
    ).mockResolvedValue({
      recorded: true,
    });
  });

  it("records a worker target horizon answer and reloads the completion workspace", async () => {
    vi.mocked(
      getAdminWorkerProfessionalIntentionCompletionWorkspace,
    )
      .mockResolvedValueOnce(openWorkspace)
      .mockResolvedValueOnce(closedWorkspace);

    renderComponent();

    expect(
      await screen.findByText("Target Horizon"),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Within what time horizon does the worker want to reach this professional target?",
      ),
    ).toBeInTheDocument();

    fireEvent.change(
      screen.getByLabelText("Worker answer"),
      {
        target: {
          value: "I want to achieve this within the next 12 months.",
        },
      },
    );

    fireEvent.change(
      screen.getByLabelText("Target horizon in months"),
      {
        target: {
          value: "12",
        },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Record worker answer",
      }),
    );

    await waitFor(() => {
      expect(
        recordAdminWorkerProfessionalIntentionClarification,
      ).toHaveBeenCalledWith(
        7,
        {
          dimension: "target_horizon",
          answer_text:
            "I want to achieve this within the next 12 months.",
          target_horizon_months: 12,
        },
      );
    });

    await waitFor(() => {
      expect(
        getAdminWorkerProfessionalIntentionCompletionWorkspace,
      ).toHaveBeenCalledTimes(2);
    });

    expect(
      await screen.findByText(
        "Professional Intention clarification is complete. No further clarification is currently required.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", {
        name: "Record worker answer",
      }),
    ).not.toBeInTheDocument();
  });

  it("records a worker movement definition answer and reloads the completion workspace", async () => {
    vi.mocked(
      getAdminWorkerProfessionalIntentionCompletionWorkspace,
    )
      .mockResolvedValueOnce(movementWorkspace)
      .mockResolvedValueOnce(closedWorkspace);

    renderComponent();

    expect(
      await screen.findByText("Movement Definition"),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "What professional movement is the worker trying to accomplish now?",
      ),
    ).toBeInTheDocument();

    fireEvent.change(
      screen.getByLabelText("Worker answer"),
      {
        target: {
          value:
            "Je veux passer d'un rôle principalement opérationnel à un rôle de Business Architect.",
        },
      },
    );

    fireEvent.change(
      screen.getByLabelText("Movement summary"),
      {
        target: {
          value:
            "Passer d'un rôle principalement opérationnel à un rôle de Business Architect.",
        },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Record worker answer",
      }),
    );

    await waitFor(() => {
      expect(
        recordAdminWorkerProfessionalIntentionClarification,
      ).toHaveBeenCalledWith(
        7,
        {
          dimension: "movement_definition",
          answer_text:
            "Je veux passer d'un rôle principalement opérationnel à un rôle de Business Architect.",
          movement_summary:
            "Passer d'un rôle principalement opérationnel à un rôle de Business Architect.",
        },
      );
    });

    await waitFor(() => {
      expect(
        getAdminWorkerProfessionalIntentionCompletionWorkspace,
      ).toHaveBeenCalledTimes(2);
    });

    expect(
      await screen.findByText(
        "Professional Intention clarification is complete. No further clarification is currently required.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", {
        name: "Record worker answer",
      }),
    ).not.toBeInTheDocument();
  });

  it("records a worker target state answer and reloads the completion workspace", async () => {
    vi.mocked(
      getAdminWorkerProfessionalIntentionCompletionWorkspace,
    )
      .mockResolvedValueOnce(targetStateWorkspace)
      .mockResolvedValueOnce(closedWorkspace);

    renderComponent();

    expect(
      await screen.findByText("Target State"),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "What role, professional identity, scope, or career direction does the worker want to reach?",
      ),
    ).toBeInTheDocument();

    fireEvent.change(
      screen.getByLabelText("Worker answer"),
      {
        target: {
          value:
            "Je veux devenir Business Architect avec un rôle plus stratégique et transverse.",
        },
      },
    );

    fireEvent.change(
      screen.getByLabelText("Target identity"),
      {
        target: {
          value:
            "Business Architect avec un rôle stratégique et transverse.",
        },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Record worker answer",
      }),
    );

    await waitFor(() => {
      expect(
        recordAdminWorkerProfessionalIntentionClarification,
      ).toHaveBeenCalledWith(
        7,
        {
          dimension: "target_state",
          answer_text:
            "Je veux devenir Business Architect avec un rôle plus stratégique et transverse.",
          target_identity:
            "Business Architect avec un rôle stratégique et transverse.",
        },
      );
    });

    await waitFor(() => {
      expect(
        getAdminWorkerProfessionalIntentionCompletionWorkspace,
      ).toHaveBeenCalledTimes(2);
    });

    expect(
      await screen.findByText(
        "Professional Intention clarification is complete. No further clarification is currently required.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", {
        name: "Record worker answer",
      }),
    ).not.toBeInTheDocument();
  });

  it("records a worker desired outcomes answer and reloads the completion workspace", async () => {
    vi.mocked(
      getAdminWorkerProfessionalIntentionCompletionWorkspace,
    )
      .mockResolvedValueOnce(desiredOutcomesWorkspace)
      .mockResolvedValueOnce(closedWorkspace);

    renderComponent();

    expect(
      await screen.findByText("Desired Outcomes"),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "What professional outcomes would make this movement meaningful for the worker?",
      ),
    ).toBeInTheDocument();

    fireEvent.change(
      screen.getByLabelText("Worker answer"),
      {
        target: {
          value:
            "Je veux avoir davantage d'impact sur les décisions stratégiques et sur la transformation de l'organisation.",
        },
      },
    );

    fireEvent.change(
      screen.getByLabelText("Desired impact"),
      {
        target: {
          value:
            "Influencer les décisions stratégiques et contribuer directement à la transformation de l'organisation.",
        },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Record worker answer",
      }),
    );

    await waitFor(() => {
      expect(
        recordAdminWorkerProfessionalIntentionClarification,
      ).toHaveBeenCalledWith(
        7,
        {
          dimension: "desired_outcomes",
          answer_text:
            "Je veux avoir davantage d'impact sur les décisions stratégiques et sur la transformation de l'organisation.",
          desired_impact: [
            "Influencer les décisions stratégiques et contribuer directement à la transformation de l'organisation.",
          ],
        },
      );
    });

    await waitFor(() => {
      expect(
        getAdminWorkerProfessionalIntentionCompletionWorkspace,
      ).toHaveBeenCalledTimes(2);
    });

    expect(
      await screen.findByText(
        "Professional Intention clarification is complete. No further clarification is currently required.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", {
        name: "Record worker answer",
      }),
    ).not.toBeInTheDocument();
  });

  it("records a worker progress markers answer and reloads the completion workspace", async () => {
    vi.mocked(
      getAdminWorkerProfessionalIntentionCompletionWorkspace,
    )
      .mockResolvedValueOnce(progressMarkersWorkspace)
      .mockResolvedValueOnce(closedWorkspace);

    renderComponent();

    expect(
      await screen.findByText("Progress Markers"),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "What concrete result, milestone, or change would show that the worker is making progress?",
      ),
    ).toBeInTheDocument();

    fireEvent.change(
      screen.getByLabelText("Worker answer"),
      {
        target: {
          value:
            "Je saurai que j'avance si j'obtiens des échanges qualifiés pour des rôles de Business Architect.",
        },
      },
    );

    fireEvent.change(
      screen.getByLabelText("Short-term mission"),
      {
        target: {
          value:
            "Obtenir des échanges qualifiés pour des rôles de Business Architect.",
        },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Record worker answer",
      }),
    );

    await waitFor(() => {
      expect(
        recordAdminWorkerProfessionalIntentionClarification,
      ).toHaveBeenCalledWith(
        7,
        {
          dimension: "progress_markers",
          answer_text:
            "Je saurai que j'avance si j'obtiens des échanges qualifiés pour des rôles de Business Architect.",
          short_term_missions: [
            "Obtenir des échanges qualifiés pour des rôles de Business Architect.",
          ],
        },
      );
    });

    await waitFor(() => {
      expect(
        getAdminWorkerProfessionalIntentionCompletionWorkspace,
      ).toHaveBeenCalledTimes(2);
    });

    expect(
      await screen.findByText(
        "Professional Intention clarification is complete. No further clarification is currently required.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", {
        name: "Record worker answer",
      }),
    ).not.toBeInTheDocument();
  });
});
