import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { OrganizationInsightsTab } from "@/app/admin/organizations/components/organization-insights-tab";
import {
  getAdminWorkerProfessionalIntentionCompletionWorkspace,
  getAdminWorkerProfessionalMandateSupport,
  initializeAdminWorkerProfessionalIntention,
  recordAdminWorkerProfessionalIntentionClarification,
  recordAdminWorkerProfessionalMandateClarification,
} from "@/lib/api";

vi.mock("@/lib/api", () => ({
  getAdminWorkerProfessionalIntentionCompletionWorkspace: vi.fn(),
  getAdminWorkerProfessionalMandateSupport: vi.fn(),
  initializeAdminWorkerProfessionalIntention: vi.fn(),
  recordAdminWorkerProfessionalIntentionClarification: vi.fn(),
  recordAdminWorkerProfessionalMandateClarification: vi.fn(),
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

const closedIntentionWorkspace = {
  readiness_state: "plan_ready",
  completion_closed: true,
  initialization_available: false,
  items: [],
} as any;

const closedMandateSupport = {
  mandate: {
    mandate_summary: "Durable professional decision frame",
    professional_identity: "Enterprise architect",
    expected_outcomes: ["Lead enterprise transformation"],
    success_definition: ["Own strategic decisions"],
    meaning_drivers: ["Build durable capability"],
    engagement_drivers: ["Complex transformation work"],
    contribution_drivers: ["Improve organizational effectiveness"],
    hard_constraints: ["No relocation"],
    soft_constraints: [],
    time_capacity: ["Six hours per week"],
    energy_constraints: ["Protect recovery time"],
    risks_to_avoid: [],
    non_negotiables: ["Strategic decision scope"],
  },
  readiness: {
    readiness_state: "decision_ready",
    dimensions: [],
    blocking_dimensions: [],
    decision_ready: true,
  },
  completion_guidance: {
    readiness_state: "decision_ready",
    guidance: [],
  },
} as any;

function mandateSupport(
  dimension:
    | "professional_identity"
    | "expected_outcomes"
    | "success_definition"
    | "meaning_and_contribution"
    | "constraints_and_non_negotiables"
    | "capacity_and_sustainability",
  prompt: string,
) {
  return {
    mandate: null,
    readiness: {
      readiness_state: "partially_grounded",
      dimensions: [
        {
          dimension,
          state: "unknown",
          reason: `The ${dimension.replaceAll("_", " ")} is still missing.`,
        },
      ],
      blocking_dimensions: [dimension],
      decision_ready: false,
    },
    completion_guidance: {
      readiness_state: "partially_grounded",
      guidance: [
        {
          dimension,
          state: "unknown",
          recommended_actor: "organization",
          intervention_type: "question",
          prompt,
          purpose: "Capture worker-owned mandate truth.",
          source_scope: ["worker"],
          completion_priority: "now",
        },
      ],
    },
  } as any;
}

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

describe("OrganizationInsightsTab Professional Mandate clarification", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(
      getAdminWorkerProfessionalIntentionCompletionWorkspace,
    ).mockResolvedValue(closedIntentionWorkspace);

    vi.mocked(initializeAdminWorkerProfessionalIntention).mockResolvedValue({
      initialized: true,
    });

    vi.mocked(
      recordAdminWorkerProfessionalIntentionClarification,
    ).mockResolvedValue({
      recorded: true,
    });

    vi.mocked(
      recordAdminWorkerProfessionalMandateClarification,
    ).mockResolvedValue({
      recorded: true,
    });
  });

  it("records a worker professional identity clarification and reloads Mandate support", async () => {
    vi.mocked(getAdminWorkerProfessionalMandateSupport)
      .mockResolvedValueOnce(
        mandateSupport(
          "professional_identity",
          "How does the worker describe the professional identity they want this mandate to protect or enable?",
        ),
      )
      .mockResolvedValueOnce(closedMandateSupport);

    renderComponent();

    expect(
      await screen.findByText("Professional Identity"),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "How does the worker describe the professional identity they want this mandate to protect or enable?",
      ),
    ).toBeInTheDocument();

    fireEvent.change(
      screen.getByLabelText("Mandate worker answer"),
      {
        target: {
          value: "I see myself as an enterprise architect.",
        },
      },
    );

    fireEvent.change(
      screen.getByLabelText("Professional identity"),
      {
        target: {
          value: "Enterprise architect",
        },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Record mandate worker answer",
      }),
    );

    await waitFor(() => {
      expect(
        recordAdminWorkerProfessionalMandateClarification,
      ).toHaveBeenCalledWith(
        7,
        {
          dimension: "professional_identity",
          answer_text: "I see myself as an enterprise architect.",
          professional_identity: "Enterprise architect",
        },
      );
    });

    await waitFor(() => {
      expect(getAdminWorkerProfessionalMandateSupport).toHaveBeenCalledTimes(2);
    });

    expect(
      await screen.findByText(
        "Professional Mandate clarification is complete. No further clarification is currently required.",
      ),
    ).toBeInTheDocument();
  });

  it("records expected outcomes clarification and reloads Mandate support", async () => {
    vi.mocked(getAdminWorkerProfessionalMandateSupport)
      .mockResolvedValueOnce(
        mandateSupport(
          "expected_outcomes",
          "What durable professional outcomes matter most to the worker?",
        ),
      )
      .mockResolvedValueOnce(closedMandateSupport);

    renderComponent();

    expect(await screen.findByText("Expected Outcomes")).toBeInTheDocument();

    fireEvent.change(
      screen.getByLabelText("Mandate worker answer"),
      {
        target: {
          value:
            "I want to lead enterprise transformation and own strategic architecture decisions.",
        },
      },
    );

    fireEvent.change(
      screen.getByLabelText("Expected outcome"),
      {
        target: {
          value: "Lead enterprise transformation",
        },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Record mandate worker answer",
      }),
    );

    await waitFor(() => {
      expect(
        recordAdminWorkerProfessionalMandateClarification,
      ).toHaveBeenCalledWith(
        7,
        {
          dimension: "expected_outcomes",
          answer_text:
            "I want to lead enterprise transformation and own strategic architecture decisions.",
          expected_outcomes: ["Lead enterprise transformation"],
        },
      );
    });

    await waitFor(() => {
      expect(getAdminWorkerProfessionalMandateSupport).toHaveBeenCalledTimes(2);
    });
  });

  it("records success definition clarification and reloads Mandate support", async () => {
    vi.mocked(getAdminWorkerProfessionalMandateSupport)
      .mockResolvedValueOnce(
        mandateSupport(
          "success_definition",
          "How will the worker recognize professional success?",
        ),
      )
      .mockResolvedValueOnce(closedMandateSupport);

    renderComponent();

    expect(await screen.findByText("Success Definition")).toBeInTheDocument();

    fireEvent.change(
      screen.getByLabelText("Mandate worker answer"),
      {
        target: {
          value: "Success means owning strategic decisions.",
        },
      },
    );

    fireEvent.change(
      screen.getByLabelText("Success definition"),
      {
        target: {
          value: "Own strategic decisions",
        },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Record mandate worker answer",
      }),
    );

    await waitFor(() => {
      expect(
        recordAdminWorkerProfessionalMandateClarification,
      ).toHaveBeenCalledWith(
        7,
        {
          dimension: "success_definition",
          answer_text: "Success means owning strategic decisions.",
          success_definition: ["Own strategic decisions"],
        },
      );
    });

    await waitFor(() => {
      expect(getAdminWorkerProfessionalMandateSupport).toHaveBeenCalledTimes(2);
    });
  });

  it("records meaning and contribution clarification and reloads Mandate support", async () => {
    vi.mocked(getAdminWorkerProfessionalMandateSupport)
      .mockResolvedValueOnce(
        mandateSupport(
          "meaning_and_contribution",
          "What makes this professional direction meaningful, engaging, and worth contributing to?",
        ),
      )
      .mockResolvedValueOnce(closedMandateSupport);

    renderComponent();

    expect(
      await screen.findByText("Meaning And Contribution"),
    ).toBeInTheDocument();

    fireEvent.change(
      screen.getByLabelText("Mandate worker answer"),
      {
        target: {
          value:
            "Meaningful transformation work keeps me engaged and lets me build durable capability.",
        },
      },
    );

    fireEvent.change(
      screen.getByLabelText("Meaning driver"),
      {
        target: {
          value: "Build durable capability",
        },
      },
    );

    fireEvent.change(
      screen.getByLabelText("Engagement driver"),
      {
        target: {
          value: "Complex transformation work",
        },
      },
    );

    fireEvent.change(
      screen.getByLabelText("Contribution driver"),
      {
        target: {
          value: "Improve organizational effectiveness",
        },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Record mandate worker answer",
      }),
    );

    await waitFor(() => {
      expect(
        recordAdminWorkerProfessionalMandateClarification,
      ).toHaveBeenCalledWith(
        7,
        {
          dimension: "meaning_and_contribution",
          answer_text:
            "Meaningful transformation work keeps me engaged and lets me build durable capability.",
          meaning_drivers: ["Build durable capability"],
          engagement_drivers: ["Complex transformation work"],
          contribution_drivers: ["Improve organizational effectiveness"],
        },
      );
    });

    await waitFor(() => {
      expect(getAdminWorkerProfessionalMandateSupport).toHaveBeenCalledTimes(2);
    });
  });

  it("records constraints and non-negotiables clarification and reloads Mandate support", async () => {
    vi.mocked(getAdminWorkerProfessionalMandateSupport)
      .mockResolvedValueOnce(
        mandateSupport(
          "constraints_and_non_negotiables",
          "What constraints, risks, and non-negotiables must this professional mandate respect?",
        ),
      )
      .mockResolvedValueOnce(closedMandateSupport);

    renderComponent();

    expect(
      await screen.findByText("Constraints And Non Negotiables"),
    ).toBeInTheDocument();

    fireEvent.change(
      screen.getByLabelText("Mandate worker answer"),
      {
        target: {
          value:
            "Strategic decision scope is non-negotiable and I want to avoid relocation.",
        },
      },
    );

    fireEvent.change(
      screen.getByLabelText("Hard constraint"),
      {
        target: {
          value: "No relocation",
        },
      },
    );

    fireEvent.change(
      screen.getByLabelText("Non-negotiable"),
      {
        target: {
          value: "Strategic decision scope",
        },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Record mandate worker answer",
      }),
    );

    await waitFor(() => {
      expect(
        recordAdminWorkerProfessionalMandateClarification,
      ).toHaveBeenCalledWith(
        7,
        {
          dimension: "constraints_and_non_negotiables",
          answer_text:
            "Strategic decision scope is non-negotiable and I want to avoid relocation.",
          hard_constraints: ["No relocation"],
          non_negotiables: ["Strategic decision scope"],
        },
      );
    });

    await waitFor(() => {
      expect(getAdminWorkerProfessionalMandateSupport).toHaveBeenCalledTimes(2);
    });
  });

  it("records capacity and sustainability clarification and reloads Mandate support", async () => {
    vi.mocked(getAdminWorkerProfessionalMandateSupport)
      .mockResolvedValueOnce(
        mandateSupport(
          "capacity_and_sustainability",
          "What time capacity and energy constraints must be respected so that this professional mandate remains sustainable?",
        ),
      )
      .mockResolvedValueOnce(closedMandateSupport);

    renderComponent();

    expect(
      await screen.findByText("Capacity And Sustainability"),
    ).toBeInTheDocument();

    fireEvent.change(
      screen.getByLabelText("Mandate worker answer"),
      {
        target: {
          value:
            "I can dedicate six hours per week and need to protect recovery time.",
        },
      },
    );

    fireEvent.change(
      screen.getByLabelText("Time capacity"),
      {
        target: {
          value: "Six hours per week",
        },
      },
    );

    fireEvent.change(
      screen.getByLabelText("Energy constraint"),
      {
        target: {
          value: "Protect recovery time",
        },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Record mandate worker answer",
      }),
    );

    await waitFor(() => {
      expect(
        recordAdminWorkerProfessionalMandateClarification,
      ).toHaveBeenCalledWith(
        7,
        {
          dimension: "capacity_and_sustainability",
          answer_text:
            "I can dedicate six hours per week and need to protect recovery time.",
          time_capacity: ["Six hours per week"],
          energy_constraints: ["Protect recovery time"],
        },
      );
    });

    await waitFor(() => {
      expect(getAdminWorkerProfessionalMandateSupport).toHaveBeenCalledTimes(2);
    });
  });
});