// tests/organization-insights-tab-recommendation-completion.test.tsx

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { OrganizationInsightsTab } from "@/app/admin/organizations/components/organization-insights-tab";
import {
  completeAdminWorkerRecommendation,
  getAdminWorkerProfessionalIntentionCompletionWorkspace,
} from "@/lib/api";

vi.mock("@/lib/api", () => ({
  completeAdminWorkerRecommendation: vi.fn(),
  getAdminWorkerProfessionalIntentionCompletionWorkspace: vi.fn(),
  initializeAdminWorkerProfessionalIntention: vi.fn(),
  recordAdminWorkerProfessionalIntentionClarification: vi.fn(),
}));

vi.mock(
  "@/app/admin/organizations/components/organization-worker-guidance-card",
  () => ({
    OrganizationWorkerGuidanceCard: () => (
      <div data-testid="organization-worker-guidance-card" />
    ),
  }),
);

function buildSummary(recommendationStatus = "in_progress") {
  return {
    worker: {
      id: 7,
      display_name: "Worker Test",
      email: "worker@example.com",
      business_id: "WK-00000007",
      current_role: "Business Analyst",
      industry: "Banking",
      language: "fr",
      subscription_pack: "standard",
      subscription_total_paid_eur: 0,
      active_subscription: null,
      profession: "Business Analyst",
      location: "Brussels",
    },
    session_count: 0,
    external_conversation_count: 0,
    recommendation_count: 1,
    artifact_count: 0,
    lever_count: 0,
    career_blueprint: null,
    sessions: [],
    recommendations: [
      {
        id: 31,
        title: "Clarify positioning",
        description: "Clarify the worker's positioning.",
        status: recommendationStatus,
        priority: "medium",
      },
    ],
    artifacts: [],
    levers: [],
  } as any;
}

function renderTab(recommendationStatus = "in_progress") {
  return render(
    <OrganizationInsightsTab
      selectedWorkerSummary={buildSummary(recommendationStatus)}
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

describe("OrganizationInsightsTab recommendation completion", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(
      getAdminWorkerProfessionalIntentionCompletionWorkspace,
    ).mockRejectedValue(new Error("not relevant to this test"));

    vi.mocked(completeAdminWorkerRecommendation).mockResolvedValue({
      completed: true,
    });
  });

  it("allows Admin or Organization to mark a worker recommendation as completed", async () => {
    renderTab("in_progress");

    fireEvent.click(
      screen.getByRole("button", {
        name: /mark.*completed/i,
      }),
    );

    await waitFor(() => {
      expect(completeAdminWorkerRecommendation).toHaveBeenCalledWith(7, 31);
    });
  });

  it("also allows completing an open recommendation", async () => {
    renderTab("open");

    fireEvent.click(
      screen.getByRole("button", {
        name: /mark.*completed/i,
      }),
    );

    await waitFor(() => {
      expect(completeAdminWorkerRecommendation).toHaveBeenCalledWith(7, 31);
    });
  });

  it("removes the completion action after successful completion", async () => {
    renderTab("in_progress");

    const button = screen.getByRole("button", {
      name: /mark.*completed/i,
    });

    fireEvent.click(button);

    await waitFor(() => {
      expect(
        screen.queryByRole("button", {
          name: /mark.*completed/i,
        }),
      ).not.toBeInTheDocument();
    });

    expect(screen.getByText("completed")).toBeInTheDocument();
  });

  it("does not expose the completion action for an already completed recommendation", () => {
    renderTab("completed");

    expect(
      screen.queryByRole("button", {
        name: /mark.*completed/i,
      }),
    ).not.toBeInTheDocument();
  });
});