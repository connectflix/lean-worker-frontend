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

  it("does not expose the clarification form for non-target-horizon blockers", async () => {
    vi.mocked(
      getAdminWorkerProfessionalIntentionCompletionWorkspace,
    ).mockResolvedValue({
      ...openWorkspace,
      items: [
        {
          ...openWorkspace.items[0],
          dimension: "target_state",
          suggested_question:
            "What role, professional identity, scope, or career direction does the worker want to reach?",
        },
      ],
    });

    renderComponent();

    expect(
      await screen.findByText("Target State"),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", {
        name: "Record worker answer",
      }),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByLabelText("Worker answer"),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByLabelText("Target horizon in months"),
    ).not.toBeInTheDocument();
  });
});