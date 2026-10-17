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
  it("moves worker recommendations out of Overview and into Decision", () => {
    renderTab("in_progress");

    const overview = screen.getByRole("tab", {
      name: "Overview",
    });

    const decision = screen.getByRole("tab", {
      name: "Decision",
    });

    expect(overview).toHaveAttribute("aria-selected", "true");
    expect(decision).toHaveAttribute("aria-selected", "false");

    expect(
      screen.queryByText("Clarify positioning"),
    ).not.toBeInTheDocument();

    fireEvent.click(decision);

    expect(overview).toHaveAttribute("aria-selected", "false");
    expect(decision).toHaveAttribute("aria-selected", "true");

    expect(
      screen.getByText("Clarify positioning"),
    ).toBeInTheDocument();
  });

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(
      getAdminWorkerProfessionalIntentionCompletionWorkspace,
    ).mockRejectedValue(new Error("not relevant to this test"));

    vi.mocked(completeAdminWorkerRecommendation).mockResolvedValue({
      completed: true,
    });
  });

  it("opens Decision before scrolling from a linked lever to its recommendation", async () => {
    const onScrollToRecommendation = vi.fn();

    const lever = {
      id: 41,
      name: "Decision support lever",
      description: "Supports the worker recommendation.",
      category: "development",
      provider_type: "internal",
      is_paid: false,
      is_active: true,
      is_highlighted: false,
      is_default: false,
      usage_count: 1,
      match_reasons: [],
      recommendation_ids: [31],
      url: null,
    } as any;

    const summary = buildSummary("in_progress");
    summary.levers = [lever];
    summary.lever_count = 1;

    render(
      <OrganizationInsightsTab
        selectedWorkerSummary={summary}
        workerSummaryLoading={false}
        organizationGuidance={null}
        organizationGuidanceLoading={false}
        leverSearch=""
        leverCategoryFilter="all"
        leverSortMode="highlighted"
        leverCategories={["development"]}
        filteredLevers={[lever]}
        relatedLeversByRecommendationId={new Map()}
        onLeverSearchChange={vi.fn()}
        onLeverCategoryFilterChange={vi.fn()}
        onLeverSortModeChange={vi.fn()}
        onScrollToRecommendation={onScrollToRecommendation}
      />,
    );

    const overview = screen.getByRole("tab", {
      name: "Overview",
    });

    const decision = screen.getByRole("tab", {
      name: "Decision",
    });

    expect(overview).toHaveAttribute("aria-selected", "true");
    expect(decision).toHaveAttribute("aria-selected", "false");

    fireEvent.click(
      screen.getByRole("button", {
        name: /^Recommendation #31$/,
      }),
    );

    await waitFor(() => {
      expect(decision).toHaveAttribute("aria-selected", "true");
    });

    expect(overview).toHaveAttribute("aria-selected", "false");

    await waitFor(() => {
      expect(onScrollToRecommendation).toHaveBeenCalledWith(31);
    });
  });

  it("allows Admin or Organization to mark a worker recommendation as completed", async () => {
    renderTab("in_progress");

    fireEvent.click(
      screen.getByRole("tab", {
        name: "Decision",
      }),
    );

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
      screen.getByRole("tab", {
        name: "Decision",
      }),
    );

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

    fireEvent.click(
      screen.getByRole("tab", {
        name: "Decision",
      }),
    );

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

    fireEvent.click(
      screen.getByRole("tab", {
        name: "Decision",
      }),
    );

    expect(
      screen.queryByRole("button", {
        name: /mark.*completed/i,
      }),
    ).not.toBeInTheDocument();
  });
});